<template>
	<div id='stats' :class='scheme + " text-normal background-normal"'>
		<div class='container pt-2 pb-6'>
			<!-- title heading -->
			<header class='mb-1-5'>
				<h1 class='mr-2'>
					<img class='logo mr-1' :src='`${publicPath}icon.svg`' alt='ThirdStats Logo'>
					Th<span class='text-gray'>underb</span>ird Stats
				</h1>
				<!-- filter area -->
				<div class='filter d-flex flex-wrap'>
					<!-- account selection -->
					<div class='filter-account d-flex'>
						<label for='account' class='align-center text-gray p-0-5'>{{ $tc('popup.account', 1) }}</label>
						<select v-model='active.account' :disabled='waiting || loading' class='align-stretch shadow w-6' :class='{ disabled: waiting || loading }' id='account'>
							<option v-for='a in accounts' :key='a.id' :value='a.id'>{{ a.name }}</option>
						</select>
						<div v-show='waiting || loading' :class='scheme + " loading align-center loader-accent2"'></div>
						<div
							v-show='!waiting && !loading'
							class='refresh align-center cursor-pointer tooltip tooltip-bottom d-inline-flex'
							:data-tooltip='$t("stats.tooltips.refresh")'
							@click='refresh(true)'
						>
							<svg class='icon icon-bold icon-gray icon-hover-accent' viewBox='0 0 24 24'>
								<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
								<path class='icon-part-accent2' d='M9 4.55a8 8 0 0 1 6 14.9m0 -4.45v5h5' />
								<line class='icon-part-accent2-dark' x1='5.63' y1='7.16' x2='5.63' y2='7.17' />
								<line class='icon-part-accent2-dark' x1='4.06' y1='11' x2='4.06' y2='11.01' />
								<line class='icon-part-accent2-dark' x1='4.63' y1='15.1' x2='4.63' y2='15.11' />
								<line class='icon-part-accent2-dark' x1='7.16' y1='18.37' x2='7.16' y2='18.38' />
								<line class='icon-part-accent2-dark' x1='11' y1='19.94' x2='11' y2='19.95' />
							</svg>
						</div>
					</div>
					<!-- folder selection -->
					<div class='filter-folder d-flex ml-2'>
						<label for='folder' class='align-center text-gray p-0-5'>{{ $tc('popup.folder', 1) }}</label>
						<select v-model='active.folder' :disabled='waiting || loading' class='align-stretch shadow w-6' :class='{ disabled: waiting || loading }' id='folder'>
							<option v-for='f in folders' :key='f.path' :value='f'>{{ formatFolder(f) }}</option>
						</select>
						<div class='cursor-pointer tooltip tooltip-bottom d-inline-flex align-center' :data-tooltip='$t("stats.tooltips.clear")' @click='resetFolder'>
							<svg class='icon icon-bold icon-gray icon-hover-accent' viewBox='0 0 24 24'>
								<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
								<line class='icon-part-accent2' x1='18' y1='6' x2='6' y2='18' />
								<line class='icon-part-accent2' x1='6' y1='6' x2='18' y2='18' />
							</svg>
						</div>
					</div>
					<!-- time period selection -->
					<div class='filter-period d-flex ml-2'>
						<label for='start' class='align-center text-gray p-0-5'>Time Period</label>
						<div class="input-group d-flex">
							<input type='text' v-model='active.period.start' @blur='formatPeriod("start")' placeholder='YYYY-MM-DD' id='start' class='align-stretch w-6' :class='{ error: error.period.start }' />
							<input type='text' v-model='active.period.end' @blur='formatPeriod("end")' placeholder='YYYY-MM-DD' id='end' class='align-stretch w-6' :class='{ error: error.period.end }' />
							<button @click='updatePeriod' class='button-secondary align-center p-0-5'>
								<svg class="icon icon-small icon-bold d-block m-0-auto" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M5 12l5 5l10 -10" />
								</svg>
							</button>
						</div>
						<div class='cursor-pointer tooltip tooltip-bottom d-inline-flex align-center' :data-tooltip='$t("stats.tooltips.clear")' @click='resetPeriod'>
							<svg class='icon icon-bold icon-gray icon-hover-accent' viewBox='0 0 24 24'>
								<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
								<line class='icon-part-accent2' x1='18' y1='6' x2='6' y2='18' />
								<line class='icon-part-accent2' x1='6' y1='6' x2='18' y2='18' />
							</svg>
						</div>
					</div>
				</div>
			</header>
			<!-- fetured numbers -->
			<section class='numbers'>
				<!-- total -->
				<div>
					<div class='text-gray'>{{ $t('stats.mailsTotal') }}</div>
					<div class='featured'>{{ display.numbers.total.toLocaleString() }}</div>
					<div class='text-gray'>{{ $t('stats.withinYears', [oneDigit(years)]) }}</div>
				</div>
				<!-- unread -->
				<div>
					<div class='text-gray'>{{ $t('stats.mailsUnread') }}</div>
					<div class='featured'>{{ display.numbers.unread.toLocaleString() }}</div>
					<div class='text-gray' v-if='display.numbers.unread == 0'>{{ $t('stats.niceWork') }}</div>
					<div class='text-gray' v-else>{{ $t('stats.percentOfReceived', [unreadPercentage]) }}</div>
				</div>
				<!-- received -->
				<div>
					<div class='text-accent2'>{{ $t('stats.mailsReceived') }}</div>
					<div class='featured text-accent2'>{{ display.numbers.received.toLocaleString() }}</div>
					<div class='text-gray'>{{ $t('stats.percentOfTotal', [receivedPercentage]) }}</div>
				</div>
				<!-- sent -->
				<div>
					<div class='text-accent1'>{{ $t('stats.mailsSent') }}</div>
					<div class='featured text-accent1'>{{ display.numbers.sent.toLocaleString() }}</div>
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
				<svg class='icon icon-huge icon-gray d-block m-0-auto icon-animated-color-transition' viewBox='0 0 24 24'>
					<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
					<polyline points='4 19 8 13 12 15 16 10 20 14 20 19 4 19' />
					<polyline points='4 12 7 8 11 10 16 4 20 8' />
				</svg>
				<div class='text-center text-gray'>
					{{ $t('stats.loadingInProgress') }}
				</div>
			</section>
			<!-- empty account -->
			<section v-else-if='display.numbers.total == 0' class='mt-5'>
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
				<div
					id='chart-area-top'
					class='chart-area'
					:class='{ "first-column-only": preferences.sections.total.expand }'
				>
					<div class='tab-area'>
						<ul class='tab'>
							<li
								v-for='(active, label) in tabs'
								:key='label'
								class='tab-item cursor-pointer tooltip tooltip-bottom text-hover-accent2'
								:data-tooltip='$t("stats.charts." + label + ".description")'
								:class='{ "active": active }'
								@click='activateTab(label)'
							>
								<span>{{ $t('stats.charts.' + label + '.title') }}</span>
							</li>
							<li
								class='resizer cursor-pointer tooltip tooltip-bottom text-hover-accent2 px-1 ml-auto'
								:data-tooltip='
									!preferences.sections.total.expand
									? $t("stats.tooltips.expand")
									: $t("stats.tooltips.shrink")
								'
								@click='preferences.sections.total.expand=!preferences.sections.total.expand'
							>
								<svg v-show='!preferences.sections.total.expand' class='icon icon-text icon-arrows-maximize' viewBox='0 0 24 24'>
									<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
									<polyline points='16 4 20 4 20 8' /><line x1='14' y1='10' x2='20' y2='4' />
									<polyline points='8 20 4 20 4 16' /><line x1='4' y1='20' x2='10' y2='14' />
									<polyline points='16 20 20 20 20 16' /><line x1='14' y1='14' x2='20' y2='20' />
									<polyline points='8 4 4 4 4 8' /><line x1='4' y1='4' x2='10' y2='10' />
								</svg>
								<svg v-show='preferences.sections.total.expand' class='icon icon-text icon-arrows-minimize' viewBox='0 0 24 24'>
									<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
									<polyline points='5 9 9 9 9 5' /><line x1='3' y1='3' x2='9' y2='9' />
									<polyline points='5 15 9 15 9 19' /><line x1='3' y1='21' x2='9' y2='15' />
									<polyline points='19 9 15 9 15 5' /><line x1='15' y1='9' x2='21' y2='3' />
									<polyline points='19 15 15 15 15 19' /><line x1='15' y1='15' x2='21' y2='21' />
								</svg>
							</li>
						</ul>
						<div class='tab-content mt-1'>
							<!-- emails per year over total time -->
							<LineChart
								v-if='tabs.years'
								:datasets='yearsChartData.datasets'
								:labels='yearsChartData.labels'
							/>
							<!-- emails per quarter over total time -->
							<LineChart
								v-if='tabs.quarters'
								:datasets='quartersChartData.datasets'
								:labels='quartersChartData.labels'
							/>
							<!-- emails per month over total time -->
							<LineChart
								v-if='tabs.months'
								:datasets='monthsChartData.datasets'
								:labels='monthsChartData.labels'
							/>
							<!-- emails per week over total time -->
							<LineChart
								v-if='tabs.weeks'
								:datasets='weeksChartData.datasets'
								:labels='weeksChartData.labels'
							/>
						</div>
					</div>
					<div v-show='!preferences.sections.total.expand' class="chart-group position-relative">
						<select v-model='preferences.sections.days.year' name='year' class="position-absolute top-0-5 right-0-5 shadow">
							<option v-for='y in yearsList' :key='y' :value='y'>{{ y }}</option>
						</select>
						<!-- emails per weekday per hour received -->
						<HeatMap
							:title='$t("stats.charts.days.title", [preferences.sections.days.year])'
							:description='$t("stats.charts.days.description.received")'
							rgb='10, 132, 255'
							spacing='1px'
							rounding='5px'
							:dataset='daysChartData.received'
							:labels='{ y: daysChartData.ylabels, x: daysChartData.xlabels }'
							:tooltips='"{y}, " + $t("stats.abbreviations.calendarWeek") + "{x}\n{label}: {value}"'
							class='mb-0-5 upper-chart'
						/>
						<!-- emails per weekday per hour sent -->
						<HeatMap
							:description='$t("stats.charts.days.description.sent")'
							rgb='230, 77, 185'
							spacing='1px'
							rounding='5px'
							:dataset='daysChartData.sent'
							:labels='{ y: daysChartData.ylabels, x: daysChartData.xlabels }'
							:tooltips='"{y}, " + $t("stats.abbreviations.calendarWeek") + "{x}\n{label}: {value}"'
						/>
					</div>
				</div>
				<div id='chart-area-main' class='chart-area mt-2'>
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
							:tooltips='"{y}, {x}:00\n{label}: {value}"'
							class='mb-0-5'
						/>
						<!-- emails per weekday per hour sent -->
						<HeatMap
							:description='$t("stats.charts.temporalDistribution.description.sent")'
							rgb='230, 77, 185'
							spacing='1px'
							rounding='5px'
							:dataset='weekdayPerHourChartData.sent'
							:labels='{ y: weekdayPerHourChartData.labels, x: Array.from(Array(24).keys())}'
							:tooltips='"{y}, {x}:00\n{label}: {value}"'
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
import { traverseAccount, extractEmailAddress, weekNumber, weeksInYear, quarterNumber } from './utils';
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
	components: { LineChart, BarChart, HeatMap },
	data () {
		return {
			accounts: [],     // list of all existing accounts
			folders: [],      // list of all existing folders for the current account
			active: {
				account: null,  // currently selected account
				folder: null,   // currently selected folder
				period: {
					start: null,  // currently configured start of period of time
					end: null,    // currently configured end of period of time
				}
			},
			error: {
				period: {
					start: false, // indicates if currently configured start of period of time is valid
					end: false,   // indicates if currently configured end of period of time is valid
				}
			},
			waiting: false,   // hides all charts and processes data in foreground
			loading: false,   // keeps showing charts and processes data in background
			display: {},      // processed data to show in foreground
			store: {},        // data store for background processing (same structure as display)
			tabs: {           // tab navigation containing one active tab
				years: true,
				quarters: false,
				months: false,
				weeks: false,
			},
			preferences: {    // preferences set for this page
				sections: {     // preferences that can be set on this page
					total: {
						expand: false
					},
					days: {
						year: (new Date()).getFullYear()
					},
					contacts: {
						leaderCount: 20
					}
				},
				dark: true,     // preferences loaded from stored options
				startOfWeek: 0,
				localIdentities: [],
				accounts: [],
				cache: true
			},
			publicPath: process.env.BASE_URL
		}
	},
	created: async function () {
		// set initial tab title
		document.title = 'ThirdStats'
		// initially reset everything (stored and displayed data)
		this.reset(false)
		// get stored options
		await this.getOptions()
		// get all accounts
		this.getAccounts()
	},
	methods: {
		// get all add-on settings from the options page
		getOptions: async function () {
			let result = await messenger.storage.local.get('options')
			// only load options if they have been set, otherwise default settings will be kept
			if (result && result.options) {
				this.preferences.dark = result.options.dark ? true : false
				this.preferences.startOfWeek = result.options.startOfWeek ? result.options.startOfWeek : 0
				this.preferences.localIdentities = result.options.addresses ? result.options.addresses.split(',').map(x => x.trim()) : []
				this.preferences.accounts = result.options.accounts ? result.options.accounts : []
				this.preferences.cache = result.options.cache ? true : false
			}
		},
		// get all accounts, get active account from URL get parameter
		getAccounts: async function () {
			let accounts = await messenger.accounts.list()
			// filter list of accounts if user configured custom list
			if (this.preferences.accounts.length > 0) {
				accounts = accounts.filter(a => this.preferences.accounts.includes(a.id))
			}
			// check if a specific account was given
			let uri = window.location.search.substring(1)
			let params = new URLSearchParams(uri)
			let accountPosition = Number(params.get('a'))
			// assign accounts
			this.accounts = accounts
			this.active.account = accounts[accountPosition].id
		},
		// iterate through all folders of a given account <a>, do it in background <hidden=true> or in foreground <hidden=false>
		processAccount: async function (a, hidden) {
			// get identities from account, or from preferences if it's a local account
			let identities = a.type != 'none' ? a.identities.map(i => i.email) : this.preferences.localIdentities
			// get all folders and subfolders from given account or selected folder of active account (filter field)
			let folders = this.active.folder ? [JSON.parse(JSON.stringify(this.active.folder))] : traverseAccount(a)
			// build folder list for filter selection, if not already present
			if (!this.folders.length) {
				this.folders = folders
			}
			let self = this
			await Promise.all(folders.map(async f => {
				// analyze all messages in all folders
				await self.processMessages(f, identities, hidden)
			})).then(() => {
				let store = hidden ? self.store : self.display
				// post processing: reduce size of contacts to configured limit
				let r = Object.entries(store.contacts.received).sort(([,a],[,b]) => b-a).reduce((r, [k, v]) => ({ ...r, [k]: v }), {})
				store.contacts.received = Object.keys(r)
					.slice(0, self.preferences.sections.contacts.leaderCount)
					.reduce((result, key) => { result[key] = r[key]; return result; }, {})
				let s = Object.entries(store.contacts.sent).sort(([,a],[,b]) => b-a).reduce((r, [k, v]) => ({ ...r, [k]: v }), {})
				store.contacts.sent = Object.keys(s)
					.slice(0, self.preferences.sections.contacts.leaderCount)
					.reduce((result, key) => { result[key] = s[key]; return result; }, {})
				// post processing: display data now if it was processed in background
				if (hidden) {
					self.display = JSON.parse(JSON.stringify(self.store))
				}
			})
		},
		// process all messages of a given <folder> with its <identities> in background <hidden=true> or in foreground <hidden=false>
		processMessages: async function (folder, identities, hidden) {
			if (folder) {
				let self = this
				let page = null
				if (this.active.period.start && this.active.period.end) {
					let start = new Date(this.active.period.start)
					let end = new Date(this.active.period.end)
					page = await messenger.messages.query({ folder: folder, fromDate: start, toDate: end })
				} else {
					page = await messenger.messages.list(folder)
				}
				if (page) {
					page.messages.map(m => self.analyzeMessage(m, identities, hidden))
					while (page.id) {
						page = await messenger.messages.continueList(page.id)
						page.messages.map(m => self.analyzeMessage(m, identities, hidden))
					}
				}
			}
		},
		// extract information of a single message
		analyzeMessage (m, identities, hidden) {
			let type = ''
			let store = hidden ? this.store : this.display
			// numbers
			store.numbers.total++
			if (m.read === false) store.numbers.unread++
			let author = extractEmailAddress(m.author)
			if (identities.includes(author)) {
				store.numbers.sent++
				type = 'sent'
			} else {
				store.numbers.received++
				type = 'received'
			}
			// calculate starting date (= date of oldest email)
			let start = new Date(store.numbers.start)
			if (m.date && m.date.getTime() > 0 && m.date.getTime() < start.getTime()) {
				store.numbers.start = m.date
			}
			// years
			let y = m.date.getFullYear()
			if (!(y in store.yearsData[type])) {
				store.yearsData[type][y] = 1
			} else {
				store.yearsData[type][y]++
			}
			// quarters
			let qn = quarterNumber(m.date)
			if (!(y in store.quartersData[type])) {
				store.quartersData[type][y] = {}
				store.quartersData[type][y][qn] = 1
			} else {
				if (!(qn in store.quartersData[type][y])) {
					store.quartersData[type][y][qn] = 1
				} else {
					store.quartersData[type][y][qn]++
				}
			}
			// months
			let mo = m.date.getMonth()
			if (!(y in store.monthsData[type])) {
				store.monthsData[type][y] = {}
				store.monthsData[type][y][mo] = 1
			} else {
				if (!(mo in store.monthsData[type][y])) {
					store.monthsData[type][y][mo] = 1
				} else {
					store.monthsData[type][y][mo]++
				}
			}
			// weeks
			let wn = weekNumber(m.date)
			if (!(y in store.weeksData[type])) {
				store.weeksData[type][y] = {}
				store.weeksData[type][y][wn] = 1
			} else {
				if (!(wn in store.weeksData[type][y])) {
					store.weeksData[type][y][wn] = 1
				} else {
					store.weeksData[type][y][wn]++
				}
			}
			// daytime
			let dt = m.date.getHours()
			store.daytimeData[type][dt]++
			// weekday
			let wd = m.date.getDay()
			store.weekdayData[type][wd]++
			// month
			store.monthData[type][mo]++
			// weekday per calendar week
			if (!(y in store.daysData[type])) {
				store.daysData[type][y] = new NumberedObject(7,53)
			}
			store.daysData[type][y][wd][wn-1]++
			// weekday per hour
			store.weekdayPerHourData[type][wd][dt]++
			// contacts (leaderboards)
			switch (type) {
				case 'sent':
					let recipients = m.recipients.map(r => extractEmailAddress(r).toLowerCase())
					recipients.map(r => {
						if (!(r in store.contacts['sent'])) {
							store.contacts['sent'][r] = 1
						} else {
							store.contacts['sent'][r]++
						}
					})
					break;
				case 'received':
					let a = author.toLowerCase()
					if (!(a in store.contacts['received'])) {
						store.contacts['received'][a] = 1
					} else {
						store.contacts['received'][a]++
					}
					break;
				default:
					break;
			}
		},
		// reset processed data to initial state, only reset store if processed in background <hidden=true>
		reset (hidden) {
			let initObject = { 
				numbers: {
					total: 0,
					unread: 0,
					received: 0,
					sent: 0,
					start: this.active.period.start ? new Date(this.active.period.start) : new Date(),
					end: this.active.period.end ? new Date(this.active.period.end) : new Date(),
				},
				yearsData: {
					received: {},
					sent: {},
				},
				quartersData: {
					received: {},
					sent: {},
				},
				monthsData: {
					received: {},
					sent: {},
				},
				weeksData: {
					received: {},
					sent: {},
				},
				daysData: {
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
				monthData: {
					received: new NumberedObject(12),
					sent: new NumberedObject(12),
				},
				weekdayPerHourData: {
					received: new NumberedObject(7,24),
					sent: new NumberedObject(7,24),
				},
				contacts: {
					received: {},
					sent: {},
				}
			}
			if (!hidden) {
				this.display = JSON.parse(JSON.stringify(initObject))
			}
			this.store = JSON.parse(JSON.stringify(initObject))
			this.preferences.sections.total.expand = false
			this.preferences.sections.days.year = initObject.numbers.start.getFullYear()
		},
		// retrieve and process data again in background <hidden=true> or foreground <hidden=false>
		refresh: async function (hidden) {
			// start loading indication
			if (hidden) {
				this.loading = true
			} else {
				this.waiting = true
			}
			// reset already processed data
			this.reset(hidden)
			// get currently selected account
			let account = await messenger.accounts.get(this.active.account)
			// process data of this account again and update this.display
			await this.processAccount(account, hidden)
			// only store reprocessed data if cache is enabled and no filter is set
			if (this.preferences.cache && !this.filtered) {
				let stats = {}
				stats['stats-' + this.active.account] = JSON.parse(JSON.stringify(this.display))
				await messenger.storage.local.set(stats)
			}
			// stop loading indication
			if (hidden) {
				this.loading = false
			} else {
				this.waiting = false
			}
		},
		// load data of given account
		loadAccount: async function (id) {
			let account = await messenger.accounts.get(id)
			// set tab title
			document.title = 'ThirdStats: ' + account.name
			// (re)calculate list of folders
			this.folders = traverseAccount(account)
			// only check storage if cache is enabled
			let result = this.preferences.cache ? await messenger.storage.local.get('stats-' + id) : null
			if (result && result['stats-' + id]) {
				// if cache is enabled and data already exists in storage, display it directly
				this.display = JSON.parse(JSON.stringify(result['stats-' + id]))
			} else {
				// otherwise retrieve it first/again
				await this.refresh(false)
			}
		},
		// reset folder filter
		resetFolder: async function () {
			this.active.folder = null
			if (this.active.period.start || this.active.period.end) {
			// reprocess current data if another filter is set
				await this.refresh(true)
			} else {
				// otherwise just load account data
				await this.loadAccount(this.active.account)
			}
		},
		// process data for current time period filter
		updatePeriod: async function () {
			if (this.validPeriod()) {
				await this.refresh(true)
				this.display.numbers.start = new Date(this.active.period.start)
				this.display.numbers.end = new Date(this.active.period.end)
				this.preferences.sections.days.year = (new Date(this.active.period.start)).getFullYear()
			}
		},
		// reset time period filter
		resetPeriod: async function () {
			this.active.period.start = null
			this.active.period.end = null
			this.error.period.start = false
			this.error.period.end = false
			this.preferences.sections.days.year = (new Date()).getFullYear()
			if (this.active.folder) {
			// reprocess current data if another filter is set
				await this.refresh(true)
			} else {
				// otherwise just load account data
				await this.loadAccount(this.active.account)
			}
		},
		// activate tab of given <key>
		activateTab (key) {
			let self = this
			Object.keys(this.tabs).map(t => self.tabs[t] = false)
			this.tabs[key] = true
		},
		// format folder name to match its hierarchy
		formatFolder (folder) {
			const level = (folder.path.match(/\//g) || []).length
			return level <= 1 ? folder.name : '—'.repeat(level-1) + ' ' + folder.name
		},
		// format period date input to match YYYY-MM-DD
		formatPeriod (key) {
			if (this.active.period[key]) {
				let s = this.active.period[key]
				// complete year
				if (s.length == 6) {
					s = String((new Date()).getFullYear()).slice(0, 2) + s
				}
				// insert dashes
				if (!s.includes('-')) {
					s = s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6)
				}
				// shorten to 10 characters
				s = s.slice(0, 10)
				// set lower limit
				if (!isNaN(Date.parse(s)) && Date.parse(s) < 0) {
					s = '1970-01-01'
				}
				// set upper limit
				if (!isNaN(Date.parse(s)) && Date.parse(s) > Date.now()) {
					s = (new Date()).toISOString().slice(0, 10)
				}
				this.active.period[key] = s
			}
		},
		// returns true if entered time period is valid
		validPeriod () {
			let valid = true
			// check start time
			if (
				// start time is not set
				!this.active.period.start ||
				// start time is no valid date
				isNaN(Date.parse(this.active.period.start))
			) {
				valid = false
				this.error.period.start = true
			}
			// check end time
			if (
				// end time is not set
				!this.active.period.end ||
				// end time is no valid date
				isNaN(Date.parse(this.active.period.end))
			) {
				valid = false
				this.error.period.end = true
			}
			// check both
			if (
				// start date is before end date
				Date.parse(this.active.period.start) > Date.parse(this.active.period.end)
			) {
				valid = false
				this.error.period.start = true
				this.error.period.end = true
			}
			// remove previous errors if valid
			if (valid) {
				this.error.period.start = false
				this.error.period.end = false
			}
			return valid
		}
	},
	computed: {
		// current app version
		appVersion () {
			return process.env.PACKAGE_VERSION;
		},
		// array of localized, short month names
		monthNames () {
			let names = []
			for (let m = 1; m <= 12; m++) {
				let d = new Date(1970, m, 0) // choose a date to retrieve months from, starting in January
				names.push(d.toLocaleDateString(this.$i18n.locale, { month: 'short' }))
			}
			return names
		},
		// array of localized, short day of week names
		weekdayNames () {
			let names = []
			for (let wd = 1; wd <= 7; wd++) {
				let d = new Date(1970, 1, wd) // choose a date to retrieve weekdays from, starting on a Sunday
				names.push(d.toLocaleDateString(this.$i18n.locale, { weekday: 'short' }))
			}
			return names
		},
		// number of days from oldest email till today or depending on period filter
		days () {
			const oneDay = 24 * 60 * 60 * 1000
			let start = new Date(this.display.numbers.start)
			let end = this.display.numbers.end ? new Date(this.display.numbers.end) : new Date()
			return Math.round(Math.abs((start - end) / oneDay))
		},
		// number of weeks from oldest email till today
		weeks () {
			return this.days/7
		},
		// number of months from oldest email till today
		months () {
			return this.days/(365/12)
		},
		// number of years from oldest email till today
		years () {
			return this.days/365
		},
		// percentage of number of received/total emails
		receivedPercentage () {
			if (this.display.numbers.total > 0) {
				return this.twoDigit(this.display.numbers.received*100/this.display.numbers.total)
			} else {
				return 0
			}
		},
		// percentage of number of sent/total emails
		sentPercentage () {
			if (this.display.numbers.total > 0) {
				return this.twoDigit(this.display.numbers.sent*100/this.display.numbers.total)
			} else {
				return 0
			}
		},
		// percentage of number of unread/received emails
		unreadPercentage () {
			if (this.display.numbers.received > 0) {
				return this.twoDigit(this.display.numbers.unread*100/this.display.numbers.received)
			} else {
				return 0
			}
		},
		// average number of emails/day
		perDay () {
			if (this.display.numbers.total > 0 && this.days > 0) {
				return this.oneDigit(this.display.numbers.total/this.days)
			} else {
				return 0
			}
		},
		// average number of emails/week
		perWeek () {
			if (this.display.numbers.total > 0 && this.weeks > 0) {
				return this.oneDigit(this.display.numbers.total/this.weeks)
			} else {
				return 0
			}
		},
		// average number of emails/month
		perMonth () {
			if (this.display.numbers.total > 0 && this.months > 0) {
				return this.oneDigit(this.display.numbers.total/this.months)
			} else {
				return 0
			}
		},
		// average number of emails/year
		perYear () {
			if (this.display.numbers.total > 0 && this.years > 0) {
				return this.oneDigit(this.display.numbers.total/this.years)
			} else {
				return 0
			}
		},
		// prepare data for years line chart
		yearsChartData () {
			if (this.waiting) {
				return {
					datasets: [],
					labels: []
				}
			} else {
				let r = this.display.yearsData.received
				let s = this.display.yearsData.sent
				let labels = [], dr = [], ds = []
				let start = new Date(this.display.numbers.start)
				let end = this.display.numbers.end ? new Date(this.display.numbers.end) : new Date()
				for (let y = start.getFullYear(); y <= end.getFullYear(); ++y) {
					labels.push(y)
					dr.push(y in r ? r[y] : 0)
					ds.push(y in s ? s[y] : 0)
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
		// prepare data for quarters line chart
		quartersChartData () {
			if (this.waiting) {
				return {
					datasets: [],
					labels: []
				}
			} else {
				let r = this.display.quartersData.received
				let s = this.display.quartersData.sent
				let labels = [], dr = [], ds = []
				let start = new Date(this.display.numbers.start)
				let end = this.display.numbers.end ? new Date(this.display.numbers.end) : new Date()
				for (let y = start.getFullYear(); y <= end.getFullYear(); ++y) {
					for (let q = 1; q <= 4; ++q) {
						// trim quarters before start date
						if (y == start.getFullYear() && q < quarterNumber(start)) continue
						// trim quarters after end date
						if (y == end.getFullYear() && q > quarterNumber(end)) break
						// organize labels and data
						labels.push(y + ' ' + this.$t('stats.abbreviations.quarter') + q)
						dr.push(y in r && q in r[y] ? r[y][q] : 0)
						ds.push(y in s && q in s[y] ? s[y][q] : 0)
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
		// prepare data for months line chart
		monthsChartData () {
			if (this.waiting) {
				return {
					datasets: [],
					labels: []
				}
			} else {
				let r = this.display.monthsData.received
				let s = this.display.monthsData.sent
				let labels = [], dr = [], ds = []
				let start = new Date(this.display.numbers.start)
				let end = this.display.numbers.end ? new Date(this.display.numbers.end) : new Date()
				for (let y = start.getFullYear(); y <= end.getFullYear(); ++y) {
					for (let m = 0; m < 12; ++m) {
						// trim months before start date
						if (y == start.getFullYear() && m < start.getMonth()) continue
						// trim months after end date
						if (y == end.getFullYear() && m > end.getMonth()) break
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
		// prepare data for weeks line chart
		weeksChartData () {
			if (this.waiting) {
				return {
					datasets: [],
					labels: []
				}
			} else {
				let r = this.display.weeksData.received
				let s = this.display.weeksData.sent
				let labels = [], dr = [], ds = []
				let start = new Date(this.display.numbers.start)
				let end = this.display.numbers.end ? new Date(this.display.numbers.end) : new Date()
				for (let y = start.getFullYear(); y <= end.getFullYear(); ++y) {
					for (let w = 1; w <= weeksInYear(y); ++w) {
						// trim weeks before start date
						if (y == start.getFullYear() && w < weekNumber(start)) continue
						// trim weeks after end date
						if (y == end.getFullYear() && weekNumber(end) > 1 && w > weekNumber(end)) break
						// organize labels and data
						labels.push(y + ' ' + this.$t('stats.abbreviations.calendarWeek') + w)
						dr.push(y in r && w in r[y] ? r[y][w] : 0)
						ds.push(y in s && w in s[y] ? s[y][w] : 0)
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
		// prepare data for daytime bar chart
		daytimeChartData () {
			if (this.waiting) {
				return {
					datasets: [],
					labels: []
				}
			} else {
				let r = this.display.daytimeData.received, s = this.display.daytimeData.sent
				return {
					datasets: [
						{ label: this.$t('stats.mailsSent'), data: Object.values(s), color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
						{ label: this.$t('stats.mailsReceived'), data: Object.values(r), color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
					],
					labels: Object.keys(r)
				}
			}
		},
		// prepare data for weekday bar chart
		weekdayChartData () {
			if (this.waiting) {
				return {
					datasets: [],
					labels: []
				}
			} else {
				let r = Object.values(this.display.weekdayData.received)
				let s = Object.values(this.display.weekdayData.sent)
				let labels = [...this.weekdayNames]
				// start week with user defined day of week
				for (let d = 0; d < this.preferences.startOfWeek; d++) {
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
		// prepare data for month bar chart
		monthChartData () {
			if (this.waiting) {
				return {
					datasets: [],
					labels: []
				}
			} else {
				let r = this.display.monthData.received, s = this.display.monthData.sent
				return {
					datasets: [
						{ label: this.$t('stats.mailsSent'), data: Object.values(s), color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
						{ label: this.$t('stats.mailsReceived'), data: Object.values(r), color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
					],
					labels: this.monthNames
				}
			}
		},
		// prepare data for activity heatmaps
		daysChartData () {
			if (this.waiting) {
				return {
					received: new NumberedObject(7,53),
					sent: new NumberedObject(7,53),
				}
			} else {
				let r = this.preferences.sections.days.year in this.display.daysData.received
					? Object.values(this.display.daysData.received[this.preferences.sections.days.year])
					: Object.values(new NumberedObject(7,53))
				let s = this.preferences.sections.days.year in this.display.daysData.sent
					? Object.values(this.display.daysData.sent[this.preferences.sections.days.year])
					: Object.values(new NumberedObject(7,53))
				let ylabels = [...this.weekdayNames]
				let xlabels = Array.from(Array(54).keys())
				xlabels.shift()
				// start week with user defined day of week
				for (let d = 0; d < this.preferences.startOfWeek; d++) {
					r.push(r.shift())
					s.push(s.shift())
					ylabels.push(ylabels.shift())
				}
				return {
					received: { label: this.$t('stats.mailsReceived'), data: r },
					sent: { label: this.$t('stats.mailsSent'), data: s },
					ylabels: ylabels,
					xlabels: xlabels,
				}
			}
		},
		// prepare data for weekday/hour heatmaps
		weekdayPerHourChartData () {
			if (this.waiting) {
				return {
					received: new NumberedObject(7,24),
					sent: new NumberedObject(7,24),
				}
			} else {
				let r = Object.values(this.display.weekdayPerHourData.received)
				let s = Object.values(this.display.weekdayPerHourData.sent)
				let labels = [...this.weekdayNames]
				// start week with user defined day of week
				for (let d = 0; d < this.preferences.startOfWeek; d++) {
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
		// prepare data for received emails leaderboard horizontal bar chart
		receivedContactLeadersChartData () {
			if (this.waiting) {
				return {
					datasets: [],
					labels: []
				}
			} else {
				let r = this.display.contacts.received
				return {
					datasets: [
						{ label: this.$t('stats.mailsReceived'), data: Object.values(r), color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
					],
					labels: Object.keys(r)
				}
			}
		},
		// prepare data for sent emails leaderboard horizontal bar chart
		sentContactLeadersChartData () {
			if (this.waiting) {
				return {
					datasets: [],
					labels: []
				}
			} else {
				let s = this.display.contacts.sent
				return {
					datasets: [
						{ label: this.$t('stats.mailsSent'), data: Object.values(s), color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
					],
					labels: Object.keys(s)
				}
			}
		},
		// returns true, if at least one filter isn't empty
		filtered () {
			return this.active.folder || this.active.period.start || this.active.period.end
		},
		// convert theme preference into scheme name
		scheme () {
			return this.preferences.dark ? 'dark' : 'light'
		},
		// array of years descending from oldest till newest emails year
		yearsList () {
			let years = []
			let start = (new Date(this.display.numbers.start)).getFullYear()
			let end = this.display.numbers.end ? (new Date(this.display.numbers.end)).getFullYear() : (new Date()).getFullYear()
			for (let i = end; i >= start; i--) {
				years.push(i)
			}
			return years
		}
	},
	watch: {
		// on change of active account switch displayed data accordingly and reset filter
		'active.account': async function (id) {
			if (id) {
				// process data for given account
				await this.loadAccount(id)
			}
		},
		// on change of active folder, retrieve data again
		'active.folder': async function (folder) {
			if (folder) {
				// refresh function handles processing for active folder only
				await this.refresh(true)
			}
		}
	}
}
</script>

<style lang='stylus'>
@require "assets/global"

// general
body
	overflow-x: hidden

// layout and content
#stats
	min-height: 100vh

	.container
		width: 100%
		height: 100%
		margin: 0 auto
		padding-left: 1rem
		padding-right: 1rem
		box-sizing: border-box

		@media (min-width: 2501px)
			max-width: 2500px
			#chart-area-main
				grid-template-columns: repeat(6, 1fr)
		@media (max-width: 2500px)
			max-width: 2200px
			#chart-area-main
				grid-template-columns: repeat(3, 1fr)
		@media (max-width: 2000px)
			max-width: 1750px
			#chart-area-main
				grid-template-columns: repeat(3, 1fr)
		@media (min-width: 1501px)
			header
				grid-template-columns: 1fr 2fr
				.filter
					justify-content: flex-end
		@media (max-width: 1500px)
			max-width: 1200px
			header
				grid-template-columns: 1fr
				h1
					justify-content: center
				.filter
					justify-content: space-around
					&>*
						margin: 0 0 1rem 0
			#chart-area-main
				grid-template-columns: repeat(2, 1fr)
		@media (min-width: 961px)
			.numbers
				max-width: 1500px
				grid-template-columns: repeat(6, 1fr)
			#chart-area-top
				grid-template-columns: calc(33.33% - 1rem) calc(66.66% - 1rem)
				&.first-column-only
					grid-template-columns: calc(100%-1rem) 0%
				.resizer
					display: list-item
		@media (max-width: 960px)
			.numbers
				grid-template-columns: repeat(3, 1fr)
			#chart-area-top
				grid-template-columns: calc(100%-1rem)
				.resizer
					display: none
		@media (max-width: 720px)
			#chart-area-main
				grid-template-columns: 1fr

		header
			margin-top: 0
			display: grid
			align-items: center
			h1
				display: flex
				align-items: center
				.logo
					height: 48px
			.filter
				.loading
					loader 18px 3px
					margin: 4px 4px 4px 7px
				.refresh
					margin-left: 3px

		.numbers
			display: grid
			column-gap: 1rem
			row-gap: 2rem
			margin: 0 auto
			&>div
				text-align: center
				.featured
					font-size: 3.25em
					line-height: 1em
					font-weight: 500

		.charts
			.chart-area
				display: grid
				column-gap: 2rem
				row-gap: 1rem
				transition: grid-template-columns .2s
				& > *, .tab-content > *
					min-height: 380px
				.chart
					min-width: 0
					h2
						margin-bottom: 0
					p
						margin-top: 0
				.chart-group .upper-chart h2
					margin-top: .5rem

</style>
