<template>
	<div
		id="options"
		:class="{
			'dark': options.dark,
			'light': !options.dark,
			'text-normal': true,
			'background-alt': options.dark,
			'background-highlight-contrast': !options.dark,
			'embedded': !ownOptionsPage
		}"
	>
		<header v-if="ownOptionsPage" class="pt-2 mx-auto">
			<h1 class="d-flex align-items-center">
				<img class="logo mr-1" :src="`${publicPath}icon.svg`" alt="ThirdStats Logo">
				{{ $t("options.title") }}
			</h1>
		</header>
		<div class="container mx-auto">
			<!-- section related to ThirdStats appearance and UI -->
			<section class="mb-3">
				<h2>{{ $t("options.headings.appearance") }}</h2>
				<!-- option: dark -->
				<div class="entry">
					<label for="dark">
						{{ $t("options.darkMode.label") }}
						<span class="d-block text-gray text-small">{{ $t("options.darkMode.description") }}</span>
					</label>
					<div class="action">
						<label class="switch">
							<input type="checkbox" id="dark" v-model="options.dark" />
							<span class="switch-label" :data-on="$t('options.switch.on')" :data-off="$t('options.switch.off')"></span> 
							<span class="switch-handle"></span> 
						</label>
					</div>
				</div>
				<!-- option: ordinate -->
				<div class="entry">
					<label for="ordinate">
						{{ $t("options.ordinate.label") }}
						<span class="d-block text-gray text-small">{{ $t("options.ordinate.description") }}</span>
					</label>
					<div class="action d-flex">
						<label class="switch">
							<input type="checkbox" id="ordinate" v-model="options.ordinate" />
							<span class="switch-label" :data-on="$t('options.switch.on')" :data-off="$t('options.switch.off')"></span> 
							<span class="switch-handle"></span> 
						</label>
					</div>
				</div>
				<!-- option: tag colors -->
				<div class="entry">
					<label for="tagColors">
						{{ $t("options.tagColors.label") }}
						<span class="d-block text-gray text-small">{{ $t("options.tagColors.description") }}</span>
					</label>
					<div class="action d-flex">
						<label class="switch">
							<input type="checkbox" id="tagColors" v-model="options.tagColors" />
							<span class="switch-label" :data-on="$t('options.switch.on')" :data-off="$t('options.switch.off')"></span> 
							<span class="switch-handle"></span> 
						</label>
					</div>
				</div>
			</section>
			<!-- section related to charts and data retrieval -->
			<section class="mb-3">
				<h2>{{ $t("options.headings.stats") }}</h2>
				<!-- option: startOfWeek -->
				<div class="entry">
					<label for="start">
						{{ $t("options.startOfWeek.label") }}
						<span class="d-block text-gray text-small">{{ $t("options.startOfWeek.description") }}</span>
					</label>
					<div class="action d-flex">
						<select class="flex-grow" v-model="options.startOfWeek" id="start">
							<option v-for="(name, pos) in weekdayNames" :key="pos" :value="pos">{{ name }}</option>
						</select>
					</div>
				</div>
				<!-- option: addresses -->
				<div class="entry">
					<label for="local">
						<div class="d-flex align-items-end gap-0-5">
							{{ $t("options.localIdentities.label") }}
							<span class="tooltip text-gray mb--0-25" :data-tooltip="$t('options.note.refreshCacheRequired')">
								<svg class="icon icon-tiny" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
									<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
									<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
									<line x1="3" y1="3" x2="21" y2="21" />
								</svg>
							</span>
						</div>
						<div class="text-gray text-small">{{ $t("options.localIdentities.description") }}</div>
					</label>
					<div class="action">
						<div class="d-flex input-group">
							<input class="flex-grow" type="email" v-model="input.address" placeholder="hello@devmount.de" id="local" />
							<button @click="addAddress" class="p-0-5">
								<svg class="icon icon-small icon-bold d-block m-0-auto" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<line x1="12" y1="5" x2="12" y2="19" />
									<line x1="5" y1="12" x2="19" y2="12" />
								</svg>
							</button>
						</div>
						<div>
							<span class="tag text-small" v-for="a in addressList">
								{{ a }}
								<svg @click="removeAddress(a)" class="icon icon-bold icon-text cursor-pointer" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</span>
						</div>
					</div>
				</div>
				<!-- option: account selection -->
				<div class="entry" v-if="options.accounts">
					<label>
						<div class="d-flex align-items-end gap-0-5">
							{{ $t("options.activeAccounts.label") }}
							<span class="tooltip text-gray mb--0-25" :data-tooltip="$t('options.note.reloadWindowRequired')">
								<svg class="icon icon-tiny" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
									<path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
									<line x1="12" y1="9" x2="12" y2="12" />
									<line x1="12" y1="15" x2="12.01" y2="15" />
								</svg>
							</span>
						</div>
						<div class="text-gray text-small">
							{{ $t("options.activeAccounts.description") }}
							{{ $t("options.activeAccounts.color") }}<br />
							{{ $t("options.activeAccounts.sumAndCompare") }}
						</div>
					</label>
					<div class="action">
						<div v-for="(a, i) in allAccounts" :key="i" class="d-flex justify-space-between">
							<label class="checkbox cursor-pointer text-overflow-ellipsis flex-dont-grow">
								<input type="checkbox" :value="a.id" v-model="options.accounts" />
								<i class="checkbox-icon"></i> {{ a.name }}
							</label>
							<label :for="'color-' + a.name" class="cursor-pointer d-flex align-items-center gap-0-5">
								<input type="color" :id="'color-' + a.name" v-model="options.accountColors[a.id]" />
								<span class="text-mono text-tiny">{{ options.accountColors[a.id] }}</span>
							</label>
						</div>
					</div>
				</div>
				<!-- option: selfMessages -->
				<div class="entry">
					<label for="selfMessages">
						<div class="d-flex align-items-end gap-0-5">
							{{ $t("options.selfMessages.label") }}
							<span class="tooltip text-gray mb--0-25" :data-tooltip="$t('options.note.refreshCacheRequired')">
								<svg class="icon icon-tiny" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
									<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
									<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
									<line x1="3" y1="3" x2="21" y2="21" />
								</svg>
							</span>
						</div>
						<div class="text-gray text-small">{{ $t("options.selfMessages.description") }}</div>
					</label>
					<div class="action d-flex flex-wrap">
						<select class="flex-grow mb-1" v-model="options.selfMessages" id="selfMessages">
							<option v-for="val in selfMessagesOptions" :key="val" :value="val">{{ $t("options.selfMessages.values." + val) }}</option>
						</select>
						<div class="d-flex gap-0-5 align-items-center text-gray">
							<div>
								<svg class="icon icon-small text-middle" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<line x1="12" y1="8" x2="12.01" y2="8" />
									<rect x="4" y="4" width="16" height="16" rx="2" />
									<polyline points="11 12 12 12 12 16 13 16" />
								</svg>
							</div>
							<span class="text-small">{{ $t("options.selfMessages.info." + options.selfMessages) }}</span>
						</div>
					</div>
				</div>
				<!-- option: leaderCount -->
				<div class="entry">
					<label for="leaderCount">
						<div class="d-flex align-items-end gap-0-5">
							{{ $t("options.leaderCount.label") }}
							<span class="tooltip text-gray mb--0-25" :data-tooltip="$t('options.note.refreshCacheRequired')">
								<svg class="icon icon-tiny" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
									<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
									<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
									<line x1="3" y1="3" x2="21" y2="21" />
								</svg>
							</span>
						</div>
						<div class="text-gray text-small">{{ $t("options.leaderCount.description") }}</div>
					</label>
					<div class="action d-flex input-group">
						<input class="flex-grow" type="number" v-model="options.leaderCount" placeholder="20" min="1" max="999" id="leaderCount" />
						<div class="d-flex flex-direction-column button-group-vertical">
							<button @click="incrementLeaderCount()" class="h-1-25 py-0 px-0-5">
								<svg class="icon icon-small icon-bold d-block m-0-auto" viewBox="0 0 24 20">
									<polyline points="6,12 12,6 18,12" />
								</svg>
							</button>
							<button @click="decrementLeaderCount()" class="h-1-25 py-0 px-0-5">
								<svg class="icon icon-small icon-bold d-block m-0-auto" viewBox="0 0 24 20">
									<polyline points="6,5 12,11 18,5" />
								</svg>
							</button>
						</div>
					</div>
				</div>
			</section>
			<!-- section related to store processed data -->
			<section class="mb-3">
				<h2>{{ $t("options.headings.storage") }}</h2>
				<!-- option: cache -->
				<div class="entry">
					<label for="cache">
						{{ $t("options.cache.label") }}
						<span class="d-block text-gray text-small">{{ $t("options.cache.description") }}</span>
					</label>
					<div class="action">
						<label class="switch">
							<input type="checkbox" id="cache" v-model="options.cache" />
							<span class="switch-label" :data-on="$t('options.switch.on')" :data-off="$t('options.switch.off')"></span> 
							<span class="switch-handle"></span> 
						</label>
					</div>
				</div>
				<!-- action: clear cache -->
				<div class="entry">
					<label>
						{{ $t("options.clearCache.label") }}
						<span class="d-block text-gray text-small">{{ $t("options.clearCache.description") }}</span>
					</label>
					<div class="action">
						<button @click="clearCache" class="mb-1">{{ $t("options.clearCache.label") }}</button>
						<div class="d-flex gap-0-5 align-items-center text-gray">
							<div>
								<svg class="icon icon-small text-middle" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<line x1="12" y1="8" x2="12.01" y2="8" />
									<rect x="4" y="4" width="16" height="16" rx="2" />
									<polyline points="11 12 12 12 12 16 13 16" />
								</svg>
							</div>
							<span class="text-small" v-if="cacheSize > 0">{{ $t("options.clearCache.size", [formattedCacheSize]) }}</span>
							<span class="text-small" v-else>{{ $t("options.clearCache.empty") }}</span>
						</div>
					</div>
				</div>
				<!-- action: reset options -->
				<div class="entry">
					<label>
						<div class="d-flex align-items-end gap-0-5">
							{{ $t("options.resetOptions.label") }}
							<span class="tooltip text-gray mb--0-25" :data-tooltip="$t('options.note.reloadWindowRequired')">
								<svg class="icon icon-tiny" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
									<path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
									<line x1="12" y1="9" x2="12" y2="12" />
									<line x1="12" y1="15" x2="12.01" y2="15" />
								</svg>
							</span>
							<span class="tooltip text-gray mb--0-25" :data-tooltip="$t('options.note.refreshCacheRequired')">
								<svg class="icon icon-tiny" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
									<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
									<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
									<line x1="3" y1="3" x2="21" y2="21" />
								</svg>
							</span>
						</div>
						<div class="text-gray text-small">{{ $t("options.resetOptions.description") }}</div>
					</label>
					<div class="action">
						<button @click="resetOptions" class="mb-1">{{ $t("options.resetOptions.label") }}</button>
						<div v-if="options.addresses && options.addresses.length > 0" class="d-flex gap-0-5 align-items-center text-gray">
							<div>
								<svg class="icon icon-small text-middle" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<line x1="12" y1="8" x2="12.01" y2="8" />
									<rect x="4" y="4" width="16" height="16" rx="2" />
									<polyline points="11 12 12 12 12 16 13 16" />
								</svg>
							</div>
							<span class="text-small">{{ $t("options.resetOptions.removeIdentities") }}</span>
						</div>
					</div>
				</div>
			</section>
		</div>
		<hr class="mb-3" />
		<footer class="mx-auto pb-3">
			<label class="mb-0-5">{{ $t("options.note.title") }}</label>
			<div class="text-gray text-small mb-0-5">
				{{ $t("options.note.reloadStatsPage") }}
			</div>
			<div class="d-flex align-items-center gap-0-5 mb-0-5 text-gray text-small">
				<svg class="icon icon-small" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
					<path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
					<line x1="12" y1="9" x2="12" y2="12" />
					<line x1="12" y1="15" x2="12.01" y2="15" />
				</svg>
				{{ $t("options.note.reloadWindowRequired") }}
			</div>
			<div class="d-flex align-items-center gap-0-5 text-gray text-small">
				<svg class="icon icon-small" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
					<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
					<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
					<line x1="3" y1="3" x2="21" y2="21" />
				</svg>
				{{ $t("options.note.refreshCacheRequired") }}
			</div>
		</footer>
	</div>
