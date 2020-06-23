# Changelog

## 3.8.0 - (Electric Blue Vienna) - June 2020

### Highlights 3.8.0

- Agent: added support for creating automatic data source configuration and automatic mappings
- CLI: mc configure-agent can now automatically create the data source configuration and the mappings for selected assetid
- SDK: typescript sdk released to beta status
- SDK: typescript browser support (e.g. for react, angular, etc)
- CLI: mc service-credentials command has now http based configuration frontend
- CLI: mc dev-proxy added simple api proxy for mindsphere local app development

### Contributions 3.8.0 heart: <3

- Thanks to Sharath N.S. for contributing on automatic data source configuration and automatic mappings!

### Bugfixes and Improvements 3.8.0

- SDK: typescript sdk released to beta status
- SDK: typescript browser support (e.g. for react, angular, etc)
- SDK: IdentityManagementClient released to beta
- SDK: AgentManagementClient released to beta
- SDK: AssetManagementClient released to beta
- SDK: EventManagementClient released to beta
- SDK: IotFileClient released to beta
- SDK: KPICalculationClient released to beta
- SDK: MindConnectAPIClient released to beta
- SDK: SignalValidationClient released to beta
- SDK: SpectumAnalysisClient released to beta
- SDK: TimeSeriesAggregateClient released to beta
- SDK: TimeSeriesBulkClient released to beta
- SDK: TimeSeriesClient released to beta
- SDK: TrendPredictionClient released to beta
- SDK: IdentityManagementClient released to beta
- SDK: added utility class for MQTT OPC UA PubSub key rotation
- SDK: added BrowserAuth to SDK
- SDK: added UserAuth to SDK
- SDK: added TokenManagerAuth to SDK
- SDK: added ServiceCredentialsAuth to SDK
- Agent: added support for creating automatic data source configuration and automatic mappings
- Agent: added support for typed events
- Agent: exposed Sdk() property on the Agent for future use (at the moment only some APIs of mindsphere can be called with Agent Credentials)
- SDK: added utility class for MQTT OPC UA PubSub key rotation
- SDK: added TokenManagerAuth to SDK
- CLI: mc iam command can now manage mindsphere users
- CLI: mc configure-agent can now automatically create the data source configuration and the mappings for selected assetid
- CLI: mc configure-agent can now automatically create the data source configuration and the mappings for selected assetid
- CLI: mc offboard-agent has now a command to offboard an agent with the id only  (mc offboard --assetid) (#130)
- CLI: added mc mqtt-createjwt command which can create a key for MQTT OPC UA PubSub authentication
- CLI: mc service-credentials command is now accepting application credentials
- CLI: mc service-credentials command has now http based configuration frontend
- CLI: mc dev-proxy added simple api proxy for mindsphere local app development
- CLI: deprecated use of classical service credentials
- Improved documentation for GetDataSourceConfiguration and GetDataMappings methods (#149, #150)
- Switched the fetch library to cross-fetch for browser support for SDK
- bumped all dependencies

## 3.7.0 - (Boysenberry Vienna) - February 2020

## Bugfixes and Improvements 3.7.0

- CLI: mc kpi-calculation command (calculate kpis and kpi states based on signal values)
- CLI: mc trend-prediction command (perform linear and polynomial trend prediction on mindsphere aspects)
- CLI: mc bulk-download command (download timeseries aspects from mindsphere)
- CLI: mc delete-file command
- CLI: mc delete-asset command
- CLI: mc agent-token and mc service-token command print out the full token (including header in signature) in --verbose mode
- SDK: Token rotation for agent credentials (#99)
- SDK: added TrendPredictionClient to the SDK
- SDK: added KPICalcuationClient to the SDK
- AGENT: TryRecovery: new method which will try to recover from the sporadic errors which can happen when there is internet connection problem during key rotation.
- Bumped all dependencies
- Chore: Improved spelling
- Upgraded https-proxy-agent to fix [https://snyk.io/vuln/SNYK-JS-HTTPSPROXYAGENT-469131](https://snyk.io/vuln/SNYK-JS-HTTPSPROXYAGENT-469131)
- Added stale issues bot watcher to github

## 3.6.1 - (Cobalt Blue Vienna) - September 2019

## Bugfixes and Improvements 3.6.1

- MindConnect Agent Storage: Fixed the bug where the change of configuration. This was causing problems in node-RED when redeploying the flow. (#82)

## 3.6.0 - (Cobalt Blue Vienna) - July 2019

- SDK: The SDK in this package is stil only a **preliminary version** which is used to provide support for the CLI.
- SDK: added IotTimeSeriesAggregateClient to the SDK
- SDK: added SpectrumAnalysisClient to the SDK
- SDK: added SignalValidationClient to the SDK
- CLI Command: mc spectrum-analysis: performs spectrum analysis on a sound file (#40)
- CLI Command: mc signal-validation: performs signal validation on the mindsphere data (#39)
- CLI Command: mc list-files: lists iot files stored with the asset (#35)
- CLI Command: mc list-assets: lists assets in the tenant (#35)
- CLI Command: mc download-file: downloads file from MindSphere iot file service (#35)

## Bugfixes and Improvements 3.6.0

- SDK: IoTfile - GetFiles - optional parameters are now in query string (bugfix)
- CLI - agent commands - precedence for location of the .mc directory:  path to agentconfig.json > currentdir > user home dir (#65)
- All tests are now self-contained.
- All images are now shrinked.
- Bumped all dependencies. (including all lodash security updates until 7/14/2019)

## Contributions 3.6.0 :heart: <3

- Thanks to goko for the contribution and deniz for finding the bug #65.

## 3.5.3 - (Venetian Red Vienna) - May 2019 - Recovery

## Bugfix 3.5.3

- added node v8 compatible URL import for Raspberry PIs

## 3.5.2 - (Venetian Red Vienna) - May 2019 - Recovery

## Bugfix 3.5.2

- fixed incorrect handling of --force parameter in mc run-bulk command

## 3.5.1 - (Venetian Red Vienna) - May 2019

- CLI Command: agent-status displays agent status
- CLI Command: agent-token provides a valid agent token for use in tools (e.g. postman)
- CLI Command: service-token provides a valid service-credentials token for use in tools (e.g. postman)
- CLI Command: prepare-bulk - creates a template directory for timeseries (bulk) upload
- CLI Command: run-bulk - runs the timeseries (bulk) upload jobs
- CLI Command: check-bulk - checks the progress of the upload jobs
- CLI Command: create-agent - creates a new agent in the mindsphere (#12)
- CLI Command: offboard-agent - offboards the agent in the mindsphere (#11)
- CLI Command: renew-agent  - renews the agent secrets (#13)
- CLI Command: upload-file -  New option: passkey : enables uploading the files also with service credentials
- CLI Command: upload-file -  New option: parallel :configures the number of parallel uploads
- CLI Command: create-event - New option: passkey : enables creation of events also with service credentials
- CLI Command: renew-agent  - renews the agent secrets (#13)
- mindconnect-agent: created new UploadFile method capable of running the multipart upload (#4)
- mindconnect-agent: the UploadFile can now take a buffer additionally to file (#23)
- mindconnect-agent: the UploadFile can now run in parallel (#23)
- mindconnect-agent: the MindSphere path name can be configured (#23)
- mindconnect-agent: removed the manual chunking of the files in favor of multipart upload (#23)
- mindconnect-agent: deprecated the old upload method (#23)
- SDK: started a  PRELIMINARY SDK for the new commands which require additional mindsphere APIs
- SDK: preliminary Support for following services
- Agent Management Service
- Asset Management Service
- Event Management File Service
- Time Series Service
- Time Series Bulk Service
- IoT File Service
- CLI: color support for low color terminals
 -CLI: progress tracking for long-running commands (upload-file, bulk-run...)

## Bugfixes and improvements 3.5.1

- CLI Command: upload-timeseries - improved help and error messages during parsing #20
- mindconnect-agent: removed content-type header from GET Messages according to MindSphere recommendation
- Moved the documentation generation to compodoc instead of typedoc
- Bumped all dependencies

## Contributions :heart: <3

- Thanks to ahmedi92 and goko for the contributions on this version. You rock!

## Announcements

- SDK: the SDK will be extracted to a separate package in the version major version (4.0.0)
- CLI: the CLI will be extracted to a separate package in the future major version (4.0.0)
- We <3 contributions!
- We are working on the legal framework to let outside (non-Siemens) collabarators contribute. Stay tuned :)

## About the SDK in the project and what to expect

The SDK in this package is only a **preliminary version** which is used to provide support for the CLI.

Even though you can already play with it, don't rely on it too much because it will be redesigned in the future to support
different scenarios like deployment in the browser and also different authentication mechanisms like frontend authentication,
backend authentication and token service authentication (for cross tenant access) in the SDK.

This is at the moment really just a pre-pre-alpha version which was necessary in order to be able to provide the CLI commands and it only
works with service credetials authentication.

## Bulk Imports and Standard Imports

At this point in time (May 2019) the Bulk Import only works for Simulation Assets and not for Performance Assets. This is why in this version
we still use the standard APIs for the import of the historical data. Please be aware that the use of this feature has a direct impact
on *your* mindsphere resource consumption and that you might get a notice that you will need to upgrade your account's data ingest rate.

The standard import feature will be deprecated and removed from the CLI once bulk upload also gets enabled for performance assets.

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
