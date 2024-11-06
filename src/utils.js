// helpers for rounding
const twoDigit = (n) => n.toFixed(2);
const oneDigit = (n) => n.toFixed(1);


// helper class for object generation
class NumberedObject {
	constructor(n, m=null) {
		const a = [...Array(n).keys()];
		a.map(e => {
			this[e] = m === null ? 0 : new Array(m).fill(0);
		});
	}
};

// helper function for objects sum, given array of flat objects
const sumObjects = (objs) => {
	const res = objs.reduce((a, b) => {
		for (let k in b) {
			if (b.hasOwnProperty(k))
				a[k] = (a[k] || 0) + b[k];
		}
		return a;
	}, {});
	return res;
};

// helper function for objects sum, given array of objects of flat objects
const sumObjectsObjects = (objs) => {
	const res = objs.reduce((a, b) => {
		for (let k in b) {
			if (b.hasOwnProperty(k))
				a[k] = a[k] ? sumObjects([a[k], b[k]]) : b[k];
		}
		return a;
	}, {});
	return res;
};

// helper function for objects sum, given array of objects of arrays
const sumObjectsArrays = (objs) => {
	const res = objs.reduce((a, b) => {
		for (let k in b) {
			if (b.hasOwnProperty(k)) {
				if (!a[k])
					a[k] = new Array(b[k].length).fill(0);
				for(let i=0; i<b[k].length; ++i)
					a[k][i] = b[k][i] + a[k][i];
			}
		}
		return a;
	}, {});
	return res;
};

// helper function to sort object properties by value, limit entries and return an object again
const sortAndLimitObject = (obj, limit=0) => {
	if (limit <= 0) limit = Object.keys(obj).length;
	let r = Object.entries(obj).sort(([,a],[,b]) => b-a).reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
	return Object.keys(r)
		.slice(0, limit)
		.reduce((result, key) => { result[key] = r[key]; return result; }, {});
};

// helper function to sort object properties by value, limit entries and return an array
const sortAndLimitObjectToArray = (obj, limit) => {
	return Object.entries(obj).sort(([,a],[,b]) => b-a).slice(0, limit);
};

// helper function to see if array contains another array
const arrayContainsArray = (arr, target) => target.every(v => arr.includes(v));

// check if a contact is involved in a message
// = <contact> is either author or recipient, CC or BCC of <message>
const contactInvolved = (contact, message) => {
	const author = extractEmailAddress(message.author);
	const recipients = message.recipients.map(r => extractEmailAddress(r));
	const ccs = message.ccList.map(r => extractEmailAddress(r));
	const bccs = message.bccList.map(r => extractEmailAddress(r));
	if (
		contact == author
		|| recipients.includes(contact)
		|| ccs.includes(contact)
		|| bccs.includes(contact)
	) return true;
	else return false;
};

// check if a <message> is a self message
// = sender and receivers all match configured <identities>
const isSelfMessage = (message, identities) => {
	const author = extractEmailAddress(message.author);
	const recipients = message.recipients.map(r => extractEmailAddress(r));
	const ccs = message.ccList.map(r => extractEmailAddress(r));
	const bccs = message.bccList.map(r => extractEmailAddress(r));
	// check author
	if (!author) return false;
	if (author && !identities.includes(author)) return false;
	// check normal recipients
	if (recipients.length > 0 && !arrayContainsArray(identities, recipients)) return false;
	// check cc recipients
	if (ccs.length > 0 && !arrayContainsArray(identities, ccs)) return false;
	// check bcc recipients
	if (bccs.length > 0 && !arrayContainsArray(identities, bccs)) return false;
	// all checks passed: its a self message
	return true;
};

// generator to query messages of given folder
const queryMessages = async function* (folderId, fromDate, toDate) {
	// handle date filter
	const dateFilterActive = fromDate && toDate;
	const from = new Date(fromDate);
	const to = new Date(toDate);
	try {
		// paginate messages
		let page = await messenger.messages.list(folderId);
		for (let message of page.messages) {
			const messagesOutsideDateFilter = message.date < from || message.date > to;
			if (!(dateFilterActive && messagesOutsideDateFilter)) {
				yield message;
			}
		}
		while (page.id) {
			page = await messenger.messages.continueList(page.id);
			for (let message of page.messages) {
				const messagesOutsideDateFilter = message.date < from || message.date > to;
				if (!(dateFilterActive && messagesOutsideDateFilter)) {
					yield message;
				}
			}
		}
	} catch(error) {
		await messenger.storage.local.set({ error: true });
		console.error(error);
	}
};

// flatten folder hierarchie of given account
const traverseAccount = async (account) => {
	const foldersList = [];
	// Recursive function to traverse all subfolders
	function traverse(folders) {
		if (!folders?.length) return;
		folders.forEach(f => {
			if (!f.isRoot) foldersList.push(f);
			traverse(f.subFolders);
		});
	}

	// Start with root
	const rootFolder = await messenger.folders.get(account.rootFolder.id, true);
	traverse([rootFolder]);
	
	return foldersList;
};

// extract an email address from a given string
const extractEmailAddress = (s) => {
	if (s.lastIndexOf("<")>=0 && s.lastIndexOf(">")>=0) {
		return s.substring(s.lastIndexOf("<") + 1, s.lastIndexOf(">")).toLowerCase();
	} else {
		const e = s.toLowerCase().match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
		return e ? e[0] : '';
	}
};

// get week number for given date (1 - 53)
const weekNumber = (d) => {
	d = new Date(+d);
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() + 4 - (d.getDay() || 7));
	const yearStart = new Date(d.getFullYear(), 0, 1);
	return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// get the number of weeks for a given year
