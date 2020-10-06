<template>
	<div id='stats'>
		<h1>
			<span class='mr-2'>Th<span class='text-gray'>underb</span>ird Stats</span>
			<select v-model='activeAccount' name='account' :disabled='waiting'>
				<option v-for='a in accounts' :key='a.id' :value='a.id'>{{ a.name }}</option>
			</select>
			<span v-if='waiting' class='loading'></span>
			<svg v-else class='ready' width='36' height='36' viewBox='0 0 24 24' stroke-width='3' stroke='#8a8a97' fill='none' stroke-linecap='round' stroke-linejoin='round'>
				<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
				<path d='M5 12l5 5l10 -10' />
			</svg>
		</h1>
		<!-- fetured numbers -->
		<section class='numbers mt-2'>
			<!-- total -->
			<div>
				<div class='text-gray'>{{ $t('stats.mailsTotal') }}</div>
				<div class='featured'>{{ numbers.total.toLocaleString() }}</div>
				<div class='text-gray'>{{ $t('stats.withinYears', [oneDigit(years)]) }}</div>
			</div>
			<!-- unread -->
			<div>
				<div class='text-gray'>{{ $t('stats.mailsUnread') }}</div>
				<div class='featured'>{{ numbers.unread.toLocaleString() }}</div>
				<div class='text-gray' v-if='numbers.unread == 0'>{{ $t('stats.niceWork') }}</div>
				<div class='text-gray' v-else>{{ $t('stats.percentOfReceived', [unreadPercentage]) }}</div>
			</div>
			<!-- received -->
			<div>
				<div class='text-gray text-secondary'>{{ $t('stats.mailsReceived') }}</div>
				<div class='featured text-secondary'>{{ numbers.received.toLocaleString() }}</div>
				<div class='text-gray'>{{ $t('stats.percentOfTotal', [receivedPercentage]) }}</div>
			</div>
			<!-- sent -->
			<div>
				<div class='text-gray text-primary'>{{ $t('stats.mailsSent') }}</div>
				<div class='featured text-primary'>{{ numbers.sent.toLocaleString() }}</div>
				<div class='text-gray'>{{ $t('stats.percentOfTotal', [sentPercentage]) }}</div>
			</div>
			<!-- per month / per year -->
			<div>
				<div class='text-gray'>{{ $t('stats.mailsPerMonth') }}</div>
				<div class='featured'>{{ perMonth }}</div>
				<div class='text-gray'>{{ perYear }} {{ $t('stats.mailsYear') }}</div>
			</div>
			<!-- per day / per week -->
			<div>
				<div class='text-gray'>{{ $t('stats.mailsPerDay') }}</div>
				<div class='featured'>{{ perDay }}</div>
				<div class='text-gray'>{{ perWeek }} {{ $t('stats.mailsWeek') }}</div>
			</div>
		</section>
		<!-- still processing -->
		<section v-if='waiting' class='mt-5'>
			<svg class="icon icon-huge d-block m-0-auto icon-animated-color-transition" viewBox="0 0 24 24">
				<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
				<polyline points="4 19 8 13 12 15 16 10 20 14 20 19 4 19" />
				<polyline points="4 12 7 8 11 10 16 4 20 8" />
			</svg>
			<div class="text-center text-gray">
				{{ $t("stats.loadingInProgress") }}
			</div>
		</section>
		<!-- empty account -->
		<section v-else-if='numbers.total == 0' class='mt-5'>
			<svg class="icon icon-huge d-block m-0-auto" viewBox="0 0 24 24">
				<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
				<rect x="4" y="4" width="16" height="16" rx="2" />
				<path d="M4 13h3l3 3h4l3 -3h3" />
			</svg>
			<div class="text-center text-gray">
				{{ $t("stats.accountEmpty") }}
			</div>
		</section>
		<!-- charts -->
		<section v-else class='charts mt-2'>
			<div id='chart-area-top' class='chart-area'>
				<LineChart
					:title='$t("stats.charts.years.title")'
					:description='$t("stats.charts.years.description")'
					:datasets='yearsChartData.datasets'
					:labels='yearsChartData.labels'
				/>
				<LineChart
					:title='$t("stats.charts.months.title")'
					:description='$t("stats.charts.months.description")'
					:datasets='monthsChartData.datasets'
					:labels='monthsChartData.labels'
				/>
			</div>
			<div id='chart-area-main' class='chart-area'>
				<BarChart
					:title='$t("stats.charts.daytime.title")'
					:description='$t("stats.charts.daytime.description")'
					:datasets='daytimeChartData.datasets'
					:labels='daytimeChartData.labels'
				/>
				<BarChart
					:title='$t("stats.charts.weekday.title")'
					:description='$t("stats.charts.weekday.description")'
					:datasets='weekdayChartData.datasets'
					:labels='weekdayChartData.labels'
				/>
				<BarChart
					:title='$t("stats.charts.monthsTotal.title")'
					:description='$t("stats.charts.monthsTotal.description")'
					:datasets='monthsTotalChartData.datasets'
					:labels='monthsTotalChartData.labels'
				/>
				<div class="chart-group">
					<HeatMap
						:title='$t("stats.charts.temporalDistribution.title")'
						:description='$t("stats.charts.temporalDistribution.description.received")'
						rgb='10, 132, 255'
						:dataset='weekdayPerHourChartData.received'
						:labels='{ y: weekdayNames, x: Array.from(Array(24).keys())}'
					/>
					<HeatMap
						:description='$t("stats.charts.temporalDistribution.description.sent")'
						rgb='230, 77, 185'
						:dataset='weekdayPerHourChartData.sent'
						:labels='{ y: weekdayNames, x: Array.from(Array(24).keys())}'
					/>
				</div>
				<BarChart
					:title='$t("stats.charts.leader.received.title")'
					:description='$t("stats.charts.leader.received.description")'
					:datasets='receivedContactLeadersChartData.datasets'
					:labels='receivedContactLeadersChartData.labels'
					:horizontal='true'
				/>
				<BarChart
					:title='$t("stats.charts.leader.sent.title")'
					:description='$t("stats.charts.leader.sent.description")'
					:datasets='sentContactLeadersChartData.datasets'
					:labels='sentContactLeadersChartData.labels'
					:horizontal='true'
				/>
			</div>
		</section>
		<!-- footer -->
		<footer class="my-6 text-center">
			<div class='text-gray'>ThirdStats v{{ appVersion }}</div>
			<div class="text-gray" v-html='$t("stats.starAndImprove", ["https://github.com/devmount/third-stats"])'></div>
		</footer>
	</div>
