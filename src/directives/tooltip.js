import './tooltip.css';

// v-tooltip="'text'" or v-tooltip="{ text, position, error }"
// position: 'bottom' | 'left' (omit for the default top placement)
function apply(el, value) {
	el.classList.remove('tooltip', 'tooltip-bottom', 'tooltip-left', 'tooltip-error');
	if (!value) {
		el.removeAttribute('data-tooltip');
		return;
	}
	const { text, position, error } = typeof value === 'string' ? { text: value } : value;
	el.classList.add('tooltip');
	if (position) el.classList.add(`tooltip-${position}`);
	if (error) el.classList.add('tooltip-error');
	el.setAttribute('data-tooltip', text);
}

export default {
	mounted(el, binding) {
		apply(el, binding.value);
	},
	updated(el, binding) {
		apply(el, binding.value);
	},
};
