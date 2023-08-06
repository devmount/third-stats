<template>
	<div
		class="text-normal"
		:class="{ 'embedded': !ownOptionsPage }"
	>
		<header v-if="ownOptionsPage" class="pt-2 mx-auto">
			<h1 class="d-flex align-items-center">
				<img class="logo mr-1" :src="`${publicPath}icon.svg`" alt="ThirdStats Logo">
				{{ t("options.title") }}
			</h1>
		</header>
		<div class="container mx-auto">
			<!-- section related to ThirdStats appearance and UI -->
			<section class="mb-3">
				<h2>{{ t("options.headings.appearance") }}</h2>
				<!-- option: theme -->
				<div class="entry">
					<label for="theme">
						{{ t("options.theme.label") }}
						<span class="d-block text-gray text-small">{{ t("options.theme.description") }}</span>
					</label>
					<div class="action d-flex">
						<select class="flex-grow" v-model="options.theme" id="theme">
							<option v-for="theme in ['system', 'light', 'dark']" :key="theme" :value="theme">
								{{ t("options.theme." + theme) }}
							</option>
						</select>
					</div>
				</div>
				<!-- option: ordinate -->
				<div class="entry">
					<label for="ordinate">
						{{ t("options.ordinate.label") }}
						<span class="d-block text-gray text-small">{{ t("options.ordinate.description") }}</span>
					</label>
					<div class="action d-flex">
						<label class="switch">
							<input type="checkbox" id="ordinate" v-model="options.ordinate" />
							<span class="switch-label" :data-on="t('options.switch.on')" :data-off="t('options.switch.off')"></span> 
							<span class="switch-handle"></span> 
						</label>
					</div>
				</div>
				<!-- option: tag colors -->
				<div class="entry">
					<label for="tagColors">
						{{ t("options.tagColors.label") }}
						<span class="d-block text-gray text-small">{{ t("options.tagColors.description") }}</span>
					</label>
					<div class="action d-flex">
						<label class="switch">
							<input type="checkbox" id="tagColors" v-model="options.tagColors" />
							<span class="switch-label" :data-on="t('options.switch.on')" :data-off="t('options.switch.off')"></span> 
							<span class="switch-handle"></span> 
						</label>
					</div>
				</div>
				<!-- option: live count up -->
				<div class="entry">
					<label for="liveCountUp">
						{{ t("options.liveCountUp.label") }}
						<span class="d-block text-gray text-small">{{ t("options.liveCountUp.description") }}</span>
					</label>
					<div class="action">
						<label class="switch mb-0-5">
							<input type="checkbox" id="liveCountUp" v-model="options.liveCountUp" />
							<span class="switch-label" :data-on="t('options.switch.on')" :data-off="t('options.switch.off')"></span> 
							<span class="switch-handle"></span> 
						</label>
						<div class="d-flex gap-0-5 align-items-center text-gray">
							<div>
								<svg class="icon icon-small text-middle" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<line x1="12" y1="8" x2="12.01" y2="8" />
									<rect x="4" y="4" width="16" height="16" rx="2" />
									<polyline points="11 12 12 12 12 16 13 16" />
								</svg>
							</div>
							<span class="text-small">{{ t("options.liveCountUp.info") }}</span>
						</div>
					</div>
				</div>
				<!-- option: auto processing -->
				<div class="entry">
					<label for="autoRefresh">
						<div class="d-flex align-items-end gap-0-5">
							{{ t("options.autoRefresh.label") }}
							<span class="tooltip text-gray mb--0-25" :data-tooltip="t('options.note.reloadWindowRequired')">
								<svg class="icon icon-tiny" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
									<path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
									<line x1="12" y1="9" x2="12" y2="12" />
									<line x1="12" y1="15" x2="12.01" y2="15" />
								</svg>
							</span>
						</div>
						<div class="text-gray text-small">{{ t("options.autoRefresh.description") }}</div>
					</label>
					<div class="action d-flex align-items-center gap-1">
						<label class="switch flex-no-shrink">
							<input type="checkbox" id="autoRefresh" v-model="options.autoRefresh" />
							<span class="switch-label" :data-on="t('options.switch.on')" :data-off="t('options.switch.off')"></span> 
							<span class="switch-handle"></span> 
						</label>
						<div v-if="options.autoRefresh" class="action d-flex flex-grow input-group">
							<div class="d-flex flex-grow" :data-unit="t('stats.abbreviations.minute')">
								<input
									class="flex-grow"
									id="autoRefreshInterval"
									type="number"
									v-model="options.autoRefreshInterval"
									placeholder="30"
									min="5"
									@change="checkAutoRefreshInterval()"
								/>
							</div>
							<div class="d-flex flex-direction-column button-group-vertical">
								<button @click="incrementAutoRefreshInterval()" class="h-1-25 py-0 px-0-5">
									<svg class="icon icon-small icon-bold d-block m-0-auto" viewBox="0 0 24 20">
										<polyline points="6,12 12,6 18,12" />
									</svg>
								</button>
								<button @click="decrementAutoRefreshInterval()" class="h-1-25 py-0 px-0-5">
									<svg class="icon icon-small icon-bold d-block m-0-auto" viewBox="0 0 24 20">
										<polyline points="6,5 12,11 18,5" />
									</svg>
								</button>
							</div>
						</div>
					</div>
				</div>
			</section>
			<!-- section related to charts and data retrieval -->
			<section class="mb-3">
				<h2>{{ t("options.headings.stats") }}</h2>
				<!-- option: startOfWeek -->
				<!-- <div class="entry">
					<label for="start">
						{{ t("options.startOfWeek.label") }}
						<span class="d-block text-gray text-small">{{ t("options.startOfWeek.description") }}</span>
					</label>
					<div class="action d-flex">
						<select class="flex-grow" v-model="options.startOfWeek" id="start">
							<option v-for="(name, pos) in weekdayNames" :key="pos" :value="pos">{{ name }}</option>
						</select>
					</div>
				</div> -->
				<!-- option: addresses -->
				<div class="entry">
					<label for="local">
						<div class="d-flex align-items-end gap-0-5">
							{{ t("options.localIdentities.label") }}
							<span class="tooltip text-gray mb--0-25" :data-tooltip="t('options.note.refreshCacheRequired')">
								<svg class="icon icon-tiny" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
									<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
									<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
									<line x1="3" y1="3" x2="21" y2="21" />
								</svg>
							</span>
						</div>
						<div class="text-gray text-small">{{ t("options.localIdentities.description") }}</div>
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
							<span class="tag text-small" v-for="a in addressList" :key="a">
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
							{{ t("options.activeAccounts.label") }}
							<span class="tooltip text-gray mb--0-25" :data-tooltip="t('options.note.reloadWindowRequired')">
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
							{{ t("options.activeAccounts.description") }}
							{{ t("options.activeAccounts.color") }}<br />
							{{ t("options.activeAccounts.sumAndCompare") }}
						</div>
					</label>
					<div class="action">
						<div v-for="(a, i) in allAccounts" :key="i" class="d-flex justify-space-between">
							<label class="checkbox cursor-pointer text-overflow-ellipsis flex-no-grow">
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
							{{ t("options.selfMessages.label") }}
							<span class="tooltip text-gray mb--0-25" :data-tooltip="t('options.note.refreshCacheRequired')">
								<svg class="icon icon-tiny" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
									<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
									<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
									<line x1="3" y1="3" x2="21" y2="21" />
								</svg>
							</span>
						</div>
						<div class="text-gray text-small">{{ t("options.selfMessages.description") }}</div>
					</label>
					<div class="action d-flex flex-wrap">
						<select class="flex-grow mb-0-5" v-model="options.selfMessages" id="selfMessages">
							<option v-for="val in selfMessagesOptions" :key="val" :value="val">{{ t("options.selfMessages.values." + val) }}</option>
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
							<span class="text-small">{{ t("options.selfMessages.info." + options.selfMessages) }}</span>
						</div>
					</div>
				</div>
				<!-- option: leaderCount -->
				<div class="entry">
					<label for="leaderCount">
						<div class="d-flex align-items-end gap-0-5">
							{{ t("options.leaderCount.label") }}
							<span class="tooltip text-gray mb--0-25" :data-tooltip="t('options.note.refreshCacheRequired')">
								<svg class="icon icon-tiny" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
									<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
									<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
									<line x1="3" y1="3" x2="21" y2="21" />
								</svg>
							</span>
						</div>
						<div class="text-gray text-small">{{ t("options.leaderCount.description") }}</div>
					</label>
					<div class="action d-flex input-group">
						<input
							class="flex-grow"
							id="leaderCount"
							type="number"
							v-model="options.leaderCount"
							placeholder="20"
							min="1"
							max="999"
							@change="checkLeaderCount()"
						/>
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
				<h2>{{ t("options.headings.storage") }}</h2>
				<!-- option: cache -->
				<div class="entry">
					<label for="cache">
						{{ t("options.cache.label") }}
						<span class="d-block text-gray text-small">{{ t("options.cache.description") }}</span>
					</label>
					<div class="action">
						<label class="switch">
							<input type="checkbox" id="cache" v-model="options.cache" />
							<span class="switch-label" :data-on="t('options.switch.on')" :data-off="t('options.switch.off')"></span> 
							<span class="switch-handle"></span> 
						</label>
					</div>
				</div>
				<!-- action: clear cache -->
				<div class="entry">
					<label>
						{{ t("options.clearCache.label") }}
						<span class="d-block text-gray text-small">{{ t("options.clearCache.description") }}</span>
					</label>
					<div class="action">
						<button @click="clearCache" class="mb-0-5">{{ t("options.clearCache.label") }}</button>
						<div class="d-flex gap-0-5 align-items-center text-gray">
							<div>
								<svg class="icon icon-small text-middle" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<line x1="12" y1="8" x2="12.01" y2="8" />
									<rect x="4" y="4" width="16" height="16" rx="2" />
									<polyline points="11 12 12 12 12 16 13 16" />
								</svg>
							</div>
							<span class="text-small" v-if="cacheSize > 0">{{ t("options.clearCache.size", [formattedCacheSize]) }}</span>
							<span class="text-small" v-else>{{ t("options.clearCache.empty") }}</span>
						</div>
					</div>
				</div>
				<!-- action: reset options -->
				<div class="entry">
					<label>
						<div class="d-flex align-items-end gap-0-5">
							{{ t("options.resetOptions.label") }}
							<span class="tooltip text-gray mb--0-25" :data-tooltip="t('options.note.reloadWindowRequired')">
								<svg class="icon icon-tiny" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
									<path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
									<line x1="12" y1="9" x2="12" y2="12" />
									<line x1="12" y1="15" x2="12.01" y2="15" />
								</svg>
							</span>
							<span class="tooltip text-gray mb--0-25" :data-tooltip="t('options.note.refreshCacheRequired')">
								<svg class="icon icon-tiny" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
									<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
									<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
									<line x1="3" y1="3" x2="21" y2="21" />
								</svg>
							</span>
						</div>
						<div class="text-gray text-small">{{ t("options.resetOptions.description") }}</div>
					</label>
					<div class="action">
						<button @click="resetOptions" class="mb-0-5">{{ t("options.resetOptions.label") }}</button>
						<div v-if="options.addresses && options.addresses.length > 0" class="d-flex gap-0-5 align-items-center text-gray">
							<div>
								<svg class="icon icon-small text-middle" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<line x1="12" y1="8" x2="12.01" y2="8" />
									<rect x="4" y="4" width="16" height="16" rx="2" />
									<polyline points="11 12 12 12 12 16 13 16" />
								</svg>
							</div>
							<span class="text-small">{{ t("options.resetOptions.removeIdentities") }}</span>
						</div>
					</div>
				</div>
			</section>
		</div>
		<hr class="mb-3" />
		<footer class="mx-auto pb-3">
			<label class="mb-0-5">{{ t("options.note.title") }}</label>
			<div class="text-gray text-small mb-0-5">
				{{ t("options.note.reloadStatsPage") }}
			</div>
			<div class="d-flex align-items-center gap-0-5 mb-0-5 text-gray text-small">
				<svg class="icon icon-small" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
					<path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
					<line x1="12" y1="9" x2="12" y2="12" />
					<line x1="12" y1="15" x2="12.01" y2="15" />
				</svg>
				{{ t("options.note.reloadWindowRequired") }}
			</div>
			<div class="d-flex align-items-center gap-0-5 text-gray text-small">
				<svg class="icon icon-small" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
					<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
					<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
					<line x1="3" y1="3" x2="21" y2="21" />
				</svg>
				{{ t("options.note.refreshCacheRequired") }}
			</div>
		</footer>
		<project-meta class="mt-6 pb-6" />
	</div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { defaultColors } from '@/definitions.js';
