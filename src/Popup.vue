<template>
	<div class="popup">
		<div class="container">
			<!-- header containing number of accounts and linking to stats page -->
			<header>
				<h3>
					<span class="count">{{ t('popup.nAccounts', accounts.length, [accounts.length]) }}</span>
					<ts-loader v-if="loading" />
				</h3>
				<action-bar />
			</header>
			<!-- list of all accounts -->
			<section class="accounts">
				<div v-for="a in accounts" :key="a.id" class="account" @click.prevent="openTab('index.stats.html', a.id)">
					<div class="content">
						<h4>{{ a.name }}</h4>
						<div class="meta">
							<div>{{ t('popup.nFolders', [a.folderCount], a.folderCount) }}</div>
							<div v-if="a.hasOwnProperty('messageCount')">
								{{ t('popup.nMessages', [a.messageCount], a.messageCount) }}
							</div>
						</div>
					</div>
					<line-chart
						v-if="a.hasOwnProperty('messageCount') && a.messageCount > 0"
						class="background-chart"
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
			<project-meta class="credits" :compact="true" />
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
const { accounts, loading, init } = popupEngine;
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

body.popup-bg.dark {
	background: var(--color-bg);
}

body.popup-bg.light {
	background: var(--color-bg-modal);
}

#popup {
	width: 100%;
	height: 100%;
	color: var(--color-text);
	position: relative;

	.container {
		padding-top: 1rem;
		padding-left: 20px;
		padding-right: 20px;
		padding-bottom: 20px;

		header {
			display: flex;
			gap: 0.5rem;
			margin-bottom: 1.5rem;
		}

		header h3 {
			margin: 0;
			font-weight: 400;
			font-size: 20px;
			flex-grow: 1;
		}

		.count {
			margin-right: 1rem;
		}

		.loader {
			height: 16px;
			width: 16px;
		}

		.credits {
			margin-top: 2rem;
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
				cursor: pointer;
				position: relative;
				box-shadow: var(--shadow-elevated);

				h4 {
					margin: 0;
					font-weight: normal;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.content {
					position: relative;
					z-index: 5;
				}

				.meta {
					font-size: 0.75rem;
					color: var(--color-text-secondary);
				}

				.background-chart {
					position: absolute;
					bottom: 0;
					left: 0;
					z-index: 0;
				}
			}
		}
	}
}

.dark .accounts > div {
	background: var(--color-bg-gray);
}

.light .accounts > div {
	background: var(--color-bg-highlight-contrast);
}

.accounts > div:hover {
	background: var(--color-blue);
}

.accounts > div:hover,
.accounts > div:hover * {
	color: var(--color-text-highlight);
}
</style>
