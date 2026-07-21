<template>
	<div v-show="!preferences.sections.total.expand" class="tab-area position-relative">
		<div class="position-absolute top-0-5 right-0-5 d-flex gap-0-5">
			<div
				class="d-inline-flex align-center"
				:class="{ 'cursor-pointer': preferences.sections.activity.year > minYear }"
				@click.prevent="previousYear()"
			>
				<svg
					class="icon icon-bold icon-gray-alt icon-hover-accent"
					:class="{ 'v-hidden': preferences.sections.activity.year <= minYear }"
					viewBox="0 0 24 24"
				>
					<path stroke="none" d="M0 0h24v24H0z" fill="none" />
					<polyline class="icon-part-accent2" points="15 6 9 12 15 18" />
				</svg>
			</div>
			<select v-model="preferences.sections.activity.year" name="year">
				<option v-for="y in yearsList" :key="y" :value="y">{{ y }}</option>
			</select>
			<div
				class="d-inline-flex align-center"
				:class="{ 'cursor-pointer': preferences.sections.activity.year < maxYear }"
				@click.prevent="nextYear()"
			>
				<svg
					class="icon icon-bold icon-gray-alt icon-hover-accent"
					:class="{ 'v-hidden': preferences.sections.activity.year >= maxYear }"
					viewBox="0 0 24 24"
				>
					<path stroke="none" d="M0 0h24v24H0z" fill="none" />
					<polyline class="icon-part-accent2" points="9 6 15 12 9 18" />
				</svg>
			</div>
		</div>
		<section-tab-header v-model:tab="tabActivity" :tabs="tabsActivity" border-variant="static-gradient">
			<template #label="{ labelKey }">
				{{
					preferences.sections.activity.year == new Date().getFullYear()
						? t('stats.charts.' + labelKey + '.latestActivity')
						: t('stats.charts.' + labelKey + '.title', [preferences.sections.activity.year])
				}}
			</template>
		</section-tab-header>
		<div class="tab-content chart-group mt-1">
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
import { ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { tabsActivity } from '@/definitions.js';
import { useActivityChartData } from '@/composables/useActivityChartData.js';
import MatrixChart from '@/charts/MatrixChart.vue';
import SectionTabHeader from '@/parts/SectionTabHeader.vue';

const props = defineProps({
	display: { type: Object, required: true },
	preferences: { type: Object, required: true },
	minYear: { type: Number, required: true },
	maxYear: { type: Number, required: true },
	yearsList: { type: Array, required: true },
	nextYear: { type: Function, required: true },
	previousYear: { type: Function, required: true },
});

const { t } = useI18n();

// tab navigation local to this section
const tabActivity = ref(tabsActivity.days);

const { dateChartData } = useActivityChartData({
	display: toRef(props, 'display'),
	activityPrefs: props.preferences.sections.activity,
	t,
});
</script>
