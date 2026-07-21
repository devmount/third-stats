import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useLeaderChartData } from '@/composables/useLeaderChartData.js';

const stubT = (key) => key;

describe('useLeaderChartData', () => {
	it('the *Exists guards are false when the underlying contact data is empty', () => {
		const display = ref({ contacts: { received: {}, sent: {}, junk: {} } });
		const options = { dark: false };
		const {
			sentContactLeadersChartDataExists,
			receivedContactLeadersChartDataExists,
			junkContactLeadersChartDataExists,
		} = useLeaderChartData({ display, options, t: stubT });
		expect(sentContactLeadersChartDataExists.value).toBe(false);
		expect(receivedContactLeadersChartDataExists.value).toBe(false);
		expect(junkContactLeadersChartDataExists.value).toBe(false);
	});

	it('the *Exists guards are true when there is contact data', () => {
		const display = ref({
			contacts: {
				received: { 'alice@example.com': 3 },
				sent: { 'bob@example.com': 1 },
				junk: { 'spam@example.com': 5 },
			},
		});
		const options = { dark: false };
		const {
			sentContactLeadersChartDataExists,
			receivedContactLeadersChartDataExists,
			junkContactLeadersChartDataExists,
		} = useLeaderChartData({ display, options, t: stubT });
		expect(sentContactLeadersChartDataExists.value).toBe(true);
		expect(receivedContactLeadersChartDataExists.value).toBe(true);
		expect(junkContactLeadersChartDataExists.value).toBe(true);
	});
});