import { useI18n } from 'vue-i18n';
import { formatBytes, localStartOfWeek, setTheme } from '@/utils.js';
import ProjectMeta from '@/parts/ProjectMeta.vue'

const { t, locale } = useI18n();
const publicPath = import.meta.env.BASE_URL;

const input = ref({ address: '' });
const allAccounts = ref([]);
const cacheSize = ref(-1);

// all valid option values for selfMessages
const selfMessagesOptions = [
	"none",
	"sameAccount",
	"anyAccount",
];

// create options object with given values or default values
const optionsObject = (
	theme               = 'system',
	ordinate            = true,
	tagColors           = false,
	liveCountUp         = true,
	autoRefresh         = true,
	autoRefreshInterval = 30,
	startOfWeek         = -1,
	addresses           = '',
	accounts            = [],
	accountColors       = {},
	selfMessages        = 'none',
	leaderCount         = 20,
	cache               = true,
) => {
	// prepare default values
	if (startOfWeek < 0) startOfWeek = localStartOfWeek()	
	// return options object
	return {
		options: {
			theme: theme === null ? options.value.theme : theme,
			ordinate: ordinate === null ? options.value.ordinate : ordinate,
			tagColors: tagColors === null ? options.value.tagColors : tagColors,
			liveCountUp: liveCountUp === null ? options.value.liveCountUp : liveCountUp,
			autoRefresh: autoRefresh === null ? options.value.autoRefresh : autoRefresh,
			autoRefreshInterval: autoRefreshInterval === null ? options.value.autoRefreshInterval : autoRefreshInterval,
			startOfWeek: startOfWeek === null ? options.value.startOfWeek : startOfWeek,
			addresses: addresses === null ? options.value.addresses : addresses,
			accounts: accounts === null ? options.value.accounts : accounts,
			accountColors: accountColors === null ? options.value.accountColors : accountColors,
			selfMessages: selfMessages === null ? options.value.selfMessages : selfMessages,
			leaderCount: leaderCount === null ? options.value.leaderCount : leaderCount,
			cache: cache === null ? options.value.cache : cache,
		}
	}
};
const options = ref((JSON.parse(JSON.stringify(optionsObject()))).options);

