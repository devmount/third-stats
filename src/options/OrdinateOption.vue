<template>
	<div class="entry">
		<label for="ordinate">
			{{ t('options.ordinate.label') }}
			<span class="description">{{ t('options.ordinate.description') }}</span>
		</label>
		<div class="action">
			<ts-switch v-model="options.ordinate" id="ordinate" />
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { options } = inject('engine');

const { t } = useI18n();
</script>
