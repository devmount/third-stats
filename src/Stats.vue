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
						<div v-show="isLoading" class="loading align-center loader-accent2"></div>
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
							@click="singleAccount ? resetFolder(true) : null"
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
								:data-tooltip="error.period[f].length > 0 ? error.period[f].join('\n') : t('stats.tooltips.period.' + f, [examplePeriodShort, examplePeriodFormatted])"
								:class="{ 'tooltip-error': error.period[f].length > 0 }"
							>
								<input
									type="text"
									:id="f"
									v-model="active.period[f]"
									class="align-stretch w-6"
									:class="{ error: error.period[f].length > 0 }"
									placeholder="YYYY-MM-DD"
									@blur="formatPeriod(f)"
									v-on:keyup.enter="formatPeriod(f); updatePeriod()"
								/>
							</div>
							<button @click="updatePeriod" class="button-secondary align-center p-0-5">
								<svg class="icon icon-small icon-bold d-block m-0-auto" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M5 12l5 5l10 -10" />
								</svg>
							</button>
						</div>
						<div class="cursor-pointer tooltip tooltip-bottom d-inline-flex align-center" :data-tooltip="t('stats.tooltips.clear')" @click="resetPeriod(true)">
							<svg class="icon icon-bold icon-gray icon-hover-accent" viewBox="0 0 24 24">
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
						:data-tooltip="t('stats.tooltips.exportData')"
						@click="exportJson()"
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
					<!-- section: total -->
					<div class="tab-area">
						<ul class="tab">
							<li
								v-for="(id, key) in tabsTotal"
								:key="key"
								class="tab-item cursor-default tooltip tooltip-bottom border-bottom-accent2"
								:data-tooltip="t('stats.charts.' + key + '.description')"
								:class="{
									'active': tabTotal === id,
									'cursor-pointer text-hover-accent2': tabTotal !== id
								}"
								@click="tabTotal = id"
							>
								<span
									class="transition-color transition-border-image"
									:class="{ 'border-bottom-gradient-accent2-accent1': !preferences.sections.total.comparison }"
									:style="tabTotal === id && preferences.sections.total.comparison ? 'border-image: linear-gradient(to right, ' + accountsColorGradient + ') 100% 1' : ''"
								>
									{{ t("stats.charts." + key + ".title") }}
								</span>
							</li>
							<li
								class="tooltip tooltip-bottom px-1 ml-auto"
								:class="{
									'cursor-pointer': !singleAccount,
									'text-hover-accent2': !singleAccount
								}"
								:data-tooltip="tooltipAccountComparison('total')"
								@click="!singleAccount ? preferences.sections.total.comparison=!preferences.sections.total.comparison : null"
							>
								<svg
									class="icon icon-text"
									:class="{
										'icon-hover-accent': !singleAccount,
										'icon-accent2': preferences.sections.total.comparison && !singleAccount,
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
								class="resizer cursor-pointer tooltip tooltip-bottom text-hover-accent2 px-1"
								:data-tooltip="
									!preferences.sections.total.expand
									? t('stats.tooltips.expand')
									: t('stats.tooltips.shrink')
								"
								@click="preferences.sections.total.expand=!preferences.sections.total.expand"
							>
								<svg v-show="!preferences.sections.total.expand" class="icon icon-text" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<polyline points="16 4 20 4 20 8" /><line x1="14" y1="10" x2="20" y2="4" />
									<polyline points="8 20 4 20 4 16" /><line x1="4" y1="20" x2="10" y2="14" />
									<polyline points="16 20 20 20 20 16" /><line x1="14" y1="14" x2="20" y2="20" />
									<polyline points="8 4 4 4 4 8" /><line x1="4" y1="4" x2="10" y2="10" />
								</svg>
								<svg v-show="preferences.sections.total.expand" class="icon icon-text icon-arrows-minimize" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<polyline points="5 9 9 9 9 5" /><line x1="3" y1="3" x2="9" y2="9" />
									<polyline points="5 15 9 15 9 19" /><line x1="3" y1="21" x2="9" y2="15" />
									<polyline points="19 9 15 9 15 5" /><line x1="15" y1="9" x2="21" y2="3" />
									<polyline points="19 15 15 15 15 19" /><line x1="15" y1="15" x2="21" y2="21" />
								</svg>
							</li>
						</ul>
						<div class="tab-content mt-1">
							<!-- emails per year over total time -->
							<LineChart
								v-if="tabTotal === tabsTotal.years && !preferences.sections.total.comparison"
								:datasets="yearsChartData.datasets"
								:labels="yearsChartData.labels"
								:ordinate="options.ordinate"
								:abscissa="true"
								:unfinished="active.period.end == null"
							/>
							<LineChart
								v-if="tabTotal === tabsTotal.years && preferences.sections.total.comparison"
								:datasets="yearsComparedChartData.datasets"
								:labels="yearsComparedChartData.labels"
								:ordinate="options.ordinate"
								:abscissa="true"
								:unfinished="active.period.end == null"
							/>
							<!-- emails per quarter over total time -->
							<LineChart
								v-if="tabTotal === tabsTotal.quarters && !preferences.sections.total.comparison"
								:datasets="quartersChartData.datasets"
								:labels="quartersChartData.labels"
								:ordinate="options.ordinate"
								:abscissa="true"
								:unfinished="active.period.end == null"
							/>
							<LineChart
								v-if="tabTotal === tabsTotal.quarters && preferences.sections.total.comparison"
								:datasets="quartersComparedChartData.datasets"
								:labels="quartersComparedChartData.labels"
								:ordinate="options.ordinate"
								:abscissa="true"
								:unfinished="active.period.end == null"
							/>
							<!-- emails per month over total time -->
							<LineChart
								v-if="tabTotal === tabsTotal.months && !preferences.sections.total.comparison"
								:datasets="monthsChartData.datasets"
								:labels="monthsChartData.labels"
								:ordinate="options.ordinate"
								:abscissa="true"
								:unfinished="active.period.end == null"
							/>
							<LineChart
								v-if="tabTotal === tabsTotal.months && preferences.sections.total.comparison"
								:datasets="monthsComparedChartData.datasets"
								:labels="monthsComparedChartData.labels"
								:ordinate="options.ordinate"
								:abscissa="true"
								:unfinished="active.period.end == null"
							/>
							<!-- emails per week over total time -->
							<LineChart
								v-if="tabTotal === tabsTotal.weeks && !preferences.sections.total.comparison"
								:datasets="weeksChartData.datasets"
								:labels="weeksChartData.labels"
								:ordinate="options.ordinate"
								:abscissa="true"
								:unfinished="active.period.end == null"
							/>
							<LineChart
								v-if="tabTotal === tabsTotal.weeks && preferences.sections.total.comparison"
								:datasets="weeksComparedChartData.datasets"
								:labels="weeksComparedChartData.labels"
								:ordinate="options.ordinate"
								:abscissa="true"
							/>
						</div>
					</div>
					<!-- section: activity -->
					<div v-show="!preferences.sections.total.expand" class="tab-area position-relative">
						<div class="position-absolute top-0-5 right-0-5 d-flex gap-0-5">
							<div class="d-inline-flex align-center" :class="{'cursor-pointer': preferences.sections.activity.year > minYear}" @click.prevent="previousYear()">
								<svg class="icon icon-bold icon-gray-alt icon-hover-accent" :class="{'v-hidden': preferences.sections.activity.year <= minYear}" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<polyline class="icon-part-accent2" points="15 6 9 12 15 18" />
								</svg>
							</div>
							<select v-model="preferences.sections.activity.year" name="year">
								<option v-for="y in yearsList" :key="y" :value="y">{{ y }}</option>
							</select>
							<div class="d-inline-flex align-center" :class="{'cursor-pointer': preferences.sections.activity.year < maxYear}" @click.prevent="nextYear()">
								<svg class="icon icon-bold icon-gray-alt icon-hover-accent" :class="{'v-hidden': preferences.sections.activity.year >= maxYear}" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<polyline class="icon-part-accent2" points="9 6 15 12 9 18" />
								</svg>
							</div>
						</div>
						<ul class="tab">
							<li
								v-for="(id, key) in tabsActivity"
								:key="key"
								class="tab-item cursor-default tooltip tooltip-bottom"
								:data-tooltip="t('stats.charts.' + key + '.description')"
								:class="{
									'active': tabActivity === id,
									'cursor-pointer text-hover-accent2': tabActivity !== id
								}"
								@click="tabActivity = id"
							>
								<span class="transition-color transition-border-image border-bottom-gradient-accent2-accent1">
									{{ preferences.sections.activity.year == (new Date()).getFullYear()
											? t("stats.charts." + key + ".latestActivity")
											: t("stats.charts." + key + ".title", [preferences.sections.activity.year]) }}
								</span>
							</li>
						</ul>
						<div class="tab-content chart-group mt-1">
							<!-- activity per day received -->
							<MatrixChart
								cid="activity-received"
								color="#0a84ff"
								:spacing="1"
								:rounding="5"
								:dimension="{ cols: 53, rows: 7 }"
								:parseTime="true"
								:datasets="[dateChartData.received]"
							/>
							<!-- activity per day sent -->
							<MatrixChart
								cid="activity-send"
								color="#e64db9"
								:spacing="1"
								:rounding="5"
								:parseTime="true"
								:dimension="{ cols: 53, rows: 7 }"
								:datasets="[dateChartData.sent]"
							/>
						</div>
					</div>
				</div>
				<div id="chart-area-main" class="chart-area mt-2">
					<!-- section: onedim -->
					<div class="tab-area">
						<ul class="tab">
							<li
								v-for="(id, key) in tabsOnedim"
								:key="key"
								class="tab-item cursor-default tooltip tooltip-bottom"
								:data-tooltip="t('stats.charts.' + key + '.description')"
								:class="{
									'active': tabOnedim === id,
									'cursor-pointer text-hover-accent2': tabOnedim !== id
								}"
								@click="tabOnedim = id"
							>
								<span
									class="transition-color transition-border-image"
									:class="{ 'border-bottom-gradient-accent2-accent1': !preferences.sections.onedim.comparison }"
									:style="tabOnedim === id && preferences.sections.onedim.comparison ? 'border-image: linear-gradient(to right, ' + accountsColorGradient + ') 100% 1' : ''"
								>
									{{ t("stats.charts." + key + ".title") }}
								</span>
							</li>
							<li
								class="tooltip tooltip-bottom px-1 ml-auto"
								:class="{
									'cursor-pointer': !singleAccount,
									'text-hover-accent2': !singleAccount
								}"
								:data-tooltip="tooltipAccountComparison('onedim')"
								@click="!singleAccount ? preferences.sections.onedim.comparison=!preferences.sections.onedim.comparison : null"
							>
								<svg
									class="icon icon-text"
									:class="{
										'icon-hover-accent': !singleAccount,
										'icon-accent2': preferences.sections.onedim.comparison && !singleAccount,
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
						</ul>
						<div class="tab-content mt-1">
							<!-- emails per time of day -->
							<BarChart
								v-if="tabOnedim === tabsOnedim.daytime && !preferences.sections.onedim.comparison"
								:datasets="daytimeChartData.datasets"
								:labels="daytimeChartData.labels"
								:ordinate="options.ordinate"
							/>
							<BarChart
								v-if="tabOnedim === tabsOnedim.daytime && preferences.sections.onedim.comparison"
								:datasets="daytimeComparedChartData.datasets"
								:labels="daytimeComparedChartData.labels"
								:ordinate="options.ordinate"
							/>
							<!-- emails per day of week -->
							<BarChart
								v-if="tabOnedim === tabsOnedim.weekday && !preferences.sections.onedim.comparison"
								:datasets="weekdayChartData.datasets"
								:labels="weekdayChartData.labels"
								:ordinate="options.ordinate"
							/>
							<BarChart
								v-if="tabOnedim === tabsOnedim.weekday && preferences.sections.onedim.comparison"
								:datasets="weekdayComparedChartData.datasets"
								:labels="weekdayComparedChartData.labels"
								:ordinate="options.ordinate"
							/>
							<!-- emails per month of year -->
							<BarChart
								v-if="tabOnedim === tabsOnedim.month && !preferences.sections.onedim.comparison"
								:datasets="monthChartData.datasets"
								:labels="monthChartData.labels"
								:ordinate="options.ordinate"
							/>
							<BarChart
								v-if="tabOnedim === tabsOnedim.month && preferences.sections.onedim.comparison"
								:datasets="monthComparedChartData.datasets"
								:labels="monthComparedChartData.labels"
								:ordinate="options.ordinate"
							/>
						</div>
					</div>
					<!-- section: twodim -->
					<div class="tab-area">
						<ul class="tab">
							<li
								v-for="(id, key) in tabsTwodim"
								:key="key"
								class="tab-item cursor-default tooltip tooltip-bottom"
								:data-tooltip="t('stats.charts.' + key + '.description')"
								:class="{
									'active': tabTwodim === id,
									'cursor-pointer text-hover-accent2': tabTwodim !== id
								}"
							>
								<span class="transition-color transition-border-image border-bottom-gradient-accent2-accent1">
									{{ t("stats.charts." + key + ".title") }}
								</span>
							</li>
						</ul>
						<div class="tab-content chart-group mt-1">
							<!-- emails per weekday per hour received -->
							<MatrixChart
								cid="wd-per-hour-received"
								color="#0a84ff"
								:spacing="1"
								:rounding="5"
								:dimension="{ cols: 24, rows: 7 }"
								:parseTime="false"
								:datasets="[weekdayPerHourChartData.received]"
							/>
							<!-- emails per weekday per hour sent -->
							<MatrixChart
								cid="wd-per-hour-send"
								color="#e64db9"
								:spacing="1"
								:rounding="5"
								:dimension="{ cols: 24, rows: 7 }"
								:parseTime="false"
								:datasets="[weekdayPerHourChartData.sent]"
							/>
						</div>
					</div>
					<!-- section: leader -->
					<div class="tab-area">
						<ul class="tab">
							<li
								v-for="(id, key) in tabsLeader"
								:key="key"
								class="tab-item cursor-default tooltip tooltip-bottom"
								:data-tooltip="t('stats.charts.' + key + '.description')"
								:class="{
									'active': tabLeader === id,
									'cursor-pointer text-hover-accent2': tabLeader !== id
								}"
								@click="tabLeader = id"
							>
								<span
									class="transition-color transition-border-color"
									:class="{
										'border-bottom-accent1': key === tabsLeader.contactsSent,
										'border-bottom-accent2': key === tabsLeader.contactsReceived,
										'border-bottom-accent3': key === tabsLeader.contactsJunk,
									}"
								>
									{{ t("stats.charts." + key + ".title") }}
								</span>
							</li>
						</ul>
						<div class="tab-content mt-1">
							<!-- contacts most emails received from -->
							<BarChart
								v-if="tabLeader === tabsLeader.contactsReceived && receivedContactLeadersChartDataExists"
								:datasets="receivedContactLeadersChartData.datasets"
								:labels="receivedContactLeadersChartData.labels"
								:horizontal="true"
							/>
							<div v-if="tabLeader === tabsLeader.contactsReceived && !receivedContactLeadersChartDataExists" class="tab-empty text-center mt-5">
								<svg class="icon icon-large icon-gray icon-thin d-block m-0-auto" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
									<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
									<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
									<line x1="3" y1="3" x2="21" y2="21" />
								</svg>
								<div class="text-gray mt-1" v-html="t('stats.charts.contactsReceived.empty')"></div>
							</div>
							<!-- contacts most emails sent to -->
							<BarChart
								v-if="tabLeader === tabsLeader.contactsSent && sentContactLeadersChartDataExists"
								:datasets="sentContactLeadersChartData.datasets"
								:labels="sentContactLeadersChartData.labels"
								:horizontal="true"
							/>
							<div v-if="tabLeader === tabsLeader.contactsSent && !sentContactLeadersChartDataExists" class="tab-empty text-center mt-5">
								<svg class="icon icon-large icon-gray icon-thin d-block m-0-auto" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
									<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
									<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
									<line x1="3" y1="3" x2="21" y2="21" />
								</svg>
								<div class="text-gray mt-1" v-html="t('stats.charts.contactsSent.empty')"></div>
							</div>
							<!-- contacts flagged as junk -->
							<BarChart
								v-if="tabLeader === tabsLeader.contactsJunk && junkContactLeadersChartDataExists"
								:datasets="junkContactLeadersChartData.datasets"
								:labels="junkContactLeadersChartData.labels"
								:horizontal="true"
							/>
							<div v-if="tabLeader === tabsLeader.contactsJunk && !junkContactLeadersChartDataExists" class="tab-empty text-center mt-5">
								<svg class="icon icon-large icon-gray icon-thin d-block m-0-auto" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
									<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
									<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
									<line x1="3" y1="3" x2="21" y2="21" />
								</svg>
								<div class="text-gray mt-1" v-html="t('stats.charts.contactsJunk.empty')"></div>
							</div>
						</div>
					</div>
					<!-- section: folders -->
					<div class="tab-area" v-if="display.folders">
						<ul class="tab">
							<li
								v-for="(id, key) in tabsFolders"
								:key="key"
								class="tab-item cursor-default tooltip tooltip-bottom"
								:data-tooltip="t('stats.charts.' + key + '.description')"
								:class="{
									'active': tabFolders === id,
									'cursor-pointer text-hover-accent2': tabFolders !== id
								}"
							>
								<span
									class="transition-color transition-border-image border-bottom-gradient-accent2-accent1"
								>
									{{ t("stats.charts." + key + ".title") }}
								</span>
							</li>
						</ul>
						<div class="tab-content mt-1">
							<!-- folders emails received -->
							<DoughnutChart
								:info="{ number: foldersChartData.labels.length, label: t('stats.nonEmptyFolders', foldersChartData.labels.length) }"
								:datasets="foldersChartData.datasets"
								:labels="foldersChartData.labels"
							/>
						</div>
					</div>
					<!-- section: tags -->
					<div class="tab-area" v-if="display.tags">
						<ul class="tab">
							<li
								v-for="(id, key) in tabsTags"
								:key="key"
								class="tab-item cursor-default tooltip tooltip-bottom"
								:data-tooltip="t('stats.charts.' + key + '.description')"
								:class="{
									'active': tabTags === id,
									'cursor-pointer text-hover-accent2': tabTags !== id
								}"
							>
								<span
									class="transition-color transition-border-color border-bottom-accent3"
								>
									{{ t("stats.charts." + key + ".title") }}
								</span>
							</li>
						</ul>
						<div class="tab-content mt-1">
							<!-- tags count -->
							<BarChart
								v-if="tagsChartDataExists"
								:datasets="tagsChartData.datasets"
								:labels="tagsChartData.labels"
								:horizontal="true"
							/>
							<div v-if="!tagsChartDataExists" class="tab-empty text-center mt-5">
								<svg class="icon icon-large icon-gray icon-thin d-block m-0-auto" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74" />
									<path d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6" />
									<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
									<line x1="3" y1="3" x2="21" y2="21" />
								</svg>
								<div class="text-gray mt-1" v-html="t('stats.charts.tagsCount.empty')"></div>
							</div>
						</div>
					</div>
				</div>
			</section>
			<!-- footer -->
			<project-meta class="mt-6 " />
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// internal components
import {
	accentColors,
	defaultColors,
	defaultOptions,
	tabsNumbers,
	tabsTotal,
	tabsActivity,
	tabsOnedim,
	tabsTwodim,
	tabsLeader,
	tabsFolders,
	tabsTags,
} from "@/definitions.js";

