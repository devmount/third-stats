<template>
	<li class="folder-tree-node">
		<div class="row" :class="{ account: depth === 0 }" :style="{ paddingLeft: `${depth}rem` }">
			<span
				class="toggle"
				:class="{ expandable: node.children.length }"
				:role="node.children.length ? 'button' : null"
				:tabindex="node.children.length ? 0 : null"
				:aria-expanded="node.children.length ? expanded : null"
				@click="toggle"
				@keydown.enter.prevent="toggle"
				@keydown.space.prevent="toggle"
			>
				{{ node.children.length ? (expanded ? '▾' : '▸') : '' }}
			</span>
			<span class="name" :class="{ removed: node.removed }" :title="label">
				<span v-if="notFound" class="not-found">{{ t('stats.charts.foldersSize.notFound') }}</span>
				<a
					v-else-if="node.folderId"
					href="#"
					:title="t('stats.charts.foldersSize.open', [node.name])"
					@click.prevent="open"
				>
					{{ node.name }}
				</a>
				<template v-else>{{ label }}</template>
			</span>
			<span class="bar"><span :style="{ width: `${node.share * 100}%` }"></span></span>
			<span class="size">{{ formatBytes(node.size, 1) }}</span>
		</div>
		<ul v-if="expanded && node.children.length">
			<folder-tree-node v-for="child in node.children" :key="child.key" :node="child" :depth="depth + 1" />
		</ul>
	</li>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatBytes, openFolder } from '@/utils.js';

const props = defineProps({
	// { key, name, folderId, removed?, size, share, children } as built by buildFolderTree()
	node: { type: Object, required: true },
	depth: { type: Number, default: 0 },
});

const { t } = useI18n();

const label = computed(() => (props.node.removed ? t('stats.charts.foldersSize.removed') : props.node.name));

// accounts start expanded so their top-level folders are visible right away
const expanded = ref(props.depth === 0);

const toggle = () => {
	if (props.node.children.length) expanded.value = !expanded.value;
};

const notFound = ref(false);

const open = async () => {
	if (await openFolder(props.node.folderId)) return;
	notFound.value = true;
	setTimeout(() => (notFound.value = false), 2000);
};
</script>

<style scoped>
.folder-tree-node {
	list-style: none;
	margin: 0;
}
ul {
	margin: 0;
	padding: 0;
}
.row {
	display: grid;
	grid-template-columns: 1.25rem minmax(0, 1fr) minmax(3rem, 35%) 5.5rem;
	align-items: center;
	column-gap: 0.5rem;
	padding-top: 0.3rem;
	padding-bottom: 0.3rem;
	font-size: 0.875rem;
	border-bottom: 1px solid var(--color-border);
}
.row.account {
	font-weight: bold;
}
.toggle.expandable {
	cursor: pointer;
	user-select: none;
	color: var(--color-text-gray);
}
.name {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.removed {
	font-style: italic;
	color: var(--color-text-gray);
}
.not-found {
	font-weight: normal;
	color: var(--color-text-gray);
}
.bar {
	height: 0.5rem;

	> span {
		display: block;
		height: 100%;
		/* keeps tiny folders visible next to huge ones */
		min-width: 2px;
		border-radius: 2px;
		background: var(--color-blue);
		opacity: 0.6;
	}
}
.size {
	text-align: right;
	font-variant-numeric: tabular-nums;
	white-space: nowrap;
}
</style>
