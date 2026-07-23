<template>
	<div class="entry" v-if="options.accounts">
		<label>
			<div class="label-head">
				{{ t('options.activeAccounts.label') }}
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
			<div class="description">
				{{ t('options.activeAccounts.description') }}
				{{ t('options.activeAccounts.color') }}<br />
				{{ t('options.activeAccounts.sumAndCompare') }}
			</div>
		</label>
		<div class="action">
			<div v-for="(a, i) in allAccounts" :key="i" class="account-row">
				<ts-checkbox v-model="options.accounts" :value="a.id" class="account-name">
					{{ a.name }}
				</ts-checkbox>
				<label :for="`color-${a.name}`" class="color-label">
					<ts-color-input :id="`color-${a.name}`" v-model="options.accountColors[a.id]" />
					<span class="color-value">{{ options.accountColors[a.id] }}</span>
				</label>
			</div>
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { options, allAccounts } = inject('engine');

const { t } = useI18n();
</script>

<style scoped>
.account-row {
	display: flex;
	justify-content: space-between;
}

.account-name {
	cursor: pointer;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	flex-grow: 0;
}

.color-label {
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.color-value {
	font-family: var(--font-mono);
	font-size: 0.75rem;
}
</style>