import {
	contactInvolved,
	extractEmailAddress,
	formatDate,
	isSelfMessage,
	monthNames,
	NumberedObject,
	oneDigit,
	openTab,
	quarterNumber,
	queryMessages,
	setTheme,
	sortAndLimitObject,
	startOfToday,
	sumObjects,
	sumObjectsObjects,
	traverseAccount,
	twoDigit,
	weekdayNames,
	weekNumber,
	weeksBetween,
	yyyymmdd,
} from "@/utils.js";

import LineChart from "@/charts/LineChart.vue";
import BarChart from "@/charts/BarChart.vue";
import MatrixChart from "@/charts/MatrixChart.vue";
import DoughnutChart from "@/charts/DoughnutChart.vue";
import LiveAge from "@/parts/LiveAge.vue";
import ProjectMeta from "@/parts/ProjectMeta.vue";

const { t, locale } = useI18n();

// example date formats
const now = new Date();
// returns the current date as example for short period input (YYMMDD)
const examplePeriodShort = now.toISOString().replace(/-/g, "").slice(2,8);
// returns the current date as example for formatted period input (YYYY-MM-DD)
const examplePeriodFormatted = now.toISOString().slice(0,10);

// list of all existing Thunderbird accounts
const accounts = ref([]);

// list of all existing identities
const identities = ref([]);

