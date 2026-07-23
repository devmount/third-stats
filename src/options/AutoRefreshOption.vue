<template>
	<div class="entry">
		<label for="autoRefresh">
			<div class="label-head">
				{{ t('options.autoRefresh.label') }}
				<span class="note-icon" v-tooltip="t('options.note.reloadWindowRequired')">
					<ts-icon size="tiny">
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
						<path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
						<line x1="12" y1="9" x2="12" y2="12" />
						<line x1="12" y1="15" x2="12.01" y2="15" />
					</ts-icon>
				</span>
			</div>
			<div class="description">{{ t('options.autoRefresh.description') }}</div>
		</label>
		<div class="action refresh-row">
			<ts-switch v-model="options.autoRefresh" id="autoRefresh" class="refresh-switch" />
			<ts-input-group v-if="options.autoRefresh" class="action interval-group">
				<div class="interval-wrapper" :data-unit="t('stats.abbreviations.minute')">
					<ts-char-input
						class="interval-input"
						id="autoRefreshInterval"
						type="number"
						v-model="options.autoRefreshInterval"
						placeholder="30"
						min="5"
						@change="checkAutoRefreshInterval()"
					/>
				</div>
				<div class="stepper button-group-vertical">
					<ts-button @click="incrementAutoRefreshInterval()" class="stepper-button">
						<ts-icon size="small" weight="bold" view-box="0 0 24 20" class="stepper-icon">
							<polyline points="6,12 12,6 18,12" />
						</ts-icon>
					</ts-button>
					<ts-button @click="decrementAutoRefreshInterval()" class="stepper-button">
						<ts-icon size="small" weight="bold" view-box="0 0 24 20" class="stepper-icon">
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

<style scoped>
.refresh-row {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.refresh-switch {
	flex-shrink: 0;
}

.interval-group {
	display: flex;
	flex-grow: 1;
}

.interval-wrapper {
	display: flex;
	flex-grow: 1;
	position: relative;
}

.interval-wrapper::after {
	position: absolute;
	content: attr(data-unit);
	right: 0.5rem;
	top: 50%;
	transform: translateY(-50%);
	z-index: 50;
}

.interval-input {
	flex-grow: 1;
}

.stepper {
	display: flex;
	flex-direction: column;
}

.stepper-button {
	height: 1.25rem;
	padding-top: 0;
	padding-bottom: 0;
	padding-left: 0.5rem;
	padding-right: 0.5rem;
}

.stepper-icon {
	display: block;
	margin: 0 auto;
}
</style>
