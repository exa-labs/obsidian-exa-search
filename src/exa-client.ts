import { requestUrl } from 'obsidian';
import type { ExaSearchSettings } from './settings';

export interface ExaResult {
	title: string;
	url: string;
	publishedDate?: string;
	author?: string;
	score?: number;
	text?: string;
	highlights?: string[];
	highlightScores?: number[];
}

export interface ExaSearchResponse {
	requestId: string;
	results: ExaResult[];
	autopromptString?: string;
}

/**
 * Call the Exa search API and return parsed results.
 * Uses Obsidian's requestUrl for mobile compatibility.
 */
export async function exaSearch(
	query: string,
	settings: ExaSearchSettings,
): Promise<ExaSearchResponse> {
	if (!settings.apiKey) {
		throw new Error(
			'Exa API key not configured. Set it in Settings > Exa Search.',
		);
	}

	const body: Record<string, unknown> = {
		query,
		numResults: settings.numResults,
		type: settings.searchType,
	};

	if (settings.includeHighlights || settings.includeText) {
		const contents: Record<string, unknown> = {};
		if (settings.includeHighlights) {
			contents.highlights = true;
		}
		if (settings.includeText) {
			contents.text = true;
		}
		body.contents = contents;
	}

	const response = await requestUrl({
		url: 'https://api.exa.ai/search',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': settings.apiKey,
		},
		body: JSON.stringify(body),
	});

	if (response.status !== 200) {
		throw new Error(`Exa API error (${response.status}): ${response.text}`);
	}

	return response.json as ExaSearchResponse;
}

/**
 * Format Exa results as markdown suitable for inserting into a note.
 */
export function formatResultsAsMarkdown(
	query: string,
	results: ExaResult[],
	includeHighlights: boolean,
): string {
	if (results.length === 0) {
		return `> No results found for "${query}"\n`;
	}

	const lines: string[] = [];
	lines.push(`## Exa search: ${query}\n`);

	for (const result of results) {
		const title = result.title || result.url;
		lines.push(`- **[${title}](${result.url})**`);

		if (result.publishedDate) {
			lines.push(`  - Published: ${result.publishedDate.slice(0, 10)}`);
		}

		if (includeHighlights && result.highlights && result.highlights.length > 0) {
			for (const highlight of result.highlights) {
				const trimmed = highlight.trim().replace(/\n+/g, ' ');
				if (trimmed) {
					lines.push(`  - > ${trimmed}`);
				}
			}
		}

		if (result.text) {
			const preview = result.text.trim().slice(0, 300).replace(/\n+/g, ' ');
			if (preview) {
				lines.push(`  - ${preview}${result.text.length > 300 ? '...' : ''}`);
			}
		}
	}

	return lines.join('\n') + '\n';
}
