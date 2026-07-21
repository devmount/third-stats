import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildAccountSparkline } from '@/composables/usePopupData.js';

afterEach(() => {
	vi.useRealTimers();
});

describe('buildAccountSparkline', () => {
	it('builds a single label/data point for a single-year range', () => {
		const accountData = {
			yearsData: { received: { 2023: 5 }, sent: { 2023: 2 } },
			meta: { start: new Date(2023, 0, 1), end: new Date(2023, 11, 31) },
		};
		const result = buildAccountSparkline(accountData, false);
		expect(result.labels).toEqual([2023]);
		expect(result.datasets[0].data).toEqual([7]);
	});

	it('uses only the received count for a year with no sent messages', () => {
		const accountData = {
			yearsData: { received: { 2023: 5 }, sent: {} },
			meta: { start: new Date(2023, 0, 1), end: new Date(2023, 11, 31) },
		};
		const result = buildAccountSparkline(accountData, false);
		expect(result.datasets[0].data).toEqual([5]);
	});

	it('uses only the sent count for a year with no received messages', () => {
		const accountData = {
			yearsData: { received: {}, sent: { 2023: 3 } },
			meta: { start: new Date(2023, 0, 1), end: new Date(2023, 11, 31) },
		};
		const result = buildAccountSparkline(accountData, false);
		expect(result.datasets[0].data).toEqual([3]);
	});

	it('fills a gap year with 0 rather than skipping it', () => {
		const accountData = {
			yearsData: { received: { 2021: 4 }, sent: { 2023: 2 } },
			meta: { start: new Date(2021, 0, 1), end: new Date(2023, 11, 31) },
		};
		const result = buildAccountSparkline(accountData, false);
		expect(result.labels).toEqual([2021, 2022, 2023]);
		expect(result.datasets[0].data).toEqual([4, 0, 2]);
	});

	it('uses the current year as the range end when meta.end is not set', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2024, 5, 15));
		const accountData = {
			yearsData: { received: { 2023: 1 }, sent: {} },
			meta: { start: new Date(2023, 0, 1), end: null },
		};
		const result = buildAccountSparkline(accountData, false);
		expect(result.labels).toEqual([2023, 2024]);
	});

	it('picks the dark or light borderColor based on the dark flag', () => {
		const accountData = {
			yearsData: { received: { 2023: 1 }, sent: {} },
			meta: { start: new Date(2023, 0, 1), end: new Date(2023, 11, 31) },
		};
		expect(buildAccountSparkline(accountData, true).datasets[0].borderColor).toBe('#f9f9fa15');
		expect(buildAccountSparkline(accountData, false).datasets[0].borderColor).toBe('#1d1d1f15');
	});
});
