
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
			accounts.map(a => {
				a.folderCount = a.folders.length
				a.messageCount = 999 // TODO
				if (a.folders.length > 0) {
					a.folders.map(f => {
						a.folderCount += this.subfolderCount(f)
						a.messageCount += 0 //TODO
					})
				}
			})
			this.accounts = accounts
		},
		// recursive function to count subfolders of given folder
		subfolderCount (folder) {
			let count = folder.subFolders.length
			if (count == 0) return 0
			else {
				folder.subFolders.map(s => {
					count += this.subfolderCount(s)
				})
			}
			return count
		},
		// iterable to get all messages of a folder
		listMessages: async function* (folder) {
			let page = await browser.messages.list(folder);
			for (let message of page.messages) {
				yield message;
			}
			while (page.id) {
				page = await browser.messages.continueList(page.id);
				for (let message of page.messages) {
					yield message;
				}
			}
		}
	}
})
