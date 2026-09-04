// Thunderbird messenger.* data-fetch/aggregation engine for the stats page.
// Call exactly once, from Stats.vue - it owns all its state internally; a second call elsewhere would create an unsynced duplicate.
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { accentColors, defaultColors, defaultOptions } from '@/definitions.js';
import { filterActiveAccounts, setTheme, statsCacheKey, traverseAccount, yyyymmdd } from '@/utils.js';
import {
	buildComparisonData,
	createComparisonData,
	createStatsData,
	sumAccountsData,
} from '@/composables/statsAggregation.js';
import {
	buildAllIdentities,
	PAGE_PROCESSING_STORAGE_KEY,
	PROCESSING_STORAGE_KEY,
	reprocessAccount as engineReprocessAccount,
} from '@/engines/statsEngine.js';

export function useStatsData() {
	const { t } = useI18n();

	const now = new Date();

	// list of all existing Thunderbird accounts
	const accounts = ref([]);

	// list of all existing identities
	const identities = ref([]);

	// list of all existing folders for the current account selection
	const folders = ref([]);

	// list of all existing tags
	const tags = ref([]);

	// selected filter field values and field errors
	const active = reactive({
		account: null, // currently selected account
		folder: null, // currently selected folder
		contact: null, // currently selected contact
		period: {
			start: null, // currently configured start of period of time
			end: null, // currently configured end of period of time
		},
	});
	const error = reactive({
		account: false, // truey if there where any errors on account message retrieval
		period: {
			start: [], // list of error messages if currently configured period start date is invalid
			end: [], // list of error messages if currently configured period end date is invalid
		},
	});

	// loading and process indication if data is processing
	const isLoading = ref(false);
	const progress = reactive({
		current: 0, // indicator for progress on refreshing data, fraction [0-1]
		max: 0, // upper limit for progress indicator
	});

	// true while the background script is running a scheduled refresh - read-only here, synced from
	// messenger.storage.local, and used to disable the manual refresh action to avoid a concurrent pass
	const backgroundBusy = ref(false);

	// preferences for stats page configuration
	const preferences = reactive({
		sections: {
			total: {
				expand: false,
				comparison: false,
			},
			activity: {
				year: now.getFullYear(),
			},
			onedim: {
				comparison: false,
			},
		},
	});

	// initially load default add-on options
	const options = reactive({ ...defaultOptions });

	// processed data to show; data structure see createStatsData
	const display = ref(createStatsData(active.period.start, active.period.end));

	// subset of processed data to show data for account comparison view; data structure see createComparisonData
	const comparison = ref(createComparisonData());

	// smoothly animates display.value.numbers toward <target> instead of snapping to it, so the
	// count-up stays visually continuous even when new numbers arrive in bursts (IMAP paging)
	const NUMBERS_ANIMATION_DURATION_MS = 400;
	const NUMBERS_ANIMATION_STEP_MS = 40;
	const zeroNumbers = () => ({
		total: 0,
		unread: 0,
		received: 0,
		sent: 0,
		starred: 0,
		tagged: 0,
		junk: 0,
		junkScore: 0,
	});
	let numbersAnimationTimer = null;
	// stops any in-flight number animation - call before any direct assignment to
	// display.value(.numbers), or a later animation step could overwrite it with a stale value
	const cancelNumbersAnimation = () => {
		clearTimeout(numbersAnimationTimer);
		numbersAnimationTimer = null;
	};
	// instantly (not animated) zeroes the count-up before (re)processing starts, so it always
	// climbs up from zero instead of animating down from whatever total was on screen before
	const resetLiveNumbers = () => {
		cancelNumbersAnimation();
		display.value.numbers = zeroNumbers();
	};
	const animateNumbersTo = (target) => {
		cancelNumbersAnimation();
		const start = { ...display.value.numbers };
		const startTime = Date.now();
		const step = () => {
			const progress = Math.min((Date.now() - startTime) / NUMBERS_ANIMATION_DURATION_MS, 1);
			display.value.numbers = Object.fromEntries(
				Object.keys(target).map((key) => [key, Math.round(start[key] + (target[key] - start[key]) * progress)])
			);
			numbersAnimationTimer = progress < 1 ? setTimeout(step, NUMBERS_ANIMATION_STEP_MS) : null;
		};
		step();
	};

	// adds a listener for storage change events
	// makes reactions on option changes possible
	const addStorageListener = () => {
		messenger.storage.onChanged.addListener((result, area) => {
			if (area == 'local' && result?.options?.newValue && result?.options?.oldValue) {
				const n = result.options.newValue;
				const o = result.options.oldValue;
				// only update those options that changed
				if (n.theme != o.theme) {
					options.dark = setTheme(n.theme, document.body, ['dark', 'stats-bg'], ['light', 'stats-bg']);
				}
				if (n.ordinate != o.ordinate) {
					options.ordinate = n.ordinate;
				}
				if (n.tagColors != o.tagColors) {
					options.tagColors = n.tagColors;
				}
				if (n.liveCountUp != o.liveCountUp) {
					options.liveCountUp = n.liveCountUp;
				}
				if (n.autoRefresh != o.autoRefresh) {
					options.autoRefresh = n.autoRefresh;
				}
				if (n.autoRefreshInterval != o.autoRefreshInterval) {
					options.autoRefreshInterval = n.autoRefreshInterval;
				}
				if (n.startOfWeek != o.startOfWeek) {
					options.startOfWeek = n.startOfWeek;
				}
				if (n.addresses != o.addresses) {
					options.addresses = n.addresses
						.toLowerCase()
						.split(',')
						.map((x) => x.trim());
				}
				if (n.includeSubfolders != o.includeSubfolders) {
					options.includeSubfolders = n.includeSubfolders;
				}
				if (JSON.stringify(n.accounts) != JSON.stringify(o.accounts)) {
					options.accounts = n.accounts;
				}
				if (JSON.stringify(n.accountColors) != JSON.stringify(o.accountColors)) {
					options.accountColors = n.accountColors;
				}
				if (n.selfMessages != o.selfMessages) {
					options.selfMessages = n.selfMessages;
				}
				if (n.maxListCount != o.maxListCount) {
					options.maxListCount = n.maxListCount;
				}
				if (n.cache != o.cache) {
					options.cache = n.cache;
				}
				if (n.debug != o.debug) {
					options.debug = n.debug;
				}
			}
			// react to the background script writing a fresh stats-<id> cache entry while this page is open -
			// re-run the cheap cache-read path instead of leaving display/comparison stale until a manual reload
			if (area == 'local' && !isLoading.value && !filterIsActive.value) {
				const changedStatsKeys = Object.keys(result).filter((k) => k.startsWith('stats-'));
				if (changedStatsKeys.length) {
					const relevant = active.account === 'sum' || changedStatsKeys.includes(statsCacheKey(active.account));
					if (relevant) loadAccount(active.account, false);
				}
			}
			// mirror whether the background script is currently mid-refresh
			if (area == 'local' && result?.[PROCESSING_STORAGE_KEY]) {
				backgroundBusy.value = !!result[PROCESSING_STORAGE_KEY].newValue;
			}
		});
	};

	// get all add-on settings from the options page
	// for non existing options use default value
	const getOptions = async () => {
		const result = await messenger.storage.local.get('options');
		// only load options if they have been set, otherwise default settings will be kept
		if (result && result.options) {
			options.dark = setTheme(
				result.options.theme ?? defaultOptions.theme,
				document.body,
				['dark', 'stats-bg'],
				['light', 'stats-bg']
			);
			options.ordinate = result.options.ordinate ?? defaultOptions.ordinate;
			options.tagColors = result.options.tagColors ?? defaultOptions.tagColors;
			options.liveCountUp = result.options.liveCountUp ?? defaultOptions.liveCountUp;
			options.autoRefresh = result.options.autoRefresh ?? defaultOptions.autoRefresh;
			options.autoRefreshInterval = result.options.autoRefreshInterval ?? defaultOptions.autoRefreshInterval;
			options.startOfWeek = result.options.startOfWeek ?? defaultOptions.startOfWeek;
			options.addresses = result.options.addresses
				? result.options.addresses
						.toLowerCase()
						.split(',')
						.map((x) => x.trim())
				: defaultOptions.addresses;
			options.includeSubfolders = result.options.includeSubfolders ?? defaultOptions.includeSubfolders;
			options.accounts = result.options.accounts ?? defaultOptions.accounts;
			options.accountColors = result.options.accountColors ?? defaultOptions.accountColors;
			options.selfMessages = result.options.selfMessages ?? defaultOptions.selfMessages;
			options.maxListCount = result.options.maxListCount ?? defaultOptions.maxListCount;
			options.cache = result.options.cache ?? defaultOptions.cache;
			options.debug = result.options.debug ?? defaultOptions.debug;
		}
	};

	// retrieve list of tags that can be set on messages
	// their human-friendly name, color, and sort order
	const getTags = async () => {
		tags.value = await messenger.messages.tags.list();
	};

	// retrieve accounts and identities list
	// get active account from URL get parameter
	const getAccounts = async () => {
		let list = await messenger.accounts.list();
		// if account colors are not initialized yet, initialize them
		if (Object.keys(options.accountColors).length == 0) {
			list.forEach((a, i) => {
				options.accountColors[a.id] = defaultColors[i % defaultColors.length];
			});
		}
		// filter list of accounts if user configured custom list
		list = filterActiveAccounts(list, options.accounts);
		// store accounts
		accounts.value = list;
		// store identities of all activated accounts
		identities.value = buildAllIdentities(list, options.addresses);
		// extract account id from url GET parameter
		const uri = window.location.search.substring(1);
		let id = new URLSearchParams(uri).get('s');
		if (!id || (id == 'sum' && !options.cache) || (id == 'sum' && list.length <= 1)) id = list[0].id;
		active.account = id;
	};

	// true, if at least one filter is set
	const filterIsActive = computed(() => active.folder || active.period.start || active.period.end || active.contact);

	// true, if just one single account is selected
	const singleAccount = computed(() => active.account !== 'sum');

	// retrieve and process data of account with <id=accountId>
	// gets called multiple times if processing was invoked for all accounts
	// <onNumbers>, if given, receives live number updates instead of writing them to display.value.numbers -
	// used when summing multiple accounts in parallel (see loadAccount), so updates get aggregated correctly
	const reprocessData = async (id, onNumbers) => {
		// only forward every 3rd message to the live count-up, to cut the number of
		// triggered re-renders while still counting up smoothly
		let messageCount = 0;
		const {
			accountData,
			foldersList,
			error: hadError,
		} = await engineReprocessAccount(
			id,
			{
				addresses: options.addresses,
				includeSubfolders: options.includeSubfolders,
				selfMessages: options.selfMessages,
				maxListCount: options.maxListCount,
				cache: options.cache,
				debug: options.debug,
			},
			{
				activeFolder: active.folder,
				activeContact: active.contact,
				allIdentities: identities.value,
				periodStart: active.period.start,
				periodEnd: active.period.end,
				filterIsActive: filterIsActive.value,
			},
			{
				onMessage: options.liveCountUp
					? (numbers) => {
							messageCount++;
							if (messageCount % 3 !== 0) return;
							if (onNumbers) onNumbers(numbers);
							else animateNumbersTo(numbers);
						}
					: undefined,
				onFolderDone: () => progress.current++,
			}
		);
		// build folder list for filter selection, if not already present
		if (!folders.value.length) {
			folders.value = foldersList;
		}
		error.account = hadError;
		// directly display data if only one single account was processed
		if (singleAccount.value) {
			cancelNumbersAnimation();
			display.value = JSON.parse(JSON.stringify(accountData));
		}
		// return processed account data
		return accountData;
	};

	// corrects selected year, if it's out of the current date range
	// called after data got reprocessed
	const adjustSelectedYear = () => {
		const min = new Date(display.value.meta.start).getFullYear();
		const max = new Date(display.value.meta.end).getFullYear();
		const current = preferences.sections.activity.year;
		if (current < min) preferences.sections.activity.year = min;
		if (current > max) preferences.sections.activity.year = max;
	};

	// load data of given account <id=accountId> or all accounts <id='sum'>
	// from cache <refresh=false> or reprocess from scratch <refresh=true>
	const loadAccount = async (id, refresh) => {
		// start loading indication
		isLoading.value = true;
		// check id type
		if (id === 'sum' && options.cache) {
			// set tab title
			document.title = `ThirdStats: ${t('stats.allAccounts')}`;
			// deactivate list of folders
			folders.value = [];
			// iterate over all activated accounts
			const activeAccounts = filterActiveAccounts(accounts.value, options.accounts);
			let accountsData = [];
			// init progress indicator
			progress.current = 1;
			progress.max = activeAccounts.reduce(async (p, c) => p + (await traverseAccount(c).length), 0);
			// live numbers per account; summing these on every update (instead of each account
			// overwriting display.value.numbers directly) keeps the live total monotonically increasing
			const liveNumbers = {};
			const updateLiveTotal = () => {
				const summed = Object.values(liveNumbers).reduce(
					(sum, n) => ({
						total: sum.total + n.total,
						unread: sum.unread + n.unread,
						received: sum.received + n.received,
						sent: sum.sent + n.sent,
						starred: sum.starred + (n.starred ?? 0),
						tagged: sum.tagged + (n.tagged ?? 0),
						junk: sum.junk + n.junk,
						junkScore: sum.junkScore + n.junkScore,
					}),
					zeroNumbers()
				);
				animateNumbersTo(summed);
			};
			// start every live count-up climbing from zero rather than dipping from whatever
			// total (this account, or a previously viewed one) happened to be on screen already
			if (options.liveCountUp) resetLiveNumbers();
			// phase 1: check every account's cache concurrently, folding cached numbers into the
			// live total in one batch once all reads are in, not one at a time as each resolves
			const toReprocess = [];
			await Promise.all(
				activeAccounts.map(async (a) => {
					const result = await messenger.storage.local.get(statsCacheKey(a.id));
					if (!refresh && result && result[statsCacheKey(a.id)]) {
						// if no refresh requested and this accounts data was cached before, take data from cache
						accountsData.push(JSON.parse(JSON.stringify(result[statsCacheKey(a.id)])));
						progress.current += a.folderCount;
						if (options.liveCountUp) liveNumbers[a.id] = result[statsCacheKey(a.id)].numbers;
					} else {
						toReprocess.push(a);
					}
				})
			);
			// fold in whatever came from cache (a no-op animation if nothing did, since we're
			// already at zero from the reset above)
			if (options.liveCountUp) updateLiveTotal();
			// phase 2: (re)process whatever's left from scratch, live-updating the total as each
			// account's messages come in
			await Promise.all(
				toReprocess.map(async (a) => {
					// Handle debug output
					if (options.debug) {
						console.debug(`Processing account ${a.name}`, a);
					}
					const data = await reprocessData(
						a.id,
						options.liveCountUp
							? (numbers) => {
									liveNumbers[a.id] = numbers;
									updateLiveTotal();
								}
							: undefined
					);
					accountsData.push(JSON.parse(JSON.stringify(data)));
				})
			);
			// finish progress indicator
			progress.current = 0;
			progress.max = 0;

			// sum all values of all account objects
			cancelNumbersAnimation();
			display.value = sumAccountsData(accountsData, options.maxListCount);

			// retrieve all values of account objects for comparison views
			comparison.value = buildComparisonData(accountsData, activeAccounts);
		} else {
			// load single account from id
			const account = await messenger.accounts.get(id);
			// set tab title
			document.title = `ThirdStats: ${account.name}`;
			// (re)calculate list of folders
			folders.value = await traverseAccount(account);
			// only check storage if no refresh was requested cache is enabled
			const result = options.cache ? await messenger.storage.local.get(statsCacheKey(id)) : null;
			if (!refresh && result && result[statsCacheKey(id)]) {
				// if cache is enabled and data already exists in storage, display it directly
				cancelNumbersAnimation();
				display.value = JSON.parse(JSON.stringify(result[statsCacheKey(id)]));
			} else {
				// otherwise retrieve it first/again and track progress by processed folder count
				progress.current = 1;
				progress.max = folders.value.length;
				// Handle debug output
				if (options.debug) {
					console.debug(`Processing account ${account.name}`, account);
					console.debug(
						` total  %crecvd   %csent   %c📁 Folder path`,
						`color:${accentColors[1]}`,
						`color:${accentColors[0]}`,
						'color:inherit'
					);
				}
				// start the live count-up climbing from zero rather than dipping from whatever
				// total (a previous filter, or this account's last completed load) is on screen
				if (options.liveCountUp) resetLiveNumbers();
				await reprocessData(id);
				progress.current = 0;
				progress.max = 0;
			}
		}
		// finally adjust displayed activity year
		adjustSelectedYear();
		// finished - stop loading indication
		isLoading.value = false;
	};

	// reset folder filter
	// reload data if requested <reload=true>
	const resetFolder = async (reload) => {
		active.folder = null;
		if (reload) {
			// reprocess current data if another filter is set, otherwise just load account data
			await loadAccount(active.account, (active.period.start && active.period.end) || active.contact);
		}
	};

	// true if entered time period is valid
	// fills error stack for affected fields when input is invalid
	const validatePeriod = () => {
		let valid = true;
		const datex = RegExp(/^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/);
		error.period.start = [];
		error.period.end = [];
		// start time is not set
		if (!active.period.start) {
			valid = false;
			error.period.start.push(t('stats.tooltips.error.empty'));
		}
		// start time is of wrong format
		if (!datex.test(active.period.start)) {
			valid = false;
			error.period.start.push(t('stats.tooltips.error.dateFormat'));
		}
		// start time is no real date
		if (isNaN(Date.parse(active.period.start))) {
			valid = false;
			error.period.start.push(t('stats.tooltips.error.dateUnreal'));
		}
		// end time is not set
		if (!active.period.end) {
			valid = false;
			error.period.end.push(t('stats.tooltips.error.empty'));
		}
		// end time is of wrong format
		if (!datex.test(active.period.end)) {
			valid = false;
			error.period.end.push(t('stats.tooltips.error.dateForma;t'));
		}
		// end time is no real date
		if (isNaN(Date.parse(active.period.end))) {
			valid = false;
			error.period.end.push(t('stats.tooltips.error.dateUnreal;'));
		}
		// start date is before end date
		if (Date.parse(active.period.start) > Date.parse(active.period.end)) {
			valid = false;
			error.period.start.push(t('stats.tooltips.error.dateOrderStart'));
			error.period.end.push(t('stats.tooltips.error.dateOrderEnd'));
		}
		return valid;
	};

	// process data for current time period filter
	// calls refresh if filter is valid
	const updatePeriod = async () => {
		if (validatePeriod()) {
			await loadAccount(active.account, true);
			display.value.meta.start = new Date(active.period.start);
			display.value.meta.end = new Date(active.period.end);
			adjustSelectedYear();
		}
	};

	// reset time period filter
	// reload data if requested <reload=true>
	const resetPeriod = async (reload) => {
		active.period.start = null;
		active.period.end = null;
		error.period.start = [];
		error.period.end = [];
		adjustSelectedYear();
		if (reload) {
			// reprocess current data if another filter is set, otherwise just load account data
			await loadAccount(active.account, active.folder || active.contact);
		}
	};

	// reset contact filter
	// reload data if requested <reload=true>
	const resetContact = async (reload) => {
		active.contact = null;
		if (reload) {
			// reprocess current data if another filter is set, otherwise just load account data
			await loadAccount(active.account, (active.period.start && active.period.end) || active.folder);
		}
	};

	// format period date input to match YYYY-MM-DD
	// <key> defines the input field, either 'start' or 'end'
	const formatPeriod = (key) => {
		if (active.period[key]) {
			let s = active.period[key];
			// complete year
			if (s.length == 6) {
				s = `${String(new Date().getFullYear()).slice(0, 2)}${s}`;
			}
			// insert dashes
			if (!s.includes('-')) {
				s = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}`;
			}
			// shorten to 10 characters
			s = s.slice(0, 10);
			// set lower limit
			if (!isNaN(Date.parse(s)) && Date.parse(s) < 0) {
				s = '1970-01-01';
			}
			// set upper limit
			if (!isNaN(Date.parse(s)) && Date.parse(s) > Date.now()) {
				s = new Date().toISOString().slice(0, 10);
			}
			active.period[key] = s;
		}
	};

	// first date in currently displayed data
	const minDate = computed(() => {
		return new Date(display.value.meta.start);
	});
	// last date in currently displayed data
	const maxDate = computed(() => {
		return display.value.meta.end ? new Date(display.value.meta.end) : new Date();
	});
	// year minDate
	const minYear = computed(() => {
		return minDate.value.getFullYear();
	});
	// year of maxDate
	const maxYear = computed(() => {
		return maxDate.value.getFullYear();
	});

	// increments selected year
	// only up to the max existing year
	const nextYear = () => {
		if (preferences.sections.activity.year < maxYear.value) {
			preferences.sections.activity.year++;
		}
	};
	// decrements selected year
	// only down to the min existing year
	const previousYear = () => {
		if (preferences.sections.activity.year > minYear.value) {
			preferences.sections.activity.year--;
		}
	};

	// export displayed data
	// provides a JSON file for download
	const exportJson = () => {
		const data = new Blob([JSON.stringify(display.value)], { type: 'text/plain;charset=utf-8' });
		messenger.downloads
			.download({
				url: URL.createObjectURL(data),
				filename: `${yyyymmdd(new Date())}_third-stats-export.json`,
				saveAs: true,
			})
			.then(
				() => {},
				() => {}
			); // TODO: [alert] Successfully started download | Download aborted
	};

	// tooltip for account comparison button
	// depends on active accounts, account selection and toggle of given section
	const tooltipAccountComparison = (section) => {
		if (options.accounts.length < 2) {
			return t('stats.tooltips.comparisonWhenAccountsOption');
		}
		if (singleAccount.value) {
			return t('stats.tooltips.comparisonWhenFilter');
		}
		return !preferences.sections[section].comparison ? t('stats.tooltips.comparison') : t('stats.tooltips.sum');
	};

	// merges received and sent contacts to a distinct list for contacts filter
	const contacts = computed(() => {
		const r = display.value.contacts.received,
			s = display.value.contacts.sent;
		return Array.from(new Set([...Object.keys(r), ...Object.keys(s)])).sort();
	});

	// return account colors of all active accounts comma separated as single string
	const accountsColorGradient = computed(() => {
		return Object.entries(options.accountColors)
			.filter((a) => options.accounts.includes(a[0]))
			.reduce((p, c) => p.concat(c[1]), [])
			.join(',');
	});

	// array of years descending from last to first date
	const yearsList = computed(() => {
		let years = [];
		for (let i = maxYear.value; i >= minYear.value; i--) {
			years.push(i);
		}
		return years;
	});

	// compute current loading progress in percent
	const processingState = computed(() => {
		if (progress.max > 0) {
			if (progress.current <= progress.max) {
				return (100 * progress.current) / progress.max;
			} else {
				return 100;
			}
		} else {
			return 0;
		}
	});

	// on change of active account reset filter
	// and load new accounts data accordingly
	watch(
		() => active.account,
		async (id) => {
			// default to all accounts page if no id given
			if (!id) id = 'sum';
			// reset preferences
			preferences.sections.total.comparison = false;
			// reset folder filter
			resetFolder(false);
			// reset contact filter
			resetContact(false);
			// process data for given account, refresh if date range or contact filter is set
			await loadAccount(id, (active.period.start && active.period.end) || active.contact);
		}
	);

	// on change of active folder
	// retrieve data again for current account selection
	watch(
		() => active.folder,
		async (folder) => {
			if (folder) {
				// start processing for active folder only
				await loadAccount(active.account, true);
			}
		}
	);

	// on change of active folder
	// retrieve data again for current account selection
	watch(
		() => active.contact,
		async (contact) => {
			if (contact) {
				// start processing for active contact only
				await loadAccount(active.account, true);
			}
		}
	);

	// mirror this page's own loading state to storage, so the background script can also badge
	// the spaces-toolbar icon for page-driven activity, not just its own scheduled refreshes
	watch(isLoading, (loading) => {
		messenger.storage.local.set({ [PAGE_PROCESSING_STORAGE_KEY]: loading });
	});

	// bootstraps the engine - call once from onMounted
	const init = async () => {
		// set initial tab title
		document.title = 'ThirdStats';
		// listen for option changes in local storage
		addStorageListener();
		// get stored options
		await getOptions();
		// retrieve all tags
		await getTags();
		// retrieve all accounts
		await getAccounts();
		// check if error occured during previous processing
		const { err } = await messenger.storage.local.get('error');
		error.account = err;
		// pick up whether a background refresh is already in flight when this page opens
		const { [PROCESSING_STORAGE_KEY]: initialProcessing } = await messenger.storage.local.get(PROCESSING_STORAGE_KEY);
		backgroundBusy.value = !!initialProcessing;
		// a page closed mid-refresh never gets to clear PAGE_PROCESSING_STORAGE_KEY itself, which
		// would otherwise leave the spaces-toolbar badge stuck on - reset it opportunistically here
		await messenger.storage.local.set({ [PAGE_PROCESSING_STORAGE_KEY]: false });
	};

	return {
		accounts,
		folders,
		tags,
		active,
		error,
		isLoading,
		progress,
		backgroundBusy,
		preferences,
		options,
		display,
		comparison,
		singleAccount,
		minDate,
		maxDate,
		minYear,
		maxYear,
		yearsList,
		accountsColorGradient,
		processingState,
		contacts,
		loadAccount,
		resetFolder,
		resetContact,
		resetPeriod,
		updatePeriod,
		formatPeriod,
		nextYear,
		previousYear,
		exportJson,
		tooltipAccountComparison,
		init,
	};
}
