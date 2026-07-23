<template>
	<div class="filter">
		<account-filter />
		<folder-filter />
		<period-filter />
		<contact-filter />
	</div>
</template>

<script setup>
import AccountFilter from '@/filters/AccountFilter.vue';
import FolderFilter from '@/filters/FolderFilter.vue';
import PeriodFilter from '@/filters/PeriodFilter.vue';
import ContactFilter from '@/filters/ContactFilter.vue';
</script>

<style scoped>
.filter {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
}
</style>
