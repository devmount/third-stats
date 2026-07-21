// chart-data shaping for the "folders" section (emails per folder doughnut chart)
import { computed } from 'vue';
import { accentColors } from '@/definitions.js';

export function useFoldersChartData({ display, locale, t }) {
	// prepare data for emails per folder doughnut charts
	const foldersChartData = computed(() => {
		const r = display.value.folders.received, s = display.value.folders.sent;
		let dr = [], ds = [], labels = [];
		let all = Array.from(new Set([...Object.keys(r), ...Object.keys(s)]));
		all.sort((a, b) => a.localeCompare(b, locale.value, { sensitivity: "base" }));
		all.forEach(d => {
			dr.push(r[d] ? r[d] : 0)
			ds.push(s[d] ? s[d] : 0)
			labels.push(d)
		});
		return {
			datasets: [
				{
					label: t("stats.mailsReceived"),
					data: dr,
					color: accentColors[1],
				},
				{
					label: t("stats.mailsSent"),
					data: ds,
					color: accentColors[0],
				},
			],
			labels: labels,
		};
	});

	return {
		foldersChartData,
	};
}
