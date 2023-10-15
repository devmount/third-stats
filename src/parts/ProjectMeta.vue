<template>
	<section class="flex flex-col gap-4">
		<!-- title with version -->
		<div class="text-zinc-500 text-sm text-center">
			ThirdStats <code>{{ version }}</code>
		</div>
		<!-- cta -->
		<div v-if="!compact" class="text-zinc-500 text-sm text-center">{{ t('cta.message') }}</div>
		<div class="flex gap-4 justify-center">
			<template
				v-for="(link, key) in links"
				:key="key"
			>
				<tooltip :content="t(`cta.${key}`)" :disabled="!compact">
					<a
						:href="link.url"
						class="py-2 px-4 border rounded-sm flex gap-2 items-center transition-colors hover:text-white"
						:class="{
							'text-fuchsia-500 border-fuchsia-500 hover:bg-fuchsia-500': key === 'donate',
							'text-blue-500 border-blue-500 hover:bg-blue-500': key !== 'donate',
						}"
					>
						<component :is="link.icon" class="!w-5 !h-5" />
						<span v-if="!compact">{{ t(`cta.${key}`) }}</span>
					</a>
				</tooltip>
			</template>
		</div>
		<!-- disclaimer -->
		<div
			v-if="!compact"
			class="text-zinc-500 text-sm text-center"
			v-html="t('stats.disclaimer', ['https://github.com/devmount/third-stats/issues/new?assignees=&labels=&template=bug_report.md'])"
		></div>
	</section>
</template>

<script setup>
import { inject } from "vue";
import { useI18n } from 'vue-i18n';
import IconBrandMastodon from "@/icons/IconBrandMastodon.vue";
import IconHeart from "@/icons/IconHeart.vue";
import IconLanguage from "@/icons/IconLanguage.vue";
import IconPencil from "@/icons/IconPencil.vue";
import IconStar from "@/icons/IconStar.vue";
import Tooltip from "@/components/Tooltip.vue";

const { t } = useI18n();
const version = inject('version');

const links = {
	donate: {
		url: 'https://paypal.me/devmount',
		icon: IconHeart,
	},
	share: {
		url: 'https://sharetomastodon.github.io/?title=ThirdStats%20-%20a%20Thunderbird%20add-on%20for%20beautifully%20visualized%20email%20account%20stats%20by%20%40devmount%40mstdn.io%20%23thunderbird%20%23statistics&url=https://addons.thunderbird.net/thunderbird/addon/thirdstats',
		icon: IconBrandMastodon,
	},
	star: {
		url: 'https://github.com/devmount/third-stats/stargazers',
		icon: IconStar,
	},
	review: {
		url: 'https://addons.thunderbird.net/thunderbird/addon/thirdstats/#reviews',
		icon: IconPencil,
	},
	translate: {
		url: 'https://github.com/devmount/third-stats/issues/343',
		icon: IconLanguage,
	},
}

defineProps({
	// true if data should show in a very small viewport (like the menu popup)
	compact: {
		type: Boolean,
		default: false
	}
});
</script>
