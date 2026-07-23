import { describe, expect, it } from 'vitest';
import {
	analyzeMessage,
	buildComparisonData,
	createComparisonData,
	createStatsData,
	sumAccountsData,
} from '@/composables/statsAggregation.js';

const baseMessage = (overrides = {}) => ({
	author: 'bob@example.com',
	recipients: ['me@example.com'],
	ccList: [],
	bccList: [],
	date: new Date(2023, 5, 15, 10, 30),
	read: true,
	junk: false,
	junkScore: 0,
	flagged: false,
	tags: [],
	folder: { name: 'Inbox' },
	...overrides,
});

const noopContext = { activeContact: null, selfMessagesMode: 'none', allIdentities: [] };

describe('analyzeMessage', () => {
	it('classifies a message from a non-identity author as received', () => {
		const data = createStatsData();
		const type = analyzeMessage(data, baseMessage(), ['me@example.com'], noopContext);
		expect(type).toBe('received');
		expect(data.numbers.received).toBe(1);
		expect(data.numbers.sent).toBe(0);
		expect(data.contacts.received['bob@example.com']).toBe(1);
	});

	it('classifies a message from an identity author as sent', () => {
		const data = createStatsData();
		const message = baseMessage({ author: 'me@example.com', recipients: ['alice@example.com'] });
		const type = analyzeMessage(data, message, ['me@example.com'], noopContext);
		expect(type).toBe('sent');
		expect(data.numbers.sent).toBe(1);
		expect(data.contacts.sent['alice@example.com']).toBe(1);
	});

	it('skips a message that does not involve the active contact filter', () => {
		const data = createStatsData();
		const context = { ...noopContext, activeContact: 'someone-else@example.com' };
		const type = analyzeMessage(data, baseMessage(), ['me@example.com'], context);
		expect(type).toBeUndefined();
		expect(data.numbers.total).toBe(0);
	});

	it('processes a message that does involve the active contact filter', () => {
		const data = createStatsData();
		const context = { ...noopContext, activeContact: 'bob@example.com' };
		const type = analyzeMessage(data, baseMessage(), ['me@example.com'], context);
		expect(type).toBe('received');
		expect(data.numbers.total).toBe(1);
	});

	it('excludes a self message relative to the account identity list when selfMessagesMode is "sameAccount"', () => {
		const data = createStatsData();
		const message = baseMessage({ author: 'me@example.com', recipients: ['me@example.com'] });
		const context = {
			activeContact: null,
			selfMessagesMode: 'sameAccount',
			allIdentities: ['someone-else@example.com'],
		};
		const type = analyzeMessage(data, message, ['me@example.com'], context);
		expect(type).toBeUndefined();
		expect(data.numbers.total).toBe(0);
	});

	it('excludes a self message relative to allIdentities when selfMessagesMode is not "sameAccount"', () => {
		const data = createStatsData();
		const message = baseMessage({ author: 'me@example.com', recipients: ['other-account@example.com'] });
		const context = {
			activeContact: null,
			selfMessagesMode: 'all',
			allIdentities: ['me@example.com', 'other-account@example.com'],
		};
		const type = analyzeMessage(data, message, ['me@example.com'], context);
		expect(type).toBeUndefined();
	});

	it('does not exclude self messages when selfMessagesMode is "none"', () => {
		const data = createStatsData();
		const message = baseMessage({ author: 'me@example.com', recipients: ['me@example.com'] });
		const type = analyzeMessage(data, message, ['me@example.com'], noopContext);
		expect(type).toBe('sent');
	});

	it('counts unread, junk, starred and tagged messages', () => {
		const data = createStatsData();
		const message = baseMessage({ read: false, junk: true, junkScore: 80, flagged: true, tags: ['important'] });
		analyzeMessage(data, message, ['me@example.com'], noopContext);
		expect(data.numbers.unread).toBe(1);
		expect(data.numbers.junk).toBe(1);
		expect(data.numbers.junkScore).toBe(80);
		expect(data.numbers.starred).toBe(1);
		expect(data.numbers.tagged).toBe(1);
		expect(data.tags.important).toBe(1);
		expect(data.contacts.junk['bob@example.com']).toBe(1);
	});

	it('counts folders per message', () => {
		const data = createStatsData();
		analyzeMessage(data, baseMessage({ folder: { name: 'Archive' } }), ['me@example.com'], noopContext);
		expect(data.folders.received.Archive).toBe(1);
	});

	it('buckets dateData by local calendar day, not the UTC-shifted day (timezone bug regression)', () => {
		const data = createStatsData();
		// midnight local time - a UTC-based key would roll this back a day in any
		// timezone ahead of UTC, splitting a single local day across two buckets
		analyzeMessage(data, baseMessage({ date: new Date(2023, 5, 15, 0, 0, 0) }), ['me@example.com'], noopContext);
		expect(data.dateData.received['2023-06-15']).toBe(1);
	});

	it('buckets a Jan-1 date with ISO week 53 into the previous year (week-boundary edge case)', () => {
		const data = createStatsData();
		// Jan 1, 2010 has ISO week number 53 and belongs to week 53 of 2009
		analyzeMessage(data, baseMessage({ date: new Date(2010, 0, 1) }), ['me@example.com'], noopContext);
		expect(data.weeksData.received[2009]).toEqual({ 53: 1 });
	});

	it('assigns quarters correctly across the Mar/Apr boundary', () => {
		const data = createStatsData();
		analyzeMessage(data, baseMessage({ date: new Date(2023, 2, 31) }), ['me@example.com'], noopContext);
		analyzeMessage(data, baseMessage({ date: new Date(2023, 3, 1) }), ['me@example.com'], noopContext);
		expect(data.quartersData.received[2023]).toEqual({ 1: 1, 2: 1 });
	});

	it('tracks the earliest message date across repeated calls', () => {
		const data = createStatsData();
		analyzeMessage(data, baseMessage({ date: new Date(2023, 5, 15) }), ['me@example.com'], noopContext);
		analyzeMessage(data, baseMessage({ date: new Date(2020, 0, 1) }), ['me@example.com'], noopContext);
		expect(data.meta.start.getTime()).toBe(new Date(2020, 0, 1).getTime());
	});
});

