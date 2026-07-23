import { describe, expect, it } from 'vitest';
import tooltip from '@/directives/tooltip.js';

// minimal DOM-element stand-in - only the API surface the directive touches
const createFakeElement = () => {
	const classes = new Set();
	const attributes = new Map();
	return {
		classList: {
			add: (...names) => names.forEach((n) => classes.add(n)),
			remove: (...names) => names.forEach((n) => classes.delete(n)),
			contains: (name) => classes.has(name),
		},
		setAttribute: (name, value) => attributes.set(name, value),
		removeAttribute: (name) => attributes.delete(name),
		getAttribute: (name) => (attributes.has(name) ? attributes.get(name) : null),
	};
};

describe('v-tooltip directive', () => {
	it('applies the "tooltip" class and data-tooltip text for a plain string value', () => {
		const el = createFakeElement();
		tooltip.mounted(el, { value: 'Hello' });

		expect(el.classList.contains('tooltip')).toBe(true);
		expect(el.getAttribute('data-tooltip')).toBe('Hello');
		expect(el.classList.contains('tooltip-bottom')).toBe(false);
		expect(el.classList.contains('tooltip-left')).toBe(false);
		expect(el.classList.contains('tooltip-error')).toBe(false);
	});

	it('adds a position modifier class when given', () => {
		const el = createFakeElement();
		tooltip.mounted(el, { value: { text: 'Hi', position: 'bottom' } });

		expect(el.classList.contains('tooltip-bottom')).toBe(true);
		expect(el.classList.contains('tooltip-left')).toBe(false);
	});

	it('adds the error class when error is set', () => {
		const el = createFakeElement();
		tooltip.mounted(el, { value: { text: 'Oops', error: true } });

		expect(el.classList.contains('tooltip-error')).toBe(true);
		expect(el.getAttribute('data-tooltip')).toBe('Oops');
	});

	it('adds no tooltip classes and removes the attribute for a falsy value', () => {
		const el = createFakeElement();
		el.setAttribute('data-tooltip', 'stale');
		tooltip.mounted(el, { value: null });

		expect(el.classList.contains('tooltip')).toBe(false);
		expect(el.getAttribute('data-tooltip')).toBeNull();
	});

	it('updated() swaps position/error state instead of accumulating classes', () => {
		const el = createFakeElement();
		tooltip.mounted(el, { value: { text: 'A', position: 'bottom' } });
		tooltip.updated(el, { value: { text: 'B', position: 'left', error: true } });

		expect(el.classList.contains('tooltip-bottom')).toBe(false);
		expect(el.classList.contains('tooltip-left')).toBe(true);
		expect(el.classList.contains('tooltip-error')).toBe(true);
		expect(el.getAttribute('data-tooltip')).toBe('B');
	});

	it('updated() with a falsy value clears a previously applied tooltip', () => {
		const el = createFakeElement();
		tooltip.mounted(el, { value: { text: 'A', position: 'bottom' } });
		tooltip.updated(el, { value: null });

		expect(el.classList.contains('tooltip')).toBe(false);
		expect(el.classList.contains('tooltip-bottom')).toBe(false);
		expect(el.getAttribute('data-tooltip')).toBeNull();
	});
});
