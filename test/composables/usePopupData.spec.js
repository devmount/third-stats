import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildAccountSparkline, usePopupData } from '@/composables/usePopupData.js';
import { defaultOptions } from '@/definitions.js';
import { statsCacheKey } from '@/utils.js';
import { createMockMessenger } from '../helpers/messenger.js';

afterEach(() => {
	vi.useRealTimers();
});

describe('buildAccountSparkline', () => {
	it('builds a single label/data point for a single-year range', () => {
		const accountData = {
			yearsData: { received: { 2023: 5 }, sent: { 2023: 2 } },
			meta: { start: new Date(2023, 0, 1), end: new Date(2023, 11, 31) },
		};
		const result = buildAccountSparkline(accountData, false);
		expect(result.labels).toEqual([2023]);
		expect(result.datasets[0].data).toEqual([7]);
	});

	it('uses only the received count for a year with no sent messages', () => {
		const accountData = {
			yearsData: { received: { 2023: 5 }, sent: {} },
			meta: { start: new Date(2023, 0, 1), end: new Date(2023, 11, 31) },
		};
		const result = buildAccountSparkline(accountData, false);
		expect(result.datasets[0].data).toEqual([5]);
	});

	it('uses only the sent count for a year with no received messages', () => {
		const accountData = {
			yearsData: { received: {}, sent: { 2023: 3 } },
			meta: { start: new Date(2023, 0, 1), end: new Date(2023, 11, 31) },
		};
		const result = buildAccountSparkline(accountData, false);
		expect(result.datasets[0].data).toEqual([3]);
	});

	it('fills a gap year with 0 rather than skipping it', () => {
		const accountData = {
			yearsData: { received: { 2021: 4 }, sent: { 2023: 2 } },
			meta: { start: new Date(2021, 0, 1), end: new Date(2023, 11, 31) },
		};
		const result = buildAccountSparkline(accountData, false);
		expect(result.labels).toEqual([2021, 2022, 2023]);
		expect(result.datasets[0].data).toEqual([4, 0, 2]);
	});

	it('uses the current year as the range end when meta.end is not set', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2024, 5, 15));
		const accountData = {
			yearsData: { received: { 2023: 1 }, sent: {} },
			meta: { start: new Date(2023, 0, 1), end: null },
		};
		const result = buildAccountSparkline(accountData, false);
		expect(result.labels).toEqual([2023, 2024]);
	});

	it('picks the dark or light borderColor based on the dark flag', () => {
		const accountData = {
			yearsData: { received: { 2023: 1 }, sent: {} },
			meta: { start: new Date(2023, 0, 1), end: new Date(2023, 11, 31) },
		};
		expect(buildAccountSparkline(accountData, true).datasets[0].borderColor).toBe('#f9f9fa15');
		expect(buildAccountSparkline(accountData, false).datasets[0].borderColor).toBe('#1d1d1f15');
	});
});

describe('usePopupData', () => {
	const fakeElement = () => ({ classList: { add: () => {}, remove: () => {}, contains: () => false } });

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('keeps the built-in defaults when no options have been stored yet', async () => {
		vi.stubGlobal('messenger', createMockMessenger());
		vi.stubGlobal('document', { body: fakeElement() });

		const { options, accounts, loading, init } = usePopupData();
		await init();

		expect(options.dark).toBe(true);
		expect(options.cache).toBe(defaultOptions.cache);
		expect(options.accounts).toEqual(defaultOptions.accounts);
		expect(accounts.value).toEqual([]);
		expect(loading.value).toBe(false);
	});

	it('applies the stored theme via setTheme and reflects it in options.dark', async () => {
		const messenger = createMockMessenger();
		await messenger.storage.local.set({ options: { theme: 'light' } });
		vi.stubGlobal('messenger', messenger);
		vi.stubGlobal('document', { body: fakeElement() });

		const { options, init } = usePopupData();
		await init();

		expect(options.dark).toBe(false);
	});

	it('adds folderCount, messageCount and a sparkline for a cached account when caching is enabled', async () => {
		const account = { id: 'acc-1', name: 'Account 1', rootFolder: { id: 'root-1' } };
		const tree = { isRoot: true, subFolders: [{ isRoot: false, path: '/Inbox', subFolders: [] }] };
		const cachedData = {
			numbers: { total: 42 },
			yearsData: { received: { 2023: 10 }, sent: { 2023: 5 } },
			meta: { start: new Date(2023, 0, 1), end: new Date(2023, 11, 31) },
		};
		const messenger = createMockMessenger({
			accounts: { list: vi.fn(async () => [account]) },
			folders: { get: vi.fn(async () => tree) },
		});
		await messenger.storage.local.set({ options: { theme: 'dark', cache: true } });
		await messenger.storage.local.set({ [statsCacheKey(account.id)]: cachedData });
		vi.stubGlobal('messenger', messenger);
		vi.stubGlobal('document', { body: fakeElement() });

		const { accounts, init } = usePopupData();
		await init();

		expect(accounts.value).toHaveLength(1);
		expect(accounts.value[0].folderCount).toBe(1);
		expect(accounts.value[0].messageCount).toBe(42);
		expect(accounts.value[0].yearsData.labels).toEqual([2023]);
	});

	it('does not add messageCount/yearsData when caching is disabled', async () => {
		const account = { id: 'acc-1', name: 'Account 1', rootFolder: { id: 'root-1' } };
		const messenger = createMockMessenger({ accounts: { list: vi.fn(async () => [account]) } });
		await messenger.storage.local.set({ options: { theme: 'dark', cache: false } });
		vi.stubGlobal('messenger', messenger);
		vi.stubGlobal('document', { body: fakeElement() });

		const { accounts, init } = usePopupData();
		await init();

		expect(accounts.value[0].folderCount).toBe(0);
		expect(accounts.value[0]).not.toHaveProperty('messageCount');
	});

	it('filters accounts down to the configured subset', async () => {
		const accountA = { id: 'a', name: 'A', rootFolder: { id: 'root-a' } };
		const accountB = { id: 'b', name: 'B', rootFolder: { id: 'root-b' } };
		const messenger = createMockMessenger({ accounts: { list: vi.fn(async () => [accountA, accountB]) } });
		await messenger.storage.local.set({ options: { theme: 'dark', accounts: ['a'] } });
		vi.stubGlobal('messenger', messenger);
		vi.stubGlobal('document', { body: fakeElement() });

		const { accounts, init } = usePopupData();
		await init();

		expect(accounts.value.map((a) => a.id)).toEqual(['a']);
	});
});
