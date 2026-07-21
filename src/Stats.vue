<template>
	<div class="text-normal background-normal position-relative">
		<!-- progress indicator -->
		<div class="progress position-fixed w-available top-0 right-0">
			<div
				class="h-0-25 text-center background-accent2 tooltip tooltip-bottom"
				:class="{ 'transition-width': processingState>0 && processingState<100 }"
				:style="'width:' + processingState + '%;'"
				:data-tooltip="oneDigit(processingState) + '%'"
			></div>
		</div>
		<div class="container pt-2 pb-6">
			<!-- title heading and filter -->
			<header id="header">
				<h1 class="mr-2 d-flex align-items-center">
					<img class="logo mr-1" src="/icon.svg" alt="ThirdStats Logo">
					{{ t("stats.title") }}
				</h1>
				<!-- filter area -->
				<div class="filter d-flex flex-wrap gap-1">
					<!-- account selection -->
					<div class="filter-account d-flex">
						<label for="account" class="align-center text-gray p-0-5">{{ t("stats.account") }}</label>
						<select v-model="active.account" :disabled="isLoading" class="align-stretch w-6" :class="{ disabled: isLoading }" id="account">
							<option v-if="accounts.length > 1 && options.cache" :value="'sum'">{{ t("stats.allAccounts") }}</option>
							<option v-else disabled>{{ t("stats.allAccounts") }}</option>
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
								<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
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
								<path class="icon-part-accent1" d="M10.24 3.957l-8.422 14.06a1.989 1.989 0 0 0 1.7 2.983h16.845a1.989 1.989 0 0 0 1.7 -2.983l-8.423 -14.06a1.989 1.989 0 0 0 -3.4 0z"></path>
								<path class="icon-part-accent1" d="M12 9v4"></path>
								<path class="icon-part-accent1" d="M12 17h.01"></path>
							</svg>
						</div>
					</div>
					<!-- folder selection -->
					<div class="filter-folder d-flex">
						<label for="folder" class="align-center text-gray p-0-5">{{ t("stats.folder") }}</label>
						<div
							class="d-flex align-stretch tooltip-bottom"
							:class="{ tooltip: !singleAccount }"
							:data-tooltip="t('stats.tooltips.folder.notAvailable', [t('stats.allAccounts')])"
						>
							<select
								id="folder"
								v-model="active.folder"
								:disabled="isLoading || !singleAccount"
								class="align-stretch w-6"
								:class="{ disabled: isLoading || !singleAccount }"
							>
								<option v-for="f in folders" :key="f.path" :value="f">{{ formatFolder(f) }}</option>
							</select>
						</div>
						<div
							class="cursor-pointer tooltip tooltip-bottom d-inline-flex align-center"
							:class="{ 'cursor-na': isLoading || !singleAccount }"
							:data-tooltip="t('stats.tooltips.clear')"
							:disabled="isLoading || !singleAccount"
							@click="!isLoading && singleAccount ? resetFolder(true) : null"
						>
							<svg class="icon icon-bold icon-gray" :class="{ 'icon-hover-accent': !isLoading && singleAccount }" viewBox="0 0 24 24">
								<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
								<line class="icon-part-accent2" x1="18" y1="6" x2="6" y2="18" />
								<line class="icon-part-accent2" x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</div>
					</div>
					<!-- time period selection -->
					<div class="filter-period d-flex">
						<label for="start" class="align-center text-gray p-0-5">{{ t("stats.timePeriod") }}</label>
						<div class="input-group d-flex align-stretch">
							<div
								class="d-flex tooltip tooltip-bottom"
								v-for="f in ['start', 'end']"
								:key="f"
								:data-tooltip="error.period[f].length > 0
									? error.period[f].join('\n')
									: t('stats.tooltips.period.' + f, [examplePeriodShort, examplePeriodFormatted])"
								:class="{ 'tooltip-error': error.period[f].length > 0 }"
							>
								<input
									type="text"
									:id="f"
									v-model="active.period[f]"
									class="align-stretch w-6"
									:class="{ 'error': error.period[f].length > 0, 'cursor-na': isLoading }"
									:disabled="isLoading"
									placeholder="YYYY-MM-DD"
									@blur="formatPeriod(f)"
									@keyup.enter="formatPeriod(f); updatePeriod()"
								/>
							</div>
							<button
								class="button-secondary align-center p-0-5"
								:class="{ 'cursor-na': isLoading }"
								:disabled="isLoading"
								@click="!isLoading ? updatePeriod() : null"
							>
								<svg class="icon icon-small icon-bold d-block m-0-auto" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M5 12l5 5l10 -10" />
								</svg>
							</button>
						</div>
						<div
							class="cursor-pointer tooltip tooltip-bottom d-inline-flex align-center"
							:class="{ 'cursor-na': isLoading }"
							:data-tooltip="t('stats.tooltips.clear')"
							:disabled="isLoading"
							@click="!isLoading ? resetPeriod(true) : null"
						>
							<svg class="icon icon-bold icon-gray" :class="{ 'icon-hover-accent': !isLoading }" viewBox="0 0 24 24">
								<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
								<line class="icon-part-accent2" x1="18" y1="6" x2="6" y2="18" />
								<line class="icon-part-accent2" x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</div>
					</div>
					<!-- contact selection -->
					<div class="filter-contact d-flex">
						<label for="contact" class="align-center text-gray p-0-5">{{ t("stats.contact", 1) }}</label>
						<div class="d-flex align-stretch tooltip-bottom">
							<select
								id="contact"
								v-model="active.contact"
								:disabled="isLoading"
								class="align-stretch w-6"
								:class="{ disabled: isLoading }"
							>
								<option v-for="c in contacts" :key="c" :value="c">{{ c }}</option>
							</select>
						</div>
						<div
							class="cursor-pointer tooltip tooltip-bottom d-inline-flex align-center"
							:class="{ 'cursor-na': isLoading }"
							:data-tooltip="t('stats.tooltips.clear')"
							@click="!isLoading ? resetContact(true) : null"
						>
							<svg class="icon icon-bold icon-gray" :class="{ 'icon-hover-accent': !isLoading }" viewBox="0 0 24 24">
								<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
								<line class="icon-part-accent2" x1="18" y1="6" x2="6" y2="18" />
								<line class="icon-part-accent2" x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</div>
					</div>
				</div>
				<!-- action buttons -->
				<div class="action d-inline-flex gap-1 ml-2">
					<!-- data export -->
					<div
						class="cursor-pointer tooltip tooltip-bottom d-inline-flex align-center"
						:class="{ 'cursor-na': isLoading }"
						:data-tooltip="t('stats.tooltips.exportData')"
						@click="!isLoading ? exportJson() : null"
					>
						<svg class="icon icon-bold icon-gray-alt icon-hover-accent" viewBox="0 0 24 24">
							<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
							<path class="icon-part-accent2" d="M14 3v4a1 1 0 0 0 1 1h4" />
							<path class="icon-part-accent2" d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
							<line class="icon-part-accent1" x1="9" y1="17" x2="9" y2="12" />
							<line class="icon-part-accent1-faded" x1="12" y1="17" x2="12" y2="16" />
							<line class="icon-part-accent1" x1="15" y1="17" x2="15" y2="14" />
						</svg>
					</div>
					<!-- options launcher -->
					<div
						class="cursor-pointer tooltip tooltip-bottom d-inline-flex align-center ml-1"
						:data-tooltip="t('popup.openOptions')"
						@click.prevent="openTab('index.options.html')"
					>
						<svg class="icon icon-bold icon-gray-alt icon-hover-accent" viewBox="0 0 24 24">
							<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
							<path class="icon-part-accent2" d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
							<circle class="icon-part-accent2-faded" cx="12" cy="12" r="3" />
						</svg>
					</div>
				</div>
				<!-- meta infos -->
				<div class="meta text-gray text-right">
					<div
						v-if="display.meta && display.meta.timestamp"
						class="d-inline-block tooltip tooltip-bottom"
						:data-tooltip="formatDate(display.meta.timestamp, locale)"
					>
						<LiveAge class="cursor-default" :date="display.meta.timestamp" />
					</div>
				</div>
			</header>
			<!-- fetured numbers -->
			<section class="numbers mx-auto mt-2">
				<!-- total -->
				<div>
					<div class="text-gray">{{ t("stats.mailsTotal") }}</div>
					<div class="featured">{{ display.numbers.total.toLocaleString() }}</div>
					<div class="text-gray">{{ t("stats.withinYears", [oneDigit(years)]) }}</div>
				</div>
				<!-- unread -->
				<div>
					<div class="text-gray">{{ t("stats.mailsUnread") }}</div>
					<div class="featured">{{ display.numbers.unread.toLocaleString() }}</div>
					<div class="text-gray" v-if="display.numbers.unread == 0">{{ t("stats.niceWork") }}</div>
					<div class="text-gray" v-else>{{ t("stats.percentOfReceived", [unreadPercentage]) }}</div>
				</div>
				<!-- received -->
				<div>
					<div class="text-accent2">{{ t("stats.mailsReceived") }}</div>
					<div class="featured text-accent2">{{ display.numbers.received.toLocaleString() }}</div>
					<div class="text-gray">{{ t("stats.percentOfTotal", [receivedPercentage]) }}</div>
				</div>
				<!-- sent -->
				<div>
					<div class="text-accent1">{{ t("stats.mailsSent") }}</div>
					<div class="featured text-accent1">{{ display.numbers.sent.toLocaleString() }}</div>
					<div class="text-gray">{{ t("stats.percentOfTotal", [sentPercentage]) }}</div>
				</div>
				<!-- per time unit -->
				<div>
					<div v-if="tabNumbers === tabsNumbers.years">
						<div class="text-gray">{{ t("stats.mailsPerYear") }}</div>
						<div class="featured">{{ perYear }}</div>
					</div>
					<div v-if="tabNumbers === tabsNumbers.quarters">
						<div class="text-gray">{{ t("stats.mailsPerQuarter") }}</div>
						<div class="featured">{{ perQuarter }}</div>
					</div>
					<div v-if="tabNumbers === tabsNumbers.months">
						<div class="text-gray">{{ t("stats.mailsPerMonth") }}</div>
						<div class="featured">{{ perMonth }}</div>
					</div>
					<div v-if="tabNumbers === tabsNumbers.weeks">
						<div class="text-gray">{{ t("stats.mailsPerWeek") }}</div>
						<div class="featured">{{ perWeek }}</div>
					</div>
					<div v-if="tabNumbers === tabsNumbers.days">
						<div class="text-gray">{{ t("stats.mailsPerDay") }}</div>
						<div class="featured">{{ perDay }}</div>
					</div>
					<div class="d-flex justify-center">
						<div class="d-inline-flex align-center cursor-pointer" @click.prevent="previousNumbersUnit()">
							<svg class="icon icon-small icon-bold icon-gray-alt icon-hover-accent" viewBox="0 0 24 24">
								<path stroke="none" d="M0 0h24v24H0z" fill="none" />
								<polyline class="icon-part-accent2" points="15 6 9 12 15 18" />
							</svg>
						</div>
						<div class="d-inline-flex">
							<span
								class="cursor-pointer p-0-25 text-hover-accent2 tooltip tooltip-bottom"
								:class="{ 'text-gray': tabNumbers !== tabsNumbers.years }"
								:data-tooltip="t('stats.mailsPerYear')"
								@click="tabNumbers = tabsNumbers.years"
							>
								<span class="text-mono">{{ t("stats.abbreviations.year") }}</span>
							</span>
							<span
								class="cursor-pointer p-0-25 text-hover-accent2 tooltip tooltip-bottom"
								:class="{ 'text-gray': tabNumbers !== tabsNumbers.quarters }"
								:data-tooltip="t('stats.mailsPerQuarter')"
								@click="tabNumbers = tabsNumbers.quarters"
							>
								<span class="text-mono">{{ t("stats.abbreviations.quarter") }}</span>
							</span>
							<span
								class="cursor-pointer p-0-25 text-hover-accent2 tooltip tooltip-bottom"
								:class="{ 'text-gray': tabNumbers !== tabsNumbers.months }"
								:data-tooltip="t('stats.mailsPerMonth')"
								@click="tabNumbers = tabsNumbers.months"
							>
								<span class="text-mono">{{ t("stats.abbreviations.month") }}</span>
							</span>
							<span
								class="cursor-pointer p-0-25 text-hover-accent2 tooltip tooltip-bottom"
								:class="{ 'text-gray': tabNumbers !== tabsNumbers.weeks }"
								:data-tooltip="t('stats.mailsPerWeek')"
								@click="tabNumbers = tabsNumbers.weeks"
							>
								<span class="text-mono">{{ t("stats.abbreviations.week") }}</span>
							</span>
							<span
								class="cursor-pointer p-0-25 text-hover-accent2 tooltip tooltip-bottom"
								:class="{ 'text-gray': tabNumbers !== tabsNumbers.days }"
								:data-tooltip="t('stats.mailsPerDay')"
								@click="tabNumbers = tabsNumbers.days"
							>
								<span class="text-mono">{{ t("stats.abbreviations.day") }}</span>
							</span>
						</div>
						<div class="d-inline-flex align-center cursor-pointer" @click.prevent="nextNumbersUnit()">
							<svg class="icon icon-small icon-bold icon-gray-alt icon-hover-accent" viewBox="0 0 24 24">
								<path stroke="none" d="M0 0h24v24H0z" fill="none" />
								<polyline class="icon-part-accent2" points="9 6 15 12 9 18" />
							</svg>
						</div>
					</div>
				</div>
				<!-- starred / tagged -->
				<div>
					<div class='text-gray'>{{ t('stats.mailsStarred') }}</div>
					<div class='featured'>{{ starred.toLocaleString() }}</div>
					<div class='text-gray'>{{ t('stats.mailsTagged', [tagged]) }}</div>
				</div>
				<!-- junk / junkScore -->
				<div>
					<div class='text-gray'>{{ t('stats.junkMails') }}</div>
					<div class='featured'>{{ junk.toLocaleString() }}</div>
					<div class='text-gray'>{{ t('stats.junkScore', [junkScore]) }}</div>
				</div>
			</section>
			<!-- still processing -->
			<section v-if="isLoading && display.numbers.total == 0" class="mt-5">
				<svg class="icon icon-huge icon-gray d-block m-0-auto icon-animated-color-transition" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<polyline points="4 19 8 13 12 15 16 10 20 14 20 19 4 19" />
					<polyline points="4 12 7 8 11 10 16 4 20 8" />
				</svg>
				<div class="text-center text-gray">
					{{ t("stats.loadingInProgress") }}
				</div>
			</section>
			<!-- empty account -->
			<section v-if="!isLoading && display.numbers.total == 0" class="mt-5">
				<svg class="icon icon-huge icon-gray d-block m-0-auto" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<rect x="4" y="4" width="16" height="16" rx="2" />
					<path d="M4 13h3l3 3h4l3 -3h3" />
				</svg>
				<div class="text-center text-gray">
					{{ t("stats.accountEmpty") }}
				</div>
			</section>
			<!-- charts -->
			<section v-if="display.numbers.total > 0" class="charts mt-3">
				<div
					id="chart-area-top"
					class="chart-area"
					:class="{ 'first-column-only': preferences.sections.total.expand }"
				>
					<TotalSection
						:display="display"
						:comparison="comparison"
						:accounts="accounts"
						:options="options"
						:min-year="minYear"
						:max-year="maxYear"
						:min-date="minDate"
						:max-date="maxDate"
						:preferences="preferences"
						:single-account="singleAccount"
						:accounts-color-gradient="accountsColorGradient"
						:tooltip-account-comparison="tooltipAccountComparison"
						:unfinished="active.period.end == null"
					/>
					<ActivitySection
						:display="display"
						:preferences="preferences"
						:min-year="minYear"
						:max-year="maxYear"
						:years-list="yearsList"
						:next-year="nextYear"
						:previous-year="previousYear"
					/>
				</div>
				<div id="chart-area-main" class="chart-area mt-2">
					<OnedimSection
						:display="display"
						:comparison="comparison"
						:accounts="accounts"
						:options="options"
						:preferences="preferences"
						:single-account="singleAccount"
						:accounts-color-gradient="accountsColorGradient"
						:tooltip-account-comparison="tooltipAccountComparison"
					/>
					<TwodimSection :display="display" />
					<LeaderSection :display="display" :options="options" />
					<FoldersSection :display="display" />
					<TagsSection :display="display" :tags="tags" :options="options" />
				</div>
			</section>
			<!-- footer -->
			<project-meta class="mt-6 " />
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

