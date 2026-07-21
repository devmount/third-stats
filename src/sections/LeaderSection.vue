<template>
	<div class="tab-area">
		<SectionTabHeader
			v-model:tab="tabLeader"
			:tabs="tabsLeader"
			:tab-color-class="leaderTabColorClass"
		/>
		<div class="tab-content mt-1">
			<!-- contacts most emails received from -->
			<BarChart
				v-if="tabLeader === tabsLeader.contactsReceived && receivedContactLeadersChartDataExists"
				:datasets="receivedContactLeadersChartData.datasets"
				:labels="receivedContactLeadersChartData.labels"
				:horizontal="true"
			/>
			<div v-if="tabLeader === tabsLeader.contactsReceived && !receivedContactLeadersChartDataExists" class="tab-empty text-center mt-5">
				<svg class="icon icon-large icon-gray icon-thin d-block m-0-auto" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
					<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
					<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
					<line x1="3" y1="3" x2="21" y2="21" />
				</svg>
				<div class="text-gray mt-1" v-html="t('stats.charts.contactsReceived.empty')"></div>
			</div>
			<!-- contacts most emails sent to -->
			<BarChart
				v-if="tabLeader === tabsLeader.contactsSent && sentContactLeadersChartDataExists"
				:datasets="sentContactLeadersChartData.datasets"
				:labels="sentContactLeadersChartData.labels"
				:horizontal="true"
			/>
			<div v-if="tabLeader === tabsLeader.contactsSent && !sentContactLeadersChartDataExists" class="tab-empty text-center mt-5">
				<svg class="icon icon-large icon-gray icon-thin d-block m-0-auto" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
					<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
					<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
					<line x1="3" y1="3" x2="21" y2="21" />
				</svg>
				<div class="text-gray mt-1" v-html="t('stats.charts.contactsSent.empty')"></div>
			</div>
			<!-- contacts flagged as junk -->
			<BarChart
				v-if="tabLeader === tabsLeader.contactsJunk && junkContactLeadersChartDataExists"
				:datasets="junkContactLeadersChartData.datasets"
				:labels="junkContactLeadersChartData.labels"
				:horizontal="true"
			/>
			<div v-if="tabLeader === tabsLeader.contactsJunk && !junkContactLeadersChartDataExists" class="tab-empty text-center mt-5">
				<svg class="icon icon-large icon-gray icon-thin d-block m-0-auto" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
					<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
					<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
					<line x1="3" y1="3" x2="21" y2="21" />
				</svg>
				<div class="text-gray mt-1" v-html="t('stats.charts.contactsJunk.empty')"></div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { tabsLeader } from '@/definitions.js';
import { useLeaderChartData } from '@/composables/useLeaderChartData.js';
import BarChart from '@/charts/BarChart.vue';
import SectionTabHeader from '@/parts/SectionTabHeader.vue';

const props = defineProps({
	display: { type: Object, required: true },
	options: { type: Object, required: true },
});

const { t } = useI18n();

// tab navigation local to this section
const tabLeader = ref(tabsLeader.contactsReceived);

const leaderTabColorClass = (key) => ({
	'border-bottom-accent1': key === 'contactsSent',
	'border-bottom-accent2': key === 'contactsReceived',
	'border-bottom-accent3': key === 'contactsJunk',
});

const {
	sentContactLeadersChartData,
	sentContactLeadersChartDataExists,
	receivedContactLeadersChartData,
	receivedContactLeadersChartDataExists,
	junkContactLeadersChartData,
	junkContactLeadersChartDataExists,
} = useLeaderChartData({
	display: toRef(props, 'display'),
	options: props.options,
	t,
});
</script>
