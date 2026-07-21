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
		<div class="tab-content mt-1">
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
import { ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { tabsTotal } from '@/definitions.js';
import { useTotalChartData } from '@/composables/useTotalChartData.js';
import LineChart from '@/charts/LineChart.vue';
import SectionTabHeader from '@/parts/SectionTabHeader.vue';

const props = defineProps({
	display: { type: Object, required: true },
	comparison: { type: Object, required: true },
	accounts: { type: Array, required: true },
	options: { type: Object, required: true },
	minYear: { type: Number, required: true },
	maxYear: { type: Number, required: true },
	minDate: { type: Date, required: true },
	maxDate: { type: Date, required: true },
	preferences: { type: Object, required: true },
	singleAccount: { type: Boolean, required: true },
	accountsColorGradient: { type: String, required: true },
	tooltipAccountComparison: { type: Function, required: true },
	unfinished: { type: Boolean, required: true },
});

const { t, locale } = useI18n();

// tab navigation local to this section
const tabTotal = ref(tabsTotal.years);

const {
	yearsChartData,
	yearsComparedChartData,
	quartersChartData,
	quartersComparedChartData,
	monthsChartData,
	monthsComparedChartData,
	weeksChartData,
	weeksComparedChartData,
} = useTotalChartData({
	display: toRef(props, 'display'),
	comparison: toRef(props, 'comparison'),
	accounts: toRef(props, 'accounts'),
	options: props.options,
	minYear: toRef(props, 'minYear'),
	maxYear: toRef(props, 'maxYear'),
	minDate: toRef(props, 'minDate'),
	maxDate: toRef(props, 'maxDate'),
	t,
	locale,
});
</script>
