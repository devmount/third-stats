<template>
	<div class="tab-area" v-if="display.folders">
		<section-tab-header v-model:tab="tabFolders" :tabs="tabsFolders" border-variant="static-gradient" />
		<div class="tab-content">
			<!-- folders emails received -->
			<doughnut-chart
				v-if="tabFolders === tabsFolders.foldersDistribution"
				:info="{
					number: foldersChartData.labels.length,
					label: t('stats.nonEmptyFolders', foldersChartData.labels.length),
				}"
				:datasets="foldersChartData.datasets"
				:labels="foldersChartData.labels"
			/>
			<!-- total size of emails per account and folder, as a tree -->
			<div v-if="tabFolders === tabsFolders.foldersSize && folderTreeExists" class="folder-tree">
				<ul>
					<folder-tree-node v-for="account in folderTree" :key="account.key" :node="account" />
				</ul>
			</div>
			<!-- emails with the largest size -->
			<div v-if="tabFolders === tabsFolders.largestEmails && largestMessagesExist" class="largest-emails">
				<table>
					<thead>
						<tr>
							<th class="size">{{ t('stats.charts.largestEmails.size') }}</th>
							<th>{{ t('stats.charts.largestEmails.subject') }}</th>
							<th>{{ t('stats.charts.largestEmails.from') }}</th>
							<th>{{ t('stats.charts.largestEmails.folder') }}</th>
							<th>{{ t('stats.charts.largestEmails.date') }}</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(m, i) in largestMessages" :key="i">
							<td class="size">{{ formatBytes(m.size, 1) }}</td>
							<td class="truncate" :title="m.subject">
								<span v-if="isNotFound(i, 'subject')" class="not-found">
									{{ t('stats.charts.largestEmails.notFound') }}
								</span>
								<a v-else-if="m.headerMessageId" href="#" @click.prevent="openEmail(m, i)">
									{{ m.subject || t('stats.charts.largestEmails.noSubject') }}
								</a>
								<template v-else>{{ m.subject || t('stats.charts.largestEmails.noSubject') }}</template>
							</td>
							<td class="truncate" :title="m.author">{{ m.author }}</td>
							<td class="truncate" :title="m.folder">
								<span v-if="isNotFound(i, 'folder')" class="not-found">
									{{ t('stats.charts.foldersSize.notFound') }}
								</span>
								<a v-else-if="folderIdOf(m)" href="#" @click.prevent="jumpToFolder(m, i)">{{ m.folder }}</a>
								<template v-else>{{ m.folder }}</template>
							</td>
							<td class="date" :title="formatDate(m.date, locale)">
								{{ new Date(m.date).toLocaleDateString(locale) }}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div v-if="emptyMessage" class="tab-empty">
				<ts-icon size="large" variant="gray" weight="thin">
					<path stroke="none" d="M0 0h24v24H0z" fill="none" />
					<path
						d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74"
					/>
					<path
						d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6"
					/>
					<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
					<line x1="3" y1="3" x2="21" y2="21" />
				</ts-icon>
				<div>{{ emptyMessage }}</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, inject, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { tabsFolders } from '@/definitions.js';
import { formatBytes, formatDate, loadAccountFolders, openFolder, openMessage } from '@/utils.js';
import { findFolderId } from '@/composables/folderTree.js';
import { useFoldersChartData } from '@/composables/useFoldersChartData.js';
import DoughnutChart from '@/charts/DoughnutChart.vue';
import FolderTreeNode from '@/parts/stats/FolderTreeNode.vue';
import SectionTabHeader from '@/parts/SectionTabHeader.vue';

const { display, options, accounts } = inject('engine');

const { t, locale } = useI18n();

// tab navigation local to this section
const tabFolders = ref(tabsFolders.foldersDistribution);

// hierarchy and display names come from Thunderbird, folder paths must not be parsed
const accountFolders = ref([]);
let latestLoad = 0;
// reloaded with every processing run, folders may have been added, renamed or moved since
watch(
	[accounts, () => display.value.meta?.timestamp],
	async ([list]) => {
		const load = ++latestLoad;
		const loaded = await loadAccountFolders(list);
		// an older request may answer after a newer one
		if (load === latestLoad) accountFolders.value = loaded;
	},
	{ immediate: true }
);

const { foldersChartData, folderTree, folderTreeExists, largestMessages, largestMessagesExist } = useFoldersChartData({
	display,
	locale,
	t,
	options,
	accountFolders,
});

// text of the empty state of the current tab, if it has nothing to show
const emptyMessage = computed(() => {
	if (tabFolders.value === tabsFolders.foldersSize && !folderTreeExists.value) {
		return t('stats.charts.foldersSize.empty');
	}
	if (tabFolders.value === tabsFolders.largestEmails && !largestMessagesExist.value) {
		return t('stats.charts.largestEmails.empty');
	}
	return null;
});

// table cell whose email or folder couldn't be opened, shown briefly in place of its text
const notFoundCell = ref(null);
let notFoundTimeout = null;

const isNotFound = (row, column) => notFoundCell.value?.row === row && notFoundCell.value?.column === column;

const flagNotFound = (row, column) => {
	clearTimeout(notFoundTimeout);
	notFoundCell.value = { row, column };
	notFoundTimeout = setTimeout(() => (notFoundCell.value = null), 2000);
};

const openEmail = async (message, row) => {
	if (!(await openMessage(message.headerMessageId))) flagNotFound(row, 'subject');
};

const folderIdOf = (message) => findFolderId(accountFolders.value, message.accountId, message.folderPath);

const jumpToFolder = async (message, row) => {
	if (!(await openFolder(folderIdOf(message)))) flagNotFound(row, 'folder');
};
</script>

<style scoped>
.folder-tree {
	/* matches the min-height of chart tabs so the section keeps its size */
	max-height: 380px;
	overflow-y: auto;

	> ul {
		margin: 0;
		padding: 0;
	}
}
.largest-emails {
	/* matches the min-height of chart tabs so the section keeps its size */
	max-height: 380px;
	overflow-y: auto;

	table {
		width: 100%;
		border-collapse: collapse;
		/* fixed layout is what lets the text columns truncate instead of widening the table */
		table-layout: fixed;
		font-size: 0.875rem;
	}
	th,
	td {
		padding: 0.35rem 0.5rem;
		text-align: left;
		border-bottom: 1px solid var(--color-border);
	}
	th {
		position: sticky;
		top: 0;
		font-weight: normal;
		color: var(--color-text-gray);
		background: var(--color-bg);
		/* a collapsed border scrolls away from a sticky cell, a shadow stays */
		border-bottom: none;
		box-shadow: inset 0 -1px 0 var(--color-border);
	}
	.size {
		width: 6rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.date {
		white-space: nowrap;
	}
	th:nth-child(5) {
		width: 7rem;
	}
	.not-found {
		color: var(--color-text-gray);
	}
	.truncate {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}
</style>
