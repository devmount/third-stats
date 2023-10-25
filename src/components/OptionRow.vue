<template>
	<div class="grid grid-cols-option gap-8">
		<label :for="field">
			<div class="flex items-end gap-2">
				{{ t(`options.${field}.label`) }}
				<tooltip v-if="requiresReload" :content="t('options.note.reloadWindowRequired')">
					<icon-refresh-alert class="!w-5 !h-5" />
				</tooltip>
				<tooltip v-if="requiresReprocessing" :content="t('options.note.refreshCacheRequired')">
					<icon-database-exclamation class="!w-5 !h-5" />
				</tooltip>
			</div>
			<span class="block text-zinc-500">
				<template v-if="description">{{ description }}</template>
				<template v-else>{{ t(`options.${field}.description`) }}</template>
			</span>
		</label>
		<div class="flex flex-col self-center gap-2">
			<slot></slot>
			<div v-if="info || infoText" class="flex gap-2 items-center text-zinc-500 text-sm">
				<icon-info-square class="!w-5 !h-5 shrink-0" />
				<span v-if="info">{{ t(`options.${field}.info`) }}</span>
				<span v-if="infoText">{{ infoText }}</span>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import IconInfoSquare from "@/icons/IconInfoSquare.vue";
import IconRefreshAlert from "@/icons/IconRefreshAlert.vue";
import IconDatabaseExclamation from "@/icons/IconDatabaseExclamation.vue";
import Tooltip from "@/components/Tooltip.vue";

const { t } = useI18n();

defineProps({
	// option field key
	field: {
		type: String,
	},
	// optional description to replace the default description
	description: {
		type: String,
		default: null
	},
	// show additional information beneath the input
	info: {
		type: Boolean,
		default: false
	},
	// optional info text to replace the default info
	infoText: {
		type: String,
		default: null
	},
	// show a page reload indication if true
	requiresReload: {
		type: Boolean,
		default: false
	},
	// show a cache refresh indication if true
	requiresReprocessing: {
		type: Boolean,
		default: false
	},
});
</script>
