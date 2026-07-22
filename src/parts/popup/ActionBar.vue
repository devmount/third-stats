<template>
	<div class="action d-flex gap-0-5">
		<open-stats-page-action wrapper-class="tooltip-left transition-color" icon-class="icon-small ml-auto" />
		<open-options-page-action wrapper-class="tooltip-left transition-color" icon-class="icon-small ml-auto" />
	</div>
</template>

<script setup>
import OpenStatsPageAction from '@/actions/OpenStatsPageAction.vue';
import OpenOptionsPageAction from '@/actions/OpenOptionsPageAction.vue';
</script>
