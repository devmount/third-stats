// chart-data shaping for the "activity" section (single-date calendar matrix chart)
import { computed } from 'vue';
import { localDateKey } from '@/utils.js';

export function useActivityChartData({ display, activityPrefs, t }) {
	// prepare data for single date matrix charts
	const dateChartData = computed(() => {
		const year = activityPrefs.year;
		// Generate all dates for the full year (Jan 1 to Dec 31)
		const startDate = new Date(year, 0, 1);
		const endDate = new Date(year, 11, 31);

		// Build lookup maps from actual data
		const receivedMap = Object.fromEntries(
			Object.entries(display.value.dateData?.received || {}).filter(e => e[0].substring(0, 4) == year)
		);
		const sentMap = Object.fromEntries(
			Object.entries(display.value.dateData?.sent || {}).filter(e => e[0].substring(0, 4) == year)
		);

		// Generate full year data with 0 for empty days
		let r = [], s = [];
		for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
			const key = localDateKey(d);
			r.push([key, receivedMap[key] || 0]);
			s.push([key, sentMap[key] || 0]);
		}

		// TODO: handle options.startOfWeek
		return {
			received: { label: t("stats.mailsReceived"), data: r },
			sent: { label: t("stats.mailsSent"), data: s },
		};
	});

	return {
		dateChartData,
	};
}
