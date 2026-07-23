import { describe, expect, it } from 'vitest';
import { computed, ref } from 'vue';
import { useTotalChartData } from '@/composables/useTotalChartData.js';
import { weeksBetween } from '@/utils.js';

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

	it('quartersComparedChartData trims to minDate/maxDate and builds one dataset per account', () => {
		const ctx = buildContext();
		ctx.minYear.value = 2023;
		ctx.maxYear.value = 2023;
		ctx.accounts.value = [{ id: 'acct1', name: 'Account 1' }];
		ctx.options.accountColors = { acct1: '#123456' };
		ctx.comparison.value.quartersData = { acct1: { 2023: { 1: 9 } } };
		const { quartersComparedChartData } = useTotalChartData(ctx);

		// minDate is Jan 15 2023 (Q1), maxDate is Apr 15 2023 (Q2) -> only Q1 and Q2
		expect(quartersComparedChartData.value.labels.length).toBe(2);
		expect(quartersComparedChartData.value.datasets).toHaveLength(1);
		expect(quartersComparedChartData.value.datasets[0].data).toEqual([9, 0]);
		expect(quartersComparedChartData.value.datasets[0].borderColor).toBe('#123456');
	});

	it('monthsChartData trims to the months within minDate/maxDate for the first/last year', () => {
		const ctx = buildContext();
		ctx.minYear.value = 2023;
		ctx.maxYear.value = 2023;
		ctx.minDate = computed(() => new Date(2023, 2, 15)); // March
		ctx.maxDate = computed(() => new Date(2023, 4, 15)); // May
		ctx.display.value.monthsData = {
			received: { 2023: { 2: 10, 3: 20, 4: 30 } },
			sent: { 2023: { 2: 1, 3: 2, 4: 3 } },
		};
		const { monthsChartData } = useTotalChartData(ctx);

		expect(monthsChartData.value.labels).toEqual(['2023 Mar', '2023 Apr', '2023 May']);
		expect(monthsChartData.value.datasets[0].data).toEqual([1, 2, 3]); // sent
		expect(monthsChartData.value.datasets[1].data).toEqual([10, 20, 30]); // received
	});

	it('monthsComparedChartData trims to minDate/maxDate and builds one dataset per account', () => {
		const ctx = buildContext();
		ctx.minYear.value = 2023;
		ctx.maxYear.value = 2023;
		ctx.minDate = computed(() => new Date(2023, 2, 15));
		ctx.maxDate = computed(() => new Date(2023, 4, 15));
		ctx.accounts.value = [{ id: 'acct1', name: 'Account 1' }];
		ctx.options.accountColors = { acct1: '#123456' };
		ctx.comparison.value.monthsData = { acct1: { 2023: { 3: 7 } } };
		const { monthsComparedChartData } = useTotalChartData(ctx);

		expect(monthsComparedChartData.value.labels).toEqual(['2023 Mar', '2023 Apr', '2023 May']);
		expect(monthsComparedChartData.value.datasets[0].data).toEqual([0, 7, 0]);
		expect(monthsComparedChartData.value.datasets[0].borderColor).toBe('#123456');
	});

	it('weeksChartData labels/fills data for exactly the weeks between minDate and maxDate', () => {
		const ctx = buildContext();
		const minDate = new Date(2023, 0, 1);
		const maxDate = new Date(2023, 0, 22);
		ctx.minDate = computed(() => minDate);
		ctx.maxDate = computed(() => maxDate);
		const weeks = weeksBetween(minDate, maxDate);
		const [firstYear, firstWeek] = weeks[0];
		ctx.display.value.weeksData = {
			received: { [firstYear]: { [firstWeek]: 5 } },
			sent: {},
		};
		const { weeksChartData } = useTotalChartData(ctx);

		expect(weeksChartData.value.labels).toEqual(weeks.map(([y, w]) => `${y} stats.abbreviations.calendarWeek${w}`));
		expect(weeksChartData.value.datasets[1].data[0]).toBe(5); // received, first week
		expect(weeksChartData.value.datasets[1].data.slice(1).every((n) => n === 0)).toBe(true);
		expect(weeksChartData.value.datasets[0].data.every((n) => n === 0)).toBe(true); // sent, untouched
	});

	it('weeksComparedChartData builds one 0-filled dataset per account across the same weeks', () => {
		const ctx = buildContext();
		const minDate = new Date(2023, 0, 1);
		const maxDate = new Date(2023, 0, 22);
		ctx.minDate = computed(() => minDate);
		ctx.maxDate = computed(() => maxDate);
		const weeks = weeksBetween(minDate, maxDate);
		const [firstYear, firstWeek] = weeks[0];
		ctx.accounts.value = [{ id: 'acct1', name: 'Account 1' }];
		ctx.options.accountColors = { acct1: '#123456' };
		ctx.comparison.value.weeksData = { acct1: { [firstYear]: { [firstWeek]: 3 } } };
		const { weeksComparedChartData } = useTotalChartData(ctx);

		expect(weeksComparedChartData.value.labels).toHaveLength(weeks.length);
		expect(weeksComparedChartData.value.datasets[0].data[0]).toBe(3);
		expect(weeksComparedChartData.value.datasets[0].data.slice(1).every((n) => n === 0)).toBe(true);
		expect(weeksComparedChartData.value.datasets[0].borderColor).toBe('#123456');
	});
});
