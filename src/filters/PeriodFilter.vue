<template>
	<div class="filter-period">
		<label for="start" class="text-gray p-0-5">{{ t('stats.timePeriod') }}</label>
		<ts-input-group class="d-flex">
			<div
				class="d-flex"
				v-for="f in ['start', 'end']"
				:key="f"
				v-tooltip="{
					text:
						error.period[f].length > 0
							? error.period[f].join('\n')
							: t('stats.tooltips.period.' + f, [examplePeriodShort, examplePeriodFormatted]),
					position: 'bottom',
					error: error.period[f].length > 0,
				}"
			>
				<ts-char-input
					type="text"
					:id="f"
					v-model="active.period[f]"
					class="w-6"
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
			<ts-button
				variant="secondary"
				class="w-3 h-2-5"
				:class="{ 'cursor-na': isLoading }"
				:disabled="isLoading"
				@click="!isLoading ? updatePeriod() : null"
			>
				<ts-icon size="small" weight="bold" class="d-block m-0-auto">
					<path stroke="none" d="M0 0h24v24H0z" fill="none" />
					<path d="M5 12l5 5l10 -10" />
				</ts-icon>
			</ts-button>
		</ts-input-group>
		<div
			class="cursor-pointer d-inline-flex"
			:class="{ 'cursor-na': isLoading }"
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
</style>
