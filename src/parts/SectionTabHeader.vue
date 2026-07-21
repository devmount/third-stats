<template>
	<ul class="tab">
		<li
			v-for="(id, key) in tabs"
			:key="key"
			class="tab-item cursor-default tooltip tooltip-bottom"
			:class="[
				tabItemClass,
				{
					'active': tab === id,
					'cursor-pointer text-hover-accent2': tab !== id
				}
			]"
			:data-tooltip="t('stats.charts.' + key + '.description')"
			@click="$emit('update:tab', id)"
		>
			<span
				:class="[tabColorClass ? 'transition-color transition-border-color' : 'transition-color transition-border-image', spanClass(key, id)]"
				:style="spanStyle(id)"
			>
				<slot name="label" :labelKey="key" :id="id">{{ t("stats.charts." + key + ".title") }}</slot>
			</span>
		</li>
		<li
			v-if="showComparisonToggle"
			class="tooltip tooltip-bottom px-1 ml-auto"
			:class="{
				'cursor-pointer': !singleAccount,
				'text-hover-accent2': !singleAccount
			}"
			:data-tooltip="comparisonTooltip"
			@click="!singleAccount ? $emit('update:comparison', !comparison) : null"
		>
			<svg
				class="icon icon-text"
				:class="{
					'icon-hover-accent': !singleAccount,
					'icon-accent2': comparison && !singleAccount,
					'icon-gray': singleAccount
				}"
				viewBox="0 0 24 24"
			>
				<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
				<rect class="icon-part-accent2" x="3" y="3" width="6" height="6" rx="1" />
				<rect class="icon-part-accent1" x="15" y="15" width="6" height="6" rx="1" />
				<path class="icon-part-accent2-faded" d="M21 11v-3a2 2 0 0 0 -2 -2h-6l3 3m0 -6l-3 3" />
				<path class="icon-part-accent1-faded" d="M3 13v3a2 2 0 0 0 2 2h6l-3 -3m0 6l3 -3" />
			</svg>
		</li>
		<li
			v-if="showExpandToggle"
			class="resizer cursor-pointer tooltip tooltip-bottom text-hover-accent2 px-1"
			:data-tooltip="
				!expand
				? t('stats.tooltips.expand')
				: t('stats.tooltips.shrink')
			"
			@click="$emit('update:expand', !expand)"
		>
			<svg v-show="!expand" class="icon icon-text" viewBox="0 0 24 24">
				<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
				<polyline points="16 4 20 4 20 8" /><line x1="14" y1="10" x2="20" y2="4" />
				<polyline points="8 20 4 20 4 16" /><line x1="4" y1="20" x2="10" y2="14" />
				<polyline points="16 20 20 20 20 16" /><line x1="14" y1="14" x2="20" y2="20" />
				<polyline points="8 4 4 4 4 8" /><line x1="4" y1="4" x2="10" y2="10" />
			</svg>
			<svg v-show="expand" class="icon icon-text icon-arrows-minimize" viewBox="0 0 24 24">
				<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
				<polyline points="5 9 9 9 9 5" /><line x1="3" y1="3" x2="9" y2="9" />
				<polyline points="5 15 9 15 9 19" /><line x1="3" y1="21" x2="9" y2="15" />
				<polyline points="19 9 15 9 15 5" /><line x1="15" y1="9" x2="21" y2="3" />
				<polyline points="19 15 15 15 15 19" /><line x1="15" y1="15" x2="21" y2="21" />
			</svg>
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
		return 'border-image: linear-gradient(to right, ' + props.accountsColorGradient + ') 100% 1';
	}
	return '';
};
</script>
