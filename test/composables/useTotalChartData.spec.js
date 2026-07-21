import { describe, expect, it } from 'vitest';
import { computed, ref } from 'vue';
import { useTotalChartData } from '@/composables/useTotalChartData.js';

const stubT = (key, args) => (args !== undefined ? `${key}:${args}` : key);

describe('useTotalChartData', () => {
	const buildContext = (overrides = {}) => {
		const display = ref({
			yearsData: { received: { 2021: 5, 2023: 2 }, sent: { 2022: 1 } },
			quartersData: {
				received: { 2023: { 1: 3, 2: 4 } },
				sent: { 2023: { 1: 1 } },
			},
			monthsData: { received: {}, sent: {} },
			weeksData: { received: {}, sent: {} },
		});
		const comparison = ref({ yearsData: {}, quartersData: {}, monthsData: {}, weeksData: {} });
		const accounts = ref([]);
		const options = { accountColors: {} };
		const minYear = ref(2021);
		const maxYear = ref(2023);
		const minDate = computed(() => new Date(2023, 0, 15));
		const maxDate = computed(() => new Date(2023, 3, 15));
		const locale = ref('en');
		return {
			display,
			comparison,
			accounts,
			options,
			minYear,
			maxYear,
			minDate,
			maxDate,
			t: stubT,
			locale,
			...overrides,
		};
	};

	it('fills gaps between minYear and maxYear with 0, not just years that have data', () => {
		const ctx = buildContext();
		const { yearsChartData } = useTotalChartData(ctx);
		expect(yearsChartData.value.labels).toEqual([2021, 2022, 2023]);
		// datasets[0] = sent, datasets[1] = received (per source order)
		expect(yearsChartData.value.datasets[0].data).toEqual([0, 1, 0]);
		expect(yearsChartData.value.datasets[1].data).toEqual([5, 0, 2]);
	});

	it('trims quarters to the range within minDate/maxDate for the first/last year', () => {
		const ctx = buildContext();
		ctx.minYear.value = 2023;
		ctx.maxYear.value = 2023;
		const { quartersChartData } = useTotalChartData(ctx);
		// minDate is Jan 15 2023 (Q1), maxDate is Apr 15 2023 (Q2) -> only Q1 and Q2 included
		expect(quartersChartData.value.labels.length).toBe(2);
		expect(quartersChartData.value.datasets[0].data).toEqual([1, 0]); // sent
		expect(quartersChartData.value.datasets[1].data).toEqual([3, 4]); // received
	});

	it('produces one comparison dataset per account with 0-filled gaps and the account color', () => {
		const ctx = buildContext();
		ctx.accounts.value = [{ id: 'acct1', name: 'Account 1' }];
		ctx.options.accountColors = { acct1: '#123456' };
		ctx.comparison.value.yearsData = { acct1: { 2021: 4 } };
		const { yearsComparedChartData } = useTotalChartData(ctx);
		expect(yearsComparedChartData.value.labels).toEqual([2021, 2022, 2023]);
		expect(yearsComparedChartData.value.datasets).toHaveLength(1);
		expect(yearsComparedChartData.value.datasets[0].data).toEqual([4, 0, 0]);
		expect(yearsComparedChartData.value.datasets[0].borderColor).toBe('#123456');
	});
});
