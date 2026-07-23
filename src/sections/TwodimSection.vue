<template>
	<div class="tab-area">
		<section-tab-header :tab="tabTwodim" :tabs="tabsTwodim" border-variant="static-gradient" />
		<div class="tab-content chart-group">
			<!-- emails per weekday per hour received -->
			<matrix-chart
				cid="wd-per-hour-received"
				color="#0a84ff"
				:spacing="1"
				:rounding="5"
				:dimension="{ cols: 24, rows: 7 }"
				:parseTime="false"
				:datasets="[weekdayPerHourChartData.received]"
				:weekday-labels="weekdayLabels"
			/>
			<!-- emails per weekday per hour sent -->
			<matrix-chart
				cid="wd-per-hour-send"
				color="#e64db9"
				:spacing="1"
				:rounding="5"
				:dimension="{ cols: 24, rows: 7 }"
				:parseTime="false"
				:datasets="[weekdayPerHourChartData.sent]"
				:weekday-labels="weekdayLabels"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { tabsTwodim } from '@/definitions.js';
import { rotateArray, weekdayNames } from '@/utils.js';
import { useTwodimChartData } from '@/composables/useTwodimChartData.js';
import MatrixChart from '@/charts/MatrixChart.vue';
import SectionTabHeader from '@/parts/SectionTabHeader.vue';

const { display, options } = inject('engine');

const { t, locale } = useI18n();

// tab navigation local to this section (single-entry tab enum, kept for template consistency)
const tabTwodim = ref(tabsTwodim.temporalDistribution);

const { weekdayPerHourChartData } = useTwodimChartData({ display, t });

// weekday row order for the matrix charts, respecting the configured start of week
const weekdayLabels = computed(() => rotateArray(weekdayNames(locale.value), options.startOfWeek));
</script>
