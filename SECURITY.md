# Security Policy

## Supported Versions

The latest stable version of ThirdStats is being supported with security updates.

## Reporting a Vulnerability

To report a vulnerability, please issue [a bug report](https://github.com/devmount/third-stats/issues/new?template=bug_report.md).

## FAQ

### 1. Is the extension fully contained or does it request any data like (js packages) from third-party CDN servers?

This extension is fully contained. All [dependencies](https://github.com/devmount/third-stats/network/dependencies) are retrieved and minified on build. No CDN is contacted during installation or runtime or ever on your side. You can verify that by opening the network tab in the dev tools and browsing ThirdStats.

### 2. Does it collect and sell my data?  

ThirdStats does store the processed stats data in Thunderbirds own extension storage for perfomance reasons, called the ThirdStats cache. You can clear and disable it in the add-on options, if you don't want that. ThirdStats will never store this data elsewhere, nor send or sell it anywhere.

### 3. What exactly are all the permissions used for?

ThirdStats needs 3 permissions to work:

- `accountsRead`: _"See your mail accounts and their folders"_ - This is needed to iterate over all messages in all folders of your Thunderbird accounts to count and process them.
- `messagesRead`: _"Read your email messages and mark or tag them"_ - This is needed to read the message header and retrieve the following information from it: _author_, _bccList_, _ccList_, _date_, _read_, _recipients_. ThirdStats never reads the email body or marks/tags emails.
- `downloads`: _"Download files and read and modify the browser’s download history"_ - This is needed to export processed stats data as a JSON file and provide it as a file download. ThirdStats never reads or modifies the download history.

### 4. Does it run as a web server with an open port which would expose it to vulnerabilities?

No. It only runs locally. You can check the [build files](https://third-stats.cdn.devmount.com/) yourself anytime by renaming `.xpi` to `.zip`, unzip it and browse the files.
