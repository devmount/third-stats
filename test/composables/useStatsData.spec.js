import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

// useStatsData() calls useI18n() unconditionally - fake it so the composable can be
// instantiated outside of a mounted Vue component/app context
vi.mock('vue-i18n', () => ({
	useI18n: () => ({ t: (key) => key }),
}));

import { useStatsData } from '@/composables/useStatsData.js';
import { defaultOptions } from '@/definitions.js';
import { PAGE_PROCESSING_STORAGE_KEY, PROCESSING_STORAGE_KEY } from '@/engines/statsEngine.js';
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
	for (let i = 0; i < 40; i++) {
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

describe('useStatsData - live stats cache sync', () => {
	const setupSingleAccount = (messages) => {
		const list = vi.fn(async () => ({ id: null, messages }));
		const messenger = setupMessenger({
			folders: { get: vi.fn(async () => ({ isRoot: true, subFolders: [inboxFolder] })) },
			messages: { list },
		});
		return { messenger, list };
	};

	it('reacts to a background-written stats-<id> cache update by reloading from cache, not refetching', async () => {
		const { messenger, list } = setupSingleAccount([makeMessage()]);
		await messenger.storage.local.set({ options: { ...baseOptions, cache: true } });
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();
		const callsBefore = list.mock.calls.length;

		await messenger.storage.local.set({
			[statsCacheKey(fakeAccount.id)]: {
				numbers: { total: 42 },
				meta: { start: new Date(2021, 0, 1), end: new Date(2021, 0, 2) },
			},
		});
		await flushPending();

		expect(engine.display.value.numbers.total).toBe(42);
		expect(list.mock.calls.length).toBe(callsBefore); // cache re-read, not a refetch
	});

	it('ignores a background-written cache update while a filter is active', async () => {
		const { messenger } = setupSingleAccount([makeMessage()]);
		await messenger.storage.local.set({ options: { ...baseOptions, cache: true } });
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();
		engine.active.folder = inboxFolder;
		await flushPending();
		const totalBefore = engine.display.value.numbers.total;

		await messenger.storage.local.set({ [statsCacheKey(fakeAccount.id)]: { numbers: { total: 999 }, meta: {} } });
		await flushPending();

		expect(engine.display.value.numbers.total).toBe(totalBefore);
	});
});

describe('useStatsData - backgroundBusy', () => {
	it('picks up a background refresh already in flight when the page opens', async () => {
		const messenger = setupMessenger();
		await messenger.storage.local.set({ options: baseOptions });
		await messenger.storage.local.set({ [PROCESSING_STORAGE_KEY]: true });
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();

		expect(engine.backgroundBusy.value).toBe(true);
	});

	it('defaults to false when nothing has been stored yet', async () => {
		const messenger = setupMessenger();
		await messenger.storage.local.set({ options: baseOptions });
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();

		expect(engine.backgroundBusy.value).toBe(false);
	});

	it('reacts live to the background script setting and clearing the flag', async () => {
		const messenger = setupMessenger();
		await messenger.storage.local.set({ options: baseOptions });
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();

		await messenger.storage.local.set({ [PROCESSING_STORAGE_KEY]: true });
		expect(engine.backgroundBusy.value).toBe(true);

		await messenger.storage.local.set({ [PROCESSING_STORAGE_KEY]: false });
		expect(engine.backgroundBusy.value).toBe(false);
	});
});

describe('useStatsData - page processing flag', () => {
	it('writes PAGE_PROCESSING_STORAGE_KEY true while reprocessing and false once done, so the background script can also badge for page-driven activity', async () => {
		const list = vi.fn(async () => ({ id: null, messages: [makeMessage()] }));
		const messenger = setupMessenger({
			folders: { get: vi.fn(async () => ({ isRoot: true, subFolders: [inboxFolder] })) },
			messages: { list },
		});
		await messenger.storage.local.set({ options: baseOptions });
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();
		messenger.storage.local.set.mockClear();

		await engine.loadAccount(fakeAccount.id, true);

		const flagWrites = messenger.storage.local.set.mock.calls
			.map(([items]) => items[PAGE_PROCESSING_STORAGE_KEY])
			.filter((v) => v !== undefined);
		expect(flagWrites).toEqual([true, false]);
	});

	it('resets a leftover "true" flag at startup, in case a previous page closed mid-refresh', async () => {
		const messenger = setupMessenger();
		await messenger.storage.local.set({ options: baseOptions });
		await messenger.storage.local.set({ [PAGE_PROCESSING_STORAGE_KEY]: true });
		stubEnvironment(messenger);

		const engine = useStatsData();
		await engine.init();
		await flushPending();

		const { [PAGE_PROCESSING_STORAGE_KEY]: flag } = await messenger.storage.local.get(PAGE_PROCESSING_STORAGE_KEY);
		expect(flag).toBe(false);
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

	// regression test for bugs/381: with liveCountUp on, multiple uncached accounts are
	// reprocessed concurrently (Promise.all), so their onMessage hooks fire interleaved.
	// Before the fix, each hook wrote its own account-local numbers straight onto
	// display.value.numbers, so a smaller/later account's from-zero count could overwrite
	// a larger account's count, making the live total visibly jump backward.
	it('never lets the live count-up total decrease while summing multiple uncached accounts', async () => {
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
		// account A gets a single, immediately-resolved page of 4 messages and runs to
		// completion quickly. Account B's page is deliberately split in two: its first
		// message resolves right away, but its second message sits behind a manually-held
		// continueList() page that is only released once account A has already finished.
		// Under the old bug, that second onMessage call would overwrite the shared display
		// total with account B's own (lower) raw total, right after account A had already
		// pushed it higher - a visible backward jump. Message counts are chosen so the two
		// accounts' raw totals never coincide (4 vs 1 vs 2), so a decrease can't hide behind
		// two equal values the way it did with symmetric, lock-step message counts.
		const messagesA = Array.from({ length: 4 }, () =>
			makeMessage({ author: 'x@example.com', recipients: ['a@example.com'] })
		);
		const messagesB = Array.from({ length: 2 }, () =>
			makeMessage({ author: 'y@example.com', recipients: ['b@example.com'] })
		);

		let resolveContinueB;
		const continueBPage = new Promise((resolve) => {
			resolveContinueB = resolve;
		});

		const messenger = createMockMessenger({
			accounts: {
				list: vi.fn(async () => [accountA, accountB]),
				get: vi.fn(async (id) => (id === accountA.id ? accountA : accountB)),
			},
			folders: {
				get: vi.fn(async (rootId) => ({ isRoot: true, subFolders: [rootId === 'root-a' ? folderA : folderB] })),
			},
			messages: {
				list: vi.fn(async (folderId) =>
					folderId === 'folder-a' ? { id: null, messages: messagesA } : { id: 'more-b', messages: [messagesB[0]] }
				),
				continueList: vi.fn(async (pageId) => (pageId === 'more-b' ? continueBPage : { id: null, messages: [] })),
			},
		});
		await messenger.storage.local.set({ options: { ...baseOptions, cache: true, liveCountUp: true } });
		vi.stubGlobal('messenger', messenger);
		vi.stubGlobal('document', { body: fakeElement(), title: '' });
		vi.stubGlobal('window', { location: { search: '?s=sum' } });

		// live updates animate toward each new target over time (see animateNumbersTo) rather
		// than snapping to it - fake timers let this test advance that animation deterministically
		vi.useFakeTimers();
		const engine = useStatsData();
		// poll the raw value on every tick rather than watch()-ing it: Vue's reactive
		// system dedupes a watch callback whenever the same (mutated-in-place) numbers
		// object reference gets reassigned, or when the watched total happens to coincide
		// with its previous value - both of which can mask exactly the backward jump this
		// test is trying to catch. Reading the live value directly on every tick has no
		// such blind spot. Interleaving a fake-timer advance with nextTick lets both the
		// number animation and the underlying (microtask-driven) message processing progress.
		const history = [];
		const pollFor = async (ticks) => {
			for (let i = 0; i < ticks; i++) {
				await nextTick();
				await vi.advanceTimersByTimeAsync(40);
				history.push(engine.display.value.numbers.total);
			}
		};

		await engine.init();
		// let account A run all the way to completion (and its live update animation settle)
		// while account B is still stuck waiting on its held-back second page. Live updates
		// only forward every 3rd message (see reprocessData), so account A's 4th message
		// never hits a checkpoint on its own - its live contribution tops out at 3, and the
		// true total of 4 only shows up in the final sumAccountsData assignment once
		// everything is done
		await pollFor(40);
		expect(history).toContain(3); // sanity: account A's live checkpoint was visibly reached

		// now release account B's second message
		resolveContinueB({ id: null, messages: [messagesB[1]] });
		await pollFor(40);

		for (let i = 1; i < history.length; i++) {
			expect(history[i]).toBeGreaterThanOrEqual(history[i - 1]);
		}
		expect(engine.display.value.numbers.total).toBe(6);
	});

	// regression test: reprocessAccount() (statsEngine.js) writes each account's own
	// stats-<id> cache entry as soon as that account finishes, and addStorageListener
	// reacts to ANY such write - including this page's own - by re-running loadAccount('sum',
	// false) once isLoading is false. If that redundant reload's per-account cache reads
	// resolve one at a time (as they naturally do), the live total used to get rebuilt from
	// an empty accumulator and briefly show just the first resolved account's total -
	// undercutting the number already correctly on screen. updateLiveTotal()'s ratchet
	// (never assign a lower total than what's already displayed) guards against this.
	it('never lets a redundant reload triggered by its own cache writes undercut an already-shown total', async () => {
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
		await messenger.storage.local.set({ options: { ...baseOptions, cache: true, liveCountUp: true } });
		// the reentrant reload's own two cache reads (one per account) would otherwise both
		// resolve within the same tick in this synchronous mock, hiding the bug this test is
		// after - delay account B's specifically, so its read genuinely lands after account
		// A's, the way two real messenger.storage.local.get() IPC round-trips would stagger
		let delayAccountBRead = false;
		let resolveDelayedB;
		const delayedBRead = new Promise((resolve) => {
			resolveDelayedB = resolve;
		});
		const originalGet = messenger.storage.local.get;
		messenger.storage.local.get = vi.fn(async (keys) => {
			if (delayAccountBRead && keys === statsCacheKey(accountB.id)) await delayedBRead;
			return originalGet(keys);
		});
		vi.stubGlobal('messenger', messenger);
		vi.stubGlobal('document', { body: fakeElement(), title: '' });
		vi.stubGlobal('window', { location: { search: '?s=sum' } });

		const engine = useStatsData();
		await engine.init();
		await flushPending();
		expect(engine.display.value.numbers.total).toBe(2); // sanity: initial sum finished correctly

		const history = [];
		const pollFor = async (ticks) => {
			for (let i = 0; i < ticks; i++) {
				await nextTick();
				history.push(engine.display.value.numbers.total);
			}
		};

		// simulate a late-delivered storage.onChanged notification for this page's own
		// earlier write - e.g. a duplicate/delayed delivery of the cache write reprocessData
		// already made during the initial load above
		delayAccountBRead = true;
		const cached = await originalGet(statsCacheKey(accountA.id));
		await messenger.storage.local.set({ [statsCacheKey(accountA.id)]: cached[statsCacheKey(accountA.id)] });
		// let the reentrant reload pick up account A's (fast) read while B's is still held back
		await pollFor(20);

		// now release account B's read
		resolveDelayedB();
		await pollFor(20);

		for (let i = 1; i < history.length; i++) {
			expect(history[i]).toBeGreaterThanOrEqual(history[i - 1]);
		}
		expect(engine.display.value.numbers.total).toBe(2);
	});
});
