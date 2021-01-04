<template>
	<div id='popup'>
		<div class='container pt-1'>
			<!-- header containing number of accounts and linking to stats page -->
			<h3
				class="text-hover-accent2 cursor-pointer tooltip tooltip-bottom"
				:data-tooltip='$t("popup.linkDescription")'
				@click.prevent="openTab('sum')"
			>
				<span class='mr-1'>{{ accounts.length }} {{ $tc('popup.account', accounts.length) }}</span>
				<span v-if='loading' class='dark loading'></span>
				<svg class='icon icon-thin icon-small ml-auto' viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<line x1="4" y1="19" x2="20" y2="19" />
					<polyline points="4 15 8 9 12 11 16 6 20 10 20 15 4 15" />
				</svg>
			</h3>
			<!-- list of all accounts -->
			<div class='accounts'>
				<div
					class="background-gray background-hover-accent2 text-hover-highlight cursor-pointer shadow"
					v-for='a in accounts'
					:key='a.id'
					@click.prevent="openTab(a.id)"
				>
					<h4>{{ a.name }}</h4>
					<div class='text-small text-secondary'>
						{{ a.folderCount }} {{ $tc('popup.folder', a.folderCount) }}
					</div>
				</div>
			</div>
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
			// filter list of accounts if user configured custom list
			if (this.options.accounts.length > 0) {
				accounts = accounts.filter(a => this.options.accounts.includes(a.id))
			}
			// calculate folder and message count and append to account object
			let self = this
			accounts.map(async a => {
				let folders = traverseAccount(a)
				a.folderCount = folders.length
			})
			this.accounts = accounts
		},
		// open the stats page as new tab
		// appends account <id> as GET parameter
		openTab (id) {
			let url = 'stats.html'
			if (id) url += '?s=' + id
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
		h3
			margin-top: 0
			font-weight: 300
			font-size: 20px
			transition: color .2s
			display: flex
			flex-wrap: nowrap
		.loading
			loader 16px 3px
		.accounts
			display: flex
			flex-wrap: wrap
			justify-content: space-between
			row-gap: 20px
			& > div
				width: 8rem
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
