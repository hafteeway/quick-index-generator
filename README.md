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

### Manual install

1. Download this repository.
2. Copy the folder into your vault:

   ```text
   <your-vault>/.obsidian/plugins/quick-index-generator
   ```

3. Restart Obsidian.
4. Open `Settings -> Community plugins`.
5. Enable `Quick Index Generator`.

## Usage

1. Open the note where you want the index to appear.
2. Run the command `生成/更新当前笔记索引` from the command palette.
3. The plugin inserts the index at the cursor position on first run.
4. Later runs replace the previous index content.
5. When a new Markdown note is created, the plugin updates the last index location automatically.

## Notes

- The plugin stores its local state in Obsidian plugin data. Do not commit `data.json`.
- This plugin is designed for personal vault organization and does not require a build step.

## License

MIT
