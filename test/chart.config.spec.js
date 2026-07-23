import { describe, expect, it, vi } from 'vitest';
import { Chart, color, transparentGradientBar, transparentGradientLine } from '@/chart.config.js';

// a fake canvas 2D context - only the one method the gradient helpers actually call
const createFakeCtx = () => {
	const gradient = { addColorStop: vi.fn() };
	return { createLinearGradient: vi.fn(() => gradient), gradient };
};

describe('chart.config global setup', () => {
	it('registers the chart types/elements this app uses', () => {
		expect(Chart.registry.getController('bar')).toBeTruthy();
		expect(Chart.registry.getController('line')).toBeTruthy();
		expect(Chart.registry.getController('doughnut')).toBeTruthy();
		expect(Chart.registry.getController('matrix')).toBeTruthy();
	});

	it('applies the shared visual defaults', () => {
		expect(Chart.defaults.color).toBe('#8a8a97');
		expect(Chart.defaults.plugins.legend.display).toBe(false);
		expect(Chart.defaults.plugins.tooltip.mode).toBe('index');
		expect(Chart.defaults.plugins.tooltip.intersect).toBe(false);
		expect(Chart.defaults.hover.mode).toBe('index');
	});
});

describe('transparentGradientLine', () => {
	it('builds a vertical gradient from transparent to the given color', () => {
		const ctx = createFakeCtx();
		const chartArea = { top: 10, bottom: 200 };

		const result = transparentGradientLine(ctx, chartArea, '#112233');

		expect(ctx.createLinearGradient).toHaveBeenCalledWith(0, chartArea.bottom, 0, chartArea.top);
		expect(ctx.gradient.addColorStop).toHaveBeenNthCalledWith(1, 0, '#11223300');
		expect(ctx.gradient.addColorStop).toHaveBeenNthCalledWith(2, 1, '#11223377');
		expect(result).toBe(ctx.gradient);
	});

	it('keeps an already-8-digit (with alpha) hex color as-is for the end stop', () => {
		const ctx = createFakeCtx();
		transparentGradientLine(ctx, { top: 0, bottom: 100 }, '#112233aa');

		expect(ctx.gradient.addColorStop).toHaveBeenNthCalledWith(2, 1, '#112233aa');
	});
});

describe('transparentGradientBar', () => {
	it('builds a vertical gradient by default', () => {
		const ctx = createFakeCtx();
		const chartArea = { top: 10, bottom: 200, left: 5, right: 300 };

		transparentGradientBar(ctx, chartArea, '#445566');

		expect(ctx.createLinearGradient).toHaveBeenCalledWith(0, chartArea.bottom, 0, chartArea.top);
		expect(ctx.gradient.addColorStop).toHaveBeenNthCalledWith(1, 0, '#44556633');
		expect(ctx.gradient.addColorStop).toHaveBeenNthCalledWith(2, 1, '#44556677');
	});

	it('builds a horizontal gradient when horizontal is true', () => {
		const ctx = createFakeCtx();
		const chartArea = { top: 10, bottom: 200, left: 5, right: 300 };

		transparentGradientBar(ctx, chartArea, '#445566', true);

		expect(ctx.createLinearGradient).toHaveBeenCalledWith(chartArea.left, 0, chartArea.right, 0);
	});
});

describe('color (re-exported from chart.js/helpers)', () => {
	it('parses a hex color and can render it as an rgb string', () => {
		expect(color('#ff0000').rgbString()).toBe('rgb(255, 0, 0)');
	});
});
