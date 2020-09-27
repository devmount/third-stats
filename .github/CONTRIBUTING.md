# Contributing to this project

First off, thanks for taking the time to contribute! You are awesome! :tada::clap:

## Table Of Contents

- [How to contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
  - [Adding a new Translation](#adding-a-new-translation)
  
## How to contribute

### Reporting Bugs

Before creating bug reports, please make sure there isn't already an existing issue describing your problem, for bugs are tracked as [GitHub issues](https://github.com/devmount/third-stats/issues). Simply create an issue and provide the necessary information by filling in [the bug-report template](https://github.com/devmount/third-stats/issues/new?template=bug_report.md).

### Suggesting Enhancements

Enhancement suggestions are also tracked as [GitHub issues](https://github.com/devmount/third-stats/issues). Before creating enhancement suggestions, please check the existing issues as you might find out that you don't need to create one. When you are creating an enhancement suggestion, please include as many details as possible. Fill in [the feature-request template](https://github.com/devmount/third-stats/issues/new?template=feature_request.md), including the steps that you imagine you would take if the feature you're requesting existed.

### Pull Requests

Simply fill in [the required template](PULL_REQUEST_TEMPLATE.md). Please do not include issue numbers in the PR title.

#### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Consider starting your commit messages with one of the following emojis:
  - ➕ `:heavy_plus_sign:` when adding a file or implementing a feature
  - 🔨 `:hammer:` when fixing a bug or issue
  - 💚 `:green_heart:` when improving code or comments
  - ⚡ `:zap:` when improving performance
  - 📜 `:scroll:` when updating docs or readme
  - 🔑 `:key:` when dealing with security
  - 🔁 `:repeat:` when updating dependencies or data
  - ✅ `:white_check_mark:` when a new release was built
  - 👕 `:shirt:` when refactoring or removing linter warnings
  - ❌ `:x:` when removing code or files

### Adding a new Translation

You can add a new translation by taking the following steps:

0. Make sure, the language you want to add doesn't already exist under `public/_locales/`
1. Fork this repository
2. Add a folder named like the [two-letter code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) of the language you want to add under `public/_locales/`, e.g. `de` for German
3. Copy the file `public/_locales/en/messages.json` to your new folder
4. Translate all values of that file (please leave the keys untouched!) and create a pull request
