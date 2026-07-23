// chart-data shaping for the "leader" section (contact leaderboards horizontal bar charts)
import { computed } from 'vue';
import { accentColors } from '@/definitions.js';

export function useLeaderChartData({ display, options, t }) {
	// prepare data for sent emails leaderboard horizontal bar chart
	const sentContactLeadersChartData = computed(() => {
		const s = display.value.contacts.sent;
		return {
			datasets: [
				{
					label: t('stats.mailsSent'),
					data: Object.values(s),
					borderColor: accentColors[0],
				},
			],
			labels: Object.keys(s),
		};
	});
	// true if there are any receiver contacts to display
	const sentContactLeadersChartDataExists = computed(() => {
		return sentContactLeadersChartData.value.datasets[0].data?.length > 0;
	});

	// prepare data for received emails leaderboard horizontal bar chart
	const receivedContactLeadersChartData = computed(() => {
		const r = display.value.contacts.received;
		return {
			datasets: [
				{
					label: t('stats.mailsReceived'),
					data: Object.values(r),
					borderColor: accentColors[1],
				},
			],
			labels: Object.keys(r),
		};
	});
	// true if there are any sender contacts to display
	const receivedContactLeadersChartDataExists = computed(() => {
		return receivedContactLeadersChartData.value.datasets[0].data?.length > 0;
	});

	// prepare data for junk emails leaderboard horizontal bar chart
	const junkContactLeadersChartData = computed(() => {
		const r = display.value.contacts.junk || {};
		const color = options.dark ? accentColors[2] : accentColors[3];
		return {
			datasets: [
				{
					label: t('stats.junkMails'),
					data: Object.values(r),
					borderColor: color,
				},
			],
			labels: Object.keys(r),
		};
	});
	// true if there are any junk contacts to display
	const junkContactLeadersChartDataExists = computed(() => {
		return junkContactLeadersChartData.value.datasets[0].data?.length > 0;
	});

	return {
		sentContactLeadersChartData,
		sentContactLeadersChartDataExists,
		receivedContactLeadersChartData,
		receivedContactLeadersChartDataExists,
		junkContactLeadersChartData,
		junkContactLeadersChartDataExists,
	};
}