describe('sumAccountsData', () => {
	const accountA = () => ({
		...createStatsData(),
		numbers: { total: 10, unread: 2, received: 6, sent: 4, starred: 1, tagged: 2, junk: 1, junkScore: 20 },
		meta: { timestamp: 1000, start: 100, end: 200 },
		yearsData: { received: { 2023: 5 }, sent: { 2023: 3 } },
		contacts: { received: { alice: 3 }, sent: {}, junk: {} },
		tags: { work: 2 },
		folders: { received: { Inbox: 5 }, sent: {} },
	});
	const accountB = () => ({
		...createStatsData(),
		numbers: { total: 5, unread: 1, received: 3, sent: 2, starred: 0, tagged: 0, junk: 0, junkScore: 10 },
		meta: { timestamp: 2000, start: 50, end: 300 },
		yearsData: { received: { 2024: 2 }, sent: {} },
		contacts: { received: { bob: 1 }, sent: {}, junk: {} },
		tags: {},
		folders: { received: { Inbox: 1 }, sent: {} },
	});

	it('sums numeric counters across accounts', () => {
		const sum = sumAccountsData([accountA(), accountB()], 20);
		expect(sum.numbers.total).toBe(15);
		expect(sum.numbers.received).toBe(9);
		expect(sum.numbers.sent).toBe(6);
		expect(sum.numbers.starred).toBe(1);
	});

	it('averages junkScore rather than summing it', () => {
		const sum = sumAccountsData([accountA(), accountB()], 20);
		expect(sum.numbers.junkScore).toBe((20 + 10) / 2);
	});

	it('takes the minimum of per-account timestamps', () => {
		const sum = sumAccountsData([accountA(), accountB()], 20);
		expect(sum.meta.timestamp).toBe(1000);
	});

	it('unions keys across accounts with disjoint years', () => {
		const sum = sumAccountsData([accountA(), accountB()], 20);
		expect(sum.yearsData.received).toEqual({ 2023: 5, 2024: 2 });
		expect(sum.yearsData.sent).toEqual({ 2023: 3 });
	});

	it('merges, sorts and limits contacts/tags/folders', () => {
		const sum = sumAccountsData([accountA(), accountB()], 20);
		expect(sum.contacts.received).toEqual({ alice: 3, bob: 1 });
		expect(sum.tags).toEqual({ work: 2 });
		expect(sum.folders.received).toEqual({ Inbox: 6 });
	});

	it('does not throw for a single-account array', () => {
		expect(() => sumAccountsData([accountA()], 20)).not.toThrow();
	});
});

describe('buildComparisonData', () => {
	it('creates one entry per active account, merging received and sent', () => {
		const accountsData = [
			{
				...createStatsData(),
				yearsData: { received: { 2023: 5 }, sent: { 2023: 2 } },
				quartersData: { received: { 2023: { 1: 5 } }, sent: { 2023: { 1: 2 } } },
				monthsData: { received: { 2023: { 5: 5 } }, sent: { 2023: { 5: 2 } } },
				weeksData: { received: { 2023: { 20: 5 } }, sent: { 2023: { 20: 2 } } },
				daytimeData: { received: { 10: 5 }, sent: { 10: 2 } },
				weekdayData: { received: { 1: 5 }, sent: { 1: 2 } },
				monthData: { received: { 5: 5 }, sent: { 5: 2 } },
			},
		];
		const activeAccounts = [{ id: 'acct1' }];
		const result = buildComparisonData(accountsData, activeAccounts);
		expect(result.yearsData.acct1).toEqual({ 2023: 7 });
		expect(result.quartersData.acct1).toEqual({ 2023: { 1: 7 } });
		expect(result.daytimeData.acct1).toEqual({ 10: 7 });
	});

	it('starts from the createComparisonData shape for an empty account list', () => {
		expect(buildComparisonData([], [])).toEqual(createComparisonData());
	});
});
