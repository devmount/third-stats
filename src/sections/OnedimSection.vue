<template>
	<div class="tab-area">
		<section-tab-header
			v-model:tab="tabOnedim"
			v-model:comparison="preferences.sections.onedim.comparison"
			:tabs="tabsOnedim"
			border-variant="gradient"
			show-comparison-toggle
			:comparison-tooltip="tooltipAccountComparison('onedim')"
			:single-account="singleAccount"
			:accounts-color-gradient="accountsColorGradient"
		/>
		<div class="tab-content">
			<!-- emails per time of day -->
			<bar-chart
				v-if="tabOnedim === tabsOnedim.daytime && !preferences.sections.onedim.comparison"
				:datasets="daytimeChartData.datasets"
				:labels="daytimeChartData.labels"
				:ordinate="options.ordinate"
			/>
			<bar-chart
				v-if="tabOnedim === tabsOnedim.daytime && preferences.sections.onedim.comparison"
				:datasets="daytimeComparedChartData.datasets"
				:labels="daytimeComparedChartData.labels"
				:ordinate="options.ordinate"
			/>
			<!-- emails per day of week -->
			<bar-chart
				v-if="tabOnedim === tabsOnedim.weekday && !preferences.sections.onedim.comparison"
				:datasets="weekdayChartData.datasets"
				:labels="weekdayChartData.labels"
				:ordinate="options.ordinate"
			/>
			<bar-chart
				v-if="tabOnedim === tabsOnedim.weekday && preferences.sections.onedim.comparison"
				:datasets="weekdayComparedChartData.datasets"
				:labels="weekdayComparedChartData.labels"
				:ordinate="options.ordinate"
			/>
			<!-- emails per month of year -->
			<bar-chart
				v-if="tabOnedim === tabsOnedim.month && !preferences.sections.onedim.comparison"
				:datasets="monthChartData.datasets"
				:labels="monthChartData.labels"
				:ordinate="options.ordinate"
			/>
			<bar-chart
				v-if="tabOnedim === tabsOnedim.month && preferences.sections.onedim.comparison"
				:datasets="monthComparedChartData.datasets"
				:labels="monthComparedChartData.labels"
				:ordinate="options.ordinate"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { tabsOnedim } from '@/definitions.js';
import { useOnedimChartData } from '@/composables/useOnedimChartData.js';
import BarChart from '@/charts/BarChart.vue';
import SectionTabHeader from '@/parts/SectionTabHeader.vue';

const {
	display,
	comparison,
	accounts,
	options,
	preferences,
	singleAccount,
	accountsColorGradient,
	tooltipAccountComparison,
} = inject('engine');

const { t, locale } = useI18n();

// tab navigation local to this section
const tabOnedim = ref(tabsOnedim.daytime);

const {
	daytimeChartData,
	daytimeComparedChartData,
	weekdayChartData,
	weekdayComparedChartData,
	monthChartData,
	monthComparedChartData,
} = useOnedimChartData({ display, comparison, accounts, options, t, locale });
</script>
