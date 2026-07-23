import { describe, expect, it, vi } from 'vitest';
import { useOptionsData } from '@/composables/useOptionsData.js';
import { defaultOptions } from '@/definitions.js';
import { createMockMessenger } from '../helpers/messenger.js';

// the composable's internal deep watch on `options` fires (asynchronously, via Vue's
// reactivity flush) on every mutation made below and calls messenger.storage.local.set()
// plus setTheme(..., document.body, ...) - stub both globally for the whole file so the
// watcher's side effects don't throw, regardless of exactly when its microtask fires
// relative to a given test's completion
const fakeElement = () => ({ classList: { add: () => {}, remove: () => {}, contains: () => false } });
vi.stubGlobal('messenger', createMockMessenger());
vi.stubGlobal('document', { body: fakeElement(), documentElement: fakeElement() });
vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });

describe('options initial state (defaultOptions aliasing regression)', () => {
	it('is not the same object reference as the shared defaultOptions singleton', () => {
		const { options } = useOptionsData();
		expect(options.value).not.toBe(defaultOptions);
	});

	it('mutating options does not mutate the shared defaultOptions singleton', () => {
		const { options } = useOptionsData();
		options.value.theme = 'dark';
		options.value.accountColors.abc = '#123456';
		expect(defaultOptions.theme).toBe('system');
		expect(defaultOptions.accountColors).toEqual({});
	});

	it('resetOptions() re-clones defaultOptions rather than re-aliasing it', async () => {
		const { options, resetOptions } = useOptionsData();
		options.value.theme = 'dark';
		await resetOptions();
		expect(options.value).not.toBe(defaultOptions);
		options.value.debug = true;
		expect(defaultOptions.debug).toBe(false);
	});
});

describe('addAddress / removeAddress (no redundant partial storage write)', () => {
	it('addAddress appends the given address and clears the input', () => {
		const { input, options, addAddress, addressList } = useOptionsData();
		options.value.addresses = '';
		input.value.address = 'a@example.com';
		addAddress();
		expect(options.value.addresses).toBe('a@example.com');
		expect(addressList.value).toEqual(['a@example.com']);
		expect(input.value.address).toBe('');
	});

	it('addAddress appends to existing addresses with a comma separator', () => {
		const { input, options, addAddress } = useOptionsData();
		options.value.addresses = 'a@example.com';
		input.value.address = 'b@example.com';
		addAddress();
		expect(options.value.addresses).toBe('a@example.com,b@example.com');
	});

	it('removeAddress removes only the given address and normalizes separators', () => {
		const { options, removeAddress, addressList } = useOptionsData();
		options.value.addresses = 'a@example.com,b@example.com,c@example.com';
		removeAddress('b@example.com');
		expect(addressList.value).toEqual(['a@example.com', 'c@example.com']);
	});
});

describe('addressList', () => {
	it('is empty when addresses is unset', () => {
		const { options, addressList } = useOptionsData();
		options.value.addresses = '';
		expect(addressList.value).toEqual([]);
	});

	it('is a single-element array for one address', () => {
		const { options, addressList } = useOptionsData();
		options.value.addresses = 'a@example.com';
		expect(addressList.value).toEqual(['a@example.com']);
	});

	it('splits a comma-joined list of addresses', () => {
		const { options, addressList } = useOptionsData();
		options.value.addresses = 'a@example.com,b@example.com,c@example.com';
		expect(addressList.value).toEqual(['a@example.com', 'b@example.com', 'c@example.com']);
	});
});

