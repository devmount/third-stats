<template>
	<div class="tab-area">
		<SectionTabHeader
			v-model:tab="tabOnedim"
			v-model:comparison="preferences.sections.onedim.comparison"
			:tabs="tabsOnedim"
			border-variant="gradient"
			show-comparison-toggle
			:comparison-tooltip="tooltipAccountComparison('onedim')"
			:single-account="singleAccount"
			:accounts-color-gradient="accountsColorGradient"
		/>
		<div class="tab-content mt-1">
			<!-- emails per time of day -->
			<BarChart
				v-if="tabOnedim === tabsOnedim.daytime && !preferences.sections.onedim.comparison"
				:datasets="daytimeChartData.datasets"
				:labels="daytimeChartData.labels"
				:ordinate="options.ordinate"
			/>
			<BarChart
				v-if="tabOnedim === tabsOnedim.daytime && preferences.sections.onedim.comparison"
				:datasets="daytimeComparedChartData.datasets"
				:labels="daytimeComparedChartData.labels"
				:ordinate="options.ordinate"
			/>
			<!-- emails per day of week -->
			<BarChart
				v-if="tabOnedim === tabsOnedim.weekday && !preferences.sections.onedim.comparison"
				:datasets="weekdayChartData.datasets"
				:labels="weekdayChartData.labels"
				:ordinate="options.ordinate"
			/>
			<BarChart
				v-if="tabOnedim === tabsOnedim.weekday && preferences.sections.onedim.comparison"
				:datasets="weekdayComparedChartData.datasets"
				:labels="weekdayComparedChartData.labels"
				:ordinate="options.ordinate"
			/>
			<!-- emails per month of year -->
			<BarChart
				v-if="tabOnedim === tabsOnedim.month && !preferences.sections.onedim.comparison"
				:datasets="monthChartData.datasets"
				:labels="monthChartData.labels"
				:ordinate="options.ordinate"
			/>
			<BarChart
				v-if="tabOnedim === tabsOnedim.month && preferences.sections.onedim.comparison"
				:datasets="monthComparedChartData.datasets"
				:labels="monthComparedChartData.labels"
				:ordinate="options.ordinate"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { tabsOnedim } from '@/definitions.js';
import { useOnedimChartData } from '@/composables/useOnedimChartData.js';
import BarChart from '@/charts/BarChart.vue';
import SectionTabHeader from '@/parts/SectionTabHeader.vue';

const props = defineProps({
	display: { type: Object, required: true },
	comparison: { type: Object, required: true },
	accounts: { type: Array, required: true },
	options: { type: Object, required: true },
	preferences: { type: Object, required: true },
	singleAccount: { type: Boolean, required: true },
	accountsColorGradient: { type: String, required: true },
	tooltipAccountComparison: { type: Function, required: true },
});

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
} = useOnedimChartData({
	display: toRef(props, 'display'),
	comparison: toRef(props, 'comparison'),
	accounts: toRef(props, 'accounts'),
	options: props.options,
	t,
	locale,
});
</script>
