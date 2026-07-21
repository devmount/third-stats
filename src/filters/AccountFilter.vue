<template>
	<div class="filter-account d-flex">
		<label for="account" class="align-center text-gray p-0-5">{{ t('stats.account') }}</label>
		<select
			v-model="active.account"
			:disabled="isLoading"
			class="align-stretch w-6"
			:class="{ disabled: isLoading }"
			id="account"
		>
			<option v-if="accounts.length > 1 && options.cache" :value="'sum'">{{ t('stats.allAccounts') }}</option>
			<option v-else disabled>{{ t('stats.allAccounts') }}</option>
			<option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
		</select>
		<div v-show="isLoading" class="align-center loader loader-accent2"></div>
		<div
			v-show="!isLoading"
			class="refresh align-center cursor-pointer tooltip tooltip-bottom d-inline-flex"
			:data-tooltip="t('stats.tooltips.refresh')"
			@click="loadAccount(active.account, true)"
		>
			<svg class="icon icon-bold icon-gray-alt icon-hover-accent" viewBox="0 0 24 24">
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<path class="icon-part-accent2" d="M9 4.55a8 8 0 0 1 6 14.9m0 -4.45v5h5" />
				<line class="icon-part-accent2" x1="5.63" y1="7.16" x2="5.63" y2="7.17" />
				<line class="icon-part-accent2-faded" x1="4.06" y1="11" x2="4.06" y2="11.01" />
				<line class="icon-part-accent2-faded" x1="4.63" y1="15.1" x2="4.63" y2="15.11" />
				<line class="icon-part-accent2-faded" x1="7.16" y1="18.37" x2="7.16" y2="18.38" />
				<line class="icon-part-accent2-faded" x1="11" y1="19.94" x2="11" y2="19.95" />
			</svg>
		</div>
		<div
			v-if="error.account"
			class="align-center tooltip tooltip-bottom d-inline-flex ml-0-5"
			:data-tooltip="t('stats.tooltips.error.processing')"
		>
			<svg class="icon icon-bold icon-small icon-accent1-faded icon-hover-accent" viewBox="0 0 24 24">
				<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
				<path
					class="icon-part-accent1"
					d="M10.24 3.957l-8.422 14.06a1.989 1.989 0 0 0 1.7 2.983h16.845a1.989 1.989 0 0 0 1.7 -2.983l-8.423 -14.06a1.989 1.989 0 0 0 -3.4 0z"
				></path>
				<path class="icon-part-accent1" d="M12 9v4"></path>
				<path class="icon-part-accent1" d="M12 17h.01"></path>
			</svg>
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { accounts, active, error, isLoading, options, loadAccount } = inject('engine');

const { t } = useI18n();
</script>
