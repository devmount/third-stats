<template>
	<div class="filter-period d-flex">
		<label for="start" class="align-center text-gray p-0-5">{{ t('stats.timePeriod') }}</label>
		<div class="input-group d-flex align-stretch">
			<div
				class="d-flex tooltip tooltip-bottom"
				v-for="f in ['start', 'end']"
				:key="f"
				:data-tooltip="
					error.period[f].length > 0
						? error.period[f].join('\n')
						: t('stats.tooltips.period.' + f, [examplePeriodShort, examplePeriodFormatted])
				"
				:class="{ 'tooltip-error': error.period[f].length > 0 }"
			>
				<input
					type="text"
					:id="f"
					v-model="active.period[f]"
					class="align-stretch w-6"
					:class="{ error: error.period[f].length > 0, 'cursor-na': isLoading }"
					:disabled="isLoading"
					placeholder="YYYY-MM-DD"
					@blur="formatPeriod(f)"
					@keyup.enter="
						formatPeriod(f);
						updatePeriod();
					"
				/>
			</div>
			<button
				class="button-secondary align-center p-0-5"
				:class="{ 'cursor-na': isLoading }"
				:disabled="isLoading"
				@click="!isLoading ? updatePeriod() : null"
			>
				<svg class="icon icon-small icon-bold d-block m-0-auto" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none" />
					<path d="M5 12l5 5l10 -10" />
				</svg>
			</button>
		</div>
		<div
			class="cursor-pointer tooltip tooltip-bottom d-inline-flex align-center"
			:class="{ 'cursor-na': isLoading }"
			:data-tooltip="t('stats.tooltips.clear')"
			:disabled="isLoading"
			@click="!isLoading ? resetPeriod(true) : null"
		>
			<svg class="icon icon-bold icon-gray" :class="{ 'icon-hover-accent': !isLoading }" viewBox="0 0 24 24">
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<line class="icon-part-accent2" x1="18" y1="6" x2="6" y2="18" />
				<line class="icon-part-accent2" x1="6" y1="6" x2="18" y2="18" />
			</svg>
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
