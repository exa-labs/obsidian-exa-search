# Exa Search for Obsidian

Search the web with [Exa](https://exa.ai) directly from Obsidian and insert results into your notes.

Exa is an AI-native search engine that returns clean, relevant results with highlights and content extraction. It powers search for Cursor, Claude, Codex, and many AI agent frameworks.

## Features

- **Search the web** from a command palette modal
- **Search selected text** with a single hotkey
- Results inserted as formatted markdown with links, dates, and highlights
- Configurable result count, highlights, full text extraction, and search type
- Works on desktop and mobile (uses Obsidian's built-in HTTP client)
- No external dependencies or servers required

## Setup

1. Install the plugin (see below)
2. Go to **Settings > Exa Search**
3. Enter your Exa API key (get one free at [dashboard.exa.ai](https://dashboard.exa.ai/api-keys))

## Usage

Open the command palette (`Ctrl/Cmd + P`) and run:

- **Exa Search: Search the web** to open the search modal and type a query
- **Exa Search: Search selected text** to search whatever text you have selected in the editor

Results are inserted at your cursor position as markdown. If no editor is open, results are copied to the clipboard.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| API key | (none) | Your Exa API key |
| Number of results | 5 | How many results to return (1-20) |
| Include highlights | On | Show relevant text snippets from each result |
| Include full text | Off | Include the full page content (can be long) |
| Search type | Auto | How Exa interprets the query (auto or keyword) |

## Installation

### From community plugins (pending review)

1. Open **Settings > Community plugins > Browse**
2. Search for "Exa Search"
3. Select **Install**, then **Enable**

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` (if present) from the [latest release](https://github.com/exa-labs/obsidian-exa-search/releases)
2. Create a folder `<your-vault>/.obsidian/plugins/exa-search/`
3. Copy the downloaded files into that folder
4. Restart Obsidian and enable the plugin in **Settings > Community plugins**

## Privacy

- Your Exa API key is stored locally in your vault's plugin data. It is only sent to `api.exa.ai` when you run a search.
- No telemetry, analytics, or tracking of any kind.
- Search queries are sent to the Exa API to return results. No vault contents are sent unless you explicitly search selected text.

## License

MIT
