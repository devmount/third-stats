<template>
<div class="chart">
	<h2 v-if="title" class="text-center">{{ title }}</h2>
	<p v-if="description" class="text-gray text-center">{{ description }}</p>
	<div class="chart-container">
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
		horizontal: Boolean,
		ordinate: Boolean,
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
				type: "bar",
				data: {
					datasets: this.datasets,
					labels: this.labels,
				},
				options: {
					indexAxis: this.horizontal ? 'y' : 'x',
					responsive: true,
					maintainAspectRatio: false,
					datasets: {
						bar: {
							borderWidth: this.horizontal ? { right: 2} : { top: 2 },
							barPercentage: 1,
							categoryPercentage: .6,
						}
					},
					scales: {
						x: {
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
							display: this.horizontal || this.ordinate,
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
		},
	},
	watch: {
		// update chart if data changes in an animatable way
		datasets (newDatasets) {
			this.chart.data.labels = this.labels
			this.chart.data.datasets = newDatasets
			this.chart.update()
		},
		// update chart if ordinate display changes
		ordinate (newValue) {
			this.chart.options.scales.y.display = this.horizontal || newValue
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
