<template>
  <button
    :class="{
      'bg-blue-500 border-blue-500 text-white hover:bg-blue-600 focus:!ring-blue-400/20': !hollow && !em,
      'border-blue-500 text-blue-500 focus:!ring-blue-400/20': hollow && !em,
      'bg-fuchsia-500 border-fuchsia-500 text-white hover:bg-fuchsia-600 focus:!ring-fuchsia-400/20': !hollow && em,
      'border-fuchsia-500 text-fuchsia-500 focus:!ring-fuchsia-400/20': hollow && em,
    }"
  >
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
	// button fill style. Defaults to filled.
	hollow: {
		type: Boolean,
	},
  // button color. Defaults to not emphasised.
	em: {
		type: Boolean,
	},
});
</script>
