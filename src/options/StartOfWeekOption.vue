<template>
	<div class="entry">
		<label for="start">
			{{ t('options.startOfWeek.label') }}
			<span class="description">{{ t('options.startOfWeek.description') }}</span>
		</label>
		<div class="action">
			<ts-select v-model="options.startOfWeek" id="start">
				<option v-for="(name, pos) in weekdayNames(locale)" :key="pos" :value="pos">{{ name }}</option>
			</ts-select>
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { weekdayNames } from '@/utils.js';

const { options } = inject('engine');

const { t, locale } = useI18n();
</script>
