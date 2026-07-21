import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useTagsChartData } from '@/composables/useTagsChartData.js';

const stubT = (key) => key;

describe('useTagsChartData', () => {
	it('tagsChartDataExists is false when there are no tags', () => {
		const display = ref({ tags: {} });
		const tags = ref([]);
		const options = { dark: false, tagColors: false };
		const { tagsChartDataExists } = useTagsChartData({ display, tags, options, t: stubT });
		expect(tagsChartDataExists.value).toBe(false);
	});

	it('tagsChartDataExists is true and resolves tag names when there is tag data', () => {
		const display = ref({ tags: { work: 5, personal: 2 } });
		const tags = ref([{ key: 'work', tag: 'Work', color: '#ff0000' }]);
		const options = { dark: false, tagColors: false };
		const { tagsChartData, tagsChartDataExists } = useTagsChartData({ display, tags, options, t: stubT });
		expect(tagsChartDataExists.value).toBe(true);
		expect(tagsChartData.value.labels).toContain('Work');
		expect(tagsChartData.value.labels).toContain('undefined');
	});
});