const weeksInYear = (year) => {
	let d = new Date(year, 11, 31);
	return weekNumber(d) == 1 ? 52 : 53;
};

// get list of year-week tuples in between given dates
const weeksBetween = (d1, d2) => {
	const minIsLastWeekOfPrevYear = d1.getMonth() == 0 && weekNumber(d1) > 50;
	const minIsFirstWeekOfNextYear = d1.getMonth() == 11 && weekNumber(d1) == 1;
	const maxIsLastWeekOfPrevYear = d2.getMonth() == 0 && weekNumber(d2) > 50;
	const maxIsFirstWeekOfNextYear = d2.getMonth() == 11 && weekNumber(d2) == 1;
	const minYear = minIsFirstWeekOfNextYear ? d1.getFullYear()+1 : d1.getFullYear();
	const maxYear = maxIsLastWeekOfPrevYear ? d2.getFullYear()-1 : d2.getFullYear();
	let weeks = [];
	for (let y = minYear; y <= maxYear; ++y) {
		for (let w = 1; w <= weeksInYear(y); ++w) {
			// trim weeks before start date
			if (y == minYear && w < weekNumber(d1) && !minIsLastWeekOfPrevYear) continue;
			// trim weeks after end date
			if (y == maxYear && w > weekNumber(d2) && !maxIsFirstWeekOfNextYear) break;
			// add tuple
			weeks.push([y, w]);
		}
	}
	// check first days of year still belonging to last week of previous year
	if (minIsLastWeekOfPrevYear) {
		weeks.unshift([d1.getFullYear()-1, weekNumber(d1) ]);
	}
	// check last days of year already belonging to first week of next year
	if (maxIsFirstWeekOfNextYear) {
		weeks.push([d2.getFullYear()+1, weekNumber(d2) ]);
	}
	return weeks;
};

// calculate the local start of week, returns weekday (0-6)
const localStartOfWeek = () => {
	const d = new Date();
	const diff = d.getDate() - d.getDay();
	return (new Date(d.setDate(diff))).getDay();
};

// get quarter number for given date
const quarterNumber = (d) => {
	const month = d.getMonth() + 1;
	return (Math.ceil(month / 3));
};

// format given date as YYYYMMDD
const yyyymmdd = (d) => {
	return d.toISOString().replace(/-/g, '').slice(0,8);
};

// return day of week in iso format
const isoDayOfWeek = d => {
  let wd = d.getDay();   // 0..6, from sunday
  wd = (wd + 6) % 7 + 1; // 1..7 from monday
  return String(wd);
};

const startOfToday = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
};

// formats given date <d> human readable, takes locale into account
const formatDate = (d, locale="en") => {
	const options = {
		weekday: "long",
		year:    "numeric",
		month:   "long",
		day:     "numeric",
		hour:    "2-digit",
		minute:  "2-digit"
	};
	return d ? (new Date(d)).toLocaleDateString(locale, options) : '';
};

// array of localized, short month names
const monthNames = (locale="en") => {
	let names = []
	for (let m = 1; m <= 12; m++) {
		let d = new Date(1970, m, 0) // choose a date to retrieve months from, starting in January
		names.push(d.toLocaleDateString(locale, { month: "short" }))
	}
	return names
};

// array of localized, short day of week names
const weekdayNames = (locale="en") => {
	let names = []
	for (let wd = 1; wd <= 7; wd++) {
		const d = new Date(1970, 1, wd) // choose a date to retrieve weekdays from, starting on a Sunday
		names.push(d.toLocaleDateString(locale, { weekday: "short" }))
	}
	return names
};

// format bytes and append unit
const formatBytes = (bytes, decimals=2) => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// special pluralization rules
const pluralPolish = (n) => {
	if (n === 1) return 1;
	const lastDigit = n % 10;
	if (([2, 3, 4].indexOf(lastDigit) >= 0) && (n < 12) && (n > 14)) return 2;
	return 0;
};
const pluralUkrainian = (n) => {
	const lastDigit = n % 10;
	if (lastDigit === 1 && n !== 11) return 1;
	if (([2, 3, 4].indexOf(lastDigit) >= 0) && (n < 12) && (n > 14)) return 2;
	return 0;
};

/** 
 * handle theme changes, returns true if dark was detected
 * 
 * @param {String} theme Supported themes are system|dark|light
 * @param {HTMLElement} element DOM element to add/remove classes on
 * @param {Array} darkClasses List of classes representing dark mode
 * @param {Array} lightClasses List of classes representing light mode
 * @returns {Boolean} True, if dark mode was set
 */
const setTheme = (theme, element=document.documentElement, darkClasses=['dark'], lightClasses=['light']) => {
	if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
		element.classList.remove(...lightClasses);
		element.classList.add(...darkClasses);
		return true;
	} else {
		element.classList.remove(...darkClasses);
		element.classList.add(...lightClasses);
		return false;
	}
};

// open given url in new tab
// appends GET parameter if given
const openTab = (url, get="") => {
	messenger.tabs.create({
		active: true,
		url: get ? url + "?s=" + get : url,
	});
};


export {
	arrayContainsArray,
	contactInvolved,
	extractEmailAddress,
	formatBytes,
	formatDate,
	isoDayOfWeek,
	isSelfMessage,
	localStartOfWeek,
	monthNames,
	NumberedObject,
	oneDigit,
	openTab,
	pluralPolish,
	pluralUkrainian,
	quarterNumber,
	queryMessages,
	setTheme,
	sortAndLimitObject,
	sortAndLimitObjectToArray,
	startOfToday,
	sumObjects,
	sumObjectsArrays,
	sumObjectsObjects,
	traverseAccount,
	twoDigit,
	weekdayNames,
	weekNumber,
	weeksBetween,
	yyyymmdd,
}
