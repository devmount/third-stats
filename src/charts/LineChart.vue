<template>
<div class="chart">
	<h2 v-if="title" class="text-center">{{ title }}</h2>
	<p v-if="description" class="text-gray text-center">{{ description }}</p>
	<div
		class="chart-container"
		:style="{
			width: width ?? 'auto',
			height: height ?? 'auto'
		}"
	>
		<canvas :id="id"></canvas>
	</div>
</div>
</template>

<script setup>
import { onMounted, computed, watch } from 'vue';
import { Chart, transparentGradientLine } from '@/chart.config.js';

let chart = null;
const id = Math.random().toString(36).substring(7);

const props = defineProps({
	title: String,
	description: String,
	labels: Array,
	datasets: Array,
	ordinate: Boolean,
	abscissa: Boolean,
	tooltips: {
		type: Boolean,
		default: true
	},
	thickness: {
		type: Number,
		default: 2
	},
	unfinished: {
		type: Boolean,
		default: true
	},
	width: String,
	height: String,
});

const processedDatasets = computed(() => {
	const data = props.datasets;
	data.map(d => {
		// gradient for background
		d.backgroundColor = context => {
			const { ctx, chartArea } = context.chart;
			if (!chartArea) return null;
			return transparentGradientLine(ctx, chartArea, d.borderColor);
		};
		// dashed line for last segment
		d.segment = {
			borderDash: ctx => props.unfinished && ctx.p0?.parsed.x == d.data.length-2 ? [10, 5] : undefined
		};
	});
	return data;
});

const draw = () => {
	chart = new Chart(id, {
		type: "line",
		data: {
			datasets: processedDatasets.value,
			labels: props.labels,
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			fill: true,
			datasets: {
				line: {
					borderWidth: props.thickness,
					tension: 0.15,
					pointRadius: props.labels.length == 1 ? 5 : 0
				}
			},
			plugins: {
				tooltip: {
					enabled: props.tooltips,
					callbacks: {
						label: context => ' ' + context.formattedValue + ' ' + context.dataset.label,
						labelColor: context => {
							return {
								borderWidth: 2,
								borderColor: context.dataset.borderColor,
								backgroundColor: context.dataset.borderColor + '33',
							};
						},
					}
				},
			},
			scales: {
				x: {
					display: props.abscissa,
					alignToPixels: true,
					stacked: false,
					grid: {
						display: false,
						drawBorder: false,
					},
					ticks: {
						maxRotation: 0,
						autoSkipPadding: 10,
					},
					beginAtZero: true
				},
				y: {
					display: props.ordinate,
					stacked: false,
					grid: {
						display: false,
						drawBorder: false,
					},
					beginAtZero: true
				}
			}
		}
	});
};

// update chart if data changes in an animatable way
watch(
	() => props.datasets,
	() => {
		chart.data.labels = props.labels
		chart.data.datasets = processedDatasets.value
		// show points if only one data column exists and therefore no line can be drawn
		chart.options.datasets.line.pointRadius = props.labels.length == 1 ? 5 : 0
		chart.update()
	}
);

// update chart if ordinate display changes
watch(
	() => props.ordinate,
	(newValue) => {
		chart.options.scales.y.display = newValue
		chart.update()
	}
);

onMounted(() => {
	if (props.labels && props.datasets) {
		draw()
	}
});
</script>

<style lang="stylus">
.chart
	display flex
	flex-flow column
	&>h2, &>p
		flex 0 1 auto
	&>.chart-container
		position relative
		flex 1 1 auto
</style>
