# Contributing

**We are currently only accepting contributions coming from within Siemens organization.**

We welcome contributions in several forms, e.g.

* Sponsoring
* Documenting
* Testing
* Coding
* etc.

Please read [14 Ways to Contribute to Open Source without Being a Programming Genius or a Rock Star](https://smartbear.com/blog/test-and-monitor/14-ways-to-contribute-to-open-source-without-being/).

Please check for the issues in the project and look for unassigned ones or create a new one. The good issues for newcomers are marked with **help-wanted** and **good-first-issue**.

Working together in an open and welcoming environment is the foundation of our
success, so please respect our [Code of Conduct](CODE_OF_CONDUCT.md).

## Guidelines

### Workflow

We use the [Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)
and review all changes we merge to master.

### Automated builds, tests, security and code quality checks

The code is required to pass the automated build, all unit-tests must be green and the configured security- (snyk) and code quality (lgtm) checks
must be OK before the pull request can be merged.

### Commit Message

Commit messages shall follow the conventions defined by [conventional-changelog](https://www.conventionalcommits.org/).

#### What to use as scope

In most cases the changed component is a good choice as scope
e.g. if the change is done in the MindConnectAgent  the scope should be *Agent*.

### Code Style

Please follow the typescript code style which is established in tslint.json. (Works out of the box in many editors, e.g. Visual Studio Code)

### Executing tests locally

The unit tests require the configured service credentials and a 3072 bit agent certificate.

First: install the library and CLI globally and run the create service credentials command (see also `mc service-credentials --help'):

```bash
npm install -g @mindconnect/mindconnect-nodejs
mc service-credentials --user tenantx001 --password xxxx-xxx-x-x --gateway eu1 --tenant tenantx --passkey mypasskey
```
after that you will need a 3072 bit certificate

```bash
# run only once to create certificate
npm run createkey
```

You are now all set and should be able to run the unit tests:

```bash
npm run test
```
