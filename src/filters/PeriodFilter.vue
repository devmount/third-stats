<template>
	<div class="filter-period">
		<label for="start" class="filter-label">{{ t('stats.timePeriod') }}</label>
		<ts-input-group class="period-group">
			<div
				class="period-field"
				v-for="f in ['start', 'end']"
				:key="f"
				v-tooltip="{
					text:
						error.period[f].length > 0
							? error.period[f].join('\n')
							: t(`stats.tooltips.period.${f}`, [examplePeriodShort, examplePeriodFormatted]),
					position: 'bottom',
					error: error.period[f].length > 0,
				}"
			>
				<ts-char-input
					type="text"
					:id="f"
					v-model="active.period[f]"
					class="period-input"
					:class="{ error: error.period[f].length > 0, disabled: isLoading }"
					:disabled="isLoading"
					placeholder="YYYY-MM-DD"
					@blur="formatPeriod(f)"
					@keyup.enter="
						formatPeriod(f);
						updatePeriod();
					"
				/>
			</div>
			<ts-button
				variant="secondary"
				class="apply-button"
				:disabled="isLoading"
				@click="!isLoading ? updatePeriod() : null"
			>
				<ts-icon size="small" weight="bold" class="apply-icon">
					<path stroke="none" d="M0 0h24v24H0z" fill="none" />
					<path d="M5 12l5 5l10 -10" />
				</ts-icon>
			</ts-button>
		</ts-input-group>
		<div
			class="clear-button"
			:class="{ disabled: isLoading }"
			v-tooltip="{ text: t('stats.tooltips.clear'), position: 'bottom' }"
			:disabled="isLoading"
			@click="!isLoading ? resetPeriod(true) : null"
		>
			<ts-icon weight="bold" variant="gray" :hover-accent="!isLoading">
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<line class="icon-part-accent2" x1="18" y1="6" x2="6" y2="18" />
				<line class="icon-part-accent2" x1="6" y1="6" x2="18" y2="18" />
			</ts-icon>
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { active, error, isLoading, formatPeriod, updatePeriod, resetPeriod } = inject('engine');

const { t } = useI18n();

// example date formats
const now = new Date();
// returns the current date as example for short period input (YYMMDD)
const examplePeriodShort = now.toISOString().replace(/-/g, '').slice(2, 8);
// returns the current date as example for formatted period input (YYYY-MM-DD)
const examplePeriodFormatted = now.toISOString().slice(0, 10);
</script>

<style scoped>
.filter-period {
	display: flex;
	justify-content: center;
	align-items: center;
}

.filter-label {
	color: var(--color-text-gray);
	padding: 0.5rem;
}

.period-group {
	display: flex;
}

.period-field {
	display: flex;
}

.period-input {
	width: 6rem;
}

.apply-button {
	width: 3rem;
	height: 2.5rem;
}

.apply-icon {
	display: block;
	margin: 0 auto;
}

.clear-button {
	cursor: pointer;
	display: inline-flex;
}

.clear-button.disabled {
	cursor: not-allowed;
}
</style>