describe('autoRefreshInterval increment/decrement/check', () => {
	it('increments without an upper limit', () => {
		const { options, incrementAutoRefreshInterval } = useOptionsData();
		options.value.autoRefreshInterval = 999;
		incrementAutoRefreshInterval();
		expect(options.value.autoRefreshInterval).toBe(1000);
	});

	it('decrements down to but not below the 5-minute floor', () => {
		const { options, decrementAutoRefreshInterval } = useOptionsData();
		options.value.autoRefreshInterval = 6;
		decrementAutoRefreshInterval();
		expect(options.value.autoRefreshInterval).toBe(5);
		decrementAutoRefreshInterval();
		expect(options.value.autoRefreshInterval).toBe(5);
	});

	it('clamps a sub-5 value up to 5, leaves a valid value untouched', () => {
		const { options, checkAutoRefreshInterval } = useOptionsData();
		options.value.autoRefreshInterval = 2;
		checkAutoRefreshInterval();
		expect(options.value.autoRefreshInterval).toBe(5);
		options.value.autoRefreshInterval = 30;
		checkAutoRefreshInterval();
		expect(options.value.autoRefreshInterval).toBe(30);
	});
});

describe('maxListCount increment/decrement/check', () => {
	it('increments up to but not above 999', () => {
		const { options, incrementmaxListCount } = useOptionsData();
		options.value.maxListCount = 999;
		incrementmaxListCount();
		expect(options.value.maxListCount).toBe(999);
		options.value.maxListCount = 998;
		incrementmaxListCount();
		expect(options.value.maxListCount).toBe(999);
	});

	it('decrements down to but not below 1', () => {
		const { options, decrementmaxListCount } = useOptionsData();
		options.value.maxListCount = 1;
		decrementmaxListCount();
		expect(options.value.maxListCount).toBe(1);
		options.value.maxListCount = 2;
		decrementmaxListCount();
		expect(options.value.maxListCount).toBe(1);
	});

	it('clamps out-of-range values into [1, 999], leaves valid values untouched', () => {
		const { options, checkmaxListCount } = useOptionsData();
		options.value.maxListCount = 0;
		checkmaxListCount();
		expect(options.value.maxListCount).toBe(1);
		options.value.maxListCount = 1000;
		checkmaxListCount();
		expect(options.value.maxListCount).toBe(999);
		options.value.maxListCount = 20;
		checkmaxListCount();
		expect(options.value.maxListCount).toBe(20);
	});
});

describe('getSettings', () => {
	it('merges stored options over the defaults and applies the theme', async () => {
		const messenger = createMockMessenger();
		await messenger.storage.local.set({ options: { theme: 'dark', debug: true } });
		vi.stubGlobal('messenger', messenger);

		const { options, getSettings } = useOptionsData();
		await getSettings();

		expect(options.value.theme).toBe('dark');
		expect(options.value.debug).toBe(true);
		// untouched fields keep their default value - this is a merge, not a replace
		expect(options.value.maxListCount).toBe(defaultOptions.maxListCount);
	});

	it('keeps the built-in defaults when nothing has been stored yet', async () => {
		vi.stubGlobal('messenger', createMockMessenger());

		const { options, getSettings } = useOptionsData();
		await getSettings();

		expect(options.value).toEqual(defaultOptions);
	});
});

describe('getAccounts', () => {
	it('defaults options.accounts to all account ids when none are configured yet', async () => {
		const accountA = { id: 'a', name: 'A' };
		const accountB = { id: 'b', name: 'B' };
		vi.stubGlobal(
			'messenger',
			createMockMessenger({
				runtime: {
					getBackgroundPage: vi.fn(async () => ({
						messenger: { accounts: { list: vi.fn(async () => [accountA, accountB]) } },
					})),
				},
			})
		);

		const { options, allAccounts, getAccounts } = useOptionsData();
		options.value.accounts = [];
		await getAccounts();

		expect(allAccounts.value).toEqual([accountA, accountB]);
		expect(options.value.accounts).toEqual(['a', 'b']);
	});

	it('leaves an already-configured accounts selection untouched', async () => {
		const accountA = { id: 'a', name: 'A' };
		vi.stubGlobal(
			'messenger',
			createMockMessenger({
				runtime: {
					getBackgroundPage: vi.fn(async () => ({ messenger: { accounts: { list: vi.fn(async () => [accountA]) } } })),
				},
			})
		);

		const { options, getAccounts } = useOptionsData();
		options.value.accounts = ['already-configured'];
		await getAccounts();

		expect(options.value.accounts).toEqual(['already-configured']);
	});

	it('assigns a default color only to accounts that do not already have one', async () => {
		const accountA = { id: 'a', name: 'A' };
		const accountB = { id: 'b', name: 'B' };
		vi.stubGlobal(
			'messenger',
			createMockMessenger({
				runtime: {
					getBackgroundPage: vi.fn(async () => ({
						messenger: { accounts: { list: vi.fn(async () => [accountA, accountB]) } },
					})),
				},
			})
		);

		const { options, getAccounts } = useOptionsData();
		options.value.accountColors = { a: '#custom' };
		await getAccounts();

		expect(options.value.accountColors.a).toBe('#custom');
		expect(options.value.accountColors.b).toBeDefined();
		expect(options.value.accountColors.b).not.toBe('#custom');
	});
});

