<template>
	<div id='popup'>
		<div class='container pt-1'>
			<!-- header containing number of accounts and linking to stats page -->
			<header class='d-flex gap-0-5 mb-1-5'>
				<h3 class='flex-grow'>
					<span class='mr-1'>{{ accounts.length }} {{ $tc('popup.account', accounts.length) }}</span>
					<span v-if='loading' class='dark loading'></span>
				</h3>
				<div
					class='text-hover-accent2 cursor-pointer tooltip tooltip-left transition-color'
					:data-tooltip='$t("popup.openAllStats")'
					@click.prevent="openTab('stats.html', accounts.length > 1 ? 'sum' : accounts[0].id)"
				>
					<svg class='icon icon-thin icon-small ml-auto' viewBox="0 0 24 24">
						<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
						<line x1='4' y1='19' x2='20' y2='19' />
						<polyline points='4 15 8 9 12 11 16 6 20 10 20 15 4 15' />
					</svg>
				</div>
				<div
					class='text-hover-accent2 cursor-pointer tooltip tooltip-left transition-color'
					:data-tooltip='$t("popup.openOptions")'
					@click.prevent="openTab('options.html', '1')"
				>
					<svg class='icon icon-thin icon-small ml-auto' viewBox="0 0 24 24">
						<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
						<path d='M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z' />
						<circle cx='12' cy='12' r='3' />
					</svg>
				</div>
			</header>
			<!-- list of all accounts -->
			<section class='accounts'>
				<div
					class="background-gray background-hover-accent2 text-hover-highlight cursor-pointer shadow"
					v-for='a in accounts'
					:key='a.id'
					@click.prevent="openTab('stats.html', a.id)"
				>
					<h4>{{ a.name }}</h4>
					<div class='text-small text-secondary'>
						{{ a.folderCount }} {{ $tc('popup.folder', a.folderCount) }}
					</div>
				</div>
			</section>
		</div>
	</div>
</template>

<script>
import { traverseAccount } from './utils';

export default {
	name: 'Popup',
	data () {
		return {
			accounts: [],   // list of all existing accounts
			loading: false, // processessing folder and message counts indication
			options: {      // add-on options
				accounts: [], // accounts to process
				dark: true    // theme, always dark due to non colorable popup caret
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
			let result = await messenger.storage.local.get('options')
			// only load needed options if they have been set, otherwise default settings will be kept
			if (result && result.options) {
				this.options.accounts = result.options.accounts ? result.options.accounts : []
			}
		},
		// retrieve all thunderbird accounts
		// add folder count to account object
		async getAccounts () {
			let accounts = await messenger.accounts.list()
			if (this.options.accounts.length > 0) {
				// filter list of accounts if user configured custom list
				accounts = accounts.filter(a => this.options.accounts.includes(a.id))
			} else {
				// default accounts activated are all non local accounts ...
				accounts = accounts.filter(a => a.type != 'none')
			}
			// calculate folder and message count and append to account object
			let self = this
			accounts.map(async a => {
				let folders = traverseAccount(a)
				a.folderCount = folders.length
			})
			this.accounts = accounts
		},
		// open given url in new tab
		// appends GET parameter
		openTab (url, get='') {
			if (get) url += '?s=' + get
			messenger.tabs.create({
				active: true,
				url: url
			})
		}
	}
}
</script>

<style lang='stylus'>
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
				h4
					margin: 0
					font-weight: normal
					white-space: nowrap
					overflow: hidden
					text-overflow: ellipsis

</style>