// internal components
import { tabsNumbers } from "@/definitions.js";

import {
	formatDate,
	oneDigit,
	openTab,
	startOfToday,
	twoDigit,
} from "@/utils.js";

import { useStatsData } from "@/composables/useStatsData.js";

import LiveAge from "@/parts/LiveAge.vue";
import ProjectMeta from "@/parts/ProjectMeta.vue";
import TotalSection from "@/sections/TotalSection.vue";
import ActivitySection from "@/sections/ActivitySection.vue";
import OnedimSection from "@/sections/OnedimSection.vue";
import TwodimSection from "@/sections/TwodimSection.vue";
import LeaderSection from "@/sections/LeaderSection.vue";
import FoldersSection from "@/sections/FoldersSection.vue";
import TagsSection from "@/sections/TagsSection.vue";

const { t, locale } = useI18n();

// example date formats
const now = new Date();
// returns the current date as example for short period input (YYMMDD)
const examplePeriodShort = now.toISOString().replace(/-/g, "").slice(2,8);
// returns the current date as example for formatted period input (YYYY-MM-DD)
const examplePeriodFormatted = now.toISOString().slice(0,10);

// tab navigation for the featured-numbers unit cycler (per-section tabs now live in their own components)
const tabNumbers = ref(tabsNumbers.weeks);

