import { App, PluginSettingTab, Setting } from 'obsidian';
import type ExaSearchPlugin from './main';

export type ExaCategory =
	| ''
	| 'company'
	| 'research paper'
	| 'news'
	| 'pdf'
	| 'github'
	| 'tweet'
	| 'personal site'
	| 'linkedin profile';

export type ResultFormat = 'list' | 'callout';

export interface ExaSearchSettings {
	apiKey: string;
	numResults: number;
	includeHighlights: boolean;
	includeText: boolean;
	searchType: 'auto' | 'keyword';
	category: ExaCategory;
	resultFormat: ResultFormat;
	useStartDate: boolean;
	startDate: string;
	useEndDate: boolean;
	endDate: string;
}

export const DEFAULT_SETTINGS: ExaSearchSettings = {
	apiKey: '',
	numResults: 5,
	includeHighlights: true,
	includeText: false,
	searchType: 'auto',
	category: '',
	resultFormat: 'list',
	useStartDate: false,
	startDate: '',
	useEndDate: false,
	endDate: '',
};

export class ExaSearchSettingTab extends PluginSettingTab {
	plugin: ExaSearchPlugin;

	constructor(app: App, plugin: ExaSearchPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('API key')
			.setDesc(
				createFragment((frag) => {
					frag.appendText('Your Exa API key. Get one free at ');
					frag.createEl('a', {
						text: 'exa.ai',
						href: 'https://dashboard.exa.ai/api-keys',
					});
					frag.appendText('.');
				}),
			)
			.addText((text) =>
				text
					.setPlaceholder('Enter your API key')
					.setValue(this.plugin.settings.apiKey)
					.then((t) => { t.inputEl.type = 'password'; })
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Number of results')
			.setDesc('How many search results to return (1-20).')
			.addSlider((slider) =>
				slider
					.setLimits(1, 20, 1)
					.setValue(this.plugin.settings.numResults)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.numResults = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Include highlights')
			.setDesc('Include relevant text highlights from each result.')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.includeHighlights)
					.onChange(async (value) => {
						this.plugin.settings.includeHighlights = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Include full text')
			.setDesc('Include the full page text for each result (can be long).')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.includeText)
					.onChange(async (value) => {
						this.plugin.settings.includeText = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Search type')
			.setDesc('How Exa interprets your query. "Auto" lets Exa decide.')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('auto', 'Auto')
					.addOption('keyword', 'Keyword')
					.setValue(this.plugin.settings.searchType)
					.onChange(async (value) => {
						this.plugin.settings.searchType = value as 'auto' | 'keyword';
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Default category')
			.setDesc('Filter results to a specific content category. Leave empty for all.')
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
					.setValue(this.plugin.settings.category)
					.onChange(async (value) => {
						this.plugin.settings.category = value as ExaCategory;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Result format')
			.setDesc('How results are formatted when inserted into notes.')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('list', 'Markdown list')
					.addOption('callout', 'Callout blocks')
					.setValue(this.plugin.settings.resultFormat)
					.onChange(async (value) => {
						this.plugin.settings.resultFormat = value as ResultFormat;
						await this.plugin.saveSettings();
					}),
			);
	}
}
