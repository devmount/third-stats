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

export { traverseAccount }
