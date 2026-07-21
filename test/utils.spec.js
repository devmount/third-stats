import { describe, expect, it } from 'vitest';
import {
	contactInvolved,
	isSelfMessage,
	quarterNumber,
	sumObjects,
	sumObjectsObjects,
	weekNumber,
	weeksBetween,
} from '@/utils.js';

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
