// function to flatten folder hierarchie of given account
let traverseAccount = (account) => {
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

// function to extract an email address from a given string
let extractEmailAddress = (s) => {
	if (s.lastIndexOf("<")>=0 && s.lastIndexOf(">")>=0) {
		return s.substring(s.lastIndexOf("<") + 1, s.lastIndexOf(">"))
	} else {
		return s
	}
}

// function to get week number for given date (1 - 53)
let weekNumber = (d) => {
	d = new Date(+d)
	d.setHours(0, 0, 0, 0)
	d.setDate(d.getDate() + 4 - (d.getDay() || 7))
	let yearStart = new Date(d.getFullYear(), 0, 1)
	return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

// function to get the number of weeks for a given year
let weeksInYear = (year) => {
	let d = new Date(year, 11, 31)
	return weekNumber(d) == 1 ? 52 : 53
}

// function to get quarter number for given date
let quarterNumber = (d) => {
	let month = d.getMonth() + 1
	return (Math.ceil(month / 3))
}

// function to format bytes and append unit
let formatBytes = (bytes, decimals=2) => {
	if (bytes === 0) return '0 Bytes'
	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// special pluralization rules
let pluralizationPolish = (n) => {
	if (n === 1) {
		return 1
	}
	const endsWith = n % 10
	if (([2, 3, 4].indexOf(endsWith) >= 0) && (n < 12) && (n > 14)) {
		return 2
	}
	return 0
}

export {
	traverseAccount,
	extractEmailAddress,
	weekNumber,
	weeksInYear,
	quarterNumber,
	formatBytes,
	pluralizationPolish
}