describe('getCacheSize', () => {
	it('computes cache size as the byte difference between total storage and the options entry', async () => {
		const messenger = createMockMessenger();
		await messenger.storage.local.set({ options: { a: 1 } });
		await messenger.storage.local.set({ extra: { b: 2 } });
		vi.stubGlobal('messenger', messenger);

		const { cacheSize, getCacheSize } = useOptionsData();
		await getCacheSize();

		// the "options" entry is a common prefix of both encoded strings, so the
		// difference is exactly the byte length of the "extra" entry alone
		const expected = new TextEncoder().encode('extra{"b":2}').length;
		expect(cacheSize.value).toBe(expected);
	});
});

describe('clearCache', () => {
	it('wipes storage except for a freshly persisted options snapshot', async () => {
		const messenger = createMockMessenger();
		await messenger.storage.local.set({ options: { theme: 'dark' } });
		await messenger.storage.local.set({ 'stats-acct1': { numbers: { total: 5 } } });
		vi.stubGlobal('messenger', messenger);

		const { options, cacheSize, clearCache } = useOptionsData();
		options.value.theme = 'dark';
		await clearCache();

		const remaining = await messenger.storage.local.get();
		expect(Object.keys(remaining)).toEqual(['options']);
		expect(remaining.options).toEqual(options.value);
		// only the just-restored options entry is left, so recomputed cache size is 0
		expect(cacheSize.value).toBe(0);
	});
});

describe('ownOptionsPage', () => {
	it('is true when the options page was opened with the "s" URL parameter', () => {
		vi.stubGlobal('window', { matchMedia: () => ({ matches: false }), location: { search: '?s=abc' } });
		const { ownOptionsPage } = useOptionsData();
		expect(ownOptionsPage.value).toBe(true);
	});

	it('is false without the "s" URL parameter', () => {
		vi.stubGlobal('window', { matchMedia: () => ({ matches: false }), location: { search: '' } });
		const { ownOptionsPage } = useOptionsData();
		expect(ownOptionsPage.value).toBe(false);
	});
});

describe('init', () => {
	it('bootstraps settings, accounts and cache size in one call', async () => {
		const account = { id: 'a', name: 'A' };
		const messenger = createMockMessenger({
			runtime: {
				getBackgroundPage: vi.fn(async () => ({ messenger: { accounts: { list: vi.fn(async () => [account]) } } })),
			},
		});
		await messenger.storage.local.set({ options: { theme: 'dark' } });
		vi.stubGlobal('messenger', messenger);
		vi.stubGlobal('window', { matchMedia: () => ({ matches: false }), location: { search: '' } });

		const { options, allAccounts, cacheSize, init } = useOptionsData();
		await init();
		// getAccounts()/getCacheSize() are deliberately not awaited by init() itself -
		// give their microtask chains a moment to settle before asserting
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(options.value.theme).toBe('dark');
		expect(allAccounts.value).toEqual([account]);
		expect(cacheSize.value).toBeGreaterThanOrEqual(0);
	});
});