// list of all existing folders for the current account selection
const folders = ref([]);

// list of all existing tags
const tags = ref([]);

// selected filter field values and field errors
const active = reactive({
	account: null, // currently selected account
	folder: null,  // currently selected folder
	contact: null, // currently selected contact
	period: {
		start: null, // currently configured start of period of time
		end: null,   // currently configured end of period of time
	}
});
const error = reactive({
	account: false, // truey if there where any errors on account message retrieval
	period: {
		start: [],    // list of error messages if currently configured period start date is invalid
		end: [],      // list of error messages if currently configured period end date is invalid
	}
});

// tab navigation for all sections
const tabNumbers = ref(tabsNumbers.weeks);
const tabTotal = ref(tabsTotal.years);
const tabActivity = ref(tabsActivity.days);
const tabOnedim = ref(tabsOnedim.daytime);
const tabTwodim = ref(tabsTwodim.temporalDistribution);
const tabLeader = ref(tabsLeader.contactsReceived);
const tabFolders = ref(tabsFolders.foldersDistribution);
const tabTags = ref(tabsTags.tagsCount);

// loading and process indication if data is processing
const isLoading = ref(false);
const progress = reactive({
	current: 0, // indicator for progress on refreshing data, fraction [0-1]
	max: 0,     // upper limit for progress indicator
});

// preferences for stats page configuration
const preferences = reactive({
	sections: {
		total: {
			expand: false,
			comparison: false
		},
		activity: {
			year: now.getFullYear()
		},
		onedim: {
			comparison: false
		}
	}
});

// initially load default add-on options
const options = reactive({...defaultOptions});

// basic data structure to display stats numbers and charts
// used for single and multi-account display
const initData = () => ({
	meta: {
		timestamp: null,
		start: active.period.start ? new Date(active.period.start) : new Date(),
		end: active.period.end ? new Date(active.period.end) : new Date(),
	},
	numbers: {
		total: 0,
		unread: 0,
		received: 0,
		sent: 0,
		starred: 0,
		tagged: 0,
		junk: 0,
		junkScore: 0,
	},
	yearsData: {
		received: {},
		sent: {},
	},
	quartersData: {
		received: {},
		sent: {},
	},
	monthsData: {
		received: {},
		sent: {},
	},
	weeksData: {
		received: {},
		sent: {},
	},
	dateData: {
		received: {},
		sent: {},
	},
	daytimeData: {
		received: new NumberedObject(24),
		sent: new NumberedObject(24),
	},
	weekdayData: {
		received: new NumberedObject(7),
		sent: new NumberedObject(7),
	},
	monthData: {
		received: new NumberedObject(12),
		sent: new NumberedObject(12),
	},
	weekdayPerHourData: {
		received: new NumberedObject(7, 24),
		sent: new NumberedObject(7, 24),
	},
	contacts: {
		received: {},
		sent: {},
		junk: {},
	},
	folders: {
		received: {},
		sent: {},
	},
	tags: {},
});

// processed data to show; data structure see initData
const display = ref(initData());

// basic data structure to display charts
// used for comparing account data if multiple accounts are active
const initComparisonData = () => ({
	yearsData: {},
	quartersData: {},
	monthsData: {},
	weeksData: {},
	daytimeData: {},
	weekdayData: {},
	monthData: {},
});
// subset of processed data to show data for account comparison view; data structure see initComparisonData
const comparison = ref(initComparisonData());

// adds a listener for storage change events
// makes reactions on option changes possible
const addStorageListener = () => {
	messenger.storage.onChanged.addListener((result, area) => {
		if (area == "local" && result?.options?.newValue && result?.options?.oldValue) {
			const n = result.options.newValue, o = result.options.oldValue
			// only update those options that changed
			if (n.theme != o.theme) {
				options.dark = setTheme(n.theme);
			}
			if (n.ordinate != o.ordinate) {
				options.ordinate = n.ordinate;
			}
			if (n.tagColors != o.tagColors) {
				options.tagColors = n.tagColors;
			}
			if (n.liveCountUp != o.liveCountUp) {
				options.liveCountUp = n.liveCountUp;
			}
			if (n.autoRefresh != o.autoRefresh) {
				options.autoRefresh = n.autoRefresh;
			}
			if (n.autoRefreshInterval != o.autoRefreshInterval) {
				options.autoRefreshInterval = n.autoRefreshInterval;
			}
			if (n.startOfWeek != o.startOfWeek) {
				options.startOfWeek = n.startOfWeek;
			}
			if (n.addresses != o.addresses) {
				options.localIdentities = n.addresses.toLowerCase().split(",").map(x => x.trim());
			}
			if (JSON.stringify(n.accounts) != JSON.stringify(o.accounts)) {
				options.accounts = n.accounts;
			}
			if (JSON.stringify(n.accountColors) != JSON.stringify(o.accountColors)) {
				options.accountColors = n.accountColors;
			}
			if (n.selfMessages != o.selfMessages) {
				options.selfMessages = n.selfMessages;
			}
			if (n.maxListCount != o.maxListCount) {
				options.maxListCount = n.maxListCount;
			}
			if (n.cache != o.cache) {
				options.cache = n.cache;
			}
		}
	});
};

// get all add-on settings from the options page
// for non existing options use default value
const getOptions = async () => {
	const result = await messenger.storage.local.get("options");
	// only load options if they have been set, otherwise default settings will be kept
	if (result && result.options) {
		options.dark = setTheme(
			result.options.theme ?? defaultOptions.theme,
			document.body,
			['dark', 'background-normal'],
			['light', 'background-highlight-contrast']
		);
		options.ordinate = result.options.ordinate ?? defaultOptions.ordinate;
		options.tagColors = result.options.tagColors ?? defaultOptions.tagColors;
		options.liveCountUp = result.options.liveCountUp ?? defaultOptions.liveCountUp;
		options.autoRefresh = result.options.autoRefresh ?? defaultOptions.autoRefresh;
		options.autoRefreshInterval = result.options.autoRefreshInterval ?? defaultOptions.autoRefreshInterval;
		// options.startOfWeek = result.options.startOfWeek ?? defaultOptions.startOfWeek;
		options.localIdentities = result.options.addresses ? result.options.addresses.toLowerCase().split(",").map(x => x.trim()) : defaultOptions.addresses;
		options.accounts = result.options.accounts ?? defaultOptions.accounts;
		options.accountColors = result.options.accountColors ?? defaultOptions.accountColors;
		options.selfMessages = result.options.selfMessages ?? defaultOptions.selfMessages;
		options.maxListCount = result.options.maxListCount ?? defaultOptions.maxListCount;
		options.cache = result.options.cache ?? defaultOptions.cache;
	}
};

