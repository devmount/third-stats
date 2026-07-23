import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useOnedimChartData } from '@/composables/useOnedimChartData.js';

const stubT = (key, args) => (args !== undefined ? `${key}:${args}` : key);

describe('useOnedimChartData', () => {
	const buildContext = (overrides = {}) => {
		const display = ref({
			daytimeData: { received: { 0: 1, 1: 2 }, sent: { 0: 3, 1: 4 } },
			weekdayData: {
				received: { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7 },
				sent: { 0: 7, 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1 },
			},
			monthData: { received: { 0: 1, 1: 2 }, sent: { 0: 3, 1: 4 } },
		});
		const comparison = ref({ daytimeData: {}, weekdayData: {}, monthData: {} });
		const accounts = ref([]);
		const options = { accountColors: {}, startOfWeek: 1 };
		const locale = ref('en');
		return { display, comparison, accounts, options, t: stubT, locale, ...overrides };
	};

	it('daytimeChartData builds sent/received datasets with hour-of-day labels', () => {
		const ctx = buildContext();
		const { daytimeChartData } = useOnedimChartData(ctx);

		expect(daytimeChartData.value.labels).toEqual(['0', '1']);
		expect(daytimeChartData.value.datasets[0].data).toEqual([3, 4]); // sent
		expect(daytimeChartData.value.datasets[1].data).toEqual([1, 2]); // received
	});

	it('daytimeComparedChartData builds one dataset per account using its own color', () => {
		const ctx = buildContext();
		ctx.accounts.value = [{ id: 'a', name: 'Account A' }];
		ctx.options.accountColors = { a: '#111111' };
		ctx.comparison.value.daytimeData = { a: { 0: 5, 1: 6 } };
		const { daytimeComparedChartData } = useOnedimChartData(ctx);

		expect(daytimeComparedChartData.value.labels).toEqual(['0', '1']);
		expect(daytimeComparedChartData.value.datasets).toHaveLength(1);
		expect(daytimeComparedChartData.value.datasets[0]).toMatchObject({
			label: 'popup.nMessages:2 - Account A',
			data: [5, 6],
			borderColor: '#111111',
		});
	});

	it('weekdayChartData rotates data/labels according to options.startOfWeek', () => {
		const ctx = buildContext();
		const { weekdayChartData } = useOnedimChartData(ctx);

		expect(weekdayChartData.value.labels).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
		expect(weekdayChartData.value.datasets[1].data).toEqual([2, 3, 4, 5, 6, 7, 1]); // received, rotated
	});

	it('weekdayChartData uses a different rotation when options.startOfWeek changes', () => {
		const ctx = buildContext();
		ctx.options.startOfWeek = 3;
		const { weekdayChartData } = useOnedimChartData(ctx);

		expect(weekdayChartData.value.labels).toEqual(['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue']);
		expect(weekdayChartData.value.datasets[1].data).toEqual([4, 5, 6, 7, 1, 2, 3]); // received, rotated
	});

	it('weekdayComparedChartData rotates each account dataset the same way', () => {
		const ctx = buildContext();
		ctx.accounts.value = [{ id: 'a', name: 'Account A' }];
		ctx.options.accountColors = { a: '#111111' };
		ctx.comparison.value.weekdayData = { a: { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7 } };
		const { weekdayComparedChartData } = useOnedimChartData(ctx);

		expect(weekdayComparedChartData.value.labels).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
		expect(weekdayComparedChartData.value.datasets[0].data).toEqual([2, 3, 4, 5, 6, 7, 1]);
	});

	it('monthChartData uses localized month names as labels, without rotation', () => {
		const ctx = buildContext();
		const { monthChartData } = useOnedimChartData(ctx);

		expect(monthChartData.value.labels[0]).toBe('Jan');
		expect(monthChartData.value.labels).toHaveLength(12);
		expect(monthChartData.value.datasets[0].data).toEqual([3, 4]); // sent
		expect(monthChartData.value.datasets[1].data).toEqual([1, 2]); // received
	});

	it('monthComparedChartData builds one dataset per account', () => {
		const ctx = buildContext();
		ctx.accounts.value = [{ id: 'a', name: 'Account A' }];
		ctx.options.accountColors = { a: '#111111' };
		ctx.comparison.value.monthData = { a: { 0: 9, 1: 8 } };
		const { monthComparedChartData } = useOnedimChartData(ctx);

		expect(monthComparedChartData.value.datasets[0].data).toEqual([9, 8]);
		expect(monthComparedChartData.value.datasets[0].borderColor).toBe('#111111');
	});
});