</template>

<script>
// internal components
import { traverseAccount, extractEmailAddress } from './utils';
import LineChart from './charts/LineChart'
import BarChart from './charts/BarChart'
import HeatMap from './charts/HeatMap'

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
	constructor(n, m=null) {
		const a = [...Array(n).keys()]
		a.map(e => {
			this[e] = m === null ? 0 : new Array(m).fill(0)
		})
	}
}

export default {
	name: 'Stats',
	components: {
		LineChart,
		BarChart,
		HeatMap,
	},
	data () {
		return {
			accounts: [],
			activeAccount: null,
			waiting: true,
			numbers: {},
			yearsData: {},
			monthsData: {},
			daytimeData: {},
			weekdayData: {},
			weekdayPerHourData: {},
			contacts: {},
		}
	},
	created () {
		this.reset()
		this.getAccounts()
	},
	methods: {
		getAccounts: async function () {
			let accounts = await browser.accounts.list()
			// check if a specific account was given
			let uri = window.location.search.substring(1)
			let params = new URLSearchParams(uri)
			let accountPosition = Number(params.get('a'))
			// assign accounts
			this.accounts = accounts
			this.activeAccount = accounts[accountPosition].id
		},
		processAccount: async function (id) {
			this.waiting = true
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
			let author = extractEmailAddress(m.author)
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
			// weekday per hour
			this.weekdayPerHourData[type][wd][dt]++
			// contacts
			switch (type) {
				case 'sent':
					let recipients = m.recipients.map(r => extractEmailAddress(r).toLowerCase())
					recipients.map(r => {
						if (!(r in this.contacts['sent'])) {
							this.contacts['sent'][r] = 1
						} else {
							this.contacts['sent'][r]++
						}
					})
					break;
				case 'received':
					let a = author.toLowerCase()
					if (!(a in this.contacts['received'])) {
						this.contacts['received'][a] = 1
					} else {
						this.contacts['received'][a]++
					}
					break;
				default:
					break;
			}
		},
		reset () {
			this.numbers = {
				total: 0,
				unread: 0,
				received: 0,
				sent: 0,
				start: new Date(),
			}
			this.yearsData = {
				received: {},
				sent: {},
			}
			this.monthsData = {
				received: {},
				sent: {},
			}
			this.daytimeData = {
				received: new NumberedObject(24),
				sent: new NumberedObject(24),
			}
			this.weekdayData = {
				received: new NumberedObject(7),
				sent: new NumberedObject(7),
			}
			this.weekdayPerHourData = {
				received: new NumberedObject(7,24),
				sent: new NumberedObject(7,24),
			},
			this.contacts = {
				received: {},
				sent: {},
			}
		},
	},
	computed: {
		appVersion () {
			return process.env.PACKAGE_VERSION;
		},
		monthNames () {
			let names = []
			for (let m = 1; m <= 12; m++) {
				let d = new Date(1970, m, 0) // choose a date to retrieve months from, starting in January
				names.push(d.toLocaleDateString(this.$i18n.locale, { month: 'short' }))
			}
			return names
		},
		weekdayNames () {
			let names = []
			for (let wd = 1; wd <= 7; wd++) {
				let d = new Date(1970, 1, 1+wd) // choose a date to retrieve weekdays from, starting on a Monday
				names.push(d.toLocaleDateString(this.$i18n.locale, { weekday: 'short' }))
			}
			return names
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
		leaderboardReceived () {
			return Object.entries(this.contacts.received)
				.sort(([,a],[,b]) => b-a)
				.reduce((r, [k, v]) => ({ ...r, [k]: v }), {})
		},
		leaderboardSent () {
			return Object.entries(this.contacts.sent)
				.sort(([,a],[,b]) => b-a)
				.reduce((r, [k, v]) => ({ ...r, [k]: v }), {})
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
						{ label: this.$t('stats.mailsSent'), data: Object.values(s), color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
						{ label: this.$t('stats.mailsReceived'), data: Object.values(r), color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
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
				let today = new Date()
				for (let y = this.numbers.start.getFullYear(); y <= today.getFullYear(); ++y) {
					for (let m = 0; m < 12; ++m) {
						// trim months before start date
						if (y == this.numbers.start.getFullYear() && m < this.numbers.start.getMonth()) continue
						// trim months in future
						if (y == today.getFullYear() && m > today.getMonth()) break
						// organize labels and data
						labels.push(y + ' ' + this.monthNames[m])
						dr.push(y in r && m in r[y] ? r[y][m] : 0)
						ds.push(y in s && m in s[y] ? s[y][m] : 0)
					}
				}
				return {
					datasets: [
						{ label: this.$t('stats.mailsSent'), data: ds, color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
						{ label: this.$t('stats.mailsReceived'), data: dr, color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
					],
					labels: labels
				}
			}
		},
		monthsTotalChartData () {
			if (this.waiting) {
				return {
					datasets: [],
					labels: []
				}
			} else {
				let r = this.monthsData.received
				let s = this.monthsData.sent
				let dr = [], ds = []
				let today = new Date()
				for (let m = 0; m < 12; ++m) {
					let mtr = 0, mts = 0
					for (let y = this.numbers.start.getFullYear(); y <= today.getFullYear(); ++y) {
						if (y == this.numbers.start.getFullYear() && m < this.numbers.start.getMonth()) continue
						if (y == today.getFullYear() && m > today.getMonth()) break
						mtr += y in r && m in r[y] ? r[y][m] : 0
						mts += y in s && m in s[y] ? s[y][m] : 0
					}
					dr.push(mtr)
					ds.push(mts)
				}
				return {
					datasets: [
						{ label: this.$t('stats.mailsSent'), data: ds, color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
						{ label: this.$t('stats.mailsReceived'), data: dr, color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
					],
					labels: this.monthNames
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
						{ label: this.$t('stats.mailsSent'), data: Object.values(s), color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
						{ label: this.$t('stats.mailsReceived'), data: Object.values(r), color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
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
						{ label: this.$t('stats.mailsSent'), data: s, color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
						{ label: this.$t('stats.mailsReceived'), data: r, color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
					],
					labels: this.weekdayNames
				}
			}
		},
		weekdayPerHourChartData () {
			if (this.waiting) {
				return {
					received: new NumberedObject(7,24),
					sent: new NumberedObject(7,24),
				}
			} else {
				let r = Object.values(this.weekdayPerHourData.received)
				let s = Object.values(this.weekdayPerHourData.sent)
				// start week with monday instead of sunday
				r.push(r.shift())
				s.push(s.shift())
				return {
					received: r,
					sent: s,
				}
			}
		},
		receivedContactLeadersChartData () {
			if (this.waiting) {
				return {
					datasets: [],
					labels: []
				}
			} else {
				const leaderCount = 20
				let r = this.leaderboardReceived
				return {
					datasets: [
						{ label: this.$t('stats.mailsReceived'), data: Object.values(r).slice(0, leaderCount), color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
					],
					labels: Object.keys(r).slice(0, leaderCount)
				}
			}
		},
		sentContactLeadersChartData () {
			if (this.waiting) {
				return {
					datasets: [],
					labels: []
				}
			} else {
				const leaderCount = 20
				let s = this.leaderboardSent
				return {
					datasets: [
						{ label: this.$t('stats.mailsSent'), data: Object.values(s).slice(0, leaderCount), color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
					],
					labels: Object.keys(s).slice(0, leaderCount)
				}
			}
		},
	},
	watch: {
		activeAccount (a) {
			this.reset()
			this.processAccount(a)
		}
	}
}
</script>

<style lang='stylus'>
// general
html, body
	margin 0
	padding 0
body
	font-family 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
	background #202023
	color #f9f9fa
	font-weight 300
	font-size 16px
	overflow-x hidden

// layout
@media (min-width: 2501px)
	#stats
		max-width 2500px
		#chart-area-main
			grid-template-columns repeat(6, 1fr)
@media (max-width: 2500px)
	#stats
		max-width 2200px
		#chart-area-main
			grid-template-columns repeat(3, 1fr)
@media (max-width: 2000px)
	#stats
		max-width 1750px
		#chart-area-main
			grid-template-columns repeat(3, 1fr)
@media (max-width: 1500px)
	#stats
		max-width 1200px
		#chart-area-main
			grid-template-columns repeat(2, 1fr)
@media (min-width: 961px)
	#stats
		.numbers
			max-width 1500px
			grid-template-columns repeat(6, 1fr)
		#chart-area-top
			grid-template-columns 1fr 2fr
@media (max-width: 960px)
	#stats
		.numbers
			grid-template-columns repeat(3, 1fr)
		#chart-area-top
			grid-template-columns 1fr
@media (max-width: 720px)
	#stats
		#chart-area-main
			grid-template-columns 1fr

// content
#stats
	width 100%
	height 100%
	padding 0 2rem
	margin 0 auto
	box-sizing border-box

	h1
		display grid
		grid-template-columns 1fr auto 55px
		align-items center
		justify-content start
		.loading
			display inline-block
			height 20px
			width 20px
			border 4px solid #2a2a2e
			border-radius 50%
			border-top-color #8a8a97
			animation rotate 1s 0s infinite linear
		.loading, .ready
			justify-self center
		select
			justify-self end
			appearance none
			border none
			border-radius 4px
			color inherit
			padding .5rem
			outline none
			background #2a2a2e
			box-shadow 0 8px 15px -8px #1d1d1f
			&:focus
				box-shadow: 0 0 0 .35rem rgba(#f9f9fa, .2)
			&[disabled]
				color #8a8a97

	.numbers
		display grid
		column-gap 1rem
		row-gap 2rem
		margin 0 auto
		&>div
			text-align center
			.featured
				font-size 3.25em
				line-height 1em
				font-weight 500

	.charts
		.chart-area
			display grid
			column-gap 2rem
			row-gap 1rem
			& > *
				min-height 380px
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
.text-right
	text-align right
.text-small
	font-size .75em
.mr-1
	margin-right 1rem
.mt-1
	margin-top 1rem
.mt-2
	margin-top 2rem
.mt-5
	margin-top 5rem
.mr-1
	margin-right 1rem
.mr-2
	margin-right 2rem
.my-6
	margin-top 6rem
	margin-bottom 6rem
.m-0-auto
	margin 0 auto
.d-block
	display block

// icons
.icon
	stroke-width 1.5
	stroke #494951
	fill none
	stroke-linecap round
	stroke-linejoin round

	&.icon-huge
		width 10rem
		height 10rem

	&.icon-animated-color-transition
		animation colorFading 1s 0s infinite ease alternate


// animations
@keyframes rotate
	0%
		transform rotate(0)
	100%
		transform rotate(360deg)
@keyframes colorFading
	0%
		stroke #0a84ff
	100%
		stroke #e64db9
</style>
