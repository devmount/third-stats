import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

// useStatsData() calls useI18n() unconditionally - fake it so the composable can be
// instantiated outside of a mounted Vue component/app context
vi.mock('vue-i18n', () => ({
	useI18n: () => ({ t: (key) => key }),
}));

import { useStatsData } from '@/composables/useStatsData.js';
import { defaultOptions } from '@/definitions.js';
import { statsCacheKey } from '@/utils.js';
import { createMockMessenger } from '../helpers/messenger.js';

const fakeElement = () => ({ classList: { add: () => {}, remove: () => {}, contains: () => false } });

const fakeAccount = {
	id: 'acc-1',
	name: 'Account 1',
	type: 'imap',
	identities: [{ email: 'me@example.com' }],
	rootFolder: { id: 'root-1' },
};

// a full, explicit options object - autoRefresh/cache are kept off so init() neither
// schedules a real setInterval nor drives the active.account watcher into extra storage
// round-trips beyond what's asserted on
const baseOptions = {
	...defaultOptions,
	theme: 'dark',
	autoRefresh: false,
	cache: false,
};

const setupMessenger = (overrides = {}) =>
	createMockMessenger({
		accounts: {
			list: vi.fn(async () => [fakeAccount]),
			get: vi.fn(async () => fakeAccount),
		},
		...overrides,
	});

const stubEnvironment = (messenger, body = fakeElement()) => {
	vi.stubGlobal('messenger', messenger);
	vi.stubGlobal('document', { body, title: '' });
	vi.stubGlobal('window', { location: { search: '' } });
	return body;
};

// shared, minimal non-root folder used across the account-processing tests below
const inboxFolder = {
	id: 'folder-1',
	name: 'Inbox',
	path: '/Inbox',
	isRoot: false,
	isUnified: false,
	isVirtual: false,
	subFolders: [],
};

const makeMessage = (overrides) => ({
	author: 'other@example.com',
	recipients: ['me@example.com'],
	ccList: [],
	bccList: [],
	date: new Date(2023, 5, 15),
	read: true,
	junk: false,
	junkScore: 0,
	flagged: false,
	tags: [],
	folder: { name: 'Inbox' },
	...overrides,
});

// init() sets active.account, which arms the `watch(() => active.account, ...)` handler -
// that handler calls loadAccount() itself, *without* init() awaiting it. A single
// nextTick() only flushes Vue's own reactivity queue, not the (much longer) chain of
// sequential awaits inside that background loadAccount() call, so tests that depend on
// its result (or that must not leak an in-flight messenger call past their own teardown)
// need many microtask turns, not just one.
const flushPending = async () => {
	for (let i = 0; i < 20; i++) {
		await nextTick();
	}
};

