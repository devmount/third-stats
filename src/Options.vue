<template>
	<div
		class="flex flex-col justify-center w-full max-w-4xl mx-auto pt-2"
		:class="{
			'px-4 gap-4': ownOptionsPage,
			'px-2 gap-2': !ownOptionsPage,
		}"
	>
		<header v-if="ownOptionsPage" class="flex items-center gap-4 pt-4">
			<icon-third-stats class="!w-12 !h-12" colored />
			<h1 class="text-4xl font-bold">{{ t("options.title") }}</h1>
		</header>
		<div class="flex flex-col gap-12">
			<!-- section related to ThirdStats appearance and UI -->
			<section class="mb-3">
				<h2 class="text-2xl font-light">{{ t("options.headings.appearance") }}</h2>
				<!-- option: theme -->
				<div class="grid grid-cols-option gap-8 mb-4">
					<label for="theme">
						{{ t("options.theme.label") }}
						<span class="block text-zinc-500">{{ t("options.theme.description") }}</span>
					</label>
					<div class="flex self-center">
						<select class="flex-grow" v-model="options.theme" id="theme">
							<option v-for="theme in ['system', 'light', 'dark']" :key="theme" :value="theme">
								{{ t("options.theme." + theme) }}
							</option>
						</select>
					</div>
				</div>
				<!-- option: ordinate -->
				<div class="grid grid-cols-option gap-8 mb-4">
					<label for="ordinate">
						{{ t("options.ordinate.label") }}
						<span class="block text-zinc-500">{{ t("options.ordinate.description") }}</span>
					</label>
					<div class="flex self-center">
						<label class="switch">
							<input type="checkbox" id="ordinate" v-model="options.ordinate" />
							<span class="switch-label" :data-on="t('options.switch.on')" :data-off="t('options.switch.off')"></span> 
							<span class="switch-handle"></span> 
						</label>
					</div>
				</div>
				<!-- option: tag colors -->
				<div class="grid grid-cols-option gap-8 mb-4">
					<label for="tagColors">
						{{ t("options.tagColors.label") }}
						<span class="block text-zinc-500">{{ t("options.tagColors.description") }}</span>
					</label>
					<div class="flex self-center">
						<label class="switch">
							<input type="checkbox" id="tagColors" v-model="options.tagColors" />
							<span class="switch-label" :data-on="t('options.switch.on')" :data-off="t('options.switch.off')"></span> 
							<span class="switch-handle"></span> 
						</label>
					</div>
				</div>
				<!-- option: live count up -->
				<div class="grid grid-cols-option gap-8 mb-4">
					<label for="liveCountUp">
						{{ t("options.liveCountUp.label") }}
						<span class="block text-zinc-500">{{ t("options.liveCountUp.description") }}</span>
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
				<div class="grid grid-cols-option gap-8 mb-4">
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
					<div class="flex self-center align-items-center gap-1">
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
				<h2 class="text-2xl font-light">{{ t("options.headings.stats") }}</h2>
				<!-- option: startOfWeek -->
				<!-- <div class="grid grid-cols-option gap-8 mb-4">
					<label for="start">
						{{ t("options.startOfWeek.label") }}
						<span class="block text-zinc-500">{{ t("options.startOfWeek.description") }}</span>
					</label>
					<div class="flex self-center">
						<select class="flex-grow" v-model="options.startOfWeek" id="start">
							<option v-for="(name, pos) in weekdayNames(locale)" :key="pos" :value="pos">{{ name }}</option>
						</select>
					</div>
				</div> -->
				<!-- option: addresses -->
				<div class="grid grid-cols-option gap-8 mb-4">
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
				<div class="grid grid-cols-option gap-8 mb-4">
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
					<div class="flex self-center flex-wrap">
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
				<!-- option: maxListCount -->
				<div class="grid grid-cols-option gap-8 mb-4">
					<label for="maxListCount">
						<div class="d-flex align-items-end gap-0-5">
							{{ t("options.maxListCount.label") }}
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
						<div class="text-gray text-small">{{ t("options.maxListCount.description") }}</div>
					</label>
					<div class="flex self-center input-group">
						<input
							class="flex-grow"
							id="maxListCount"
							type="number"
							v-model="options.maxListCount"
							placeholder="20"
							min="1"
							max="999"
							@change="checkmaxListCount()"
						/>
						<div class="d-flex flex-direction-column button-group-vertical">
							<button @click="incrementmaxListCount()" class="h-1-25 py-0 px-0-5">
								<svg class="icon icon-small icon-bold d-block m-0-auto" viewBox="0 0 24 20">
									<polyline points="6,12 12,6 18,12" />
								</svg>
							</button>
							<button @click="decrementmaxListCount()" class="h-1-25 py-0 px-0-5">
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
				<h2 class="text-2xl font-light">{{ t("options.headings.storage") }}</h2>
				<!-- option: cache -->
				<div class="grid grid-cols-option gap-8 mb-4">
					<label for="cache">
						{{ t("options.cache.label") }}
						<span class="block text-zinc-500">{{ t("options.cache.description") }}</span>
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
				<div class="grid grid-cols-option gap-8 mb-4">
					<label>
						{{ t("options.clearCache.label") }}
						<span class="block text-zinc-500">{{ t("options.clearCache.description") }}</span>
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
				<div class="grid grid-cols-option gap-8 mb-4">
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
import { defaultColors, defaultOptions } from '@/definitions.js';
import { useI18n } from 'vue-i18n';
import { formatBytes, setTheme } from '@/utils.js';
import IconThirdStats from "@/icons/IconThirdStats.vue";
import ProjectMeta from '@/parts/ProjectMeta.vue'

