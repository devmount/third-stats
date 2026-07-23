<template>
	<select class="select" v-model="model">
		<slot />
	</select>
</template>

<script setup>
const model = defineModel();
</script>

<style scoped>
.select {
	border: solid 1px;
	border-radius: 2px;
	color: inherit;
	padding: 0.5rem 1.5rem 0.5rem 0.5rem;
	outline: none;
	box-sizing: border-box;
	transition: all 0.2s ease;
	height: 2.5rem;
}

.select.disabled {
	cursor: not-allowed;
}

.select:focus {
	z-index: 50;
}

.dark .select {
	color: var(--color-gray-100);
	background: var(--color-gray-900);
	border-color: var(--color-gray-700);
}

.dark .select:hover:not(.disabled) {
	border-color: var(--color-gray-500);
}

.dark .select:focus:not(.disabled) {
	border-color: var(--color-blue);
	box-shadow: 0 0 0 0.25rem rgba(var(--color-blue-rgb), 0.2);
}

.light .select {
	color: var(--color-gray-900);
	background: var(--color-gray-100);
	border-color: var(--color-gray-400);
}

.light .select:hover:not(.disabled) {
	border-color: var(--color-gray-600);
}

.light .select:focus:not(.disabled) {
	border-color: var(--color-blue);
	box-shadow: 0 0 0 0.25rem rgba(var(--color-blue-rgb), 0.2);
}
</style>
