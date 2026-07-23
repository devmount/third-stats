<template>
	<div class="action action-bar">
		<export-action />
		<open-options-page-action class="icon-link" tooltip-position="bottom" weight="bold" variant="gray-alt" />
	</div>
</template>

<script setup>
import ExportAction from '@/actions/ExportAction.vue';
import OpenOptionsPageAction from '@/actions/OpenOptionsPageAction.vue';
</script>

<style scoped>
.action-bar {
	display: flex;
	gap: 0.5rem;
	margin-left: 3rem;
}

.action-bar :deep(.icon-link) {
	display: inline-flex;
	align-items: center;
	margin-left: 1rem;
}
</style>
