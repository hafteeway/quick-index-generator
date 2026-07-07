# Quick Index Generator

Quick Index Generator is a small Obsidian plugin that generates a Markdown index for the current vault and keeps it updated when new notes are created.

## Features

- Generate an index in the currently opened Markdown note.
- Render the index as a folder hierarchy using Markdown headings.
- Replace the previously generated index instead of duplicating it.
- Automatically update the previous index location after new Markdown notes are created.
- Skip attachment folders and sensitive notes under `30-生活/个人资料与凭据` by default.
- Use Obsidian wiki links, with path aliases for duplicate note names.

## Installation

### Install from a release

1. Open the latest release on GitHub.
2. Download `quick-index-generator-<version>.zip` from the release assets.
3. Unzip the file. You should get a folder named `quick-index-generator`.
4. Drag the `quick-index-generator` folder into your Obsidian vault:

   ```text
   <your-vault>/.obsidian/plugins/quick-index-generator
   ```

5. Restart Obsidian.
6. Open `Settings -> Community plugins`.
7. Enable `Quick Index Generator`.

## Usage

1. Open the note where you want the index to appear.
2. Run the command `Generate/Update Current Note Index / 生成/更新当前笔记索引` from the command palette.
3. The plugin inserts the index at the cursor position on first run.
4. Later runs replace the previous index content.
5. When a new Markdown note is created, the plugin updates the last index location automatically.

## Acknowledgements

This plugin was developed with assistance from OpenAI Codex.

## License

MIT

---

# Quick Index Generator 中文说明

Quick Index Generator 是一个轻量级 Obsidian 插件，用来为当前 vault 自动生成 Markdown 索引，并在新建笔记后自动更新上次生成索引的位置。

## 功能

- 在当前打开的 Markdown 笔记中生成索引。
- 按原有文件夹层级，用 Markdown 标题展示目录结构。
- 替换上一次生成的索引，避免重复堆叠。
- 新建 Markdown 笔记后，自动更新上一次生成索引的位置。
- 默认跳过附件文件夹，以及 `30-生活/个人资料与凭据` 下的敏感笔记。
- 使用 Obsidian 双链；如果存在重名笔记，会使用带路径的别名链接。

## 安装

### 从 Release 安装

1. 打开 GitHub 上的最新 release。
2. 在 release assets 里下载 `quick-index-generator-<version>.zip`。
3. 解压这个文件，你应该会得到一个名为 `quick-index-generator` 的文件夹。
4. 将 `quick-index-generator` 文件夹拖放到你的 Obsidian vault：

   ```text
   <你的vault>/.obsidian/plugins/quick-index-generator
   ```

5. 重启 Obsidian。
6. 打开 `设置 -> 第三方插件/社区插件`。
7. 启用 `Quick Index Generator`。

## 使用方法

1. 打开你想放置索引的笔记。
2. 在命令面板中运行 `Generate/Update Current Note Index / 生成/更新当前笔记索引`。
3. 第一次运行时，插件会在当前光标位置插入索引。
4. 之后再次运行，会替换上一次生成的索引内容。
5. 当你新建 Markdown 笔记后，插件会自动更新上次生成索引的位置。

## 致谢

这个插件在 OpenAI Codex 的辅助下完成开发。

## 许可证

MIT
