import { describe, expect, it } from 'vitest';
import { buildFolderTree, findFolderId } from '@/composables/folderTree.js';

const folder = (id, name, path, subFolders = []) => ({ id, name, path, subFolders });

const work = {
	id: 'acc-1',
	name: 'Work',
	rootFolder: {
		subFolders: [
			folder('acc-1://INBOX', 'Inbox', '/INBOX', [
				folder('acc-1://INBOX/Projects', 'Projects', '/INBOX/Projects'),
				folder('acc-1://INBOX/Empty', 'Empty', '/INBOX/Empty'),
			]),
			folder('acc-1://Sent', 'Sent', '/Sent'),
		],
	},
};

const personal = {
	id: 'acc-2',
	name: 'Personal',
	rootFolder: { subFolders: [folder('acc-2://INBOX', 'Inbox', '/INBOX')] },
};

describe('buildFolderTree', () => {
	it('nests folders under their account and adds subfolder sizes to the parent', () => {
		const tree = buildFolderTree([work], { 'acc-1': { '/INBOX': 100, '/INBOX/Projects': 300, '/Sent': 50 } });
		expect(tree).toHaveLength(1);
		expect(tree[0]).toMatchObject({ key: 'acc-1', name: 'Work', folderId: null, size: 450 });
		const [inbox, sent] = tree[0].children;
		expect(inbox).toMatchObject({ name: 'Inbox', folderId: 'acc-1://INBOX', size: 400 });
		expect(inbox.children.map((c) => [c.name, c.size])).toEqual([['Projects', 300]]);
		expect(sent).toMatchObject({ name: 'Sent', size: 50, children: [] });
	});

	it('keeps the inboxes of different accounts apart', () => {
		const tree = buildFolderTree([work, personal], { 'acc-1': { '/INBOX': 100 }, 'acc-2': { '/INBOX': 700 } });
		expect(tree.map((a) => [a.name, a.size])).toEqual([
			['Personal', 700],
			['Work', 100],
		]);
	});

	it('sorts siblings largest first, counting subfolders', () => {
		const tree = buildFolderTree([work], { 'acc-1': { '/INBOX': 10, '/INBOX/Projects': 20, '/Sent': 25 } });
		expect(tree[0].children.map((c) => c.name)).toEqual(['Inbox', 'Sent']);
	});

	it('leaves out folders and accounts without any size', () => {
		const tree = buildFolderTree([work, personal], { 'acc-1': { '/Sent': 50, '/INBOX/Empty': 0 } });
		expect(tree.map((a) => a.name)).toEqual(['Work']);
		expect(tree[0].children.map((c) => c.name)).toEqual(['Sent']);
	});

	it('expresses every size as a share of the largest account', () => {
		const tree = buildFolderTree([work, personal], {
			'acc-1': { '/INBOX': 100, '/Sent': 100 },
			'acc-2': { '/INBOX': 50 },
		});
		expect(tree[0].share).toBe(1);
		expect(tree[0].children[0].share).toBe(0.5);
		expect(tree[1].share).toBe(0.25);
	});

	it('returns an empty tree for stats cached before sizes existed', () => {
		expect(buildFolderTree([work], undefined)).toEqual([]);
	});

	it('collects sizes of folders that no longer exist in a last, non-clickable row', () => {
		const tree = buildFolderTree([work], { 'acc-1': { '/Deleted': 900, '/Moved': 99, '/Sent': 50 } });
		expect(tree[0].size).toBe(1049);
		expect(tree[0].children.map((c) => [c.name, c.size])).toEqual([
			['Sent', 50],
			[null, 999],
		]);
		expect(tree[0].children[1]).toMatchObject({ removed: true, folderId: null, share: 999 / 1049, children: [] });
	});

	it('adds no such row when every size belongs to an existing folder', () => {
		const tree = buildFolderTree([work], { 'acc-1': { '/Sent': 50 } });
		expect(tree[0].children.some((c) => c.removed)).toBe(false);
	});

	it('ignores sizes of accounts that no longer exist', () => {
		const tree = buildFolderTree([work], { 'acc-1': { '/Sent': 50 }, 'acc-gone': { '/INBOX': 5 } });
		expect(tree.map((a) => [a.name, a.size])).toEqual([['Work', 50]]);
	});
});

describe('findFolderId', () => {
	it('finds a nested folder by account and path', () => {
		expect(findFolderId([work, personal], 'acc-1', '/INBOX/Projects')).toBe('acc-1://INBOX/Projects');
	});

	it('does not confuse same paths of different accounts', () => {
		expect(findFolderId([work, personal], 'acc-2', '/INBOX')).toBe('acc-2://INBOX');
	});

	it('returns null for an unknown account or path', () => {
		expect(findFolderId([work], 'acc-9', '/INBOX')).toBeNull();
		expect(findFolderId([work], 'acc-1', '/Nope')).toBeNull();
	});
});
