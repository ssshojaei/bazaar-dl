import { Command } from 'commander';
import { getDownloadLink } from './api.js';
import { fetchAppMetadata } from './scrape.js';
import type {
	AppResult,
	CliIoOptions,
	CliOptions,
	FormatResultOptions,
	ResolveAppOptions,
} from './types.js';
import { extractPackageName } from './utils.js';

export async function resolveApp(
	input: string,
	options: ResolveAppOptions = {}
): Promise<AppResult> {
	const packageName = extractPackageName(input);
	const metadataEnabled = options.metadata !== false;

	const [{ link, sdkVersion }, metadata] = await Promise.all([
		getDownloadLink(packageName, {
			sdkVersions: options.sdkVersions,
			fetchImpl: options.fetchImpl,
		}),
		metadataEnabled
			? fetchAppMetadata(packageName, { fetchImpl: options.fetchImpl })
			: Promise.resolve({}),
	]);

	return {
		packageName,
		link,
		sdkVersion,
		...metadata,
	};
}

export function formatResult(
	result: AppResult,
	options: FormatResultOptions = {}
): string {
	if (options.linkOnly) {
		return result.link;
	}

	if (options.json) {
		return JSON.stringify(result, null, 2);
	}

	const lines = [`Package: ${result.packageName}`, `Download: ${result.link}`];

	if (result.title) {
		lines.push(`Title: ${result.title}`);
	}

	if (result.developer) {
		lines.push(`Developer: ${result.developer}`);
	}

	if (result.version) {
		lines.push(`Version: ${result.version}`);
	}

	lines.push(`SDK: ${result.sdkVersion}`);

	return lines.join('\n');
}

export async function runCli(
	argv: string[],
	io: CliIoOptions = {}
): Promise<number> {
	const stdout = io.stdout ?? process.stdout;
	const stderr = io.stderr ?? process.stderr;
	const fetchImpl = io.fetchImpl ?? fetch;

	const program = new Command()
		.name('bazaar-dl')
		.description('Generate direct APK download links from cafebazaar.ir')
		.argument('<input>', 'Cafe Bazaar app URL or Android package name')
		.option('--json', 'Print machine-readable JSON output')
		.option('--link-only', 'Print only the download URL')
		.option('--no-metadata', 'Skip scraping app metadata from the Bazaar page')
		.option(
			'--sdk <version>',
			'Android SDK version to request (default: tries 33, 25, then 22)',
			(value: string) => {
				const parsed = Number.parseInt(value, 10);
				if (!Number.isInteger(parsed) || parsed < 1) {
					throw new Error('SDK version must be a positive integer.');
				}
				return parsed;
			}
		)
		.showHelpAfterError();

	await program.parseAsync(argv);

	const input = program.args[0];
	if (!input) {
		stderr.write('Error: A Cafe Bazaar URL or package name is required.\n');
		return 1;
	}

	const options = program.opts<CliOptions>();

	try {
		const result = await resolveApp(input, {
			metadata: options.metadata,
			sdkVersions: options.sdk === undefined ? undefined : [options.sdk],
			fetchImpl,
		});

		stdout.write(`${formatResult(result, options)}\n`);
		return 0;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'An unexpected error occurred.';
		stderr.write(`Error: ${message}\n`);
		return 1;
	}
}
