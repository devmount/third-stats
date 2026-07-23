<template>
	<label class="switch">
		<input type="checkbox" v-model="model" />
		<span class="switch-label" :data-on="t('options.switch.on')" :data-off="t('options.switch.off')"></span>
		<span class="switch-handle"></span>
	</label>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const model = defineModel({ type: Boolean, default: false });
</script>

<style scoped>
.switch {
	padding: 0;
	position: relative;
	display: inline-block;
	vertical-align: top;
	width: 60px;
	height: 24px;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.switch .switch-label {
	border: solid 1px;
	position: relative;
	display: block;
	height: inherit;
	font-size: 10px;
	text-transform: uppercase;
	border-radius: inherit;
	transition: inherit;
	box-sizing: border-box;
}

.switch .switch-label::before,
.switch .switch-label::after {
	position: absolute;
	top: 45%;
	transform: translateY(-50%);
	transition: inherit;
}

.switch .switch-label::before {
	content: attr(data-off);
	right: 6px;
}

.switch .switch-label::after {
	content: attr(data-on);
	left: 6px;
	opacity: 0;
}

.switch .switch-handle {
	position: absolute;
	border-radius: 100%;
	top: 4px;
	left: 4px;
	width: 16px;
	height: 16px;
	transition: inherit;
}

.switch input {
	position: absolute;
	top: 0;
	left: 0;
	opacity: 0;
}

.switch input:checked ~ .switch-label::before {
	opacity: 0;
}

.switch input:checked ~ .switch-label::after {
	opacity: 1;
}

.switch input:checked ~ .switch-handle {
	left: 40px;
}

.dark .switch .switch-label {
	border-color: var(--color-gray-700);
	background: var(--color-gray-900);
}

.dark .switch .switch-label::before {
	color: var(--color-gray-500);
}

.dark .switch .switch-label::after {
	color: var(--color-white);
}

.dark .switch:hover .switch-label {
	border-color: var(--color-gray-500);
}

.dark .switch:hover input:checked ~ .switch-label {
	border-color: var(--color-white);
}

.dark .switch .switch-handle {
	background: var(--color-gray-100);
}

.dark .switch input:checked ~ .switch-label {
	background: var(--color-blue);
	border-color: var(--color-blue);
}

.dark .switch input:checked ~ .switch-handle {
	background: var(--color-white);
}

.light .switch .switch-label {
	border-color: var(--color-gray-400);
	background: var(--color-gray-100);
}

.light .switch .switch-label::before {
	color: var(--color-gray-600);
}

.light .switch .switch-label::after {
	color: var(--color-white);
}

.light .switch:hover .switch-label {
	border-color: var(--color-gray-600);
}

.light .switch:hover input:checked ~ .switch-label {
	border-color: var(--color-black);
}

.light .switch .switch-handle {
	background: var(--color-gray-900);
}

.light .switch input:checked ~ .switch-label {
	background: var(--color-blue);
	border-color: var(--color-blue);
}

.light .switch input:checked ~ .switch-handle {
	background: var(--color-white);
}
</style>
