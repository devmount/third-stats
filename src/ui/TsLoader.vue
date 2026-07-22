<template>
	<span class="loader" :class="{ 'loader-accent2': accent2 }"></span>
</template>

<script setup>
defineProps({
	accent2: { type: Boolean, default: false },
});
</script>

<style scoped>
.loader {
	display: inline-block;
	height: 18px;
	width: 18px;
	border-radius: 50%;
	animation: rotate 1s 0s infinite linear;
	border: 3px solid;
}

.dark .loader {
	border-color: var(--color-gray-800);
	border-top-color: var(--color-gray-500);
}

.dark .loader.loader-accent2 {
	border-color: rgba(var(--color-blue-rgb), 0.4);
	border-top-color: var(--color-blue);
}

.light .loader {
	border-color: var(--color-gray-200);
	border-top-color: var(--color-gray-600);
}

.light .loader.loader-accent2 {
	border-color: rgba(var(--color-blue-rgb), 0.4);
	border-top-color: var(--color-blue);
}

@keyframes rotate {
	0% {
		transform: rotate(0);
	}

	100% {
		transform: rotate(360deg);
	}
}
</style>
