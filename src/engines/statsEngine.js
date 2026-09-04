// Portable stats fetch/aggregate/cache - no Vue/DOM dependencies.
// Callable from the Stats page (via useStatsData.js) and from the background script (via backgroundEngine.js)
import { accentColors } from '@/definitions.js';
import { flattenSubfolders, queryMessages, sortAndLimitObject, statsCacheKey, traverseAccount } from '@/utils.js';
import { analyzeMessage, createStatsData } from '@/composables/statsAggregation.js';

// messenger.storage.local key set by backgroundEngine.js while a scheduled refresh is in progress.
// Prevents a user-triggered reprocess from running concurrently against the same account
export const PROCESSING_STORAGE_KEY = 'statsProcessing';

// messenger.storage.local key set by useStatsData.js while the Stats page is processing (manual
// refresh or filter change). backgroundEngine.js watches this to also badge the spaces-toolbar
// icon for page-driven activity, not just its own scheduled refreshes
export const PAGE_PROCESSING_STORAGE_KEY = 'statsPageProcessing';

// combines identities of every account in <accountList> with configured local <addresses> (lowercase)
export function buildAllIdentities(accountList, addresses) {
	let activeIdentities = accountList.reduce((p, c) => p.concat(c.identities.map((i) => i.email.toLowerCase())), []);
	if (addresses.length && accountList.some((a) => ['none', 'local'].includes(a.type))) {
		addresses.forEach((l) => activeIdentities.push(l.toLowerCase()));
	}
	return activeIdentities;
}

// retrieve all messages of a given <folder> with accounts <identityList>, updating <data>
// <filters> = { activeContact, selfMessagesMode, allIdentities, periodStart, periodEnd, debug }
// <hooks> = { onMessage?: (numbers) => void }
export async function processMessages(data, folder, identityList, filters = {}, hooks = {}) {
	// Only analyze existing, non-virtual folders
	if (folder && !folder.isUnified && !folder.isVirtual) {
		const context = {
			activeContact: filters.activeContact,
			selfMessagesMode: filters.selfMessagesMode,
			allIdentities: filters.allIdentities ?? [],
		};
		let n = 0,
			s = 0,
			r = 0;
		for await (let m of queryMessages(folder.id, filters.periodStart, filters.periodEnd, filters.debug, folder.path)) {
			const type = analyzeMessage(data, m, identityList, context);
			if (hooks.onMessage) hooks.onMessage(data.numbers);
			if (filters.debug) {
				n++;
				s += type === 'sent' ? 1 : 0;
				r += type === 'received' ? 1 : 0;
			}
		}

		// Handle debug output
		if (filters.debug) {
			const totalOutput = String(n).padStart(6);
			const receivedOutput = String(r).padStart(6);
			const sentOutput = String(s).padStart(6);
			console.debug(
				`${totalOutput} %c${receivedOutput} %c${sentOutput}   %c📁 ${folder.path}`,
				`color:${accentColors[1]}`,
				`color:${accentColors[0]}`,
				'color:inherit'
			);
		}
	}
}

// analyze folders of a given account <account>, return { accountData, foldersList, error }
// <addonOptions> = { addresses, includeSubfolders, selfMessages, maxListCount, debug }
// <filters> = { activeFolder?, activeContact?, allIdentities?, periodStart?, periodEnd? }
// <hooks> = { onMessage?, onFolderDone? }
export async function processAccount(account, addonOptions, filters = {}, hooks = {}) {
	// get identities from account, or from configured addresses if it's a local account
	const identityList = !['none', 'local'].includes(account.type)
		? account.identities.map((i) => i.email.toLowerCase())
		: addonOptions.addresses;
	// get all folders and subfolders from given account or selected folder (filter field)
	const foldersList = filters.activeFolder
		? [
				JSON.parse(JSON.stringify(filters.activeFolder)),
				...(addonOptions.includeSubfolders ? flattenSubfolders(filters.activeFolder) : []),
			]
		: await traverseAccount(account);
	const accountData = createStatsData(filters.periodStart, filters.periodEnd);
	const messageFilters = {
		activeContact: filters.activeContact,
		selfMessagesMode: addonOptions.selfMessages,
		allIdentities: filters.allIdentities,
		periodStart: filters.periodStart,
		periodEnd: filters.periodEnd,
		debug: addonOptions.debug,
	};
	await Promise.all(
		foldersList.map(async (f) => {
			// analyze all messages in all folders
			await processMessages(accountData, f, identityList, messageFilters, hooks);
			if (hooks.onFolderDone) hooks.onFolderDone();
		})
	);
	// post processing: sort and reduce size of lists to configured limit
	accountData.contacts.received = sortAndLimitObject(accountData.contacts.received, addonOptions.maxListCount);
	accountData.contacts.sent = sortAndLimitObject(accountData.contacts.sent, addonOptions.maxListCount);
	accountData.contacts.junk = sortAndLimitObject(accountData.contacts.junk, addonOptions.maxListCount);
	accountData.tags = sortAndLimitObject(accountData.tags, addonOptions.maxListCount);
	// post processing: sort folders
	accountData.folders.received = sortAndLimitObject(accountData.folders.received);
	accountData.folders.sent = sortAndLimitObject(accountData.folders.sent);
	// post processing: add timestamp of finished processing
	accountData.meta.timestamp = Date.now();

	// Handle debug output
	if (addonOptions.debug) {
		const debugIdentities = identityList.length ? identityList.join(', ') : 'None';
		console.debug(`Detected identities: ${debugIdentities}`);
	}

	// check if error occured during processing
	// any error is saved to local storage during processing
	const { err } = await messenger.storage.local.get('error');

	return { accountData, foldersList, error: err };
}

// fetch account <accountId>, reprocess its data, and persist to the stats-<id> cache when addonOptions.cache is enabled
// and no filter is active.
// Returns { accountData, foldersList, error }
// <filters> additionally accepts filterIsActive (boolean)
export async function reprocessAccount(accountId, addonOptions, filters = {}, hooks = {}) {
	const account = await messenger.accounts.get(accountId);
	// reset error flag before (re)processing
	await messenger.storage.local.set({ error: false });
	const { accountData, foldersList, error } = await processAccount(account, addonOptions, filters, hooks);
	// only store reprocessed data if cache is enabled and no filter is set
	if (addonOptions.cache && !filters.filterIsActive) {
		const stats = {};
		stats[statsCacheKey(accountId)] = JSON.parse(JSON.stringify(accountData));
		await messenger.storage.local.set(stats);
	}
	return { accountData, foldersList, error };
}
