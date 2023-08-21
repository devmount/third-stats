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
					<path d="M22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 .083 -6.135 -1.395 -8 -4c0 0 -4.182 7.433 4 11c-1.872 1.247 -3.739 2.088 -6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58 -1.04 6.522 -3.723 7.651 -7.742a13.84 13.84 0 0 0 .497 -3.753c-.002 -.249 1.51 -2.772 1.818 -4.013z" />
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
	share:     'https://twitter.com/intent/tweet?text=ThirdStats%20-%20a%20Thunderbird%20add-on%20for%20beautifully%20visualized%20email%20account%20stats%20by%20%40devmount%20%23thunderbird%20%23statistics%20https://addons.thunderbird.net/thunderbird/addon/thirdstats',
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
