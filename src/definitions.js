import { localStartOfWeek } from '@/utils.js';

// accent coloring for the application
const accentColors = [
	"#e64db9",
	"#0a84ff",
	"#f9f9fa",
	"#202023",
];

// list of different colors for list items
const defaultColors = [
	"#f9844a",
	"#f9c74f",
	"#90be6d",
	"#43aa8b",
	"#4d908e",
	"#577590",
	"#9c89b8",
];

// add-on options
const defaultOptions = {
	theme:               'system',
	ordinate:            true,
	tagColors:           false,
	liveCountUp:         true,
	autoRefresh:         true,
	autoRefreshInterval: 30,
	startOfWeek:         localStartOfWeek(),
	addresses:           '',
	accounts:            [],
	accountColors:       {},
	selfMessages:        'none',
	leaderCount:         20,
	cache:               true,
};

// tab navigation for stats page
const tabsNumbers = {
	years:    1,
	quarters: 2,
	months:   3,
	weeks:    4,
	days:     5,
};

const tabsTotal = {
	years:    1,
	quarters: 2,
	months:   3,
	weeks:    4,
};

const tabsActivity = {
	days: 1,
};

const tabsOnedim = {
	daytime: 1,
	weekday: 2,
	month:   3,
};

const tabsTwodim = {
	temporalDistribution: 1,
};

const tabsLeader = {
	contactsReceived: 1,
	contactsSent:     2,
	contactsJunk:     3,
};

const tabsFolders = {
	foldersDistribution: 1,
};

const tabsTags = {
	tagsCount: 1,
};

export {
	accentColors,
	defaultColors,
	defaultOptions,
	tabsActivity,
	tabsFolders,
	tabsLeader,
	tabsNumbers,
	tabsOnedim,
	tabsTags,
	tabsTotal,
	tabsTwodim,
}