// retrieve list of tags that can be set on messages
// their human-friendly name, color, and sort order
const getTags = async () => {
	tags.value = await messenger.messages.listTags();
};

// retrieve accounts and identities list
// get active account from URL get parameter
const getAccounts = async () => {
	let list = await messenger.accounts.list();
	// if account colors are not initialized yet, initialize them
	if (Object.keys(options.accountColors).length == 0) {
		list.forEach((a, i) => {
			options.accountColors[a.id] = defaultColors[(i%defaultColors.length)]
		});
	}
	// filter list of accounts if user configured custom list
	if (options.accounts.length > 0 && options.accounts.length < list.length) {
		list = list.filter(a => options.accounts.includes(a.id));
	}
	// store accounts
	accounts.value = list;
	// store identities of all activated accounts
	let activeIdentities = list.reduce((p,c) => p.concat(c.identities.map(i => i.email.toLowerCase())), []);
	// add local identities if any local account is active
	if (options.addresses && list.some(a => a.type == "none")) {
		options.addresses.forEach(l => activeIdentities.push(l.toLowerCase()));
	}
	identities.value = activeIdentities;
	// extract account id from url GET parameter
	const uri = window.location.search.substring(1);
	let id = (new URLSearchParams(uri)).get("s");
	if (!id || (id == "sum" && !options.cache) || (id == "sum" && list.length <= 1)) id = list[0].id;
	active.account = id;
};

// extract information of a single message <m> with accounts <identityList>
// and update given <data> object
const analyzeMessage = (data, m, identityList) => {
	// check filter:contact
	if (active.contact && !contactInvolved(active.contact, m)) return;
	// check for self messages, if exclusion is enabled
	if (options.selfMessages && options.selfMessages != "none") {
		const ids = options.selfMessages == "sameAccount" ? identityList : identities.value;
		if (isSelfMessage(m, ids)) return;
	}
	// now start analyses
	let type = "";
	const author = extractEmailAddress(m.author);
	// numbers
	data.numbers.total++;
	if (m.read === false) data.numbers.unread++;
	if (identityList.includes(author)) {
		data.numbers.sent++;
		type = "sent";
	} else {
		data.numbers.received++;
		type = "received";
	}
	if (m.junk) data.numbers.junk++;
	data.numbers.junkScore += m.junkScore;
	// calculate starting date (= date of oldest email)
	const start = new Date(data.meta.start);
	if (m.date && m.date.getTime() > 0 && m.date.getTime() < start.getTime()) {
		data.meta.start = m.date;
	}
	// years
	const y = m.date.getFullYear();
	if (!(y in data.yearsData[type])) {
		data.yearsData[type][y] = 1;
	} else {
		data.yearsData[type][y]++;
	}
	// quarters
	const qn = quarterNumber(m.date);
	if (!(y in data.quartersData[type])) {
		data.quartersData[type][y] = {};
		data.quartersData[type][y][qn] = 1;
	} else {
		if (!(qn in data.quartersData[type][y])) {
			data.quartersData[type][y][qn] = 1;
		} else {
			data.quartersData[type][y][qn]++;
		}
	}
	// months
	const mo = m.date.getMonth();
	if (!(y in data.monthsData[type])) {
		data.monthsData[type][y] = {};
		data.monthsData[type][y][mo] = 1;
	} else {
		if (!(mo in data.monthsData[type][y])) {
			data.monthsData[type][y][mo] = 1;
		} else {
			data.monthsData[type][y][mo]++;
		}
	}
	// weeks
	const wn = weekNumber(m.date);
	const ywn = wn == 53 && mo == 0 ? y-1 : y; // adjust year for first days of January that are before week 1
	if (!(ywn in data.weeksData[type])) {
		data.weeksData[type][ywn] = {};
		data.weeksData[type][ywn][wn] = 1;
	} else {
		if (!(wn in data.weeksData[type][ywn])) {
			data.weeksData[type][ywn][wn] = 1;
		} else {
			data.weeksData[type][ywn][wn]++;
		}
	}
	// daytime
	const dt = m.date.getHours();
	data.daytimeData[type][dt]++;
	// weekday
	const wd = m.date.getDay();
	data.weekdayData[type][wd]++;
	// month
	data.monthData[type][mo]++;
	// dates
	const iso = m.date.toISOString().substr(0, 10);
	if (!(iso in data.dateData[type])) {
		data.dateData[type][iso] = 1;
	} else {
		data.dateData[type][iso]++;
	}
	// weekday per hour
	data.weekdayPerHourData[type][wd][dt]++;
	// contacts (leaderboards)
	switch (type) {
		case 'sent':
			const recipients = m.recipients.map(r => extractEmailAddress(r).toLowerCase());
			recipients.forEach(r => {
				if (!(r in data.contacts.sent)) {
					data.contacts.sent[r] = 1;
				} else {
					data.contacts.sent[r]++;
				}
			});
			break;
		case 'received':
			if (!(author in data.contacts.received)) {
				data.contacts.received[author] = 1;
			} else {
				data.contacts.received[author]++;
			}
			break;
		default:
			break;
	}
	if (m.junk) {
		if (!(author in data.contacts.junk)) {
			data.contacts.junk[author] = 1;
		} else {
			data.contacts.junk[author]++;
		}
	}
	// folders
	const f = m.folder.name;
	if (!(f in data.folders[type])) {
		data.folders[type][f] = 1;
	} else {
		data.folders[type][f]++;
	}
	// star
	if (m.flagged === true) data.numbers.starred++;
	// tags
	if (m.tags.length > 0) {
		data.numbers.tagged++;
		m.tags.forEach(tag => {
			if (!(tag in data.tags)) {
				data.tags[tag] = 1;
			} else {
				data.tags[tag]++;
			}
		});
	}
	// live update numbers section if corresponding option is enabled
	if (options.liveCountUp) display.value.numbers = data.numbers;
};

// retrieve all messages of a given <folder> with accounts <identityList>
// store results in <data> object
const processMessages = async (data, folder, identityList) => {
	if (folder) {
		for await (let m of queryMessages(folder, active.period.start, active.period.end)) {
			analyzeMessage(data, m, identityList);
		}
	}
};

// analyze folders of a given account <a>
// return processed data object structured like initData
const processAccount = async (a) => {
	// get identities from account, or from preferences if it's a local account
	const identities = a.type != "none" ? a.identities.map(i => i.email.toLowerCase()) : options.addresses;
	// get all folders and subfolders from given account or selected folder of active account (filter field)
	const foldersList = active.folder ? [JSON.parse(JSON.stringify(active.folder))] : traverseAccount(a);
	// build folder list for filter selection, if not already present
	if (!folders.value.length) {
		folders.value = foldersList;
	}
	const accountData = initData();
	await Promise.all(foldersList.map(async f => {
		// analyze all messages in all folders
		await processMessages(accountData, f, identities);
		// increment current progress by 1 for each folder
		progress.current++;
	}));
	// post processing: sort and reduce size of lists to configured limit
	accountData.contacts.received = sortAndLimitObject(accountData.contacts.received, options.maxListCount);
	accountData.contacts.sent = sortAndLimitObject(accountData.contacts.sent, options.maxListCount);
	accountData.contacts.junk = sortAndLimitObject(accountData.contacts.junk, options.maxListCount);
	accountData.tags = sortAndLimitObject(accountData.tags, options.maxListCount);
	// post processing: sort folders
	accountData.folders.received = sortAndLimitObject(accountData.folders.received);
	accountData.folders.sent = sortAndLimitObject(accountData.folders.sent);
	// post processing: add timestamp of finished processing
	accountData.meta.timestamp = Date.now();

	// check if error occured during processing
	// any error is saved to local storage during processing
	const { err } = await messenger.storage.local.get("error");
	error.account = err;

	return accountData;
};

// true, if at least one filter is set
const filterIsActive = computed(() => active.folder || active.period.start || active.period.end || active.contact);

// true, if just one single account is selected
const singleAccount = computed(() => active.account !== "sum");

// retrieve and process data of account with <id=accountId>
// gets called multiple times if processing was invoked for all accounts
const reprocessData = async (id, auto=false) => {
	// get currently selected account
	const account = await messenger.accounts.get(id);
	// process data of this account again
	const accountData = await processAccount(account);
	// directly display data if only one single account was manually processed
	if (singleAccount.value && !auto) {
		display.value = JSON.parse(JSON.stringify(accountData));
	}
	// only store reprocessed data if cache is enabled and no filter is set
	if (options.cache && !filterIsActive.value) {
		const stats = {};
		stats["stats-" + id] = JSON.parse(JSON.stringify(accountData));
		await messenger.storage.local.set(stats);
	}
	// return processed account data
	return accountData;
};

// corrects selected year, if it's out of the current date range
// called after data got reprocessed
const adjustSelectedYear = () => {
	const min = new Date(display.value.meta.start).getFullYear()
	const max = new Date(display.value.meta.end).getFullYear()
	const current = preferences.sections.activity.year
	if (current < min) preferences.sections.activity.year = min
	if (current > max) preferences.sections.activity.year = max
};

