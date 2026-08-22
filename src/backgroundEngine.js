// background-script: schedules periodic stats reprocessing via messenger.alarms independent from other pages
import { defaultOptions } from '@/definitions.js';
import { filterActiveAccounts } from '@/utils.js';
import {
	buildAllIdentities,
	PAGE_PROCESSING_STORAGE_KEY,
	PROCESSING_STORAGE_KEY,
	reprocessAccount,
} from '@/statsEngine.js';

export const ALARM_NAME = 'third-stats-refresh';

// in-memory guard against overlapping refresh runs (mirrors isLoading.value on the Stats page)
let refreshing = false;

// mirrors whether any open Stats page (useStatsData.js) is currently processing, so the badge
// also reflects page-driven activity, not just this script's own scheduled refreshes
let pageProcessing = false;

// id of the spaces-toolbar entry, captured once registerSpacesIcon() resolves - used to
// badge the icon while a scheduled refresh is running as visual activity indication
let spaceId = null;

// tracked so setBadgeProcessing can wait it out
let spacesReady = null;

const setBadgeProcessing = async (isProcessing) => {
	await spacesReady;
	if (!messenger.spaces || spaceId === null) return;
	await messenger.spaces.update(spaceId, {}, { badgeText: isProcessing ? '•' : '' });
};

// recomputes the badge from both activity sources combined, so finishing one doesn't clear the
// badge while the other is still running
const updateBadge = async () => setBadgeProcessing(refreshing || pageProcessing);

// get all add-on settings needed for background processing
export const getOptions = async () => {
	const result = await messenger.storage.local.get('options');
	const o = result?.options ?? {};
	return {
		autoRefresh: o.autoRefresh ?? defaultOptions.autoRefresh,
		autoRefreshInterval: o.autoRefreshInterval ?? defaultOptions.autoRefreshInterval,
		accounts: o.accounts ?? defaultOptions.accounts,
		addresses: (o.addresses ?? defaultOptions.addresses)
			.toLowerCase()
			.split(',')
			.map((x) => x.trim())
			.filter(Boolean),
		includeSubfolders: o.includeSubfolders ?? defaultOptions.includeSubfolders,
		selfMessages: o.selfMessages ?? defaultOptions.selfMessages,
		maxListCount: o.maxListCount ?? defaultOptions.maxListCount,
		cache: o.cache ?? defaultOptions.cache,
		debug: o.debug ?? defaultOptions.debug,
	};
};

// (re)create the refresh alarm to match the currently configured options
export const syncAlarm = async () => {
	const options = await getOptions();
	await messenger.alarms.clear(ALARM_NAME);
	if (options.autoRefresh) {
		messenger.alarms.create(ALARM_NAME, { periodInMinutes: Number(options.autoRefreshInterval) });
	}
};

// reprocess every active account and persist it to the stats-<id> cache
export const runScheduledRefresh = async () => {
	if (refreshing) return;
	refreshing = true;
	await messenger.storage.local.set({ [PROCESSING_STORAGE_KEY]: true });
	await updateBadge();
	try {
		const options = await getOptions();
		const allAccounts = await messenger.accounts.list();
		const activeAccounts = filterActiveAccounts(allAccounts, options.accounts);
		const allIdentities = buildAllIdentities(activeAccounts, options.addresses);
		for (const account of activeAccounts) {
			await reprocessAccount(account.id, options, { allIdentities, filterIsActive: false });
		}
	} finally {
		refreshing = false;
		await messenger.storage.local.set({ [PROCESSING_STORAGE_KEY]: false });
		await updateBadge();
	}
};

// registers the Stats page in Thunderbird's spaces toolbar
export const registerSpacesIcon = async () => {
	if (!messenger.spaces) return;
	const buttonProperties = {
		badgeBackgroundColor: '#e64db9',
		badgeText: '',
		defaultIcons: '../icon.svg',
		title: 'ThirdStats',
	};
	try {
		const space = await messenger.spaces.create('third_stats', '../index.stats.html', buttonProperties);
		spaceId = space.id;
	} catch {
		// Look up the existing space to reuse if applicable
		const [existing] = await messenger.spaces.query({ name: 'third_stats', isSelfOwned: true });
		if (existing) {
			spaceId = existing.id;
			await messenger.spaces.update(spaceId, {}, buttonProperties);
		}
	}
};

export const initBackground = () => {
	messenger.runtime.onInstalled.addListener(syncAlarm);
	messenger.runtime.onStartup.addListener(syncAlarm);
	messenger.alarms.onAlarm.addListener((alarm) => {
		if (alarm.name === ALARM_NAME) runScheduledRefresh();
	});
	messenger.storage.onChanged.addListener((changes, area) => {
		if (area === 'local' && changes.options) syncAlarm();
		if (area === 'local' && changes[PAGE_PROCESSING_STORAGE_KEY]) {
			pageProcessing = !!changes[PAGE_PROCESSING_STORAGE_KEY].newValue;
			updateBadge();
		}
	});
	spacesReady = registerSpacesIcon();
	// also sync once at load, not just on onInstalled/onStartup, so a reload during
	// development or a version bump doesn't leave no alarm registered
	syncAlarm();
	// PROCESSING_STORAGE_KEY is only ever set true by this module itself (see runScheduledRefresh)
	messenger.storage.local.set({ [PROCESSING_STORAGE_KEY]: false });
	// pick up a Stats page that's already mid-refresh when this script (re)starts
	messenger.storage.local.get(PAGE_PROCESSING_STORAGE_KEY).then((result) => {
		pageProcessing = !!result[PAGE_PROCESSING_STORAGE_KEY];
		if (pageProcessing) updateBadge();
	});
};
