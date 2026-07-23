<template>
	<div v-show="!preferences.sections.total.expand" class="tab-area">
		<div class="year-nav">
			<div
				class="year-step"
				:class="{ enabled: preferences.sections.activity.year > minYear }"
				@click.prevent="previousYear()"
			>
				<ts-icon
					weight="bold"
					variant="gray-alt"
					hover-accent
					:class="{ hidden: preferences.sections.activity.year <= minYear }"
				>
					<path stroke="none" d="M0 0h24v24H0z" fill="none" />
					<polyline class="icon-part-accent2" points="15 6 9 12 15 18" />
				</ts-icon>
			</div>
			<ts-select v-model="preferences.sections.activity.year" name="year">
				<option v-for="y in yearsList" :key="y" :value="y">{{ y }}</option>
			</ts-select>
			<div
				class="year-step"
				:class="{ enabled: preferences.sections.activity.year < maxYear }"
				@click.prevent="nextYear()"
			>
				<ts-icon
					weight="bold"
					variant="gray-alt"
					hover-accent
					:class="{ hidden: preferences.sections.activity.year >= maxYear }"
				>
					<path stroke="none" d="M0 0h24v24H0z" fill="none" />
					<polyline class="icon-part-accent2" points="9 6 15 12 9 18" />
				</ts-icon>
			</div>
		</div>
		<section-tab-header v-model:tab="tabActivity" :tabs="tabsActivity" border-variant="static-gradient">
			<template #label="{ labelKey }">
				{{
					preferences.sections.activity.year == new Date().getFullYear()
						? t(`stats.charts.${labelKey}.latestActivity`)
						: t(`stats.charts.${labelKey}.title`, [preferences.sections.activity.year])
				}}
			</template>
		</section-tab-header>
		<div class="tab-content chart-group">
			<!-- activity per day received -->
			<matrix-chart
				cid="activity-received"
				color="#0a84ff"
				:spacing="1"
				:rounding="5"
				:dimension="{ cols: 53, rows: 7 }"
				:parseTime="true"
				:datasets="[dateChartData.received]"
			/>
			<!-- activity per day sent -->
			<matrix-chart
				cid="activity-send"
				color="#e64db9"
				:spacing="1"
				:rounding="5"
				:parseTime="true"
				:dimension="{ cols: 53, rows: 7 }"
				:datasets="[dateChartData.sent]"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { tabsActivity } from '@/definitions.js';
import { useActivityChartData } from '@/composables/useActivityChartData.js';
import MatrixChart from '@/charts/MatrixChart.vue';
import SectionTabHeader from '@/parts/SectionTabHeader.vue';

const { display, preferences, minYear, maxYear, yearsList, nextYear, previousYear } = inject('engine');

const { t } = useI18n();

// tab navigation local to this section
const tabActivity = ref(tabsActivity.days);

const { dateChartData } = useActivityChartData({ display, activityPrefs: preferences.sections.activity, t });
</script>

<style scoped>
.tab-area {
	position: relative;
}

.year-nav {
	position: absolute;
	top: 0.5rem;
	right: 0.5rem;
	display: flex;
	gap: 0.5rem;
}

.year-step {
	display: inline-flex;
	align-self: center;
}

.year-step.enabled {
	cursor: pointer;
}

.hidden {
	visibility: hidden;
}
</style>
