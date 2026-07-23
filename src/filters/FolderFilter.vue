<template>
	<div class="filter-folder">
		<label for="folder" class="filter-label">{{ t('stats.folder') }}</label>
		<div
			class="select-wrapper"
			v-tooltip="
				!singleAccount
					? { text: t('stats.tooltips.folder.notAvailable', [t('stats.allAccounts')]), position: 'bottom' }
					: null
			"
		>
			<ts-select
				id="folder"
				v-model="active.folder"
				:disabled="isLoading || !singleAccount"
				class="filter-select"
				:class="{ disabled: isLoading || !singleAccount }"
			>
				<option v-for="f in folders" :key="f.path" :value="f">{{ formatFolder(f) }}</option>
			</ts-select>
		</div>
		<div
			class="clear-button"
			:class="{ disabled: isLoading || !singleAccount }"
			v-tooltip="{ text: t('stats.tooltips.clear'), position: 'bottom' }"
			:disabled="isLoading || !singleAccount"
			@click="!isLoading && singleAccount ? resetFolder(true) : null"
		>
			<ts-icon weight="bold" variant="gray" :hover-accent="!isLoading && singleAccount">
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<line class="icon-part-accent2" x1="18" y1="6" x2="6" y2="18" />
				<line class="icon-part-accent2" x1="6" y1="6" x2="18" y2="18" />
			</ts-icon>
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

<style scoped>
.filter-folder {
	display: flex;
	justify-content: center;
	align-items: center;
}

.filter-label {
	color: var(--color-text-gray);
	padding: 0.5rem;
}

.select-wrapper {
	display: flex;
}

.filter-select {
	width: 6rem;
}

.clear-button {
	cursor: pointer;
	display: inline-flex;
	align-self: center;
}

.clear-button.disabled {
	cursor: not-allowed;
}
</style>
