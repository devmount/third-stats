<template>
<span
	class="
		text-sm rounded-sm py-1 px-2 flex items-center gap-1
		bg-zinc-200 dark:bg-zinc-700/75
	"
>
	{{ label }}
	<icon-x class="!w-4 !h-4 cursor-pointer hover:text-fuchsia-500" @click="emit('remove')" />
</span>
</template>

<script setup>
import IconX from "@/icons/IconX.vue";

defineProps({
	// tag label
	label: {
		type: String,
	},
});

const emit = defineEmits(['remove']);
</script>
