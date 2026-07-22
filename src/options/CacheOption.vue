<template>
	<div class="entry">
		<label for="cache">
			{{ t('options.cache.label') }}
			<span class="d-block text-gray text-small">{{ t('options.cache.description') }}</span>
		</label>
		<div class="action">
			<ts-switch v-model="options.cache" id="cache" />
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { options } = inject('engine');

const { t } = useI18n();
</script>
