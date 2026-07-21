<template>
	<div class="entry">
		<label for="liveCountUp">
			{{ t('options.liveCountUp.label') }}
			<span class="d-block text-gray text-small">{{ t('options.liveCountUp.description') }}</span>
		</label>
		<div class="action">
			<label class="switch mb-0-5">
				<input type="checkbox" id="liveCountUp" v-model="options.liveCountUp" />
				<span class="switch-label" :data-on="t('options.switch.on')" :data-off="t('options.switch.off')"></span>
				<span class="switch-handle"></span>
			</label>
			<div class="d-flex gap-0-5 align-items-center text-gray">
				<div>
					<svg class="icon icon-small text-middle" viewBox="0 0 24 24">
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<line x1="12" y1="8" x2="12.01" y2="8" />
						<rect x="4" y="4" width="16" height="16" rx="2" />
						<polyline points="11 12 12 12 12 16 13 16" />
					</svg>
				</div>
				<span class="text-small">{{ t('options.liveCountUp.info') }}</span>
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
