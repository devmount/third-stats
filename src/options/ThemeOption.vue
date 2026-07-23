<template>
	<div class="entry">
		<label for="theme">
			{{ t('options.theme.label') }}
			<span class="description">{{ t('options.theme.description') }}</span>
		</label>
		<div class="action action-row">
			<ts-select class="action-select" v-model="options.theme" id="theme">
				<option v-for="theme in ['system', 'light', 'dark']" :key="theme" :value="theme">
					{{ t(`options.theme.${theme}`) }}
				</option>
			</ts-select>
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { options } = inject('engine');

const { t } = useI18n();
</script>

<style scoped>
.action-row {
	display: flex;
}

.action-select {
	flex-grow: 1;
}
</style>
