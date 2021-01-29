<p align="center">
<a href="https://addons.thunderbird.net/en-US/thunderbird/addon/thirdstats" target="_blank">
<img src='https://user-images.githubusercontent.com/5441654/103653189-77ca4280-4f64-11eb-976b-6daaaf067a42.png' />
</a>
<p align="center">
ThirdStats is a Thunderbird 78+ add-on for beautifully visualized email account stats. Download from <a href="https://addons.thunderbird.net/en-US/thunderbird/addon/thirdstats" target="_blank">Thunderbird Add-ons</a> repository. Contributions, corrections & requests can be made <a href="https://github.com/devmount/third-stats" target="_blank">on GitHub</a>. Created by <a href="https://github.com/devmount" target="_blank">Andreas Müller</a>.</p>
</p>

<p align="center">
<a href="https://github.com/devmount/third-stats/releases" target="_blank"><img src="https://img.shields.io/github/v/tag/devmount/third-stats.svg?label=ThirdStats&colorB=0a84ff&style=flat-square&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAADDUlEQVRoge1ZMW7bQBAcB+lYyC2r6AdxXhC6YcnQL0j8A6m+InLBOv6B4h84LNlEeYGlH1gVW7m4WsERy+B0uj3eCQgpARzAMEQuyZ272dmldLXf73HJeHfR2Y8EzgAjgaHxfqjn11mVA3gEsAOwiMv0+ZT7DGKjdVYlAH4bh+/jMv0Zeq/eJVRn1Q0A22ov66z6Fnq/XgnUWXUNQK3yhAkJJtH3DqiV/9gRE0SiNwJ1VqmV/2wc/qO0bwn3JtELAUrmq3F4AyCnwj2ZxH93IcZx3gAkcZmutTiV7NJyC6c7BRMgF1EerhJbKS+Py3TniF1ZivY2LlN13IznSNxxfSJIQpTQC4DvpGf1/7XOqgU5jB7LOc69LXkFh5xuuJy8CVBCtlWYMERsjvPU1awcJKzwllCdVSqhLx6hSt9rm+PEZZr4JkajRrvyK27XvAjUWTUD8MM4rFxk6mhKZmyi10pU4GAWksK6u53oJKDpXsdWW50Z/XFEjhwnKmCdhaRA8CzkJEB6Vg/+YJz6ZFjgtYPIgeNERbNra4ZwMIkuAjbdz+MyfWTiWyIJJflsJH9NtuoaJ4JIsAQYT/4Vl2nue3MTUdEkZnZkG7xJuGx0anxWug8ed1tERbMztnFibglfRoXfs1xvZGZ3zQ0XOerIUhxd08YmFhdTxZ1LgdeoaK4zd1uRQNdOuCQ0pRXfkQ/rLmJzpjd6RTwg4ijaWymg1wc7C7lInDTMRUWTEFeI/4jQZ1vRzqXAkRE4SNxxfSKYQFRgQaNDF7iO/CQFr2+GxFaKo5psEDTMkXTM5LeUrImJJfkN2SwLkos5C5l96DQCNF2ayMmxHhgiLdqitRa6jpA+4E2ApGNq+UEKrFVSUjTnXUQax/F9ni+8aoBxnY0U9jmdOu5Ms9iV7jg+iAocJCYFrmyX+X4zZ9tSthBJJouQhE9Fp4Rc0ukjwS44CTCusyG9nwW6diBIOkOArQFGOgovaka5hB1wNpxzwaX8wLHlTnTtgKuz9gXne8j4O/HQGAkMjZHA0BgJDAoAfwGoiFbuo7sc2QAAAABJRU5ErkJggg==" alt="release" /></a>
<a href="https://github.com/devmount/third-stats/actions?query=workflow%3ACodeQL" target="_blank"><img src="https://img.shields.io/github/last-commit/devmount/third-stats?label=updated&color=0a84ff&style=flat-square" alt="last commit" /></a>
<a href="https://github.com/devmount/third-stats/commits/master" target="_blank"><img src="https://img.shields.io/github/workflow/status/devmount/third-stats/CodeQL?label=CodeQL&logo=github&color=0a84ff&style=flat-square" alt="CodeQL analysis" /></a>
<a href="./LICENSE" target="_blank"><img src="https://img.shields.io/github/license/devmount/third-stats.svg?colorB=e64db9&style=flat-square" alt="license" /></a>
<a href="./.github/CONTRIBUTING.md" target="_blank"><img src="https://img.shields.io/badge/contributions-welcome-e64db9.svg?style=flat-square" alt="contributions welcome" /></a>
</p>

## Get started

Install ThirdStats from the Thunderbird Add-ons repository:

1. Start Thunderbird, open the main menu and click on Add-ons
2. Search for *ThirdStats*
3. Click *Add to Thunderbird* and give necessary permissions
4. Open the ThirdStats Popup in the upper right corner of the toolbar and enjoy your email account stats

