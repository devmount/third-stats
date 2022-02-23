<template>
<div class="chart matrix-chart">
	<h2 v-if="title" class="text-center">{{ title }}</h2>
	<p v-if="description" class="text-gray text-center">{{ description }}</p>
	<div class="chart-container">
		<canvas :id="id"></canvas>
	</div>
</div>
</template>

<script>
import { defineComponent } from 'vue';
import { Chart, color } from '../chart.config';
import { isoDayOfWeek } from '../utils';

export default defineComponent({
	props: {
		title: String,       // chart title (optional)
		description: String, // chart description (optional)
		color: String,       // cell color, gets transparized depending on value
		spacing: String,     // cell spacing in px
		rounding: String,    // border-radius in px
		dimension: Object,   // {cols, rows}
		parseTime: Boolean,  // if true, parse values as Date objects
		datasets: Array,     // [{data: [[], [], ...], label: ''}, ...]
												 // parseTime true: data: [[date, value], [date, value], ...]
												 // parseTime false: data: [[x, y, value], [x, y, value], ...]
	},
	data () {
		return {
			id: Math.random().toString(36).substring(7)
		}
	},
	mounted () {
		// hold chart instance
		this.chart = null;
		if (this.datasets) {
			this.draw()
		}
	},
	methods: {
		processedDatasets (datasets) {
			datasets = JSON.parse(JSON.stringify(datasets))
			datasets.map(d => {
				d.data = d.data.map(e => {
					return {
						x: e[0],
						y: this.parseTime ? isoDayOfWeek(new Date(e[0])) : e[1],
						d: this.parseTime
							? new Date(e[0]).toLocaleDateString(this.$i18n.locale, { year: 'numeric', month: 'long', day: 'numeric' })
							: null,
						v: this.parseTime ? e[1] : e[2]
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
			const scales = this.parseTime
				? {
					y: {
						type: 'time',
						offset: true,
						time: {
							unit: 'day',
							round: 'day',
							isoWeekday: 1,
							parser: 'i',
							displayFormats: {
								day: 'iiiiii'
							}
						},
						reverse: true,
						position: 'left',
						ticks: {
							maxRotation: 0,
							autoSkip: true,
							padding: 5,
						},
						grid: {
							display: false,
							drawBorder: false,
							tickLength: 0
						}
					},
					x: {
						type: 'time',
						time: {
							unit: 'month',
							round: 'week',
							isoWeekday: 1,
							displayFormats: {
								month: 'MMM'
							}
						},
						ticks: {
							maxRotation: 0,
							autoSkip: true,
							autoSkipPadding: 10,
						},
						grid: {
							display: false,
							drawBorder: false,
							tickLength: 0,
						}
					}
				}
				: {
					y: {
						offset: true,
						reverse: true,
						position: 'left',
						ticks: {
							maxRotation: 0,
							autoSkip: true,
							padding: 5,
						},
						grid: {
							display: false,
							drawBorder: false,
							tickLength: 0
						}
					},
					x: {
						ticks: {
							maxRotation: 0,
							autoSkip: true,
							autoSkipPadding: 10,
						},
						grid: {
							display: false,
							drawBorder: false,
							tickLength: 0,
						}
					}
				};
			this.chart = new Chart(this.id, {
				type: "matrix",
				data: {
					datasets: this.processedDatasets(this.datasets)
				},
				options: {
					responsive: true,
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
					scales: scales
				}
			})
		}
	},
	watch: {
		// update chart if data changes in an animatable way
		datasets: {
			handler (newDatasets) {
				this.chart.data.datasets = this.processedDatasets(newDatasets);
				this.chart.update();
			},
			immediate: false,
			deep: false
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
