
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
				h('ul', this.accounts.map(a => {
					return h('li', a.name + ' (' + a.folderCount + ')')
				})),
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
			accounts.map(a => {
				a.folderCount = a.folders.length
				if (a.folders.length > 0) {
					a.folders.map(f => {
						a.folderCount += this.subfolderCount(f)
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
