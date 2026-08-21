import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildAllIdentities, processAccount, processMessages, reprocessAccount } from '@/statsEngine.js';
import { createStatsData } from '@/composables/statsAggregation.js';
import { statsCacheKey } from '@/utils.js';
import { createMockMessenger } from './helpers/messenger.js';

const fakeAccount = {
	id: 'acc-1',
	name: 'Account 1',
	type: 'imap',
	identities: [{ email: 'me@example.com' }],
	rootFolder: { id: 'root-1' },
};

const localAccount = {
	id: 'acc-local',
	name: 'Local Folders',
	type: 'none',
	identities: [],
	rootFolder: { id: 'root-local' },
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

const virtualFolder = { ...inboxFolder, id: 'folder-virtual', isVirtual: true };

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

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('buildAllIdentities', () => {
	it('collects lowercased identities from every account', () => {
		const accountA = { type: 'imap', identities: [{ email: 'A@Example.com' }] };
		const accountB = { type: 'imap', identities: [{ email: 'b@example.com' }] };
		expect(buildAllIdentities([accountA, accountB], [])).toEqual(['a@example.com', 'b@example.com']);
	});

	it('adds configured local addresses only when a none/local account is present', () => {
		const imapOnly = [{ type: 'imap', identities: [{ email: 'a@example.com' }] }];
		expect(buildAllIdentities(imapOnly, ['Local@Example.com'])).toEqual(['a@example.com']);

		const withLocal = [
			{ type: 'imap', identities: [{ email: 'a@example.com' }] },
			{ type: 'local', identities: [] },
		];
		expect(buildAllIdentities(withLocal, ['Local@Example.com'])).toEqual(['a@example.com', 'local@example.com']);
	});
});

describe('processMessages', () => {
	it('skips unified and virtual folders entirely', async () => {
		vi.stubGlobal(
			'messenger',
			createMockMessenger({ messages: { list: vi.fn(async () => ({ id: null, messages: [makeMessage()] })) } })
		);
		const data = { numbers: { total: 0 } };
		await processMessages(data, { ...virtualFolder }, ['me@example.com'], {});
		expect(messenger.messages.list).not.toHaveBeenCalled();
	});

	it('invokes hooks.onMessage once per analyzed message, and works with no hooks at all', async () => {
		vi.stubGlobal(
			'messenger',
			createMockMessenger({
				messages: { list: vi.fn(async () => ({ id: null, messages: [makeMessage(), makeMessage()] })) },
			})
		);
		const data = createStatsData();
		const numbersSeen = [];

		await processMessages(data, inboxFolder, ['me@example.com'], {}, { onMessage: (n) => numbersSeen.push(n.total) });
		expect(numbersSeen).toEqual([1, 2]);

		// no hooks object at all - the background-processing call shape - must not throw
		await expect(processMessages(data, inboxFolder, ['me@example.com'], {})).resolves.toBeUndefined();
	});
});

describe('processAccount', () => {
	it('uses account identities for a normal account, and configured addresses for a local one', async () => {
		vi.stubGlobal(
			'messenger',
			createMockMessenger({
				folders: { get: vi.fn(async () => ({ isRoot: true, subFolders: [inboxFolder] })) },
				messages: {
					list: vi.fn(async () => ({
						id: null,
						messages: [makeMessage({ author: 'me@example.com', recipients: ['x@example.com'] })],
					})),
				},
			})
		);

		const { accountData: normalResult } = await processAccount(fakeAccount, { addresses: [], maxListCount: 20 });
		expect(normalResult.numbers.sent).toBe(1); // author matches account identity -> sent

		const { accountData: localResult } = await processAccount(localAccount, {
			addresses: ['me@example.com'],
			maxListCount: 20,
		});
		expect(localResult.numbers.sent).toBe(1); // author matches configured local address -> sent
	});

	it('restricts to filters.activeFolder (plus subfolders when includeSubfolders) instead of the full account tree', async () => {
		const subFolder = { ...inboxFolder, id: 'folder-sub', subFolders: [] };
		const parentFolder = { ...inboxFolder, id: 'folder-parent', subFolders: [subFolder] };
		const traverseAccountSpy = vi.fn(async () => ({ isRoot: true, subFolders: [parentFolder] }));
		vi.stubGlobal(
			'messenger',
			createMockMessenger({
				folders: { get: traverseAccountSpy },
				messages: { list: vi.fn(async () => ({ id: null, messages: [] })) },
			})
		);

		const { foldersList: withoutFilter } = await processAccount(fakeAccount, { addresses: [], maxListCount: 20 });
		// full account traversal always flattens subfolders, regardless of includeSubfolders
		// (that option only governs the filtered single-folder path below)
		expect(withoutFilter.map((f) => f.id)).toEqual(['folder-parent', 'folder-sub']);
		expect(traverseAccountSpy).toHaveBeenCalled();

		traverseAccountSpy.mockClear();
		const { foldersList: withFilterNoSub } = await processAccount(
			fakeAccount,
			{ addresses: [], includeSubfolders: false, maxListCount: 20 },
			{ activeFolder: parentFolder }
		);
		expect(withFilterNoSub.map((f) => f.id)).toEqual(['folder-parent']);
		expect(traverseAccountSpy).not.toHaveBeenCalled(); // filtered path never re-traverses the account

		const { foldersList: withFilterAndSub } = await processAccount(
			fakeAccount,
			{ addresses: [], includeSubfolders: true, maxListCount: 20 },
			{ activeFolder: parentFolder }
		);
		expect(withFilterAndSub.map((f) => f.id)).toEqual(['folder-parent', 'folder-sub']);
	});

	it('calls hooks.onFolderDone once per processed folder', async () => {
		const folderA = { ...inboxFolder, id: 'folder-a' };
		const folderB = { ...inboxFolder, id: 'folder-b' };
		vi.stubGlobal(
			'messenger',
			createMockMessenger({
				folders: { get: vi.fn(async () => ({ isRoot: true, subFolders: [folderA, folderB] })) },
				messages: { list: vi.fn(async () => ({ id: null, messages: [] })) },
			})
		);

		let done = 0;
		await processAccount(fakeAccount, { addresses: [], maxListCount: 20 }, {}, { onFolderDone: () => done++ });
		expect(done).toBe(2);
	});

	it('post-processes contacts/tags/folders via sortAndLimitObject and sets meta.timestamp', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2024, 0, 1));
		vi.stubGlobal(
			'messenger',
			createMockMessenger({
				folders: { get: vi.fn(async () => ({ isRoot: true, subFolders: [inboxFolder] })) },
				messages: {
					list: vi.fn(async () => ({
						id: null,
						messages: [
							makeMessage({ author: 'a@example.com' }),
							makeMessage({ author: 'a@example.com' }),
							makeMessage({ author: 'b@example.com' }),
						],
					})),
				},
			})
		);

		const { accountData } = await processAccount(fakeAccount, { addresses: [], maxListCount: 1 });
		expect(Object.keys(accountData.contacts.received)).toEqual(['a@example.com']); // limited to maxListCount, sorted by count
		expect(accountData.meta.timestamp).toBe(new Date(2024, 0, 1).getTime());
		vi.useRealTimers();
	});

	// NOTE: processAccount's return value comes from `const { err } = await
	// messenger.storage.local.get('error')` - destructuring key "err", but the stored key
	// is "error" (see queryMessages/statsCacheKey usage in utils.js), so this always reads
	// undefined regardless of the actual flag. This is a pre-existing bug carried over
	// verbatim from useStatsData.js's original processAccount() during extraction - flagged,
	// not fixed, per project convention.
	it('always reads back undefined for the error flag due to the pre-existing {err} vs {error} key mismatch', async () => {
		vi.stubGlobal(
			'messenger',
			createMockMessenger({
				folders: { get: vi.fn(async () => ({ isRoot: true, subFolders: [inboxFolder] })) },
				messages: { list: vi.fn(async () => ({ id: null, messages: [] })) },
			})
		);
		await messenger.storage.local.set({ error: true });

		const { error } = await processAccount(fakeAccount, { addresses: [], maxListCount: 20 });
		expect(error).toBeUndefined();
	});
});

