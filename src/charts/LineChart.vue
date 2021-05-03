<template>
<div class="chart">
	<h2 v-if="title" class="text-center">{{ title }}</h2>
	<p v-if="description" class="text-gray text-center">{{ description }}</p>
	<div
		class="chart-container"
		:style="{
			width: this.width ? this.width : 'auto',
			height: this.height ? this.height : 'auto'
		}"
	>
		<canvas :id="id"></canvas>
	</div>
</div>
</template>

<script>
import { Chart } from '../chart.config'

export default {
	props: {
		title: String,
		description: String,
		labels: Array,
		datasets: Array,
		ordinate: Boolean,
		abscissa: Boolean,
		width: String,
		height: String,
	},
	data () {
		return {
			id: Math.random().toString(36).substring(7),
			chart: null
		}
	},
	mounted () {
		if (this.labels && this.datasets) {
			this.draw()
		}
	},
	methods: {
		draw () {
			this.chart = new Chart(this.id, {
				type: "line",
				data: {
					datasets: this.datasets,
					labels: this.labels,
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					fill: true,
					datasets: {
						line: {
							borderWidth: 2,
							tension: 0.15,
							pointRadius: this.labels.length == 1 ? 5 : 0
						}
					},
					scales: {
						x: {
							display: this.abscissa,
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
							display: this.ordinate,
							stacked: false,
							grid: {
								display: false,
								drawBorder: false,
							},
							beginAtZero: true
						}
					}
				}
			})
		}
	},
	watch: {
		// update chart if data changes in an animatable way
		datasets (newDatasets) {
			this.chart.data.labels = this.labels
			this.chart.data.datasets = newDatasets
			// show points if only one data column exists and therefore no line can be drawn
			this.chart.options.datasets.line.pointRadius = this.labels.length == 1 ? 5 : 0
			this.chart.update()
		},
		// update chart if ordinate display changes
		ordinate (newValue) {
			this.chart.options.scales.y.display = newValue
			this.chart.update()
		}
	}
}
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
