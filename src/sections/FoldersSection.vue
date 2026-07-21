<template>
	<div class="tab-area" v-if="display.folders">
		<SectionTabHeader :tab="tabFolders" :tabs="tabsFolders" border-variant="static-gradient" />
		<div class="tab-content mt-1">
			<!-- folders emails received -->
			<DoughnutChart
				:info="{
					number: foldersChartData.labels.length,
					label: t('stats.nonEmptyFolders', foldersChartData.labels.length),
				}"
				:datasets="foldersChartData.datasets"
				:labels="foldersChartData.labels"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { tabsFolders } from '@/definitions.js';
import { useFoldersChartData } from '@/composables/useFoldersChartData.js';
import DoughnutChart from '@/charts/DoughnutChart.vue';
import SectionTabHeader from '@/parts/SectionTabHeader.vue';

const props = defineProps({
	display: { type: Object, required: true },
});

const { t, locale } = useI18n();

// tab navigation local to this section (single-entry tab enum, kept for template consistency)
const tabFolders = ref(tabsFolders.foldersDistribution);

const { foldersChartData } = useFoldersChartData({
	display: toRef(props, 'display'),
	locale,
	t,
});
</script>
