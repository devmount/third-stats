<template>
	<div id='popup'>
		<div class='container'>
			<div v-if='waiting' class='loading'></div>
			<h3 @click.prevent="openTab(0)">
				<span class='mr-1'>{{ accounts.length }} {{ $tc('popup.account', accounts.length) }}</span>
				<svg width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M11 7h-5a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-5" />
					<line x1="10" y1="14" x2="20" y2="4" />
					<polyline points="15 4 20 4 20 9" />
				</svg>
			</h3>
			<div class='accounts'>
				<div v-for='(a, i) in accounts' :key='a.id' @click.prevent="openTab(i)">
					<div>{{ a.name }}</div>
					<div class='text-small text-secondary'>{{ $t('popup.messagesInFolder', [a.messageCount, a.folderCount] ) }}</div>
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
		}
	},
	created () {
		this.getAccounts()
	},
	methods: {
		// function to get all thunderbird accounts
		getAccounts: async function () {
			let accounts = await browser.accounts.list()
			// only consider non local accounts
			accounts = accounts.filter(a => a.type != 'none')
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
			let page = await browser.messages.list(folder)
			let count = page.messages.length
			while (page.id) {
				page = await browser.messages.continueList(page.id)
				count += page.messages.length
			}
			return count
		},
		openTab (accountPosition) {
			let url = 'stats.html'
			if (accountPosition) url += '?a=' + accountPosition
			browser.tabs.create({
				active: true,
				url: url
			})
		}
	}
}
</script>

<style lang='stylus'>
// general
html, body
	margin 0
	padding 0
	font-family 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
	background #2f2f33
	color #f9f9fa
	font-weight 300
	font-size 16px
	min-width 300px
	overflow hidden

// layout
#popup
	width 100%
	height 100%

	.container
		padding 0 20px
		h3
			font-weight 300
			font-size 20px
			transition color .2s
			cursor pointer
			&:hover
				color #0865e0
			&>*
				vertical-align middle
		.loading
			float right
			height 16px
			width 16px
			border 4px solid rgba(150, 150, 150, 0.2)
			border-radius 50%
			border-top-color rgb(150, 150, 150)
			animation rotate 1s 0s infinite linear
		.accounts
			display flex
			flex-direction column
			& > div
				padding 8px 10px
				margin-bottom 20px
				background #38383d
				border-radius 4px
				box-shadow 0 8px 15px -8px #1d1d1f
				transition all .2s
				&:hover
					background #0865e0
					cursor pointer
					color white
					.text-secondary
						color white

// utilities
.text-small
	font-size .8em
.text-secondary
	color #cdcdd3
.mr-1
	margin-right 1rem

@keyframes rotate
	0%
		transform rotate(0)
	100%
		transform rotate(360deg)
</style>
