// Thunderbird messenger.* data-fetch/aggregation engine for the stats page.
// Call exactly once, from Stats.vue - this composable owns all its state internally;
// invoking it a second time anywhere else would create an unsynced duplicate copy.
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { accentColors, defaultColors, defaultOptions } from '@/definitions.js';
import {
	filterActiveAccounts,
	queryMessages,
	setTheme,
	sortAndLimitObject,
	statsCacheKey,
	traverseAccount,
	yyyymmdd,
} from '@/utils.js';
import {
	analyzeMessage,
	buildComparisonData,
	createComparisonData,
	createStatsData,
	sumAccountsData,
} from '@/composables/statsAggregation.js';

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

	// adds a listener for storage change events
	// makes reactions on option changes possible
	const addStorageListener = () => {
		messenger.storage.onChanged.addListener((result, area) => {
			if (area == 'local' && result?.options?.newValue && result?.options?.oldValue) {
				const n = result.options.newValue;
				const o = result.options.oldValue;
				// only update those options that changed
				if (n.theme != o.theme) {
					options.dark = setTheme(n.theme);
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
			// options.startOfWeek = result.options.startOfWeek ?? defaultOptions.startOfWeek;
			options.addresses = result.options.addresses
				? result.options.addresses
						.toLowerCase()
						.split(',')
						.map((x) => x.trim())
				: defaultOptions.addresses;
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
		let activeIdentities = list.reduce((p, c) => p.concat(c.identities.map((i) => i.email.toLowerCase())), []);
		// add local identities if any local account is active
		if (options.addresses.length && list.some((a) => ['none', 'local'].includes(a.type))) {
			options.addresses.forEach((l) => activeIdentities.push(l.toLowerCase()));
		}
		identities.value = activeIdentities;
		// extract account id from url GET parameter
		const uri = window.location.search.substring(1);
		let id = new URLSearchParams(uri).get('s');
		if (!id || (id == 'sum' && !options.cache) || (id == 'sum' && list.length <= 1)) id = list[0].id;
		active.account = id;
	};

	// retrieve all messages of a given <folder> with accounts <identityList>
	// store results in <data> object
	const processMessages = async (data, folder, identityList) => {
		// Only analyze existing, non-virtual folders
		if (folder && !folder.isUnified && !folder.isVirtual) {
			const context = {
				activeContact: active.contact,
				selfMessagesMode: options.selfMessages,
				allIdentities: identities.value,
			};
			let n = 0,
				s = 0,
				r = 0;
			for await (let m of queryMessages(folder.id, active.period.start, active.period.end)) {
				const type = analyzeMessage(data, m, identityList, context);
				// live update numbers section if corresponding option is enabled
				if (options.liveCountUp) display.value.numbers = data.numbers;
				if (options.debug) {
					n++;
					s += type === 'sent' ? 1 : 0;
					r += type === 'received' ? 1 : 0;
				}
			}

			// Handle debug output
			if (options.debug) {
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
	};

	// analyze folders of a given account <a>
	// return processed data object structured like createStatsData
	const processAccount = async (a) => {
		// get identities from account, or from preferences if it's a local account
		const identities = !['none', 'local'].includes(a.type)
			? a.identities.map((i) => i.email.toLowerCase())
			: options.addresses;
		// get all folders and subfolders from given account or selected folder of active account (filter field)
		const foldersList = active.folder ? [JSON.parse(JSON.stringify(active.folder))] : await traverseAccount(a);
		// build folder list for filter selection, if not already present
		if (!folders.value.length) {
			folders.value = foldersList;
		}
		const accountData = createStatsData(active.period.start, active.period.end);
		await Promise.all(
			foldersList.map(async (f) => {
				// analyze all messages in all folders
				await processMessages(accountData, f, identities);
				// increment current progress by 1 for each folder
				progress.current++;
			})
		);
		// post processing: sort and reduce size of lists to configured limit
		accountData.contacts.received = sortAndLimitObject(accountData.contacts.received, options.maxListCount);
		accountData.contacts.sent = sortAndLimitObject(accountData.contacts.sent, options.maxListCount);
		accountData.contacts.junk = sortAndLimitObject(accountData.contacts.junk, options.maxListCount);
		accountData.tags = sortAndLimitObject(accountData.tags, options.maxListCount);
		// post processing: sort folders
		accountData.folders.received = sortAndLimitObject(accountData.folders.received);
		accountData.folders.sent = sortAndLimitObject(accountData.folders.sent);
		// post processing: add timestamp of finished processing
		accountData.meta.timestamp = Date.now();

		// Handle debug output
		if (options.debug) {
			const debugIdentities = identities.length ? identities.join(', ') : 'None';
			console.debug(`Detected identities: ${debugIdentities}`);
		}

		// check if error occured during processing
		// any error is saved to local storage during processing
		const { err } = await messenger.storage.local.get('error');
		error.account = err;

		return accountData;
	};

	// true, if at least one filter is set
	const filterIsActive = computed(() => active.folder || active.period.start || active.period.end || active.contact);

	// true, if just one single account is selected
	const singleAccount = computed(() => active.account !== 'sum');

	// retrieve and process data of account with <id=accountId>
	// gets called multiple times if processing was invoked for all accounts
	const reprocessData = async (id, auto = false) => {
		// get currently selected account
		const account = await messenger.accounts.get(id);
		// process data of this account again
		const accountData = await processAccount(account);
		// directly display data if only one single account was manually processed
		if (singleAccount.value && !auto) {
			display.value = JSON.parse(JSON.stringify(accountData));
		}
		// only store reprocessed data if cache is enabled and no filter is set
		if (options.cache && !filterIsActive.value) {
			const stats = {};
			stats[statsCacheKey(id)] = JSON.parse(JSON.stringify(accountData));
			await messenger.storage.local.set(stats);
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
	// while reprocessing was invoked manually <auto=false> or automaticalle <auto=true>
	const loadAccount = async (id, refresh, auto = false) => {
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
			// when auto processing remember displayed account key and disable live counts
			let displayedAccountKey = null;
			let liveCountUpDisabled = false;
			if (auto && options.liveCountUp) {
				liveCountUpDisabled = true;
				options.liveCountUp = false;
			}
			await Promise.all(
				activeAccounts.map(async (a) => {
					// get data from storage
					const result = await messenger.storage.local.get(statsCacheKey(a.id));
					if (!refresh && result && result[statsCacheKey(a.id)]) {
						// if no refresh requested and this accounts data was cached before, take data from cache
						accountsData.push(JSON.parse(JSON.stringify(result[statsCacheKey(a.id)])));
						progress.current += a.folderCount;
					} else {
						// otherwise (re)process account
						await messenger.storage.local.set({ error: false });
						// Handle debug output
						if (options.debug) {
							console.debug(`Processing account ${a.name}`, a);
						}
						const data = await reprocessData(a.id, auto);
						accountsData.push(JSON.parse(JSON.stringify(data)));
						// remember key of currently displayed account if auto processed
						if (auto && active.account == a.id) {
							displayedAccountKey = accountsData.length - 1;
						}
					}
				})
			);
			// enable live counts again if set
			if (auto && liveCountUpDisabled) {
				options.liveCountUp = true;
			}
			// finish progress indicator
			progress.current = 0;
			progress.max = 0;

			// sum all values of all account objects
			const sum = sumAccountsData(accountsData, options.maxListCount);

			// show summed stats or keep current view if processing was invoked automatically
			display.value = auto && displayedAccountKey ? accountsData[displayedAccountKey] : sum;

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
				await messenger.storage.local.set({ error: false });
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
		// start auto-processing in intervals if activated
		if (options.autoRefresh) {
			setInterval(
				() => {
					if (!isLoading.value) {
						loadAccount('sum', true, true);
					}
				},
				Number(options.autoRefreshInterval) * 60 * 1000
			); // convert minutes to seconds
		}
	};

	return {
		accounts,
		folders,
		tags,
		active,
		error,
		isLoading,
		progress,
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
