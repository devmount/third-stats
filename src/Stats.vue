<template>
	<div id='stats' class='text-normal background-normal position-relative' :class='scheme'>
		<!-- progress indicator -->
		<div class="progress position-fixed w-available top-0 right-0">
			<div
				class='h-0-25 text-center background-accent2 tooltip tooltip-bottom'
				:class='{ "transition-width": processingState>0 && processingState<100 }'
				:style='"width:" + processingState + "%;"'
				:data-tooltip='oneDigit(processingState) + "%"'
			></div>
		</div>
		<div class='container pt-2 pb-6'>
			<!-- title heading and filter -->
			<header>
				<h1 class='mr-2 d-flex align-items-center'>
					<img class='logo mr-1' :src='`${publicPath}icon.svg`' alt='ThirdStats Logo'>
					Th<span class='text-gray'>underb</span>ird Stats
				</h1>
				<!-- filter area -->
				<div class='filter d-flex flex-wrap'>
					<!-- account selection -->
					<div class='filter-account d-flex'>
						<label for='account' class='align-center text-gray p-0-5'>{{ $tc('popup.account', 1) }}</label>
						<select v-model='active.account' :disabled='loading' class='align-stretch w-6' :class='{ disabled: loading }' id='account'>
							<option v-if='accounts.length > 1 && preferences.cache' :value='"sum"'>{{ $t('stats.allAccounts') }}</option>
							<option v-for='a in accounts' :key='a.id' :value='a.id'>{{ a.name }}</option>
						</select>
						<div v-show='loading' :class='scheme + " loading align-center loader-accent2"'></div>
						<div
							v-show='!loading'
							class='refresh align-center cursor-pointer tooltip tooltip-bottom d-inline-flex'
							:data-tooltip='$t("stats.tooltips.refresh")'
							@click='loadAccount(active.account, true)'
						>
							<svg class='icon icon-bold icon-gray icon-hover-accent' viewBox='0 0 24 24'>
								<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
								<path class='icon-part-accent2' d='M9 4.55a8 8 0 0 1 6 14.9m0 -4.45v5h5' />
								<line class='icon-part-accent2' x1='5.63' y1='7.16' x2='5.63' y2='7.17' />
								<line class='icon-part-accent2-faded' x1='4.06' y1='11' x2='4.06' y2='11.01' />
								<line class='icon-part-accent2-faded' x1='4.63' y1='15.1' x2='4.63' y2='15.11' />
								<line class='icon-part-accent2-faded' x1='7.16' y1='18.37' x2='7.16' y2='18.38' />
								<line class='icon-part-accent2-faded' x1='11' y1='19.94' x2='11' y2='19.95' />
							</svg>
						</div>
					</div>
					<!-- folder selection -->
					<div class='filter-folder d-flex ml-2'>
						<label for='folder' class='align-center text-gray p-0-5'>{{ $tc('popup.folder', 1) }}</label>
						<div
							class="d-flex align-stretch tooltip-bottom"
							:class='{ tooltip: !singleAccount }'
							:data-tooltip='$t("stats.tooltips.folder.notAvailable", [$t("stats.allAccounts")])'
						>
							<select
								id='folder'
								v-model='active.folder'
								:disabled='loading || !singleAccount'
								class='align-stretch w-6'
								:class='{ disabled: loading || !singleAccount }'
							>
								<option v-for='f in folders' :key='f.path' :value='f'>{{ formatFolder(f) }}</option>
							</select>
						</div>
						<div
							class='cursor-pointer tooltip tooltip-bottom d-inline-flex align-center'
							:class='{ "cursor-na": loading || !singleAccount }'
							:data-tooltip='$t("stats.tooltips.clear")'
							@click='singleAccount ? resetFolder(true) : null'
						>
							<svg class='icon icon-bold icon-gray' :class='{ "icon-hover-accent": !loading && singleAccount }' viewBox='0 0 24 24'>
								<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
								<line class='icon-part-accent2' x1='18' y1='6' x2='6' y2='18' />
								<line class='icon-part-accent2' x1='6' y1='6' x2='18' y2='18' />
							</svg>
						</div>
					</div>
					<!-- time period selection -->
					<div class='filter-period d-flex ml-2'>
						<label for='start' class='align-center text-gray p-0-5'>{{ $t("stats.timePeriod") }}</label>
						<div class='input-group d-flex align-stretch'>
							<div
								class='d-flex tooltip tooltip-bottom'
								v-for='f in ["start", "end"]'
								:key='f'
								:data-tooltip='error.period[f].length > 0 ? error.period[f].join("\n") : $t("stats.tooltips.period." + f, [examplePeriodShort, examplePeriodFormatted])'
								:class='{ "tooltip-error": error.period[f].length > 0 }'
							>
								<input
									type='text'
									:id='f'
									v-model='active.period[f]'
									class='align-stretch w-6'
									:class='{ error: error.period[f].length > 0 }'
									placeholder='YYYY-MM-DD'
									@blur='formatPeriod(f)'
									v-on:keyup.enter='formatPeriod(f);updatePeriod()'
								/>
							</div>
							<button @click='updatePeriod' class='button-secondary align-center p-0-5'>
								<svg class="icon icon-small icon-bold d-block m-0-auto" viewBox="0 0 24 24">
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<path d="M5 12l5 5l10 -10" />
								</svg>
							</button>
						</div>
						<div class='cursor-pointer tooltip tooltip-bottom d-inline-flex align-center' :data-tooltip='$t("stats.tooltips.clear")' @click='resetPeriod(true)'>
							<svg class='icon icon-bold icon-gray icon-hover-accent' viewBox='0 0 24 24'>
								<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
								<line class='icon-part-accent2' x1='18' y1='6' x2='6' y2='18' />
								<line class='icon-part-accent2' x1='6' y1='6' x2='18' y2='18' />
							</svg>
						</div>
					</div>
					<!-- options launcher -->
					<div
						class='cursor-pointer tooltip tooltip-bottom d-inline-flex align-center ml-2'
						:data-tooltip='$t("popup.openOptions")'
						@click.prevent="openTab('options.html', '1')"
					>
						<svg class='icon icon-bold icon-gray icon-hover-accent' viewBox="0 0 24 24">
							<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
							<path class='icon-part-accent2' d='M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z' />
							<circle class='icon-part-accent2-faded' cx='12' cy='12' r='3' />
						</svg>
					</div>
				</div>
			</header>
			<!-- meta info section -->
			<section class='meta mt-1 text-gray text-right'>
				<div
					v-if='display.meta && display.meta.timestamp'
					class='d-inline-block tooltip tooltip-bottom'
					:data-tooltip='formatDate(display.meta.timestamp)'
				>
					<LiveAge :date="display.meta.timestamp" />
				</div>
			</section>
			<!-- fetured numbers -->
			<section class='numbers mx-auto mt-2'>
				<!-- total -->
				<div>
					<div class='text-gray'>{{ $t('stats.mailsTotal') }}</div>
					<div class='featured'>{{ display.numbers.total.toLocaleString() }}</div>
					<div class='text-gray'>{{ $t('stats.withinYears', [oneDigit(years)]) }}</div>
				</div>
				<!-- unread -->
				<div>
					<div class='text-gray'>{{ $t('stats.mailsUnread') }}</div>
					<div class='featured'>{{ display.numbers.unread.toLocaleString() }}</div>
					<div class='text-gray' v-if='display.numbers.unread == 0'>{{ $t('stats.niceWork') }}</div>
					<div class='text-gray' v-else>{{ $t('stats.percentOfReceived', [unreadPercentage]) }}</div>
				</div>
				<!-- received -->
				<div>
					<div class='text-accent2'>{{ $t('stats.mailsReceived') }}</div>
					<div class='featured text-accent2'>{{ display.numbers.received.toLocaleString() }}</div>
					<div class='text-gray'>{{ $t('stats.percentOfTotal', [receivedPercentage]) }}</div>
				</div>
				<!-- sent -->
				<div>
					<div class='text-accent1'>{{ $t('stats.mailsSent') }}</div>
					<div class='featured text-accent1'>{{ display.numbers.sent.toLocaleString() }}</div>
					<div class='text-gray'>{{ $t('stats.percentOfTotal', [sentPercentage]) }}</div>
				</div>
				<!-- per month / per year -->
				<div>
					<div class='text-gray'>{{ $t('stats.mailsPerMonth') }}</div>
					<div class='featured'>{{ perMonth }}</div>
					<div class='text-gray'>{{ perYear }} {{ $t('stats.mailsYear') }}</div>
				</div>
				<!-- per day / per week -->
				<div>
					<div class='text-gray'>{{ $t('stats.mailsPerDay') }}</div>
					<div class='featured'>{{ perDay }}</div>
					<div class='text-gray'>{{ perWeek }} {{ $t('stats.mailsWeek') }}</div>
				</div>
			</section>
			<!-- still processing -->
			<section v-if='loading && display.numbers.total == 0' class='mt-5'>
				<svg class='icon icon-huge icon-gray d-block m-0-auto icon-animated-color-transition' viewBox='0 0 24 24'>
					<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
					<polyline points='4 19 8 13 12 15 16 10 20 14 20 19 4 19' />
					<polyline points='4 12 7 8 11 10 16 4 20 8' />
				</svg>
				<div class='text-center text-gray'>
					{{ $t('stats.loadingInProgress') }}
				</div>
			</section>
			<!-- empty account -->
			<section v-if='!loading && display.numbers.total == 0' class='mt-5'>
				<svg class="icon icon-huge icon-gray d-block m-0-auto" viewBox="0 0 24 24">
					<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
					<rect x="4" y="4" width="16" height="16" rx="2" />
					<path d="M4 13h3l3 3h4l3 -3h3" />
				</svg>
				<div class="text-center text-gray">
					{{ $t("stats.accountEmpty") }}
				</div>
			</section>
			<!-- charts -->
			<section v-if='display.numbers.total > 0' class='charts mt-2'>
				<div
					id='chart-area-top'
					class='chart-area'
					:class='{ "first-column-only": preferences.sections.total.expand }'
				>
					<!-- section: total -->
					<div class='tab-area'>
						<ul class='tab'>
							<li
								v-for='(active, label) in tabs.total'
								:key='label'
								class='tab-item cursor-default tooltip tooltip-bottom border-bottom-accent2'
								:data-tooltip='$t("stats.charts." + label + ".description")'
								:class='{ "active": active, "cursor-pointer": !active, "text-hover-accent2": !active }'
								@click='activateTab("total", label)'
							>
								<span
									class="transition-color transition-border-image"
									:class="{ 'border-bottom-gradient-accent2-accent1': !preferences.sections.total.comparison }"
									:style="active && preferences.sections.total.comparison ? 'border-image: linear-gradient(to right, ' + accountsColorGradient + ') 100% 1' : ''"
								>
									{{ $t('stats.charts.' + label + '.title') }}
								</span>
							</li>
							<li
								v-if="!loading && active.account == 'sum'"
								class='cursor-pointer tooltip tooltip-bottom text-hover-accent2 px-1 ml-auto'
								:data-tooltip='
									!preferences.sections.total.comparison
									? $t("stats.tooltips.comparison")
									: $t("stats.tooltips.sum")
								'
								@click='preferences.sections.total.comparison=!preferences.sections.total.comparison'
							>
								<svg class='icon icon-text icon-hover-accent' :class='{"icon-accent2": preferences.sections.total.comparison}' viewBox='0 0 24 24'>
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<rect class="icon-part-accent2" x="3" y="3" width="6" height="6" rx="1" />
									<rect class="icon-part-accent1" x="15" y="15" width="6" height="6" rx="1" />
									<path class="icon-part-accent2-faded" d="M21 11v-3a2 2 0 0 0 -2 -2h-6l3 3m0 -6l-3 3" />
									<path class="icon-part-accent1-faded" d="M3 13v3a2 2 0 0 0 2 2h6l-3 -3m0 6l3 -3" />
								</svg>
							</li>
							<li
								class='resizer cursor-pointer tooltip tooltip-bottom text-hover-accent2 px-1'
								:class="{ 'ml-auto': active.account != 'sum' || loading }"
								:data-tooltip='
									!preferences.sections.total.expand
									? $t("stats.tooltips.expand")
									: $t("stats.tooltips.shrink")
								'
								@click='preferences.sections.total.expand=!preferences.sections.total.expand'
							>
								<svg v-show='!preferences.sections.total.expand' class='icon icon-text' viewBox='0 0 24 24'>
									<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
									<polyline points='16 4 20 4 20 8' /><line x1='14' y1='10' x2='20' y2='4' />
									<polyline points='8 20 4 20 4 16' /><line x1='4' y1='20' x2='10' y2='14' />
									<polyline points='16 20 20 20 20 16' /><line x1='14' y1='14' x2='20' y2='20' />
									<polyline points='8 4 4 4 4 8' /><line x1='4' y1='4' x2='10' y2='10' />
								</svg>
								<svg v-show='preferences.sections.total.expand' class='icon icon-text icon-arrows-minimize' viewBox='0 0 24 24'>
									<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
									<polyline points='5 9 9 9 9 5' /><line x1='3' y1='3' x2='9' y2='9' />
									<polyline points='5 15 9 15 9 19' /><line x1='3' y1='21' x2='9' y2='15' />
									<polyline points='19 9 15 9 15 5' /><line x1='15' y1='9' x2='21' y2='3' />
									<polyline points='19 15 15 15 15 19' /><line x1='15' y1='15' x2='21' y2='21' />
								</svg>
							</li>
						</ul>
						<div class='tab-content mt-1'>
							<!-- emails per year over total time -->
							<LineChart
								v-if='tabs.total.years && !preferences.sections.total.comparison'
								:datasets='yearsChartData.datasets'
								:labels='yearsChartData.labels'
								:ordinate='preferences.ordinate'
								:abscissa='true'
							/>
							<LineChart
								v-if='tabs.total.years && preferences.sections.total.comparison'
								:datasets='yearsComparedChartData.datasets'
								:labels='yearsComparedChartData.labels'
								:ordinate='preferences.ordinate'
								:abscissa='true'
							/>
							<!-- emails per quarter over total time -->
							<LineChart
								v-if='tabs.total.quarters && !preferences.sections.total.comparison'
								:datasets='quartersChartData.datasets'
								:labels='quartersChartData.labels'
								:ordinate='preferences.ordinate'
								:abscissa='true'
							/>
							<LineChart
								v-if='tabs.total.quarters && preferences.sections.total.comparison'
								:datasets='quartersComparedChartData.datasets'
								:labels='quartersComparedChartData.labels'
								:ordinate='preferences.ordinate'
								:abscissa='true'
							/>
							<!-- emails per month over total time -->
							<LineChart
								v-if='tabs.total.months && !preferences.sections.total.comparison'
								:datasets='monthsChartData.datasets'
								:labels='monthsChartData.labels'
								:ordinate='preferences.ordinate'
								:abscissa='true'
							/>
							<LineChart
								v-if='tabs.total.months && preferences.sections.total.comparison'
								:datasets='monthsComparedChartData.datasets'
								:labels='monthsComparedChartData.labels'
								:ordinate='preferences.ordinate'
								:abscissa='true'
							/>
							<!-- emails per week over total time -->
							<LineChart
								v-if='tabs.total.weeks && !preferences.sections.total.comparison'
								:datasets='weeksChartData.datasets'
								:labels='weeksChartData.labels'
								:ordinate='preferences.ordinate'
								:abscissa='true'
							/>
							<LineChart
								v-if='tabs.total.weeks && preferences.sections.total.comparison'
								:datasets='weeksComparedChartData.datasets'
								:labels='weeksComparedChartData.labels'
								:ordinate='preferences.ordinate'
								:abscissa='true'
							/>
						</div>
					</div>
					<!-- section: activity -->
					<div v-show='!preferences.sections.total.expand' class='tab-area position-relative'>
						<div class='position-absolute top-0-5 right-0-5 d-flex gap-0-5'>
							<div class='d-inline-flex align-center' :class='{"cursor-pointer": preferences.sections.activity.year > minYear}' @click.prevent='previousYear()'>
								<svg class='icon icon-bold icon-gray icon-hover-accent' :class='{"v-hidden": preferences.sections.activity.year <= minYear}' viewBox='0 0 24 24'>
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<polyline class='icon-part-accent2' points="15 6 9 12 15 18" />
								</svg>
							</div>
							<select v-model='preferences.sections.activity.year' name='year'>
								<option v-for='y in yearsList' :key='y' :value='y'>{{ y }}</option>
							</select>
							<div class='d-inline-flex align-center' :class='{"cursor-pointer": preferences.sections.activity.year < maxYear}' @click.prevent='nextYear()'>
								<svg class='icon icon-bold icon-gray icon-hover-accent' :class='{"v-hidden": preferences.sections.activity.year >= maxYear}' viewBox='0 0 24 24'>
									<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
									<polyline class='icon-part-accent2' points='9 6 15 12 9 18' />
								</svg>
							</div>
						</div>
						<ul class='tab'>
							<li
								v-for='(active, label) in tabs.activity'
								:key='label'
								class='tab-item cursor-default tooltip tooltip-bottom'
								:data-tooltip='$t("stats.charts." + label + ".description")'
								:class='{ "active": active, "cursor-pointer": !active, "text-hover-accent2": !active }'
								@click='activateTab("activity", label)'
							>
								<span class="transition-color transition-border-image border-bottom-gradient-accent2-accent1">
									{{ $t('stats.charts.' + label + '.title', [preferences.sections.activity.year]) }}
								</span>
							</li>
						</ul>
						<div class='tab-content chart-group mt-1'>
							<!-- activity per day received -->
							<HeatMap
								rgb='10, 132, 255'
								spacing='1px'
								rounding='5px'
								:dataset='daysChartData.received'
								:labels='{ y: daysChartData.ylabels, x: daysChartData.xlabels }'
								:tooltips='"{y}, " + $t("stats.abbreviations.calendarWeek") + "{x}\n{label}: {value}"'
								class='mt-2 mb-1-5'
							/>
							<!-- activity per day sent -->
							<HeatMap
								rgb='230, 77, 185'
								spacing='1px'
								rounding='5px'
								:dataset='daysChartData.sent'
								:labels='{ y: daysChartData.ylabels, x: daysChartData.xlabels }'
								:tooltips='"{y}, " + $t("stats.abbreviations.calendarWeek") + "{x}\n{label}: {value}"'
							/>
						</div>
					</div>
				</div>
				<div id='chart-area-main' class='chart-area mt-2'>
					<!-- section: onedim -->
					<div class='tab-area'>
						<ul class='tab'>
							<li
								v-for='(active, label) in tabs.onedim'
								:key='label'
								class='tab-item cursor-default tooltip tooltip-bottom'
								:data-tooltip='$t("stats.charts." + label + ".description")'
								:class='{ "active": active, "cursor-pointer": !active, "text-hover-accent2": !active }'
								@click='activateTab("onedim", label)'
							>
								<span
									class="transition-color transition-border-image"
									:class="{ 'border-bottom-gradient-accent2-accent1': !preferences.sections.onedim.comparison }"
									:style="active && preferences.sections.onedim.comparison ? 'border-image: linear-gradient(to right, ' + accountsColorGradient + ') 100% 1' : ''"
								>
									{{ $t('stats.charts.' + label + '.title') }}
								</span>
							</li>
							<li
								v-if="!loading && active.account == 'sum'"
								class='cursor-pointer tooltip tooltip-bottom text-hover-accent2 px-1 ml-auto'
								:data-tooltip='
									!preferences.sections.onedim.comparison
									? $t("stats.tooltips.comparison")
									: $t("stats.tooltips.sum")
								'
								@click='preferences.sections.onedim.comparison=!preferences.sections.onedim.comparison'
							>
								<svg class='icon icon-text icon-hover-accent' :class='{"icon-accent2": preferences.sections.onedim.comparison}' viewBox='0 0 24 24'>
									<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
									<rect class="icon-part-accent2" x="3" y="3" width="6" height="6" rx="1" />
									<rect class="icon-part-accent1" x="15" y="15" width="6" height="6" rx="1" />
									<path class="icon-part-accent2-faded" d="M21 11v-3a2 2 0 0 0 -2 -2h-6l3 3m0 -6l-3 3" />
									<path class="icon-part-accent1-faded" d="M3 13v3a2 2 0 0 0 2 2h6l-3 -3m0 6l3 -3" />
								</svg>
							</li>
						</ul>
						<div class='tab-content mt-1'>
							<!-- emails per time of day -->
							<BarChart
								v-if='tabs.onedim.daytime && !preferences.sections.onedim.comparison'
								:datasets='daytimeChartData.datasets'
								:labels='daytimeChartData.labels'
								:ordinate='preferences.ordinate'
							/>
							<BarChart
								v-if='tabs.onedim.daytime && preferences.sections.onedim.comparison'
								:datasets='daytimeComparedChartData.datasets'
								:labels='daytimeComparedChartData.labels'
								:ordinate='preferences.ordinate'
							/>
							<!-- emails per day of week -->
							<BarChart
								v-if='tabs.onedim.weekday && !preferences.sections.onedim.comparison'
								:datasets='weekdayChartData.datasets'
								:labels='weekdayChartData.labels'
								:ordinate='preferences.ordinate'
							/>
							<BarChart
								v-if='tabs.onedim.weekday && preferences.sections.onedim.comparison'
								:datasets='weekdayComparedChartData.datasets'
								:labels='weekdayComparedChartData.labels'
								:ordinate='preferences.ordinate'
							/>
							<!-- emails per month of year -->
							<BarChart
								v-if='tabs.onedim.month && !preferences.sections.onedim.comparison'
								:datasets='monthChartData.datasets'
								:labels='monthChartData.labels'
								:ordinate='preferences.ordinate'
							/>
							<BarChart
								v-if='tabs.onedim.month && preferences.sections.onedim.comparison'
								:datasets='monthComparedChartData.datasets'
								:labels='monthComparedChartData.labels'
								:ordinate='preferences.ordinate'
							/>
						</div>
					</div>
					<!-- section: twodim -->
					<div class='tab-area'>
						<ul class='tab'>
							<li
								v-for='(active, label) in tabs.twodim'
								:key='label'
								class='tab-item cursor-default tooltip tooltip-bottom'
								:data-tooltip='$t("stats.charts." + label + ".description")'
								:class='{ "active": active, "cursor-pointer": !active, "text-hover-accent2": !active }'
								@click='activateTab("twodim", label)'
							>
								<span class="transition-color transition-border-image border-bottom-gradient-accent2-accent1">
									{{ $t('stats.charts.' + label + '.title') }}
								</span>
							</li>
						</ul>
						<div class="tab-content chart-group mt-1">
							<!-- emails per weekday per hour received -->
							<HeatMap
								rgb='10, 132, 255'
								spacing='1px'
								rounding='5px'
								:dataset='weekdayPerHourChartData.received'
								:labels='{ y: weekdayPerHourChartData.labels, x: Array.from(Array(24).keys())}'
								:tooltips='"{y}, {x}:00\n{label}: {value}"'
								class='mt-1-5 mb-1-5'
							/>
							<!-- emails per weekday per hour sent -->
							<HeatMap
								rgb='230, 77, 185'
								spacing='1px'
								rounding='5px'
								:dataset='weekdayPerHourChartData.sent'
								:labels='{ y: weekdayPerHourChartData.labels, x: Array.from(Array(24).keys())}'
								:tooltips='"{y}, {x}:00\n{label}: {value}"'
							/>
						</div>
					</div>
					<!-- section: leader -->
					<div class='tab-area'>
						<ul class='tab'>
							<li
								v-for='(active, label) in tabs.leader'
								:key='label'
								class='tab-item cursor-default tooltip tooltip-bottom'
								:data-tooltip='$t("stats.charts." + label + ".description")'
								:class='{ "active": active, "cursor-pointer": !active, "text-hover-accent2": !active }'
								@click='activateTab("leader", label)'
							>
								<span
									class="transition-color transition-border-color"
									:class='{ "border-bottom-accent2": label=="contactsReceived", "border-bottom-accent1": label=="contactsSent"}'
								>
									{{ $t('stats.charts.' + label + '.title') }}
								</span>
							</li>
						</ul>
						<div class="tab-content mt-1">
							<!-- contacts most emails received from -->
							<BarChart
								v-if='tabs.leader.contactsReceived'
								:datasets='receivedContactLeadersChartData.datasets'
								:labels='receivedContactLeadersChartData.labels'
								:horizontal='true'
							/>
							<!-- contacts most emails sent to -->
							<BarChart
								v-if='tabs.leader.contactsSent'
								:datasets='sentContactLeadersChartData.datasets'
								:labels='sentContactLeadersChartData.labels'
								:horizontal='true'
							/>
						</div>
					</div>
				</div>
			</section>
			<!-- footer -->
			<footer class="mt-6 text-center">
				<div class='text-gray'>
					<span class='text-middle mr-1'>ThirdStats {{ appVersion }}</span>
					<svg
						v-if='preferences.dark'
						class='icon icon-dark icon-text icon-thin d-inline text-middle cursor-pointer'
						viewBox='0 0 24 24'
						@click.prevent='preferences.dark = false'
					>
						<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
						<circle cx='12' cy='12' r='4' />
						<path d='M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7' />
					</svg>
					<svg
						v-else
						class='icon icon-light icon-text icon-thin d-inline text-middle cursor-pointer'
						viewBox='0 0 24 24'
						@click.prevent='preferences.dark = true'
					>
						<path stroke='none' d='M0 0h24v24H0z' fill='none'/>
						<path d='M12 3c0.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z' />
					</svg>
				</div>
				<div class="text-gray" v-html='$t("stats.starAndImprove", ["https://github.com/devmount/third-stats"])'></div>
			</footer>
		</div>
	</div>
