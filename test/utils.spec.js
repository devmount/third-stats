import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	arrayContainsArray,
	contactInvolved,
	extractEmailAddress,
	formatBytes,
	formatDate,
	isoDayOfWeek,
	isSelfMessage,
	localDateKey,
	localStartOfWeek,
	monthNames,
	NumberedObject,
	oneDigit,
	openTab,
	pluralPolish,
	pluralUkrainian,
	quarterNumber,
	queryMessages,
	setTheme,
	sortAndLimitObject,
	sortAndLimitObjectToArray,
	sumObjects,
	sumObjectsArrays,
	sumObjectsObjects,
	traverseAccount,
	twoDigit,
	weekdayNames,
	weekNumber,
	weeksBetween,
	yyyymmdd,
} from '@/utils.js';

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('weekNumber', () => {
	it('assigns Dec 31 2018 to week 1 of 2019', () => {
		expect(weekNumber(new Date(2018, 11, 31))).toBe(1);
	});

	it('assigns Jan 1 2017 to week 52 of the previous year', () => {
		expect(weekNumber(new Date(2017, 0, 1))).toBe(52);
	});

	it('always assigns Jan 4 to week 1 (ISO 8601 invariant)', () => {
		expect(weekNumber(new Date(2017, 0, 4))).toBe(1);
		expect(weekNumber(new Date(2021, 0, 4))).toBe(1);
	});
});

describe('quarterNumber', () => {
	it('assigns Mar 31 to Q1 and Apr 1 to Q2', () => {
		expect(quarterNumber(new Date(2023, 2, 31))).toBe(1);
		expect(quarterNumber(new Date(2023, 3, 1))).toBe(2);
	});
});

describe('weeksBetween', () => {
	it('prefixes the last week of the previous year when the range starts in it', () => {
		expect(weeksBetween(new Date(2017, 0, 1), new Date(2017, 0, 15)))
			.toEqual([[2016, 52], [2017, 1], [2017, 2]]);
	});

	it('handles a range spanning a year boundary', () => {
		expect(weeksBetween(new Date(2018, 11, 25), new Date(2019, 0, 10)))
			.toEqual([[2018, 52], [2019, 1], [2019, 2]]);
	});
});

describe('sumObjects', () => {
	it('sums overlapping keys and keeps disjoint ones', () => {
		expect(sumObjects([{ a: 1, b: 2 }, { b: 3, c: 4 }])).toEqual({ a: 1, b: 5, c: 4 });
	});

	it('returns an empty object for empty input', () => {
		expect(sumObjects([])).toEqual({});
	});
});

describe('sumObjectsObjects', () => {
	it('sums nested objects key by key', () => {
		expect(sumObjectsObjects([{ 2023: { 1: 1, 2: 2 } }, { 2023: { 2: 3, 3: 4 } }]))
			.toEqual({ 2023: { 1: 1, 2: 5, 3: 4 } });
	});
});

describe('contactInvolved', () => {
	const message = {
		author: 'Alice <alice@example.com>',
		recipients: ['Bob <bob@example.com>'],
		ccList: ['carol@example.com'],
		bccList: [],
	};

	it('matches the author', () => {
		expect(contactInvolved('alice@example.com', message)).toBe(true);
	});

	it('matches a recipient', () => {
		expect(contactInvolved('bob@example.com', message)).toBe(true);
	});

	it('matches a cc', () => {
		expect(contactInvolved('carol@example.com', message)).toBe(true);
	});

	it('returns false when the contact is not involved', () => {
		expect(contactInvolved('dave@example.com', message)).toBe(false);
	});
});

describe('localDateKey', () => {
	it('formats a local date as YYYY-MM-DD without shifting to UTC', () => {
		// midnight local time - a UTC-based toISOString() would roll this back
		// a day in any timezone ahead of UTC (the bug this helper fixes)
		expect(localDateKey(new Date(2023, 5, 15, 0, 0, 0))).toBe('2023-06-15');
		expect(localDateKey(new Date(2023, 5, 15, 23, 59, 59))).toBe('2023-06-15');
	});

	it('pads single-digit months and days', () => {
		expect(localDateKey(new Date(2023, 0, 5))).toBe('2023-01-05');
	});
});

