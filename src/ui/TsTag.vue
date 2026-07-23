<template>
	<span class="tag"><slot /></span>
</template>

<style scoped>
.tag {
	display: inline-block;
	margin: 0.5rem 0.5rem 0 0;
	padding: 0.2rem 0.2rem 0.2rem 0.5rem;
}

.tag > :deep(*) {
	vertical-align: middle;
}

.dark .tag {
	color: var(--color-gray-100);
	background: var(--color-gray-800);
}

.light .tag {
	color: var(--color-gray-900);
	background: var(--color-gray-100);
}
</style>