// get all saved add-on settings
const getSettings = async () => {
	// only load options from storage if they have been set, otherwise default settings will be kept
	const result = await messenger.storage.local.get("options");
	if (result && result.options) {
		// merge option objects to overwrite attributes by saved ones while keeping new attributes
		options.value = {...options.value, ...result.options};
		// handle theme
		setTheme(
			options.value.theme,
			document.body,
			['dark', 'background-alt'],
			['light', 'background-highlight-contrast']
		);
	}
};

// get all existing accounts
const getAccounts = async () => {
	const accounts = await (await messenger.runtime.getBackgroundPage()).messenger.accounts.list();
	allAccounts.value = accounts;
	// if accounts option is not set yet, default to all accounts
	if (options.value?.accounts && options.value.accounts.length == 0) {
		// update accounts option
		options.value.accounts = accounts.map(a => a.id);
	}
	// if some or all account colors are not initialized yet, initialize them
	if (options.value && options.value.accountColors) {
		allAccounts.value.forEach((a, i) => {
			if (!options.value.accountColors.hasOwnProperty(a.id)) {
				options.value.accountColors[a.id] = defaultColors[(i%defaultColors.length)]
			}
		})
	}
};

// get size of all cached account data
const getCacheSize = async () => {
	const allEntriesSize = new TextEncoder().encode(
		Object.entries(await messenger.storage.local.get())
			.map(([key, value]) => key + JSON.stringify(value))
			.join("")
	).length;
	const optionsSize = new TextEncoder().encode(
		Object.entries(await messenger.storage.local.get("options"))
			.map(([key, value]) => key + JSON.stringify(value))
			.join("")
	).length;
	cacheSize.value = allEntriesSize - optionsSize;
};

