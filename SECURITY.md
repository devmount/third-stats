# Security Policy

## Supported Versions

Only the latest stable release of ThirdStats receives security updates. Please make sure you can reproduce the issue with it before reporting.

## Reporting a Vulnerability

Please do not report vulnerabilities via public issues. Instead, report them privately via [GitHub's private vulnerability reporting](https://github.com/devmount/third-stats/security/advisories/new). You will receive a response as soon as possible, and the issue will be disclosed publicly once a fix is released.

This applies to issues like message data leaking outside of Thunderbird, email data (e.g. names, addresses or tag names) being able to inject code into the add-on pages, or permissions being used beyond what is described below. Everything else can be filed as a normal bug report.

## FAQ

### 1. Is the extension fully contained or does it request any data (like JS packages) from third-party CDN servers?

This extension is fully contained. All [dependencies](https://github.com/devmount/third-stats/network/dependencies) are retrieved and minified on build. No CDN is contacted during installation or runtime or ever on your side. You can verify that by opening the network tab in the dev tools and browsing ThirdStats.

### 2. Does it collect and sell my data?

ThirdStats does store the processed stats data in Thunderbird's own extension storage for performance reasons, called the ThirdStats cache. You can clear and disable it in the add-on options, if you don't want that. ThirdStats will never store this data elsewhere, nor send or sell it anywhere.

### 3. What exactly are all the permissions used for?

ThirdStats needs 6 permissions to work:

- `accountsRead`: _"See your mail accounts and their folders"_ - This is needed to iterate over all messages in all folders of your Thunderbird accounts to count and process them.
- `messagesRead`: _"Read your email messages and mark or tag them"_ - This is needed to read the message header and retrieve the following information from it: _author_, _bccList_, _ccList_, _date_, _read_, _recipients_. ThirdStats never reads the email body or marks/tags emails.
- `storage`: _"Store unlimited amount of client-side data"_ - This is needed to store your configured options and the ThirdStats cache (processed stats data), so it doesn't need to be reprocessed on every visit. Can be cleared or disabled at any time in the add-on options.
- `downloads`: _"Download files and read and modify the browser’s download history"_ - This is needed to export processed stats data as a JSON file and provide it as a file download. ThirdStats never reads or modifies the download history.
- `messagesTagsList`: _"Read your tags on messages"_ - This is needed to retrieve the name and color of user-defined message tags, so they can be used to enrich stats. ThirdStats never reads, sets or removes tags on individual messages.
- `alarms`: _"Schedule timed, periodic, or single trigger events"_ - This is needed to periodically reprocess stats data in the background, if automatic processing is enabled in the add-on options. ThirdStats never uses this to run code outside of that scheduled reprocessing.

### 4. Does it run as a web server with an open port which would expose it to vulnerabilities?

No. It only runs locally. You can check the [build files](https://third-stats.cdn.devmount.com/) yourself anytime by renaming `.xpi` to `.zip`, unzipping it and browsing the files.
