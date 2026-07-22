<template>
	<div class="action action-bar">
		<export-action />
		<open-options-page-action
			tooltip-position="bottom"
			wrapper-class="d-inline-flex align-center ml-1"
			icon-class="icon-bold icon-gray-alt"
		/>
	</div>
</template>

<script setup>
import ExportAction from '@/actions/ExportAction.vue';
import OpenOptionsPageAction from '@/actions/OpenOptionsPageAction.vue';
</script>

<style scoped>
.action-bar {
	display: flex;
	gap: .5rem;
	margin-left: 3rem;
}
</style>
