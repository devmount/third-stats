// chart-data shaping for the "twodim" section (weekday/hour matrix chart)
import { computed } from 'vue';

export function useTwodimChartData({ display, t }) {
	// prepare data for weekday/hour matrix charts
	const weekdayPerHourChartData = computed(() => {
		let rd = Object.values(display.value.weekdayPerHourData.received);
		let sd = Object.values(display.value.weekdayPerHourData.sent);
		let initDate = new Date(1970,0,4);
		let r = rd.reduce((p,c,day) => [...p,...c.map((n,hour) => {
			let d = new Date(initDate.setDate(4+day));
			d = new Date(d.setHours(hour, 0, 0));
			return [d.toISOString(), n];
		})], []);
		let s = sd.reduce((p,c,day) => [...p,...c.map((n,hour) => {
			let d = new Date(initDate.setDate(4+day));
			d = new Date(d.setHours(hour, 0, 0));
			return [d.toISOString(), n];
		})], []);
		// TODO: handle options.startOfWeek
		return {
			received: { label: t("stats.mailsReceived"), data: r },
			sent: { label: t("stats.mailsSent"), data: s },
		};
	});

	return {
		weekdayPerHourChartData,
	};
}
