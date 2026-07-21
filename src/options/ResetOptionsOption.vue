<template>
	<div class="entry">
		<label>
			<div class="d-flex align-items-end gap-0-5">
				{{ t('options.resetOptions.label') }}
				<span class="tooltip text-gray mb--0-25" :data-tooltip="t('options.note.reloadWindowRequired')">
					<svg class="icon icon-tiny" viewBox="0 0 24 24">
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
						<path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
						<line x1="12" y1="9" x2="12" y2="12" />
						<line x1="12" y1="15" x2="12.01" y2="15" />
					</svg>
				</span>
				<span class="tooltip text-gray mb--0-25" :data-tooltip="t('options.note.refreshCacheRequired')">
					<svg class="icon icon-tiny" viewBox="0 0 24 24">
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<path
							d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74"
						/>
						<path
							d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6"
						/>
						<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
						<line x1="3" y1="3" x2="21" y2="21" />
					</svg>
				</span>
			</div>
			<div class="text-gray text-small">{{ t('options.resetOptions.description') }}</div>
		</label>
		<div class="action">
			<button @click="resetOptions" class="mb-0-5">{{ t('options.resetOptions.label') }}</button>
			<div v-if="options.addresses && options.addresses.length > 0" class="d-flex gap-0-5 align-items-center text-gray">
				<div>
					<svg class="icon icon-small text-middle" viewBox="0 0 24 24">
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<line x1="12" y1="8" x2="12.01" y2="8" />
						<rect x="4" y="4" width="16" height="16" rx="2" />
						<polyline points="11 12 12 12 12 16 13 16" />
					</svg>
				</div>
				<span class="text-small">{{ t('options.resetOptions.removeIdentities') }}</span>
			</div>
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { options, resetOptions } = inject('engine');

const { t } = useI18n();
</script>