// add configured email address to list of addresses and save it
const addAddress = async () => {
	if (input.value.address) {
		let addresses = options.value.addresses ? options.value.addresses + "," : "";
		addresses += input.value.address;
		await messenger.storage.local.set({ options: { addresses: addresses } });
		options.value.addresses = addresses;
		input.value.address = "";
	}
};

// remove given email address from list of addresses and delete it
const removeAddress = async (address) => {
	let addresses = options.value.addresses.replace(address, "");
	addresses = addresses.replace(/,,/g, ",");
	addresses = addresses.replace(/^,+|,+$/g, "");;
	await messenger.storage.local.set({ options: { addresses: addresses } });
	options.value.addresses = addresses;
};

// increases auto refresh interval up without limit
const incrementAutoRefreshInterval = () => {
	options.value.autoRefreshInterval++;
};

// decreases auto refresh interval down to limit 5
const decrementAutoRefreshInterval = () => {
	if (options.value.autoRefreshInterval > 5) {
		options.value.autoRefreshInterval--;
	}
};

// check auto refresh number input to stay in allowed range
const checkAutoRefreshInterval = () => {
	if (options.value.autoRefreshInterval < 5) {
		options.value.autoRefreshInterval = 5;
	}
};

// increases leader count up to limit 999
const incrementLeaderCount = () => {
	if (options.value.leaderCount < 999) {
		options.value.leaderCount++;
	}
};

