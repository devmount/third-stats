# Contributing to this project

First off, thanks for taking the time to contribute! You are awesome! :tada::clap: Please read the following guidelines if you are planning to contribute to this project.

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [General Guidelines](#general-guidelines)
- [How to contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Provide Code via Pull Requests](#provide-code-via-pull-requests)
    - [Coding Style](#coding-style)
    - [Git Commit Messages](#git-commit-messages)
  - [Providing Translations](#providing-translations)
  - [Beta-Testing](#beta-testing)

## General Guidelines

These guidelines apply to every kind of contribution, no matter if it's code, documentation, translations or anything else.

1. **You are responsible for what you submit.** No matter what tool you've used, you are expected to understand what you have submitted and you should be able to explain it at minimum at a high level without the use of AI.
2. **Talk to the maintainer before submitting a patch OR submit a WIP patch.**
   - **Reach out before you start working.** File an issue or respond to the issue you plan to work on and discuss the work with the maintainer to clarify any unclear or vague requirements. This is most important for significant changes like larger bugs or new features. Without this step, you risk submitting a patch that is rejected for any number of reasons, so it is best to align on a solution beforehand.
   - **OR submit a WIP patch to start the discussion.** Sometimes a quick work-in-progress pull request is a good way to communicate your proposed solution. This option is more suitable for trivial fixes or existing and triaged bugs. Just be aware that your WIP patch may need to be scrapped to align with the direction the maintainer is envisioning.
3. **Do not include unrelated refactoring or drive-by "improvements".** All code in a pull request should directly address the issue or issues being solved.
4. **Avoid the creation of comprehension debt.** Submissions must follow the established architecture, formatting and code organization. They should use existing languages, frameworks and libraries where possible. Do not rewrite or refactor existing work, introduce new frameworks or major libraries without asking first. The maintainer has the final word on refactors and any languages, dependencies and tools used in this project.
5. **Keep your changeset small.** Pull requests with less than 500 lines, across a minimum number of files, ensure that the changeset is appropriately targeted and reviewable.
6. **Expect your level of effort to be mirrored.** If you spent 5 minutes having an agent write a document or patch, you should not expect a human to spend hours reviewing and critiquing your submission in detail. If an LLM was used to help generate a patch, please include the original thought (e.g. the prompt) that went into its creation.
7. **Include tests and relevant documentation.** If there are no tests covering the affected area, propose adding them whenever possible.
8. **Document your changes.** While working on your submission, you have naturally built a certain understanding of the problem and how it would be best addressed. Adding a short explanation of your understanding and the approach you've taken, either in the pull request description or in a comment on the related issue, makes it a lot easier for the reviewer to follow your thought process.

## How to contribute

### Reporting Bugs

Before creating bug reports, please make sure there isn't already [an existing issue](https://github.com/devmount/third-stats/issues?q=state%3Aopen%20label%3A%22bug%22) describing your problem. Create the new issue and provide the necessary information by filling in [the bug-report template](https://github.com/devmount/third-stats/issues/new?template=bug_report.md).

### Suggesting Enhancements

Enhancement suggestions are also tracked as [GitHub issues](https://github.com/devmount/third-stats/issues). Before creating enhancement suggestions, please check [the existing issues](https://github.com/devmount/third-stats/issues?q=state%3Aopen%20label%3A%22enhancement%22) as you might find out that you don't need to create one. When you are creating an enhancement suggestion, please include as many details as possible. Fill in [the feature-request template](https://github.com/devmount/third-stats/issues/new?template=feature_request.md), including the steps that you imagine you would take if the feature you're requesting existed.

### Provide Code via Pull Requests

Make sure your pull request follows the [general guidelines](#general-guidelines) above and fill in [the required template](PULL_REQUEST_TEMPLATE.md). Please do not include issue numbers in the PR title, but add it in the PR body, e.g. via "Closes #1234".

All code must pass the validation workflow automatically running when pushing to a PR. All tests must pass to protect against regressions.

Always run `pnpm lint`, `pnpm format` and `pnpm test` before pushing to this repo.

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
  - 🔑 when dealing with security
  - 🧹 when refactoring or improving code
  - ❌ when removing code or files
  - 📦️ when updating dependencies
  - ✅ when releasing a new version

### Providing Translations

You can add a new translation or improve an existing one by taking the following steps:

1. Go to the [locales](/public/_locales/) directory on GitHub
2. Choose a language and start translating either directly on GitHub or fork the repo and create a Pull Request.

If you run into any problems, leave [an issue](https://github.com/devmount/third-stats/issues/) or start [a discussion thread](https://github.com/devmount/third-stats/discussions).

### Beta-Testing

Testing and reporting bugs is a great way to help! Here's how:

1. Download the [latest nightly build from the ThirdStats CDN](https://third-stats.cdn.devmount.com/) (XPI file)
2. Start Thunderbird and install the XPI file by going to *Settings* > *Add-ons and Themes* > *Extensions* > *Gear* Button > *Install Add-on from file* > Choose the downloaded XPI file
3. Now start using ThirdStats and check if...
    - ThirdStats logo appears in the menu and the popup shows all active accounts
    - add-on options page displays properly, all options can be changed, options can be reset
    - stats page display properly, data is shown correctly, processing works, all filter work as expected

If you run into any problems, leave a comment on [the corresponding issue #370](https://github.com/devmount/third-stats/issues/370) or start [a discussion thread](https://github.com/devmount/third-stats/discussions).

Thanks a lot for your support 💚
