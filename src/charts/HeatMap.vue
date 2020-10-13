<template>
<div class='chart'>
	<h2 v-if='title' class='text-center'>{{ title }}</h2>
	<p v-if='description' class='text-gray text-center'>{{ description }}</p>
	<div 
		class="heatmap"
		:style="
			'grid-template-columns: auto repeat(' + width + ', 1fr);'
			+ 'grid-template-rows: repeat(' + height + ', 1fr) auto;'
			+ 'grid-gap: ' + spacing + 'px;'
		"
	>
		<template v-for='(y, n, i) in labels.y' :key='i'>
			<div class="y-label text-gray text-small text-right">
				<div>{{ y }}</div>
			</div>
			<template v-for='(x, m, j) in labels.x' :key='j'>
				<div
					:style="'background: rgba(' + rgb + ', ' + opacity(dataset.data[n][m]) + ')'"
					:data-tooltip="y + ', ' + (x) + ':00\n' + dataset.label + ': ' + dataset.data[n][m]"
					class='cell tooltip'
				></div>
			</template>
		</template>
		<div></div>
		<div v-for='(x, k) in labels.x' :key='k' class="x-label text-gray text-small text-center">
			<div v-if='k%2==1'>{{ x }}</div>
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
		spacing: Number,
		dataset: Object, // {data: [[],[],...], label: ''}
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
			for (let d in this.dataset.data) {
				let m = Math.max(...this.dataset.data[d])
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
.heatmap
	display grid
	.cell
		position relative
		box-sizing border-box
		transition background .8s ease
		&::before
			content ''
			display block
			padding-top 100%
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
		&>div
			padding-top 5px
	.y-label
		display flex
		justify-content flex-end
		align-items center
		&>div
			padding-right 5px
</style>
