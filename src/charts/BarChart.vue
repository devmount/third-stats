<template>
	<div class="chart">
		<h2 v-if="title">{{ title }}</h2>
		<p v-if="description">{{ description }}</p>
		<div class="chart-container">
			<canvas :id="id"></canvas>
			<div v-if="copiedFeedback" class="copy-feedback" :style="{ top: `${copiedFeedback.top}px` }">
				{{ t('stats.addressCopied') }}
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Chart, getRelativePosition, transparentGradientBar } from '@/chart.config.js';

const { t } = useI18n();

let chart = null;
const id = Math.random().toString(36).substring(7);
// visible while a copied-label confirmation is shown, positioned next to the clicked label
const copiedFeedback = ref(null);
let copiedFeedbackTimeout = null;

const props = defineProps({
	title: String,
	description: String,
	labels: Array,
	datasets: Array,
	horizontal: Boolean,
	ordinate: Boolean,
});

const processedDatasets = computed(() => {
	const data = props.datasets;
	data.map((d) => {
		d.backgroundColor = (context) => {
			const { ctx, chartArea } = context.chart;
			if (!chartArea) return null;
			return transparentGradientBar(
				ctx,
				chartArea,
				Array.isArray(d.borderColor) ? d.borderColor[context.dataIndex] : d.borderColor,
				props.horizontal
			);
		};
	});
	return data;
});

const draw = () => {
	chart = new Chart(id, {
		type: 'bar',
		data: {
			datasets: processedDatasets.value,
			labels: props.labels,
		},
		options: {
			indexAxis: props.horizontal ? 'y' : 'x',
			responsive: true,
			maintainAspectRatio: false,
			maxBarThickness: 50,
			datasets: {
				bar: {
					borderWidth: props.horizontal ? { right: 2 } : { top: 2 },
					barPercentage: 1,
					categoryPercentage: 0.6,
				},
			},
			plugins: {
				tooltip: {
					displayColors: true,
					intersect: true,
					position: 'nearest',
					callbacks: {
						label: (context) => ` ${context.formattedValue} ${context.dataset.label}`,
						labelColor: (context) => {
							return {
								borderWidth: 2,
								borderColor: context.dataset.borderColor,
								backgroundColor: `${context.dataset.borderColor}33`,
							};
						},
					},
				},
			},
			scales: {
				x: {
					border: {
						display: false,
					},
					stacked: false,
					grid: {
						display: false,
						drawBorder: false,
					},
					ticks: {
						maxRotation: 0,
						padding: props.horizontal ? 0 : 10,
					},
					beginAtZero: true,
				},
				y: {
					border: {
						display: false,
					},
					display: props.horizontal || props.ordinate,
					stacked: false,
					grid: {
						display: false,
						drawBorder: false,
					},
					ticks: {
						maxRotation: 0,
						padding: props.horizontal ? 0 : 10,
						autoSkipPadding: 0,
					},
					beginAtZero: true,
				},
			},
		},
	});
	if (props.horizontal) {
		chart.canvas.addEventListener('click', onLabelClick);
		chart.canvas.addEventListener('mousemove', onLabelHover);
		chart.canvas.addEventListener('mouseleave', resetCursor);
	}
};

// resolves the labels[] index for the y-axis category label nearest a given mouse event,
// or null if it's outside the label gutter to the left of the plot area. Chart.js
// auto-skips labels to avoid overlap, so rather than resolving to whichever raw
// category the pixel position mathematically falls on (which could be a hidden
// label), this snaps to the closest currently-rendered tick, giving every visible
// label a fair-sized click target spanning halfway to its neighbors.
// (Chart.js only fires its own onClick for points inside the plot area, so this
// hit-test is done manually against the raw canvas event)
const labelIndexAt = (nativeEvent) => {
	const { x, y } = getRelativePosition(nativeEvent, chart);
	const { left, top, bottom } = chart.chartArea;
	if (x >= left || y < top || y > bottom) return null;
	const yScale = chart.scales.y;
	const ticks = yScale.ticks;
	if (!ticks.length) return null;
	let nearest = ticks[0].value;
	let nearestDistance = Math.abs(yScale.getPixelForValue(nearest) - y);
	for (const tick of ticks) {
		const distance = Math.abs(yScale.getPixelForValue(tick.value) - y);
		if (distance < nearestDistance) {
			nearest = tick.value;
			nearestDistance = distance;
		}
	}
	return props.labels[nearest] !== undefined ? nearest : null;
};

const resetCursor = () => {
	chart.canvas.style.cursor = '';
};

const onLabelHover = (nativeEvent) => {
	chart.canvas.style.cursor = labelIndexAt(nativeEvent) === null ? '' : 'pointer';
};

const onLabelClick = (nativeEvent) => {
	const index = labelIndexAt(nativeEvent);
	if (index === null) return;
	navigator.clipboard.writeText(props.labels[index]);
	clearTimeout(copiedFeedbackTimeout);
	copiedFeedback.value = { top: chart.scales.y.getPixelForValue(index) };
	copiedFeedbackTimeout = setTimeout(() => (copiedFeedback.value = null), 1200);
};

onMounted(() => {
	if (props.labels && props.datasets) {
		draw();
	}
});

// update chart if data changes in an animatable way
watch(
	() => props.datasets,
	() => {
		chart.data.labels = props.labels;
		chart.data.datasets = processedDatasets.value;
		chart.update();
	}
);

// update chart if ordinate display changes
watch(
	() => props.ordinate,
	(newValue) => {
		chart.options.scales.y.display = props.horizontal || newValue;
		chart.update();
	}
);
</script>

<style>
.chart {
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
	}
}

.copy-feedback {
	position: absolute;
	left: 0.5rem;
	transform: translateY(-50%);
	padding: 0.25rem 0.5rem;
	border-radius: 3px;
	font-size: 0.75rem;
	white-space: nowrap;
	pointer-events: none;
	color: var(--color-white);
	background: rgba(var(--color-black-rgb), 0.75);
}
</style>