// stats page data-fetch/aggregation engine (see composables/useStatsData.js) -
// this composable owns accounts/identities/folders/tags/active/error/isLoading/progress/
// preferences/options/display/comparison internally, so it must only be invoked here.
const engine = useStatsData();
const {
	accounts,
	folders,
	tags,
	active,
	error,
	isLoading,
	progress,
	preferences,
	options,
	display,
	comparison,
	singleAccount,
	minDate,
	maxDate,
	minYear,
	maxYear,
	yearsList,
	accountsColorGradient,
	processingState,
	contacts,
	loadAccount,
	resetFolder,
	resetContact,
	resetPeriod,
	updatePeriod,
	formatFolder,
	formatPeriod,
	nextYear,
	previousYear,
	exportJson,
	tooltipAccountComparison,
} = engine;

// cycles forward through numbers tabs
// jumps to first tab if last tab reached
const nextNumbersUnit = () => {
	const tabsCount = Object.keys(tabsNumbers).length;
	tabNumbers.value = (tabNumbers.value % tabsCount) + 1;
};

// cycles backwards through numbers tabs
// jumps to last tab if first tab reached
const previousNumbersUnit = () => {
	const tabsCount = Object.keys(tabsNumbers).length;
	tabNumbers.value = (((tabNumbers.value-2 % tabsCount) + tabsCount) % tabsCount) + 1;
};

