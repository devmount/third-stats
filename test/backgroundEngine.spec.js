import { afterEach, describe, expect, it, vi } from 'vitest';
import { ALARM_NAME, initBackground, runScheduledRefresh, syncAlarm } from '@/backgroundEngine.js';
import { defaultOptions } from '@/definitions.js';
import { PROCESSING_STORAGE_KEY } from '@/statsEngine.js';
import { statsCacheKey } from '@/utils.js';
import { createMockMessenger } from './helpers/messenger.js';

const fakeAccount = {
	id: 'acc-1',
	name: 'Account 1',
	type: 'imap',
	identities: [{ email: 'me@example.com' }],
	rootFolder: { id: 'root-1' },
};

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

const setupMessenger = (overrides = {}) =>
	createMockMessenger({
		accounts: {
			list: vi.fn(async () => [fakeAccount]),
			get: vi.fn(async () => fakeAccount),
		},
		folders: { get: vi.fn(async () => ({ isRoot: true, subFolders: [inboxFolder] })) },
		messages: { list: vi.fn(async () => ({ id: null, messages: [makeMessage()] })) },
		...overrides,
	});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('syncAlarm', () => {
	it('clears then creates the alarm with the configured interval when autoRefresh is enabled', async () => {
		const messenger = setupMessenger();
		vi.stubGlobal('messenger', messenger);
		await messenger.storage.local.set({ options: { ...defaultOptions, autoRefresh: true, autoRefreshInterval: 45 } });

		await syncAlarm();

		expect(messenger.alarms.clear).toHaveBeenCalledWith(ALARM_NAME);
		expect(messenger.alarms.create).toHaveBeenCalledWith(ALARM_NAME, { periodInMinutes: 45 });
	});

	it('only clears, never creates, when autoRefresh is disabled', async () => {
		const messenger = setupMessenger();
		vi.stubGlobal('messenger', messenger);
		await messenger.storage.local.set({ options: { ...defaultOptions, autoRefresh: false } });

		await syncAlarm();

		expect(messenger.alarms.clear).toHaveBeenCalledWith(ALARM_NAME);
		expect(messenger.alarms.create).not.toHaveBeenCalled();
	});

	it('falls back to defaultOptions when nothing has been stored yet', async () => {
		const messenger = setupMessenger();
		vi.stubGlobal('messenger', messenger);

		await syncAlarm();

		if (defaultOptions.autoRefresh) {
			expect(messenger.alarms.create).toHaveBeenCalledWith(ALARM_NAME, {
				periodInMinutes: Number(defaultOptions.autoRefreshInterval),
			});
		} else {
			expect(messenger.alarms.create).not.toHaveBeenCalled();
		}
	});
});

describe('initBackground', () => {
	it('registers onInstalled, onStartup, onAlarm and storage.onChanged listeners, and syncs once at load', async () => {
		const messenger = setupMessenger();
		vi.stubGlobal('messenger', messenger);

		initBackground();

		expect(messenger.runtime.onInstalled.addListener).toHaveBeenCalledWith(syncAlarm);
		expect(messenger.runtime.onStartup.addListener).toHaveBeenCalledWith(syncAlarm);
		expect(messenger.alarms.onAlarm.addListener).toHaveBeenCalled();
		expect(messenger.storage.onChanged.addListener).toHaveBeenCalled();
		expect(messenger.spaces.create).toHaveBeenCalledWith('third_stats', '../index.stats.html', expect.any(Object));
		// the load-time syncAlarm() call is fire-and-forget, so its effect lands a few
		// microtask turns later - wait for it instead of asserting synchronously
		await vi.waitFor(() => expect(messenger.alarms.clear).toHaveBeenCalledWith(ALARM_NAME));
	});

	it('a live options change re-syncs the alarm', async () => {
		const messenger = setupMessenger();
		vi.stubGlobal('messenger', messenger);
		await messenger.storage.local.set({ options: { ...defaultOptions, autoRefresh: false } });

		initBackground();
		await vi.waitFor(() => expect(messenger.alarms.clear).toHaveBeenCalledWith(ALARM_NAME));
		messenger.alarms.clear.mockClear();

		await messenger.storage.local.set({ options: { ...defaultOptions, autoRefresh: true, autoRefreshInterval: 10 } });

		await vi.waitFor(() => expect(messenger.alarms.clear).toHaveBeenCalledWith(ALARM_NAME));
		expect(messenger.alarms.create).toHaveBeenCalledWith(ALARM_NAME, { periodInMinutes: 10 });
	});

	it('ignores storage changes to keys other than "options"', async () => {
		const messenger = setupMessenger();
		vi.stubGlobal('messenger', messenger);

		initBackground();
		// wait for the load-time sync to fully settle before observing "nothing happens" below
		await vi.waitFor(() => expect(messenger.alarms.clear).toHaveBeenCalledWith(ALARM_NAME));
		messenger.alarms.clear.mockClear();

		// the options.onChanged listener checks `changes.options` synchronously before ever
		// calling syncAlarm(), so an irrelevant key never schedules any async work at all
		await messenger.storage.local.set({ error: true });

		expect(messenger.alarms.clear).not.toHaveBeenCalled();
	});

	it('firing the registered onAlarm callback with the wrong name is a no-op', async () => {
		const messenger = setupMessenger();
		vi.stubGlobal('messenger', messenger);

		initBackground();
		await vi.waitFor(() => expect(messenger.alarms.clear).toHaveBeenCalledWith(ALARM_NAME));
		const onAlarmCallback = messenger.alarms.onAlarm.addListener.mock.calls[0][0];

		onAlarmCallback({ name: 'some-other-alarm' });

		expect(messenger.accounts.list).not.toHaveBeenCalled();
	});

	it('firing the registered onAlarm callback with the right name drives a full refresh', async () => {
		const messenger = setupMessenger();
		vi.stubGlobal('messenger', messenger);
		await messenger.storage.local.set({ options: { ...defaultOptions, cache: true } });

		initBackground();
		await vi.waitFor(() => expect(messenger.alarms.clear).toHaveBeenCalledWith(ALARM_NAME));
		const onAlarmCallback = messenger.alarms.onAlarm.addListener.mock.calls[0][0];

		// the listener fires runScheduledRefresh() without awaiting it (a real
		// alarms.onAlarm listener can't be awaited by anything), so poll storage instead
		onAlarmCallback({ name: ALARM_NAME });

		await vi.waitFor(async () => {
			const cached = await messenger.storage.local.get(statsCacheKey(fakeAccount.id));
			expect(cached[statsCacheKey(fakeAccount.id)]?.numbers.total).toBe(1);
		});
	});
});

