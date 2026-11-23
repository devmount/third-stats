# Contributing to this project

First off, thanks for taking the time to contribute! You are awesome! :tada::clap: Please read the following guidelines if you are planning to contribute to this project and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [General Guidelines](#general-guidelines)
- [How to contribute](#how-to-contribute)
  - [Asking Questions](#asking-questions)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Provide Code via Pull Requests](#provide-code-via-pull-requests)
    - [Coding Style](#coding-style)
    - [Git Commit Messages](#git-commit-messages)
  - [Providing Translations](#providing-translations)
  - [Beta-Testing](#beta-testing)

## General Guidelines

These guidelines apply to every kind of contribution, be it code, documentation, translations or anything else.

1. **You are responsible for what you submit.** No matter which tools you used, you must understand your submission and be able to explain it, at least at a high level, without the use of AI.
2. **Talk to the maintainer first.** Discuss your plans in a new or existing issue and wait for the maintainer to agree on a solution before you start working. Pull requests without a previously discussed issue will be closed.
3. **Avoid comprehension debt.** Follow the established architecture, formatting and code organization, and use the existing languages, frameworks and libraries. Ask before rewriting existing work or adding new dependencies. The maintainer has the final word on these.
4. **Keep your changeset small and focused.** Every change should directly address the issue being solved, so don't include unrelated refactoring or drive-by "improvements". Aim for less than 500 lines across as few files as possible to keep it reviewable.
5. **Expect your level of effort to be mirrored.** If an agent wrote your patch in 5 minutes, don't expect a human to spend hours reviewing it. If an LLM was used, please disclose how much was LLM generated and what was manual work.
6. **Include tests and relevant documentation.** If the affected area has no tests, propose adding them.
7. **Explain your changes.** Briefly describe your understanding of the problem and your approach in the pull request or the related issue. This makes reviewing a lot easier.

## How to contribute

### Asking Questions

Please don't use issues for questions. Ask them in [the discussions](https://github.com/devmount/third-stats/discussions) instead, where the community can help as well.

### Reporting Bugs

Before creating bug reports, please make sure there isn't already [an existing issue](https://github.com/devmount/third-stats/issues?q=state%3Aopen%20label%3A%22bug%22) describing your problem. Create the new issue and provide the necessary information by filling in [the bug-report template](https://github.com/devmount/third-stats/issues/new?template=bug_report.md).

### Suggesting Enhancements

Enhancement suggestions are also tracked as [GitHub issues](https://github.com/devmount/third-stats/issues). Before creating enhancement suggestions, please check [the existing issues](https://github.com/devmount/third-stats/issues?q=state%3Aopen%20label%3A%22enhancement%22) as you might find out that you don't need to create one. When you are creating an enhancement suggestion, please include as many details as possible. Fill in [the feature-request template](https://github.com/devmount/third-stats/issues/new?template=feature_request.md), including the steps that you imagine you would take if the feature you're requesting existed.

### Provide Code via Pull Requests

To set up a local development environment, follow the steps [in the README](../README.md#become-a-thirdstats-developer). Make sure your pull request follows the [general guidelines](#general-guidelines) above and fill in [the required template](PULL_REQUEST_TEMPLATE.md). Every pull request must reference the issue it was discussed in. Please do not include issue numbers in the PR title, but add it in the PR body via "Closes #1234".

All code must pass the validation workflow automatically running when pushing to a PR. All tests must pass to protect against regressions.

Always run `pnpm lint`, `pnpm format` and `pnpm test` before pushing to this repo. Please fix all lint warnings.

#### Coding Style

Linter and formatter should cover most of the code styling automatically. Other than that

- Custom components follow the PascalCase when importing and dash-case when adding them to the markup.
- Use destructuring where reasonable
- Favor template literals over string concatenation where applicable
- Modularize code where reasonable

#### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Start your commit messages with one of the following emojis:
  - ➕ when adding a file or implementing a feature
  - 🔨 when fixing a bug or issue
  - ⚡ when improving performance
  - 📜 when updating docs or readme
  - 🌐 when updating translations
  - 🔑 when dealing with security
  - 🧹 when refactoring or improving code
  - ❌ when removing code or files
  - 📦 when updating dependencies
  - ✅ when releasing a new version

### Providing Translations

You can add a new translation or improve an existing one by taking the following steps:

1. Go to the [locales](/public/_locales/) directory, which contains a folder for each language
2. To improve an existing translation, edit the `messages.json` of that language. To add a new language, create a folder named like its language code (e.g. `de` or `pt-BR`) and copy the file `public/_locales/en/messages.json` into it.
3. Translate only the values and leave the keys untouched, then create a Pull Request.

If you run into any problems, leave [an issue](https://github.com/devmount/third-stats/issues/) or start [a discussion thread](https://github.com/devmount/third-stats/discussions).

### Beta-Testing

Testing and reporting bugs is a great way to help! Here's how:

1. Download the [latest nightly build from the ThirdStats CDN](https://third-stats.cdn.devmount.com/) (XPI file)
2. Start Thunderbird and install the XPI file by going to *Settings* > *Add-ons and Themes* > *Extensions* > *Gear* Button > *Install Add-on from file* > Choose the downloaded XPI file
3. Now start using ThirdStats and check if...
   - ThirdStats logo appears in the menu and the popup shows all active accounts
   - add-on options page displays properly, all options can be changed, options can be reset
   - stats page displays properly, data is shown correctly, processing works, all filters work as expected

If you run into any problems, leave a comment on [the corresponding issue #370](https://github.com/devmount/third-stats/issues/370) or start [a discussion thread](https://github.com/devmount/third-stats/discussions).

Thanks a lot for your support 💚
