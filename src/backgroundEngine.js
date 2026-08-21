// background-script orchestration: schedules periodic stats reprocessing via
// messenger.alarms so it runs independent of the Stats page being open (#381).
import { defaultOptions } from '@/definitions.js';
import { filterActiveAccounts } from '@/utils.js';
import { buildAllIdentities, PROCESSING_STORAGE_KEY, reprocessAccount } from '@/statsEngine.js';

export const ALARM_NAME = 'third-stats-refresh';

// in-memory guard against overlapping refresh runs (mirrors isLoading.value on the Stats page)
let refreshing = false;

// id of the spaces-toolbar entry, captured once registerSpacesIcon() resolves - used to
// badge the icon while a scheduled refresh is running, the only visual indication of
// background activity when no ThirdStats page happens to be open
let spaceId = null;

const setBadgeProcessing = async (isProcessing) => {
	if (!messenger.spaces || spaceId === null) return;
	await messenger.spaces.update(spaceId, {}, { badgeText: isProcessing ? '•' : '' });
};

// get all add-on settings needed for background processing, applying the same
// normalization useStatsData.js's getOptions() applies (addresses is stored as a
// comma-separated string, not an array)
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
	await setBadgeProcessing(true);
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
		await setBadgeProcessing(false);
	}
};

// registers the Stats page in Thunderbird's spaces toolbar
export const registerSpacesIcon = async () => {
	if (messenger.spaces) {
		const space = await messenger.spaces.create('third_stats', '../index.stats.html', {
			badgeBackgroundColor: '#e64db9',
			badgeText: '',
			defaultIcons: '../icon.svg',
			themeIcons: [
				{
					dark: '../icon-dark.svg',
					light: '../icon-light.svg',
					size: 16,
				},
				{
					dark: '../icon-dark.svg',
					light: '../icon-light.svg',
					size: 32,
				},
			],
			title: 'ThirdStats',
		});
		spaceId = space.id;
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
	});
	registerSpacesIcon();
	// also sync once at load, not just on onInstalled/onStartup, so a reload during
	// development or a version bump doesn't leave no alarm registered
	syncAlarm();
	// PROCESSING_STORAGE_KEY is only ever set true by this module itself (see
	// runScheduledRefresh), so at this point in a fresh background-script lifetime nothing
	// can legitimately be mid-run yet - reset it in case a previous lifetime was killed
	// before reaching its finally block and left the flag (and the Stats page's disabled
	// refresh button) stuck true forever
	messenger.storage.local.set({ [PROCESSING_STORAGE_KEY]: false });
};
