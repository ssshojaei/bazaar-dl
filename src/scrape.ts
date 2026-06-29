import * as cheerio from 'cheerio';
import type { AppMetadata, FetchOptions } from './types.js';
import { fixNumbers, toAppUrl } from './utils.js';

const BROWSER_USER_AGENT =
	'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

export async function fetchAppMetadata(
	packageName: string,
	options: FetchOptions = {}
): Promise<AppMetadata> {
	const fetchImpl = options.fetchImpl ?? fetch;
	const url = toAppUrl(packageName);

	try {
		const response = await fetchImpl(url, {
			headers: {
				Accept: 'text/html,application/xhtml+xml',
				'User-Agent': BROWSER_USER_AGENT,
			},
			signal: AbortSignal.timeout(30_000),
		});

		if (!response.ok) {
			return {};
		}

		const html = await response.text();
		const $ = cheerio.load(html);
		const metadata: AppMetadata = {};

		const title = $('.cover-header__content > h1').first().text().trim();
		if (title) {
			metadata.title = title;
		}

		const developer = $('.cover-header__title-subtitle').first().text().trim();
		if (developer) {
			metadata.developer = developer;
		}

		const version = $('div.app-details__version--linked')
			.first()
			.text()
			.replace('نسخه', '')
			.trim();

		if (version) {
			metadata.version = fixNumbers(version);
		}

		return metadata;
	} catch {
		return {};
	}
}
