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
				<option-row field="theme">
					<select class="grow" v-model="options.theme" id="theme">
						<option v-for="theme in ['system', 'light', 'dark']" :key="theme" :value="theme">
							{{ t(`options.theme.${theme}`) }}
						</option>
					</select>
				</option-row>

				<!-- option: ordinate -->
				<option-row field="ordinate">
					<input type="checkbox" id="ordinate" v-model="options.ordinate" />
				</option-row>

				<!-- option: tag colors -->
				<option-row field="tagColors">
					<input type="checkbox" id="tagColors" v-model="options.tagColors" />
				</option-row>

				<!-- option: live count up -->
				<option-row field="liveCountUp" info>
					<input type="checkbox" id="liveCountUp" v-model="options.liveCountUp" />
				</option-row>

				<!-- option: auto processing -->
				<option-row field="autoRefresh" requires-reload>
					<div class="flex items-center gap-4">
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
				</option-row>

			</section>

			<!-- section related to charts and data retrieval -->
			<section class="flex flex-col gap-4">
				<h2 class="text-2xl font-light pb-2">{{ t("options.headings.stats") }}</h2>

				<!-- option: startOfWeek -->
				<!-- <option-row field="startOfWeek">
					<select class="grow" v-model="options.startOfWeek" id="startOfWeek">
						<option v-for="(name, pos) in weekdayNames(locale)" :key="pos" :value="pos">
							{{ name }}
						</option>
					</select>
				</option-row> -->

				<!-- option: addresses -->
				<option-row field="identities" requires-reprocessing>
					<div class="flex flex-col gap-2">
						<div class="flex">
							<input
								class="grow"
								type="email"
								v-model="input.address"
								placeholder="hello@devmount.de"
								id="identities"
							/>
							<btn @click="addAddress" class="rounded-l-none">
								<icon-plus class="!w-5 !h-5" />
							</btn>
						</div>
						<div class="flex flex-wrap items-center gap-2">
							<tag v-for="a in addressList" :key="a" :label="a" @remove="removeAddress(a)" />
						</div>
					</div>
				</option-row>

				<!-- option: account selection -->
				<option-row
					v-if="options.accounts"
					field="activeAccounts"
					:description="`
						${t('options.activeAccounts.description')}
						${t('options.activeAccounts.color')}
						${t('options.activeAccounts.sumAndCompare')}
					`"
					requires-reload
				>
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
				</option-row>

				<!-- option: selfMessages -->
				<option-row
					field="selfMessages"
					:info-text="t(`options.selfMessages.info.${options.selfMessages}`)"
					requires-reprocessing
				>
					<select class="grow" v-model="options.selfMessages" id="selfMessages">
						<option v-for="val in selfMessagesOptions" :key="val" :value="val">
							{{ t(`options.selfMessages.values.${val}`) }}
						</option>
					</select>
				</option-row>

				<!-- option: maxListCount -->
				<option-row field="maxListCount" requires-reprocessing>
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
				</option-row>
			</section>

			<!-- section related to store processed data -->
			<section class="flex flex-col gap-4">
				<h2 class="text-2xl font-light pb-2">{{ t("options.headings.storage") }}</h2>

				<!-- option: cache -->
				<option-row field="cache">
					<input type="checkbox" id="cache" v-model="options.cache" />
				</option-row>

				<!-- action: clear cache -->
				<option-row
					field="clearCache"
					:info-text="
						cacheSize > 0
							? t('options.clearCache.size', [formattedCacheSize])
							: t('options.clearCache.empty')
					"
				>
					<btn @click="clearCache" class="py-4 px-8 self-start">
						<icon-database-x class="!w-5 !h-5" />
						{{ t("options.clearCache.label") }}
					</btn>
				</option-row>

				<!-- action: reset options -->
				<option-row
					field="resetOptions"
					:info="options.addresses && options.addresses.length > 0"
					requires-reload
					requires-reprocessing
				>
					<btn @click="resetOptions" class="py-4 px-8 self-start" em>
						<icon-settings-x class="!w-5 !h-5" />
						{{ t("options.resetOptions.label") }}
					</btn>
				</option-row>

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
import ProjectMeta from '@/partials/ProjectMeta.vue'
import Tooltip from "@/components/Tooltip.vue";
import OptionRow from "@/components/OptionRow.vue";
import Tag from "@/components/Tag.vue";

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
		const lightClasses = ['light'];
		if (!ownOptionsPage) {
			darkClasses.push('!bg-tboptions');
			lightClasses.push('!bg-white');
		}
		setTheme(options.value.theme, [document.documentElement, document.body], darkClasses, lightClasses);
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
		const lightClasses = ['light'];
		if (!ownOptionsPage) {
			darkClasses.push('!bg-tboptions');
			lightClasses.push('!bg-white');
		}
		setTheme(options.value.theme, [document.documentElement, document.body], darkClasses, lightClasses);
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
