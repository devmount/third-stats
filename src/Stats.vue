<template>
	<div id='stats'>
		<h1>
			<span class='mr-2'>Th<span class='text-gray'>underb</span>ird Stats</span>
			<span v-if='waiting' class='loading'></span>
		</h1>
		<!-- fetured numbers -->
		<section class='numbers mt-2'>
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
				<div class='text-gray' v-else>{{ unreadPercentage }}% of received</div>
			</div>
			<!-- received -->
			<div>
				<div class='text-gray text-secondary'>Mails received</div>
				<div class='featured text-secondary'>{{ numbers.received.toLocaleString() }}</div>
				<div class='text-gray'>{{ receivedPercentage }}% of total</div>
			</div>
			<!-- sent -->
			<div>
				<div class='text-gray text-primary'>Mails sent</div>
				<div class='featured text-primary'>{{ numbers.sent.toLocaleString() }}</div>
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
		</section>
		<!-- number of mails per year -->
		<section class='charts mt-2'>
			<LineChart
				title='Years'
				description='Total number of emails per year'
				:datasets='yearsChartData.datasets'
				:labels='yearsChartData.labels'
			/>
			<LineChart
				title='Months'
				description='Total number of emails per month'
				:datasets='monthsChartData.datasets'
				:labels='monthsChartData.labels'
			/>
			<BarChart
				title='Daytime'
				description='Number of emails per time of day'
				:datasets='daytimeChartData.datasets'
				:labels='daytimeChartData.labels'
			/>
			<BarChart
				title='Weekday'
				description='Number of emails per day of week'
				:datasets='weekdayChartData.datasets'
				:labels='weekdayChartData.labels'
			/>
		</section>
		<!-- footer -->
		<footer class="mt-4 text-center">
			<div class='text-gray'>ThirdStats v{{ appVersion }}</div>
		</footer>
	</div>
</template>

<script>
// internal components
import { traverseAccount } from './utils';
import LineChart from './charts/LineChart'
import BarChart from './charts/BarChart'

// initialize Chart.js with global configuration
import Chart from 'chart.js'
Chart.defaults.global.defaultFontColor = "#8a8a97"
Chart.defaults.global.elements.arc.borderWidth = 0
Chart.defaults.global.legend.display = false
Chart.defaults.global.tooltips.mode = 'index'
Chart.defaults.global.tooltips.intersect = false
Chart.defaults.global.tooltips.multiKeyBackground = '#000'
Chart.defaults.global.tooltips.titleMarginBottom = 10
Chart.defaults.global.tooltips.xPadding = 10
Chart.defaults.global.tooltips.yPadding = 10
Chart.defaults.global.tooltips.cornerRadius = 2
Chart.defaults.global.hover.mode = 'index'

// define helper classes for object generation
class NumberedObject {
	constructor(n) {
		const a = [...Array(n).keys()]
		a.map(e => { this[e] = 0 })
	}
}

