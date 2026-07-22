<template>
	<component :is="as" class="btn" :class="classes" :disabled="as === 'button' ? disabled : undefined">
		<slot />
	</component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
	// button | a
	as: { type: String, default: 'button' },
	thin: { type: Boolean, default: false },
	outline: { type: Boolean, default: false },
	// accent1 | accent2 | secondary
	variant: { type: String, default: null },
	disabled: { type: Boolean, default: false },
});

const classes = computed(() => ({
	'btn-thin': props.thin,
	'btn-outline': props.outline,
	'btn-accent1': props.variant === 'accent1',
	'btn-accent2': props.variant === 'accent2',
	'button-secondary': props.variant === 'secondary',
	disabled: props.disabled,
}));
</script>

<style scoped>
.btn {
	appearance: none;
	border: 1px solid;
	border-radius: 2px;
	padding: .5rem;
	transition: all 0.2s ease;
	cursor: pointer;
	color: var(--color-white);
	box-sizing: border-box;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: .5rem;
}

.btn.disabled {
	cursor: not-allowed;
}

.btn:focus {
	z-index: 50;
}

.btn.btn-thin {
	padding: 0 .25rem;
}

.btn.btn-outline {
	background: transparent;
}

.dark .btn {
	border-color: var(--color-blue);
}

.dark .btn.btn-accent1 {
	color: var(--color-pink);
	border-color: var(--color-pink);
}

.dark .btn.btn-accent2 {
	color: var(--color-blue);
	border-color: var(--color-blue);
}

.dark .btn:not(.btn-outline) {
	background: var(--color-blue);
}

.dark .btn.button-secondary {
	border-color: var(--color-gray-700);
	background: var(--color-gray-700);
}

.dark .btn:hover {
	background: var(--color-blue-hover);
}

.dark .btn:hover :deep(.icon) {
	stroke: var(--color-white);
	transform: scale(1.1);
}

.dark .btn:active {
	background: var(--color-blue-active);
}

.dark .btn:focus {
	box-shadow: 0 0 0 0.25rem rgba(var(--color-blue-rgb), 0.2);
}

.dark .btn.btn-accent1:hover {
	color: var(--color-white);
	background: var(--color-pink-hover);
}

.dark .btn.btn-accent2:hover {
	color: var(--color-white);
	background: var(--color-blue-hover);
}

.dark .btn.btn-accent1:active {
	background: var(--color-pink-active);
}

.dark .btn.btn-accent1:focus {
	box-shadow: 0 0 0 0.25rem rgba(var(--color-pink-rgb), 0.2);
}

.light .btn {
	border-color: var(--color-blue);
}

.light .btn.btn-accent1 {
	color: var(--color-pink);
	border-color: var(--color-pink);
}

.light .btn.btn-accent2 {
	color: var(--color-blue);
	border-color: var(--color-blue);
}

.light .btn:not(.btn-outline) {
	background: var(--color-blue);
}

.light .btn.button-secondary {
	border-color: var(--color-gray-400);
	background: var(--color-gray-400);
}

.light .btn:hover {
	background: var(--color-blue-hover);
}

.light .btn:hover :deep(.icon) {
	stroke: var(--color-white);
	transform: scale(1.1);
}

.light .btn:active {
	background: var(--color-blue-active);
}

.light .btn:focus {
	box-shadow: 0 0 0 0.25rem rgba(var(--color-blue-rgb), 0.2);
}

.light .btn.btn-accent1:hover {
	color: var(--color-white);
	background: var(--color-pink-hover);
}

.light .btn.btn-accent2:hover {
	color: var(--color-white);
	background: var(--color-blue-hover);
}

.light .btn.btn-accent1:active {
	background: var(--color-pink-active);
}

.light .btn.btn-accent1:focus {
	box-shadow: 0 0 0 0.25rem rgba(var(--color-pink-rgb), 0.2);
}
</style>
