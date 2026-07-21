// pure data-aggregation logic extracted from Stats.vue
// no Vue/messenger dependencies - safe to unit test in isolation
import {
	contactInvolved,
	extractEmailAddress,
	isSelfMessage,
	localDateKey,
	NumberedObject,
	quarterNumber,
	sortAndLimitObject,
	sumObjects,
	sumObjectsObjects,
	weekNumber,
} from '@/utils.js';

// basic data structure to display stats numbers and charts
// used for single and multi-account display
const createStatsData = (periodStart, periodEnd) => ({
	meta: {
		timestamp: null,
		start: periodStart ? new Date(periodStart) : new Date(),
		end: periodEnd ? new Date(periodEnd) : new Date(),
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

// basic data structure to display charts
// used for comparing account data if multiple accounts are active
const createComparisonData = () => ({
	yearsData: {},
	quartersData: {},
	monthsData: {},
	weeksData: {},
	daytimeData: {},
	weekdayData: {},
	monthData: {},
});

// Extract information of a single message <message> with accounts <identityList>
// and update given <data> object.
// <context> = { activeContact, selfMessagesMode, allIdentities }
// Returns string type 'sent'|'received'
const analyzeMessage = (data, message, identityList, context) => {
	// check filter:contact
	if (context.activeContact && !contactInvolved(context.activeContact, message)) return;
	// check for self messages, if exclusion is enabled
	if (context.selfMessagesMode && context.selfMessagesMode != "none") {
		const ids = context.selfMessagesMode == "sameAccount" ? identityList : context.allIdentities;
		if (isSelfMessage(message, ids)) return;
	}
	// now start analyses
	let type = "";
	const author = extractEmailAddress(message.author);
	// numbers
	data.numbers.total++;
	if (message.read === false) data.numbers.unread++;
	if (identityList.includes(author)) {
		data.numbers.sent++;
		type = "sent";
	} else {
		data.numbers.received++;
		type = "received";
	}
	if (message.junk) data.numbers.junk++;
	data.numbers.junkScore += message.junkScore;
	// calculate starting date (= date of oldest email)
	const start = new Date(data.meta.start);
	if (message.date && message.date.getTime() > 0 && message.date.getTime() < start.getTime()) {
		data.meta.start = message.date;
	}
	// years
	const y = message.date.getFullYear();
	if (!(y in data.yearsData[type])) {
		data.yearsData[type][y] = 1;
	} else {
		data.yearsData[type][y]++;
	}
	// quarters
	const qn = quarterNumber(message.date);
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
	const mo = message.date.getMonth();
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
	const wn = weekNumber(message.date);
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
	const dt = message.date.getHours();
	data.daytimeData[type][dt]++;
	// weekday
	const wd = message.date.getDay();
	data.weekdayData[type][wd]++;
	// month
	data.monthData[type][mo]++;
	// dates
	const iso = localDateKey(message.date);
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
			const recipients = message.recipients.map(r => extractEmailAddress(r).toLowerCase());
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
	if (message.junk) {
		if (!(author in data.contacts.junk)) {
			data.contacts.junk[author] = 1;
		} else {
			data.contacts.junk[author]++;
		}
	}
	// folders
	const f = message.folder.name;
	if (!(f in data.folders[type])) {
		data.folders[type][f] = 1;
	} else {
		data.folders[type][f]++;
	}
	// star
	if (message.flagged === true) data.numbers.starred++;
	// tags
	if (message.tags.length > 0) {
		data.numbers.tagged++;
		message.tags.forEach(tag => {
			if (!(tag in data.tags)) {
				data.tags[tag] = 1;
			} else {
				data.tags[tag]++;
			}
		});
	}

	return type;
};

// sums an array of per-account data objects (shaped like createStatsData()) into one
const sumAccountsData = (accountsData, maxListCount) => {
	let sum = createStatsData();
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
	sum.contacts.received = sortAndLimitObject(sumObjects(accountsData.reduce((p,c) => p.concat(c.contacts.received), [])), maxListCount);
	sum.contacts.sent = sortAndLimitObject(sumObjects(accountsData.reduce((p,c) => p.concat(c.contacts.sent), [])), maxListCount);
	sum.contacts.junk = sortAndLimitObject(sumObjects(accountsData.reduce((p,c) => p.concat(c.contacts.junk ?? []), [])), maxListCount);
	// folders
	sum.folders.received = sortAndLimitObject(sumObjects(accountsData.reduce((p,c) => p.concat(c.folders?.received ?? []), [])));
	sum.folders.sent = sortAndLimitObject(sumObjects(accountsData.reduce((p,c) => p.concat(c.folders?.sent ?? []), [])));
	// tags
	sum.tags = sortAndLimitObject(sumObjects(accountsData.reduce((p,c) => p.concat(c.tags ?? []), [])), maxListCount);

	return sum;
};

// builds per-account comparison data (shaped like createComparisonData()) for the
// "sum of all accounts" view, one entry per account in <activeAccounts>
const buildComparisonData = (accountsData, activeAccounts) => {
	const comparisonData = createComparisonData();
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
	});
	return comparisonData;
};

export {
	analyzeMessage,
	buildComparisonData,
	createComparisonData,
	createStatsData,
	sumAccountsData,
};