</template>

<script>
// internal components
import { defaultColors } from './definitions';
import { traverseAccount, extractEmailAddress, weekNumber, weeksInYear, quarterNumber, hexToRgb } from './utils';
import LineChart from './charts/LineChart'
import BarChart from './charts/BarChart'
import HeatMap from './charts/HeatMap'
import LiveAge from './parts/LiveAge'

// initialize Chart.js with global configuration
import Chart from 'chart.js'
Chart.defaults.global.defaultFontColor = "#8a8a97"
Chart.defaults.global.elements.arc.borderWidth = 0
Chart.defaults.global.legend.display = false
Chart.defaults.global.tooltips.mode = 'index'
Chart.defaults.global.tooltips.intersect = false
Chart.defaults.global.tooltips.multiKeyBackground = '#000'
Chart.defaults.global.tooltips.titleMarginBottom = 10
Chart.defaults.global.tooltips.xPadding = 10
Chart.defaults.global.tooltips.yPadding = 10
Chart.defaults.global.tooltips.cornerRadius = 2
Chart.defaults.global.hover.mode = 'index'

// helper class for object generation
class NumberedObject {
	constructor(n, m=null) {
		const a = [...Array(n).keys()]
		a.map(e => {
			this[e] = m === null ? 0 : new Array(m).fill(0)
		})
	}
}
// helper function for objects sum, given array of flat objects
const sumObjects = (objs) => {
	const res = objs.reduce((a, b) => {
		for (let k in b) {
			if (b.hasOwnProperty(k))
				a[k] = (a[k] || 0) + b[k]
		}
		return a
	}, {})
	return res
}
// helper function for objects sum, given array of objects of flat objects
const sumObjectsObjects = (objs) => {
	const res = objs.reduce((a, b) => {
		for (let k in b) {
			if (b.hasOwnProperty(k))
				a[k] = a[k] ? sumObjects([a[k], b[k]]) : b[k]
		}
		return a
	}, {})
	return res
}
// helper function for objects sum, given array of objects of arrays
const sumObjectsArrays = (objs) => {
	const res = objs.reduce((a, b) => {
		for (let k in b) {
			if (b.hasOwnProperty(k)) {
				if (!a[k])
					a[k] = new Array(b[k].length).fill(0)
				for(let i=0; i<b[k].length; ++i)
					a[k][i] = b[k][i] + a[k][i]
			}
		}
		return a
	}, {})
	return res
}
// helper function to sort object properties by value, limit entries and return an object again
const sortAndLimitObject = (obj, limit) => {
	let r = Object.entries(obj).sort(([,a],[,b]) => b-a).reduce((r, [k, v]) => ({ ...r, [k]: v }), {})
	return Object.keys(r)
		.slice(0, limit)
		.reduce((result, key) => { result[key] = r[key]; return result; }, {})
}
// helper function to sort object properties by value, limit entries and return an array
const sortAndLimitObjectToArray = (obj, limit) => {
	return Object.entries(obj).sort(([,a],[,b]) => b-a).slice(0, limit)
}
// helper function to see if array contains another array
const arrayContainsArray = (arr, target) => target.every(v => arr.includes(v))

