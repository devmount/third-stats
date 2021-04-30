<template>
<div class="chart">
	<h2 v-if="title" class="text-center">{{ title }}</h2>
	<p v-if="description" class="text-gray text-center">{{ description }}</p>
	<div 
		class="heatmap"
		:style="
			'grid-template-columns: auto repeat(' + width + ', 1fr);'
			+ 'grid-template-rows: repeat(' + height + ', 1fr) auto;'
			+ 'grid-gap: ' + spacing + ';'
		"
	>
		<template v-for="(y, n) in labels.y">
			<div class="y-label text-gray text-tiny text-right" :key="y">
				<div>{{ y }}</div>
			</div>
			<template v-for="(x, m) in labels.x">
				<div
					:style="
						'background: rgba(' + rgb + ', ' + opacity(dataset.data[n][m]) + ');'
						+ 'border-radius: ' + rounding + ';'
					"
					:data-tooltip="buildTooltip(x, y, dataset.label, dataset.data[n][m])"
					class="cell tooltip"
					:key="x*y"
				></div>
			</template>
		</template>
		<div></div>
		<div v-for="(x, k) in labels.x" :key="k" class="x-label text-gray text-tiny text-center">
			<div v-if="k%2==1">{{ x }}</div>
		</div>
	</div>
</div>
</template>

<script>
export default {
	props: {
		title: String,
		description: String,
		rgb: String,
		spacing: String,
		rounding: String,
		dataset: Object,  // {data: [[],[],...], label: ''}
		labels: Object,   // {y: [], x: []}
		tooltips: String, // template for tooltip of single data point. placeholders: {y},{x},{label},{value}
	},
	methods: {
		// calculate opacity for given value based on max value
		opacity (v) {
			return this.max == 0 ? 0 : v/this.max
		},
		// build tooltip based on given template
		buildTooltip (x, y, label, value) {
			const replacements = { "{x}": x, "{y}": y, "{label}": label, "{value}": value }
			return this.tooltips.replace(/{\w+}/g, all => replacements[all])
		},
	},
	computed: {
		// maximum value in given dataset
		max () {
			let max = 0
			for (let d in this.dataset.data) {
				const m = Math.max(...this.dataset.data[d])
				max = m > max ? m : max
			}
			return max
		},
		// total number of cells in x direction
		width () {
			return this.labels.x.length
		},
		// total number of cells in y direction
		height () {
			return this.labels.y.length
		},
	}
}
</script>

<style lang="stylus">
@require "../assets/global"

.heatmap
	display grid
	.cell
		position relative
		box-sizing border-box
		transition background .4s ease
		&::before
			content ""
			display block
			padding-top 100%
	.x-label
		&>div
			padding-top 5px
	.y-label
		display flex
		justify-content flex-end
		align-items center
		&>div
			padding-right 5px
</style>