afterEach(() => {
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

describe('useStatsData - options loading', () => {
	it('loads stored options and applies the theme via setTheme onto document.body', async () => {
		const messenger = setupMessenger();
		await messenger.storage.local.set({ options: baseOptions });
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();

		expect(engine.options.dark).toBe(true);
		expect(engine.options.ordinate).toBe(baseOptions.ordinate);
		expect(engine.options.maxListCount).toBe(baseOptions.maxListCount);
	});

	it('falls back to defaultOptions fields when nothing has been stored yet', async () => {
		const messenger = setupMessenger();
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();

		expect(engine.options.maxListCount).toBe(defaultOptions.maxListCount);
		expect(engine.options.selfMessages).toBe(defaultOptions.selfMessages);
	});
});

describe('useStatsData - live storage.onChanged sync', () => {
	it('reacts to a live theme change, applying setTheme to document.body with the page marker class', async () => {
		const messenger = setupMessenger();
		await messenger.storage.local.set({ options: baseOptions });
		const body = stubEnvironment(messenger);
		const addedClasses = [];
		body.classList.add = (...classNames) => addedClasses.push(...classNames);

		const engine = useStatsData();
		await engine.init();
		await flushPending();

		// only care about what the live change itself triggers, not whatever init() already did
		addedClasses.length = 0;
		await messenger.storage.local.set({ options: { ...baseOptions, theme: 'light' } });

		expect(engine.options.dark).toBe(false);
		// this is the exact regression this suite guards against: setTheme must be called
		// against document.body with the page's own marker class ('stats-bg'), not just a
		// bare 'dark'/'light' pair on some other element - see useStatsData.js's
		// addStorageListener()
		expect(addedClasses).toContain('stats-bg');
		expect(addedClasses).toContain('light');
	});

	it('syncs individual option fields independently, leaving others untouched', async () => {
		const messenger = setupMessenger();
		await messenger.storage.local.set({ options: baseOptions });
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();

		await messenger.storage.local.set({ options: { ...baseOptions, ordinate: false, maxListCount: 5 } });

		expect(engine.options.ordinate).toBe(false);
		expect(engine.options.maxListCount).toBe(5);
		// theme wasn't part of this change, so dark must be unaffected
		expect(engine.options.dark).toBe(true);
	});

	it('syncs every remaining option field on a single combined change', async () => {
		const messenger = setupMessenger();
		await messenger.storage.local.set({ options: baseOptions });
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();

		await messenger.storage.local.set({
			options: {
				...baseOptions,
				tagColors: !baseOptions.tagColors,
				liveCountUp: !baseOptions.liveCountUp,
				autoRefresh: !baseOptions.autoRefresh,
				autoRefreshInterval: baseOptions.autoRefreshInterval + 1,
				startOfWeek: 1,
				addresses: 'Other@Example.com, Third@Example.com',
				accounts: ['acc-2'],
				accountColors: { 'acc-2': '#abcdef' },
				selfMessages: 'sameAccount',
				cache: !baseOptions.cache,
				debug: !baseOptions.debug,
			},
		});

		expect(engine.options.tagColors).toBe(!baseOptions.tagColors);
		expect(engine.options.liveCountUp).toBe(!baseOptions.liveCountUp);
		expect(engine.options.autoRefresh).toBe(!baseOptions.autoRefresh);
		expect(engine.options.autoRefreshInterval).toBe(baseOptions.autoRefreshInterval + 1);
		expect(engine.options.startOfWeek).toBe(1);
		expect(engine.options.addresses).toEqual(['other@example.com', 'third@example.com']);
		expect(engine.options.accounts).toEqual(['acc-2']);
		expect(engine.options.accountColors).toEqual({ 'acc-2': '#abcdef' });
		expect(engine.options.selfMessages).toBe('sameAccount');
		expect(engine.options.cache).toBe(!baseOptions.cache);
		expect(engine.options.debug).toBe(!baseOptions.debug);
	});

	it('ignores storage changes to keys other than "options"', async () => {
		const messenger = setupMessenger();
		await messenger.storage.local.set({ options: baseOptions });
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();

		await messenger.storage.local.set({ error: true });

		expect(engine.options.dark).toBe(true);
		expect(engine.options.ordinate).toBe(baseOptions.ordinate);
	});
});

describe('useStatsData - period helpers (no messenger involved)', () => {
	it('formatPeriod pads a 6-digit shorthand and inserts dashes', () => {
		vi.stubGlobal('messenger', setupMessenger());
		vi.stubGlobal('document', { body: fakeElement(), title: '' });
		vi.stubGlobal('window', { location: { search: '' } });
		const engine = useStatsData();

		engine.active.period.start = '230615';
		engine.formatPeriod('start');

		const centuryPrefix = String(new Date().getFullYear()).slice(0, 2);
		expect(engine.active.period.start).toBe(`${centuryPrefix}23-06-15`);
	});

	it('formatPeriod inserts dashes into an already-complete dashless date', () => {
		vi.stubGlobal('messenger', setupMessenger());
		vi.stubGlobal('document', { body: fakeElement(), title: '' });
		vi.stubGlobal('window', { location: { search: '' } });
		const engine = useStatsData();

		engine.active.period.end = '20230615';
		engine.formatPeriod('end');

		expect(engine.active.period.end).toBe('2023-06-15');
	});

	it('formatPeriod clamps a date before 1970 to the epoch', () => {
		vi.stubGlobal('messenger', setupMessenger());
		vi.stubGlobal('document', { body: fakeElement(), title: '' });
		vi.stubGlobal('window', { location: { search: '' } });
		const engine = useStatsData();

		engine.active.period.start = '1960-01-01';
		engine.formatPeriod('start');

		expect(engine.active.period.start).toBe('1970-01-01');
	});

	it('formatPeriod clamps a future date to today', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2024, 5, 15));
		vi.stubGlobal('messenger', setupMessenger());
		vi.stubGlobal('document', { body: fakeElement(), title: '' });
		vi.stubGlobal('window', { location: { search: '' } });
		const engine = useStatsData();

		engine.active.period.end = '2999-01-01';
		engine.formatPeriod('end');

		// matches the source's own clamp value (new Date().toISOString().slice(0, 10)),
		// which is UTC-based and so may differ from the local calendar date set above
		expect(engine.active.period.end).toBe(new Date().toISOString().slice(0, 10));
	});

	it('updatePeriod rejects an empty period without ever touching messenger', async () => {
		// deliberately no vi.stubGlobal('messenger', ...) - a call to messenger.* would throw
		// ReferenceError, proving the invalid-period path returns before reaching loadAccount
		vi.stubGlobal('document', { body: fakeElement(), title: '' });
		vi.stubGlobal('window', { location: { search: '' } });
		const engine = useStatsData();

		await engine.updatePeriod();

		expect(engine.error.period.start.length).toBeGreaterThan(0);
		expect(engine.error.period.end.length).toBeGreaterThan(0);
	});

	it('tooltipAccountComparison hints to configure accounts when fewer than 2 are active', () => {
		vi.stubGlobal('messenger', setupMessenger());
		vi.stubGlobal('document', { body: fakeElement(), title: '' });
		vi.stubGlobal('window', { location: { search: '' } });
		const engine = useStatsData();

		expect(engine.options.accounts.length).toBeLessThan(2);
		expect(engine.tooltipAccountComparison('total')).toBe('stats.tooltips.comparisonWhenAccountsOption');
	});

	it('accountsColorGradient only includes colors of the currently active accounts', () => {
		vi.stubGlobal('messenger', setupMessenger());
		vi.stubGlobal('document', { body: fakeElement(), title: '' });
		vi.stubGlobal('window', { location: { search: '' } });
		const engine = useStatsData();

		// order follows accountColors' own key order, not options.accounts' order
		engine.options.accountColors = { a: '#111111', b: '#222222', c: '#333333' };
		engine.options.accounts = ['b', 'a'];

		expect(engine.accountsColorGradient.value).toBe('#111111,#222222');
	});
});

