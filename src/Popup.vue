<template>
	<div id="popup">
		<div class="container pt-1">
			<!-- header containing number of accounts and linking to stats page -->
			<header class="d-flex gap-0-5 mb-1-5">
				<h3 class="flex-grow">
					<span class="mr-1">{{ accounts.length }} {{ $tc("popup.account", accounts.length) }}</span>
					<span v-if="loading" class="dark loading"></span>
				</h3>
				<div
					class="cursor-pointer tooltip tooltip-left transition-color"
					:data-tooltip="$t('popup.openAllStats')"
					@click.prevent="openTab('stats.html', accounts.length > 1 ? 'sum' : accounts[0].id)"
				>
					<svg class="icon icon-thin icon-small icon-hover-accent ml-auto" viewBox="0 0 24 24">
						<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
						<polyline class="icon-part-accent2" points="4 19 8 13 12 15 16 10 20 14 20 19 4 19" />
						<polyline class="icon-part-accent1" points="4 12 7 8 11 10 16 4 20 8" />
					</svg>
				</div>
				<div
					class="cursor-pointer tooltip tooltip-left transition-color"
					:data-tooltip="$t('popup.openOptions')"
					@click.prevent="openTab('options.html', '1')"
				>
					<svg class="icon icon-thin icon-small icon-hover-accent ml-auto" viewBox="0 0 24 24">
						<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
						<path class="icon-part-accent2" d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
						<circle class="icon-part-accent2-faded" cx="12" cy="12" r="3" />
					</svg>
				</div>
			</header>
			<!-- list of all accounts -->
			<section class="accounts">
				<div
					class="background-gray background-hover-accent2 text-hover-highlight cursor-pointer shadow position-relative"
					v-for="a in accounts"
					:key="a.id"
					@click.prevent="openTab('stats.html', a.id)"
				>
					<div class="position-relative z-5">
						<h4>{{ a.name }}</h4>
						<div class="text-small text-secondary">
							{{ a.folderCount }} {{ $tc("popup.folder", a.folderCount) }}
							<div v-if="a.hasOwnProperty('messageCount')">{{ a.messageCount }} {{ $tc("popup.messages", a.messageCount) }}</div>
						</div>
					</div>
					<LineChart
						v-if="a.hasOwnProperty('messageCount') && a.messageCount > 0"
						class="background-chart z-0"
						:datasets="a.yearsData.datasets"
						:labels="a.yearsData.labels"
						:ordinate="false"
						:abscissa="false"
						width="160px"
						height="70px"
					/>
				</div>
			</section>
		</div>
	</div>
</template>

<script>
// internal components
import { traverseAccount } from "./utils";
import LineChart from "./charts/LineChart"
// initialize Chart.js with global configuration

import Chart from "chart.js"
Chart.defaults.global.elements.arc.borderWidth = 0
Chart.defaults.global.legend.display = false
Chart.defaults.global.tooltips.enabled = false
Chart.defaults.global.hover.mode = "index"

export default {
	name: "Popup",
	components: { LineChart },
	data () {
		return {
			accounts: [],   // list of all existing accounts
			loading: false, // processessing folder and message counts indication
			options: {      // add-on options
				accounts: [], // accounts to process
				dark: true,   // theme, always dark due to non colorable popup caret
				cache: true,  // wether caching system is enabled or not
			}
		}
	},
	async created () {
		// start loading indication
		this.loading = true
		// get stored options
		await this.getOptions()
		// start account processing
		await this.getAccounts()
		// stop loading indication
		this.loading = false
	},
	methods: {
		// get all stored add-on options that are needed
		// provides default value if option is not set
		async getOptions () {
			const result = await messenger.storage.local.get("options")
			// only load needed options if they have been set, otherwise default settings will be kept
			if (result && result.options) {
				this.options.accounts = result.options.accounts ? result.options.accounts : []
				this.options.cache = result.options.cache ? true : false
			}
		},
		// retrieve all thunderbird accounts
		// add folder count to account object
		async getAccounts () {
			let accounts = await messenger.accounts.list()
			// filter list of accounts if user configured custom list
			if (this.options.accounts.length > 0 && this.options.accounts.length < accounts.length) {
				accounts = accounts.filter(a => this.options.accounts.includes(a.id))
			}
			// expand account object with additional data
			await Promise.all(accounts.map(async a => {
				// calculate folder count and append to account object
				const folders = traverseAccount(a)
				a.folderCount = folders.length
				// get overall message count when cache is enabled
				if (this.options.cache) {
					const stored = await messenger.storage.local.get("stats-" + a.id)
					if (stored && stored["stats-" + a.id]) {
						// add message count
						a.messageCount = stored["stats-" + a.id].numbers.total
						// add years data
						if (a.messageCount > 0) {
							const r = stored["stats-" + a.id].yearsData.received
							const s = stored["stats-" + a.id].yearsData.sent
							let labels = [], d = []
							const start = new Date(stored["stats-" + a.id].numbers.start)
							const end = stored["stats-" + a.id].numbers.end ? new Date(stored["stats-" + a.id].numbers.end) : new Date()
							for (let y = start.getFullYear(); y <= end.getFullYear(); ++y) {
								labels.push(y)
								d.push((y in r ? r[y] : 0) + (y in s ? s[y] : 0))
							}
							a.yearsData = {
								datasets: [
									{ label: "placeholder", data: d, color: "rgb(88, 88, 93, .2)", bcolor: "rgb(88, 88, 93, .2)" },
								],
								labels: labels
							}
						}
					}
				}
			}))
			this.accounts = accounts
		},
		// open given url in new tab
		// appends GET parameter
		openTab (url, get="") {
			if (get) url += "?s=" + get
			messenger.tabs.create({
				active: true,
				url: url
			})
		}
	}
}
</script>

<style lang="stylus">
@require "assets/global"

// general
html, body
	width: 380px
	overflow-y: auto
	overflow-x: hidden

// layout
#popup
	width: 100%
	height: 100%

	.container
		padding-left: 20px
		padding-right: 20px
		padding-bottom: 20px
		header
			h3
				margin: 0
				font-weight: 300
				font-size: 20px
		.loading
			loader 16px 3px
		.accounts
			display: grid
			grid-template-columns: 1fr 1fr
			gap: 20px
			& > div
				padding: .75rem 1rem
				border-radius: 4px
				transition: all .2s
				overflow: hidden
				h4
					margin: 0
					font-weight: normal
					white-space: nowrap
					overflow: hidden
					text-overflow: ellipsis
				.background-chart
					position: absolute
					bottom: 0
					left: 0

</style>