const { t, locale } = useI18n();

const input = ref({ address: '' });
const allAccounts = ref([]);
const cacheSize = ref(-1);

// all valid option values for selfMessages
const selfMessagesOptions = [
	"none",
	"sameAccount",
	"anyAccount",
];

// true if options are opened in own options page or false if embedded
const ownOptionsPage = Boolean(
	(new URLSearchParams(window.location.search.substring(1))).get("s")
);

// create options object with default values
const options = ref(defaultOptions);

// get all saved add-on settings
const getSettings = async () => {
	// show scroll bar if own options page
	if (ownOptionsPage) {
		document.body.classList.remove('overflow-y-hidden');
	}
	// only load options from storage if they have been set, otherwise default settings will be kept
	const result = await messenger.storage.local.get("options");
	if (result && result.options) {
		// merge option objects to overwrite attributes by saved ones while keeping new attributes
		options.value = {...options.value, ...result.options};
		// handle theme
		const darkClasses = ['dark'];
		if (!ownOptionsPage) {
			darkClasses.push('!bg-tboptions');
		}
		setTheme(options.value.theme, [document.documentElement, document.body], darkClasses);
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
const incrementmaxListCount = () => {
	if (options.value.maxListCount < 999) {
		options.value.maxListCount++;
	}
};

// decreases leader count down to limit 1
const decrementmaxListCount = () => {
	if (options.value.maxListCount > 1) {
		options.value.maxListCount--;
	}
};

// check leader count input to stay in allowed range
const checkmaxListCount = () => {
	if (options.value.maxListCount < 1) {
		options.value.maxListCount = 1;
	}
	if (options.value.maxListCount > 999) {
		options.value.maxListCount = 999;
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
	await messenger.storage.local.set({ options: defaultOptions });
	options.value = defaultOptions;
	await getAccounts();
};

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

// save options object on each single option change
watch(
	() => options.value,
	(newOptions) => {
		messenger.storage.local.set({ options: JSON.parse(JSON.stringify(newOptions)) });
		const darkClasses = ['dark'];
		if (!ownOptionsPage) {
			darkClasses.push('!bg-tboptions');
		}
		setTheme(newOptions.theme, [document.documentElement, document.body], darkClasses);
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
