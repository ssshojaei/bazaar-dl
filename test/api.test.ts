import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getDownloadLink } from '../src/api.js';

describe('getDownloadLink', () => {
	it('returns a download link from a successful API response', async () => {
		const fetchImpl = async () =>
			new Response(
				JSON.stringify({
					singleReply: {
						appDownloadInfoReply: {
							token: 'abc123',
							cdnPrefix: ['https://cdn.example/'],
						},
					},
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			);

		const result = await getDownloadLink('com.example.app', {
			sdkVersions: [33],
			fetchImpl,
		});

		assert.equal(result.link, 'https://cdn.example/apks/abc123.apk');
		assert.equal(result.sdkVersion, 33);
	});

	it('tries the next SDK version when the first response has no link', async () => {
		const attempts: number[] = [];

		const fetchImpl = async () => {
			const sdkVersion = attempts.length === 0 ? 33 : 25;
			attempts.push(sdkVersion);

			if (sdkVersion === 33) {
				return new Response(JSON.stringify({ singleReply: {} }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(
				JSON.stringify({
					singleReply: {
						appDownloadInfoReply: {
							token: 'fallback',
							cdnPrefix: ['https://cdn.example/'],
						},
					},
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			);
		};

		const result = await getDownloadLink('com.example.app', {
			sdkVersions: [33, 25],
			fetchImpl,
		});

		assert.equal(result.sdkVersion, 25);
		assert.equal(result.link, 'https://cdn.example/apks/fallback.apk');
		assert.deepEqual(attempts, [33, 25]);
	});

	it('throws when all SDK attempts fail', async () => {
		const fetchImpl = async () =>
			new Response('Service Unavailable', { status: 503 });

		await assert.rejects(
			() =>
				getDownloadLink('com.example.app', {
					sdkVersions: [33],
					fetchImpl,
				}),
			/Cafe Bazaar API returned HTTP 503/
		);
	});
});
