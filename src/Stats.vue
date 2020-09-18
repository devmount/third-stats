<template>
	<div id='stats'>
		<h1>Th<span class='text-gray'>underb</span>ird Stats</h1>
		<section class="numbers">
			<!-- total -->
			<div>
				<div class="text-gray">Mails total</div>
				<div class="featured">{{ numbers.total.toLocaleString() }}</div>
				<div class="text-gray">within {{ oneDigit(years) }} years</div>
			</div>
			<!-- unread -->
			<div>
				<div class="text-gray">Mails unread</div>
				<div class="featured">{{ numbers.unread.toLocaleString() }}</div>
				<div class="text-gray" v-if='numbers.unread == 0'>Nice work!</div>
			</div>
			<!-- received -->
			<div>
				<div class="text-gray">Mails received</div>
				<div class="featured text-primary">{{ numbers.received.toLocaleString() }}</div>
				<div class="text-gray">{{ receivedPercentage }}% of total</div>
			</div>
			<!-- sent -->
			<div>
				<div class="text-gray">Mails sent</div>
				<div class="featured text-secondary">{{ numbers.sent.toLocaleString() }}</div>
				<div class="text-gray">{{ sentPercentage }}% of total</div>
			</div>
			<!-- per month / per year -->
			<div>
				<div class="text-gray">Mails per Month</div>
				<div class="featured">{{ oneDigit(numbers.total/months) }}</div>
				<div class="text-gray">{{ oneDigit(numbers.total/years) }} mails/year</div>
			</div>
			<!-- per day / per week -->
			<div>
				<div class="text-gray">Mails per day</div>
				<div class="featured">{{ oneDigit(numbers.total/days) }}</div>
				<div class="text-gray">{{ oneDigit(numbers.total/weeks) }} mails/week</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Stats',
	data () {
		return {
			activeAccount: null,
			numbers: {
				total: 0,
				unread: 0,
				received: 0,
				sent: 0,
				start: new Date('1990-01-01'),
			}
		}
	},
	created () {
		// this.getAccount('account3')
	},
	computed: {
		days () {
			const oneDay = 24 * 60 * 60 * 1000
			let today = new Date()
			return Math.round(Math.abs((this.numbers.start - today) / oneDay))
		},
		weeks () {
			return this.days/7
		},
		months () {
			return this.days/(365/12)
		},
		years () {
			return this.days/365
		},
		receivedPercentage () {
			if (this.numbers.total > 0) {
				return this.twoDigit(this.numbers.received/this.numbers.total)
			} else {
				return 0
			}
		},
		sentPercentage () {
			if (this.numbers.total > 0) {
				return this.twoDigit(this.numbers.sent/this.numbers.total)
			} else {
				return 0
			}
		},
	}
}
</script>

<style lang='stylus'>
// general
html, body
	margin 0
	padding 0 1rem
	font-family 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
	background #2f2f33
	color #f9f9fa
	font-weight 300
	font-size 16px

// layout
#stats
	width 100%
	height 100%
	max-width 1200px
	margin 0 auto

	.numbers
		display flex
		flex-direction row
		justify-content space-between
		&>div
			text-align center
			.featured
				font-size: 3.25em;
				line-height: 1em;
				font-weight: 500;

// utilities
.text-gray
	color #8a8a97
.text-primary
	color #0a84ff
.text-secondary
	color #ec213b
</style>