describe('useStatsData - single account message processing', () => {
	const setupSingleAccount = (messages) => {
		const list = vi.fn(async () => ({ id: null, messages }));
		const messenger = setupMessenger({
			folders: { get: vi.fn(async () => ({ isRoot: true, subFolders: [inboxFolder] })) },
			messages: { list },
		});
		return { messenger, list };
	};

	it('aggregates numbers, tags and the earliest message date from real messages', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2024, 0, 15));

		const messages = [
			makeMessage({ author: 'other@example.com', date: new Date(2022, 5, 10), read: false }),
			makeMessage({ author: 'me@example.com', recipients: ['someone@example.com'], date: new Date(2023, 2, 5) }),
			makeMessage({
				author: 'spammer@example.com',
				date: new Date(2023, 8, 20),
				junk: true,
				junkScore: 50,
				flagged: true,
				tags: ['important'],
			}),
		];
		const { messenger } = setupSingleAccount(messages);
		await messenger.storage.local.set({ options: baseOptions });
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();

		expect(engine.display.value.numbers).toMatchObject({
			total: 3,
			received: 2,
			sent: 1,
			unread: 1,
			junk: 1,
			junkScore: 50,
			starred: 1,
			tagged: 1,
		});
		expect(engine.display.value.tags).toEqual({ important: 1 });
		expect(engine.minYear.value).toBe(2022);
		expect(engine.maxYear.value).toBe(2024);
		expect(engine.singleAccount.value).toBe(true);
	});

	it('resetContact(true) reloads the current account', async () => {
		const { messenger, list } = setupSingleAccount([makeMessage()]);
		await messenger.storage.local.set({ options: baseOptions });
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();
		const callsBefore = list.mock.calls.length;

		await engine.resetContact(true);
		await flushPending();

		expect(list.mock.calls.length).toBeGreaterThan(callsBefore);
	});

	it('updatePeriod() with a valid range reloads and stores the new period on display.meta', async () => {
		const { messenger } = setupSingleAccount([makeMessage()]);
		await messenger.storage.local.set({ options: baseOptions });
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();

		engine.active.period.start = '2023-01-01';
		engine.active.period.end = '2023-12-31';
		await engine.updatePeriod();
		await flushPending();

		expect(engine.error.period.start).toEqual([]);
		expect(engine.error.period.end).toEqual([]);
		expect(engine.display.value.meta.start).toEqual(new Date('2023-01-01'));
		expect(engine.display.value.meta.end).toEqual(new Date('2023-12-31'));
	});
});

