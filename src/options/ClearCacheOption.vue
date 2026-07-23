<template>
	<div class="entry">
		<label>
			{{ t('options.clearCache.label') }}
			<span class="description">{{ t('options.clearCache.description') }}</span>
		</label>
		<div class="action">
			<ts-button @click="clearCache" class="clear-button">{{ t('options.clearCache.label') }}</ts-button>
			<div class="hint">
				<div>
					<ts-icon size="small" class="hint-icon">
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<line x1="12" y1="8" x2="12.01" y2="8" />
						<rect x="4" y="4" width="16" height="16" rx="2" />
						<polyline points="11 12 12 12 12 16 13 16" />
					</ts-icon>
				</div>
				<span class="small-text" v-if="cacheSize > 0">{{ t('options.clearCache.size', [formattedCacheSize]) }}</span>
				<span class="small-text" v-else>{{ t('options.clearCache.empty') }}</span>
			</div>
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { cacheSize, formattedCacheSize, clearCache } = inject('engine');

const { t } = useI18n();
</script>

<style scoped>
.clear-button {
	margin-bottom: 0.5rem;
}
</style>
