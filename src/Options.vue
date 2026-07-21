<template>
	<div class="text-normal" :class="{ embedded: !ownOptionsPage }">
		<header v-if="ownOptionsPage" class="pt-2 mx-auto">
			<h1 class="d-flex align-items-center">
				<img class="logo mr-1" :src="`${publicPath}icon.svg`" alt="ThirdStats Logo" />
				{{ t('options.title') }}
			</h1>
		</header>
		<div class="container mx-auto">
			<!-- section related to ThirdStats appearance and UI -->
			<section class="mb-3">
				<h2>{{ t('options.headings.appearance') }}</h2>
				<!-- option: theme -->
				<theme-option />
				<!-- option: ordinate -->
				<ordinate-option />
				<!-- option: tag colors -->
				<tag-colors-option />
				<!-- option: live count up -->
				<live-count-up-option />
				<!-- option: auto processing -->
				<auto-refresh-option />
			</section>
			<!-- section related to charts and data retrieval -->
			<section class="mb-3">
				<h2>{{ t('options.headings.stats') }}</h2>
				<!-- option: startOfWeek -->
				<!-- <div class="entry">
				<label for="start">
					{{ t("options.startOfWeek.label") }}
					<span class="d-block text-gray text-small">{{ t("options.startOfWeek.description") }}</span>
				</label>
				<div class="action d-flex">
					<select class="flex-grow" v-model="options.startOfWeek" id="start">
						<option v-for="(name, pos) in weekdayNames(locale)" :key="pos" :value="pos">{{ name }}</option>
					</select>
				</div>
			</div> -->
				<!-- option: addresses -->
				<addresses-option />
				<!-- option: account selection -->
				<accounts-option />
				<!-- option: selfMessages -->
				<self-messages-option />
				<!-- option: maxListCount -->
				<max-list-count-option />
			</section>
			<!-- section related to store processed data -->
			<section class="mb-3">
				<h2>{{ t('options.headings.storage') }}</h2>
				<!-- option: cache -->
				<cache-option />
				<!-- action: clear cache -->
				<clear-cache-option />
				<!-- action: reset options -->
				<reset-options-option />
				<!-- option: debug mode -->
				<debug-option />
			</section>
		</div>
		<hr class="mb-3" />
		<footer class="mx-auto pb-3">
			<label class="mb-0-5">{{ t('options.note.title') }}</label>
			<div class="text-gray text-small mb-0-5">
				{{ t('options.note.reloadStatsPage') }}
			</div>
			<div class="d-flex align-items-center gap-0-5 mb-0-5 text-gray text-small">
				<svg class="icon icon-small" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none" />
					<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
					<path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
					<line x1="12" y1="9" x2="12" y2="12" />
					<line x1="12" y1="15" x2="12.01" y2="15" />
				</svg>
				{{ t('options.note.reloadWindowRequired') }}
			</div>
			<div class="d-flex align-items-center gap-0-5 text-gray text-small">
				<svg class="icon icon-small" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none" />
					<path
						d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74"
					/>
					<path
						d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6"
					/>
					<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
					<line x1="3" y1="3" x2="21" y2="21" />
				</svg>
				{{ t('options.note.refreshCacheRequired') }}
			</div>
		</footer>
		<project-meta class="mt-6 pb-6" />
	</div>
</template>

<script setup>
import { onMounted, provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { useOptionsData } from '@/composables/useOptionsData.js';
import ProjectMeta from '@/parts/ProjectMeta.vue';
import ThemeOption from '@/options/ThemeOption.vue';
import OrdinateOption from '@/options/OrdinateOption.vue';
import TagColorsOption from '@/options/TagColorsOption.vue';
import LiveCountUpOption from '@/options/LiveCountUpOption.vue';
import AutoRefreshOption from '@/options/AutoRefreshOption.vue';
import AddressesOption from '@/options/AddressesOption.vue';
import AccountsOption from '@/options/AccountsOption.vue';
import SelfMessagesOption from '@/options/SelfMessagesOption.vue';
import MaxListCountOption from '@/options/MaxListCountOption.vue';
import CacheOption from '@/options/CacheOption.vue';
import ClearCacheOption from '@/options/ClearCacheOption.vue';
import ResetOptionsOption from '@/options/ResetOptionsOption.vue';
import DebugOption from '@/options/DebugOption.vue';

const { t } = useI18n();
const publicPath = import.meta.env.BASE_URL;

// options page data engine (see composables/useOptionsData.js) -
// this composable owns all options-page state internally, so it must only be invoked here.
const optionsEngine = useOptionsData();
const { ownOptionsPage } = optionsEngine;

provide('engine', optionsEngine);

onMounted(() => optionsEngine.init());
</script>

<style>
@import url('assets/main.css');

html,
body {
	min-height: 300px;
}

#options {
	width: 100%;
	min-height: 100vh;

	header,
	footer,
	.container {
		width: calc(100% - 2rem);
		max-width: 840px;
		padding: 1rem;
	}

	&.embedded {
		header,
		footer,
		.container {
			width: 100%;
			max-width: auto;
			padding-left: 0.5rem;
			padding-right: 0.5rem;
		}

		.container > section:first-child > h2 {
			margin-top: 0;
		}
	}

	header {
		h1 {
			margin: 0;

			.logo {
				height: 48px;
			}
		}
	}

	.container {
		> section {
			h2 {
				font-weight: 300;
			}

			.entry {
				display: grid;
				grid-template-columns: 1fr 50%;
				column-gap: 2rem;
				margin-bottom: 1rem;

				.action {
					align-self: center;
				}
			}
		}
	}
}
</style>
