<template>
	<div class="text-normal position-relative">
		<div class="container pt-1">
			<!-- header containing number of accounts and linking to stats page -->
			<header class="d-flex gap-0-5 mb-1-5">
				<h3 class="flex-grow">
					<span class="mr-1">{{ t('popup.nAccounts', accounts.length, [accounts.length]) }}</span>
					<span v-if="loading" class="loader"></span>
				</h3>
				<action-bar />
			</header>
			<!-- list of all accounts -->
			<section class="accounts">
				<div
					v-for="a in accounts"
					:key="a.id"
					class="background-hover-accent2 text-hover-highlight cursor-pointer shadow position-relative"
					:class="{
						'background-gray': options.dark,
						'background-highlight-contrast': !options.dark,
					}"
					@click.prevent="openTab('index.stats.html', a.id)"
				>
					<div class="position-relative z-5">
						<h4>{{ a.name }}</h4>
						<div class="text-tiny text-secondary">
							<div>{{ t('popup.nFolders', [a.folderCount], a.folderCount) }}</div>
							<div v-if="a.hasOwnProperty('messageCount')">
								{{ t('popup.nMessages', [a.messageCount], a.messageCount) }}
							</div>
						</div>
					</div>
					<line-chart
						v-if="a.hasOwnProperty('messageCount') && a.messageCount > 0"
						class="background-chart z-0"
						:datasets="a.yearsData.datasets"
						:labels="a.yearsData.labels"
						:ordinate="false"
						:abscissa="false"
						:tooltips="false"
						:thickness="1"
						width="160px"
						height="70px"
					/>
				</div>
			</section>
			<project-meta class="mt-2" :compact="true" />
		</div>
	</div>
</template>

<script setup>
import { onMounted, provide } from 'vue';
import { openTab } from '@/utils.js';
import { useI18n } from 'vue-i18n';
import LineChart from '@/charts/LineChart.vue';
import ProjectMeta from '@/parts/ProjectMeta.vue';
import ActionBar from '@/parts/popup/ActionBar.vue';
import { usePopupData } from '@/composables/usePopupData.js';

const { t } = useI18n();

// popup page data engine (see composables/usePopupData.js) -
// provided here so action components can inject whichever slices they need directly
const popupEngine = usePopupData();
const { accounts, loading, options, init } = popupEngine;
provide('engine', popupEngine);

onMounted(() => init());
</script>

<style>
@import url('assets/main.css');

html,
body {
	width: 380px;
	overflow-y: auto;
	overflow-x: hidden;
}

#popup {
	width: 100%;
	height: 100%;

	.container {
		padding-left: 20px;
		padding-right: 20px;
		padding-bottom: 20px;

		header h3 {
			margin: 0;
			font-weight: 400;
			font-size: 20px;
		}

		.loader {
			height: 16px;
			width: 16px;
		}

		.accounts {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 20px;

			> div {
				padding: 0.75rem 1rem;
				border-radius: 4px;
				transition: all 0.2s;
				overflow: hidden;

				h4 {
					margin: 0;
					font-weight: normal;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.background-chart {
					position: absolute;
					bottom: 0;
					left: 0;
				}
			}
		}
	}
}
</style>
