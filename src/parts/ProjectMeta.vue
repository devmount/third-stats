<template>
	<section>
		<!-- title with version -->
		<div class="text-gray text-small text-center">
			ThirdStats <code>{{ version }}</code>
		</div>
		<!-- cta -->
		<div v-if="!compact" class="text-gray text-center mt-1">{{ t('cta.message') }}</div>
		<div class="d-flex gap-1 justify-center mt-2">
			<a
				:href="links.donate"
				class="btn btn-thin btn-outline d-flex gap-0-5 align-items-center btn-accent1 tooltip-top"
				:class="{ tooltip: compact }"
				:data-tooltip="t('cta.donate')"
			>
				<svg class="icon icon-tiny icon-accent1" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M19.5 13.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
				</svg>
				<span v-if="!compact">{{ t('cta.donate') }}</span>
			</a>
			<a
				:href="links.share"
				class="btn btn-thin btn-outline d-flex gap-0-5 align-items-center btn-accent2 tooltip-top"
				:class="{ tooltip: compact }"
				:data-tooltip="t('cta.share')"
			>
				<svg class="icon icon-tiny icon-accent2" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M18.648 15.254c-1.816 1.763 -6.648 1.626 -6.648 1.626a18.262 18.262 0 0 1 -3.288 -.256c1.127 1.985 4.12 2.81 8.982 2.475c-1.945 2.013 -13.598 5.257 -13.668 -7.636l-.026 -1.154c0 -3.036 .023 -4.115 1.352 -5.633c1.671 -1.91 6.648 -1.666 6.648 -1.666s4.977 -.243 6.648 1.667c1.329 1.518 1.352 2.597 1.352 5.633s-.456 4.074 -1.352 4.944z" />
					<path d="M12 11.204v-2.926c0 -1.258 -.895 -2.278 -2 -2.278s-2 1.02 -2 2.278v4.722m4 -4.722c0 -1.258 .895 -2.278 2 -2.278s2 1.02 2 2.278v4.722" />
				</svg>
				<span v-if="!compact">{{ t('cta.share') }}</span>
			</a>
			<a
				:href="links.star"
				class="btn btn-thin btn-outline d-flex gap-0-5 align-items-center btn-accent2 tooltip-top"
				:class="{ tooltip: compact }"
				:data-tooltip="t('cta.star')"
			>
				<svg class="icon icon-tiny icon-accent2" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
				</svg>
				<span v-if="!compact">{{ t('cta.star') }}</span>
			</a>
			<a
				:href="links.review"
				class="btn btn-thin btn-outline d-flex gap-0-5 align-items-center btn-accent2 tooltip-top"
				:class="{ tooltip: compact }"
				:data-tooltip="t('cta.review')"
			>
				<svg class="icon icon-tiny icon-accent2" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4" />
					<line x1="13.5" y1="6.5" x2="17.5" y2="10.5" />
				</svg>
				<span v-if="!compact">{{ t('cta.review') }}</span>
			</a>
			<a
				:href="links.translate"
				class="btn btn-thin btn-outline d-flex gap-0-5 align-items-center btn-accent2 tooltip-top"
				:class="{ tooltip: compact }"
				:data-tooltip="t('cta.translate')"
			>
				<svg class="icon icon-tiny icon-accent2" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<path d="M4 5h7" />
					<path d="M9 3v2c0 4.418 -2.239 8 -5 8" />
					<path d="M5 9c-.003 2.144 2.952 3.908 6.7 4" />
					<path d="M12 20l4 -9l4 9" />
					<path d="M19.1 18h-6.2" />
				</svg>
				<span v-if="!compact">{{ t('cta.translate') }}</span>
			</a>
		</div>
		<!-- disclaimer -->
		<div
			v-if="!compact"
			class="text-gray text-center mt-2"
			v-html="t('stats.disclaimer', ['https://github.com/devmount/third-stats/issues/new?assignees=&labels=&template=bug_report.md'])"
		></div>
	</section>
</template>

<script setup>
import { inject } from "vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const version = inject('version');

const links = {
	donate:    'https://paypal.me/devmount',
	share:     'https://mastodonshare.com/?text=ThirdStats%20-%20' + t('extensionDescription.message') + '%20%40devmount%40mstdn.io%20%23thunderbird&url=https://addons.thunderbird.net/thunderbird/addon/thirdstats',
	star:      'https://github.com/devmount/third-stats/stargazers',
	review:    'https://addons.thunderbird.net/thunderbird/addon/thirdstats/#reviews',
	translate: 'https://github.com/devmount/third-stats/issues/343',
}

const props = defineProps({
	// true if data should show in a very small viewport (like the menu popup)
	compact: {
		type: Boolean,
		default: false
	}
});
</script>
