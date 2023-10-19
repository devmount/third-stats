<template>
  <button
    :class="{
      'bg-blue-500 border-blue-500 text-white hover:bg-blue-400 focus:!ring-blue-400/20': category === 'primary',
      'border-blue-500 text-blue-500 focus:!ring-blue-400/20': category === 'secondary',
    }"
  >
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
	// button style. Possible values: primary, secondary
	category: {
		type: String,
		default: 'primary'
	},
});
</script>
