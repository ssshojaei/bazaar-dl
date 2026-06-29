import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	extractPackageName,
	fixNumbers,
	toAppUrl,
} from '../src/utils.js';

describe('fixNumbers', () => {
	it('converts Persian digits to ASCII digits', () => {
		assert.equal(fixNumbers('نسخه ۱.۲.۳'), 'نسخه 1.2.3');
	});
});

describe('extractPackageName', () => {
	it('extracts a package name from a Cafe Bazaar URL', () => {
		assert.equal(
			extractPackageName('https://cafebazaar.ir/app/com.digikala'),
			'com.digikala'
		);
	});

	it('accepts a raw package name', () => {
		assert.equal(extractPackageName('com.example.android'), 'com.example.android');
	});

	it('rejects empty input', () => {
		assert.throws(() => extractPackageName(''), /required/i);
	});

	it('rejects invalid input', () => {
		assert.throws(
			() => extractPackageName('not-a-valid-package'),
			/Invalid input/
		);
	});
});

describe('toAppUrl', () => {
	it('builds a Cafe Bazaar app page URL', () => {
		assert.equal(
			toAppUrl('com.digikala'),
			'https://cafebazaar.ir/app/com.digikala'
		);
	});
});
