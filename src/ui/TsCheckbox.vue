<template>
	<label class="checkbox">
		<input type="checkbox" :checked="modelValue.includes(value)" @change="toggle" />
		<i class="checkbox-icon"></i>
		<slot />
	</label>
</template>

<script setup>
const props = defineProps({
	modelValue: { type: Array, required: true },
	value: { required: true },
});
const emit = defineEmits(['update:modelValue']);

// native v-model array-checkbox-group behavior is compiler magic that only applies to
// plain <input> elements, so it's reimplemented explicitly for this wrapper component
function toggle(event) {
	const next = [...props.modelValue];
	if (event.target.checked) next.push(props.value);
	else next.splice(next.indexOf(props.value), 1);
	emit('update:modelValue', next);
}
</script>

<style scoped>
.checkbox {
	display: block;
	line-height: 24px;
	margin: 1px 0 4px 0;
	min-height: 24px;
	padding: 0 0 0 32px;
	position: relative;
}

.checkbox .checkbox-icon {
	border-radius: 2px;
	height: 24px;
	left: 0;
	top: 0;
	width: 24px;
	border: 1px solid;
	cursor: pointer;
	display: inline-block;
	position: absolute;
	transition: all 0.2s ease;
	box-sizing: border-box;
}

.checkbox input {
	clip: rect(0, 0, 0, 0);
	height: 1px;
	margin: -1px;
	overflow: hidden;
	position: absolute;
	width: 1px;
}

.checkbox input:checked + .checkbox-icon::before {
	background-clip: padding-box;
	border: 2px solid;
	border-left-width: 0;
	border-top-width: 0;
	content: '';
	height: 15px;
	left: 6px;
	position: absolute;
	top: 0;
	transform: rotate(45deg);
	width: 8px;
}

.dark .checkbox .checkbox-icon {
	background: var(--color-gray-900);
	border-color: var(--color-gray-700);
}

.dark .checkbox input:checked + .checkbox-icon {
	background: var(--color-blue);
	border-color: var(--color-blue);
}

.dark .checkbox input:checked + .checkbox-icon::before {
	border-color: var(--color-white);
}

.dark .checkbox:hover .checkbox-icon {
	border-color: var(--color-gray-500);
}

.dark .checkbox:hover input:checked + .checkbox-icon {
	border-color: var(--color-white);
}

.checkbox .dark input:focus + .checkbox-icons {
	border-color: var(--color-blue);
	box-shadow: 0 0 0 0.25rem rgba(var(--color-blue-rgb), 0.2);
}

.light .checkbox .checkbox-icon {
	background: var(--color-gray-100);
	border-color: var(--color-gray-400);
}

.light .checkbox input:checked + .checkbox-icon {
	background: var(--color-blue);
	border-color: var(--color-blue);
}

.light .checkbox input:checked + .checkbox-icon::before {
	border-color: var(--color-white);
}

.light .checkbox:hover .checkbox-icon {
	border-color: var(--color-gray-600);
}

.light .checkbox:hover input:checked + .checkbox-icon {
	border-color: var(--color-black);
}

.checkbox .light input:focus + .checkbox-icons {
	border-color: var(--color-blue);
	box-shadow: 0 0 0 0.25rem rgba(var(--color-blue-rgb), 0.2);
}
</style>