</template>

<script>
import { defineComponent } from 'vue';
import { defaultColors } from "./definitions";
import { formatBytes, localStartOfWeek } from "./utils";

export default defineComponent({
	name: "Options",
	data () {
		return {
			input: {
				address: "",
			},
			options: (JSON.parse(JSON.stringify(this.optionsObject()))).options,
			allAccounts: [],
			cacheSize: -1,
			publicPath: process.env.BASE_URL
		}
	},
	async created () {
		// initially load settings
		await this.getSettings()
		// initially load accounts
		this.getAccounts()
		// initially load cache size
		this.getCacheSize()
	},
	methods: {
		// create options object with given values or default values
		optionsObject (
			dark = false,
			ordinate = true,
			tagColors = false,
			startOfWeek = -1,
			addresses = "",
			accounts = [],
			accountColors = {},
			selfMessages = "none",
			leaderCount = 20,
			cache = true
		) {
			// prepare default values
			if (startOfWeek < 0) startOfWeek = localStartOfWeek()	
			// return options object
			return {
				options: {
					dark: dark === null ? this.options.dark : dark,
					ordinate: ordinate === null ? this.options.ordinate : ordinate,
					tagColors: tagColors === null ? this.options.tagColors : tagColors,
					startOfWeek: startOfWeek === null ? this.options.startOfWeek : startOfWeek,
					addresses: addresses === null ? this.options.addresses : addresses,
					accounts: accounts === null ? this.options.accounts : accounts,
					accountColors: accountColors === null ? this.options.accountColors : accountColors,
					selfMessages: selfMessages === null ? this.options.selfMessages : selfMessages,
					leaderCount: leaderCount === null ? this.options.leaderCount : leaderCount,
					cache: cache === null ? this.options.cache : cache,
				}
			}
		},
		// get all saved add-on settings
		async getSettings () {
			// only load options from storage if they have been set, otherwise default settings will be kept
			const result = await messenger.storage.local.get("options")
			if (result && result.options) {
				// merge option objects to overwrite attributes by saved ones while keeping new attributes
				this.options = {...this.options, ...result.options}
			}
		},
		// get all existing accounts
		async getAccounts () {
			const accounts = await (await messenger.runtime.getBackgroundPage()).messenger.accounts.list()
			this.allAccounts = accounts
			// if accounts option is not set yet, default to all accounts
			if (this.options?.accounts && this.options.accounts.length == 0) {
				// update accounts option
				this.options.accounts = accounts.map(a => a.id)
			}
			// if some or all account colors are not initialized yet, initialize them
			if (this.options && this.options.accountColors) {
				this.allAccounts.forEach((a, i) => {
					if (!this.options.accountColors.hasOwnProperty(a.id)) {
						this.options.accountColors[a.id] = defaultColors[(i%defaultColors.length)]
					}
				})
			}
		},
		// get size of all cached account data
		async getCacheSize () {
			const allEntriesSize = new TextEncoder().encode(
				Object.entries(await messenger.storage.local.get())
					.map(([key, value]) => key + JSON.stringify(value))
					.join("")
			).length
			const optionsSize = new TextEncoder().encode(
				Object.entries(await messenger.storage.local.get("options"))
					.map(([key, value]) => key + JSON.stringify(value))
					.join("")
			).length
			this.cacheSize = allEntriesSize - optionsSize
		},
		// add configured email address to list of addresses and save it
		async addAddress () {
			if (this.input.address) {
				let addresses = this.options.addresses ? this.options.addresses + "," : ""
				addresses += this.input.address
				await messenger.storage.local.set({ options: { addresses: addresses } })
				this.options.addresses = addresses
				this.input.address = ""
			}
		},
		// remove given email address from list of addresses and delete it
		async removeAddress (address) {
			let addresses = this.options.addresses.replace(address, "")
			addresses = addresses.replace(/,,/g, ",")
			addresses = addresses.replace(/^,+|,+$/g, "");
			await messenger.storage.local.set({ options: { addresses: addresses } })
			this.options.addresses = addresses
		},
		// increases leader count up to limit 999
		incrementLeaderCount () {
			if (this.options.leaderCount < 999) {
				this.options.leaderCount++
			}
		},
		// decreases leader count down to limit 1
		decrementLeaderCount () {
			if (this.options.leaderCount > 1) {
				this.options.leaderCount--
			}
		},
		// clear all cached stats entries
		async clearCache () {
			// clear whole local storage
			await messenger.storage.local.clear()
			// restore options
			await messenger.storage.local.set({ options: JSON.parse(JSON.stringify(this.options)) })
			// recalculate cache size
			this.getCacheSize()
		},
		// reset options to their default value
		async resetOptions () {
			// save options default values
			await messenger.storage.local.set(JSON.parse(JSON.stringify(this.optionsObject())))
			this.options = (JSON.parse(JSON.stringify(this.optionsObject()))).options
			await this.getAccounts()
		}
	},
	computed: {
		// array of localized, short day of week names
		weekdayNames () {
			let names = []
			for (let wd = 1; wd <= 7; wd++) {
				const d = new Date(1970, 1, wd) // choose a date to retrieve weekdays from, starting on a Sunday
				names.push(d.toLocaleDateString(this.$i18n.locale, { weekday: "long" }))
			}
			return names
		},
		// array of email addresses configured for local account identities
		addressList () {
			return this.options && this.options.addresses ? this.options.addresses.split(",") : []
		},
		// return all valid option values for selfMessages
		selfMessagesOptions () {
			return [
				"none",
				"sameAccount",
				"anyAccount",
			]
		},
		// output cache size in human readable format with units
		formattedCacheSize () {
			return formatBytes(this.cacheSize)
		},
		// check if options are opened in own optinos page
		ownOptionsPage () {
			const uri = window.location.search.substring(1)
			return Boolean((new URLSearchParams(uri)).get("s"))
		}
	},
	watch: {
		// save options object on each single option change
		options: {
			handler (newOptions) {
				messenger.storage.local.set({ options: JSON.parse(JSON.stringify(newOptions)) })
			},
			deep: true,
			immediate: false
		}
	}
});
</script>

<style lang="stylus">
@require "assets/global"

// general
html, body
	min-height: 300px

// layout
#options
	width: 100%
	min-height: 100vh

	header,	footer,	.container
		width: calc(100% - 2rem)
		max-width: 840px
		padding: 1rem

	&.embedded	
		header,	footer,	.container
			width: 100%
			max-width: auto
			padding-left: .5rem
			padding-right: .5rem
		.container > section:first-child > h2
			margin-top: 0
	
	header
		h1
			margin: 0
			.logo
				height: 48px
		
	.container
		&>section
			h2
				font-weight: 300
			.entry
				display: grid
				grid-template-columns: 1fr 50%
				column-gap: 2rem
				margin-bottom: 1rem
				.action
					align-self: center
	

</style>
