# Contributing

**We are currently only accepting contributions coming from within Siemens organization.**

We welcome contributions in several forms, e.g.

* Sponsoring
* Documenting
* Testing
* Coding
* etc.

Please read [14 Ways to Contribute to Open Source without Being a Programming Genius or a Rock Star](http://blog.smartbear.com/programming/14-ways-to-contribute-to-open-source-without-being-a-programming-genius-or-a-rock-star/).

Please check check for the issues in the project and look for unassigned ones or create a new one.

Working together in an open and welcoming environment is the foundation of our
success, so please respect our [Code of Conduct](CODE_OF_CONDUCT.md).

## Guidelines

### Workflow

We use the
[Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)
and review all changes we merge to master.

### Commit Message

Commit messages shall follow the conventions defined by [conventional-changelog](https://www.conventionalcommits.org/).

#### What to use as scope

In most cases the changed component is a good choice as scope
e.g. if the change is done in the MindConnectAgent  the scope should be *Agent*.

### License Headers

The only license header we need for a software written by Siemens is:

```javascript
// Copyright Siemens AG, YEAR
```
The YEAR shall reflect the creation date.

### Code Style

Please follow the typescript code style which is established in tslint.json. (Works out of the box in many editors, e.g. Visual Studio Code)