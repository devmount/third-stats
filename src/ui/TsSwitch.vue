<template>
	<label class="switch">
		<input type="checkbox" role="switch" v-model="model" />
		<span class="switch-track"></span>
	</label>
</template>

<script setup>
const model = defineModel({ type: Boolean, default: false });
</script>

<style scoped>
/* form and size follow Thunderbird's toggle (about:addons): 32x16px track with a 12px dot */
.switch {
	position: relative;
	display: inline-block;
	vertical-align: middle;
	cursor: pointer;
}

.switch input {
	position: absolute;
	inset: 0;
	margin: 0;
	opacity: 0;
	cursor: inherit;
}

.switch .switch-track {
	display: block;
	box-sizing: border-box;
	width: 32px;
	height: 16px;
	border: 1px solid;
	border-radius: 9999px;
	transition:
		border-color 0.2s ease,
		background-color 0.2s ease;
}

.switch .switch-track::before {
	display: block;
	content: '';
	width: 12px;
	height: 12px;
	margin: 1px;
	border-radius: inherit;
	translate: 0;
}

/* track width minus both dot margins, the 2px border and the dot width */
.switch input:checked + .switch-track::before {
	translate: 16px;
}

.switch input:checked + .switch-track:dir(rtl)::before {
	translate: -16px;
}

.switch input:focus-visible + .switch-track {
	outline: 2px solid var(--color-blue);
	outline-offset: 2px;
}

@media (prefers-reduced-motion: no-preference) {
	.switch .switch-track::before {
		transition: translate 100ms;
	}
}

.dark .switch .switch-track {
	border-color: var(--color-gray-700);
	background: var(--color-gray-900);
}

.dark .switch:hover .switch-track {
	border-color: var(--color-gray-500);
}

.dark .switch .switch-track::before {
	background: var(--color-gray-100);
}

.dark .switch input:checked + .switch-track {
	background: var(--color-blue);
	border-color: var(--color-blue);
}

.dark .switch:hover input:checked + .switch-track {
	border-color: var(--color-white);
}

.dark .switch input:checked + .switch-track::before {
	background: var(--color-white);
}

.light .switch .switch-track {
	border-color: var(--color-gray-400);
	background: var(--color-gray-100);
}

.light .switch:hover .switch-track {
	border-color: var(--color-gray-600);
}

.light .switch .switch-track::before {
	background: var(--color-gray-900);
}

.light .switch input:checked + .switch-track {
	background: var(--color-blue);
	border-color: var(--color-blue);
}

.light .switch:hover input:checked + .switch-track {
	border-color: var(--color-black);
}

.light .switch input:checked + .switch-track::before {
	background: var(--color-white);
}
</style>