// number of days from oldest email till today or depending on period filter
const days = computed(() => {
	const oneDay = 24 * 60 * 60 * 1000;
	const start = new Date(display.value.meta.start);
	const end = display.value.meta.end ? new Date(display.value.meta.end) : new Date();
	return Math.round(Math.abs((start - end) / oneDay));
});
// number of weeks from oldest email till today
const weeks = computed(() => days.value/7);
// number of months from oldest email till today
const months = computed(() => days.value/(365/12));
// number of quarters from oldest email till today
const quarters = computed(() => days.value/(365/4));
// number of years from oldest email till today
const years = computed(() => days.value/365);

// percentage of number of received/total emails
const receivedPercentage = computed(() => {
	return (display.value.numbers.total > 0)
		? twoDigit(display.value.numbers.received*100/display.value.numbers.total)
		: 0;
});
// percentage of number of sent/total emails
const sentPercentage = computed(() => {
	return (display.value.numbers.total > 0)
		? twoDigit(display.value.numbers.sent*100/display.value.numbers.total)
		: 0;
});
// percentage of number of unread/received emails
const unreadPercentage = computed(() => {
	return (display.value.numbers.received > 0)
		? twoDigit(display.value.numbers.unread*100/display.value.numbers.received)
		: 0;
});
// average number of emails/day
const perDay = computed(() => {
	return (display.value.numbers.total > 0 && days.value > 0)
		? oneDigit(display.value.numbers.total/days.value)
		: 0;
});
// average number of emails/week
const perWeek = computed(() => {
	return (display.value.numbers.total > 0 && weeks.value > 0)
		? oneDigit(display.value.numbers.total/weeks.value)
		: 0;
});
// average number of emails/month
const perMonth = computed(() => {
	return (display.value.numbers.total > 0 && months.value > 0)
		? oneDigit(display.value.numbers.total/months.value)
		: 0;
});
// average number of emails/quarter
const perQuarter = computed(() => {
	return (display.value.numbers.total > 0 && quarters.value > 0)
		? oneDigit(display.value.numbers.total/quarters.value)
		: 0;
});
// average number of emails/year
const perYear = computed(() => {
	return (display.value.numbers.total > 0 && years.value > 0)
		? oneDigit(display.value.numbers.total/years.value)
		: 0;
});
// number of starred mails
const starred = computed(() => {
	return (display.value.numbers.starred && display.value.numbers.starred > 0)
		? display.value.numbers.starred
		: 0;
});
// number of tagged mails
const tagged = computed(() => {
	return (display.value.numbers.tagged && display.value.numbers.tagged > 0)
		? display.value.numbers.tagged
		: 0;
});
// number of junk mails
const junk = computed(() => {
	return (display.value.numbers.junk && display.value.numbers.junk > 0)
		? display.value.numbers.junk
		: 0;
});
// junk score
const junkScore = computed(() => {
	return (display.value.numbers.junkScore && display.value.numbers.total > 0)
		? oneDigit(display.value.numbers.junkScore/display.value.numbers.total)
		: 0;
});

