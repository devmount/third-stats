<template>
	<div id='stats' :class='scheme + " text-normal background-normal"'>
		<div class='container pt-2 pb-6'>
			<h1>
				<span class='mr-2'>Th<span class='text-gray'>underb</span>ird Stats</span>
				<select v-model='activeAccount' name='account' :disabled='waiting' class="shadow focus-shadow" :class='{ disabled: waiting }'>
					<option v-for='a in accounts' :key='a.id' :value='a.id'>{{ a.name }}</option>
				</select>
				<div v-if='waiting' :class='scheme + " loading"'></div>
				<svg v-else class='ready icon icon-strong icon-gray' viewBox='0 0 24 24'>
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
					<div class='text-accent2'>{{ $t('stats.mailsReceived') }}</div>
					<div class='featured text-accent2'>{{ numbers.received.toLocaleString() }}</div>
					<div class='text-gray'>{{ $t('stats.percentOfTotal', [receivedPercentage]) }}</div>
				</div>
				<!-- sent -->
				<div>
					<div class='text-accent1'>{{ $t('stats.mailsSent') }}</div>
					<div class='featured text-accent1'>{{ numbers.sent.toLocaleString() }}</div>
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
				<svg class="icon icon-huge icon-gray d-block m-0-auto icon-animated-color-transition" viewBox="0 0 24 24">
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
				<svg class="icon icon-huge icon-gray d-block m-0-auto" viewBox="0 0 24 24">
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
					<div class='tab-area'>
						<ul class='tab'>
							<li
								v-for='(active, label) in tabs'
								:key='label'
								class='tab-item cursor-pointer'
								:class='{ "active": active }'
								@click='activateTab(label)'
							>
								<span>{{ $t('stats.charts.' + label + '.title') }}</span>
							</li>
						</ul>
						<div class='tab-content'>
							<!-- emails per year over total time -->
							<LineChart
								v-if='tabs.years'
								:title='$t("stats.charts.years.title")'
								:description='$t("stats.charts.years.description")'
								:datasets='yearsChartData.datasets'
								:labels='yearsChartData.labels'
							/>
							<!-- emails per month over total time -->
							<LineChart
								v-if='tabs.months'
								:title='$t("stats.charts.months.title")'
								:description='$t("stats.charts.months.description")'
								:datasets='monthsChartData.datasets'
								:labels='monthsChartData.labels'
							/>
						</div>
					</div>
				</div>
				<div id='chart-area-main' class='chart-area'>
					<!-- emails per time of day -->
					<BarChart
						:title='$t("stats.charts.daytime.title")'
						:description='$t("stats.charts.daytime.description")'
						:datasets='daytimeChartData.datasets'
						:labels='daytimeChartData.labels'
					/>
					<!-- emails per day of week -->
					<BarChart
						:title='$t("stats.charts.weekday.title")'
						:description='$t("stats.charts.weekday.description")'
						:datasets='weekdayChartData.datasets'
						:labels='weekdayChartData.labels'
					/>
					<!-- emails per month of year -->
					<BarChart
						:title='$t("stats.charts.month.title")'
						:description='$t("stats.charts.month.description")'
						:datasets='monthChartData.datasets'
						:labels='monthChartData.labels'
					/>
					<div class="chart-group">
						<!-- emails per weekday per hour received -->
						<HeatMap
							:title='$t("stats.charts.temporalDistribution.title")'
							:description='$t("stats.charts.temporalDistribution.description.received")'
							rgb='10, 132, 255'
							spacing='1px'
							rounding='5px'
							:dataset='weekdayPerHourChartData.received'
							:labels='{ y: weekdayPerHourChartData.labels, x: Array.from(Array(24).keys())}'
							class='mb-05'
						/>
						<!-- emails per weekday per hour sent -->
						<HeatMap
							:description='$t("stats.charts.temporalDistribution.description.sent")'
							rgb='230, 77, 185'
							spacing='1px'
							rounding='5px'
							:dataset='weekdayPerHourChartData.sent'
							:labels='{ y: weekdayPerHourChartData.labels, x: Array.from(Array(24).keys())}'
						/>
					</div>
					<!-- contacts most emails received from -->
					<BarChart
						:title='$t("stats.charts.leader.title.received")'
						:description='$t("stats.charts.leader.description.received")'
						:datasets='receivedContactLeadersChartData.datasets'
						:labels='receivedContactLeadersChartData.labels'
						:horizontal='true'
					/>
					<!-- contacts most emails sent to -->
					<BarChart
						:title='$t("stats.charts.leader.title.sent")'
						:description='$t("stats.charts.leader.description.sent")'
						:datasets='sentContactLeadersChartData.datasets'
						:labels='sentContactLeadersChartData.labels'
						:horizontal='true'
					/>
				</div>
			</section>
			<!-- footer -->
			<footer class="mt-6 text-center">
				<div class='text-gray'>
					<span class='text-middle mr-1'>ThirdStats v{{ appVersion }}</span>
					<svg
						v-if='preferences.dark'
						class='icon icon-dark icon-text icon-thin d-inline text-middle cursor-pointer'
						viewBox='0 0 24 24'
						@click.prevent='preferences.dark = false'
					>
						<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
						<circle cx='12' cy='12' r='4' />
						<path d='M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7' />
					</svg>
					<svg
						v-else
						class='icon icon-light icon-text icon-thin d-inline text-middle cursor-pointer'
						viewBox='0 0 24 24'
						@click.prevent='preferences.dark = true'
					>
						<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
						<path d='M12 3c0.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z' />
					</svg>
				</div>
				<div class="text-gray" v-html='$t("stats.starAndImprove", ["https://github.com/devmount/third-stats"])'></div>
			</footer>
		</div>
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
			tabs: {
				years: true,
				months: false,
			},
			preferences: {
				week: {
					start: 1
				},
				dark: true,
				localIdentities: []
			}
		}
	},
	created () {
		this.reset()
		this.getSettings()
		this.getPreferences()
		this.getAccounts()
	},
	methods: {
		// get all add-on settings
		getSettings: async function () {
			let result = await messenger.storage.local.get('options')
			this.preferences.localIdentities = result.options.addresses ? result.options.addresses.split(',').map(x => x.trim()) : []
			this.preferences.dark = result.options.dark ? true : false
		},
		// get legacy preferences
		getPreferences: async function () {
			let c = await messenger.LegacyPrefs.getUserPref("calendar.week.start")
			this.preferences.week.start = c
		},
		getAccounts: async function () {
			let accounts = await messenger.accounts.list()
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
			let a = await messenger.accounts.get(id)
			let identities = a.type != 'none' ? a.identities.map(i => i.email) : this.preferences.localIdentities
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
			if (folder) {
				let self = this
				let page = await messenger.messages.list(folder)
				page.messages.map(m => self.analyzeMessage(m, identities))
				while (page.id) {
					page = await messenger.messages.continueList(page.id)
					page.messages.map(m => self.analyzeMessage(m, identities))
				}
			} else {
				console.error('This folder doesn\'t exist')
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
			// calculate starting date (= date of oldest email)
			if (m.date && m.date.getTime() > 0 && m.date.getTime() < this.numbers.start.getTime()) {
				this.numbers.start = m.date
			}
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
		activateTab (label) {
			let self = this
			Object.keys(this.tabs).map(t => self.tabs[t] = false)
			this.tabs[label] = true
		}
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
				let d = new Date(1970, 1, wd) // choose a date to retrieve weekdays from, starting on a Sunday
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
		monthChartData () {
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
				let labels = [...this.weekdayNames]
				// start week with user defined day of week
				for (let d = 0; d < this.preferences.week.start; d++) {
					r.push(r.shift())
					s.push(s.shift())
					labels.push(labels.shift())
				}
				return {
					datasets: [
						{ label: this.$t('stats.mailsSent'), data: s, color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
						{ label: this.$t('stats.mailsReceived'), data: r, color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
					],
					labels: labels
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
				let labels = [...this.weekdayNames]
				// start week with user defined day of week
				for (let d = 0; d < this.preferences.week.start; d++) {
					r.push(r.shift())
					s.push(s.shift())
					labels.push(labels.shift())
				}
				return {
					received: { label: this.$t('stats.mailsReceived'), data: r },
					sent: { label: this.$t('stats.mailsSent'), data: s },
					labels: labels
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
		scheme () {
			return this.preferences.dark ? 'dark' : 'light'
		}
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
@require "assets/global"

// general
body
	overflow-x hidden

// layout and content
#stats
	min-height 100vh

	.container
		width 100%
		height 100%
		margin 0 auto
		padding-left 1rem
		padding-right 1rem
		box-sizing border-box

		@media (min-width: 2501px)
			max-width 2500px
			#chart-area-main
				grid-template-columns repeat(6, 1fr)
		@media (max-width: 2500px)
			max-width 2200px
			#chart-area-main
				grid-template-columns repeat(3, 1fr)
		@media (max-width: 2000px)
			max-width 1750px
			#chart-area-main
				grid-template-columns repeat(3, 1fr)
		@media (max-width: 1500px)
			max-width 1200px
			#chart-area-main
				grid-template-columns repeat(2, 1fr)
		@media (min-width: 961px)
			.numbers
				max-width 1500px
				grid-template-columns repeat(6, 1fr)
			#chart-area-top
				grid-template-columns 1fr 1fr
		@media (max-width: 960px)
			.numbers
				grid-template-columns repeat(3, 1fr)
			#chart-area-top
				grid-template-columns 1fr
		@media (max-width: 720px)
			#chart-area-main
				grid-template-columns 1fr

		h1
			margin-top 0
			display grid
			grid-template-columns 1fr auto 55px
			align-items center
			justify-content start
			.loading
				loader 20px
				justify-self center
			.ready
				justify-self center
			select
				justify-self end

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
				& > *, .tab-content > *
					min-height 380px
				.chart
					min-width 0
					h2
						margin-bottom 0
					p
						margin-top 0

</style>
