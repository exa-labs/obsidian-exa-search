import { App, Modal, Notice, Setting } from 'obsidian';
import type ExaSearchPlugin from './main';
import { exaSearch, formatResultsAsMarkdown } from './exa-client';

/**
 * Modal that prompts the user for a search query, calls Exa,
 * and inserts formatted results at the cursor position.
 */
export class ExaSearchModal extends Modal {
	plugin: ExaSearchPlugin;
	query: string;

	constructor(app: App, plugin: ExaSearchPlugin, initialQuery = '') {
		super(app);
		this.plugin = plugin;
		this.query = initialQuery;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl('h3', { text: 'Search with Exa' });

		new Setting(contentEl).setName('Query').addText((text) => {
			text.setPlaceholder('What are you looking for?')
				.setValue(this.query)
				.onChange((value) => {
					this.query = value;
				});
			text.inputEl.style.width = '100%';
			text.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					this.runSearch();
				}
			});
			// Auto-focus after the modal renders
			setTimeout(() => text.inputEl.focus(), 50);
		});

		new Setting(contentEl).addButton((btn) =>
			btn.setButtonText('Search').setCta().onClick(() => this.runSearch()),
		);
	}

	onClose(): void {
		this.contentEl.empty();
	}

	private async runSearch(): Promise<void> {
		const query = this.query.trim();
		if (!query) {
			new Notice('Please enter a search query.');
			return;
		}

		if (!this.plugin.settings.apiKey) {
			new Notice('Exa API key not set. Go to Settings > Exa Search.');
			return;
		}

		this.close();
		new Notice(`Searching Exa for "${query}"...`);

		try {
			const response = await exaSearch(query, this.plugin.settings);
			const markdown = formatResultsAsMarkdown(
				query,
				response.results,
				this.plugin.settings.includeHighlights,
			);
			this.insertAtCursor(markdown);
			new Notice(`Found ${response.results.length} results.`);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			new Notice(`Exa search failed: ${msg}`);
		}
	}

	private insertAtCursor(text: string): void {
		const editor = this.app.workspace.activeEditor?.editor;
		if (editor) {
			const cursor = editor.getCursor();
			editor.replaceRange(text, cursor);
		} else {
			// No active editor; copy to clipboard instead
			navigator.clipboard.writeText(text);
			new Notice('No active editor. Results copied to clipboard.');
		}
	}
}
