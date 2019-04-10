# Changelog

## 3.5.0 - (Venetian Red Vienna) - April 2019

- CLI Command: agent-status displays agent status


## 3.4.0 - (Malachite Vienna) - April 2019

- new CLI commands mc starter-ts and mc starter-js for starter projects
- added version to user-agent

## Bugfixes 3.4.0

- refactored the CLI commands to separate files
- made lock private in mindconnect storage
- references upgrade

## 3.3.0 - (Midnight Blue Vienna) - February 2019

- upgraded referenced packages to the latest version
- improved resilience under heavy load

## Bugfixes 3.3.0

- improved resiliency
- added critical sections around file storage and secret renewal
- added retries for file storage and secret renewal
- fixed stream processing in file upload
- cleaned up the code

## 3.2.0 - (Dark Red Vienna) - January 2019

- MIT License - Open Source Release

## 3.1.0 - (Smaragdine Vienna) - December 2018

- implemented storage concept for agents
- default storage is still .mc/ folder however the agent can store the configuration now anywhere

## 3.0.3 - (Iceberg Vienna) - November 2018

## Bugfixes 3.0.3

- Made the agent demo implementation more resillient

## 3.0.2 - (Iceberg Vienna) - November 2018

- added retry support to CLI
- added examples how to retry operations

## Bugfixes 3.0.2

- Fixed the starterjs and starterts templates

## 3.0.1 - (Honeydew Vienna) - November 2018

- Added Mindsphere Developer License Agreement
- Added RSA_3072 support
- Preparation for Open Source Release
- Refactored to separate authentication and function

### Bugfixes 3.0.1

- The cli uses now os.homedir() per default for settings instead of local directory

## 3.0.0 - Beta 8  (Lime Vienna) - August 2018

- Bulk upload of time series data for the agent (for CLI support)
- Added mindconnect CLI (command line interface)
- Added mindconnect CLI onboard command
- Added mindconnect CLI upload-file command
- Added mindconnect CLI upload-timeseries command
- Added mindconnect CLI create-event command

## 3.0.0 - Beta 7 (Crimson Vienna) - June 2018

- Bugfix for chunked upload

### Bugfixes 3.0.0 - Beta 7

- Fixed bug in chunked upload

## 3.0.0 - Beta 6 (Red Vienna) - June 2018

- Added event support to the library
- Added file upload to the library
- Warning chunking is experimental for fileUpload!
- Added repository for the libraries
- Preparation for github - automated legal and security checks

### Bugfixes 3.0.0 - Beta 6

- Backward compatibility node.js (UrlSearchParam polyfill, compatible with node v.6.x.x)
- Audit and security dependency upgrade

## 3.0.0 - Beta 5 (Beige Vienna) - April 2018

### New Features 3.0.0 - Beta 5

- Added Validation for PostData Message (Thanks @Patrick Niederlohner for Contribution!)
- Fixed some path errors
- Added generators for starter agents (typescript and javascript)
- Support for Mindsphere 3.0 version of the MindConnect API.
- Agent Onboarding for the agents with SHARED_SECRET configuration.
- Key Rotation for agents with SHARED_SECRET configuration.
- Client Assertions for the agents with SHARED_SECRET configuration.
- Token Acquisition for the agents with SHARED_SECRET configuration.
- Token Validation on the client for agents with SHARED_SECRET configuration.
- Token Rotation for the agents with SHARED_SECRET configuration.
- Posting Configuration for the agents with SHARED_SECRET configuration.
- Posting Mappings for the agents with SHARED_SECRET configuration
- Posting Data for the agents with SHARED_SECRET configuration.

## 2.0.4 (Lansing Carnation) - April 2018

### Bugfixes 2.0.4

- Moved all development dependencies to devDependencies, retired the 2.0. branch.

## 2.0.3 - (Nashville Tulip) - November 2017

### Bugfixes 2.0.3

- The agent now throws a (quite dramatical) exception when it can't store the data in the mc.folder.

## 2.0.2 - (Jackson Violet) - October 2017

### BugFixes 2.0.2

- Fixed the missing prepare state in package.json.

## 2.0.0 - (Saint Paul Lily) - October 2017

### New Features 2.0.0

- Initial version for MindSphere 2.0