const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function fixNumbers(value: string): string {
	return value.replace(/[۰-۹]/g, (digit) =>
		String(PERSIAN_DIGITS.indexOf(digit))
	);
}

export function extractPackageName(input: string): string {
	if (!input?.trim()) {
		throw new Error('A Cafe Bazaar URL or package name is required.');
	}

	const trimmed = input.trim();

	const urlMatch = trimmed.match(/cafebazaar\.ir\/app\/([^/?#]+)/i);
	if (urlMatch?.[1]) {
		return decodeURIComponent(urlMatch[1]);
	}

	if (/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/i.test(trimmed)) {
		return trimmed;
	}

	throw new Error(
		'Invalid input. Provide a Cafe Bazaar app URL (https://cafebazaar.ir/app/<package>) or an Android package name.'
	);
}

export function toAppUrl(packageName: string): string {
	return `https://cafebazaar.ir/app/${encodeURIComponent(packageName)}`;
}
