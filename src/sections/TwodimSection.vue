<template>
	<div class="tab-area">
		<SectionTabHeader :tab="tabTwodim" :tabs="tabsTwodim" border-variant="static-gradient" />
		<div class="tab-content chart-group mt-1">
			<!-- emails per weekday per hour received -->
			<MatrixChart
				cid="wd-per-hour-received"
				color="#0a84ff"
				:spacing="1"
				:rounding="5"
				:dimension="{ cols: 24, rows: 7 }"
				:parseTime="false"
				:datasets="[weekdayPerHourChartData.received]"
			/>
			<!-- emails per weekday per hour sent -->
			<MatrixChart
				cid="wd-per-hour-send"
				color="#e64db9"
				:spacing="1"
				:rounding="5"
				:dimension="{ cols: 24, rows: 7 }"
				:parseTime="false"
				:datasets="[weekdayPerHourChartData.sent]"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { tabsTwodim } from '@/definitions.js';
import { useTwodimChartData } from '@/composables/useTwodimChartData.js';
import MatrixChart from '@/charts/MatrixChart.vue';
import SectionTabHeader from '@/parts/SectionTabHeader.vue';

const props = defineProps({
	display: { type: Object, required: true },
});

const { t } = useI18n();

// tab navigation local to this section (single-entry tab enum, kept for template consistency)
const tabTwodim = ref(tabsTwodim.temporalDistribution);

const { weekdayPerHourChartData } = useTwodimChartData({
	display: toRef(props, 'display'),
	t,
});
</script>
