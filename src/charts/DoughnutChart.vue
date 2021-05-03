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
import { Chart } from '../chart.config'

export default {
	props: {
		title: String,
		description: String,
		info: String,
		labels: Array,
		datasets: Array,
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
	computed: {
		processedDatasets () {
			let datasets = this.datasets
			datasets.map(d => {
				d.backgroundColor = this.dataColors(d.data, d.color)
				d.borderColor = d.color
			})
			return datasets
		}
	},
	methods: {
		draw () {
			this.chart = new Chart(this.id, {
				type: "doughnut",
				data: {
					datasets: this.processedDatasets,
					labels: this.labels,
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					borderWidth: 0,
					cutout: '60%',
					circumference: 180,
					rotation: -90
				}
			})
		},
		// calculate opacity for given value based on max value
		opacity (value, max) {
			return max == 0 ? 0 : value/max
		},
		// calculate list of background colors for each data arc
		dataColors (data, color) {
			let colors = []
			const max = Math.max(...data)
			data.map(d => {
				colors.push(color.replace(")", ", " + this.opacity(d, max) + ")"))
			})
			return colors
		}
	},
	watch: {
		// update chart if data changes in an animatable way
		datasets (newDatasets) {
			this.chart.data.labels = this.labels
			this.chart.data.datasets = newDatasets
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
