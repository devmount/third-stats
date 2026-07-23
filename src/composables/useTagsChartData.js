// chart-data shaping for the "tags" section (email tags horizontal bar chart)
import { computed } from 'vue';
import { accentColors } from '@/definitions.js';
import { sortAndLimitObject } from '@/utils.js';

export function useTagsChartData({ display, tags, options, t }) {
	// prepare data for email tags horizontal bar chart
	const tagsChartData = computed(() => {
		const r = sortAndLimitObject(display.value.tags) || {};
		const color = options.dark ? accentColors[2] : accentColors[3];
		const labels = [],
			colors = [];
		Object.keys(r).forEach((key) => {
			labels.push(tags.value.find((tag) => tag.key === key)?.tag || 'undefined');
			colors.push(tags.value.find((tag) => tag.key === key)?.color || color);
		}, this);
		return {
			datasets: [
				{
					label: t('stats.mailsPerTag'),
					data: Object.values(r),
					borderColor: options.tagColors ? colors : color,
				},
			],
			labels: labels,
		};
	});
	// true if there is any tags data to display
	const tagsChartDataExists = computed(() => {
		return tagsChartData.value.datasets[0].data?.length > 0;
	});

	return {
		tagsChartData,
		tagsChartDataExists,
	};
}
