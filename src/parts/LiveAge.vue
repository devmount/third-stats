<template>
	<span v-html="$t('stats.dataCollected', ['<span class=\'text-normal\'>' + timePassedSinceDataRetrieval + '</span>'])"></span>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    date: Number
	},
	data () {
		return {
			now: Date.now(),
			repeater: null
		}
	},
	created () {
		// update current timestamp
		this.repeater = setInterval(() => { this.now = Date.now() }, 1000)
	},
	beforeDestroy () {
		clearInterval(this.repeater)
	},
	computed: {
		// calculates the time between current and given timestamp with human readable time units
		timePassedSinceDataRetrieval () {
			let secondsPast = (this.now - this.date) / 1000
			if (secondsPast < 60) return parseInt(secondsPast) + this.$t("stats.abbreviations.second")
			if (secondsPast < 3600) return parseInt(secondsPast/60) + this.$t("stats.abbreviations.minute")
			if (secondsPast <= 86400) return parseInt(secondsPast/3600) + this.$t("stats.abbreviations.hour")
			if (secondsPast > 86400) return parseInt(secondsPast/86400) + this.$t("stats.abbreviations.day")
		},
	}
});
</script>
