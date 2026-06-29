import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import { describe, it } from 'node:test';
import { formatResult, resolveApp, runCli } from '../src/cli.js';

class CollectingWritable extends Writable {
	chunks: string[] = [];

	_write(
		chunk: Buffer | string,
		_encoding: BufferEncoding,
		callback: (error?: Error | null) => void
	): void {
		this.chunks.push(chunk.toString());
		callback();
	}
}

describe('formatResult', () => {
	it('prints human-readable output by default', () => {
		const output = formatResult({
			packageName: 'com.example.app',
			link: 'https://cdn.example/apks/token.apk',
			sdkVersion: 33,
			title: 'Example',
			developer: 'Example Inc',
			version: '1.2.3',
		});

		assert.match(output, /Package: com\.example\.app/);
		assert.match(output, /Download: https:\/\/cdn\.example\/apks\/token\.apk/);
		assert.match(output, /Title: Example/);
		assert.match(output, /Developer: Example Inc/);
		assert.match(output, /Version: 1\.2\.3/);
		assert.match(output, /SDK: 33/);
	});

	it('supports link-only output', () => {
		const output = formatResult(
			{
				packageName: 'com.example.app',
				link: 'https://cdn.example/apks/token.apk',
				sdkVersion: 33,
			},
			{ linkOnly: true }
		);

		assert.equal(output, 'https://cdn.example/apks/token.apk');
	});

	it('supports JSON output', () => {
		const output = formatResult(
			{
				packageName: 'com.example.app',
				link: 'https://cdn.example/apks/token.apk',
				sdkVersion: 33,
			},
			{ json: true }
		);

		assert.deepEqual(JSON.parse(output), {
			packageName: 'com.example.app',
			link: 'https://cdn.example/apks/token.apk',
			sdkVersion: 33,
		});
	});
});

describe('resolveApp', () => {
	it('resolves a package name and tolerates missing metadata', async () => {
		const fetchImpl = async (
			_url: string | URL | Request,
			init?: RequestInit
		) => {
			if (init?.method === 'POST') {
				return new Response(
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
			}

			return new Response('Unavailable', { status: 503 });
		};

		const result = await resolveApp('com.example.app', {
			fetchImpl,
			metadata: true,
		});

		assert.equal(result.packageName, 'com.example.app');
		assert.equal(result.link, 'https://cdn.example/apks/abc123.apk');
		assert.equal(result.title, undefined);
	});
});

describe('runCli', () => {
	it('prints link-only output and exits successfully', async () => {
		const stdout = new CollectingWritable();

		const fetchImpl = async (
			_url: string | URL | Request,
			init?: RequestInit
		) => {
			if (init?.method === 'POST') {
				return new Response(
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
			}

			return new Response('Unavailable', { status: 503 });
		};

		const exitCode = await runCli(
			['node', 'bazaar-dl', 'com.example.app', '--link-only', '--no-metadata'],
			{ fetchImpl, stdout }
		);

		assert.equal(exitCode, 0);
		assert.equal(stdout.chunks.join(''), 'https://cdn.example/apks/abc123.apk\n');
	});
});