To properly recognize emails as *sent*, make sure to configure all email adresses you write from as identities for your email account. You can do so under *account settings* > select your account > click button *more identities* at the bottom and add or modify identities as you need.

Also keep in mind, that the processing of large mailboxes can take a lot of time.

## Features

- Showing various stats in different chart types:
  - Total numbers of emails and folders per account
  - Sum of received and sent emails per year and per month
  - Sum of received and sent emails per daytime and per weekday
  - Temporal distribution of received and sent emails per weekday per hour
  - Leaderboards of most contacted email addresses
- Show stats for a specific folder or period of time
- Activate all accounts that should be included (add-on option)
- Use a dark or a light theme (add-on option)
- Use a caching system to store already processed data (add-on option)
- Language support for Catalan, Chinese, Czech, English, French, Galician, German, Hindi, Italian, Japanese, Polish, Portuguese, Russian, Spanish, Swedish, Thai and Turkish

Here is how ThirdStats looks like on the Thunderbird default dark theme and light theme on Windows:

![thirdstats screenshot](https://user-images.githubusercontent.com/5441654/101175960-1bfb5980-3646-11eb-9a00-463a54d69da5.png)

## Support this project

Contributions are very welcome! See the [Contribution Guidelines](./.github/CONTRIBUTING.md) for more information, how to help making this add-on even better.

### Spread the word

Give this project a star on GitHub ⭐! Tell your friends and colleagues to try ThirdStats.

### Become a tester

Cutting edge alpha releases of ThirdStats can be found on the [dedicated ThirdStats CDN](https://third-stats.cdn.devmount.com/). You can install these alpha releases and test them as you like.

If you encounter any problem, please [issue a bug report](https://github.com/devmount/third-stats/issues/new?template=bug_report.md). If you have ideas for additional features, please [issue a feature request](https://github.com/devmount/third-stats/issues/new?template=feature_request.md).

⚠ Keep in mind: Alpha releases can be unstable and break things.

### Become a developer

Here is how you can set up a local development environment:

1. [Clone](https://help.github.com/en/articles/cloning-a-repository) this project with Git
2. Install dependencies with [Yarn](https://yarnpkg.com/getting-started) by running `yarn` within the cloned directory `third-stats/`
3. Start the development server with `yarn serve`
4. Open development site by going to <http://localhost:8080> in your browser

Note that this tool uses [Thunderbirds WebExtension APIs](https://thunderbird-webextensions.readthedocs.io/en/latest/index.html). This means that some JavaScript objects won't be available in your browser as development environment. If you want to test your changes in Thunderbird, do the following:

5. Save all your changes and run `yarn build` to create a production build in the `dist/` directory
6. Open Thunderbird, go to main menu > add-ons > gear menu > debug add-ons > This Thunderbird > Load temporary add-on
7. Now choose the manifest file inside the `dist/` directory and your modified add-on will be loaded for the current Thunderbird session. You can check the web console by clicking the button *Inspect* in the add-on tile.

## Special Thanks

Many thanks especially to those who helped translating this add-on and making it more accessable for people around the globe:

- Catalan: [@altmas5](https://github.com/altmas5) [@Leos1113](https://github.com/Leos1113)
- Czech: [@ajyan](https://github.com/ajyan) [@martinsustek](https://github.com/martinsustek)
- German: [@devmount](https://github.com/devmount)
- English: [@devmount](https://github.com/devmount)
- Spanish: [@roninJosue](https://github.com/roninJosue) [@SabrinaFZ](https://github.com/SabrinaFZ)
- French: [@antoinevth](https://github.com/antoinevth) [@aurelienrouze](https://github.com/aurelienrouze)
- Galician: [@uveic](https://github.com/uveic)
- Hindi: [@kunaljain0212](https://github.com/kunaljain0212) [@mdfaizan7](https://github.com/mdfaizan7)
- Italian: [@leobia](https://github.com/leobia) [@edmael](https://github.com/edmael)
- Japanese: [@marcelstoer](https://github.com/marcelstoer)
- Polish: [@dfoltynski](https://github.com/dfoltynski) [@wikiyu](https://github.com/wikiyu)
- Portuguese: [@printf-ana](https://github.com/printf-ana) [@di3goCS](https://github.com/di3goCS)
- Russian: [@kerlon5](https://github.com/kerlon5) [@maria-muravyova](https://github.com/maria-muravyova)
- Swedish: [@FrejBjornsson](https://github.com/FrejBjornsson)
- Thai: [@kerlos](https://github.com/kerlos)
- Turkish: [@tosbaha](https://github.com/tosbaha)
- Chinese (China): [@jswildcards](https://github.com/jswildcards)
- Chinese (Taiwan): [@Hsins](https://github.com/Hsins)

## Licence

[MIT License](./LICENSE)

---

This add-on is completely free to use. If you enjoy it and don't have the time to contribute, please consider [donating via Paypal](https://paypal.me/devmount) or [sponsoring me](https://github.com/sponsors/devmount) for further development. :green_heart:
