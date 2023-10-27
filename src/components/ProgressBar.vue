<template>
  <div class="fixed w-full top-0 left-0">
    <div
      class="h-1 bg-blue-500"
      :class="{ 'transition-width': progress > 0 && progress < 100 }"
      :style="`width: ${progress}%;`"
    >
      <tooltip :content="`${oneDigit(progress)}%`" position="bottom">
        <div class="w-full h-full"></div>
      </tooltip>
    </div>
  </div>
</template>

<script setup>
import { oneDigit } from "@/utils.js";
import Tooltip from "@/components/Tooltip.vue";

defineProps({
	// number between 0 and 100 indicating progress in percent.
	progress: {
		type: Number,
    default: 0,
	},
});
</script>
