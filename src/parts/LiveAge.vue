<template>
	<span
		v-html="t('stats.dataCollected', ['<span class=\'text-normal\'>' + timePassedSinceDataRetrieval + '</span>'])"
	></span>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
	// date to show live aging for
	date: {
		type: Number,
	}
});

const now = ref(Date.now());
const repeater = ref();

onMounted(() => {
	// update timestamp every second
	repeater.value = setInterval(() => { now.value = Date.now() }, 1000);
});

onBeforeUnmount(() => {
	clearInterval(repeater.value);
});

// calculates the time between current and given timestamp with human readable time units
const timePassedSinceDataRetrieval = computed(() => {
	let secondsPast = (now.value - props.date) / 1000
	if (secondsPast < 60) return parseInt(secondsPast) + t("stats.abbreviations.second")
	if (secondsPast < 3600) return parseInt(secondsPast/60) + t("stats.abbreviations.minute")
	if (secondsPast <= 86400) return parseInt(secondsPast/3600) + t("stats.abbreviations.hour")
	if (secondsPast > 86400) return parseInt(secondsPast/86400) + t("stats.abbreviations.day")
});
</script>