describe('isSelfMessage', () => {
	it('is true when author and all recipients match the given identities', () => {
		const message = {
			author: 'Me <me@example.com>',
			recipients: ['Me <me@example.com>'],
			ccList: [],
			bccList: [],
		};
		expect(isSelfMessage(message, ['me@example.com'])).toBe(true);
	});

	it('is false when the author is not in the given identities', () => {
		const message = {
			author: 'Alice <alice@example.com>',
			recipients: ['Bob <bob@example.com>'],
			ccList: [],
			bccList: [],
		};
		expect(isSelfMessage(message, ['me@example.com'])).toBe(false);
	});
});

describe('arrayContainsArray', () => {
	it('is true when every target element is present', () => {
		expect(arrayContainsArray(['a', 'b', 'c'], ['a', 'b'])).toBe(true);
	});

	it('is false when a target element is missing', () => {
		expect(arrayContainsArray(['a', 'b'], ['a', 'c'])).toBe(false);
	});

	it('is true for an empty target array (vacuous truth)', () => {
		expect(arrayContainsArray(['a'], [])).toBe(true);
	});
});

describe('extractEmailAddress', () => {
	it('extracts and lowercases the address from a "Name <email>" string', () => {
		expect(extractEmailAddress('Name <Foo@Example.com>')).toBe('foo@example.com');
	});

	it('extracts a bare email address', () => {
		expect(extractEmailAddress('foo@example.com')).toBe('foo@example.com');
	});

	it('returns an empty string when no email address is found', () => {
		expect(extractEmailAddress('no email here')).toBe('');
	});
});

describe('formatBytes', () => {
	it('formats 0 bytes specially', () => {
		expect(formatBytes(0)).toBe('0 Bytes');
	});

	it('converts to KB and MB using 1024 as the base', () => {
		expect(formatBytes(1024)).toBe('1 KB');
		expect(formatBytes(1048576)).toBe('1 MB');
	});

	it('respects the decimals parameter', () => {
		expect(formatBytes(1536, 1)).toBe('1.5 KB');
	});
});

describe('formatDate', () => {
	it('returns an empty string for a falsy date', () => {
		expect(formatDate(null)).toBe('');
		expect(formatDate(undefined)).toBe('');
	});

	it('formats a real date in the given locale', () => {
		const result = formatDate(new Date(2023, 5, 15, 10, 30), 'en');
		expect(result).toContain('2023');
		expect(result).toContain('June');
		expect(result).toContain('15');
	});
});

describe('isoDayOfWeek', () => {
	it('maps Sunday to 7 and Monday to 1 (ISO 8601 numbering)', () => {
		// Jan 1 2023 is a Sunday, Jan 2 2023 is a Monday
		expect(isoDayOfWeek(new Date(2023, 0, 1))).toBe('7');
		expect(isoDayOfWeek(new Date(2023, 0, 2))).toBe('1');
	});
});

describe('localStartOfWeek', () => {
	it('always resolves to the Sunday of the current week (getDay() 0)', () => {
		// by construction (today's date minus today's weekday number), this can
		// only ever land on a Sunday, regardless of which day the test runs on
		expect(localStartOfWeek()).toBe(0);
	});
});

describe('monthNames', () => {
	it('returns 12 short, localized month names starting with January', () => {
		const names = monthNames('en');
		expect(names).toHaveLength(12);
		expect(names[0]).toBe('Jan');
		expect(names[11]).toBe('Dec');
	});
});

describe('weekdayNames', () => {
	it('returns 7 short, localized weekday names starting with Sunday', () => {
		const names = weekdayNames('en');
		expect(names).toHaveLength(7);
		expect(names[0]).toBe('Sun');
		expect(names[6]).toBe('Sat');
	});
});

describe('NumberedObject', () => {
	it('creates a flat zero-initialized object when no second dimension is given', () => {
		expect({ ...new NumberedObject(3) }).toEqual({ 0: 0, 1: 0, 2: 0 });
	});

	it('creates nested zero-filled arrays when a second dimension is given', () => {
		expect({ ...new NumberedObject(2, 3) }).toEqual({ 0: [0, 0, 0], 1: [0, 0, 0] });
	});
});

describe('oneDigit / twoDigit', () => {
	it('rounds to one or two decimal places respectively', () => {
		expect(oneDigit(3.14159)).toBe('3.1');
		expect(twoDigit(3.14159)).toBe('3.14');
	});
});

