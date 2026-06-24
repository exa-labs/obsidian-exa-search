import { Editor, Plugin } from 'obsidian';
import { ExaSearchSettings, DEFAULT_SETTINGS, ExaSearchSettingTab } from './settings';
import { ExaSearchModal } from './search-modal';
import { ExaFindSimilarModal } from './find-similar-modal';

export default class ExaSearchPlugin extends Plugin {
	settings!: ExaSearchSettings;

	async onload(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<ExaSearchSettings>,
		);

		this.addCommand({
			id: 'search',
			name: 'Search the web',
			callback: () => {
				new ExaSearchModal(this.app, this).open();
			},
		});

		this.addCommand({
			id: 'search-selection',
			name: 'Search selected text',
			editorCallback: (editor: Editor) => {
				const selection = editor.getSelection().trim();
				if (!selection) {
					new ExaSearchModal(this.app, this).open();
					return;
				}
				new ExaSearchModal(this.app, this, selection).open();
			},
		});

		this.addCommand({
			id: 'find-similar',
			name: 'Find similar pages',
			callback: () => {
				new ExaFindSimilarModal(this.app, this).open();
			},
		});

		this.addCommand({
			id: 'find-similar-url',
			name: 'Find pages similar to selected URL',
			editorCallback: (editor: Editor) => {
				const selection = editor.getSelection().trim();
				const urlMatch = selection.match(/https?:\/\/[^\s)]+/);
				if (urlMatch) {
					new ExaFindSimilarModal(this.app, this, urlMatch[0]).open();
				} else {
					new ExaFindSimilarModal(this.app, this).open();
				}
			},
		});

		this.addSettingTab(new ExaSearchSettingTab(this.app, this));
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
