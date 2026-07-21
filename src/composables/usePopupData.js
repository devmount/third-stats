// Thunderbird messenger.* data-fetch engine for the popup.
// Call exactly once, from Popup.vue - this composable owns all its state internally.
import { ref, reactive } from 'vue';
import { defaultOptions } from '@/definitions.js';
import { filterActiveAccounts, setTheme, statsCacheKey, traverseAccount } from '@/utils.js';

// pure: builds a per-year sparkline dataset (received+sent combined) from one
// account's cached stats blob (shape produced by createStatsData in statsAggregation.js)
export function buildAccountSparkline(storedAccountData, dark) {
	const r = storedAccountData.yearsData.received;
	const s = storedAccountData.yearsData.sent;
	const labels = [],
		d = [];
	const start = new Date(storedAccountData.meta.start);
	const end = storedAccountData.meta.end ? new Date(storedAccountData.meta.end) : new Date();
	for (let y = start.getFullYear(); y <= end.getFullYear(); ++y) {
		labels.push(y);
		d.push((y in r ? r[y] : 0) + (y in s ? s[y] : 0));
	}
	return {
		datasets: [{ label: 'placeholder', data: d, borderColor: dark ? '#f9f9fa15' : '#1d1d1f15' }],
		labels,
	};
}

export function usePopupData() {
	// list of all existing accounts
	const accounts = ref([]);
	// processing folder and message counts indication
	const loading = ref(false);
	// relevant add-on options
	const options = reactive({
		accounts: defaultOptions.accounts, // accounts to process
		dark: true, // dark theme
		cache: defaultOptions.cache, // whether caching system is enabled or not
	});

	// get all stored add-on options that are needed
	// provides default value if option is not set
	const getOptions = async () => {
		const result = await messenger.storage.local.get('options');
		// only load needed options if they have been set, otherwise default settings will be kept
		if (result && result.options) {
			options.dark = setTheme(
				result.options.theme ?? defaultOptions.theme,
				document.body,
				['dark', 'background-normal'],
				['light', 'background-modal']
			);
			options.accounts = result.options.accounts ?? defaultOptions.accounts;
			options.cache = result.options.cache ?? defaultOptions.cache;
		}
	};

	// retrieve all thunderbird accounts
	// add folder count to account object
	const getAccounts = async () => {
		const list = await messenger.accounts.list();
		let accountList = filterActiveAccounts(list, options.accounts);
		// expand account object with additional data
		await Promise.all(
			accountList.map(async (a) => {
				// calculate folder count and append to account object
				const folders = await traverseAccount(a);
				a.folderCount = folders.length;
				// get overall message count when cache is enabled
				if (options.cache) {
					const stored = await messenger.storage.local.get(statsCacheKey(a.id));
					const storedAccountData = stored[statsCacheKey(a.id)];
					if (storedAccountData) {
						// add message count
						a.messageCount = storedAccountData.numbers.total;
						// add years data
						if (a.messageCount > 0) {
							a.yearsData = buildAccountSparkline(storedAccountData, options.dark);
						}
					}
				}
			})
		);
		accounts.value = accountList;
	};

	// bootstraps the popup - call once from onMounted
	const init = async () => {
		// start loading indication
		loading.value = true;

		// get stored options
		await getOptions();

		// start account processing
		await getAccounts();

		// stop loading indication
		loading.value = false;
	};

	return {
		accounts,
		loading,
		options,
		init,
	};
}
