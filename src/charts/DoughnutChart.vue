<template>
<div class="chart">
	<h2 v-if="title" class="text-center">{{ title }}</h2>
	<p v-if="description" class="text-gray text-center">{{ description }}</p>
	<div class="chart-container">
		<canvas :id="id"></canvas>
		<div v-if="info" class="chart-info">
			<div class="featured">{{ info.number }}</div>
			<div class="text-gray">{{ info.label }}</div>
		</div>
	</div>
</div>
</template>

<script>
import { defineComponent } from 'vue';
import { Chart } from '@/chart.config.js';

export default defineComponent({
	props: {
		title: String,
		description: String,
		info: Object,
		labels: Array,
		datasets: Array,
	},
	data () {
		return {
			id: Math.random().toString(36).substring(7)
		}
	},
	mounted () {
		this.chart = null;
		if (this.labels && this.datasets) {
			this.draw()
		}
	},
	methods: {
		draw () {
			this.chart = new Chart(this.id, {
				type: "doughnut",
				data: {
					datasets: this.colorize(this.datasets),
					labels: this.labels,
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					borderWidth: 0,
					cutout: '60%',
					circumference: 180,
					rotation: -90,
					plugins: {
						tooltip: {
							intersect: true,
							position: 'nearest',
							callbacks: {
								title: context => context[0].label,
								label: context => ' ' + context.formattedValue + ' ' + context.dataset.label,
								labelColor: context => {
									return {
										borderWidth: 2,
										borderColor: context.dataset.borderColor,
										backgroundColor: context.dataset.borderColor + '33',
									};
								}
							}
						}
					}
				}
			})
		},
		// paint every segment depending on its data
		colorize (datasets) {
			datasets.map(d => {
				d.backgroundColor = this.dataColors(d.data, d.color);
				d.borderColor = d.color;
			});
			return datasets;
		},
		// calculate list of background colors for each data arc
		dataColors (data, color) {
			const colors = [];
			const max = Math.max(...data);
			data.forEach(d => colors.push(color + this.opacity(d, max)));
			return colors;
		},
		// calculate opacity as two digit hex for given value based on max value
		opacity (value, max) {
			if (max == 0) return '00';
			return Math.round(255*value/max).toString(16).padStart(2, "0");
		}
	},
	watch: {
		// update chart if data changes in an animatable way
		datasets (newDatasets) {
			this.chart.data.labels = this.labels;
			this.chart.data.datasets = this.colorize(newDatasets);
			this.chart.update();
		}
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
		.chart-info
			position: absolute
			bottom: 3rem
			left: 50%
			transform: translateX(-50%)
			text-align: center
			.featured
				font-size: 3.25em
				line-height: 1em
				font-weight: 500
</style>
