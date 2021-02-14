<template>
<div class='chart'>
	<h2 v-if='title' class='text-center'>{{ title }}</h2>
	<p v-if='description' class='text-gray text-center'>{{ description }}</p>
	<div class="chart-container">
		<canvas :id='id'></canvas>
		<div v-if="info" class="chart-info">
			<div class="featured">{{ info.number }}</div>
			<div class="text-gray">{{ info.label }}</div>
		</div>
	</div>
</div>
</template>

<script>
/* eslint no-undef: 0 */
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
		currentData () {
			let datasets = []
			for (let i = 0; i < this.datasets.length; i++) {
				const dataset = this.datasets[i];
				datasets.push({
					label: dataset.label,
					data: dataset.data,
					backgroundColor: this.dataColors(dataset.data, dataset.color),
					borderWidth: 0,
					borderColor: dataset.color,
				})
			}
			return datasets
		}
	},
	methods: {
		draw () {
			this.chart = new Chart(this.id, {
				type: 'doughnut',
				data: {
					datasets: this.currentData,
					labels: this.labels,
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					cutoutPercentage: 50,
					circumference: Math.PI,
					rotation: -Math.PI
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
				colors.push(color.replace(')', ', ' + this.opacity(d, max) + ')'))
			})
			return colors
		}
	},
	watch: {
		// update chart if data changes in an animatable way
		datasets () {
			this.chart.data.labels = this.labels
			this.chart.data.datasets.map((chartDataset, i) => {
				if (i in this.currentData) {
					// update every existing dataset first
					chartDataset.data = this.currentData[i].data
					chartDataset.label = this.currentData[i].label
					chartDataset.backgroundColor = this.currentData[i].backgroundColor
					chartDataset.borderColor = this.currentData[i].borderColor
				} else {
					// remove no longer needed datasets
					this.chart.data.datasets.splice(i)
				}
			})
			if (this.chart.data.datasets.length < this.currentData.length) {
				this.currentData.map((currentDataset, i) => {
					if (!(i in this.chart.data.datasets)) {
						// add new datasets
						this.chart.data.datasets.push(currentDataset)
					}
				})
			}
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