describe('runScheduledRefresh - processing indicator', () => {
	it('sets the storage flag true while running and false once finished', async () => {
		const messenger = setupMessenger();
		vi.stubGlobal('messenger', messenger);
		await messenger.storage.local.set({ options: { ...defaultOptions, cache: true } });
		const seenDuringRun = [];
		messenger.accounts.list.mockImplementation(async () => {
			const { [PROCESSING_STORAGE_KEY]: flag } = await messenger.storage.local.get(PROCESSING_STORAGE_KEY);
			seenDuringRun.push(flag);
			return [fakeAccount];
		});

		await runScheduledRefresh();

		expect(seenDuringRun).toEqual([true]); // true while the refresh was actually running
		const { [PROCESSING_STORAGE_KEY]: finalFlag } = await messenger.storage.local.get(PROCESSING_STORAGE_KEY);
		expect(finalFlag).toBe(false);
	});

	it('badges the spaces-toolbar icon while running and clears it once finished', async () => {
		const messenger = setupMessenger();
		vi.stubGlobal('messenger', messenger);
		await messenger.storage.local.set({ options: { ...defaultOptions, cache: true } });

		initBackground();
		await vi.waitFor(() => expect(messenger.spaces.create).toHaveBeenCalled());
		const spaceId = (await messenger.spaces.create.mock.results[0].value).id;

		await runScheduledRefresh();

		expect(messenger.spaces.update).toHaveBeenNthCalledWith(1, spaceId, {}, { badgeText: '•' });
		expect(messenger.spaces.update).toHaveBeenNthCalledWith(2, spaceId, {}, { badgeText: '' });
	});
});

describe('initBackground - stuck-flag recovery', () => {
	it('resets a leftover "true" processing flag at startup', async () => {
		const messenger = setupMessenger();
		vi.stubGlobal('messenger', messenger);
		// simulate a previous background-script lifetime that got killed mid-refresh,
		// never reaching runScheduledRefresh's finally block
		await messenger.storage.local.set({ [PROCESSING_STORAGE_KEY]: true });

		initBackground();

		await vi.waitFor(async () => {
			const { [PROCESSING_STORAGE_KEY]: flag } = await messenger.storage.local.get(PROCESSING_STORAGE_KEY);
			expect(flag).toBe(false);
		});
	});
});

describe('runScheduledRefresh - concurrency guard', () => {
	it('a second overlapping call is a no-op while the first is still in flight', async () => {
		let resolveList;
		const list = vi.fn(
			async () =>
				new Promise((resolve) => {
					resolveList = () => resolve({ id: null, messages: [makeMessage()] });
				})
		);
		const messenger = setupMessenger({ messages: { list } });
		vi.stubGlobal('messenger', messenger);
		await messenger.storage.local.set({ options: { ...defaultOptions, cache: true } });

		const firstRun = runScheduledRefresh();
		const secondRun = runScheduledRefresh(); // guard check runs synchronously, before the first await

		// give the first run's chain of awaits (getOptions -> accounts.list) a few
		// microtask turns to actually reach messages.list, where it's now stuck
		await vi.waitFor(() => expect(list).toHaveBeenCalled());
		expect(messenger.accounts.list).toHaveBeenCalledTimes(1); // second call returned early, guard held

		resolveList();
		await firstRun;
		await secondRun;
	});
});
