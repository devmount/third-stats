# Security Policy

## Supported Versions

These versions of ThirdStats are currently being supported with security updates:

| Version | Supported |
| ------- | --------- |
| 1.4.x   | ✅        |
| 1.3.x   | ❌        |
| < 1.3   | ❌        |

## Reporting a Vulnerability

To report a vulnerability, please issue [a bug report](https://github.com/devmount/third-stats/issues/new?template=bug_report.md).

## FAQ

### 1. Is the extension fully contained or does it request any data like (js packages) from third-party CDN servers?

This extension is fully contained. All [dependencies](https://github.com/devmount/third-stats/network/dependencies) are retrieved and minified on build. No CDN is contacted during installation or runtime or ever on your side. You can verify that by opening the network tab in the dev tools and browsing ThirdStats.

### 2. Does it collect and sell my data?  

ThirdStats does store the processed stats data in Thunderbirds own extension storage for perfomance reasons, called the ThirdStats cache. You can clear and disable it in the add-on options, if you don't want that. ThirdStats will never store this data elsewhere, nor sent or sell it anywhere.

### 3. What exactly are all the permissions used for?

ThirdStats needs 5 permissions to work (Thunderbird may not ask for all of them when installing this add-on):

- `accountsRead`: To iterate over all messages in all folders of your Thunderbird accounts to count and process them
- `messagesRead`: To read the message header and retrieve the following information from it: *author*, *bccList*, *ccList*, *date*, *read*, *recipients*
- `tabs`: To open the stats page and the options page in a new tab
- `storage`: To save processed data in Thunderbirds extension storage
- `downloads`: To export processed stats data as JSON file

### 4. Does it run as a web server with an open port which would expose it to vulnerabilities?

No. It only runs locally. You can check the [build files](https://third-stats.cdn.devmount.com/) yourself anytime by renaming `.xpi` to `.zip`, unzip it and browse the files
