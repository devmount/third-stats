<template>
<div class='chart'>
	<h2 v-if='title' class='text-center'>{{ title }}</h2>
	<p v-if='description' class='text-gray text-center'>{{ description }}</p>
	<div 
		class="heatmap"
		:style="'grid-template-columns: repeat(' + width + ', 1fr); grid-template-rows: repeat(' + height + ', 1fr);'"
	>
		<template v-for='(y, n, i) in labels.y' :key='i'>
			<div class="text-gray text-small text-right mr-1">{{ y }}</div>
			<template v-for='(x, m, j) in labels.x' :key='j'>
				<div
					:style="'background: rgba(' + rgb + ', ' + opacity(dataset[n][m]) + ')'"
					:data-tooltip="y + ', ' + (x) + ':00\n' + dataset[n][m] + ' mails'"
					class='cell tooltip'
				></div>
			</template>
		</template>
		<div></div>
		<div v-for='(x, k) in labels.x' :key='k' class="text-gray text-small text-center">
			<div v-if='k%2==1' class="x-label">{{ x }}</div>
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
		dataset: Object,
		labels: Object, // {y: [], x: []}
	},
	methods: {
		// calculate opacity for given value based on max value
		opacity (v) {
			return this.max == 0 ? 0 : v/this.max
		}
	},
	computed: {
		// maximum value in given dataset
		max () {
			let max = 0
			for (let d in this.dataset) {
				let m = Math.max(...this.dataset[d])
				max = m > max ? m : max
			}
			return max
		},
		// total number of cells in x direction
		width () {
			return this.labels.x.length+1
		},
		// total number of cells in y direction
		height () {
			return this.labels.y.length+1
		},
	}
}
</script>

<style lang="stylus">
.heatmap
	display grid
	.cell
		height 25px
		transition background .8s ease
		&.tooltip
			position relative
			&::after
				background rgba(0,0,0, .75)
				border-radius 3px
				bottom 100%
				color white
				content attr(data-tooltip)
				display block
				font-size .75em
				left 50%
				opacity 0
				padding .5em
				pointer-events none
				position absolute
				transform translate(-50%, .8rem)
				transition opacity .2s, transform .2s
				white-space pre
				z-index 5
			&:focus, &:hover
				&::after
					opacity 1
					transform translate(-50%, -.4rem)
	.x-label
		margin-top .5em
</style>