// load data of given account <id=accountId> or all accounts <id='sum'>
// from cache <refresh=false> or reprocess from scratch <refresh=true>
// while reprocessing was invoked manually <auto=false> or automaticalle <auto=true>
const loadAccount = async (id, refresh, auto=false) => {
	// start loading indication
	isLoading.value = true;
	// check id type
	if (id === 'sum' && options.cache) {
		// set tab title
		document.title = "ThirdStats: " + t("stats.allAccounts");
		// deactivate list of folders
		folders.value = [];
		// iterate over all activated accounts
		const activeAccounts = options.accounts.length > 0 && options.accounts.length < accounts.value.length
			? accounts.value.filter(a => options.accounts.includes(a.id))
			: accounts.value;
		let accountsData = [];
		// init progress indicator
		progress.current = 1;
		progress.max = activeAccounts.reduce((p,c) => p+traverseAccount(c).length, 0);
		// when auto processing remember displayed account key and disable live counts
		let displayedAccountKey = null;
		let liveCountUpDisabled = false;
		if (auto && options.liveCountUp) {
			liveCountUpDisabled = true;
			options.liveCountUp = false;
		}
		await Promise.all(activeAccounts.map(async a => {
			// get data from storage
			const result = await messenger.storage.local.get("stats-" + a.id);
			if (!refresh && result && result["stats-" + a.id]) {
				// if no refresh requested and this accounts data was cached before, take data from cache
				accountsData.push(JSON.parse(JSON.stringify(result["stats-" + a.id])));
				progress.current += a.folderCount;
			} else {
				// otherwise (re)process account
				await messenger.storage.local.set({ error: false });
				const data = await reprocessData(a.id, auto);
				accountsData.push(JSON.parse(JSON.stringify(data)));
				// remember key of currently displayed account if auto processed
				if (auto && active.account == a.id) {
					displayedAccountKey = accountsData.length - 1;
				}
			}
		}));
		// enable live counts again if set
		if (auto && liveCountUpDisabled) {
			options.liveCountUp = true;
		}
		// finish progress indicator
		progress.current = 0;
		progress.max = 0;

		// sum all values of all account objects
		let sum = initData();
		// meta
		accountsData.map(a => {
			if (!a.hasOwnProperty("meta")) a.meta = { timestamp: 0 };
		});
		sum.meta.timestamp = accountsData.reduce((p,c) => p < c.meta.timestamp ? p : c.meta.timestamp, Date.now());
		// numbers
		sum.numbers.total = accountsData.reduce((p,c) => p+c.numbers.total, 0);
		sum.numbers.unread = accountsData.reduce((p,c) => p+c.numbers.unread, 0);
		sum.numbers.received = accountsData.reduce((p,c) => p+c.numbers.received, 0);
		sum.numbers.sent = accountsData.reduce((p,c) => p+c.numbers.sent, 0);
		sum.numbers.starred = accountsData.reduce((p,c) => p+(c.numbers.starred ?? 0), 0);
		sum.numbers.tagged = accountsData.reduce((p,c) => p+(c.numbers.tagged ?? 0), 0);
		sum.numbers.junk = accountsData.reduce((p,c) => p+c.numbers.junk, 0);
		sum.numbers.junkScore = accountsData.reduce((p,c) => p+c.numbers.junkScore, 0)/accountsData.length;
		sum.meta.start = accountsData.reduce((p,c) => p < c.meta.start ? p : c.meta.start, 0);
		sum.meta.end = accountsData.reduce((p,c) => p >= c.meta.end ? p : c.meta.end, 0);
		// years
		accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.yearsData.received)])], [])
			.map(y => { sum.yearsData.received[y] = accountsData.reduce((p,c) => c.yearsData.received[y] ? p+c.yearsData.received[y] : p, 0) });
		accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.yearsData.sent)])], [])
			.map(y => { sum.yearsData.sent[y] = accountsData.reduce((p,c) => c.yearsData.sent[y] ? p+c.yearsData.sent[y] : p, 0) });
		// quarters
		accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.quartersData.received)])], [])
			.map(y => { sum.quartersData.received[y] = sumObjects(accountsData.reduce((p,c) => c.quartersData.received[y] ? p.concat(c.quartersData.received[y]) : p, [])) });
		accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.quartersData.sent)])], [])
			.map(y => { sum.quartersData.sent[y] = sumObjects(accountsData.reduce((p,c) => c.quartersData.sent[y] ? p.concat(c.quartersData.sent[y]) : p, [])) });
		// months
		accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.monthsData.received)])], [])
			.map(y => { sum.monthsData.received[y] = sumObjects(accountsData.reduce((p,c) => c.monthsData.received[y] ? p.concat(c.monthsData.received[y]) : p, [])) });
		accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.monthsData.sent)])], [])
			.map(y => { sum.monthsData.sent[y] = sumObjects(accountsData.reduce((p,c) => c.monthsData.sent[y] ? p.concat(c.monthsData.sent[y]) : p, [])) });
		// weeks
		accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.weeksData.received)])], [])
			.map(y => { sum.weeksData.received[y] = sumObjects(accountsData.reduce((p,c) => c.weeksData.received[y] ? p.concat(c.weeksData.received[y]) : p, [])) });
		accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.weeksData.sent)])], [])
			.map(y => { sum.weeksData.sent[y] = sumObjects(accountsData.reduce((p,c) => c.weeksData.sent[y] ? p.concat(c.weeksData.sent[y]) : p, [])) });
		// dates
		accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.dateData.received)])], [])
			.map(d => { sum.dateData.received[d] = accountsData.reduce((p,c) => c.dateData.received[d] ? p+c.dateData.received[d] : p, 0) })
		accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.dateData.sent)])], [])
			.map(d => { sum.dateData.sent[d] = accountsData.reduce((p,c) => c.dateData.sent[d] ? p+c.dateData.sent[d] : p, 0) })
		// daytime
		for (let h = 0; h < 24; h++) {
			sum.daytimeData.received[h] = accountsData.reduce((p,c) =>  p+c.daytimeData.received[h], 0);
			sum.daytimeData.sent[h] = accountsData.reduce((p,c) =>  p+c.daytimeData.sent[h], 0);
		}
		// weekday
		for (let d = 0; d < 7; d++) {
			sum.weekdayData.received[d] = accountsData.reduce((p,c) =>  p+c.weekdayData.received[d], 0);
			sum.weekdayData.sent[d] = accountsData.reduce((p,c) =>  p+c.weekdayData.sent[d], 0);
		}
		// month
		for (let m = 0; m < 12; m++) {
			sum.monthData.received[m] = accountsData.reduce((p,c) =>  p+c.monthData.received[m], 0);
			sum.monthData.sent[m] = accountsData.reduce((p,c) =>  p+c.monthData.sent[m], 0);
		}
		// weekday per hour
		for (let d = 0; d < 7; d++) {
			for (let h = 0; h < 24; h++) {
				sum.weekdayPerHourData.received[d][h] = accountsData.reduce((p,c) =>  p+c.weekdayPerHourData.received[d][h], 0);
				sum.weekdayPerHourData.sent[d][h] = accountsData.reduce((p,c) =>  p+c.weekdayPerHourData.sent[d][h], 0);
			}
		}
		// contacts
		sum.contacts.received = sortAndLimitObject(sumObjects(accountsData.reduce((p,c) => p.concat(c.contacts.received), [])), options.maxListCount);
		sum.contacts.sent = sortAndLimitObject(sumObjects(accountsData.reduce((p,c) => p.concat(c.contacts.sent), [])), options.maxListCount);
		sum.contacts.junk = sortAndLimitObject(sumObjects(accountsData.reduce((p,c) => p.concat(c.contacts.junk ?? []), [])), options.maxListCount);
		// folders
		sum.folders.received = sortAndLimitObject(sumObjects(accountsData.reduce((p,c) => p.concat(c.folders?.received ?? []), [])));
		sum.folders.sent = sortAndLimitObject(sumObjects(accountsData.reduce((p,c) => p.concat(c.folders?.sent ?? []), [])));
		// tags
		sum.tags = sortAndLimitObject(sumObjects(accountsData.reduce((p,c) => p.concat(c.tags ?? []), [])), options.maxListCount);

		// show summed stats or keep current view if processing was invoked automatically
		display.value = auto && displayedAccountKey ? accountsData[displayedAccountKey] : sum;

		// retrieve all values of account objects for comparison views
		const comparisonData = initComparisonData();
		activeAccounts.forEach((a, i) => {
			// years
			comparisonData.yearsData[a.id] = sumObjects([accountsData[i].yearsData.received, accountsData[i].yearsData.sent]);
			// quarters
			comparisonData.quartersData[a.id] = sumObjectsObjects([accountsData[i].quartersData.received, accountsData[i].quartersData.sent]);
			// months
			comparisonData.monthsData[a.id] = sumObjectsObjects([accountsData[i].monthsData.received, accountsData[i].monthsData.sent]);
			// weeks
			comparisonData.weeksData[a.id] = sumObjectsObjects([accountsData[i].weeksData.received, accountsData[i].weeksData.sent]);
			// daytime
			comparisonData.daytimeData[a.id] = sumObjects([accountsData[i].daytimeData.received, accountsData[i].daytimeData.sent]);
			// weekday
			comparisonData.weekdayData[a.id] = sumObjects([accountsData[i].weekdayData.received, accountsData[i].weekdayData.sent]);
			// month
			comparisonData.monthData[a.id] = sumObjects([accountsData[i].monthData.received, accountsData[i].monthData.sent]);
		})
		comparison.value = comparisonData;
	} else {
		// load single account from id
		const account = await messenger.accounts.get(id);
		// set tab title
		document.title = "ThirdStats: " + account.name;
		// (re)calculate list of folders
		folders.value = traverseAccount(account);
		// only check storage if no refresh was requested cache is enabled
		const result = options.cache ? await messenger.storage.local.get("stats-" + id) : null;
		if (!refresh && result && result["stats-" + id]) {
			// if cache is enabled and data already exists in storage, display it directly
			display.value = JSON.parse(JSON.stringify(result["stats-" + id]));
		} else {
			// otherwise retrieve it first/again and track progress by processed folder count
			progress.current = 1;
			progress.max = folders.value.length;
			await messenger.storage.local.set({ error: false });
			await reprocessData(id);
			progress.current = 0;
			progress.max = 0;
		}
	}
	// finally adjust displayed activity year
	adjustSelectedYear();
	// finished - stop loading indication
	isLoading.value = false;
};

