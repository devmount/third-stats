<template>
	<div class="filter-contact">
		<label for="contact" class="filter-label">{{ t('stats.contact', 1) }}</label>
		<div class="select-wrapper">
			<ts-select
				id="contact"
				v-model="active.contact"
				:disabled="isLoading"
				class="filter-select"
				:class="{ disabled: isLoading }"
			>
				<option v-for="c in contacts" :key="c" :value="c">{{ c }}</option>
			</ts-select>
		</div>
		<div
			class="clear-button"
			:class="{ disabled: isLoading }"
			v-tooltip="{ text: t('stats.tooltips.clear'), position: 'bottom' }"
			@click="!isLoading ? resetContact(true) : null"
		>
			<ts-icon weight="bold" variant="gray" :hover-accent="!isLoading">
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

const { contacts, active, isLoading, resetContact } = inject('engine');

const { t } = useI18n();
</script>

<style scoped>
.filter-contact {
	display: flex;
}

.filter-label {
	align-self: center;
	color: var(--color-text-gray);
	padding: 0.5rem;
}

.select-wrapper {
	display: flex;
	align-self: stretch;
}

.filter-select {
	width: 6rem;
	align-self: stretch;
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
