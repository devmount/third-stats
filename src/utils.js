// function to flatten folder hierarchie
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

// function to get week number for given date
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

// function to get week number for given date
let quarterNumber = (d) => {
	let month = d.getMonth() + 1
	return (Math.ceil(month / 3))
}

export { traverseAccount, extractEmailAddress, weekNumber, weeksInYear, quarterNumber }
