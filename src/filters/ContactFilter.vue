<template>
	<div class="filter-contact d-flex">
		<label for="contact" class="align-center text-gray p-0-5">{{ t('stats.contact', 1) }}</label>
		<div class="d-flex align-stretch tooltip-bottom">
			<select
				id="contact"
				v-model="active.contact"
				:disabled="isLoading"
				class="align-stretch w-6"
				:class="{ disabled: isLoading }"
			>
				<option v-for="c in contacts" :key="c" :value="c">{{ c }}</option>
			</select>
		</div>
		<div
			class="cursor-pointer tooltip tooltip-bottom d-inline-flex align-center"
			:class="{ 'cursor-na': isLoading }"
			:data-tooltip="t('stats.tooltips.clear')"
			@click="!isLoading ? resetContact(true) : null"
		>
			<svg class="icon icon-bold icon-gray" :class="{ 'icon-hover-accent': !isLoading }" viewBox="0 0 24 24">
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

const { contacts, active, isLoading, resetContact } = inject('engine');

const { t } = useI18n();
</script>
