<template>
<div class="chart matrix-chart">
	<h2 v-if="title" class="text-center">{{ title }}</h2>
	<p v-if="description" class="text-gray text-center">{{ description }}</p>
	<div class="chart-container">
		<canvas :id="cid"></canvas>
	</div>
</div>
</template>

<script>
import { defineComponent } from 'vue';
import { Chart, color } from '../chart.config';
import { isoDayOfWeek } from '../utils';

export default defineComponent({
	props: {
		cid: String,         // chart ID, must be unique on page
		title: String,       // chart title (optional)
		description: String, // chart description (optional)
		color: String,       // cell color, gets transparized depending on value
		spacing: String,     // cell spacing in px
		rounding: String,    // border-radius in px
		dimension: Object,   // {cols, rows}
		parseTime: Boolean,  // if true, parse values as Date objects
		datasets: Array,     // [{data: [[date, value], [date, value], ...], label: ''}, ...]
	},
	mounted () {
		// hold chart instance
		this.chart = null;
		if (this.datasets) {
			this.draw()
		}
	},
	methods: {
		processedDatasets () {
			let datasets = JSON.parse(JSON.stringify(this.datasets))
			datasets.map(d => {
				d.data = d.data.map(e => {
					return {
						x: this.parseTime ? e[0] : new Date(e[0]).getHours(),
						y: isoDayOfWeek(new Date(e[0])),
						d: this.parseTime
							? new Date(e[0]).toLocaleDateString(this.$i18n.locale, { year: 'numeric', month: 'long', day: 'numeric' })
							: new Date(e[0]).toLocaleDateString(this.$i18n.locale, { weekday: 'long', hour: 'numeric' }),
						v: e[1]
					}
				});
				const max = Math.max(...d.data.map(e => e.v));
				d.backgroundColor = c => {
					const value = c.dataset.data[c.dataIndex]?.v ?? 0;
					const alpha = value / max;
					return color(this.color).alpha(alpha).rgbString();
				};
				d.borderRadius = this.rounding;
				d.hoverBackgroundColor = 'white';
				d.width = ({chart}) => (chart.chartArea || {}).width / this.dimension.cols - this.spacing;
				d.height = ({chart}) => (chart.chartArea || {}).height / this.dimension.rows - this.spacing;
			});
			return datasets;
		},
		draw () {
			this.chart = new Chart(this.cid, {
				type: "matrix",
				data: {
					datasets: this.processedDatasets()
				},
				options: {
					maintainAspectRatio: false,
					animation: {
						numbers: { duration: 0 },
						colors: {
							type: "color",
							duration: 500,
							from: "transparent",
						}
					},
					plugins: {
						legend: false,
						tooltip: {
							callbacks: {
								title: tooltipItems => tooltipItems[0].dataset.data[tooltipItems[0].dataIndex].d,
								label: context => {
									const v = context.dataset.data[context.dataIndex];
									return [' ' + v.v + ' ' + context.dataset.label];
								},
								labelColor: () => {
									return {
										borderWidth: 2,
										borderColor: this.color,
										backgroundColor: this.color + '33',
									};
								},
							}
						},
					},
					scales: {
						y: {
							type: 'time',
							offset: true,
							time: {
								unit: 'day',
								round: 'day',
								isoWeekday: true,
								parser: 'i',
								displayFormats: {
									day: 'iiiiii'
								}
							},
							reverse: true,
							position: 'left',
							ticks: {
								maxRotation: 0,
								padding: 15,
							},
							grid: {
								display: false,
								drawBorder: false,
								tickLength: 0
							}
						},
						x: {
							type: this.parseTime ? 'time' : 'linear',
							offset: false,
							time: this.parseTime ? {
								unit: 'month',
								round: 'week',
								isoWeekday: true,
								displayFormats: {
									month: 'MMM'
								}
							} : null,
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
						}
					},
					layout: {
						padding: {
							right: this.parseTime ? 10 : 0
						}
					}
				}
			})
		}
	},
	watch: {
		// update chart if data changes in an animatable way
		datasets (newData, previousData) {
			if (JSON.stringify(newData) != JSON.stringify(previousData)) {
				this.chart.data.datasets = this.processedDatasets();
				this.chart.update();
			}
		},
	}
});
</script>

<style lang="stylus">
.chart.matrix-chart
	display flex
	flex-flow column
	&>h2, &>p
		flex 0 1 auto
	&>.chart-container
		position relative
		flex 1 1 auto
		min-height: 190px
</style>
