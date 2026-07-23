import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useTwodimChartData } from '@/composables/useTwodimChartData.js';

const stubT = (key) => key;

// builds a 7x24 grid (day -> hour -> count), matching the shape of createStatsData's
// weekdayPerHourData (NumberedObject(7, 24)) closely enough for Object.values()/map() to work
const buildWeekdayPerHour = (fill) => {
	const days = [];
	for (let d = 0; d < 7; d++) {
		const hours = [];
		for (let h = 0; h < 24; h++) hours.push(fill(d, h));
		days.push(hours);
	}
	return days;
};

describe('useTwodimChartData', () => {
	it('flattens the 7x24 weekday/hour grid into 168 [isoDate, count] pairs per series', () => {
		const display = ref({
			weekdayPerHourData: {
				received: buildWeekdayPerHour(() => 1),
				sent: buildWeekdayPerHour(() => 2),
			},
		});
		const { weekdayPerHourChartData } = useTwodimChartData({ display, t: stubT });

		expect(weekdayPerHourChartData.value.received.data).toHaveLength(168);
		expect(weekdayPerHourChartData.value.sent.data).toHaveLength(168);
		expect(weekdayPerHourChartData.value.received.data.every(([, count]) => count === 1)).toBe(true);
		expect(weekdayPerHourChartData.value.sent.data.every(([, count]) => count === 2)).toBe(true);
	});

	it('preserves the count for a specific day/hour cell, keyed positionally', () => {
		const received = buildWeekdayPerHour(() => 0);
		received[3][14] = 42; // day index 3, hour 14
		const display = ref({ weekdayPerHourData: { received, sent: buildWeekdayPerHour(() => 0) } });
		const { weekdayPerHourChartData } = useTwodimChartData({ display, t: stubT });

		// day 3's block occupies entries [3*24, 4*24); hour 14 is the 15th entry within it
		const cell = weekdayPerHourChartData.value.received.data[3 * 24 + 14];
		expect(cell[1]).toBe(42);
	});

	it('labels each series using the translation function', () => {
		const display = ref({
			weekdayPerHourData: { received: buildWeekdayPerHour(() => 0), sent: buildWeekdayPerHour(() => 0) },
		});
		const t = (key) => `translated:${key}`;
		const { weekdayPerHourChartData } = useTwodimChartData({ display, t });

		expect(weekdayPerHourChartData.value.received.label).toBe('translated:stats.mailsReceived');
		expect(weekdayPerHourChartData.value.sent.label).toBe('translated:stats.mailsSent');
	});
});
