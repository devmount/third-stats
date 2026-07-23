import { describe, expect, it } from 'vitest';
import { getDateFnsLocale, messages, pluralRules } from '@/translations.js';
import { pluralPolish, pluralUkrainian } from '@/utils.js';

describe('messages', () => {
	it('includes a message catalog for every supported locale', () => {
		const expectedLocales = [
			'ca',
			'cs',
			'de',
			'en',
			'es',
			'fi',
			'fr',
			'gl',
			'hi',
			'hu',
			'id',
			'it',
			'nl',
			'ja',
			'pl',
			'pt',
			'ptbr',
			'ru',
			'sk',
			'sv',
			'th',
			'tr',
			'uk',
			'uz',
			'zhcn',
			'zhtw',
		];
		expect(Object.keys(messages).sort()).toEqual(expectedLocales.sort());
		expectedLocales.forEach((locale) => {
			expect(messages[locale]).toBeTruthy();
			expect(typeof messages[locale]).toBe('object');
		});
	});
});

describe('pluralRules', () => {
	it('maps Polish and Ukrainian to their custom plural-selection functions', () => {
		expect(pluralRules.pl).toBe(pluralPolish);
		expect(pluralRules.uk).toBe(pluralUkrainian);
	});
});

describe('getDateFnsLocale', () => {
	const langs = [
		'ca',
		'cs',
		'de',
		'en',
		'es',
		'fi',
		'fr',
		'gl',
		'hi',
		'hu',
		'id',
		'it',
		'nl',
		'ja',
		'pl',
		'pt',
		'pt-BR',
		'ru',
		'sk',
		'sv',
		'th',
		'tr',
		'uk',
		'uz',
		'zh-CN',
		'zh-TW',
	];

	it.each(langs)('resolves a real date-fns locale object for "%s"', async (lang) => {
		const locale = await getDateFnsLocale(lang);
		expect(locale).toBeTruthy();
		expect(typeof locale.code).toBe('string');
	});

	it('falls back to the en-US locale for an unrecognized language code', async () => {
		const locale = await getDateFnsLocale('xx-not-a-real-locale');
		expect(locale.code).toBe('en-US');
	});
});
