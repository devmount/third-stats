// generator to query messages of given folder
const queryMessages = async function* (folder, fromDate, toDate) {
	// handle date filter
	const dateFilterActive = fromDate && toDate;
	const from = new Date(fromDate);
	const to = new Date(toDate);
	// paginate messages
  let page = await messenger.messages.list(folder);
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
}

// flatten folder hierarchie of given account
const traverseAccount = (account) => {
	let arrayOfFolders = []
	// recursive function to traverse all subfolders
	function traverse(folders) {
		if (!folders) return
		for (let f of folders) {
			arrayOfFolders.push(f)
			traverse(f.subFolders)
		}
	}
	traverse(account.folders)
	return arrayOfFolders
}

// extract an email address from a given string
const extractEmailAddress = (s) => {
	if (s.lastIndexOf("<")>=0 && s.lastIndexOf(">")>=0) {
		return s.substring(s.lastIndexOf("<") + 1, s.lastIndexOf(">")).toLowerCase()
	} else {
		const e = s.toLowerCase().match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
		return e ? e[0] : '';
	}
}

// get week number for given date (1 - 53)
const weekNumber = (d) => {
	d = new Date(+d)
	d.setHours(0, 0, 0, 0)
	d.setDate(d.getDate() + 4 - (d.getDay() || 7))
	const yearStart = new Date(d.getFullYear(), 0, 1)
	return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

// get the number of weeks for a given year
const weeksInYear = (year) => {
	let d = new Date(year, 11, 31)
	return weekNumber(d) == 1 ? 52 : 53
}

// get list of year-week tuples in between given dates
const weeksBetween = (d1, d2) => {
	const minIsLastWeekOfPrevYear = d1.getMonth() == 0 && weekNumber(d1) > 50
	const minIsFirstWeekOfNextYear = d1.getMonth() == 11 && weekNumber(d1) == 1
	const maxIsLastWeekOfPrevYear = d2.getMonth() == 0 && weekNumber(d2) > 50
	const maxIsFirstWeekOfNextYear = d2.getMonth() == 11 && weekNumber(d2) == 1
	const minYear = minIsFirstWeekOfNextYear ? d1.getFullYear()+1 : d1.getFullYear()
	const maxYear = maxIsLastWeekOfPrevYear ? d2.getFullYear()-1 : d2.getFullYear()
	let weeks = []
	for (let y = minYear; y <= maxYear; ++y) {
		for (let w = 1; w <= weeksInYear(y); ++w) {
			// trim weeks before start date
			if (y == minYear && w < weekNumber(d1) && !minIsLastWeekOfPrevYear) continue
			// trim weeks after end date
			if (y == maxYear && w > weekNumber(d2) && !maxIsFirstWeekOfNextYear) break
			// add tuple
			weeks.push([y, w])
		}
	}
	// check first days of year still belonging to last week of previous year
	if (minIsLastWeekOfPrevYear) {
		weeks.unshift([d1.getFullYear()-1, weekNumber(d1) ])
	}
	// check last days of year already belonging to first week of next year
	if (maxIsFirstWeekOfNextYear) {
		weeks.push([d2.getFullYear()+1, weekNumber(d2) ])
	}
	return weeks
}

// calculate the local start of week, returns weekday (0-6)
const localStartOfWeek = () => {
	const d = new Date()
	const diff = d.getDate() - d.getDay();
	return (new Date(d.setDate(diff))).getDay()
}

// get quarter number for given date
const quarterNumber = (d) => {
	const month = d.getMonth() + 1
	return (Math.ceil(month / 3))
}

// format given date as YYYYMMDD
const yyyymmdd = (d) => {
	return d.toISOString().replace(/-/g, '').slice(0,8)
}

// format bytes and append unit
const formatBytes = (bytes, decimals=2) => {
	if (bytes === 0) return "0 Bytes"
	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

// special pluralization rules
const pluralizationPolish = (n) => {
	if (n === 1) return 1
	const endsWith = n % 10
	if (([2, 3, 4].indexOf(endsWith) >= 0) && (n < 12) && (n > 14)) return 2
	return 0
}

export {
	queryMessages,
	traverseAccount,
	extractEmailAddress,
	weekNumber,
	weeksBetween,
	localStartOfWeek,
	quarterNumber,
	yyyymmdd,
	formatBytes,
	pluralizationPolish
}