// decreases leader count down to limit 1
const decrementLeaderCount = () => {
	if (options.value.leaderCount > 1) {
		options.value.leaderCount--;
	}
};

// check leader count input to stay in allowed range
const checkLeaderCount = () => {
	if (options.value.leaderCount < 1) {
		options.value.leaderCount = 1;
	}
	if (options.value.leaderCount > 999) {
		options.value.leaderCount = 999;
	}
};

// clear all cached stats entries
const clearCache = async () => {
	// clear whole local storage
	await messenger.storage.local.clear();
	// restore options
	await messenger.storage.local.set({ options: JSON.parse(JSON.stringify(options.value)) });
	// recalculate cache size
	getCacheSize();
};

// reset options to their default value
const resetOptions = async () => {
	// save options default values
	await messenger.storage.local.set(JSON.parse(JSON.stringify(optionsObject())));
	options.value = (JSON.parse(JSON.stringify(optionsObject()))).options;
	await getAccounts();
};

// array of localized, short day of week names
const weekdayNames = computed(() => {
	let names = [];
	for (let wd = 1; wd <= 7; wd++) {
		const d = new Date(1970, 1, wd); // choose a date to retrieve weekdays from, starting on a Sunday
		names.push(d.toLocaleDateString(locale, { weekday: "long" }));
	}
	return names;
});

// array of email addresses configured for local account identities
const addressList = computed(() => {
	return options.value && options.value.addresses
		? options.value.addresses.split(",")
		: [];
});

// output cache size in human readable format with units
const formattedCacheSize = computed(() => {
	return formatBytes(cacheSize.value);
});

// check if options are opened in own options page
const ownOptionsPage = computed(() => {
	const uri = window.location.search.substring(1)
	return Boolean((new URLSearchParams(uri)).get("s"))
});

// save options object on each single option change
watch(
	() => options.value,
	(newOptions) => {
		messenger.storage.local.set({ options: JSON.parse(JSON.stringify(newOptions)) });
		setTheme(
			newOptions.theme,
			document.body,
			['dark', 'background-alt'],
			['light', 'background-highlight-contrast']
		);
	},
	{
		deep: true,
		immediate: false
	}
);

onMounted(async () => {
	// initially load settings
	await getSettings();
	// initially load accounts
	getAccounts();
	// initially load cache size
	getCacheSize();
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
