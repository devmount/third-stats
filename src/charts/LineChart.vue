<template>
<div class='chart'>
	<h2 v-if='title' class='text-center'>{{ title }}</h2>
	<p v-if='description' class='text-gray text-center'>{{ description }}</p>
	<div
		class="chart-container"
		:style="{
			width: this.width ? this.width : 'auto',
			height: this.height ? this.height : 'auto'
		}"
	>
		<canvas :id='id'></canvas>
	</div>
</div>
</template>

<script>
/* eslint no-undef: 0 */
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
	computed: {
		currentData () {
			let datasets = []
			for (let i = 0; i < this.datasets.length; i++) {
				const dataset = this.datasets[i];
				datasets.push({
					label: dataset.label,
					data: dataset.data,
					borderColor: dataset.color,
					borderWidth: 2,
					lineTension: 0.15,
					pointRadius: 0,
					backgroundColor: dataset.bcolor,
				})
			}
			return datasets
		}
	},
	methods: {
		draw () {
			this.chart = new Chart(this.id, {
				type: 'line',
				data: {
					datasets: this.currentData,
					labels: this.labels,
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					scales: {
						xAxes: [{
							display: this.abscissa,
							stacked: false,
							gridLines: {
								display: false,
							},
							ticks: {
								maxRotation: 0,
								autoSkipPadding: 10,
								beginAtZero: true,
							}
						}],
						yAxes: [{
							display: this.ordinate,
							stacked: false,
							gridLines: {
								display: false,
							},
							ticks: {
								beginAtZero: true,
							}
						}]
					}
				}
			})
		}
	},
	watch: {
		// update chart if data changes
		datasets () {
			this.chart.data.labels = this.labels
			if (this.chart.data.datasets.length >= this.currentData.length) {
				this.chart.data.datasets.forEach((d, i) => {
					if (i in this.currentData) {
						d.data = this.currentData[i].data
						d.backgroundColor = this.currentData[i].backgroundColor
						d.borderColor = this.currentData[i].borderColor
					} else {
						this.chart.data.datasets.pop()
					}
				})
			} else {
				this.currentData.forEach((d, i) => {
					if (i in this.chart.data.datasets) {
						this.chart.data.datasets[i].data = d.data
						this.chart.data.datasets[i].backgroundColor = d.backgroundColor
						this.chart.data.datasets[i].borderColor = d.borderColor
					} else {
						this.chart.data.datasets.push(d)
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
</style>
