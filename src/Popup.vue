<template>
	<div id='popup'>
		<div class='container pt-1'>
			<h3
				@click.prevent="openTab(0)"
				class="text-hover-accent2 cursor-pointer tooltip tooltip-bottom"
				:data-tooltip='$t("popup.linkDescription")'
			>
				<span class='mr-1'>{{ accounts.length }} {{ $tc('popup.account', accounts.length) }}</span>
				<span v-if='waiting' class='dark loading'></span>
				<svg class='icon icon-thin icon-small ml-auto' viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<line x1="4" y1="19" x2="20" y2="19" />
					<polyline points="4 15 8 9 12 11 16 6 20 10 20 15 4 15" />
				</svg>
			</h3>
			<div class='accounts'>
				<div
					class="background-gray background-hover-accent2 text-hover-highlight cursor-pointer shadow"
					v-for='(a, i) in accounts'
					:key='a.id'
					@click.prevent="openTab(i)"
				>
					<div>{{ a.name }}</div>
					<div class='text-small text-secondary'>
						{{ $t('popup.messagesInFolder', [a.messageCount, a.folderCount] ) }}
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
			accounts: [],
			waiting: true,
			dark: true
		}
	},
	created () {
		this.getAccounts()
	},
	methods: {
		// function to get all thunderbird accounts
		getAccounts: async function () {
			let accounts = await messenger.accounts.list()
			// calculate folder and message count and append to account object
			let self = this
			Promise.all(accounts.map(async a => {
				let folders = traverseAccount(a)
				a.folderCount = folders.length
				a.messageCount = 0
				await Promise.all(folders.map(async f => {
					let c = await self.countMessages(f)
					a.messageCount += c
				}))
			})).then(() => {
				this.waiting = false
			})
			this.accounts = accounts
		},
		// count all messages of a folder
		countMessages: async function (folder) {
			if (!folder) return 0
			let page = await messenger.messages.list(folder)
			let count = page.messages.length
			while (page.id) {
				page = await messenger.messages.continueList(page.id)
				count += page.messages.length
			}
			return count
		},
		openTab (accountPosition) {
			let url = 'stats.html'
			if (accountPosition) url += '?a=' + accountPosition
			messenger.tabs.create({
				active: true,
				url: url
			})
		}
	},
	computed: {
		scheme () {
			return this.dark ? 'dark' : 'light'
		}
	}
}
</script>

<style lang='stylus'>
@require "assets/global"

// general
html, body
	min-width: 300px
	overflow: hidden

// layout
#popup
	width: 100%
	height: 100%

	.container
		padding-left: 20px
		padding-right: 20px
		h3
			margin-top: 0
			font-weight: 300
			font-size: 20px
			transition: color .2s
			display: flex
			flex-wrap: nowrap
		.loading
			loader 16px
		.accounts
			display: flex
			flex-direction: column
			& > div
				padding: 8px 10px
				margin-bottom: 20px
				border-radius: 4px
				transition: all .2s

</style>
