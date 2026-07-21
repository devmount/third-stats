<template>
	<div class="filter-folder d-flex">
		<label for="folder" class="align-center text-gray p-0-5">{{ t('stats.folder') }}</label>
		<div
			class="d-flex align-stretch tooltip-bottom"
			:class="{ tooltip: !singleAccount }"
			:data-tooltip="t('stats.tooltips.folder.notAvailable', [t('stats.allAccounts')])"
		>
			<select
				id="folder"
				v-model="active.folder"
				:disabled="isLoading || !singleAccount"
				class="align-stretch w-6"
				:class="{ disabled: isLoading || !singleAccount }"
			>
				<option v-for="f in folders" :key="f.path" :value="f">{{ formatFolder(f) }}</option>
			</select>
		</div>
		<div
			class="cursor-pointer tooltip tooltip-bottom d-inline-flex align-center"
			:class="{ 'cursor-na': isLoading || !singleAccount }"
			:data-tooltip="t('stats.tooltips.clear')"
			:disabled="isLoading || !singleAccount"
			@click="!isLoading && singleAccount ? resetFolder(true) : null"
		>
			<svg
				class="icon icon-bold icon-gray"
				:class="{ 'icon-hover-accent': !isLoading && singleAccount }"
				viewBox="0 0 24 24"
			>
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<line class="icon-part-accent2" x1="18" y1="6" x2="6" y2="18" />
				<line class="icon-part-accent2" x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatFolder } from '@/utils.js';

const { folders, active, isLoading, singleAccount, resetFolder } = inject('engine');

const { t } = useI18n();
</script>
