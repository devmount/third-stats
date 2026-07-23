<template>
	<div class="input-group"><slot /></div>
</template>

<style>
/* not scoped: every rule targets arbitrary slotted children (inputs/buttons the
   consumer passes in), never an element this component renders itself */
.input-group > *:hover,
.input-group > * > input:hover,
.input-group > *:hover > input,
.input-group > * > input:hover > input {
	z-index: 25;
}

.input-group > *:first-child,
.input-group > * > input:first-child,
.input-group > *:first-child > input,
.input-group > * > input:first-child > input {
	border-top-right-radius: 0;
	border-bottom-right-radius: 0;
}

.input-group > *:last-child,
.input-group > * > input:last-child,
.input-group > *:last-child > input,
.input-group > * > input:last-child > input {
	border-top-left-radius: 0;
	border-bottom-left-radius: 0;
}

.input-group > *:not(:first-child):not(:last-child),
.input-group > * > input:not(:first-child):not(:last-child),
.input-group > *:not(:first-child):not(:last-child) > input,
.input-group > * > input:not(:first-child):not(:last-child) > input {
	border-radius: 0;
}

.input-group > *:not(:first-child),
.input-group > * > input:not(:first-child) {
	margin-left: -1px;
}

.button-group-vertical > button:first-child {
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
}

.button-group-vertical > button:last-child {
	border-top-left-radius: 0;
	border-top-right-radius: 0;
}

.input-group > .button-group-vertical:last-child > button {
	border-top-left-radius: 0;
	border-bottom-left-radius: 0;
}
</style>
