<template>
	<div
		class="cursor-pointer tooltip tooltip-bottom d-inline-flex align-center"
		:class="{ 'cursor-na': isLoading }"
		:data-tooltip="t('stats.tooltips.exportData')"
		@click="!isLoading ? exportJson() : null"
	>
		<svg class="icon icon-bold icon-gray-alt icon-hover-accent" viewBox="0 0 24 24">
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path class="icon-part-accent2" d="M14 3v4a1 1 0 0 0 1 1h4" />
			<path
				class="icon-part-accent2"
				d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"
			/>
			<line class="icon-part-accent1" x1="9" y1="17" x2="9" y2="12" />
			<line class="icon-part-accent1-faded" x1="12" y1="17" x2="12" y2="16" />
			<line class="icon-part-accent1" x1="15" y1="17" x2="15" y2="14" />
		</svg>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { isLoading, exportJson } = inject('engine');

const { t } = useI18n();
</script>