export default {
	name: 'Stats',
	components: {
		LineChart,
		BarChart,
	},
	data () {
		return {
			waiting: true,
			numbers: {
				total: 0,
				unread: 0,
				received: 0,
				sent: 0,
				start: new Date(),
			},
			yearsData: {
				received: {},
				sent: {},
			},
			monthsData: {
				received: {},
				sent: {},
			},
			daytimeData: {
				received: new NumberedObject(24),
				sent: new NumberedObject(24),
			},
			weekdayData: {
				received: new NumberedObject(7),
				sent: new NumberedObject(7),
			},
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
			let type = ''
			// numbers
			this.numbers.total++
			if (m.read === false) this.numbers.unread++
			let author = m.author
			if (author.lastIndexOf("<")>=0 && author.lastIndexOf(">")>=0) {
				author = author.substring(author.lastIndexOf("<") + 1, author.lastIndexOf(">"))
			}
			if (identities.includes(author)) {
				this.numbers.sent++
				type = 'sent'
			} else {
				this.numbers.received++
				type = 'received'
			}
			if (m.date.getTime() < this.numbers.start.getTime()) this.numbers.start = m.date
			// years
			let y = m.date.getFullYear()
			if (!(y in this.yearsData[type])) {
				this.yearsData[type][y] = 1
			} else {
				this.yearsData[type][y]++
			}
			// months
			let mo = m.date.getMonth()
			if (!(y in this.monthsData[type])) {
				this.monthsData[type][y] = {}
				this.monthsData[type][y][mo] = 1
			} else {
				if (!(mo in this.monthsData[type][y])) {
					this.monthsData[type][y][mo] = 1
				} else {
					this.monthsData[type][y][mo]++
				}
			}
			// daytime
			let dt = m.date.getHours()
			this.daytimeData[type][dt]++
			// weekday
			let wd = m.date.getDay()
			this.weekdayData[type][wd]++
		}
	},
	computed: {
		appVersion () {
			return process.env.PACKAGE_VERSION;
		},
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
		unreadPercentage () {
			if (this.numbers.received > 0) {
				return this.twoDigit(this.numbers.unread*100/this.numbers.received)
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
		yearsChartData () {
			if (this.waiting) {
				return {
					datasets: [],
					labels: []
				}
			} else {
				let r = this.yearsData.received, s = this.yearsData.sent
				let today = new Date()
				for (let y = this.numbers.start.getFullYear(); y <= today.getFullYear(); ++y) {
					if (!r[y]) r[y] = 0
					if (!s[y]) s[y] = 0
				}
				return {
					datasets: [
						{ label: 'Mails sent', data: Object.values(s), color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
						{ label: 'Mails received', data: Object.values(r), color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
					],
					labels: Object.keys(r)
				}
			}
		},
		monthsChartData () {
			if (this.waiting) {
				return {
					datasets: [],
					labels: []
				}
			} else {
				let r = this.monthsData.received
				let s = this.monthsData.sent
				let labels = [], dr = [], ds = []
				let monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
				let today = new Date()
				for (let y = this.numbers.start.getFullYear(); y <= today.getFullYear(); ++y) {
					for (let m = 0; m < 12; ++m) {
						// trim months before start date
						if (y == this.numbers.start.getFullYear() && m < this.numbers.start.getMonth()) continue
						// trim months in future
						if (y == today.getFullYear() && m > today.getMonth()) break
						// organize labels and data
						labels.push(y + ' ' + monthNames[m])
						dr.push(y in r && m in r[y] ? r[y][m] : 0)
						ds.push(y in s && m in s[y] ? s[y][m] : 0)
					}
				}
				return {
					datasets: [
						{ label: 'Mails sent', data: ds, color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
						{ label: 'Mails received', data: dr, color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
					],
					labels: labels
				}
			}
		},
		daytimeChartData () {
			if (this.waiting) {
				return {
					datasets: [],
					labels: []
				}
			} else {
				let r = this.daytimeData.received, s = this.daytimeData.sent
				return {
					datasets: [
						{ label: 'Mails sent', data: Object.values(s), color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
						{ label: 'Mails received', data: Object.values(r), color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
					],
					labels: Object.keys(r)
				}
			}
		},
		weekdayChartData () {
			if (this.waiting) {
				return {
					datasets: [],
					labels: []
				}
			} else {
				let r = Object.values(this.weekdayData.received)
				let s = Object.values(this.weekdayData.sent)
				// start week with monday instead of sunday
				r.push(r.shift())
				s.push(s.shift())
				return {
					datasets: [
						{ label: 'Mails sent', data: s, color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
						{ label: 'Mails received', data: r, color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
					],
					labels: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
				}
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
	background #202023
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
				font-size 3.25em
				line-height 1em
				font-weight 500

	.charts
		display grid
		grid-template-columns 1fr 1fr
		column-gap 1rem
		row-gap 1rem
		.chart
			h2
				margin-bottom 0
			p
				margin-top 0

// utilities
.text-gray
	color #8a8a97
.text-primary
	color #e64db9
.text-secondary
	color #0a84ff
.text-center
	text-align center
.mr-1
	margin-right 1rem
.mt-2
	margin-top 2rem
.mt-4
	margin-top 4rem
.mr-2
	margin-right 2rem

@keyframes rotate
	0%
		transform rotate(0)
	100%
		transform rotate(360deg)
</style>
