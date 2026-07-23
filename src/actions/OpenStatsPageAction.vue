<template>
	<div
		class="action-link"
		v-tooltip="{ text: t('popup.openAllStats'), position: tooltipPosition }"
		@click.prevent="openTab('index.stats.html', accounts.length > 1 ? 'sum' : accounts[0].id)"
	>
		<ts-icon :size="size" :weight="weight" :variant="variant" hover-accent>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<polyline class="icon-part-accent2" points="4 19 8 13 12 15 16 10 20 14 20 19 4 19" />
			<polyline class="icon-part-accent1" points="4 12 7 8 11 10 16 4 20 8" />
		</ts-icon>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { openTab } from '@/utils.js';
import { useI18n } from 'vue-i18n';

const { accounts } = inject('engine');

const { t } = useI18n();

defineProps({
	// forwarded to ts-icon - differ per caller
	size: { type: String, default: null },
	weight: { type: String, default: null },
	variant: { type: String, default: null },
	// tooltip position - differs per caller
	tooltipPosition: { type: String, default: null },
});
</script>

<style scoped>
.action-link {
	cursor: pointer;
}
</style>
