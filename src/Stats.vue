<template>
	<div id='stats'>
		<h1>
			<span class='mr-2'>Th<span class='text-gray'>underb</span>ird Stats</span>
			<span v-if='waiting' class='loading'></span>
		</h1>
		<section class='numbers'>
			<!-- total -->
			<div>
				<div class='text-gray'>Mails total</div>
				<div class='featured'>{{ numbers.total.toLocaleString() }}</div>
				<div class='text-gray'>within {{ oneDigit(years) }} years</div>
			</div>
			<!-- unread -->
			<div>
				<div class='text-gray'>Mails unread</div>
				<div class='featured'>{{ numbers.unread.toLocaleString() }}</div>
				<div class='text-gray' v-if='numbers.unread == 0'>Nice work!</div>
			</div>
			<!-- received -->
			<div>
				<div class='text-gray'>Mails received</div>
				<div class='featured text-primary'>{{ numbers.received.toLocaleString() }}</div>
				<div class='text-gray'>{{ receivedPercentage }}% of total</div>
			</div>
			<!-- sent -->
			<div>
				<div class='text-gray'>Mails sent</div>
				<div class='featured text-secondary'>{{ numbers.sent.toLocaleString() }}</div>
				<div class='text-gray'>{{ sentPercentage }}% of total</div>
			</div>
			<!-- per month / per year -->
			<div>
				<div class='text-gray'>Mails per Month</div>
				<div class='featured'>{{ perMonth }}</div>
				<div class='text-gray'>{{ perYear }} mails/year</div>
			</div>
			<!-- per day / per week -->
			<div>
				<div class='text-gray'>Mails per day</div>
				<div class='featured'>{{ perDay }}</div>
				<div class='text-gray'>{{ perWeek }} mails/week</div>
			</div>
		</div>
	</div>
</template>

<script>
import { traverseAccount } from './utils';

export default {
	name: 'Stats',
	data () {
		return {
			waiting: true,
			numbers: {
				total: 0,
				unread: 0,
				received: 0,
				sent: 0,
				start: new Date(),
			}
		}
	},
	created () {
		this.getAccount('account3')
	},
	methods: {
		getAccount: async function (id) {
			let a = await browser.accounts.get(id)
			let identities = a.identities.map(i => i.email)
			let folders = traverseAccount(a)
			let self = this
			await Promise.all(folders.map(async f => {
				await self.processMessages(f, identities)
			})).then(() => {
				this.waiting = false
			})
		},
		// process all messages of a folder
		processMessages: async function (folder, identities) {
			let self = this
			let page = await browser.messages.list(folder)
			page.messages.map(m => self.analyzeMessage(m, identities))
			while (page.id) {
				page = await browser.messages.continueList(page.id)
				page.messages.map(m => self.analyzeMessage(m, identities))
			}
		},
		// extract information of a single message
		analyzeMessage (m, identities) {
			this.numbers.total++
			if (m.read === false) this.numbers.unread++
			let author = m.author
			if (author.lastIndexOf("<")>=0 && author.lastIndexOf(">")>=0) {
				author = author.substring(author.lastIndexOf("<") + 1, author.lastIndexOf(">"))
			}
			if (identities.includes(author)) this.numbers.sent++
			else this.numbers.received++
			if (m.date.getTime() < this.numbers.start.getTime()) this.numbers.start = m.date
		}
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
				return this.twoDigit(this.numbers.received*100/this.numbers.total)
			} else {
				return 0
			}
		},
		sentPercentage () {
			if (this.numbers.total > 0) {
				return this.twoDigit(this.numbers.sent*100/this.numbers.total)
			} else {
				return 0
			}
		},
		perDay () {
			if (this.numbers.total > 0 && this.days > 0) {
				return this.oneDigit(this.numbers.total/this.days)
			} else {
				return 0
			}
		},
		perWeek () {
			if (this.numbers.total > 0 && this.weeks > 0) {
				return this.oneDigit(this.numbers.total/this.weeks)
			} else {
				return 0
			}
		},
		perMonth () {
			if (this.numbers.total > 0 && this.months > 0) {
				return this.oneDigit(this.numbers.total/this.months)
			} else {
				return 0
			}
		},
		perYear () {
			if (this.numbers.total > 0 && this.years > 0) {
				return this.oneDigit(this.numbers.total/this.years)
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

	h1
		& > span
			vertical-align middle
		.loading
			display inline-block
			height 20px
			width 20px
			border 4px solid rgba(150, 150, 150, 0.2)
			border-radius 50%
			border-top-color rgb(150, 150, 150)
			animation rotate 1s 0s infinite linear

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
.mr-1
	margin-right 1rem
.mr-2
	margin-right 2rem

@keyframes rotate
	0%
		transform rotate(0)
	100%
		transform rotate(360deg)
</style>
