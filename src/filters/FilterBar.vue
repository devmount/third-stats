<template>
	<div class="filter d-flex flex-wrap gap-1">
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