onMounted(async () => {
	// bootstrap the stats data engine (fetch options/tags/accounts, start auto-refresh)
	await engine.init();
});
</script>

<style>
@import url('assets/main.css');

body {
	overflow-x: hidden;
}

#stats {
	min-height: 100vh;

	.container {
		width: 100%;
		height: 100%;
		margin: 0 auto;
		padding-left: 1rem;
		padding-right: 1rem;
		box-sizing: border-box;
	}
}

@media (max-width: 4320px) {
	#stats .container {
		max-width: 2500px;

		.numbers {
			max-width: 1500px;
			grid-template-columns: repeat(7, 1fr);
		}
		#chart-area-top {
			grid-template-columns: calc(100% - 1130px - 2rem) 1130px;
		}
		#chart-area-top.first-column-only {
			grid-template-columns: calc(100% - 1rem) 0%;
		}
		#chart-area-top .resizer {
			display: list-item;
		}
		#chart-area-main {
			grid-template-columns: calc(33.33% - 1rem) 550px auto;
		}
	}
}
@media (max-width: 2500px) {
	#stats .container {
		max-width: 2200px;
	}
}
@media (max-width: 2000px) {
	#stats .container {
		max-width: 1750px;
	}
}
@media (max-width: 1750px) {
	#stats .container {
		max-width: 1200px;

		#header {
			grid-template-areas: "title meta action" "filter filter filter";
			grid-template-columns: 1fr auto 5rem;
		}
		#header .filter {
			justify-content: end;
		}
		#chart-area-top {
			grid-template-columns: calc(100% - 1rem);
		}
		#chart-area-top .resizer {
			display: none;
		}
		#chart-area-main {
			grid-template-columns: calc(100% - 1rem);
		}
	}
}
@media (max-width: 960px) {
	#stats .container .numbers {
		grid-template-columns: repeat(3, 1fr);
	}
}

