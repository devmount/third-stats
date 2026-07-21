<template>
	<div class="entry">
		<label for="tagColors">
			{{ t('options.tagColors.label') }}
			<span class="d-block text-gray text-small">{{ t('options.tagColors.description') }}</span>
		</label>
		<div class="action d-flex">
			<label class="switch">
				<input type="checkbox" id="tagColors" v-model="options.tagColors" />
				<span class="switch-label" :data-on="t('options.switch.on')" :data-off="t('options.switch.off')"></span>
				<span class="switch-handle"></span>
			</label>
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { options } = inject('engine');

const { t } = useI18n();
</script>
