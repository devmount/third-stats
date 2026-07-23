<template>
	<div
		class="action-link"
		v-tooltip="{ text: t('popup.openOptions'), position: tooltipPosition }"
		@click.prevent="openTab('index.options.html')"
	>
		<ts-icon :size="size" :weight="weight" :variant="variant" hover-accent>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path
				class="icon-part-accent2"
				d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"
			/>
			<circle class="icon-part-accent2-faded" cx="12" cy="12" r="3" />
		</ts-icon>
	</div>
</template>

<script setup>
import { openTab } from '@/utils.js';
import { useI18n } from 'vue-i18n';

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
