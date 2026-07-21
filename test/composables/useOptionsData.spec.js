import { describe, expect, it, vi } from 'vitest';
import { useOptionsData } from '@/composables/useOptionsData.js';
import { defaultOptions } from '@/definitions.js';

// the composable's internal deep watch on `options` fires (asynchronously, via Vue's
// reactivity flush) on every mutation made below and calls messenger.storage.local.set()
// plus setTheme(..., document.body, ...) - stub both globally for the whole file so the
// watcher's side effects don't throw, regardless of exactly when its microtask fires
// relative to a given test's completion
const fakeElement = () => ({ classList: { add: () => {}, remove: () => {}, contains: () => false } });
vi.stubGlobal('messenger', {
	storage: { local: { set: vi.fn() } },
	// only needed by resetOptions -> getAccounts
	runtime: { getBackgroundPage: async () => ({ messenger: { accounts: { list: async () => [] } } }) },
});
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
