<template>
	<div class="entry">
		<label for="selfMessages">
			<div class="label-head">
				{{ t('options.selfMessages.label') }}
				<span class="note-icon" v-tooltip="t('options.note.refreshCacheRequired')">
					<ts-icon size="tiny">
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<path
							d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74"
						/>
						<path
							d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6"
						/>
						<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
						<line x1="3" y1="3" x2="21" y2="21" />
					</ts-icon>
				</span>
			</div>
			<div class="description">{{ t('options.selfMessages.description') }}</div>
		</label>
		<div class="action self-messages-row">
			<ts-select class="self-messages-select" v-model="options.selfMessages" id="selfMessages">
				<option v-for="val in selfMessagesOptions" :key="val" :value="val">
					{{ t(`options.selfMessages.values.${val}`) }}
				</option>
			</ts-select>
			<div class="hint">
				<div>
					<ts-icon size="small" class="hint-icon">
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<line x1="12" y1="8" x2="12.01" y2="8" />
						<rect x="4" y="4" width="16" height="16" rx="2" />
						<polyline points="11 12 12 12 12 16 13 16" />
					</ts-icon>
				</div>
				<span class="small-text">{{ t(`options.selfMessages.info.${options.selfMessages}`) }}</span>
			</div>
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { options, selfMessagesOptions } = inject('engine');

const { t } = useI18n();
</script>

<style scoped>
.self-messages-row {
	display: flex;
	flex-wrap: wrap;
}

.self-messages-select {
	flex-grow: 1;
	margin-bottom: 0.5rem;
}
</style>
