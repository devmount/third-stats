<template>
	<div class="entry">
		<label for="tagColors">
			{{ t('options.tagColors.label') }}
			<span class="d-block text-gray text-small">{{ t('options.tagColors.description') }}</span>
		</label>
		<div class="action d-flex">
			<ts-switch v-model="options.tagColors" id="tagColors" />
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { options } = inject('engine');

const { t } = useI18n();
</script>
