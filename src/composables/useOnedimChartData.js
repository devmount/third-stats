// chart-data shaping for the "onedim" section (daytime/weekday/month bar charts)
import { computed } from 'vue';
import { accentColors } from '@/definitions.js';
import { monthNames, weekdayNames } from '@/utils.js';

export function useOnedimChartData({ display, comparison, accounts, options, t, locale }) {
	// prepare data for daytime bar chart
	const daytimeChartData = computed(() => {
		const r = display.value.daytimeData.received,
			s = display.value.daytimeData.sent;
		return {
			datasets: [
				{
					label: t('stats.mailsSent'),
					data: Object.values(s),
					borderColor: accentColors[0],
				},
				{
					label: t('stats.mailsReceived'),
					data: Object.values(r),
					borderColor: accentColors[1],
				},
			],
			labels: Object.keys(r),
		};
	});
	// prepare comparison data for daytime bar chart
	const daytimeComparedChartData = computed(() => {
		let datasets = [];
		// compute dataset for each account
		accounts.value.forEach((a) => {
			const d = comparison.value.daytimeData[a.id];
			// add dataset for this account
			datasets.push({
				label: `${t('popup.nMessages', 2)} - ${a.name}`,
				data: Object.values(d),
				borderColor: options.accountColors[a.id],
			});
		});
		return {
			datasets: datasets,
			labels: Object.keys(Object.values(comparison.value.daytimeData)[0]),
		};
	});

	// prepare data for weekday bar chart
	const weekdayChartData = computed(() => {
		const r = Object.values(display.value.weekdayData.received);
		const s = Object.values(display.value.weekdayData.sent);
		let labels = [...weekdayNames(locale.value)];
		// TODO: start week with user defined day of week
		for (let d = 0; d < 1 /*options.startOfWeek*/; d++) {
			r.push(r.shift());
			s.push(s.shift());
			labels.push(labels.shift());
		}
		return {
			datasets: [
				{
					label: t('stats.mailsSent'),
					data: s,
					borderColor: accentColors[0],
				},
				{
					label: t('stats.mailsReceived'),
					data: r,
					borderColor: accentColors[1],
				},
			],
			labels: labels,
		};
	});
	// prepare comparison data for weekday bar chart
	const weekdayComparedChartData = computed(() => {
		let datasets = [];
		let labels = [...weekdayNames(locale.value)];
		// TODO: labels: start week with user defined day of week
		for (let d = 0; d < 1 /*options.startOfWeek*/; d++) {
			labels.push(labels.shift());
		}
		// compute dataset for each account
		accounts.value.forEach((a) => {
			const data = Object.values(comparison.value.weekdayData[a.id]);
			// TODO: data: start week with user defined day of week
			for (let d = 0; d < 1 /*options.startOfWeek*/; d++) {
				data.push(data.shift());
			}
			// add dataset for this account
			datasets.push({
				label: `${t('popup.nMessages', 2)} - ${a.name}`,
				data: data,
				borderColor: options.accountColors[a.id],
			});
		});
		return {
			datasets: datasets,
			labels: labels,
		};
	});

	// prepare data for month bar chart
	const monthChartData = computed(() => {
		const r = display.value.monthData.received,
			s = display.value.monthData.sent;
		return {
			datasets: [
				{
					label: t('stats.mailsSent'),
					data: Object.values(s),
					borderColor: accentColors[0],
				},
				{
					label: t('stats.mailsReceived'),
					data: Object.values(r),
					borderColor: accentColors[1],
				},
			],
			labels: monthNames(locale.value),
		};
	});
	// prepare comparison data for month bar chart
	const monthComparedChartData = computed(() => {
		let datasets = [];
		// compute dataset for each account
		accounts.value.forEach((a) => {
			// add dataset for this account
			datasets.push({
				label: `${t('popup.nMessages', 2)} - ${a.name}`,
				data: Object.values(comparison.value.monthData[a.id]),
				borderColor: options.accountColors[a.id],
			});
		});
		return {
			datasets: datasets,
			labels: monthNames(locale.value),
		};
	});

	return {
		daytimeChartData,
		daytimeComparedChartData,
		weekdayChartData,
		weekdayComparedChartData,
		monthChartData,
		monthComparedChartData,
	};
}
