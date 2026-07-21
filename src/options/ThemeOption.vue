<template>
	<div class="entry">
		<label for="theme">
			{{ t('options.theme.label') }}
			<span class="d-block text-gray text-small">{{ t('options.theme.description') }}</span>
		</label>
		<div class="action d-flex">
			<select class="flex-grow" v-model="options.theme" id="theme">
				<option v-for="theme in ['system', 'light', 'dark']" :key="theme" :value="theme">
					{{ t('options.theme.' + theme) }}
				</option>
			</select>
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { options } = inject('engine');

const { t } = useI18n();
</script>
