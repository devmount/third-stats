<template>
	<div class="action">
		<open-stats-page-action class="icon-link" tooltip-position="left" size="small" />
		<open-options-page-action class="icon-link" tooltip-position="left" size="small" />
	</div>
</template>

<script setup>
import OpenStatsPageAction from '@/actions/OpenStatsPageAction.vue';
import OpenOptionsPageAction from '@/actions/OpenOptionsPageAction.vue';
</script>

<style scoped>
.action {
	display: flex;
	gap: 0.5rem;
}

.action :deep(.icon-link) {
	margin-left: auto;
	transition: color var(--transition-fast);
}
</style>
