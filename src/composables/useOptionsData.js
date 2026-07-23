// Thunderbird messenger.* data engine for the options page.
// Call exactly once, from Options.vue - this composable owns all its state internally.
import { ref, computed, watch } from 'vue';
import { defaultColors, defaultOptions } from '@/definitions.js';
import { formatBytes, setTheme } from '@/utils.js';

export function useOptionsData() {
	const input = ref({ address: '' });
	const allAccounts = ref([]);
	const cacheSize = ref(-1);

	// all valid option values for selfMessages
	const selfMessagesOptions = ['none', 'sameAccount', 'anyAccount'];

	// deep clone so mutating `options` never touches the shared defaultOptions singleton
	const cloneDefaultOptions = () => JSON.parse(JSON.stringify(defaultOptions));

	// create options object with default values
	const options = ref(cloneDefaultOptions());

	// get all saved add-on settings
	const getSettings = async () => {
		// only load options from storage if they have been set, otherwise default settings will be kept
		const result = await messenger.storage.local.get('options');
		if (result && result.options) {
			// merge option objects to overwrite attributes by saved ones while keeping new attributes
			options.value = { ...options.value, ...result.options };
			// handle theme
			setTheme(
				options.value.theme,
				document.body,
				['dark', 'background-alt'],
				['light', 'background-highlight-contrast']
			);
		}
	};

	// get all existing accounts
	const getAccounts = async () => {
		const accounts = await (await messenger.runtime.getBackgroundPage()).messenger.accounts.list();
		allAccounts.value = accounts;
		// if accounts option is not set yet, default to all accounts
		if (options.value?.accounts && options.value.accounts.length == 0) {
			// update accounts option
			options.value.accounts = accounts.map((a) => a.id);
		}
		// if some or all account colors are not initialized yet, initialize them
		if (options.value && options.value.accountColors) {
			allAccounts.value.forEach((a, i) => {
				if (!options.value.accountColors.hasOwnProperty(a.id)) {
					options.value.accountColors[a.id] = defaultColors[i % defaultColors.length];
				}
			});
		}
	};

	// get size of all cached account data
	const getCacheSize = async () => {
		const allEntriesSize = new TextEncoder().encode(
			Object.entries(await messenger.storage.local.get())
				.map(([key, value]) => `${key}${JSON.stringify(value)}`)
				.join('')
		).length;
		const optionsSize = new TextEncoder().encode(
			Object.entries(await messenger.storage.local.get('options'))
				.map(([key, value]) => `${key}${JSON.stringify(value)}`)
				.join('')
		).length;
		cacheSize.value = allEntriesSize - optionsSize;
	};

	// add configured email address to list of addresses
	const addAddress = () => {
		if (input.value.address) {
			let addresses = options.value.addresses ? `${options.value.addresses},` : '';
			addresses += input.value.address;
			options.value.addresses = addresses;
			input.value.address = '';
		}
	};

	// remove given email address from list of addresses
	const removeAddress = (address) => {
		let addresses = options.value.addresses.replace(address, '');
		addresses = addresses.replace(/,,/g, ',');
		addresses = addresses.replace(/^,+|,+$/g, '');
		options.value.addresses = addresses;
	};

	// increases auto refresh interval up without limit
	const incrementAutoRefreshInterval = () => {
		options.value.autoRefreshInterval++;
	};

	// decreases auto refresh interval down to limit 5
	const decrementAutoRefreshInterval = () => {
		if (options.value.autoRefreshInterval > 5) {
			options.value.autoRefreshInterval--;
		}
	};

	// check auto refresh number input to stay in allowed range
	const checkAutoRefreshInterval = () => {
		if (options.value.autoRefreshInterval < 5) {
			options.value.autoRefreshInterval = 5;
		}
	};

	// increases leader count up to limit 999
	const incrementmaxListCount = () => {
		if (options.value.maxListCount < 999) {
			options.value.maxListCount++;
		}
	};

	// decreases leader count down to limit 1
	const decrementmaxListCount = () => {
		if (options.value.maxListCount > 1) {
			options.value.maxListCount--;
		}
	};

	// check leader count input to stay in allowed range
	const checkmaxListCount = () => {
		if (options.value.maxListCount < 1) {
			options.value.maxListCount = 1;
		}
		if (options.value.maxListCount > 999) {
			options.value.maxListCount = 999;
		}
	};

	// clear all cached stats entries
	const clearCache = async () => {
		// clear whole local storage
		await messenger.storage.local.clear();
		// restore options
		await messenger.storage.local.set({ options: JSON.parse(JSON.stringify(options.value)) });
		// recalculate cache size
		getCacheSize();
	};

	// reset options to their default value
	const resetOptions = async () => {
		// save options default values
		await messenger.storage.local.set({ options: defaultOptions });
		options.value = cloneDefaultOptions();
		await getAccounts();
	};

	// array of email addresses configured for local account identities
	const addressList = computed(() => {
		return options.value && options.value.addresses ? options.value.addresses.split(',') : [];
	});

	// output cache size in human readable format with units
	const formattedCacheSize = computed(() => {
		return formatBytes(cacheSize.value);
	});

	// check if options are opened in own options page
	const ownOptionsPage = computed(() => {
		const uri = window.location.search.substring(1);
		return Boolean(new URLSearchParams(uri).get('s'));
	});

	// save options object on each single option change
	watch(
		() => options.value,
		(newOptions) => {
			messenger.storage.local.set({ options: JSON.parse(JSON.stringify(newOptions)) });
			setTheme(newOptions.theme, document.body, ['dark', 'background-alt'], ['light', 'background-highlight-contrast']);
		},
		{
			deep: true,
			immediate: false,
		}
	);

	// bootstraps the options page - call once from onMounted
	const init = async () => {
		// initially load settings
		await getSettings();
		// initially load accounts
		getAccounts();
		// initially load cache size
		getCacheSize();
	};

	return {
		input,
		allAccounts,
		cacheSize,
		selfMessagesOptions,
		options,
		addressList,
		formattedCacheSize,
		ownOptionsPage,
		getSettings,
		getAccounts,
		getCacheSize,
		addAddress,
		removeAddress,
		incrementAutoRefreshInterval,
		decrementAutoRefreshInterval,
		checkAutoRefreshInterval,
		incrementmaxListCount,
		decrementmaxListCount,
		checkmaxListCount,
		clearCache,
		resetOptions,
		init,
	};
}
