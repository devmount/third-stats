// chart-data shaping for the "total" section (years/quarters/months/weeks line charts)
import { computed } from 'vue';
import { accentColors } from '@/definitions.js';
import { monthNames, quarterNumber, weeksBetween } from '@/utils.js';

export function useTotalChartData({
	display,
	comparison,
	accounts,
	options,
	minYear,
	maxYear,
	minDate,
	maxDate,
	t,
	locale,
}) {
	// prepare sum data for years line chart
	const yearsChartData = computed(() => {
		const r = display.value.yearsData.received;
		const s = display.value.yearsData.sent;
		let labels = [],
			dr = [],
			ds = [];
		for (let y = minYear.value; y <= maxYear.value; ++y) {
			labels.push(y);
			dr.push(y in r ? r[y] : 0);
			ds.push(y in s ? s[y] : 0);
		}
		return {
			datasets: [
				{
					label: t('stats.mailsSent'),
					data: ds,
					borderColor: accentColors[0],
				},
				{
					label: t('stats.mailsReceived'),
					data: dr,
					borderColor: accentColors[1],
				},
			],
			labels: labels,
		};
	});
	// prepare comparison data for years line chart
	const yearsComparedChartData = computed(() => {
		// generate list of years between start and end date, e.g. [2018,2019,2020]
		const labels = Array.from(Array(maxYear.value - minYear.value + 1), (_, i) => i + minYear.value);
		// compute dataset for each account
		let datasets = [];
		accounts.value.forEach((a) => {
			const d = comparison.value.yearsData[a.id];
			let data = [];
			labels.map((y) => data.push(y in d ? d[y] : 0));
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

	// prepare sum data for quarters line chart
	const quartersChartData = computed(() => {
		const r = display.value.quartersData.received;
		const s = display.value.quartersData.sent;
		let labels = [],
			dr = [],
			ds = [];
		for (let y = minYear.value; y <= maxYear.value; ++y) {
			for (let q = 1; q <= 4; ++q) {
				// trim quarters before start date
				if (y == minYear.value && q < quarterNumber(minDate.value)) continue;
				// trim quarters after end date
				if (y == maxYear.value && q > quarterNumber(maxDate.value)) break;
				// organize labels and data
				labels.push(`${y} ${t('stats.abbreviations.quarter')}${q}`);
				dr.push(y in r && q in r[y] ? r[y][q] : 0);
				ds.push(y in s && q in s[y] ? s[y][q] : 0);
			}
		}
		return {
			datasets: [
				{
					label: t('stats.mailsSent'),
					data: ds,
					borderColor: accentColors[0],
				},
				{
					label: t('stats.mailsReceived'),
					data: dr,
					borderColor: accentColors[1],
				},
			],
			labels: labels,
		};
	});
	// prepare comparison data for quarters line chart
	const quartersComparedChartData = computed(() => {
		let datasets = [],
			labels = [];
		// compute dataset for each account
		accounts.value.forEach((a, i) => {
			const d = comparison.value.quartersData[a.id];
			let data = [];
			for (let y = minYear.value; y <= maxYear.value; ++y) {
				for (let q = 1; q <= 4; ++q) {
					// trim quarters before start date
					if (y == minYear.value && q < quarterNumber(minDate.value)) continue;
					// trim quarters after end date
					if (y == maxYear.value && q > quarterNumber(maxDate.value)) break;
					// generate labels in first iteration
					if (i == 0) labels.push(`${y} ${t('stats.abbreviations.quarter')}${q}`);
					// fill all data values, default to 0 if not existing for this combination
					data.push(y in d && q in d[y] ? d[y][q] : 0);
				}
			}
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

	// prepare data for months line chart
	const monthsChartData = computed(() => {
		const r = display.value.monthsData.received;
		const s = display.value.monthsData.sent;
		let labels = [],
			dr = [],
			ds = [];
		for (let y = minYear.value; y <= maxYear.value; ++y) {
			for (let m = 0; m < 12; ++m) {
				// trim months before start date
				if (y == minYear.value && m < minDate.value.getMonth()) continue;
				// trim months after end date
				if (y == maxYear.value && m > maxDate.value.getMonth()) break;
				// organize labels and data
				labels.push(`${y} ${monthNames(locale.value)[m]}`);
				dr.push(y in r && m in r[y] ? r[y][m] : 0);
				ds.push(y in s && m in s[y] ? s[y][m] : 0);
			}
		}
		return {
			datasets: [
				{
					label: t('stats.mailsSent'),
					data: ds,
					borderColor: accentColors[0],
				},
				{
					label: t('stats.mailsReceived'),
					data: dr,
					borderColor: accentColors[1],
				},
			],
			labels: labels,
		};
	});
	// prepare comparison data for months line chart
	const monthsComparedChartData = computed(() => {
		let datasets = [],
			labels = [];
		// compute dataset for each account
		accounts.value.map((a, i) => {
			const d = comparison.value.monthsData[a.id];
			let data = [];
			for (let y = minYear.value; y <= maxYear.value; ++y) {
				for (let m = 0; m < 12; ++m) {
					// trim months before start date
					if (y == minYear.value && m < minDate.value.getMonth()) continue;
					// trim months after end date
					if (y == maxYear.value && m > maxDate.value.getMonth()) break;
					// generate labels in first iteration
					if (i == 0) labels.push(`${y} ${monthNames(locale.value)[m]}`);
					// fill all data values, default to 0 if not existing for this combination
					data.push(y in d && m in d[y] ? d[y][m] : 0);
				}
			}
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

	// prepare data for weeks line chart
	const weeksChartData = computed(() => {
		const r = display.value.weeksData.received;
		const s = display.value.weeksData.sent;
		let labels = [],
			dr = [],
			ds = [];
		weeksBetween(minDate.value, maxDate.value).forEach((week) => {
			const [y, w] = week;
			// organize labels and data
			labels.push(`${y} ${t('stats.abbreviations.calendarWeek')}${w}`);
			dr.push(y in r && w in r[y] ? r[y][w] : 0);
			ds.push(y in s && w in s[y] ? s[y][w] : 0);
		});
		return {
			datasets: [
				{
					label: t('stats.mailsSent'),
					data: ds,
					borderColor: accentColors[0],
				},
				{
					label: t('stats.mailsReceived'),
					data: dr,
					borderColor: accentColors[1],
				},
			],
			labels: labels,
		};
	});
	// prepare comparison data for weeks line chart
	const weeksComparedChartData = computed(() => {
		let datasets = [],
			labels = [];
		// compute dataset for each account
		accounts.value.forEach((a, i) => {
			const d = comparison.value.weeksData[a.id];
			let data = [];
			weeksBetween(minDate.value, maxDate.value).forEach((week) => {
				const [y, w] = week;
				// generate labels in first iteration
				if (i == 0) labels.push(`${y} ${t('stats.abbreviations.calendarWeek')}${w}`);
				// fill all data values, default to 0 if not existing for this combination
				data.push(y in d && w in d[y] ? d[y][w] : 0);
			});
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

	return {
		yearsChartData,
		yearsComparedChartData,
		quartersChartData,
		quartersComparedChartData,
		monthsChartData,
		monthsComparedChartData,
		weeksChartData,
		weeksComparedChartData,
	};
}
