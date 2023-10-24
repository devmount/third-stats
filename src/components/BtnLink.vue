<template>
  <a :href="href" :target="target">
    <btn :hollow="hollow" :em="em">
      <slot></slot>
    </btn>
  </a>
</template>

<script setup>
import Btn from "@/components/Btn.vue";

defineProps({
	// link url.
	href: {
		type: String,
	},
  // link target.
  target: {
		type: String,
    defalt: '_blank',
	},
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
