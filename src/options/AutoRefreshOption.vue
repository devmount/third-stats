<template>
	<div class="entry">
		<label for="autoRefresh">
			<div class="d-flex align-items-end gap-0-5">
				{{ t('options.autoRefresh.label') }}
				<span class="text-gray mb--0-25" v-tooltip="t('options.note.reloadWindowRequired')">
					<ts-icon size="tiny">
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
						<path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
						<line x1="12" y1="9" x2="12" y2="12" />
						<line x1="12" y1="15" x2="12.01" y2="15" />
					</ts-icon>
				</span>
			</div>
			<div class="text-gray text-small">{{ t('options.autoRefresh.description') }}</div>
		</label>
		<div class="action d-flex align-items-center gap-1">
			<ts-switch v-model="options.autoRefresh" id="autoRefresh" class="flex-no-shrink" />
			<ts-input-group v-if="options.autoRefresh" class="action d-flex flex-grow">
				<div class="d-flex flex-grow" :data-unit="t('stats.abbreviations.minute')">
					<ts-char-input
						class="flex-grow"
						id="autoRefreshInterval"
						type="number"
						v-model="options.autoRefreshInterval"
						placeholder="30"
						min="5"
						@change="checkAutoRefreshInterval()"
					/>
				</div>
				<div class="d-flex flex-direction-column button-group-vertical">
					<ts-button @click="incrementAutoRefreshInterval()" class="h-1-25 py-0 px-0-5">
						<ts-icon size="small" weight="bold" view-box="0 0 24 20" class="d-block m-0-auto">
							<polyline points="6,12 12,6 18,12" />
						</ts-icon>
					</ts-button>
					<ts-button @click="decrementAutoRefreshInterval()" class="h-1-25 py-0 px-0-5">
						<ts-icon size="small" weight="bold" view-box="0 0 24 20" class="d-block m-0-auto">
							<polyline points="6,5 12,11 18,5" />
						</ts-icon>
					</ts-button>
				</div>
			</ts-input-group>
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { options, incrementAutoRefreshInterval, decrementAutoRefreshInterval, checkAutoRefreshInterval } =
	inject('engine');

const { t } = useI18n();
</script>
