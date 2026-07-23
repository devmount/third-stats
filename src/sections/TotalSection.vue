<template>
	<div class="tab-area">
		<section-tab-header
			v-model:tab="tabTotal"
			v-model:comparison="preferences.sections.total.comparison"
			v-model:expand="preferences.sections.total.expand"
			:tabs="tabsTotal"
			tab-item-class="border-bottom-accent2"
			border-variant="gradient"
			show-comparison-toggle
			:comparison-tooltip="tooltipAccountComparison('total')"
			:single-account="singleAccount"
			:accounts-color-gradient="accountsColorGradient"
			show-expand-toggle
		/>
		<div class="tab-content">
			<!-- emails per year over total time -->
			<line-chart
				v-if="tabTotal === tabsTotal.years && !preferences.sections.total.comparison"
				:datasets="yearsChartData.datasets"
				:labels="yearsChartData.labels"
				:ordinate="options.ordinate"
				:abscissa="true"
				:unfinished="unfinished"
			/>
			<line-chart
				v-if="tabTotal === tabsTotal.years && preferences.sections.total.comparison"
				:datasets="yearsComparedChartData.datasets"
				:labels="yearsComparedChartData.labels"
				:ordinate="options.ordinate"
				:abscissa="true"
				:unfinished="unfinished"
			/>
			<!-- emails per quarter over total time -->
			<line-chart
				v-if="tabTotal === tabsTotal.quarters && !preferences.sections.total.comparison"
				:datasets="quartersChartData.datasets"
				:labels="quartersChartData.labels"
				:ordinate="options.ordinate"
				:abscissa="true"
				:unfinished="unfinished"
			/>
			<line-chart
				v-if="tabTotal === tabsTotal.quarters && preferences.sections.total.comparison"
				:datasets="quartersComparedChartData.datasets"
				:labels="quartersComparedChartData.labels"
				:ordinate="options.ordinate"
				:abscissa="true"
				:unfinished="unfinished"
			/>
			<!-- emails per month over total time -->
			<line-chart
				v-if="tabTotal === tabsTotal.months && !preferences.sections.total.comparison"
				:datasets="monthsChartData.datasets"
				:labels="monthsChartData.labels"
				:ordinate="options.ordinate"
				:abscissa="true"
				:unfinished="unfinished"
			/>
			<line-chart
				v-if="tabTotal === tabsTotal.months && preferences.sections.total.comparison"
				:datasets="monthsComparedChartData.datasets"
				:labels="monthsComparedChartData.labels"
				:ordinate="options.ordinate"
				:abscissa="true"
				:unfinished="unfinished"
			/>
			<!-- emails per week over total time -->
			<line-chart
				v-if="tabTotal === tabsTotal.weeks && !preferences.sections.total.comparison"
				:datasets="weeksChartData.datasets"
				:labels="weeksChartData.labels"
				:ordinate="options.ordinate"
				:abscissa="true"
				:unfinished="unfinished"
			/>
			<line-chart
				v-if="tabTotal === tabsTotal.weeks && preferences.sections.total.comparison"
				:datasets="weeksComparedChartData.datasets"
				:labels="weeksComparedChartData.labels"
				:ordinate="options.ordinate"
				:abscissa="true"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { tabsTotal } from '@/definitions.js';
import { useTotalChartData } from '@/composables/useTotalChartData.js';
import LineChart from '@/charts/LineChart.vue';
import SectionTabHeader from '@/parts/SectionTabHeader.vue';

const {
	display,
	comparison,
	accounts,
	options,
	minYear,
	maxYear,
	minDate,
	maxDate,
	preferences,
	singleAccount,
	accountsColorGradient,
	tooltipAccountComparison,
	active,
} = inject('engine');

const { t, locale } = useI18n();

// tab navigation local to this section
const tabTotal = ref(tabsTotal.years);

// true while the current period has no end date set (chart's last segment is still "in progress")
const unfinished = computed(() => active.period.end == null);

const {
	yearsChartData,
	yearsComparedChartData,
	quartersChartData,
	quartersComparedChartData,
	monthsChartData,
	monthsComparedChartData,
	weeksChartData,
	weeksComparedChartData,
} = useTotalChartData({ display, comparison, accounts, options, minYear, maxYear, minDate, maxDate, t, locale });
</script>
