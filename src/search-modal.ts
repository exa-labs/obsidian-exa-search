import { App, Modal, Notice, Setting } from 'obsidian';
import type ExaSearchPlugin from './main';
import type { ExaCategory } from './settings';
import { exaSearch, formatResultsAsMarkdown } from './exa-client';
import type { SearchOverrides } from './exa-client';

/**
 * Modal that prompts the user for a search query, calls Exa,
 * and inserts formatted results at the cursor position.
 */
export class ExaSearchModal extends Modal {
	plugin: ExaSearchPlugin;
	query: string;
	categoryOverride: ExaCategory;
	startDate: string;
	endDate: string;

	constructor(app: App, plugin: ExaSearchPlugin, initialQuery = '') {
		super(app);
		this.plugin = plugin;
		this.query = initialQuery;
		this.categoryOverride = this.plugin.settings.category;
		this.startDate = '';
		this.endDate = '';
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
			setTimeout(() => text.inputEl.focus(), 50);
		});

		new Setting(contentEl)
			.setName('Category')
			.setDesc('Filter to a specific type of content.')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('', 'All (no filter)')
					.addOption('company', 'Company')
					.addOption('research paper', 'Research paper')
					.addOption('news', 'News')
					.addOption('pdf', 'PDF')
					.addOption('github', 'GitHub')
					.addOption('tweet', 'Tweet')
					.addOption('personal site', 'Personal site')
					.addOption('linkedin profile', 'LinkedIn profile')
					.setValue(this.categoryOverride)
					.onChange((value) => {
						this.categoryOverride = value as ExaCategory;
					}),
			);

		new Setting(contentEl)
			.setName('Published after')
			.setDesc('Only include results published after this date.')
			.addText((text) =>
				text
					.setPlaceholder('YYYY-MM-DD')
					.setValue(this.startDate)
					.onChange((value) => {
						this.startDate = value;
					}),
			);

		new Setting(contentEl)
			.setName('Published before')
			.setDesc('Only include results published before this date.')
			.addText((text) =>
				text
					.setPlaceholder('YYYY-MM-DD')
					.setValue(this.endDate)
					.onChange((value) => {
						this.endDate = value;
					}),
			);

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

		const overrides: SearchOverrides = {};
		overrides.category = this.categoryOverride;
		if (this.startDate.trim()) {
			overrides.startDate = this.startDate.trim();
		}
		if (this.endDate.trim()) {
			overrides.endDate = this.endDate.trim();
		}

		this.close();
		new Notice(`Searching Exa for "${query}"...`);

		try {
			const response = await exaSearch(query, this.plugin.settings, overrides);
			const markdown = formatResultsAsMarkdown(
				query,
				response.results,
				this.plugin.settings.includeHighlights,
				this.plugin.settings.resultFormat,
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
			navigator.clipboard.writeText(text);
			new Notice('No active editor. Results copied to clipboard.');
		}
	}
}
