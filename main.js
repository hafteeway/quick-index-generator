const { MarkdownView, Notice, Plugin, TFile } = require("obsidian");

const OLD_INDEX_START = "<!-- QUICK_INDEX_START -->";
const OLD_INDEX_END = "<!-- QUICK_INDEX_END -->";
const SENSITIVE_PREFIXES = ["30-生活/个人资料与凭据"];
const SKIPPED_SEGMENTS = new Set([".obsidian", "attachments"]);
const DEFAULT_DATA = {
  targetPath: "",
  lastIndexMarkdown: ""
};

module.exports = class QuickIndexGeneratorPlugin extends Plugin {
  async onload() {
    this.data = Object.assign({}, DEFAULT_DATA, await this.loadData());
    this.createDebouncedAutoUpdate();

    this.addCommand({
      id: "generate-or-update-current-note-index",
      name: "Generate/Update Current Note Index / 生成/更新当前笔记索引",
      callback: () => this.generateIndexInCurrentNote()
    });

    this.addRibbonIcon("list-tree", "Generate/Update Current Note Index / 生成/更新当前笔记索引", () => {
      this.generateIndexInCurrentNote();
    });

    this.registerEvent(
      this.app.vault.on("create", (file) => {
        if (file instanceof TFile && file.extension === "md") {
          this.scheduleAutoUpdate();
        }
      })
    );
  }

  onunload() {
    if (this.autoUpdateTimer) {
      window.clearTimeout(this.autoUpdateTimer);
    }
  }

  createDebouncedAutoUpdate() {
    this.autoUpdateTimer = null;
  }

  scheduleAutoUpdate() {
    if (!this.data.targetPath || !this.data.lastIndexMarkdown) {
      return;
    }

    if (this.autoUpdateTimer) {
      window.clearTimeout(this.autoUpdateTimer);
    }

    this.autoUpdateTimer = window.setTimeout(() => {
      this.updateStoredIndexLocation(false);
    }, 800);
  }

  async generateIndexInCurrentNote() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    const file = view && view.file;

    if (!view || !file || file.extension !== "md") {
      new Notice("请先打开一篇 Markdown 笔记。");
      return;
    }

    try {
      const indexMarkdown = this.buildIndexMarkdown(file.path);
      const original = await this.app.vault.read(file);
      const updated = this.applyIndexToContent(original, indexMarkdown, view);

      await this.app.vault.modify(file, updated);
      await this.saveIndexState(file.path, indexMarkdown);
      new Notice("索引已更新。");
    } catch (error) {
      console.error("Quick Index Generator failed:", error);
      new Notice("索引生成失败，请检查当前文件状态。");
    }
  }

  async updateStoredIndexLocation(showNotice) {
    try {
      const targetPath = this.data.targetPath;
      const targetFile = this.app.vault.getAbstractFileByPath(targetPath);

      if (!(targetFile instanceof TFile) || targetFile.extension !== "md") {
        return;
      }

      const indexMarkdown = this.buildIndexMarkdown(targetFile.path);
      const original = await this.app.vault.read(targetFile);
      const updated = this.isGeneratedIndexOnlyContent(original)
        ? `${indexMarkdown}\n`
        : this.replacePreviousIndex(original, indexMarkdown) || this.appendIndex(original, indexMarkdown);

      if (updated === original && indexMarkdown === this.data.lastIndexMarkdown) {
        return;
      }

      await this.app.vault.modify(targetFile, updated);
      await this.saveIndexState(targetFile.path, indexMarkdown);

      if (showNotice) {
        new Notice("索引已更新。");
      }
    } catch (error) {
      console.error("Quick Index Generator auto update failed:", error);
      if (showNotice) {
        new Notice("索引生成失败，请检查当前文件状态。");
      }
    }
  }

  async saveIndexState(targetPath, indexMarkdown) {
    this.data.targetPath = targetPath;
    this.data.lastIndexMarkdown = indexMarkdown;
    await this.saveData(this.data);
  }

  buildIndexMarkdown(currentPath) {
    const files = this.app.vault
      .getMarkdownFiles()
      .filter((file) => this.shouldIncludeFile(file))
      .sort((a, b) => this.compareText(a.path, b.path));

    const basenameCounts = files.reduce((counts, file) => {
      counts.set(file.basename, (counts.get(file.basename) || 0) + 1);
      return counts;
    }, new Map());

    const tree = this.buildFolderTree(files);
    const lines = [];
    this.renderFolderTree(tree, lines, basenameCounts, currentPath, 1);
    return lines.join("\n").trimEnd();
  }

  buildFolderTree(files) {
    const root = { folders: new Map(), files: [] };

    files.forEach((file) => {
      const parts = file.path.split("/");
      const fileName = parts.pop();
      let node = root;

      parts.forEach((folderName) => {
        if (!node.folders.has(folderName)) {
          node.folders.set(folderName, { folders: new Map(), files: [] });
        }
        node = node.folders.get(folderName);
      });

      node.files.push(Object.assign({ fileName }, file));
    });

    return root;
  }

  renderFolderTree(node, lines, basenameCounts, currentPath, depth) {
    const folders = Array.from(node.folders.entries()).sort(([a], [b]) => this.compareText(a, b));
    const files = node.files.sort((a, b) => this.compareText(a.basename, b.basename));

    files.forEach((file) => {
      const marker = file.path === currentPath ? "（当前笔记）" : "";
      lines.push(`- ${this.createWikiLink(file, basenameCounts)}${marker}`);
    });

    folders.forEach(([folderName, childNode]) => {
      if (lines.length > 0) {
        lines.push("");
      }

      lines.push(`${"#".repeat(Math.min(depth, 6))} ${folderName}`);
      this.renderFolderTree(childNode, lines, basenameCounts, currentPath, depth + 1);
    });
  }

  shouldIncludeFile(file) {
    if (!file || file.extension !== "md") {
      return false;
    }

    if (SENSITIVE_PREFIXES.some((prefix) => file.path.startsWith(`${prefix}/`))) {
      return false;
    }

    return !file.path
      .split("/")
      .some((segment) => SKIPPED_SEGMENTS.has(segment));
  }

  createWikiLink(file, basenameCounts) {
    const path = file.path.replace(/\.md$/, "");
    return `[[${path}|${file.basename}]]`;
  }

  applyIndexToContent(original, indexMarkdown, view) {
    const oldMarkerReplacement = this.replaceOldMarkerIndex(original, indexMarkdown);
    if (oldMarkerReplacement !== null) {
      return oldMarkerReplacement;
    }

    if (this.isGeneratedIndexOnlyContent(original)) {
      return `${indexMarkdown}\n`;
    }

    const previousReplacement = this.replacePreviousIndex(original, indexMarkdown);
    if (previousReplacement !== null) {
      return previousReplacement;
    }

    const insertOffset = this.getCursorOffset(view, original);
    if (insertOffset === null) {
      return this.appendIndex(original, indexMarkdown);
    }

    const before = original.slice(0, insertOffset);
    const after = original.slice(insertOffset);
    const prefix = before && !before.endsWith("\n") ? "\n\n" : "";
    const suffix = after && !after.startsWith("\n") ? "\n\n" : "";

    return `${before}${prefix}${indexMarkdown}${suffix}${after}`;
  }

  replacePreviousIndex(original, indexMarkdown) {
    if (!this.data.lastIndexMarkdown) {
      return null;
    }

    const previousIndex = original.lastIndexOf(this.data.lastIndexMarkdown);
    if (previousIndex === -1) {
      return null;
    }

    const before = original.slice(0, previousIndex);
    const after = original.slice(previousIndex + this.data.lastIndexMarkdown.length);
    return `${before}${indexMarkdown}${after}`;
  }

  isGeneratedIndexOnlyContent(content) {
    const meaningfulLines = content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (meaningfulLines.length === 0) {
      return false;
    }

    return meaningfulLines.every((line) => {
      return /^#{1,6}\s+\S/.test(line) || /^-\s+\[\[.+\]\](（当前笔记）)?$/.test(line);
    });
  }

  appendIndex(original, indexMarkdown) {
    return original.trimEnd() ? `${original.trimEnd()}\n\n${indexMarkdown}\n` : `${indexMarkdown}\n`;
  }

  replaceOldMarkerIndex(original, indexMarkdown) {
    const startIndex = original.indexOf(OLD_INDEX_START);
    const endIndex = original.indexOf(OLD_INDEX_END);

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      return null;
    }

    const before = original.slice(0, startIndex).replace(/\s*$/, "");
    const after = original.slice(endIndex + OLD_INDEX_END.length).replace(/^\s*/, "");
    return [before, indexMarkdown, after].filter(Boolean).join("\n\n");
  }

  getCursorOffset(view, content) {
    const editor = view && view.editor;
    if (!editor || typeof editor.getCursor !== "function" || typeof editor.posToOffset !== "function") {
      return null;
    }

    const offset = editor.posToOffset(editor.getCursor());
    return Number.isInteger(offset) && offset >= 0 && offset <= content.length ? offset : null;
  }

  compareText(a, b) {
    return a.localeCompare(b, "zh-Hans-CN", {
      numeric: true,
      sensitivity: "base"
    });
  }
};
