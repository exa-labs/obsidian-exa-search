import { App, Modal, Notice, Setting } from 'obsidian';
import type ExaSearchPlugin from './main';
import { exaFindSimilar, formatSimilarAsMarkdown } from './exa-client';

/**
 * Modal that prompts the user for a URL and finds similar pages via Exa.
 */
export class ExaFindSimilarModal extends Modal {
	plugin: ExaSearchPlugin;
	url: string;

	constructor(app: App, plugin: ExaSearchPlugin, initialUrl = '') {
		super(app);
		this.plugin = plugin;
		this.url = initialUrl;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl('h3', { text: 'Find similar pages' });

		new Setting(contentEl).setName('URL').addText((text) => {
			text.setPlaceholder('https://example.com/article')
				.setValue(this.url)
				.onChange((value) => {
					this.url = value;
				});
			text.inputEl.style.width = '100%';
			text.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					this.runFindSimilar();
				}
			});
			setTimeout(() => text.inputEl.focus(), 50);
		});

		new Setting(contentEl).addButton((btn) =>
			btn.setButtonText('Find similar').setCta().onClick(() => this.runFindSimilar()),
		);
	}

	onClose(): void {
		this.contentEl.empty();
	}

	private async runFindSimilar(): Promise<void> {
		const url = this.url.trim();
		if (!url) {
			new Notice('Please enter a URL.');
			return;
		}

		if (!this.plugin.settings.apiKey) {
			new Notice('Exa API key not set. Go to Settings > Exa Search.');
			return;
		}

		this.close();
		new Notice(`Finding similar pages to "${url}"...`);

		try {
			const response = await exaFindSimilar(url, this.plugin.settings);
			const markdown = formatSimilarAsMarkdown(
				url,
				response.results,
				this.plugin.settings.includeHighlights,
				this.plugin.settings.resultFormat,
			);
			this.insertAtCursor(markdown);
			new Notice(`Found ${response.results.length} similar pages.`);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			new Notice(`Exa find-similar failed: ${msg}`);
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