#stats .container {
	header {
		margin-top: 0;
		margin-bottom: 1rem;
		display: grid;
		grid-template-areas: "title filter action" "meta meta meta";
		grid-template-columns: 1fr auto auto;
		gap: 1rem;
		align-items: center;

		h1 {
			grid-area: title;
			margin: 0;

			.logo {
				height: 48px;
			}
		}
		.filter {
			grid-area: filter;
			gap: 1rem;
			margin-left: auto;

			.loader {
				margin: 4px 4px 4px 7px;
			}
			.refresh {
				margin-left: 3px;
			}
		}
		.action {
			grid-area: action;
			justify-self: end;
		}
		.meta {
			grid-area: meta;
			justify-self: end;
		}
	}

	> h2 {
		font-weight: 300;
	}

	.numbers {
		display: grid;
		column-gap: 1rem;
		row-gap: 2rem;

		> div {
			text-align: center;

			.featured {
				font-size: 3.25em;
				line-height: 1.25em;
				font-weight: 500;
			}
		}
	}
	.charts .chart-area {
		display: grid;
		column-gap: 2rem;
		row-gap: 1rem;
		transition: grid-template-columns 0.2s;

		> *,
		.tab-content:not(.chart-group) > *:not(.tab-empty) {
			min-height: 380px;
		}
		.chart {
			min-width: 0;

			h2 {
				margin-bottom: 0;
			}
			p {
				margin-top: 0;
			}
		}
	}
}


</style>
