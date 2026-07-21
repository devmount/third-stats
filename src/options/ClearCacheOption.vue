<template>
	<div class="entry">
		<label>
			{{ t('options.clearCache.label') }}
			<span class="d-block text-gray text-small">{{ t('options.clearCache.description') }}</span>
		</label>
		<div class="action">
			<button @click="clearCache" class="mb-0-5">{{ t('options.clearCache.label') }}</button>
			<div class="d-flex gap-0-5 align-items-center text-gray">
				<div>
					<svg class="icon icon-small text-middle" viewBox="0 0 24 24">
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<line x1="12" y1="8" x2="12.01" y2="8" />
						<rect x="4" y="4" width="16" height="16" rx="2" />
						<polyline points="11 12 12 12 12 16 13 16" />
					</svg>
				</div>
				<span class="text-small" v-if="cacheSize > 0">{{ t('options.clearCache.size', [formattedCacheSize]) }}</span>
				<span class="text-small" v-else>{{ t('options.clearCache.empty') }}</span>
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
