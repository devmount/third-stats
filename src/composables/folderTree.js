// builds the size tree shown in the "folders" section - no Vue/messenger dependencies
// <accounts> = [{ id, name, rootFolder: { subFolders } }] with the live folder hierarchy,
// <sizes> = { [accountId]: { [folderPath]: bytes } } as collected by analyzeMessage()

const bySizeDescending = (a, b) => b.size - a.size;

// size of a node includes all of its subfolders, so a parent never ranks below its children
const folderNode = (folder, accountSizes) => {
	const children = (folder.subFolders ?? [])
		.map((f) => folderNode(f, accountSizes))
		.filter((n) => n.size > 0)
		.sort(bySizeDescending);
	const size = (accountSizes[folder.path] ?? 0) + children.reduce((sum, c) => sum + c.size, 0);
	return { key: folder.id, name: folder.name, folderId: folder.id, size, children };
};

const withShare = (node, max) => ({
	...node,
	share: node.size / max,
	children: node.children.map((c) => withShare(c, max)),
});

// row without name and link, the component labels it
const removedFoldersNode = (accountId, size) => ({
	key: `${accountId}:removed`,
	name: null,
	folderId: null,
	removed: true,
	size,
	children: [],
});

// the hierarchy is taken from the given accounts rather than derived from the paths,
// sizes of folders which don't exist anymore are gathered in one row per account
const buildFolderTree = (accounts, sizes) => {
	const tree = accounts
		.map((account) => {
			const accountSizes = sizes?.[account.id] ?? {};
			const children = (account.rootFolder?.subFolders ?? [])
				.map((f) => folderNode(f, accountSizes))
				.filter((n) => n.size > 0)
				.sort(bySizeDescending);
			const known = children.reduce((sum, c) => sum + c.size, 0);
			const size = Object.values(accountSizes).reduce((sum, s) => sum + s, 0);
			if (size > known) children.push(removedFoldersNode(account.id, size - known));
			return { key: account.id, name: account.name, folderId: null, size, children };
		})
		.filter((a) => a.size > 0)
		.sort(bySizeDescending);
	const max = tree.length ? tree[0].size : 0;
	return tree.map((a) => withShare(a, max));
};

const findFolderId = (accounts, accountId, path) => {
	const search = (folders) => {
		for (const f of folders ?? []) {
			if (f.path === path) return f.id;
			const found = search(f.subFolders);
			if (found) return found;
		}
		return null;
	};
	return search(accounts.find((a) => a.id === accountId)?.rootFolder?.subFolders);
};

export { buildFolderTree, findFolderId };
