<template>
	<div class="action d-inline-flex gap-1 ml-2">
		<export-action />
		<open-options-page-action
			wrapper-class="tooltip-bottom d-inline-flex align-center ml-1"
			icon-class="icon-bold icon-gray-alt"
		/>
	</div>
</template>

<script setup>
import ExportAction from '@/actions/ExportAction.vue';
import OpenOptionsPageAction from '@/actions/OpenOptionsPageAction.vue';
</script>
