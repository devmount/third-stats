<template>
	<ul class="tab">
		<li
			v-for="(id, key) in tabs"
			:key="key"
			class="tab-item"
			:class="[tabItemClass, { active: tab === id }]"
			v-tooltip="{ text: t(`stats.charts.${key}.description`), position: 'bottom' }"
			@click="$emit('update:tab', id)"
		>
			<span class="tab-label" :class="spanClass(key, id)" :style="spanStyle(id)">
				<slot name="label" :labelKey="key" :id="id">{{ t(`stats.charts.${key}.title`) }}</slot>
			</span>
		</li>
		<li
			v-if="showComparisonToggle"
			class="comparison-toggle"
			:class="{ enabled: !singleAccount }"
			v-tooltip="{ text: comparisonTooltip, position: 'bottom' }"
			@click="!singleAccount ? $emit('update:comparison', !comparison) : null"
		>
			<ts-icon
				size="text"
				:hover-accent="!singleAccount"
				:variant="singleAccount ? 'gray' : comparison ? 'accent2' : null"
			>
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<rect class="icon-part-accent2" x="3" y="3" width="6" height="6" rx="1" />
				<rect class="icon-part-accent1" x="15" y="15" width="6" height="6" rx="1" />
				<path class="icon-part-accent2-faded" d="M21 11v-3a2 2 0 0 0 -2 -2h-6l3 3m0 -6l-3 3" />
				<path class="icon-part-accent1-faded" d="M3 13v3a2 2 0 0 0 2 2h6l-3 -3m0 6l3 -3" />
			</ts-icon>
		</li>
		<li
			v-if="showExpandToggle"
			class="resizer"
			v-tooltip="{ text: !expand ? t('stats.tooltips.expand') : t('stats.tooltips.shrink'), position: 'bottom' }"
			@click="$emit('update:expand', !expand)"
		>
			<ts-icon v-show="!expand" size="text">
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<polyline points="16 4 20 4 20 8" />
				<line x1="14" y1="10" x2="20" y2="4" />
				<polyline points="8 20 4 20 4 16" />
				<line x1="4" y1="20" x2="10" y2="14" />
				<polyline points="16 20 20 20 20 16" />
				<line x1="14" y1="14" x2="20" y2="20" />
				<polyline points="8 4 4 4 4 8" />
				<line x1="4" y1="4" x2="10" y2="10" />
			</ts-icon>
			<ts-icon v-show="expand" size="text" class="icon-arrows-minimize">
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<polyline points="5 9 9 9 9 5" />
				<line x1="3" y1="3" x2="9" y2="9" />
				<polyline points="5 15 9 15 9 19" />
				<line x1="3" y1="21" x2="9" y2="15" />
				<polyline points="19 9 15 9 15 5" />
				<line x1="15" y1="9" x2="21" y2="3" />
				<polyline points="19 15 15 15 15 19" />
				<line x1="15" y1="15" x2="21" y2="21" />
			</ts-icon>
		</li>
	</ul>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
	tabs: { type: Object, required: true },
	tab: { type: Number, required: true },
	// static class appended to every tab <li>, for section-specific quirks (e.g. total's fixed accent underline)
	tabItemClass: { type: String, default: '' },
	// 'gradient': border reacts to the comparison prop; 'static-gradient': always the same gradient underline
	borderVariant: { type: String, default: 'static-gradient' },
	// escape hatch for per-key fixed accent colors (leader/tags); overrides borderVariant when given
	tabColorClass: { type: Function, default: null },
	comparison: { type: Boolean, default: false },
	showComparisonToggle: { type: Boolean, default: false },
	comparisonTooltip: { type: String, default: '' },
	singleAccount: { type: Boolean, default: true },
	accountsColorGradient: { type: String, default: '' },
	showExpandToggle: { type: Boolean, default: false },
	expand: { type: Boolean, default: false },
});

defineEmits(['update:tab', 'update:comparison', 'update:expand']);

const spanClass = (key, id) => {
	if (props.tabColorClass) return props.tabColorClass(key, id);
	if (props.borderVariant === 'gradient') {
		return { 'border-bottom-gradient-accent2-accent1': !props.comparison };
	}
	// static-gradient
	return 'border-bottom-gradient-accent2-accent1';
};

const spanStyle = (id) => {
	if (props.borderVariant === 'gradient' && props.tab === id && props.comparison) {
		return `border-image: linear-gradient(to right, ${props.accountsColorGradient}) 100% 1`;
	}
	return '';
};
</script>

<style scoped>
.tab {
	align-items: center;
	display: flex;
	flex-wrap: wrap;
	list-style: none;
	margin-bottom: 0;
	border-bottom: 1px solid;
	padding-left: 1rem;
	color: var(--color-text-gray);
}

.dark .tab {
	border-bottom-color: var(--color-gray-800);
}

.light .tab {
	border-bottom-color: var(--color-gray-200);
}

.tab .tab-item {
	margin-top: 0;
	cursor: default;
}

.tab .tab-item:not(.active) {
	cursor: pointer;
}

.tab .tab-item:not(.active):hover {
	color: var(--color-blue);
}

.tab .tab-item > .tab-label {
	border-bottom: 2px solid transparent;
	color: inherit;
	display: block;
	margin-bottom: -1px;
	padding: 0.5rem 1rem;
	text-decoration: none;
	transition:
		color var(--transition-fast),
		border-color var(--transition-fast),
		border-image var(--transition-fast);
}

.tab .tab-item.active > .tab-label {
	color: var(--color-text-highlight);
}

.tab .tab-item.active > .tab-label.border-bottom-accent1 {
	border-bottom-color: var(--color-pink);
}

.tab .tab-item.active > .tab-label.border-bottom-accent2 {
	border-bottom-color: var(--color-blue);
}

.tab .tab-item.active > .tab-label.border-bottom-accent3 {
	border-bottom-color: var(--color-text);
}

.tab .tab-item.active > .tab-label.border-bottom-gradient-accent2-accent1 {
	border-image: linear-gradient(to right, var(--color-blue), var(--color-pink)) 100% 1;
}

.comparison-toggle {
	padding-left: 1rem;
	padding-right: 1rem;
	margin-left: auto;
}

.comparison-toggle.enabled {
	cursor: pointer;
}

.comparison-toggle.enabled:hover {
	color: var(--color-blue);
}

.resizer {
	cursor: pointer;
	padding-left: 1rem;
	padding-right: 1rem;
}

.resizer:hover {
	color: var(--color-blue);
}
</style>
