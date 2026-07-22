<template>
	<div
		class="cursor-pointer tooltip"
		:class="wrapperClass"
		:data-tooltip="t('popup.openAllStats')"
		@click.prevent="openTab('index.stats.html', accounts.length > 1 ? 'sum' : accounts[0].id)"
	>
		<svg class="icon icon-hover-accent" :class="iconClass" viewBox="0 0 24 24">
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<polyline class="icon-part-accent2" points="4 19 8 13 12 15 16 10 20 14 20 19 4 19" />
			<polyline class="icon-part-accent1" points="4 12 7 8 11 10 16 4 20 8" />
		</svg>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { openTab } from '@/utils.js';
import { useI18n } from 'vue-i18n';

const { accounts } = inject('engine');

const { t } = useI18n();

defineProps({
	// extra classes for the wrapper (tooltip position, flex alignment, spacing) - differs per caller
	wrapperClass: { type: String, default: '' },
	// extra classes for the svg icon (size, color) - differs per caller
	iconClass: { type: String, default: '' },
});
</script>