// reset folder filter
// reload data if requested <reload=true>
const resetFolder = async (reload) => {
	active.folder = null;
	if (reload) {
		// reprocess current data if another filter is set, otherwise just load account data
		await loadAccount(active.account, (active.period.start && active.period.end) || active.contact)
	}
};

// true if entered time period is valid
// fills error stack for affected fields when input is invalid
const validatePeriod = () => {
	let valid = true;
	const datex = RegExp(/^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/);
	error.period.start = [];
	error.period.end = [];
	// start time is not set
	if (!active.period.start) {
		valid = false;
		error.period.start.push(t("stats.tooltips.error.empty"));
	}
	// start time is of wrong format
	if (!datex.test(active.period.start)) {
		valid = false;
		error.period.start.push(t("stats.tooltips.error.dateFormat"));
	}
	// start time is no real date
	if (isNaN(Date.parse(active.period.start))) {
		valid = false;
		error.period.start.push(t("stats.tooltips.error.dateUnreal"));
	}
	// end time is not set
	if (!active.period.end) {
		valid = false;
		error.period.end.push(t("stats.tooltips.error.empty"));
	}
	// end time is of wrong format
	if (!datex.test(active.period.end)) {
		valid = false;
		error.period.end.push(t("stats.tooltips.error.dateForma;t"))
	}
	// end time is no real date
	if (isNaN(Date.parse(active.period.end))) {
		valid = false;
		error.period.end.push(t("stats.tooltips.error.dateUnreal;"))
	}
	// start date is before end date
	if (Date.parse(active.period.start) > Date.parse(active.period.end)) {
		valid = false;
		error.period.start.push(t("stats.tooltips.error.dateOrderStart"));
		error.period.end.push(t("stats.tooltips.error.dateOrderEnd"));
	}
	return valid;
};

// process data for current time period filter
// calls refresh if filter is valid
const updatePeriod = async () => {
	if (validatePeriod()) {
		await loadAccount(active.account, true);
		display.value.meta.start = new Date(active.period.start);
		display.value.meta.end = new Date(active.period.end);
		adjustSelectedYear();
	}
};

// reset time period filter
// reload data if requested <reload=true>
const resetPeriod = async (reload) => {
	active.period.start = null;
	active.period.end = null;
	error.period.start = [];
	error.period.end = [];
	adjustSelectedYear();
	if (reload) {
		// reprocess current data if another filter is set, otherwise just load account data
		await loadAccount(active.account, active.folder || active.contact);
	}
};

// reset contact filter
// reload data if requested <reload=true>
const resetContact = async (reload) => {
	active.contact = null;
	if (reload) {
		// reprocess current data if another filter is set, otherwise just load account data
		await loadAccount(active.account, (active.period.start && active.period.end) || active.folder);
	}
};

