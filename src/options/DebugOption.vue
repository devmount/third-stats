<template>
	<div class="entry">
		<label for="debug">
			{{ t('options.debug.label') }}
			<span class="d-block text-gray text-small">{{ t('options.debug.description') }}</span>
		</label>
		<div class="action">
			<ts-switch v-model="options.debug" id="debug" />
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { options } = inject('engine');

const { t } = useI18n();
</script>
