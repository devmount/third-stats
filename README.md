<p align="center">
<a href="https://addons.thunderbird.net/en-US/thunderbird/addon/thirdstats" target="_blank">
<img src='https://user-images.githubusercontent.com/5441654/94365551-3f4bda80-00d2-11eb-8d51-685cd9d95331.png' />
</a>
<p align="center">
ThirdStats is a Thunderbird 78+ add-on for beautifully visualized email account stats. Download from <a href="https://addons.thunderbird.net/en-US/thunderbird/addon/thirdstats" target="_blank">Thunderbird Add-ons</a> repository. Contributions, corrections & requests can be made <a href="https://github.com/devmount/third-stats" target="_blank">on GitHub</a>. Created by <a href="https://github.com/devmount" target="_blank">Andreas Müller</a>.</p>
</p>

<p align="center">
<a href="https://github.com/devmount/third-stats/releases" target="_blank"><img src="https://img.shields.io/badge/ThirdStats-v0.3.3-0a84ff.svg?style=flat-square&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAADDUlEQVRoge1ZMW7bQBAcB+lYyC2r6AdxXhC6YcnQL0j8A6m+InLBOv6B4h84LNlEeYGlH1gVW7m4WsERy+B0uj3eCQgpARzAMEQuyZ272dmldLXf73HJeHfR2Y8EzgAjgaHxfqjn11mVA3gEsAOwiMv0+ZT7DGKjdVYlAH4bh+/jMv0Zeq/eJVRn1Q0A22ov66z6Fnq/XgnUWXUNQK3yhAkJJtH3DqiV/9gRE0SiNwJ1VqmV/2wc/qO0bwn3JtELAUrmq3F4AyCnwj2ZxH93IcZx3gAkcZmutTiV7NJyC6c7BRMgF1EerhJbKS+Py3TniF1ZivY2LlN13IznSNxxfSJIQpTQC4DvpGf1/7XOqgU5jB7LOc69LXkFh5xuuJy8CVBCtlWYMERsjvPU1awcJKzwllCdVSqhLx6hSt9rm+PEZZr4JkajRrvyK27XvAjUWTUD8MM4rFxk6mhKZmyi10pU4GAWksK6u53oJKDpXsdWW50Z/XFEjhwnKmCdhaRA8CzkJEB6Vg/+YJz6ZFjgtYPIgeNERbNra4ZwMIkuAjbdz+MyfWTiWyIJJflsJH9NtuoaJ4JIsAQYT/4Vl2nue3MTUdEkZnZkG7xJuGx0anxWug8ed1tERbMztnFibglfRoXfs1xvZGZ3zQ0XOerIUhxd08YmFhdTxZ1LgdeoaK4zd1uRQNdOuCQ0pRXfkQ/rLmJzpjd6RTwg4ijaWymg1wc7C7lInDTMRUWTEFeI/4jQZ1vRzqXAkRE4SNxxfSKYQFRgQaNDF7iO/CQFr2+GxFaKo5psEDTMkXTM5LeUrImJJfkN2SwLkos5C5l96DQCNF2ayMmxHhgiLdqitRa6jpA+4E2ApGNq+UEKrFVSUjTnXUQax/F9ni+8aoBxnY0U9jmdOu5Ms9iV7jg+iAocJCYFrmyX+X4zZ9tSthBJJouQhE9Fp4Rc0ukjwS44CTCusyG9nwW6diBIOkOArQFGOgovaka5hB1wNpxzwaX8wLHlTnTtgKuz9gXne8j4O/HQGAkMjZHA0BgJDAoAfwGoiFbuo7sc2QAAAABJRU5ErkJggg==" alt="release" /></a>
<a href="https://github.com/devmount/third-stats/commits/master" target="_blank"><img src="https://img.shields.io/github/last-commit/devmount/third-stats?label=updated&color=0a84ff&style=flat-square" alt="last commit" /></a>
<a href="./LICENSE" target="_blank"><img src="https://img.shields.io/badge/license-MIT-e64db9.svg?style=flat-square" alt="license" /></a>
<a href="./.github/CONTRIBUTING.md" target="_blank"><img src="https://img.shields.io/badge/contributions-welcome-e64db9.svg?style=flat-square" alt="contributions welcome" /></a>
</p>

## Get started

Install ThirdStats from the Thunderbird Add-ons repository:

1. Open the menu and click on Add-ons
2. Search for *ThirdStats*
3. Click *Add to Thunderbird* and enjoy your email account stats

To properly recognize emails as *sent*, make sure to configure all email adresses you write from as identities for your email account. You can do so under *account settings* > select your account > click button *more identities* at the bottom and add or modify identities as you need.

Also keep in mind, that the processing of large mailboxes can take a lot of time.

## Features

- Total numbers of emails and folders for all of your Thunderbird accounts
- Sum of received and sent emails per year and per month
- Sum of received and sent emails per daytime and per weekday
- Temporal distribution of received and sent emails per weekday per hour
- Switch between all Thunderbird accounts

Here is how ThirdStats looks like on the Thunderbird default dark theme on Windows:

![thirdstats screenshot](https://user-images.githubusercontent.com/5441654/93931445-14066b80-fd1f-11ea-8fe7-bde8674b26f4.png)

## Improve this project

Contributions are very welcome! See the [Contribution Guidelines](./.github/CONTRIBUTING.md) for more information, how to help making this add-on even better.

### Here on GitHub

If you encounter any problem, please [issue a bug report](https://github.com/devmount/third-stats/issues/new?template=bug_report.md).

### Local development environment

1. [Clone](https://help.github.com/en/articles/cloning-a-repository) this project with Git
2. Install dependencies with [Yarn](https://yarnpkg.com/getting-started) by running `yarn` within the cloned directory `third-stats/`
3. Start the development server with `yarn serve`
4. Open development site by going to <http://localhost:8080> in your browser

Note that this tool uses [Thunderbirds WebExtension APIs](https://thunderbird-webextensions.readthedocs.io/en/latest/index.html). This means that some JavaScript objects won't be available in your browser as development environment. If you want to test your changes in Thunderbird, do the following:

5. Save all your changes and run `yarn build` to create a production build in the `dist/` directory
6. Open Thunderbird, go to main menu > add-ons > gear menu > debug add-ons > This Thunderbird > Load temporary add-on
7. Now choose the manifest file inside the `dist/` directory and your modified add-on will be loaded for the current Thunderbird session. You can check the web console by clicking the button *Inspect* in the add-on tile.

## Licence

[MIT License](./LICENSE)

---

This add-on is completely free to use. If you enjoy it and don't have the time to contribute, please consider [donating via Paypal](https://paypal.me/devmount) or [sponsoring me](https://github.com/sponsors/devmount) for further development. :green_heart:
