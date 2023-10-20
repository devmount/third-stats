<template>
	<div
		class="flex flex-col justify-center w-full max-w-4xl mx-auto pt-2"
		:class="{
			'px-4 gap-4': ownOptionsPage,
			'px-2 gap-2': !ownOptionsPage,
		}"
	>
		<header v-if="ownOptionsPage" class="flex items-center gap-4 pt-4">
			<icon-third-stats class="!w-12 !h-12" colored />
			<h1 class="text-4xl font-bold">{{ t("options.title") }}</h1>
		</header>

		<div class="flex flex-col gap-12">

			<!-- section related to ThirdStats appearance and UI -->
			<section class="flex flex-col gap-4">
				<h2 class="text-2xl font-light pb-2">{{ t("options.headings.appearance") }}</h2>

				<!-- option: theme -->
				<div class="grid grid-cols-option gap-8">
					<label for="theme">
						{{ t("options.theme.label") }}
						<span class="block text-zinc-500">
							{{ t("options.theme.description") }}
						</span>
					</label>
					<div class="flex self-center">
						<select class="grow" v-model="options.theme" id="theme">
							<option v-for="theme in ['system', 'light', 'dark']" :key="theme" :value="theme">
								{{ t("options.theme." + theme) }}
							</option>
						</select>
					</div>
				</div>

				<!-- option: ordinate -->
				<div class="grid grid-cols-option gap-8">
					<label for="ordinate">
						{{ t("options.ordinate.label") }}
						<span class="block text-zinc-500">
							{{ t("options.ordinate.description") }}
						</span>
					</label>
					<div class="flex self-center">
						<input type="checkbox" id="ordinate" v-model="options.ordinate" />
					</div>
				</div>

				<!-- option: tag colors -->
				<div class="grid grid-cols-option gap-8">
					<label for="tagColors">
						{{ t("options.tagColors.label") }}
						<span class="block text-zinc-500">
							{{ t("options.tagColors.description") }}
						</span>
					</label>
					<div class="flex self-center">
						<input type="checkbox" id="tagColors" v-model="options.tagColors" />
					</div>
				</div>

				<!-- option: live count up -->
				<div class="grid grid-cols-option gap-8">
					<label for="liveCountUp">
						{{ t("options.liveCountUp.label") }}
						<span class="block text-zinc-500">
							{{ t("options.liveCountUp.description") }}
						</span>
					</label>
					<div class="flex flex-col self-center gap-2">
						<input type="checkbox" id="liveCountUp" v-model="options.liveCountUp" />
						<div class="flex gap-2 items-center text-zinc-500 text-sm">
							<icon-info-square class="!w-5 !h-5" />
							<span>{{ t("options.liveCountUp.info") }}</span>
						</div>
					</div>
				</div>

				<!-- option: auto processing -->
				<div class="grid grid-cols-option gap-8">
					<label for="autoRefresh">
						<div class="flex items-end gap-2">
							{{ t("options.autoRefresh.label") }}
							<tooltip :content="t('options.note.reloadWindowRequired')">
								<icon-refresh-alert class="!w-5 !h-5" />
							</tooltip>
						</div>
						<span class="block text-zinc-500">
							{{ t("options.autoRefresh.description") }}
						</span>
					</label>
					<div class="flex self-center items-center gap-4">
						<input type="checkbox" id="autoRefresh" v-model="options.autoRefresh" />
						<div v-if="options.autoRefresh" class="flex grow relative">
							<input
								class="grow"
								id="autoRefreshInterval"
								type="number"
								v-model="options.autoRefreshInterval"
								placeholder="30"
								min="5"
								step="1"
								@change="checkAutoRefreshInterval()"
							/>
							<div class="absolute z-30 right-11 top-2">
								{{ t('stats.abbreviations.minute') }}
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- section related to charts and data retrieval -->
			<section class="flex flex-col gap-4">
				<h2 class="text-2xl font-light pb-2">{{ t("options.headings.stats") }}</h2>
				<!-- option: startOfWeek -->
				<!-- <div class="grid grid-cols-option gap-8">
					<label for="start">
						{{ t("options.startOfWeek.label") }}
						<span class="block text-zinc-500">
							{{ t("options.startOfWeek.description") }}
						</span>
					</label>
					<div class="flex self-center">
						<select class="grow" v-model="options.startOfWeek" id="start">
							<option v-for="(name, pos) in weekdayNames(locale)" :key="pos" :value="pos">{{ name }}</option>
						</select>
					</div>
				</div> -->

				<!-- option: addresses -->
				<div class="grid grid-cols-option gap-8">
					<label for="local">
						<div class="flex items-end gap-2">
							{{ t("options.localIdentities.label") }}
							<tooltip :content="t('options.note.refreshCacheRequired')">
								<icon-database-exclamation class="!w-5 !h-5" />
							</tooltip>
						</div>
						<span class="block text-zinc-500">
							{{ t("options.localIdentities.description") }}
						</span>
					</label>
					<div class="flex flex-col gap-2">
						<div class="flex">
							<input class="grow" type="email" v-model="input.address" placeholder="hello@devmount.de" id="local" />
							<btn @click="addAddress" class="rounded-l-none">
								<icon-plus class="!w-5 !h-5" />
							</btn>
						</div>
						<div class="flex flex-wrap items-center gap-2">
							<span
								class="text-sm bg-zinc-300 dark:bg-zinc-700/75 rounded-sm py-1 px-2 flex items-center gap-1"
								v-for="a in addressList"
								:key="a"
							>
								{{ a }}
								<icon-x class="!w-4 !h-4 cursor-pointer hover:text-fuchsia-500" @click="removeAddress(a)" />
							</span>
						</div>
					</div>
				</div>

				<!-- option: account selection -->
				<div v-if="options.accounts" class="grid grid-cols-option gap-8">
					<label>
						<div class="flex items-end gap-2">
							{{ t("options.activeAccounts.label") }}
							<tooltip :content="t('options.note.reloadWindowRequired')">
								<icon-refresh-alert class="!w-5 !h-5" />
							</tooltip>
						</div>
						<span class="block text-zinc-500">
							{{ t("options.activeAccounts.description") }}
							{{ t("options.activeAccounts.color") }}<br />
							{{ t("options.activeAccounts.sumAndCompare") }}
						</span>
					</label>
					<div class="flex flex-col justify-center gap-1">
						<div v-for="(a, i) in allAccounts" :key="i" class="flex justify-between gap-2">
							<label class="cursor-pointer truncate grow-0">
								<input type="checkbox" :value="a.id" v-model="options.accounts" />
								<span class="pl-2">{{ a.name }}</span>
							</label>
							<label :for="'color-' + a.name" class="cursor-pointer flex items-center gap-2">
								<input type="color" :id="'color-' + a.name" v-model="options.accountColors[a.id]" />
								<span class="font-mono text-xs">{{ options.accountColors[a.id] }}</span>
							</label>
						</div>
					</div>
				</div>

				<!-- option: selfMessages -->
				<div class="grid grid-cols-option gap-8">
					<label for="selfMessages">
						<div class="flex items-end gap-2">
							{{ t("options.selfMessages.label") }}
							<tooltip :content="t('options.note.refreshCacheRequired')">
								<icon-database-exclamation class="!w-5 !h-5" />
							</tooltip>
						</div>
						<span class="block text-zinc-500">
							{{ t("options.selfMessages.description") }}
						</span>
					</label>
					<div class="flex self-center flex-wrap gap-2">
						<select class="grow mb-0-5" v-model="options.selfMessages" id="selfMessages">
							<option v-for="val in selfMessagesOptions" :key="val" :value="val">{{ t("options.selfMessages.values." + val) }}</option>
						</select>
						<div class="flex gap-2 items-center text-zinc-500 text-sm">
							<icon-info-square class="!w-5 !h-5 shrink-0" />
							<span>{{ t("options.selfMessages.info." + options.selfMessages) }}</span>
						</div>
					</div>
				</div>

				<!-- option: maxListCount -->
				<div class="grid grid-cols-option gap-8">
					<label for="maxListCount">
						<div class="flex items-end gap-2">
							{{ t("options.maxListCount.label") }}
							<tooltip :content="t('options.note.refreshCacheRequired')">
								<icon-database-exclamation class="!w-5 !h-5" />
							</tooltip>
						</div>
						<span class="block text-zinc-500">
							{{ t("options.maxListCount.description") }}
						</span>
					</label>
					<div class="self-center">
						<input
							class="grow"
							id="maxListCount"
							type="number"
							v-model="options.maxListCount"
							placeholder="20"
							min="1"
							max="999"
							step="1"
							@change="checkMaxListCount()"
						/>
					</div>
				</div>
			</section>

			<!-- section related to store processed data -->
			<section class="flex flex-col gap-4">
				<h2 class="text-2xl font-light pb-2">{{ t("options.headings.storage") }}</h2>

				<!-- option: cache -->
				<div class="grid grid-cols-option gap-8">
					<label for="cache">
						{{ t("options.cache.label") }}
						<span class="block text-zinc-500">
							{{ t("options.cache.description") }}
						</span>
					</label>
					<div class="self-center">
						<input type="checkbox" id="cache" v-model="options.cache" />
					</div>
				</div>

				<!-- action: clear cache -->
				<div class="grid grid-cols-option gap-8">
					<label>
						{{ t("options.clearCache.label") }}
						<span class="block text-zinc-500">
							{{ t("options.clearCache.description") }}
						</span>
					</label>
					<div class="flex flex-col self-center items-start gap-2">
						<btn @click="clearCache" class="flex gap-2 items-center">
							<icon-database-x class="!w-5 !h-5" />
							{{ t("options.clearCache.label") }}
						</btn>
						<div class="flex gap-2 items-center text-zinc-500 text-sm">
							<icon-info-square class="!w-5 !h-5 shrink-0" />
							<span v-if="cacheSize > 0">{{ t("options.clearCache.size", [formattedCacheSize]) }}</span>
							<span v-else>{{ t("options.clearCache.empty") }}</span>
						</div>
					</div>
				</div>

				<!-- action: reset options -->
				<div class="grid grid-cols-option gap-8">
					<label>
						<div class="flex items-end gap-2">
							{{ t("options.resetOptions.label") }}
							<tooltip :content="t('options.note.reloadWindowRequired')">
								<icon-refresh-alert class="!w-5 !h-5" />
							</tooltip>
							<tooltip :content="t('options.note.refreshCacheRequired')">
								<icon-database-exclamation class="!w-5 !h-5" />
							</tooltip>
						</div>
						<span class="block text-zinc-500">
							{{ t("options.resetOptions.description") }}
						</span>
					</label>
					<div class="flex flex-col self-center items-start gap-2">
						<btn @click="resetOptions" class="flex gap-2 items-center">
							<icon-settings-x class="!w-5 !h-5" />
							{{ t("options.resetOptions.label") }}
						</btn>
						<div
							v-if="options.addresses && options.addresses.length > 0"
							class="flex gap-2 items-center text-zinc-500 text-sm"
						>
							<icon-info-square class="!w-5 !h-5" />
							<span>{{ t("options.resetOptions.removeIdentities") }}</span>
						</div>
					</div>
				</div>
			</section>
		</div>
		<hr class="border-zinc-400 dark:border-zinc-700 my-8" />
		<footer class="flex flex-col gap-2 pb-8">
			<label>{{ t("options.note.title") }}</label>
			<div class="text-zinc-500 text-sm">
				{{ t("options.note.reloadStatsPage") }}
			</div>
			<div class="flex items-center gap-2 text-zinc-500 text-sm">
				<icon-refresh-alert class="!w-5 !h-5" />
				{{ t("options.note.reloadWindowRequired") }}
			</div>
			<div class="flex items-center gap-2 text-zinc-500 text-sm">
				<icon-database-exclamation class="!w-5 !h-5" />
				{{ t("options.note.refreshCacheRequired") }}
			</div>
		</footer>
		<project-meta class="mt-6 pb-6" />
	</div>
</template>

<script setup>
import { defaultColors, defaultOptions } from '@/definitions.js';
import { formatBytes, setTheme } from '@/utils.js';
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Btn from "@/components/Btn.vue";
import IconDatabaseExclamation from "@/icons/IconDatabaseExclamation.vue";
import IconDatabaseX from "@/icons/IconDatabaseX.vue";
import IconInfoSquare from "@/icons/IconInfoSquare.vue";
import IconPlus from "@/icons/IconPlus.vue";
import IconRefreshAlert from "@/icons/IconRefreshAlert.vue";
import IconSettingsX from "@/icons/IconSettingsX.vue";
import IconThirdStats from "@/icons/IconThirdStats.vue";
import IconX from "@/icons/IconX.vue";
import ProjectMeta from '@/parts/ProjectMeta.vue'
import Tooltip from "@/components/Tooltip.vue";

const { t, locale } = useI18n();

const input = ref({ address: '' });
const allAccounts = ref([]);
const cacheSize = ref(-1);

// all valid option values for selfMessages
const selfMessagesOptions = [
	"none",
	"sameAccount",
	"anyAccount",
];

// true if options are opened in own options page or false if embedded
const ownOptionsPage = Boolean(
	(new URLSearchParams(window.location.search.substring(1))).get("s")
);

