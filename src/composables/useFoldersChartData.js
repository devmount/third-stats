// chart-data shaping for the "folders" section (emails per folder, folder size tree, largest emails)
import { computed } from 'vue';
import { accentColors } from '@/definitions.js';
import { buildFolderTree } from '@/composables/folderTree.js';

export function useFoldersChartData({ display, locale, t, options, accountFolders }) {
	// undefined means no limit, which is what Array.prototype.slice does with it
	const listLimit = computed(() => (options?.maxListCount > 0 ? options.maxListCount : undefined));

	// prepare data for emails per folder doughnut charts
	const foldersChartData = computed(() => {
		const r = display.value.folders.received,
			s = display.value.folders.sent;
		let dr = [],
			ds = [],
			labels = [];
		let all = Array.from(new Set([...Object.keys(r), ...Object.keys(s)]));
		all.sort((a, b) => a.localeCompare(b, locale.value, { sensitivity: 'base' }));
		all.forEach((d) => {
			dr.push(r[d] ? r[d] : 0);
			ds.push(s[d] ? s[d] : 0);
			labels.push(d);
		});
		return {
			datasets: [
				{
					label: t('stats.mailsReceived'),
					data: dr,
					color: accentColors[1],
				},
				{
					label: t('stats.mailsSent'),
					data: ds,
					color: accentColors[0],
				},
			],
			labels: labels,
		};
	});

	// stats cached before sizes were collected have no folders.sizes, and the tree stays
	// empty until the live folder hierarchy in <accountFolders> has been loaded
	const folderTree = computed(() => buildFolderTree(accountFolders?.value ?? [], display.value.folders.sizes));
	const folderTreeExists = computed(() => folderTree.value.length > 0);

	const largestMessages = computed(() => (display.value.largestMessages ?? []).slice(0, listLimit.value));
	const largestMessagesExist = computed(() => largestMessages.value.length > 0);

	return {
		foldersChartData,
		folderTree,
		folderTreeExists,
		largestMessages,
		largestMessagesExist,
	};
}