describe('reprocessAccount', () => {
	const setup = (overrides = {}) =>
		createMockMessenger({
			accounts: { get: vi.fn(async () => fakeAccount) },
			folders: { get: vi.fn(async () => ({ isRoot: true, subFolders: [inboxFolder] })) },
			messages: { list: vi.fn(async () => ({ id: null, messages: [makeMessage()] })) },
			...overrides,
		});

	it('resets the error flag to false before processing', async () => {
		const messenger = setup();
		vi.stubGlobal('messenger', messenger);
		await messenger.storage.local.set({ error: true });

		await reprocessAccount(fakeAccount.id, { addresses: [], maxListCount: 20, cache: false }, {});

		// the reset happens before processing, and no fetch failed here, so it stays false
		const { error } = await messenger.storage.local.get('error');
		expect(error).toBe(false);
	});

	it('persists to the stats-<id> cache only when cache is enabled and no filter is active', async () => {
		const messenger = setup();
		vi.stubGlobal('messenger', messenger);

		await reprocessAccount(fakeAccount.id, { addresses: [], maxListCount: 20, cache: true }, { filterIsActive: false });
		const cached = await messenger.storage.local.get(statsCacheKey(fakeAccount.id));
		expect(cached[statsCacheKey(fakeAccount.id)].numbers.total).toBe(1);
	});

	it('does not persist when a filter is active, even with cache enabled', async () => {
		const messenger = setup();
		vi.stubGlobal('messenger', messenger);

		await reprocessAccount(fakeAccount.id, { addresses: [], maxListCount: 20, cache: true }, { filterIsActive: true });
		const cached = await messenger.storage.local.get(statsCacheKey(fakeAccount.id));
		expect(cached).toEqual({});
	});

	it('does not persist when cache is disabled, even without a filter', async () => {
		const messenger = setup();
		vi.stubGlobal('messenger', messenger);

		await reprocessAccount(
			fakeAccount.id,
			{ addresses: [], maxListCount: 20, cache: false },
			{ filterIsActive: false }
		);
		const cached = await messenger.storage.local.get(statsCacheKey(fakeAccount.id));
		expect(cached).toEqual({});
	});
});