// format folder select options
// build <folder> name to match its hierarchy with preceding dashes
const formatFolder = (folder) => {
	const level = (folder.path.match(/\//g) || []).length;
	return level <= 1 ? folder.name : "—".repeat(level-1) + " " + folder.name;
};

// format period date input to match YYYY-MM-DD
// <key> defines the input field, either 'start' or 'end'
const formatPeriod = (key) => {
	if (active.period[key]) {
		let s = active.period[key];
		// complete year
		if (s.length == 6) {
			s = String((new Date()).getFullYear()).slice(0, 2) + s;
		}
		// insert dashes
		if (!s.includes("-")) {
			s = s.slice(0, 4) + "-" + s.slice(4, 6) + "-" + s.slice(6);
		}
		// shorten to 10 characters
		s = s.slice(0, 10);
		// set lower limit
		if (!isNaN(Date.parse(s)) && Date.parse(s) < 0) {
			s = "1970-01-01";
		}
		// set upper limit
		if (!isNaN(Date.parse(s)) && Date.parse(s) > Date.now()) {
			s = (new Date()).toISOString().slice(0, 10);
		}
		active.period[key] = s;
	}
};

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

// first date in currently displayed data
const minDate = computed(() => {
	return new Date(display.value.meta.start);
});
// last date in currently displayed data
const maxDate = computed(() => {
	return display.value.meta.end ? new Date(display.value.meta.end) : new Date();
});
// year minDate
const minYear = computed(() => {
	return minDate.value.getFullYear();
});
// year of maxDate
const maxYear = computed(() => {
	return maxDate.value.getFullYear();
});

// increments selected year
// only up to the max existing year
const nextYear = () => {
	if (preferences.sections.activity.year < maxYear.value) {
		preferences.sections.activity.year++;
	}
};
// decrements selected year
// only down to the min existing year
const previousYear = () => {
	if (preferences.sections.activity.year > minYear.value) {
		preferences.sections.activity.year--;
	}
};

// export displayed data
// provides a JSON file for download
const exportJson = () => {
	const data = new Blob([JSON.stringify(display.value)], { type: "text/plain;charset=utf-8" });
	messenger.downloads.download({
		'url': URL.createObjectURL(data),
		'filename': yyyymmdd(new Date()) + "_third-stats-export.json",
		'saveAs': true
	}).then(() => {}, () => {}); // TODO: [alert] Successfully started download | Download aborted
};

// tooltip for account comparison button
// depends on active accounts, account selection and toggle of given section
const tooltipAccountComparison = (section) => {
	if (options.accounts.length < 2) {
		return t('stats.tooltips.comparisonWhenAccountsOption');
	}
	if (singleAccount.value) {
		return t('stats.tooltips.comparisonWhenFilter');
	}
	return !preferences.sections[section].comparison
		? t('stats.tooltips.comparison')
		: t('stats.tooltips.sum');
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

// prepare sum data for years line chart
const yearsChartData = computed(() => {
	const r = display.value.yearsData.received;
	const s = display.value.yearsData.sent;
	let labels = [], dr = [], ds = [];
	for (let y = minYear.value; y <= maxYear.value; ++y) {
		labels.push(y);
		dr.push(y in r ? r[y] : 0);
		ds.push(y in s ? s[y] : 0);
	}
	return {
		datasets: [
			{
				label: t("stats.mailsSent"),
				data: ds,
				borderColor: accentColors[0],
			},
			{
				label: t("stats.mailsReceived"),
				data: dr,
				borderColor: accentColors[1],
			},
		],
		labels: labels,
	};
});
// prepare comparison data for years line chart
const yearsComparedChartData = computed(() => {
	// generate list of years between start and end date, e.g. [2018,2019,2020]
	const labels = Array.from(Array(maxYear.value-minYear.value+1), (_, i) => i+minYear.value);
	// compute dataset for each account
	let datasets = [];
	accounts.value.forEach(a => {
		const d = comparison.value.yearsData[a.id];
		let data = [];
		labels.map(y => data.push(y in d ? d[y] : 0));
		datasets.push({
			label: t("popup.nMessages", 2) + " - " + a.name,
			data: data,
			borderColor: options.accountColors[a.id],
		});
	})
	return {
		datasets: datasets,
		labels: labels,
	};
});

// prepare sum data for quarters line chart
const quartersChartData = computed(() => {
	const r = display.value.quartersData.received;
	const s = display.value.quartersData.sent;
	let labels = [], dr = [], ds = [];
	for (let y = minYear.value; y <= maxYear.value; ++y) {
		for (let q = 1; q <= 4; ++q) {
			// trim quarters before start date
			if (y == minYear.value && q < quarterNumber(minDate.value)) continue;
			// trim quarters after end date
			if (y == maxYear.value && q > quarterNumber(maxDate.value)) break;
			// organize labels and data
			labels.push(y + " " + t("stats.abbreviations.quarter") + q);
			dr.push(y in r && q in r[y] ? r[y][q] : 0);
			ds.push(y in s && q in s[y] ? s[y][q] : 0);
		}
	}
	return {
		datasets: [
			{
				label: t("stats.mailsSent"),
				data: ds,
				borderColor: accentColors[0],
			},
			{
				label: t("stats.mailsReceived"),
				data: dr,
				borderColor: accentColors[1],
			},
		],
		labels: labels,
	};
});
// prepare comparison data for quarters line chart
const quartersComparedChartData = computed(() => {
	let datasets = [], labels = [];
	// compute dataset for each account
	accounts.value.forEach((a, i) => {
		const d = comparison.value.quartersData[a.id];
		let data = [];
		for (let y = minYear.value; y <= maxYear.value; ++y) {
			for (let q = 1; q <= 4; ++q) {
				// trim quarters before start date
				if (y == minYear.value && q < quarterNumber(minDate.value)) continue;
				// trim quarters after end date
				if (y == maxYear.value && q > quarterNumber(maxDate.value)) break;
				// generate labels in first iteration
				if (i == 0) labels.push(y + " " + t("stats.abbreviations.quarter") + q);
				// fill all data values, default to 0 if not existing for this combination
				data.push(y in d && q in d[y] ? d[y][q] : 0);
			}
		}
		datasets.push({
			label: t("popup.nMessages", 2) + " - " + a.name,
			data: data,
			borderColor: options.accountColors[a.id],
		});
	})
	return {
		datasets: datasets,
		labels: labels,
	};
});

// prepare data for months line chart
const monthsChartData = computed(() => {
	const r = display.value.monthsData.received;
	const s = display.value.monthsData.sent;
	let labels = [], dr = [], ds = [];
	for (let y = minYear.value; y <= maxYear.value; ++y) {
		for (let m = 0; m < 12; ++m) {
			// trim months before start date
			if (y == minYear.value && m < minDate.value.getMonth()) continue;
			// trim months after end date
			if (y == maxYear.value && m > maxDate.value.getMonth()) break;
			// organize labels and data
			labels.push(y + " " + monthNames(locale.value)[m]);
			dr.push(y in r && m in r[y] ? r[y][m] : 0);
			ds.push(y in s && m in s[y] ? s[y][m] : 0);
		}
	}
	return {
		datasets: [
			{
				label: t("stats.mailsSent"),
				data: ds,
				borderColor: accentColors[0],
			},
			{
				label: t("stats.mailsReceived"),
				data: dr,
				borderColor: accentColors[1],
			},
		],
		labels: labels,
	};
});
// prepare comparison data for months line chart
const monthsComparedChartData = computed(() => {
	let datasets = [], labels = [];
	// compute dataset for each account
	accounts.value.map((a, i) => {
		const d = comparison.value.monthsData[a.id];
		let data = [];
		for (let y = minYear.value; y <= maxYear.value; ++y) {
			for (let m = 0; m < 12; ++m) {
				// trim months before start date
				if (y == minYear.value && m < minDate.value.getMonth()) continue;
				// trim months after end date
				if (y == maxYear.value && m > maxDate.value.getMonth()) break;
				// generate labels in first iteration
				if (i == 0) labels.push(y + " " + monthNames(locale.value)[m]);
				// fill all data values, default to 0 if not existing for this combination
				data.push(y in d && m in d[y] ? d[y][m] : 0);
			}
		}
		datasets.push({
			label: t("popup.nMessages", 2) + " - " + a.name,
			data: data,
			borderColor: options.accountColors[a.id],
		});
	})
	return {
		datasets: datasets,
		labels: labels,
	};
});

// prepare data for weeks line chart
const weeksChartData = computed(() => {
	const r = display.value.weeksData.received;
	const s = display.value.weeksData.sent;
	let labels = [], dr = [], ds = [];
	weeksBetween(minDate.value, maxDate.value).forEach(week => {
		const [y, w] = week;
		// organize labels and data
		labels.push(y + " " + t("stats.abbreviations.calendarWeek") + w);
		dr.push(y in r && w in r[y] ? r[y][w] : 0);
		ds.push(y in s && w in s[y] ? s[y][w] : 0);
	})
	return {
		datasets: [
			{
				label: t("stats.mailsSent"),
				data: ds,
				borderColor: accentColors[0],
			},
			{
				label: t("stats.mailsReceived"),
				data: dr,
				borderColor: accentColors[1],
			},
		],
		labels: labels,
	};
});
// prepare comparison data for weeks line chart
const weeksComparedChartData = computed(() => {
	let datasets = [], labels = [];
	// compute dataset for each account
	accounts.value.forEach((a, i) => {
		const d = comparison.value.weeksData[a.id];
		let data = [];
		weeksBetween(minDate.value, maxDate.value).forEach(week => {
			const [y, w] = week;
			// generate labels in first iteration
			if (i == 0) labels.push(y + " " + t("stats.abbreviations.calendarWeek") + w);
			// fill all data values, default to 0 if not existing for this combination
			data.push(y in d && w in d[y] ? d[y][w] : 0);
		});
		datasets.push({
			label: t("popup.nMessages", 2) + " - " + a.name,
			data: data,
			borderColor: options.accountColors[a.id],
		});
	});
	return {
		datasets: datasets,
		labels: labels,
	};
});

// prepare data for daytime bar chart
const daytimeChartData = computed(() => {
	const r = display.value.daytimeData.received, s = display.value.daytimeData.sent;
	return {
		datasets: [
			{
				label: t("stats.mailsSent"),
				data: Object.values(s),
				borderColor: accentColors[0],
			},
			{
				label: t("stats.mailsReceived"),
				data: Object.values(r),
				borderColor: accentColors[1],
			},
		],
		labels: Object.keys(r),
	};
});
// prepare comparison data for daytime bar chart
const daytimeComparedChartData = computed(() => {
	let datasets = [];
	// compute dataset for each account
	accounts.value.forEach((a) => {
		const d = comparison.value.daytimeData[a.id];
		// add dataset for this account
		datasets.push({
			label: t("popup.nMessages", 2) + " - " + a.name,
			data: Object.values(d),
			borderColor: options.accountColors[a.id],
		});
	});
	return {
		datasets: datasets,
		labels: Object.keys(Object.values(comparison.value.daytimeData)[0]),
	};
});

// prepare data for weekday bar chart
const weekdayChartData = computed(() => {
	const r = Object.values(display.value.weekdayData.received);
	const s = Object.values(display.value.weekdayData.sent);
	let labels = [...weekdayNames(locale.value)];
	// TODO: start week with user defined day of week
	for (let d = 0; d < 1/*options.startOfWeek*/; d++) {
		r.push(r.shift());
		s.push(s.shift());
		labels.push(labels.shift());
	}
	return {
		datasets: [
			{
				label: t("stats.mailsSent"),
				data: s,
				borderColor: accentColors[0],
			},
			{
				label: t("stats.mailsReceived"),
				data: r,
				borderColor: accentColors[1],
			},
		],
		labels: labels,
	};
});
// prepare comparison data for weekday bar chart
const weekdayComparedChartData = computed(() => {
	let datasets = [];
	let labels = [...weekdayNames(locale.value)];
	// TODO: labels: start week with user defined day of week
	for (let d = 0; d < 1/*options.startOfWeek*/; d++) {
		labels.push(labels.shift());
	}
	// compute dataset for each account
	accounts.value.forEach((a) => {
		const data = Object.values(comparison.value.weekdayData[a.id]);
		// TODO: data: start week with user defined day of week
		for (let d = 0; d < 1/*options.startOfWeek*/; d++) {
			data.push(data.shift());
		}
		// add dataset for this account
		datasets.push({
			label: t("popup.nMessages", 2) + " - " + a.name,
			data: data,
			borderColor: options.accountColors[a.id],
		});
	});
	return {
		datasets: datasets,
		labels: labels,
	};
});

// prepare data for month bar chart
const monthChartData = computed(() => {
	const r = display.value.monthData.received, s = display.value.monthData.sent;
	return {
		datasets: [
			{
				label: t("stats.mailsSent"),
				data: Object.values(s),
				borderColor: accentColors[0],
			},
			{
				label: t("stats.mailsReceived"),
				data: Object.values(r),
				borderColor: accentColors[1],
			},
		],
		labels: monthNames(locale.value),
	};
});
// prepare comparison data for month bar chart
const monthComparedChartData = computed(() => {
	let datasets = [];
	// compute dataset for each account
	accounts.value.forEach((a) => {
		// add dataset for this account
		datasets.push({
			label: t("popup.nMessages", 2) + " - " + a.name,
			data: Object.values(comparison.value.monthData[a.id]),
			borderColor: options.accountColors[a.id],
		});
	});
	return {
		datasets: datasets,
		labels: monthNames(locale.value),
	};
});

// prepare data for single date matrix charts
const dateChartData = computed(() => {
	const end = startOfToday();
	let rd = Object.entries(display.value.dateData ? display.value.dateData.received : []);
	let r = preferences.sections.activity.year == (new Date().getFullYear())
		? rd.filter(e => new Date(e[0]) > new Date(new Date().setYear(end.getFullYear() - 1)))
		: rd.filter(e => e[0].substring(0,4) == preferences.sections.activity.year);
	let sd = Object.entries(display.value.dateData ? display.value.dateData.sent : []);
	let s = preferences.sections.activity.year == (new Date().getFullYear())
		? sd.filter(e => new Date(e[0]) > new Date(new Date().setYear(end.getFullYear() - 1)))
		: sd.filter(e => e[0].substring(0,4) == preferences.sections.activity.year);
	// TODO: handle options.startOfWeek
	return {
		received: { label: t("stats.mailsReceived"), data: r },
		sent: { label: t("stats.mailsSent"), data: s },
	};
});

// prepare data for weekday/hour matrix charts
const weekdayPerHourChartData = computed(() => {
	let rd = Object.values(display.value.weekdayPerHourData.received);
	let sd = Object.values(display.value.weekdayPerHourData.sent);
	let initDate = new Date(1970,0,4);
	let r = rd.reduce((p,c,day) => [...p,...c.map((n,hour) => {
		let d = new Date(initDate.setDate(4+day));
		d = new Date(d.setHours(hour, 0, 0));
		return [d.toISOString(), n];
	})], []);
	let s = sd.reduce((p,c,day) => [...p,...c.map((n,hour) => {
		let d = new Date(initDate.setDate(4+day));
		d = new Date(d.setHours(hour, 0, 0));
		return [d.toISOString(), n];
	})], []);
	// TODO: handle options.startOfWeek
	return {
		received: { label: t("stats.mailsReceived"), data: r },
		sent: { label: t("stats.mailsSent"), data: s },
	};
});

// prepare data for sent emails leaderboard horizontal bar chart
const sentContactLeadersChartData = computed(() => {
	const s = display.value.contacts.sent;
	return {
		datasets: [
			{
				label: t("stats.mailsSent"),
				data: Object.values(s),
				borderColor: accentColors[0],
			},
		],
		labels: Object.keys(s),
	};
});
// true if there are any receiver contacts to display
const sentContactLeadersChartDataExists = computed(() => {
	return sentContactLeadersChartData.value.datasets[0].data?.length > 0;
});

// prepare data for received emails leaderboard horizontal bar chart
const receivedContactLeadersChartData = computed(() => {
	const r = display.value.contacts.received;
	return {
		datasets: [
			{
				label: t("stats.mailsReceived"),
				data: Object.values(r),
				borderColor: accentColors[1],
			},
		],
		labels: Object.keys(r),
	};
});
// true if there are any sender contacts to display
const receivedContactLeadersChartDataExists = computed(() => {
	return receivedContactLeadersChartData.value.datasets[0].data?.length > 0;
});

// prepare data for junk emails leaderboard horizontal bar chart
const junkContactLeadersChartData = computed(() => {
	const r = display.value.contacts.junk || {};
	const color = options.dark ? accentColors[2] : accentColors[3];
	return {
		datasets: [
			{
				label: t("stats.junkMails"),
				data: Object.values(r),
				borderColor: color,
			},
		],
		labels: Object.keys(r),
	};
});
// true if there are any junk contacts to display
const junkContactLeadersChartDataExists = computed(() => {
	return junkContactLeadersChartData.value.datasets[0].data?.length > 0;
});

// prepare data for emails per folder doughnut charts
const foldersChartData = computed(() => {
	const r = display.value.folders.received, s = display.value.folders.sent;
	let dr = [], ds = [], labels = [];
	let all = Array.from(new Set([...Object.keys(r), ...Object.keys(s)]));
	all.sort((a, b) => a.localeCompare(b, locale.value, { sensitivity: "base" }));
	all.forEach(d => {
		dr.push(r[d] ? r[d] : 0)
		ds.push(s[d] ? s[d] : 0)
		labels.push(d)
	});
	return {
		datasets: [
			{
				label: t("stats.mailsReceived"),
				data: dr,
				color: accentColors[1],
			},
			{
				label: t("stats.mailsSent"),
				data: ds,
				color: accentColors[0],
			},
		],
		labels: labels,
	};
});

// prepare data for email tags horizontal bar chart
const tagsChartData = computed(() => {
	const r = sortAndLimitObject(display.value.tags) || {};
	const color = options.dark ? accentColors[2] : accentColors[3];
	const labels = [], colors = [];
	Object.keys(r).forEach(key => {
		labels.push(tags.value.find(tag => tag.key === key)?.tag || 'undefined');
		colors.push(tags.value.find(tag => tag.key === key)?.color || color);
	}, this);
	return {
		datasets: [
			{
				label: t("stats.mailsPerTag"),
				data: Object.values(r),
				borderColor: options.tagColors ? colors : color,
			},
		],
		labels: labels,
	};
});
// true if there is any tags data to display
const tagsChartDataExists = computed(() => {
	return tagsChartData.value.datasets[0].data?.length > 0;
});

// merges received and sent contacts to a distinct list for contacts filter
const contacts = computed(() => {
	const r = display.value.contacts.received, s = display.value.contacts.sent;
	return Array.from(new Set([...Object.keys(r), ...Object.keys(s)])).sort();
});

// return account colors of all active accounts comma separated as single string
const accountsColorGradient = computed(() => {
	return Object
		.entries(options.accountColors)
		.filter((a => options.accounts.includes(a[0])))
		.reduce((p,c) => p.concat(c[1]), [])
		.join(",");
});

// array of years descending from last to first date
const yearsList = computed(() => {
	let years = [];
	for (let i = maxYear.value; i >= minYear.value; i--) {
		years.push(i);
	}
	return years;
});

// compute current loading progress in percent
const processingState = computed(() => {
	if (progress.max > 0) {
		if (progress.current<=progress.max) {
			return 100*progress.current/progress.max;
		} else {
			return 100;
		}
	} else {
		return 0;
	}
});

// on change of active account reset filter
// and load new accounts data accordingly
watch(
	() => active.account,
	async (id) => {
		// default to all accounts page if no id given
		if (!id) id = 'sum';
		// reset preferences
		preferences.sections.total.comparison = false;
		// reset folder filter
		resetFolder(false);
		// reset contact filter
		resetContact(false);
		// process data for given account, refresh if date range or contact filter is set
		await loadAccount(id, (active.period.start && active.period.end) || active.contact);
	}
);

// on change of active folder
// retrieve data again for current account selection
watch(
	() => active.folder,
	async (folder) => {
		if (folder) {
			// start processing for active folder only
			await loadAccount(active.account, true);
		}
	}
);

// on change of active folder
// retrieve data again for current account selection
watch(
	() => active.contact,
	async (contact) => {
		if (contact) {
			// start processing for active contact only
			await loadAccount(active.account, true);
		}
	}
);

onMounted(async () => {
	// set initial tab title
	document.title = "ThirdStats";
	// listen for option changes in local storage
	addStorageListener();
	// get stored options
	await getOptions();
	// retrieve all tags
	await getTags();
	// retrieve all accounts
	await getAccounts();
	// check if error occured during previous processing
	const { err } = await messenger.storage.local.get("error");
	error.account = err;
	// start auto-processing in intervals if activated
	if (options.autoRefresh) {
		setInterval(() => {
			if (!isLoading.value) {
				loadAccount('sum', true, true);
			}
		}, Number(options.autoRefreshInterval) * 60 * 1000); // convert minutes to seconds
	}
});
</script>

<style lang="stylus">
@require "assets/global"

// general
body
	overflow-x: hidden

// layout and content
#stats
	min-height: 100vh

	.container
		width: 100%
		height: 100%
		margin: 0 auto
		padding-left: 1rem
		padding-right: 1rem
		box-sizing: border-box

		@media (max-width: 4320px)
			max-width: 2500px
			.numbers
				max-width: 1500px
				grid-template-columns: repeat(7, 1fr)
			#chart-area-top
				grid-template-columns: calc(100% - 1130px - 2rem) 1130px
				&.first-column-only
					grid-template-columns: calc(100% - 1rem) 0%
				.resizer
					display: list-item
			#chart-area-main
				grid-template-columns: calc(33.33% - 1rem) 550px auto
		@media (max-width: 2500px)
			max-width: 2200px
		@media (max-width: 2000px)
			max-width: 1750px
		@media (max-width: 1750px)
			max-width: 1200px
			#header
				grid-template-areas: "title meta action" "filter filter filter"
				grid-template-columns: 1fr auto 5rem
				.filter
					justify-content: end
			#chart-area-top
				grid-template-columns: calc(100% - 1rem)
				.resizer
					display: none
			#chart-area-main
				grid-template-columns: calc(100% - 1rem)
		@media (max-width: 960px)
			.numbers
				grid-template-columns: repeat(3, 1fr)

		header
			margin-top: 0
			margin-bottom: 1rem
			display: grid
			grid-template-areas: "title filter action" "meta meta meta"
			grid-template-columns: 1fr auto auto;
			gap: 1rem
			align-items: center
			h1
				grid-area: title
				margin: 0
				.logo
					height: 48px
			.filter
				grid-area: filter
				gap: 1rem
				margin-left: auto
				.loading
					loader 18px 3px
					margin: 4px 4px 4px 7px
				.refresh
					margin-left: 3px
			.action
				grid-area: action
				justify-self: end
			.meta
				grid-area: meta
				justify-self: end

		
		&>h2
			font-weight: 300

		.numbers
			display: grid
			column-gap: 1rem
			row-gap: 2rem
			&>div
				text-align: center
				.featured
					font-size: 3.25em
					line-height: 1.25em
					font-weight: 500

		.charts
			.chart-area
				display: grid
				column-gap: 2rem
				row-gap: 1rem
				transition: grid-template-columns .2s
				& > *, .tab-content:not(.chart-group) > *:not(.tab-empty)
					min-height: 380px
				.chart
					min-width: 0
					h2
						margin-bottom: 0
					p
						margin-top: 0

</style>
