<template>
	<div class="chart matrix-chart">
		<h2 v-if="title">{{ title }}</h2>
		<p v-if="description">{{ description }}</p>
		<div class="chart-container">
			<canvas :id="cid"></canvas>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { Chart, color } from '@/chart.config.js';
import { weekdayNames } from '@/utils.js';
import { getDateFnsLocale } from '@/translations.js';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
let chart = null;

const props = defineProps({
	cid: String, // chart ID, must be unique on page
	title: String, // chart title (optional)
	description: String, // chart description (optional)
	color: String, // cell color, gets transparized depending on value
	spacing: String, // cell spacing in px
	rounding: String, // border-radius in px
	dimension: Object, // {cols, rows}
	parseTime: Boolean, // if true, parse values as Date objects
	datasets: Array, // [{data: [[date, value], [date, value], ...], label: ''}, ...]
	weekdayLabels: Array, // 7 short weekday names, in the desired top-to-bottom row order
});

// Chart.js's category scale renders labels bottom-to-top on a vertical axis,
// so the array needs reversing to make weekdayLabels[0] the top row
const yAxisLabels = computed(() => [...(props.weekdayLabels || [])].reverse());

const processedDatasets = computed(() => {
	const data = props.datasets;
	data.map((d) => {
		d.data = d.data.map((e) => {
			return {
				x: props.parseTime ? e[0] : new Date(e[0]).getHours(),
				y: weekdayNames(locale.value)[new Date(e[0]).getDay()],
				d: props.parseTime
					? new Date(e[0]).toLocaleDateString(locale.value, { year: 'numeric', month: 'long', day: 'numeric' })
					: new Date(e[0]).toLocaleDateString(locale.value, { weekday: 'long', hour: 'numeric' }),
				v: e[1],
			};
		});
		const max = Math.max(...d.data.map((e) => e.v));
		d.backgroundColor = (c) => {
			const value = c.dataset.data[c.dataIndex]?.v ?? 0;
			const alpha = value / max;
			return color(props.color).alpha(alpha).rgbString();
		};
		d.borderRadius = props.rounding;
		d.hoverBackgroundColor = 'white';
		d.width = (c) => (c.chart.chartArea || {}).width / props.dimension.cols - props.spacing;
		d.height = (c) => (c.chart.chartArea || {}).height / props.dimension.rows - props.spacing;
	});
	return data;
});

const draw = (localeObject) => {
	chart = new Chart(props.cid, {
		type: 'matrix',
		data: {
			datasets: processedDatasets.value,
		},
		options: {
			maintainAspectRatio: false,
			animation: {
				numbers: { duration: 0 },
				colors: {
					type: 'color',
					duration: 500,
					from: 'transparent',
				},
			},
			plugins: {
				legend: false,
				tooltip: {
					callbacks: {
						title: (tooltipItems) => tooltipItems[0].dataset.data[tooltipItems[0].dataIndex].d,
						label: (context) => {
							const v = context.dataset.data[context.dataIndex];
							return [` ${v.v} ${context.dataset.label}`];
						},
						labelColor: () => {
							return {
								borderWidth: 2,
								borderColor: props.color,
								backgroundColor: `${props.color}33`,
							};
						},
					},
				},
			},
			scales: {
				y: {
					border: {
						display: false,
					},
					type: 'category',
					labels: yAxisLabels.value,
					offset: true,
					position: 'left',
					ticks: {
						maxRotation: 0,
						padding: 15,
					},
					grid: {
						display: false,
						drawBorder: false,
						tickLength: 0,
					},
				},
				x: {
					border: {
						display: false,
					},
					type: props.parseTime ? 'time' : 'linear',
					adapters: {
						date: {
							locale: localeObject,
						},
					},
					offset: false,
					time: props.parseTime
						? {
								unit: 'month',
								round: 'week',
								isoWeekday: true,
								displayFormats: {
									month: 'MMM',
								},
							}
						: null,
					ticks: {
						maxRotation: 0,
						stepSize: 1,
						padding: 5,
					},
					grid: {
						display: false,
						drawBorder: false,
						tickLength: 0,
					},
				},
			},
			layout: {
				padding: {
					right: props.parseTime ? 10 : 0,
				},
			},
		},
	});
};

onMounted(async () => {
	if (props.datasets) {
		const l = await getDateFnsLocale(locale.value);
		draw(l);
	}
});

// update chart if data changes in an animatable way
watch(
	() => props.datasets,
	(newData, previousData) => {
		if (JSON.stringify(newData) != JSON.stringify(previousData)) {
			chart.data.datasets = processedDatasets.value;
			chart.update();
		}
	}
);

// update weekday row order if the start-of-week option changes
watch(
	() => yAxisLabels.value,
	(newValue) => {
		chart.options.scales.y.labels = newValue;
		chart.update();
	}
);
</script>

<style>
.chart.matrix-chart {
	display: flex;
	flex-flow: column;

	> h2,
	> p {
		flex: 0 1 auto;
		text-align: center;
	}
	> p {
		color: var(--color-text-gray);
	}
	> .chart-container {
		position: relative;
		flex: 1 1 auto;
		min-height: 190px;
	}
}
</style>
