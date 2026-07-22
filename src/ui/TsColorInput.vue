<template>
	<input type="color" class="color-input" v-model="model" />
</template>

<script setup>
const model = defineModel();
</script>

<style scoped>
.color-input {
	appearance: none;
	border: none;
	background: transparent;
	padding: 0;
	width: 1.5rem;
	height: 1.5rem;
}

.color-input::-moz-color-swatch {
	border-radius: 50%;
	border: none;
}

.dark .color-input:hover::-moz-color-swatch,
.dark .color-input:active::-moz-color-swatch,
.dark .color-input:focus::-moz-color-swatch {
	box-shadow: 0 0 0 0.25rem rgba(var(--color-gray-500-rgb), 0.2);
}

.light .color-input:hover::-moz-color-swatch,
.light .color-input:active::-moz-color-swatch,
.light .color-input:focus::-moz-color-swatch {
	box-shadow: 0 0 0 0.25rem rgba(var(--color-gray-600-rgb), 0.2);
}
</style>
