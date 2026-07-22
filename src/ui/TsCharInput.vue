<template>
	<input :type="type" class="char-input" v-model="model" />
</template>

<script setup>
defineProps({
	// text | email | date | number
	type: { type: String, default: 'text' },
});
const model = defineModel();
</script>

<style scoped>
.char-input {
	appearance: none;
	border: solid 1px;
	border-radius: 2px;
	padding: 0.5rem;
	outline: none;
	transition: all 0.2s ease;
	width: 100%;
	box-sizing: border-box;
	height: 2.5rem;
}

.char-input.disabled {
	cursor: not-allowed;
}

.char-input:focus {
	z-index: 50;
}

.char-input[type='number'] {
	appearance: textfield;
}

.dark .char-input {
	background: var(--color-gray-900);
	color: var(--color-gray-100);
	border-color: var(--color-gray-700);
}

.dark .char-input:hover {
	border-color: var(--color-gray-500);
}

.dark .char-input:focus {
	border-color: var(--color-blue);
	box-shadow: 0 0 0 0.25rem rgba(var(--color-blue-rgb), 0.2);
}

.dark .char-input::placeholder {
	color: var(--color-gray-700);
	opacity: 1;
}

.dark .char-input.error {
	z-index: 20;
	color: var(--color-red);
	border-color: var(--color-red);
}

.dark .char-input.error:focus {
	z-index: 50;
	box-shadow: 0 0 0 0.25rem rgba(var(--color-red-rgb), 0.2);
}

.light .char-input {
	background: var(--color-gray-100);
	color: var(--color-gray-900);
	border-color: var(--color-gray-400);
}

.light .char-input:hover {
	border-color: var(--color-gray-600);
}

.light .char-input:focus {
	border-color: var(--color-blue);
	box-shadow: 0 0 0 0.25rem rgba(var(--color-blue-rgb), 0.2);
}

.light .char-input::placeholder {
	color: var(--color-gray-400);
	opacity: 1;
}

.light .char-input.error {
	z-index: 20;
	color: var(--color-red);
	border-color: var(--color-red);
}

.light .char-input.error:focus {
	z-index: 50;
	box-shadow: 0 0 0 0.25rem rgba(var(--color-red-rgb), 0.2);
}
</style>
