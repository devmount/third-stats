<template>
	<svg class="icon" :class="classes" :viewBox="viewBox"><slot /></svg>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
	viewBox: { type: String, default: '0 0 24 24' },
	// tiny | text | small | large | huge
	size: { type: String, default: null },
	// thin | bold | strong
	weight: { type: String, default: null },
	// dark | light | gray | gray-alt | accent1 | accent1-faded | accent2
	variant: { type: String, default: null },
	hoverAccent: { type: Boolean, default: false },
	animatedColorTransition: { type: Boolean, default: false },
});

const classes = computed(() => [
	props.size ? `icon-${props.size}` : null,
	props.weight ? `icon-${props.weight}` : null,
	props.variant ? `icon-${props.variant}` : null,
	{
		'icon-hover-accent': props.hoverAccent,
		'icon-animated-color-transition': props.animatedColorTransition,
	},
]);
</script>

<style scoped>
.icon {
	stroke-width: 1.5;
	fill: none;
	stroke: currentColor;
	stroke-linecap: round;
	stroke-linejoin: round;
	width: 2rem;
	height: 2rem;
	transition: all 0.2s ease;
}

.icon.icon-text {
	width: 1rem;
	height: 1rem;
}

.icon.icon-tiny {
	width: 1.25rem;
	height: 1.25rem;
}

.icon.icon-small {
	width: 1.5rem;
	height: 1.5rem;
}

.icon.icon-large {
	width: 5rem;
	height: 5rem;
}

.icon.icon-huge {
	width: 10rem;
	height: 10rem;
}

.icon.icon-thin {
	stroke-width: 1;
}

.icon.icon-bold {
	stroke-width: 2;
}

.icon.icon-strong {
	stroke-width: 3;
}

.dark .icon.icon-dark {
	color: var(--color-yellow);
}

.dark .icon.icon-gray {
	stroke: var(--color-gray-700);
}

.dark .icon.icon-gray-alt {
	stroke: var(--color-gray-500);
}

.dark .icon.icon-accent1 {
	stroke: var(--color-pink);
}

.dark .icon.icon-accent1-faded {
	stroke: rgba(var(--color-pink-rgb), 0.4);
}

.dark .icon.icon-accent2 {
	stroke: var(--color-blue);
}

.dark .icon.icon-hover-accent > :deep(*) {
	transition: inherit;
}

.dark .icon.icon-hover-accent:hover {
	stroke: currentColor;
}

.dark .icon.icon-hover-accent:hover :deep(.icon-part-accent1) {
	stroke: var(--color-pink);
}

.dark .icon.icon-hover-accent:hover :deep(.icon-part-accent1-faded) {
	stroke: rgba(var(--color-pink-rgb), 0.4);
}

.dark .icon.icon-hover-accent:hover :deep(.icon-part-accent2) {
	stroke: var(--color-blue);
}

.dark .icon.icon-hover-accent:hover :deep(.icon-part-accent2-faded) {
	stroke: rgba(var(--color-blue-rgb), 0.4);
}

.dark .icon.icon-animated-color-transition {
	animation: darkColorFading 1s 0s infinite ease alternate;
}

.light .icon.icon-light {
	color: var(--color-blue-gray);
}

.light .icon.icon-gray {
	stroke: var(--color-gray-400);
}

.light .icon.icon-gray-alt {
	stroke: var(--color-gray-600);
}

.light .icon.icon-accent1 {
	stroke: var(--color-pink);
}

.light .icon.icon-accent1-faded {
	stroke: rgba(var(--color-pink-rgb), 0.4);
}

.light .icon.icon-accent2 {
	stroke: var(--color-blue);
}

.light .icon.icon-hover-accent > :deep(*) {
	transition: inherit;
}

.light .icon.icon-hover-accent:hover {
	stroke: currentColor;
}

.light .icon.icon-hover-accent:hover :deep(.icon-part-accent1) {
	stroke: var(--color-pink);
}

.light .icon.icon-hover-accent:hover :deep(.icon-part-accent1-faded) {
	stroke: rgba(var(--color-pink-rgb), 0.4);
}

.light .icon.icon-hover-accent:hover :deep(.icon-part-accent2) {
	stroke: var(--color-blue);
}

.light .icon.icon-hover-accent:hover :deep(.icon-part-accent2-faded) {
	stroke: rgba(var(--color-blue-rgb), 0.4);
}

.light .icon.icon-animated-color-transition {
	animation: lightColorFading 1s 0s infinite ease alternate;
}

@keyframes darkColorFading {
	0% {
		stroke: var(--color-blue);
	}

	100% {
		stroke: var(--color-pink);
	}
}

@keyframes lightColorFading {
	0% {
		stroke: var(--color-blue);
	}

	100% {
		stroke: var(--color-pink);
	}
}
</style>
