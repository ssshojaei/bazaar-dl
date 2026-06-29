import type {
	BazaarApiResponse,
	DownloadInfo,
	DownloadLinkOptions,
} from './types.js';

const API_URL =
	'https://api.cafebazaar.ir/rest-v1/process/AppDownloadInfoRequest';

const DEFAULT_SDK_VERSIONS = [33, 25, 22];

function parseDownloadLink(payload: BazaarApiResponse): string | null {
	const reply = payload.singleReply?.appDownloadInfoReply;
	const token = reply?.token;
	const cdnPrefix = reply?.cdnPrefix?.[0];

	if (!token || !cdnPrefix) {
		return null;
	}

	return `${cdnPrefix}apks/${token}.apk`;
}

function buildRequestBody(packageName: string, sdkVersion: number): string {
	return JSON.stringify({
		properties: {
			language: 2,
			clientVersionCode: 1100301,
			androidClientInfo: {
				cpu: 'x86,armeabi-v7a,armeabi',
				sdkVersion,
			},
			clientVersion: '11.3.1',
			isKidsEnabled: false,
		},
		singleRequest: {
			appDownloadInfoRequest: {
				downloadStatus: 1,
				packageName,
				referrers: [],
			},
		},
	});
}

export async function getDownloadLink(
	packageName: string,
	options: DownloadLinkOptions = {}
): Promise<DownloadInfo> {
	const sdkVersions = options.sdkVersions ?? DEFAULT_SDK_VERSIONS;
	const fetchImpl = options.fetchImpl ?? fetch;
	let lastError: Error | undefined;

	for (const sdkVersion of sdkVersions) {
		try {
			const response = await fetchImpl(API_URL, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: buildRequestBody(packageName, sdkVersion),
				signal: AbortSignal.timeout(30_000),
			});

			if (!response.ok) {
				lastError = new Error(
					`Cafe Bazaar API returned HTTP ${response.status} for SDK ${sdkVersion}.`
				);
				continue;
			}

			const payload = (await response.json()) as BazaarApiResponse;
			const link = parseDownloadLink(payload);

			if (link) {
				return { link, sdkVersion };
			}

			lastError = new Error(
				`Cafe Bazaar API did not return a download link for SDK ${sdkVersion}.`
			);
		} catch (error) {
			lastError =
				error instanceof Error
					? error
					: new Error('Failed to contact the Cafe Bazaar API.');
		}
	}

	throw lastError ?? new Error('Unable to resolve a download link.');
}