describe('pluralPolish / pluralUkrainian', () => {
	it('returns form 1 only for the number 1', () => {
		expect(pluralPolish(1)).toBe(1);
	});

	it('returns form 2 ("few") for numbers ending in 2-4, except the 12-14 teens', () => {
		expect(pluralPolish(2)).toBe(2);
		expect(pluralPolish(3)).toBe(2);
		expect(pluralPolish(4)).toBe(2);
		expect(pluralPolish(22)).toBe(2);
		expect(pluralPolish(12)).toBe(0);
		expect(pluralPolish(13)).toBe(0);
		expect(pluralPolish(14)).toBe(0);
	});

	it('returns form 0 ("many") for everything else', () => {
		expect(pluralPolish(5)).toBe(0);
		expect(pluralPolish(11)).toBe(0);
		expect(pluralPolish(25)).toBe(0);
	});

	it('pluralUkrainian returns form 1 for numbers ending in 1 (except 11), else 0', () => {
		expect(pluralUkrainian(1)).toBe(1);
		expect(pluralUkrainian(21)).toBe(1);
		expect(pluralUkrainian(11)).toBe(0);
	});

	it('pluralUkrainian returns form 2 ("few") for numbers ending in 2-4, except the 12-14 teens', () => {
		expect(pluralUkrainian(2)).toBe(2);
		expect(pluralUkrainian(22)).toBe(2);
		expect(pluralUkrainian(12)).toBe(0);
	});
});

describe('sortAndLimitObject', () => {
	it('sorts entries by value descending', () => {
		expect(sortAndLimitObject({ a: 1, b: 5, c: 3 })).toEqual({ b: 5, c: 3, a: 1 });
	});

	it('limits to the given number of top entries', () => {
		expect(sortAndLimitObject({ a: 1, b: 5, c: 3 }, 2)).toEqual({ b: 5, c: 3 });
	});
});

describe('sortAndLimitObjectToArray', () => {
	it('returns sorted [key, value] pairs, limited to the given count', () => {
		expect(sortAndLimitObjectToArray({ a: 1, b: 5, c: 3 }, 2)).toEqual([['b', 5], ['c', 3]]);
	});
});

describe('sumObjectsArrays', () => {
	it('sums arrays element-wise per key across objects', () => {
		expect(sumObjectsArrays([{ a: [1, 2] }, { a: [3, 4], b: [1] }]))
			.toEqual({ a: [4, 6], b: [1] });
	});
});

describe('yyyymmdd', () => {
	it('formats a date as YYYYMMDD in UTC', () => {
		expect(yyyymmdd(new Date('2023-06-15T12:00:00Z'))).toBe('20230615');
	});
});

describe('setTheme', () => {
	const createFakeElement = () => {
		const classes = new Set();
		return {
			classList: {
				add: (...names) => names.forEach(n => classes.add(n)),
				remove: (...names) => names.forEach(n => classes.delete(n)),
				contains: (n) => classes.has(n),
			},
		};
	};

	it('applies the dark classes and returns true for theme "dark"', () => {
		const el = createFakeElement();
		expect(setTheme('dark', el)).toBe(true);
		expect(el.classList.contains('dark')).toBe(true);
		expect(el.classList.contains('light')).toBe(false);
	});

	it('applies the light classes and returns false for theme "light"', () => {
		const el = createFakeElement();
		expect(setTheme('light', el)).toBe(false);
		expect(el.classList.contains('light')).toBe(true);
		expect(el.classList.contains('dark')).toBe(false);
	});

	it('follows the OS preference for theme "system"', () => {
		vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) });
		const el = createFakeElement();
		expect(setTheme('system', el)).toBe(true);
		expect(el.classList.contains('dark')).toBe(true);

		vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
		const el2 = createFakeElement();
		expect(setTheme('system', el2)).toBe(false);
		expect(el2.classList.contains('light')).toBe(true);
	});

	it('uses custom dark/light class names when given', () => {
		const el = createFakeElement();
		setTheme('dark', el, ['custom-dark'], ['custom-light']);
		expect(el.classList.contains('custom-dark')).toBe(true);
	});
});

