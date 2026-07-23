<template>
	<div class="entry">
		<label for="liveCountUp">
			{{ t('options.liveCountUp.label') }}
			<span class="description">{{ t('options.liveCountUp.description') }}</span>
		</label>
		<div class="action">
			<ts-switch v-model="options.liveCountUp" id="liveCountUp" class="count-up-switch" />
			<div class="hint">
				<div>
					<ts-icon size="small" class="hint-icon">
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<line x1="12" y1="8" x2="12.01" y2="8" />
						<rect x="4" y="4" width="16" height="16" rx="2" />
						<polyline points="11 12 12 12 12 16 13 16" />
					</ts-icon>
				</div>
				<span class="small-text">{{ t('options.liveCountUp.info') }}</span>
			</div>
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
.count-up-switch {
	margin-bottom: 0.5rem;
}
</style>
