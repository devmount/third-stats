<template>
	<div class="entry">
		<label for="maxListCount">
			<div class="d-flex align-items-end gap-0-5">
				{{ t('options.maxListCount.label') }}
				<span class="text-gray mb--0-25" v-tooltip="t('options.note.refreshCacheRequired')">
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
			<div class="text-gray text-small">{{ t('options.maxListCount.description') }}</div>
		</label>
		<ts-input-group class="action d-flex">
			<ts-char-input
				class="flex-grow"
				id="maxListCount"
				type="number"
				v-model="options.maxListCount"
				placeholder="20"
				min="1"
				max="999"
				@change="checkmaxListCount()"
			/>
			<div class="d-flex flex-direction-column button-group-vertical">
				<ts-button @click="incrementmaxListCount()" class="h-1-25 py-0 px-0-5">
					<ts-icon size="small" weight="bold" view-box="0 0 24 20" class="d-block m-0-auto">
						<polyline points="6,12 12,6 18,12" />
					</ts-icon>
				</ts-button>
				<ts-button @click="decrementmaxListCount()" class="h-1-25 py-0 px-0-5">
					<ts-icon size="small" weight="bold" view-box="0 0 24 20" class="d-block m-0-auto">
						<polyline points="6,5 12,11 18,5" />
					</ts-icon>
				</ts-button>
			</div>
		</ts-input-group>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { options, incrementmaxListCount, decrementmaxListCount, checkmaxListCount } = inject('engine');

const { t } = useI18n();
</script>
