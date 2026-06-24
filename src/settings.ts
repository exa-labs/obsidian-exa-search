import { App, PluginSettingTab, Setting } from 'obsidian';
import type ExaSearchPlugin from './main';

export interface ExaSearchSettings {
	apiKey: string;
	numResults: number;
	includeHighlights: boolean;
	includeText: boolean;
	searchType: 'auto' | 'keyword';
}

export const DEFAULT_SETTINGS: ExaSearchSettings = {
	apiKey: '',
	numResults: 5,
	includeHighlights: true,
	includeText: false,
	searchType: 'auto',
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
	}
}
