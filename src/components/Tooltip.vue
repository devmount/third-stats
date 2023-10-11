<template>
  <div class="relative">
    <div class="peer">
      <slot></slot>
    </div>
    <div
      class="
        absolute z-50 rounded-sm top-auto bottom-full left-1/2 text-xs font-normal pointer-events-none whitespace-pre
        px-2 py-1.5 opacity-0 peer-hover:opacity-100 transition
        bg-black/75 text-white
      "
      :class="{
        '!hidden': disabled,
        '-translate-x-1/2 translate-y-0 peer-hover:-translate-y-1.5': position === 'top',
        '!bottom-auto !top-full -translate-x-1/2 !-translate-y-3 peer-hover:!translate-y-1.5': position === 'bottom',
        '!bottom-1/2 !left-auto !right-full !translate-y-1/2 -translate-x-0 peer-hover:-translate-x-1.5': position === 'left',
        'bg-red-900/75': isError,
      }"
    >
      {{ content }}
    </div>
  </div>
</template>

<script setup>
defineProps({
	// tooltip content
	content: {
		type: String,
	},
	// place the tooltip relative to it's trigger element
	position: {
		type: String,
		default: 'top'
	},
	// true if tooltip should be displayed in error indicating color
	isError: {
		type: Boolean,
		default: false
	},
	// true if tooltip should not be displayed at all
	disabled: {
		type: Boolean,
		default: false
	},
});
</script>
