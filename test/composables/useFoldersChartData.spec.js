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
});