// create options object with default values
const options = ref(defaultOptions);

// get all saved add-on settings
const getSettings = async () => {
	// show scroll bar if own options page
	if (ownOptionsPage) {
		document.body.classList.remove('overflow-y-hidden');
	}
	// only load options from storage if they have been set, otherwise default settings will be kept
	const result = await messenger.storage.local.get("options");
	if (result && result.options) {
		// merge option objects to overwrite attributes by saved ones while keeping new attributes
		options.value = {...options.value, ...result.options};
		// handle theme
		const darkClasses = ['dark'];
		if (!ownOptionsPage) {
			darkClasses.push('!bg-tboptions');
		}
		setTheme(options.value.theme, [document.documentElement, document.body], darkClasses);
	}
};

// get all existing accounts
const getAccounts = async () => {
	const accounts = await (await messenger.runtime.getBackgroundPage()).messenger.accounts.list();
	allAccounts.value = accounts;
	// if accounts option is not set yet, default to all accounts
	if (options.value?.accounts && options.value.accounts.length == 0) {
		// update accounts option
		options.value.accounts = accounts.map(a => a.id);
	}
	// if some or all account colors are not initialized yet, initialize them
	if (options.value && options.value.accountColors) {
		allAccounts.value.forEach((a, i) => {
			if (!options.value.accountColors.hasOwnProperty(a.id)) {
				options.value.accountColors[a.id] = defaultColors[(i%defaultColors.length)]
			}
		})
	}
};

