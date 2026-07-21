import { describe, expect, it } from 'vitest';
import { reactive, ref } from 'vue';
import { useActivityChartData } from '@/composables/useActivityChartData.js';

const stubT = (key) => key;

describe('useActivityChartData', () => {
	it('zero-fills every day of the selected year, even with no messages', () => {
		const display = ref({ dateData: { received: {}, sent: {} } });
		const activityPrefs = reactive({ year: 2023 });
		const { dateChartData } = useActivityChartData({ display, activityPrefs, t: stubT });
		// 2023 is not a leap year -> 365 days
		expect(dateChartData.value.received.data.length).toBe(365);
		expect(dateChartData.value.sent.data.length).toBe(365);
		expect(dateChartData.value.received.data.every(([, count]) => count === 0)).toBe(true);
	});

	it('excludes data belonging to a different year from the received counts', () => {
		const display = ref({
			dateData: {
				received: { '2022-12-31': 9 },
				sent: {},
			},
		});
		const activityPrefs = reactive({ year: 2023 });
		const { dateChartData } = useActivityChartData({ display, activityPrefs, t: stubT });
		// the 2022 entry must not leak into any day of the 2023 series
		expect(dateChartData.value.received.data.every(([, count]) => count !== 9)).toBe(true);
	});

	it('reacts to a change in the selected year', () => {
		const display = ref({ dateData: { received: { '2024-01-01': 7 }, sent: {} } });
		const activityPrefs = reactive({ year: 2023 });
		const { dateChartData } = useActivityChartData({ display, activityPrefs, t: stubT });
		expect(dateChartData.value.received.data.some(([key]) => key === '2024-01-01')).toBe(false);
		activityPrefs.year = 2024;
		expect(dateChartData.value.received.data.find(([key]) => key === '2024-01-01')[1]).toBe(7);
	});
});
