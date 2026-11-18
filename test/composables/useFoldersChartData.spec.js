import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useFoldersChartData } from '@/composables/useFoldersChartData.js';

const stubT = (key) => key;

describe('useFoldersChartData', () => {
	it('merges and sorts folder names from both received and sent, zero-filling the missing side', () => {
		const display = ref({ folders: { received: { Inbox: 5, Archive: 2 }, sent: { Sent: 3, Inbox: 1 } } });
		const locale = ref('en');
		const { foldersChartData } = useFoldersChartData({ display, locale, t: stubT });

		expect(foldersChartData.value.labels).toEqual(['Archive', 'Inbox', 'Sent']);
		// datasets[0] = received, datasets[1] = sent (per source order)
		expect(foldersChartData.value.datasets[0].data).toEqual([2, 5, 0]);
		expect(foldersChartData.value.datasets[1].data).toEqual([0, 1, 3]);
		expect(foldersChartData.value.datasets[0].label).toBe('stats.mailsReceived');
		expect(foldersChartData.value.datasets[1].label).toBe('stats.mailsSent');
	});

	it('sorts case-insensitively', () => {
		const display = ref({ folders: { received: { zeta: 1, Alpha: 2 }, sent: {} } });
		const locale = ref('en');
		const { foldersChartData } = useFoldersChartData({ display, locale, t: stubT });

		expect(foldersChartData.value.labels).toEqual(['Alpha', 'zeta']);
	});

	it('produces empty labels/data when there are no folders at all', () => {
		const display = ref({ folders: { received: {}, sent: {} } });
		const locale = ref('en');
		const { foldersChartData } = useFoldersChartData({ display, locale, t: stubT });

		expect(foldersChartData.value.labels).toEqual([]);
		expect(foldersChartData.value.datasets[0].data).toEqual([]);
		expect(foldersChartData.value.datasets[1].data).toEqual([]);
	});

	it('builds the folder size tree from the loaded account folders', () => {
		const display = ref({
			folders: { received: {}, sent: {}, sizes: { 'acc-1': { '/INBOX': 500, '/INBOX/Sub': 100 } } },
			largestMessages: [],
		});
		const accountFolders = ref([
			{
				id: 'acc-1',
				name: 'Work',
				rootFolder: {
					subFolders: [
						{
							id: 'f1',
							name: 'Inbox',
							path: '/INBOX',
							subFolders: [{ id: 'f2', name: 'Sub', path: '/INBOX/Sub', subFolders: [] }],
						},
					],
				},
			},
		]);
		const { folderTree, folderTreeExists } = useFoldersChartData({
			display,
			locale: ref('en'),
			t: stubT,
			accountFolders,
		});
		expect(folderTree.value.map((a) => [a.name, a.size])).toEqual([['Work', 600]]);
		expect(folderTree.value[0].children[0].children[0]).toMatchObject({ name: 'Sub', size: 100 });
		expect(folderTreeExists.value).toBe(true);
	});

	it('has no tree until the account folders are loaded', () => {
		const display = ref({ folders: { received: {}, sent: {}, sizes: { 'acc-1': { '/INBOX': 500 } } } });
		const { folderTree, folderTreeExists } = useFoldersChartData({
			display,
			locale: ref('en'),
			t: stubT,
			accountFolders: ref([]),
		});
		expect(folderTree.value).toEqual([]);
		expect(folderTreeExists.value).toBe(false);
	});

	it('trims largest messages to options.maxListCount', () => {
		const display = ref({
			folders: { received: {}, sent: {}, sizes: {} },
			largestMessages: [{ size: 3 }, { size: 2 }, { size: 1 }],
		});
		const { largestMessages, largestMessagesExist } = useFoldersChartData({
			display,
			locale: ref('en'),
			t: stubT,
			options: { maxListCount: 2 },
		});
		expect(largestMessages.value).toEqual([{ size: 3 }, { size: 2 }]);
		expect(largestMessagesExist.value).toBe(true);
	});

	it('reports no size data for stats cached before sizes existed', () => {
		const display = ref({ folders: { received: { Inbox: 1 }, sent: {} } });
		const { folderTree, folderTreeExists, largestMessages, largestMessagesExist } = useFoldersChartData({
			display,
			locale: ref('en'),
			t: stubT,
		});
		expect(folderTree.value).toEqual([]);
		expect(folderTreeExists.value).toBe(false);
		expect(largestMessages.value).toEqual([]);
		expect(largestMessagesExist.value).toBe(false);
	});
});