export default {
	name: 'Stats',
	components: { LineChart, BarChart, HeatMap, LiveAge },
	data () {
		return {
			accounts: [],    // list of all existing accounts
			identities: [],  // list of all existing identities
			folders: [],     // list of all existing folders for the current account
			active: {
				account: null, // currently selected account
				folder: null,  // currently selected folder
				period: {
					start: null, // currently configured start of period of time
					end: null,   // currently configured end of period of time
				}
			},
			error: {
				period: {
					start: [],   // indicates if currently configured start of period of time is valid
					end: [],     // indicates if currently configured end of period of time is valid
				}
			},
			loading: false,  // loading indication, keeps showing results and processes data in background
			progress: {
				current: 0,    // indicator for progress on refreshing data, [0-1]
				max: 0,        // upper limit for progress indicator
			},
			display: {},     // processed data to show
			comparison: {},  // subset of display to show data for account comparison view
			tabs: {          // tab navigation containing one active tab at a time
				total: {
					years: true,
					quarters: false,
					months: false,
					weeks: false,
				},
				activity: {
					days: true,
				},
				onedim: {
					daytime: true,
					weekday: false,
					month: false,
				},
				twodim: {
					temporalDistribution: true,
				},
				leader: {
					contactsReceived: true,
					contactsSent: false,
				},
			},
			preferences: {   // preferences set for this page
				sections: {    // preferences that can be set on this page
					total: {
						expand: false,
						comparison: false
					},
					activity: {
						year: (new Date()).getFullYear()
					},
					onedim: {
						comparison: false
					}
				},
				dark: true,    // preferences loaded from stored options
				ordinate: false,
				startOfWeek: 0,
				localIdentities: [],
				accounts: [],
				accountColors: {},
				selfMessages: 'none',
				leaderCount: 20,
				cache: true,
			},
			publicPath: process.env.BASE_URL
		}
	},
	async created () {
		// set initial tab title
		document.title = 'ThirdStats'
		// initially reset displayed data
		this.display = JSON.parse(JSON.stringify(this.initData()))
		this.comparison = JSON.parse(JSON.stringify(this.initComparisonData()))
		// get stored options
		await this.getOptions()
		// retrieve all accounts
		await this.getAccounts()
	},
	methods: {
		// basic data structure to display numbers and charts
		// used for single and multi-account display
		initData () {
			return { 
				meta: {
					timestamp: null
				},
				numbers: {
					total: 0,
					unread: 0,
					received: 0,
					sent: 0,
					start: this.active.period.start ? new Date(this.active.period.start) : new Date(),
					end: this.active.period.end ? new Date(this.active.period.end) : new Date(),
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
				daysData: {
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
					received: new NumberedObject(7,24),
					sent: new NumberedObject(7,24),
				},
				contacts: {
					received: {},
					sent: {},
				},
			}
		},
		// basic data structure to display charts
		// used for comparing account data
		initComparisonData () {
			return { 
				yearsData: {},
				quartersData: {},
				monthsData: {},
				weeksData: {},
				daytimeData: {},
				weekdayData: {},
				monthData: {},
			}
		},
		// get all add-on settings from the options page
		// for non existing options use default value
		async getOptions () {
			let result = await messenger.storage.local.get('options')
			// only load options if they have been set, otherwise default settings will be kept
			if (result && result.options) {
				this.preferences.dark = result.options.dark ? true : false
				this.preferences.ordinate = result.options.ordinate ? true : false
				this.preferences.startOfWeek = result.options.startOfWeek ? result.options.startOfWeek : 0
				this.preferences.localIdentities = result.options.addresses ? result.options.addresses.split(',').map(x => x.trim()) : []
				this.preferences.accounts = result.options.accounts ? result.options.accounts : []
				this.preferences.accountColors = result.options.accountColors ? result.options.accountColors : {}
				this.preferences.selfMessages = result.options.selfMessages ? result.options.selfMessages : 'none'
				this.preferences.leaderCount = result.options.leaderCount ? result.options.leaderCount : 20
				this.preferences.cache = result.options.cache ? true : false
			}
		},
		// retrieve accounts and identities list
		// get active account from URL get parameter
		async getAccounts () {
			let accounts = await messenger.accounts.list()
			// if account colors are not initialized yet, initialize them
			if (Object.keys(this.preferences.accountColors).length == 0) {
				accounts.map((a, i) => {
					this.preferences.accountColors[a.id] = defaultColors[(i%defaultColors.length)]
				})
			}
			if (this.preferences.accounts.length > 0) {
				// filter list of accounts if user configured custom list
				accounts = accounts.filter(a => this.preferences.accounts.includes(a.id))
			} else {
				// default accounts activated are all non local accounts ...
				accounts = accounts.filter(a => a.type != 'none')
			}
			// assign accounts
			this.accounts = accounts
			// assign identities of all activated accounts as well as localIdentities if any local account is active
			let identities = accounts.reduce((p,c) => p.concat(c.identities.map(i => i.email)), [])
			if (accounts.some(a => a.type == 'none')) {
				identities = identities.concat(this.preferences.localIdentities)
			}
			this.identities = identities
			// extract account id from url GET parameter
			let uri = window.location.search.substring(1)
			let id = (new URLSearchParams(uri)).get('s')
			if (!id || (id == 'sum' && !this.preferences.cache) || (id == 'sum' && accounts.length <= 1)) id = accounts[0].id
			this.active.account = id
		},
		// analyze folders of a given account <a>
		// return processed data oject structured like initData
		async processAccount (a) {
			// get identities from account, or from preferences if it's a local account
			let identities = a.type != 'none' ? a.identities.map(i => i.email) : this.preferences.localIdentities
			// get all folders and subfolders from given account or selected folder of active account (filter field)
			let folders = this.active.folder ? [JSON.parse(JSON.stringify(this.active.folder))] : traverseAccount(a)
			// build folder list for filter selection, if not already present
			if (!this.folders.length) {
				this.folders = folders
			}
			let self = this
			let initData = this.initData()
			let accountData = JSON.parse(JSON.stringify(initData))
			await Promise.all(folders.map(async f => {
				// analyze all messages in all folders
				await self.processMessages(accountData, JSON.parse(JSON.stringify(f)), identities)
				// increment current progress by 1 for each folder
				self.progress.current++
			})).then(() => {
				// post processing: reduce size of contacts to configured limit
				accountData.contacts.received = sortAndLimitObject(accountData.contacts.received, self.preferences.leaderCount)
				accountData.contacts.sent = sortAndLimitObject(accountData.contacts.sent, self.preferences.leaderCount)
				// post processing: add timestamp of finished processing
				accountData.meta.timestamp = Date.now()
			})
			return accountData
		},
		// retrieve all messages of a given <folder> with accounts <identities>
		// store results in <data> object
		async processMessages (data, folder, identities) {
			if (folder) {
				let self = this
				let page = null
				if (this.active.period.start && this.active.period.end) {
					let start = new Date(this.active.period.start)
					let end = new Date(this.active.period.end)
					page = await messenger.messages.query({ folder: folder, fromDate: start, toDate: end })
				} else {
					page = await messenger.messages.query({ folder: folder })
				}
				if (page) {
					page.messages.map(m => self.analyzeMessage(data, m, identities))
					while (page.id) {
						page = await messenger.messages.continueList(page.id)
						page.messages.map(m => self.analyzeMessage(data, m, identities))
					}
				}
			}
		},
		// extract information of a single message <m> with accounts <identities>
		// update given <data> object
		analyzeMessage (data, m, identities) {
			// check for self messages first, if exclusion is enabled
			if (this.preferences.selfMessages && this.preferences.selfMessages != 'none') {
				let ids = this.preferences.selfMessages == 'sameAccount' ? identities : this.identities
				if (this.isSelfMessage(m, ids)) return
			}
			// now start analyses
			let type = ''
			let author = extractEmailAddress(m.author)
			// numbers
			data.numbers.total++
			if (m.read === false) data.numbers.unread++
			if (identities.includes(author)) {
				data.numbers.sent++
				type = 'sent'
			} else {
				data.numbers.received++
				type = 'received'
			}
			// calculate starting date (= date of oldest email)
			let start = new Date(data.numbers.start)
			if (m.date && m.date.getTime() > 0 && m.date.getTime() < start.getTime()) {
				data.numbers.start = m.date
			}
			// years
			let y = m.date.getFullYear()
			if (!(y in data.yearsData[type])) {
				data.yearsData[type][y] = 1
			} else {
				data.yearsData[type][y]++
			}
			// quarters
			let qn = quarterNumber(m.date)
			if (!(y in data.quartersData[type])) {
				data.quartersData[type][y] = {}
				data.quartersData[type][y][qn] = 1
			} else {
				if (!(qn in data.quartersData[type][y])) {
					data.quartersData[type][y][qn] = 1
				} else {
					data.quartersData[type][y][qn]++
				}
			}
			// months
			let mo = m.date.getMonth()
			if (!(y in data.monthsData[type])) {
				data.monthsData[type][y] = {}
				data.monthsData[type][y][mo] = 1
			} else {
				if (!(mo in data.monthsData[type][y])) {
					data.monthsData[type][y][mo] = 1
				} else {
					data.monthsData[type][y][mo]++
				}
			}
			// weeks
			let wn = weekNumber(m.date)
			let ywn = wn == 53 && mo == 0 ? y-1 : y // adjust year for first days of January that are before week 1
			if (!(ywn in data.weeksData[type])) {
				data.weeksData[type][ywn] = {}
				data.weeksData[type][ywn][wn] = 1
			} else {
				if (!(wn in data.weeksData[type][ywn])) {
					data.weeksData[type][ywn][wn] = 1
				} else {
					data.weeksData[type][ywn][wn]++
				}
			}
			// daytime
			let dt = m.date.getHours()
			data.daytimeData[type][dt]++
			// weekday
			let wd = m.date.getDay()
			data.weekdayData[type][wd]++
			// month
			data.monthData[type][mo]++
			// weekday per calendar week
			if (!(ywn in data.daysData[type])) {
				data.daysData[type][ywn] = new NumberedObject(7,53)
			}
			data.daysData[type][ywn][wd][wn-1]++
			// weekday per hour
			data.weekdayPerHourData[type][wd][dt]++
			// contacts (leaderboards)
			switch (type) {
				case 'sent':
					let recipients = m.recipients.map(r => extractEmailAddress(r).toLowerCase())
					recipients.map(r => {
						if (!(r in data.contacts['sent'])) {
							data.contacts['sent'][r] = 1
						} else {
							data.contacts['sent'][r]++
						}
					})
					break;
				case 'received':
					let a = author.toLowerCase()
					if (!(a in data.contacts['received'])) {
						data.contacts['received'][a] = 1
					} else {
						data.contacts['received'][a]++
					}
					break;
				default:
					break;
			}
		},
		// check if a <message> is a self message
		// = sender and receivers all match configured <identities>
		isSelfMessage (message, identities) {
			let author = extractEmailAddress(message.author)
			let recipients = message.recipients.map(r => extractEmailAddress(r))
			let ccs = message.ccList.map(r => extractEmailAddress(r))
			let bccs = message.bccList.map(r => extractEmailAddress(r))
			// check author
			if (!author) return false
			if (author && !identities.includes(author)) return false
			// check normal recipients
			if (recipients.length > 0 && !arrayContainsArray(identities, recipients)) return false
			// check cc recipients
			if (ccs.length > 0 && !arrayContainsArray(identities, ccs)) return false
			// check bcc recipients
			if (bccs.length > 0 && !arrayContainsArray(identities, bccs)) return false
			// all checks passed: its a self message
			return true
		},
		// retrieve and process data of account with <id=accountId>
		// or of multiple accounts with <id=sum>
		async refresh (id) {
			// get currently selected account
			let account = await messenger.accounts.get(id)
			// process data of this account again
			let accountData = await this.processAccount(account)
			// directly display data if only one single account was processed
			if (this.singleAccount) {
				this.display = JSON.parse(JSON.stringify(accountData))
			}
			// only store reprocessed data if cache is enabled and no filter is set
			if (this.preferences.cache && !this.filtered) {
				let stats = {}
				stats['stats-' + id] = JSON.parse(JSON.stringify(accountData))
				await messenger.storage.local.set(stats)
			}
			// return processed account data
			return accountData
		},
		// load data of given account <id=accountId> or all accounts <id=sum>
		// from cache <refresh=false> or reprocess from scratch <refresh=true>
		async loadAccount (id, refresh) {
			// start loading indication
			this.loading = true
			// check id type
			if (!this.singleAccount && this.preferences.cache) {
				// set tab title
				document.title = 'ThirdStats: ' + this.$t('stats.allAccounts')
				// deactivate list of folders
				this.folders = []
				// iterate over all activated accounts
				let accounts = this.preferences.accounts.length > 0 ? this.accounts.filter(a => this.preferences.accounts.includes(a.id)) : this.accounts
				let accountsData = []
				// init progress indicator
				this.progress.current = 1
				this.progress.max = accounts.reduce((p,c) => p+traverseAccount(c).length, 0)
				await Promise.all(accounts.map(async a => {
					// get data from storage
					let result = await messenger.storage.local.get('stats-' + a.id)
					if (!refresh && result && result['stats-' + a.id]) {
						// if no refresh requested and this accounts data was cached before, take data from cache
						accountsData.push(JSON.parse(JSON.stringify(result['stats-' + a.id])))
						this.progress.current += a.folderCount
					} else {
						// otherwise (re)process account
						let data = await this.refresh(a.id)
						accountsData.push(JSON.parse(JSON.stringify(data)))
					}
				}))
				// finish progress indicator
				this.progress.current = 0
				this.progress.max = 0

				// sum all values of all account objects
				let sum = JSON.parse(JSON.stringify(this.initData()))
				// meta
				accountsData.map(a => { if (!a.hasOwnProperty('meta')) a.meta = { timestamp: 0 }})
				sum.meta.timestamp = accountsData.reduce((p,c) => p < c.meta.timestamp ? p : c.meta.timestamp, Date.now())
				// numbers
				sum.numbers.total = accountsData.reduce((p,c) => p+c.numbers.total, 0)
				sum.numbers.unread = accountsData.reduce((p,c) => p+c.numbers.unread, 0)
				sum.numbers.received = accountsData.reduce((p,c) => p+c.numbers.received, 0)
				sum.numbers.sent = accountsData.reduce((p,c) => p+c.numbers.sent, 0)
				sum.numbers.start = accountsData.reduce((p,c) => p < c.numbers.start ? p : c.numbers.start, 0)
				sum.numbers.end = accountsData.reduce((p,c) => p >= c.numbers.end ? p : c.numbers.end, 0)
				// years
				accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.yearsData.received)])], [])
					.map(y => { sum.yearsData.received[y] = accountsData.reduce((p,c) => c.yearsData.received[y] ? p+c.yearsData.received[y] : p, 0) })
				accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.yearsData.sent)])], [])
					.map(y => { sum.yearsData.sent[y] = accountsData.reduce((p,c) => c.yearsData.sent[y] ? p+c.yearsData.sent[y] : p, 0) })
				// quarters
				accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.quartersData.received)])], [])
					.map(y => { sum.quartersData.received[y] = sumObjects(accountsData.reduce((p,c) => c.quartersData.received[y] ? p.concat(c.quartersData.received[y]) : p, [])) })
				accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.quartersData.sent)])], [])
					.map(y => { sum.quartersData.sent[y] = sumObjects(accountsData.reduce((p,c) => c.quartersData.sent[y] ? p.concat(c.quartersData.sent[y]) : p, [])) })
				// months
				accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.monthsData.received)])], [])
					.map(y => { sum.monthsData.received[y] = sumObjects(accountsData.reduce((p,c) => c.monthsData.received[y] ? p.concat(c.monthsData.received[y]) : p, [])) })
				accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.monthsData.sent)])], [])
					.map(y => { sum.monthsData.sent[y] = sumObjects(accountsData.reduce((p,c) => c.monthsData.sent[y] ? p.concat(c.monthsData.sent[y]) : p, [])) })
				// weeks
				accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.weeksData.received)])], [])
					.map(y => { sum.weeksData.received[y] = sumObjects(accountsData.reduce((p,c) => c.weeksData.received[y] ? p.concat(c.weeksData.received[y]) : p, [])) })
				accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.weeksData.sent)])], [])
					.map(y => { sum.weeksData.sent[y] = sumObjects(accountsData.reduce((p,c) => c.weeksData.sent[y] ? p.concat(c.weeksData.sent[y]) : p, [])) })
				// days
				accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.daysData.received)])], [])
					.map(y => { sum.daysData.received[y] = sumObjectsArrays(accountsData.reduce((p,c) => c.daysData.received[y] ? p.concat(c.daysData.received[y]) : p, [])) })
				accountsData.reduce((p,c) => [...new Set([...p ,...Object.keys(c.daysData.sent)])], [])
					.map(y => { sum.daysData.sent[y] = sumObjectsArrays(accountsData.reduce((p,c) => c.daysData.sent[y] ? p.concat(c.daysData.sent[y]) : p, [])) })
				// daytime
				for (let h = 0; h < 24; h++) {
					sum.daytimeData.received[h] = accountsData.reduce((p,c) =>  p+c.daytimeData.received[h], 0)
					sum.daytimeData.sent[h] = accountsData.reduce((p,c) =>  p+c.daytimeData.sent[h], 0)
				}
				// weekday
				for (let d = 0; d < 7; d++) {
					sum.weekdayData.received[d] = accountsData.reduce((p,c) =>  p+c.weekdayData.received[d], 0)
					sum.weekdayData.sent[d] = accountsData.reduce((p,c) =>  p+c.weekdayData.sent[d], 0)
				}
				// month
				for (let m = 0; m < 12; m++) {
					sum.monthData.received[m] = accountsData.reduce((p,c) =>  p+c.monthData.received[m], 0)
					sum.monthData.sent[m] = accountsData.reduce((p,c) =>  p+c.monthData.sent[m], 0)
				}
				// weekday per hour
				for (let d = 0; d < 7; d++) {
					for (let h = 0; h < 24; h++) {
						sum.weekdayPerHourData.received[d][h] = accountsData.reduce((p,c) =>  p+c.weekdayPerHourData.received[d][h], 0)
						sum.weekdayPerHourData.sent[d][h] = accountsData.reduce((p,c) =>  p+c.weekdayPerHourData.sent[d][h], 0)
					}
				}
				// contacts
				sum.contacts.received = sortAndLimitObject(sumObjects(accountsData.reduce((p,c) => p.concat(c.contacts.received), [])), this.preferences.leaderCount)
				sum.contacts.sent = sortAndLimitObject(sumObjects(accountsData.reduce((p,c) => p.concat(c.contacts.sent), [])), this.preferences.leaderCount)
				// show summed stats
				this.display = sum

				// retrieve all values of account objects for comparison views
				let comparison = JSON.parse(JSON.stringify(this.initComparisonData()))
				accounts.map((a, i) => {
					// years
					comparison.yearsData[a.id] = sumObjects([accountsData[i].yearsData.received, accountsData[i].yearsData.sent])
					// quarters
					comparison.quartersData[a.id] = sumObjectsObjects([accountsData[i].quartersData.received, accountsData[i].quartersData.sent])
					// months
					comparison.monthsData[a.id] = sumObjectsObjects([accountsData[i].monthsData.received, accountsData[i].monthsData.sent])
					// weeks
					comparison.weeksData[a.id] = sumObjectsObjects([accountsData[i].weeksData.received, accountsData[i].weeksData.sent])
					// daytime
					comparison.daytimeData[a.id] = sumObjects([accountsData[i].daytimeData.received, accountsData[i].daytimeData.sent])
					// weekday
					comparison.weekdayData[a.id] = sumObjects([accountsData[i].weekdayData.received, accountsData[i].weekdayData.sent])
					// month
					comparison.monthData[a.id] = sumObjects([accountsData[i].monthData.received, accountsData[i].monthData.sent])
				})
				this.comparison = comparison

				// finally adjust displayed activity year
				this.adjustSelectedYear()
			} else {
				// load single account from id
				let account = await messenger.accounts.get(id)
				// set tab title
				document.title = 'ThirdStats: ' + account.name
				// (re)calculate list of folders
				this.folders = traverseAccount(account)
				// only check storage if no refresh was requested cache is enabled
				let result = this.preferences.cache ? await messenger.storage.local.get('stats-' + id) : null
				if (!refresh && result && result['stats-' + id]) {
					// if cache is enabled and data already exists in storage, display it directly
					this.display = JSON.parse(JSON.stringify(result['stats-' + id]))
				} else {
					// otherwise retrieve it first/again and track progress by processed folder count
					this.progress.current = 1
					this.progress.max = this.folders.length
					await this.refresh(id)
					this.progress.current = 0
					this.progress.max = 0
				}
				// adjust displayed activity year
				this.adjustSelectedYear()
			}
			// stop loading indication
			this.loading = false
		},
		// reset folder filter
		// reload data if requested <reload=true>
		async resetFolder (reload) {
			this.active.folder = null
			if (reload) {
				// reprocess current data if another filter is set, otherwise just load account data
				await this.loadAccount(this.active.account, this.active.period.start || this.active.period.end)
			}
		},
		// process data for current time period filter
		// calls refresh if filter is valid
		async updatePeriod () {
			if (this.validPeriod()) {
				await this.loadAccount(this.active.account, true)
				this.display.numbers.start = new Date(this.active.period.start)
				this.display.numbers.end = new Date(this.active.period.end)
				this.adjustSelectedYear()
			}
		},
		// reset time period filter
		// reload data if requested <reload=true>
		async resetPeriod (reload) {
			this.active.period.start = null
			this.active.period.end = null
			this.error.period.start = []
			this.error.period.end = []
			this.adjustSelectedYear()
			if (reload) {
				// reprocess current data if another filter is set, otherwise just load account data
				await this.loadAccount(this.active.account, this.active.folder)
			}
		},
		// tab navigation
		// activate tab of given <position> in given <area>
		activateTab (area, position) {
			let self = this
			Object.keys(this.tabs[area]).map(t => self.tabs[area][t] = t == position)
		},
		// format folder select options
		// build <folder> name to match its hierarchy with preceding dashes
		formatFolder (folder) {
			const level = (folder.path.match(/\//g) || []).length
			return level <= 1 ? folder.name : '—'.repeat(level-1) + ' ' + folder.name
		},
		// format period date input to match YYYY-MM-DD
		// <key> defines the input field, either 'start' or 'end'
		formatPeriod (key) {
			if (this.active.period[key]) {
				let s = this.active.period[key]
				// complete year
				if (s.length == 6) {
					s = String((new Date()).getFullYear()).slice(0, 2) + s
				}
				// insert dashes
				if (!s.includes('-')) {
					s = s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6)
				}
				// shorten to 10 characters
				s = s.slice(0, 10)
				// set lower limit
				if (!isNaN(Date.parse(s)) && Date.parse(s) < 0) {
					s = '1970-01-01'
				}
				// set upper limit
				if (!isNaN(Date.parse(s)) && Date.parse(s) > Date.now()) {
					s = (new Date()).toISOString().slice(0, 10)
				}
				this.active.period[key] = s
			}
		},
		// returns true if entered time period is valid
		// fills error stack for affected fields when input is invalid
		validPeriod () {
			let valid = true
			const datex = RegExp(/^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/)
			this.error.period.start = []
			this.error.period.end = []
			// start time is not set
			if (!this.active.period.start) {
				valid = false
				this.error.period.start.push(this.$t('stats.tooltips.error.empty'))
			}
			// start time is of wrong format
			if (!datex.test(this.active.period.start)) {
				valid = false
				this.error.period.start.push(this.$t('stats.tooltips.error.dateFormat'))
			}
			// start time is no real date
			if (isNaN(Date.parse(this.active.period.start))) {
				valid = false
				this.error.period.start.push(this.$t('stats.tooltips.error.dateUnreal'))
			}
			// end time is not set
			if (!this.active.period.end) {
				valid = false
				this.error.period.end.push(this.$t('stats.tooltips.error.empty'))
			}
			// end time is of wrong format
			if (!datex.test(this.active.period.end)) {
				valid = false
				this.error.period.end.push(this.$t('stats.tooltips.error.dateFormat'))
			}
			// end time is no real date
			if (isNaN(Date.parse(this.active.period.end))) {
				valid = false
				this.error.period.end.push(this.$t('stats.tooltips.error.dateUnreal'))
			}
			// start date is before end date
			if (Date.parse(this.active.period.start) > Date.parse(this.active.period.end)) {
				valid = false
				this.error.period.start.push(this.$t('stats.tooltips.error.dateOrderStart'))
				this.error.period.end.push(this.$t('stats.tooltips.error.dateOrderEnd'))
			}
			return valid
		},
		// corrects selected year, if it's out of the current date range
		// called after data got reprocessed
		adjustSelectedYear () {
			const min = new Date(this.display.numbers.start).getFullYear()
			const max = new Date(this.display.numbers.end).getFullYear()
			const current = this.preferences.sections.activity.year
			if (current < min) this.preferences.sections.activity.year = min
			if (current > max) this.preferences.sections.activity.year = max
		},
		// increments selected year
		// only up to the max existing year
		nextYear () {
			if (this.preferences.sections.activity.year < this.maxYear) {
				this.preferences.sections.activity.year++
			}
		},
		// decrements selected year
		// only down to the min existing year
		previousYear () {
			if (this.preferences.sections.activity.year > this.minYear) {
				this.preferences.sections.activity.year--
			}
		},
		// make given date <d> human readable
		// takes locale into account
		formatDate (d) {
			let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
			return d ? (new Date(d)).toLocaleDateString(this.$i18n.locale, options) : ''
		},
		// open given url in new tab
		// appends GET parameter
		openTab (url, get='') {
			if (get) url += '?s=' + get
			messenger.tabs.create({
				active: true,
				url: url
			})
		}
	},
	computed: {
		// current app version
		appVersion () {
			return process.env.PACKAGE_VERSION;
		},
		// array of localized, short month names
		monthNames () {
			let names = []
			for (let m = 1; m <= 12; m++) {
				let d = new Date(1970, m, 0) // choose a date to retrieve months from, starting in January
				names.push(d.toLocaleDateString(this.$i18n.locale, { month: 'short' }))
			}
			return names
		},
		// array of localized, short day of week names
		weekdayNames () {
			let names = []
			for (let wd = 1; wd <= 7; wd++) {
				let d = new Date(1970, 1, wd) // choose a date to retrieve weekdays from, starting on a Sunday
				names.push(d.toLocaleDateString(this.$i18n.locale, { weekday: 'short' }))
			}
			return names
		},
		// number of days from oldest email till today or depending on period filter
		days () {
			const oneDay = 24 * 60 * 60 * 1000
			let start = new Date(this.display.numbers.start)
			let end = this.display.numbers.end ? new Date(this.display.numbers.end) : new Date()
			return Math.round(Math.abs((start - end) / oneDay))
		},
		// number of weeks from oldest email till today
		weeks () {
			return this.days/7
		},
		// number of months from oldest email till today
		months () {
			return this.days/(365/12)
		},
		// number of years from oldest email till today
		years () {
			return this.days/365
		},
		// percentage of number of received/total emails
		receivedPercentage () {
			if (this.display.numbers.total > 0) {
				return this.twoDigit(this.display.numbers.received*100/this.display.numbers.total)
			} else {
				return 0
			}
		},
		// percentage of number of sent/total emails
		sentPercentage () {
			if (this.display.numbers.total > 0) {
				return this.twoDigit(this.display.numbers.sent*100/this.display.numbers.total)
			} else {
				return 0
			}
		},
		// percentage of number of unread/received emails
		unreadPercentage () {
			if (this.display.numbers.received > 0) {
				return this.twoDigit(this.display.numbers.unread*100/this.display.numbers.received)
			} else {
				return 0
			}
		},
		// average number of emails/day
		perDay () {
			if (this.display.numbers.total > 0 && this.days > 0) {
				return this.oneDigit(this.display.numbers.total/this.days)
			} else {
				return 0
			}
		},
		// average number of emails/week
		perWeek () {
			if (this.display.numbers.total > 0 && this.weeks > 0) {
				return this.oneDigit(this.display.numbers.total/this.weeks)
			} else {
				return 0
			}
		},
		// average number of emails/month
		perMonth () {
			if (this.display.numbers.total > 0 && this.months > 0) {
				return this.oneDigit(this.display.numbers.total/this.months)
			} else {
				return 0
			}
		},
		// average number of emails/year
		perYear () {
			if (this.display.numbers.total > 0 && this.years > 0) {
				return this.oneDigit(this.display.numbers.total/this.years)
			} else {
				return 0
			}
		},
		// prepare sum data for years line chart
		yearsChartData () {
			let r = this.display.yearsData.received
			let s = this.display.yearsData.sent
			let labels = [], dr = [], ds = []
			for (let y = this.minYear; y <= this.maxYear; ++y) {
				labels.push(y)
				dr.push(y in r ? r[y] : 0)
				ds.push(y in s ? s[y] : 0)
			}
			return {
				datasets: [
					{ label: this.$t('stats.mailsSent'), data: ds, color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
					{ label: this.$t('stats.mailsReceived'), data: dr, color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
				],
				labels: labels
			}
		},
		// prepare comparison data for years line chart
		yearsComparedChartData () {
			let datasets = []
			// generate list of years between start and end date, e.g. [2018,2019,2020]
			const labels = Array.from(Array(this.maxYear-this.minYear+1), (_, i) => i+this.minYear)
			// compute dataset for each account
			this.accounts.map(a => {
				const d = this.comparison.yearsData[a.id]
				let data = []
				labels.map(y => data.push(y in d ? d[y] : 0))
				datasets.push({
					label: this.$t('stats.mailsTotal') + ', ' + a.name,
					data: data,
					color: this.preferences.accountColors[a.id],
					bcolor: 'rgb(' + hexToRgb(this.preferences.accountColors[a.id]) + ', .2)'
				})
			})
			return {
				datasets: datasets,
				labels: labels
			}
		},
		// prepare sum data for quarters line chart
		quartersChartData () {
			let r = this.display.quartersData.received
			let s = this.display.quartersData.sent
			let labels = [], dr = [], ds = []
			for (let y = this.minYear; y <= this.maxYear; ++y) {
				for (let q = 1; q <= 4; ++q) {
					// trim quarters before start date
					if (y == this.minYear && q < quarterNumber(this.minDate)) continue
					// trim quarters after end date
					if (y == this.maxYear && q > quarterNumber(this.maxDate)) break
					// organize labels and data
					labels.push(y + ' ' + this.$t('stats.abbreviations.quarter') + q)
					dr.push(y in r && q in r[y] ? r[y][q] : 0)
					ds.push(y in s && q in s[y] ? s[y][q] : 0)
				}
			}
			return {
				datasets: [
					{ label: this.$t('stats.mailsSent'), data: ds, color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
					{ label: this.$t('stats.mailsReceived'), data: dr, color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
				],
				labels: labels
			}
		},
		// prepare comparison data for quarters line chart
		quartersComparedChartData () {
			let datasets = [], labels = []
			// compute dataset for each account
			this.accounts.map((a, i) => {
				const d = this.comparison.quartersData[a.id]
				let data = []
				for (let y = this.minYear; y <= this.maxYear; ++y) {
					for (let q = 1; q <= 4; ++q) {
						// trim quarters before start date
						if (y == this.minYear && q < quarterNumber(this.minDate)) continue
						// trim quarters after end date
						if (y == this.maxYear && q > quarterNumber(this.maxDate)) break
						// generate labels in first iteration
						if (i == 0) labels.push(y + ' ' + this.$t('stats.abbreviations.quarter') + q)
						// fill all data values, default to 0 if not existing for this combination
						data.push(y in d && q in d[y] ? d[y][q] : 0)
					}
				}
				datasets.push({
					label: this.$t('stats.mailsTotal') + ', ' + a.name,
					data: data,
					color: this.preferences.accountColors[a.id],
					bcolor: 'rgb(' + hexToRgb(this.preferences.accountColors[a.id]) + ', .2)'
				})
			})
			return {
				datasets: datasets,
				labels: labels
			}
		},
		// prepare data for months line chart
		monthsChartData () {
			let r = this.display.monthsData.received
			let s = this.display.monthsData.sent
			let labels = [], dr = [], ds = []
			for (let y = this.minYear; y <= this.maxYear; ++y) {
				for (let m = 0; m < 12; ++m) {
					// trim months before start date
					if (y == this.minYear && m < this.minDate.getMonth()) continue
					// trim months after end date
					if (y == this.maxYear && m > this.maxDate.getMonth()) break
					// organize labels and data
					labels.push(y + ' ' + this.monthNames[m])
					dr.push(y in r && m in r[y] ? r[y][m] : 0)
					ds.push(y in s && m in s[y] ? s[y][m] : 0)
				}
			}
			return {
				datasets: [
					{ label: this.$t('stats.mailsSent'), data: ds, color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
					{ label: this.$t('stats.mailsReceived'), data: dr, color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
				],
				labels: labels
			}
		},
		// prepare comparison data for months line chart
		monthsComparedChartData () {
			let datasets = [], labels = []
			// compute dataset for each account
			this.accounts.map((a, i) => {
				const d = this.comparison.monthsData[a.id]
				let data = []
				for (let y = this.minYear; y <= this.maxYear; ++y) {
					for (let m = 0; m < 12; ++m) {
						// trim months before start date
						if (y == this.minYear && m < this.minDate.getMonth()) continue
						// trim months after end date
						if (y == this.maxYear && m > this.maxDate.getMonth()) break
						// generate labels in first iteration
						if (i == 0) labels.push(y + ' ' + this.monthNames[m])
						// fill all data values, default to 0 if not existing for this combination
						data.push(y in d && m in d[y] ? d[y][m] : 0)
					}
				}
				datasets.push({
					label: this.$t('stats.mailsTotal') + ', ' + a.name,
					data: data,
					color: this.preferences.accountColors[a.id],
					bcolor: 'rgb(' + hexToRgb(this.preferences.accountColors[a.id]) + ', .2)'
				})
			})
			return {
				datasets: datasets,
				labels: labels
			}
		},
		// prepare data for weeks line chart
		weeksChartData () {
			let r = this.display.weeksData.received
			let s = this.display.weeksData.sent
			let labels = [], dr = [], ds = []
			for (let y = this.minYear; y <= this.maxYear; ++y) {
				for (let w = 1; w <= weeksInYear(y); ++w) {
					// trim weeks before start date
					if (y == this.minYear && w < weekNumber(this.minDate)) continue
					// trim weeks after end date
					if (y == this.maxYear && w > weekNumber(this.maxDate)) break
					// organize labels and data
					labels.push(y + ' ' + this.$t('stats.abbreviations.calendarWeek') + w)
					dr.push(y in r && w in r[y] ? r[y][w] : 0)
					ds.push(y in s && w in s[y] ? s[y][w] : 0)
				}
			}
			return {
				datasets: [
					{ label: this.$t('stats.mailsSent'), data: ds, color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
					{ label: this.$t('stats.mailsReceived'), data: dr, color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
				],
				labels: labels
			}
		},
		// prepare comparison data for weeks line chart
		weeksComparedChartData () {
			let datasets = [], labels = []
			// compute dataset for each account
			this.accounts.map((a, i) => {
				const d = this.comparison.weeksData[a.id]
				let data = []
				for (let y = this.minYear; y <= this.maxYear; ++y) {
					for (let w = 1; w < weeksInYear(y); ++w) {
						// trim weeks before start date
						if (y == this.minYear && w < weekNumber(this.minDate)) continue
						// trim weeks after end date
						if (y == this.maxYear && w > weekNumber(this.maxDate)) break
						// generate labels in first iteration
						if (i == 0) labels.push(y + ' ' + this.$t('stats.abbreviations.calendarWeek') + w)
						// fill all data values, default to 0 if not existing for this combination
						data.push(y in d && w in d[y] ? d[y][w] : 0)
					}
				}
				datasets.push({
					label: this.$t('stats.mailsTotal') + ', ' + a.name,
					data: data,
					color: this.preferences.accountColors[a.id],
					bcolor: 'rgb(' + hexToRgb(this.preferences.accountColors[a.id]) + ', .2)'
				})
			})
			return {
				datasets: datasets,
				labels: labels
			}
		},
		// prepare data for daytime bar chart
		daytimeChartData () {
			let r = this.display.daytimeData.received, s = this.display.daytimeData.sent
			return {
				datasets: [
					{ label: this.$t('stats.mailsSent'), data: Object.values(s), color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
					{ label: this.$t('stats.mailsReceived'), data: Object.values(r), color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
				],
				labels: Object.keys(r)
			}
		},
		// prepare comparison data for daytime bar chart
		daytimeComparedChartData () {
			let datasets = []
			// compute dataset for each account
			this.accounts.map((a) => {
				const d = this.comparison.daytimeData[a.id]
				// add dataset for this account
				datasets.push({
					label: this.$t('stats.mailsTotal') + ', ' + a.name,
					data: Object.values(d),
					color: this.preferences.accountColors[a.id],
					bcolor: 'rgb(' + hexToRgb(this.preferences.accountColors[a.id]) + ', .2)'
				})
			})
			return {
				datasets: datasets,
				labels: Object.keys(Object.values(this.comparison.daytimeData)[0])
			}
		},
		// prepare data for weekday bar chart
		weekdayChartData () {
			let r = Object.values(this.display.weekdayData.received)
			let s = Object.values(this.display.weekdayData.sent)
			let labels = [...this.weekdayNames]
			// start week with user defined day of week
			for (let d = 0; d < this.preferences.startOfWeek; d++) {
				r.push(r.shift())
				s.push(s.shift())
				labels.push(labels.shift())
			}
			return {
				datasets: [
					{ label: this.$t('stats.mailsSent'), data: s, color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
					{ label: this.$t('stats.mailsReceived'), data: r, color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
				],
				labels: labels
			}
		},
		// prepare comparison data for weekday bar chart
		weekdayComparedChartData () {
			let datasets = []
			let labels = [...this.weekdayNames]
			// labels: start week with user defined day of week
			for (let d = 0; d < this.preferences.startOfWeek; d++)
				labels.push(labels.shift())
			// compute dataset for each account
			this.accounts.map((a) => {
				const data = Object.values(this.comparison.weekdayData[a.id])
				// data: start week with user defined day of week
				for (let d = 0; d < this.preferences.startOfWeek; d++)
					data.push(data.shift())
				// add dataset for this account
				datasets.push({
					label: this.$t('stats.mailsTotal') + ', ' + a.name,
					data: data,
					color: this.preferences.accountColors[a.id],
					bcolor: 'rgb(' + hexToRgb(this.preferences.accountColors[a.id]) + ', .2)'
				})
			})
			return {
				datasets: datasets,
				labels: labels
			}
		},
		// prepare data for month bar chart
		monthChartData () {
			let r = this.display.monthData.received, s = this.display.monthData.sent
			return {
				datasets: [
					{ label: this.$t('stats.mailsSent'), data: Object.values(s), color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
					{ label: this.$t('stats.mailsReceived'), data: Object.values(r), color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
				],
				labels: this.monthNames
			}
		},
		// prepare comparison data for month bar chart
		monthComparedChartData () {
			let datasets = []
			// compute dataset for each account
			this.accounts.map((a) => {
				// add dataset for this account
				datasets.push({
					label: this.$t('stats.mailsTotal') + ', ' + a.name,
					data: Object.values(this.comparison.monthData[a.id]),
					color: this.preferences.accountColors[a.id],
					bcolor: 'rgb(' + hexToRgb(this.preferences.accountColors[a.id]) + ', .2)'
				})
			})
			return {
				datasets: datasets,
				labels: this.monthNames
			}
		},
		// prepare data for activity heatmaps
		daysChartData () {
			let r = this.preferences.sections.activity.year in this.display.daysData.received
				? Object.values(this.display.daysData.received[this.preferences.sections.activity.year])
				: Object.values(new NumberedObject(7,53))
			let s = this.preferences.sections.activity.year in this.display.daysData.sent
				? Object.values(this.display.daysData.sent[this.preferences.sections.activity.year])
				: Object.values(new NumberedObject(7,53))
			let ylabels = [...this.weekdayNames]
			let xlabels = Array.from(Array(54).keys())
			xlabels.shift()
			// start week with user defined day of week
			for (let d = 0; d < this.preferences.startOfWeek; d++) {
				r.push(r.shift())
				s.push(s.shift())
				ylabels.push(ylabels.shift())
			}
			return {
				received: { label: this.$t('stats.mailsReceived'), data: r },
				sent: { label: this.$t('stats.mailsSent'), data: s },
				ylabels: ylabels,
				xlabels: xlabels,
			}
		},
		// prepare data for weekday/hour heatmaps
		weekdayPerHourChartData () {
			let r = Object.values(this.display.weekdayPerHourData.received)
			let s = Object.values(this.display.weekdayPerHourData.sent)
			let labels = [...this.weekdayNames]
			// start week with user defined day of week
			for (let d = 0; d < this.preferences.startOfWeek; d++) {
				r.push(r.shift())
				s.push(s.shift())
				labels.push(labels.shift())
			}
			return {
				received: { label: this.$t('stats.mailsReceived'), data: r },
				sent: { label: this.$t('stats.mailsSent'), data: s },
				labels: labels
			}
		},
		// prepare data for received emails leaderboard horizontal bar chart
		receivedContactLeadersChartData () {
			let r = this.display.contacts.received
			return {
				datasets: [
					{ label: this.$t('stats.mailsReceived'), data: Object.values(r), color: 'rgb(10, 132, 255)', bcolor: 'rgb(10, 132, 255, .2)' },
				],
				labels: Object.keys(r)
			}
		},
		// prepare data for sent emails leaderboard horizontal bar chart
		sentContactLeadersChartData () {
			let s = this.display.contacts.sent
			return {
				datasets: [
					{ label: this.$t('stats.mailsSent'), data: Object.values(s), color: 'rgb(230, 77, 185)', bcolor: 'rgb(230, 77, 185, .2)' },
				],
				labels: Object.keys(s)
			}
		},
		// returns true, if at least one filter isn't empty
		filtered () {
			return this.active.folder || this.active.period.start || this.active.period.end
		},
		// returns true, if just one single account is selected
		singleAccount () {
			return this.active.account != 'sum'
		},
		// returns the current date as example for short period input (YYMMDD)
		examplePeriodShort () {
			let d = new Date()
			return d.toISOString().replace(/-/g, '').slice(2,8)
		},
		// returns the current date as example for formatted period input (YYYY-MM-DD)
		examplePeriodFormatted () {
			let d = new Date()
			return d.toISOString().slice(0,10)
		},
		// convert theme preference into scheme name
		scheme () {
			return this.preferences.dark ? 'dark' : 'light'
		},
		// return account colors of all active accounts comma separated as single string
		accountsColorGradient () {
			return Object
				.entries(this.preferences.accountColors)
				.filter((a => this.preferences.accounts.includes(a[0])))
				.reduce((p,c) => p.concat(c[1]), [])
				.join(',')
		},
		// first date in currently displayed data
		minDate () {
			return new Date(this.display.numbers.start)
		},
		// last date in currently displayed data
		maxDate () {
			return this.display.numbers.end ? new Date(this.display.numbers.end) : new Date()
		},
		// year minDate
		minYear () {
			return (this.minDate).getFullYear()
		},
		// year of maxDate
		maxYear () {
			return (this.maxDate).getFullYear()
		},
		// array of years descending from last to first date
		yearsList () {
			let years = []
			for (let i = this.maxYear; i >= this.minYear; i--) {
				years.push(i)
			}
			return years
		},
		// compute current loading progress in percent
		processingState () {
			if (this.progress.max > 0) {
				if (this.progress.current<=this.progress.max) return 100*this.progress.current/this.progress.max
				else return 100
			} else return 0
		}
	},
	watch: {
		// on change of active account reset filter
		// and load new accounts data accordingly
		async 'active.account' (id) {
			if (id) {
				// reset preferences
				this.preferences.sections.total.comparison = false
				// reset filter
				this.resetFolder(false)
				// process data for given account, refresh if period filter is set
				await this.loadAccount(id, this.active.period.start && this.active.period.end)
			}
		},
		// on change of active folder
		// retrieve data again for current account selection
		async 'active.folder' (folder) {
			if (folder) {
				// start processing for active folder only
				await this.loadAccount(this.active.account, true)
			}
		}
	}
}
</script>

<style lang='stylus'>
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
			header
				grid-template-columns: 1fr 2fr
				.filter
					justify-content: flex-end
			.numbers
				max-width: 1500px
				grid-template-columns: repeat(6, 1fr)
			#chart-area-top
				grid-template-columns: calc(100% - 1130px - 2rem) 1130px
				&.first-column-only
					grid-template-columns: calc(100%-1rem) 0%
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
			header
				grid-template-columns: 1fr
				h1
					justify-content: center
				.filter
					justify-content: space-around
					&>*
						margin: 0 0 1rem 0
			#chart-area-top
				grid-template-columns: calc(100%-1rem)
				.resizer
					display: none
			#chart-area-main
				grid-template-columns: calc(100%-1rem)
		@media (max-width: 960px)
			.numbers
				grid-template-columns: repeat(3, 1fr)

		header
			margin-top: 0
			display: grid
			align-items: center
			h1
				margin: 0
				.logo
					height: 48px
			.filter
				.loading
					loader 18px 3px
					margin: 4px 4px 4px 7px
				.refresh
					margin-left: 3px
		
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
					line-height: 1em
					font-weight: 500

		.charts
			.chart-area
				display: grid
				column-gap: 2rem
				row-gap: 1rem
				transition: grid-template-columns .2s
				& > *, .tab-content:not(.chart-group) > *
					min-height: 380px
				.chart
					min-width: 0
					h2
						margin-bottom: 0
					p
						margin-top: 0

</style>