// get size of all cached account data
const getCacheSize = async () => {
	const allEntriesSize = new TextEncoder().encode(
		Object.entries(await messenger.storage.local.get())
			.map(([key, value]) => key + JSON.stringify(value))
			.join("")
	).length;
	const optionsSize = new TextEncoder().encode(
		Object.entries(await messenger.storage.local.get("options"))
			.map(([key, value]) => key + JSON.stringify(value))
			.join("")
	).length;
	cacheSize.value = allEntriesSize - optionsSize;
};

// add configured email address to list of addresses and save it
const addAddress = async () => {
	if (input.value.address) {
		let addresses = options.value.addresses ? options.value.addresses + "," : "";
		addresses += input.value.address;
		await messenger.storage.local.set({ options: { addresses: addresses } });
		options.value.addresses = addresses;
		input.value.address = "";
	}
};

// remove given email address from list of addresses and delete it
const removeAddress = async (address) => {
	let addresses = options.value.addresses.replace(address, "");
	addresses = addresses.replace(/,,/g, ",");
	addresses = addresses.replace(/^,+|,+$/g, "");;
	await messenger.storage.local.set({ options: { addresses: addresses } });
	options.value.addresses = addresses;
};

// check auto refresh number input to stay in allowed range
const checkAutoRefreshInterval = () => {
	if (options.value.autoRefreshInterval < 5) {
		options.value.autoRefreshInterval = 5;
	}
};

// check leader count input to stay in allowed range
const checkMaxListCount = () => {
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
	options.value = defaultOptions;
	await getAccounts();
};

// array of email addresses configured for local account identities
const addressList = computed(() => {
	return options.value && options.value.addresses
		? options.value.addresses.split(",")
		: [];
});

// output cache size in human readable format with units
const formattedCacheSize = computed(() => {
	return formatBytes(cacheSize.value);
});

// save options object on each single option change
watch(
	() => options.value,
	(newOptions) => {
		messenger.storage.local.set({ options: JSON.parse(JSON.stringify(newOptions)) });
		const darkClasses = ['dark'];
		if (!ownOptionsPage) {
			darkClasses.push('!bg-tboptions');
		}
		setTheme(newOptions.theme, [document.documentElement, document.body], darkClasses);
	},
	{
		deep: true,
		immediate: false
	}
);

onMounted(async () => {
	// initially load settings
	await getSettings();
	// initially load accounts
	getAccounts();
	// initially load cache size
	getCacheSize();
});
</script>
