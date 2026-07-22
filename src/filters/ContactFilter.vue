<template>
	<div class="filter-contact d-flex">
		<label for="contact" class="align-center text-gray p-0-5">{{ t('stats.contact', 1) }}</label>
		<div class="d-flex align-stretch">
			<ts-select
				id="contact"
				v-model="active.contact"
				:disabled="isLoading"
				class="align-stretch w-6"
				:class="{ disabled: isLoading }"
			>
				<option v-for="c in contacts" :key="c" :value="c">{{ c }}</option>
			</ts-select>
		</div>
		<div
			class="cursor-pointer d-inline-flex align-center"
			:class="{ 'cursor-na': isLoading }"
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
