
// vue global configuration
Vue.config.productionTip = false
Vue.config.devtools = false

// app logic
var app = new Vue({
	el: '#app',
	render (h) {
		return h(
			'div',
			{ attrs: { class: 'container' } },
			[
				h('div', { attrs: { class: this.waiting ? 'loading' : 'completed' } }),
				h('h3', 'Accounts'),
				h(
					'div',
					{ attrs: { class: 'accounts' } },
					this.accounts.map(a => {
						return h(
							'div',
							[
								h('div', a.name),
								h('div', { attrs: { class: 'text-small text-secondary' } }, a.messageCount + ' messages in ' + a.folderCount + ' folders'),
							]
						)
					})
				),
			]
		)
	},
	data: {
		accounts: [],
		waiting: true,
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
				let folders = self.traverseAccount(a)
				a.folderCount = folders.length
				a.messageCount = 0
				await Promise.all(folders.map(async f => {
					a.messageCount = await self.countMessages(f)
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
		// function to flatten folder hierarchie
		traverseAccount (account) {
			let arrayOfFolders = []
			// recursive function to traverse all subfolders
			function traverse(folders) {
				if (!folders) return
				for (let f of folders) {
					arrayOfFolders.push(f)
					traverse(f.subFolders)
				}
			}
			traverse(account.folders)
			return arrayOfFolders
		}
	}
})
