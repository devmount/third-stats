<template>
<div class='chart heatmap'>
	<h2 v-if='title' class='text-center'>{{ title }}</h2>
	<p v-if='description' class='text-gray text-center'>{{ description }}</p>
	<div v-for='r in 7' :key='r' class='row'>
		<div class='legend text-gray text-small text-right mr-1'>{{ weekdays[r-1] }}</div>
		<div
			v-for='c in 24'
			:key='c'
			:style="'background: rgba(' + rgb + ', ' + opacity(dataset[r-1][c-1]) + ')'"
			:data-tooltip="weekdays[r-1] + ', ' + (c-1) + ':00\n' + dataset[r-1][c-1] + ' mails'"
			class='cell tooltip'
		></div>
	</div>
	<div class='row'>
		<div class='legend mr-1'></div>
		<div v-for='c in 24' :key='c' class='legend text-gray text-small text-center mt-1'>
			<span v-if='c%2==1'>{{c-1}}</span>
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
	},
	methods: {
		opacity (v) {
			return this.mailsPerWeekdayPerHourMax == 0 ? 0 : v/this.mailsPerWeekdayPerHourMax
		}
	},
	computed: {
		mailsPerWeekdayPerHourMax () {
			let max = 0
			for (let d in this.dataset) {
				let m = Math.max(...this.dataset[d])
				max = m > max ? m : max
			}
			return max
		},
		weekdays () {
			return ['Mo','Tu','We','Th','Fr','Sa','Su']
		}
	}
}
</script>

<style lang="stylus">
.heatmap
	.row
		display flex
		.cell, .legend
			height 25px
			width calc(100%/8)
			transition background .8s ease
	.tooltip
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
</style>