describe('useStatsData - caching', () => {
	it('uses cached account data and skips reprocessing when refresh is not requested', async () => {
		const cachedData = { numbers: { total: 99 }, meta: { start: new Date(2020, 0, 1), end: new Date(2020, 0, 2) } };
		const list = vi.fn(async () => ({ id: null, messages: [] }));
		const messenger = setupMessenger({
			folders: { get: vi.fn(async () => ({ isRoot: true, subFolders: [inboxFolder] })) },
			messages: { list },
		});
		await messenger.storage.local.set({ options: { ...baseOptions, cache: true } });
		await messenger.storage.local.set({ [statsCacheKey(fakeAccount.id)]: cachedData });
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();

		expect(engine.display.value.numbers.total).toBe(99);
		expect(list).not.toHaveBeenCalled();
	});

	it('reprocesses when refresh is explicitly requested, overwriting the cached view', async () => {
		const cachedData = { numbers: { total: 99 }, meta: { start: new Date(2020, 0, 1), end: new Date(2020, 0, 2) } };
		const list = vi.fn(async () => ({ id: null, messages: [makeMessage()] }));
		const messenger = setupMessenger({
			folders: { get: vi.fn(async () => ({ isRoot: true, subFolders: [inboxFolder] })) },
			messages: { list },
		});
		await messenger.storage.local.set({ options: { ...baseOptions, cache: true } });
		await messenger.storage.local.set({ [statsCacheKey(fakeAccount.id)]: cachedData });
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();
		expect(engine.display.value.numbers.total).toBe(99); // sanity: cache was used on init

		await engine.loadAccount(fakeAccount.id, true);

		expect(list).toHaveBeenCalled();
		expect(engine.display.value.numbers.total).toBe(1);
	});
});

describe('useStatsData - summed view across accounts', () => {
	it('combines numbers and builds per-account comparison data for the "sum" view', async () => {
		const accountA = {
			id: 'acc-a',
			name: 'A',
			type: 'imap',
			identities: [{ email: 'a@example.com' }],
			rootFolder: { id: 'root-a' },
		};
		const accountB = {
			id: 'acc-b',
			name: 'B',
			type: 'imap',
			identities: [{ email: 'b@example.com' }],
			rootFolder: { id: 'root-b' },
		};
		const folderA = { ...inboxFolder, id: 'folder-a' };
		const folderB = { ...inboxFolder, id: 'folder-b' };
		const msgA = makeMessage({ author: 'x@example.com', recipients: ['a@example.com'] });
		const msgB = makeMessage({ author: 'y@example.com', recipients: ['b@example.com'] });

		const messenger = createMockMessenger({
			accounts: {
				list: vi.fn(async () => [accountA, accountB]),
				get: vi.fn(async (id) => (id === accountA.id ? accountA : accountB)),
			},
			folders: {
				get: vi.fn(async (rootId) => ({ isRoot: true, subFolders: [rootId === 'root-a' ? folderA : folderB] })),
			},
			messages: {
				list: vi.fn(async (folderId) => ({ id: null, messages: folderId === 'folder-a' ? [msgA] : [msgB] })),
			},
		});
		await messenger.storage.local.set({ options: { ...baseOptions, cache: true } });
		vi.stubGlobal('messenger', messenger);
		vi.stubGlobal('document', { body: fakeElement(), title: '' });
		vi.stubGlobal('window', { location: { search: '?s=sum' } });

		const engine = useStatsData();
		await engine.init();
		await flushPending();

		expect(engine.singleAccount.value).toBe(false);
		expect(engine.display.value.numbers.total).toBe(2);
		expect(engine.display.value.numbers.received).toBe(2);
		expect(engine.comparison.value.yearsData).toHaveProperty(accountA.id);
		expect(engine.comparison.value.yearsData).toHaveProperty(accountB.id);
	});
});
