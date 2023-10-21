<template>
	<div class="relative">
		<div class="flex flex-col gap-4 p-4">
			<!-- header containing number of accounts and linking to stats page -->
			<header class="flex justify-between items-center">
				<h3 class="font-normal text-xl flex gap-4 items-center">
					<span>{{ t("popup.nAccounts", accounts.length, [accounts.length]) }}</span>
					<loader v-if="loading"></loader>
				</h3>
				<div class="flex gap-2">
					<tooltip
						class="group cursor-pointer"
						:content="t('popup.openAllStats')"
						position="left"
						@click="openTab('index.stats.html', accounts.length > 1 ? 'sum' : accounts[0].id)"
					>
						<icon-third-stats class="!w-6 !h-6" />
					</tooltip>
					<tooltip
						class="group cursor-pointer"
						:content="t('popup.openOptions')"
						position="left"
						@click="openTab('index.options.html', 1)"
					>
						<icon-settings class="!w-6 !h-6" />
					</tooltip>
				</div>
			</header>
			<!-- list of all accounts -->
			<section class="grid grid-cols-2 gap-5">
				<div
					v-for="a in accounts"
					:key="a.id"
					class="
						group relative cursor-pointer shadow-xl py-3 px-4 rounded transition-colors
						bg-white dark:bg-zinc-800 hover:!bg-blue-500
					"
					@click.prevent="openTab('index.stats.html', a.id)"
				>
					<div class="position-relative z-5">
						<h4 class="whitespace-nowrap w-full truncate font-semibold text-sm group-hover:!text-white">
							{{ a.name }}
						</h4>
						<div class="text-xs text-zinc-700 dark:text-zinc-400 group-hover:!text-white">
							<div>{{ t("popup.nFolders", [a.folderCount], a.folderCount) }}</div>
							<div v-if="a.hasOwnProperty('messageCount')">
								{{ t("popup.nMessages", [a.messageCount], a.messageCount) }}
							</div>
						</div>
					</div>
					<line-chart
						v-if="a.hasOwnProperty('messageCount') && a.messageCount > 0"
						class="absolute bottom-0 left-0 z-0"
						:datasets="a.yearsData.datasets"
						:labels="a.yearsData.labels"
						:ordinate="false"
						:abscissa="false"
						:tooltips="false"
						:thickness="1"
						width="180px"
						height="70px"
					/>
				</div>
			</section>
			<project-meta class="mt-2" :compact="true" />
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { traverseAccount, setTheme, openTab } from "@/utils.js";
import { useI18n } from 'vue-i18n';
import IconSettings from "@/icons/IconSettings.vue";
import IconThirdStats from "@/icons/IconThirdStats.vue";
import Tooltip from "@/components/Tooltip.vue";
import Loader from "@/components/Loader.vue";
import LineChart from "@/charts/LineChart.vue";
import ProjectMeta from "@/parts/ProjectMeta.vue";

const { t } = useI18n();

const accounts = ref([]);   // list of all existing accounts
const loading = ref(false); // processessing folder and message counts indication
const options = reactive({  // relevant add-on options
	accounts: [],             // accounts to process
	dark: true,               // dark theme
	cache: true,              // wether caching system is enabled or not
});

// get all stored add-on options that are needed
// provides default value if option is not set
const getOptions = async () => {
	const result = await messenger.storage.local.get("options")
	// only load needed options if they have been set, otherwise default settings will be kept
	if (result && result.options) {
		options.dark = setTheme(result.options.theme ?? 'system');
		options.accounts = result.options.accounts ? result.options.accounts : []
		options.cache = result.options.cache ? true : false
	}
};

// retrieve all thunderbird accounts
// add folder count to account object
const getAccounts = async () => {
	let accountList = await messenger.accounts.list();
	// filter list of accounts if user configured custom list
	if (options.accounts.length > 0 && options.accounts.length < accountList.length) {
		accountList = accountList.filter(a => options.accounts.includes(a.id));
	}
	// expand account object with additional data
	await Promise.all(accountList.map(async a => {
		// calculate folder count and append to account object
		const folders = traverseAccount(a);
		a.folderCount = folders.length;
		// get overall message count when cache is enabled
		if (options.cache) {
			const stored = await messenger.storage.local.get("stats-" + a.id);
			if (stored && stored["stats-" + a.id]) {
				// add message count
				a.messageCount = stored["stats-" + a.id].numbers.total;
				// add years data
				if (a.messageCount > 0) {
					const r = stored["stats-" + a.id].yearsData.received;
					const s = stored["stats-" + a.id].yearsData.sent;
					let labels = [], d = [];
					const start = new Date(stored["stats-" + a.id].meta.start);
					const end = stored["stats-" + a.id].meta.end ? new Date(stored["stats-" + a.id].meta.end) : new Date();
					for (let y = start.getFullYear(); y <= end.getFullYear(); ++y) {
						labels.push(y);
						d.push((y in r ? r[y] : 0) + (y in s ? s[y] : 0));
					}
					a.yearsData = {
						datasets: [
							{ label: "placeholder", data: d, borderColor: options.dark ? "#f9f9fa15" : "#1d1d1f15" },
						],
						labels: labels
					};
				}
			}
		}
	}));
	accounts.value = accountList;
};

onMounted(async () => {
	// start loading indication
	loading.value = true;
	// get stored options
	await getOptions();
	// start account processing
	await getAccounts();
	// stop loading indication
	loading.value = false;
});
</script>