describe('openTab', () => {
	it('opens the given url with no query param when none is given', () => {
		const create = vi.fn();
		vi.stubGlobal('messenger', { tabs: { create } });
		openTab('index.html');
		expect(create).toHaveBeenCalledWith({ active: true, url: 'index.html' });
	});

	it('appends the "s" query param when given', () => {
		const create = vi.fn();
		vi.stubGlobal('messenger', { tabs: { create } });
		openTab('index.html', 'abc');
		expect(create).toHaveBeenCalledWith({ active: true, url: 'index.html?s=abc' });
	});
});

describe('queryMessages', () => {
	const page = (messages, id) => ({ messages, id });

	it('yields all messages from a single page', async () => {
		const list = vi.fn().mockResolvedValue(page([{ id: 1 }, { id: 2 }], null));
		vi.stubGlobal('messenger', { messages: { list } });
		const result = [];
		for await (const m of queryMessages('folder-1', null, null)) result.push(m);
		expect(result).toEqual([{ id: 1 }, { id: 2 }]);
		expect(list).toHaveBeenCalledWith('folder-1');
	});

	it('paginates across multiple pages via continueList', async () => {
		const list = vi.fn().mockResolvedValue(page([{ id: 1 }], 'page-2'));
		const continueList = vi.fn().mockResolvedValue(page([{ id: 2 }], null));
		vi.stubGlobal('messenger', { messages: { list, continueList } });
		const result = [];
		for await (const m of queryMessages('folder-1', null, null)) result.push(m);
		expect(result).toEqual([{ id: 1 }, { id: 2 }]);
		expect(continueList).toHaveBeenCalledWith('page-2');
	});

	it('filters out messages outside the date range when both bounds are given', async () => {
		const inRange = { id: 1, date: new Date('2023-06-15').getTime() };
		const tooEarly = { id: 2, date: new Date('2022-01-01').getTime() };
		const tooLate = { id: 3, date: new Date('2024-01-01').getTime() };
		const list = vi.fn().mockResolvedValue(page([inRange, tooEarly, tooLate], null));
		vi.stubGlobal('messenger', { messages: { list } });
		const result = [];
		for await (const m of queryMessages('folder-1', '2023-01-01', '2023-12-31')) result.push(m);
		expect(result).toEqual([inRange]);
	});

	it('does not filter by date when only one bound is given', async () => {
		const messages = [{ id: 1, date: new Date('2010-01-01').getTime() }];
		const list = vi.fn().mockResolvedValue(page(messages, null));
		vi.stubGlobal('messenger', { messages: { list } });
		const result = [];
		for await (const m of queryMessages('folder-1', '2023-01-01', null)) result.push(m);
		expect(result).toEqual(messages);
	});

	it('records an error and stops iterating when the underlying API throws', async () => {
		const list = vi.fn().mockRejectedValue(new Error('boom'));
		const set = vi.fn().mockResolvedValue();
		vi.stubGlobal('messenger', { messages: { list }, storage: { local: { set } } });
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const result = [];
		for await (const m of queryMessages('folder-1', null, null)) result.push(m);
		expect(result).toEqual([]);
		expect(set).toHaveBeenCalledWith({ error: true });
	});
});

describe('traverseAccount', () => {
	it('flattens nested subfolders, excluding root folders', async () => {
		const tree = {
			isRoot: true,
			subFolders: [
				{ isRoot: false, path: '/Inbox', subFolders: [
					{ isRoot: false, path: '/Inbox/Sub', subFolders: [] },
				] },
				{ isRoot: false, path: '/Sent', subFolders: [] },
			],
		};
		const get = vi.fn().mockResolvedValue(tree);
		vi.stubGlobal('messenger', { folders: { get } });
		const account = { rootFolder: { id: 'root-1' } };
		const result = await traverseAccount(account);
		expect(result.map(f => f.path)).toEqual(['/Inbox', '/Inbox/Sub', '/Sent']);
		expect(get).toHaveBeenCalledWith('root-1', true);
	});

	it('returns an empty array when the account has no subfolders', async () => {
		const get = vi.fn().mockResolvedValue({ isRoot: true, subFolders: [] });
		vi.stubGlobal('messenger', { folders: { get } });
		const result = await traverseAccount({ rootFolder: { id: 'root-1' } });
		expect(result).toEqual([]);
	});
});
