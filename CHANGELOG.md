# Changelog

## 3.18.2 - (Hazelwood Vienna) - March 2022

- fixed missing date-fns dependency in package.json

## 3.18.1 - (Hazelwood Vienna) - March 2022

- broken dependency in package.json

## 3.18.0 - (Hazelwood Vienna) - March 2022

- SDK: ResourceAccessManagement Client [[#308](https://github.com/mindsphere/mindconnect-nodejs/issues/308)]
- SDK: CommandingAPI - Commanding Client [[#307](https://github.com/mindsphere/mindconnect-nodejs/issues/307)]
- CLI: new `mc policy` command to manage policies [[#308](https://github.com/mindsphere/mindconnect-nodejs/issues/308)]
- CLI: new `mc delivery-jobs` command to manage mqtt delivery jobs [[#307](https://github.com/mindsphere/mindconnect-nodejs/issues/307)]
- CLI: fixed double use of `as` shortcut in `mc aspects` and `mc agent-status` command. The `mc aspects` command now uses the `asp` shortcut.
- CLI: added last login information to `mc iam --user` command
- Bumped most depenedencies to `^` version.

## 3.17.0 - (Sandstone Vienna) - February 2022

- CLI: completely new `mc iam` command with support for user, roles, and user groups management
- SDK: Tenant Management added paging to the Tenant Management Client
- mc dev-proxy reads now --passkey from MDSP_PASSKEY variable like other commands [#301]
- fixed paging issue for `mc iam --group` command [#297]
- Bumped all dependencies

## 3.16.0 - (Tyrian Vienna) - September 2021

- CLI: new `mc message-broker` command - manage message broker subscriptions and webhooks
- SDK: message broker client
- Bumped all dependencies

## 3.15.0 - (Pineapple) Vienna) - August 2021

- changed generated code for the mindconnect agent and agent management client to support BIG_STRING AND TIMESTAMP see MDS-329054
- Upgraded validation to newest ajv - the validation of the timeseries had to be rewritten due to deprecation of addKeyword interface in ajv
- Bumped all dependencies

## 3.14.0 - (Cool Grey Vienna) - June 2021

### Announcement 3.14.0

Thanks to the final push of contributions from @jupiterbak, the typescript SDK and the CLI have now support for all publicly avaialable MindSphere APIs.

### Bugfixes and Improvements 3.14.0

- CLI: new `mc oe-device-types` command - list, create or delete device types (open edge)
- CLI: new `mc oe-devices` command - list, create or delete (open edge) devices
- CLI: new `mc oe-device-status` command - list get or update device status information (open edge)
- CLI: new `mc oe-app-inst` command - list, create, configure or delete app instance (open edge)
- CLI: new `mc oe-app-deploy` command -  list, create, update app installation task(s) (open edge)
- CLI: new `mc oe-deploy-workflow` command - list, create/instantiate, update or delete/cancel workflow deployment model or instance(s) (open edge)
- CLI: new `mc oe-firm-deploy` command - list, create, update firmware deployment task(s) (open edge)
- CLI: mc data-lake new modes: `--mode subscribe`, `--mode unsubscribe`, `--mode subscriptions` for managing the event subscriptions [#283]
- CLI: the `mc signal-calculation` now has `--on data` and `--on asset` switch [#263]
- CLI: new `mc asset-lock` command [#271]
- SDK: Open Edge - FirmwareDeployment Client [#276]
- SDK: Open Edge - EdgeAppInstanceManagement Cleint [#275]
- SDK: Open Edge - EdgeAppDeploymentClient [#274]
- SDK: Open Edge - DeploymentWorkflowClient [#273]
- SDK: AssetManagement `GetModelLock` and `PutModelLock` Methods
- Bumped all dependencies

### Contributions 3.14.0

- Thanks to @jupiterbak for his Open Edge Client contributions. <3 :heart:

## 3.13.0 - (Phlox Vienna) - May 2021

### Bugfixes and Improvements 3.13.0

- CLI: new `mdsp` alias for command additionally to `mc` alias
- CLI: new `mc anomalies` command [#254]
- CLI: new `mc jobs` command [#255]
- CLI: new `mc schedules` command [#255]
- CLI: new `mc data-exchange` command [#256]
- CLI: new `mc mobile-app-instances` command [#252]
- CLI: new `mc mobile-apps` command [#252]
- CLI: new `mc notifications` command for MindSphere notifications [#252]
- CLI: new `mc signal-calculation` command for MindSphere Signal Calculation Service [#258]
- CLI: new `mc sdi-data-lakes` command for SDI [#265]
- CLI: new `mc sdi-data-registries` command for SDI [#265]
- CLI: new `mc sdi-data-types` command for SDI [#265]
- CLI: new `mc sdi-file-upload` command for SDI [#265]
- CLI: new `mc sdi-search-schemas` command for SDI [#265]
- CLI: new `mc sdi-data-queries` command for SDI [#265]
- CLI: new `mc sdi-ontologies` command for SDI [#265]
- CLI: new `mc sdi-ontology-jobs` command for SDI [#265]
- CLI: new `mc device-types` command [#264]
- CLI: new `mc devices` command [#264]
- CLI: new `mc device-status` command [#264]
- CLI: fixed bug in `mc aggregates` command with multiple lines of same aggregate
- CLI: if the authentication is configured, the information about it is removed from help to reduce verbosity.
- SDK: signal calculation client [#258]
- SDK: Job Manager Client [#255]
- SDK: Data Exchange Client [#256]
- SDK: AnomalyDetection Client [#254]
- SDK: NotficationV4 Client [#252]
- SDK: IotTimeSeriesAggragetesV4 Client [#250]
- SDK: Semantic Data InterConnect Client [#265]
- SDK: Open Edge - Device Management Client [#264]
- SDK: Open Edge - Device Status Management Client [#264]
- Bumped all dependencies

### Contributions 3.13.0

- Thanks to @jupiterbak for his AnomalyDetection contribution. <3 :heart:
- Thanks to @jupiterbak for his Open Edge Client contributions. <3 :heart:

## 3.12.0 - (Frost Vienna) - April 2021

### Bugfixes and Improvements 3.12.0

- CLI: new `mc aggregates` command for IoT TimeSeries Aggregates [#250]
- CLI: new `mc models` command for ML Modelmanagement [#202]
- CLI: new `mc subtenants` command for subtenant management [#246]
- CLI: new `mc tenant` command for tenant management [#246]
- CLI: new `mc events` command for event management [#241]
- CLI: renamed and extended `mc download-events` to `mc events-bulk` command with `--mode download` and  `--mode delete` [#240]
- SDK: ModelManagementClient [#202]
- SDK: TenantManagementClient
- Bumped all dependencies

### Contributions 3.12.0

- Thanks to @jupiterbak for his ModelManagement contribution. <3 :heart:

## 3.11.2 - (Sandcastle Vienna) - March 2021

### Bugfixes and Improvements 3.11.2

- Fix for the changed mapping behavior which now supports nullable strings [[#238](https://github.com/mindsphere/mindconnect-nodejs/issues/238)]

## 3.11.1 - (Sandcastle Vienna) - March 2021

### Bugfixes and Improvements 3.11.1

- Support for EU2 data lake upload [#236](https://github.com/mindsphere/mindconnect-nodejs/issues/236)

## 3.11.0 - (Sandcastle Vienna) - December 2020

### Bugfixes and Improvements 3.11.0

- CLI: `mc data-lake` added `--mode meta` which prints out the metadata of a path
- CLI: `mc configure-agent --mode template` can now generate a template for JSON schema to MindSphere conversion see [medium](https://medium.com/@sn0wcat_92713/how-to-create-mindsphere-artefacts-from-json-schema-definitions-1b2f3e446f6a) for more
- CLI: new `--mode template` parameter on `mc configure-agent`  command
- CLI: new `--mode info` parameter on `mc asset-types` and `mc aspects` commands (#211)
- CLI: new `mc event-types` command with `--includeshared` support for cross-tenancy (#170)
- CLI: updated `mc assets` with new `--includeshared` parameter - support for cross-tenancy (#170)
- CLI: updated `mc asset-types` with new `--includeshared` parameter - support for cross-tenancy (#170)
- CLI: updated `mc aspects` with new `--includeshared` parameter - support for cross-tenancy (#170)
- CLI: updated `mc list-assets` with new `--includeshared` parameter - support for cross-tenancy (#170)
- SDK: `DataLakeClient` - full data lake client (#199)
- SDK: `UsageTransparencyClient` - added support for usage transparecy client to SDK (#200)
- SDK: `EventManagementClient` support for cross-tenancy (#170)
- SDK: `AssetManagementClient` support for cross-tenancy (#170)
- Bumped all dependencies

## 3.10.0 - (Seafoam Vienna) - November 2020

### Highlights 3.10.0

- Merged 2 more Hacktoberfest contributions. Thanks to coding4funrocks! Great job!
- Happy Halloween release!

### Bugfixes and Improvements 3.10.0

- CLI: support for uploading files to data lake (#221)
- SDK: upload files to data lake (#221)
- SDK: signed Url generation for upload and download (#221)
- CLI: added support for direct calculation of KPI states to CLI mc kpi-calculation command
- SDK: feat: add support for direct interaction to TrendPrediction Client (#204) [#hacktoberfest, coding4funrocks]
- SDK: added support for direct interaction to KPI Calculation Client (#203) [#hacktoberfest, coding4funrocks]
- SDK: fixed bug in EventManagementSDK GetEventTypes method (superflous history parameter)
- unit tests: changed passkey for unit tests to work with passkey set up in environment (#207)
- unit tests: added @sanity and @s4f (start for free) unit test suites (#208)

## 3.9.0 - (Pewter Vienna) - October 2020

### Highlights 3.9.0
  
- CLI: Binary release for MacOs, Windows and Linux (#185) [#hacktoberfest issue-03]
- Merged 6 Hacktoberfest Contributions

### Improvements 3.9.0

- CLI: mc data-lake command (manage permissions and tokens of data lake)
- CLI: mc aspects command (list, create, delete, create from JSON Schema)
- CLI: mc asset-types command (list, create, delete)
- CLI: mc assets command (list, create, delete)
- CLI: mc download-events command
- CLI: mc configure-agent --mode test can now produce a configurable number of test records
- CLI will now notify users that there is a new version of the CLI available (#190) [#hacktoberfest lyallemma]
- SDK: data lake token operations
- SDK: event analytics api (#162)
- SDK: EventManagement: sharedEvents support included in GetEvents operation (#170)
- CLI: mc aspects command -- mode convert added support for multiple targets in schema (#193) [#hacktopberfest phbender]
- bumped all dependencies

## Bugfix 3.9.0

- fixed the example in `mc iam` command (#182) [#hacktoberfest, coding4funrocks]
- improved the build script to run in powershell as well (#184) [#hacktoberfest coding4funrocks]
- added the digital twin type to mc assets --mode create command (#195) [#hacktoberfest RhnSaxena]
- fixed the issue with `mc dev-proxy` rewrite option (#181)

### Contributions 3.9.0

- The mindconnect-nodejs participated in #hacktoberfest2020
- Thanks to :
  - coding4funrocks
  - issue-03
  - lyallemma
  - RhnSaxena
  - PhBender
  for their #hacktoberfest contributions. <3 :heart:

## 3.8.3 - (Electric Blue Vienna) - August 2020

## Bugfix 3.8.3

- frontend authentication works without configured service credentials [#177](https://github.com/mindsphere/mindconnect-nodejs/issues/177)
- [Snyk] Security upgrade ajv from 6.12.2 to 6.12.3 [#176](https://github.com/mindsphere/mindconnect-nodejs/pull/176)

## 3.8.2 - (Electric Blue Vienna) - July 2020

## Bugfix 3.8.2

- bumped lodash dependency for security scanners [#163](https://github.com/mindsphere/mindconnect-nodejs/issues/163)
- implemented more robust naming convention for DESCRIPTIVE mode ([#174](https://github.com/mindsphere/mindconnect-nodejs/issues/174))

## 3.8.1 - (Electric Blue Vienna) - June 2020

## Bugfix 3.8.1

- fixed model for PutTimeSeries in iot SDK

## 3.8.0 - (Electric Blue Vienna) - June 2020

### Highlights 3.8.0

- Agent: added support for creating automatic data source configuration and automatic mappings
- CLI: mc configure-agent can now automatically create the data source configuration and the mappings for selected assetid
- CLI: cookie based authentication, you don't have to have service or app credentials (app/service credentials are still recommended)
- SDK: typescript sdk released to beta status
- SDK: typescript browser support (e.g. for react, angular, etc)
- CLI: mc service-credentials command has now http based configuration frontend
- CLI: mc dev-proxy added simple api proxy for MindSphere local app development

### Contributions 3.8.0 heart: <3

- Thanks to Sharath N.S. for contributing on automatic data source configuration and automatic mappings!

### Bugfixes and Improvements 3.8.0

- CLI: cookie based authentication, you don't have to have service or app credentials (app/service credentials are still recommended)
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
- Agent: exposed Sdk() property on the Agent for future use (at the moment only some APIs of MindSphere can be called with Agent Credentials)
- SDK: added utility class for MQTT OPC UA PubSub key rotation
- SDK: added TokenManagerAuth to SDK
- CLI: mc iam command can now manage MindSphere users
- CLI: mc configure-agent can now automatically create the data source configuration and the mappings for selected assetid
- CLI: mc configure-agent can now automatically create the data source configuration and the mappings for selected assetid
- CLI: mc offboard-agent has now a command to offboard an agent with the id only  (mc offboard --assetid) (#130)
- CLI: added mc mqtt-createjwt command which can create a key for MQTT OPC UA PubSub authentication
- CLI: mc service-credentials command is now accepting application credentials
- CLI: mc service-credentials command has now http based configuration frontend
- CLI: mc dev-proxy added simple api proxy for MindSphere local app development
- CLI: deprecated use of classical service credentials
- Improved documentation for GetDataSourceConfiguration and GetDataMappings methods (#149, #150)
- Switched the fetch library to cross-fetch for browser support for SDK
- bumped all dependencies
- we have a new logo :)

## 3.7.0 - (Boysenberry Vienna) - February 2020

## Bugfixes and Improvements 3.7.0

- CLI: mc kpi-calculation command (calculate KPIs and KPI states based on signal values)
- CLI: mc trend-prediction command (perform linear and polynomial trend prediction on MindSphere aspects)
- CLI: mc bulk-download command (download timeseries aspects from MindSphere)
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
- Added stale issues bot watcher to GitHub

## 3.6.1 - (Cobalt Blue Vienna) - September 2019

## Bugfixes and Improvements 3.6.1

- MindConnect Agent Storage: Fixed the bug where the change of configuration. This was causing problems in node-RED when redeploying the flow. (#82)

## 3.6.0 - (Cobalt Blue Vienna) - July 2019

- SDK: The SDK in this package is still only a **preliminary version** which is used to provide support for the CLI.
- SDK: added IotTimeSeriesAggregateClient to the SDK
- SDK: added SpectrumAnalysisClient to the SDK
- SDK: added SignalValidationClient to the SDK
- CLI Command: mc spectrum-analysis: performs spectrum analysis on a sound file (#40)
- CLI Command: mc signal-validation: performs signal validation on the MindSphere data (#39)
- CLI Command: mc list-files: lists iot files stored with the asset (#35)
- CLI Command: mc list-assets: lists assets in the tenant (#35)
- CLI Command: mc download-file: downloads file from MindSphere iot file service (#35)

## Bugfixes and Improvements 3.6.0

- SDK: IoTfile - GetFiles - optional parameters are now in query string (bugfix)
- CLI - agent commands - precedence for location of the .mc directory:  path to agentconfig.json > currentdir > user home dir (#65)
- All tests are now self-contained.
- All images are now shrunk.
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
- CLI Command: create-agent - creates a new agent in the MindSphere (#12)
- CLI Command: offboard-agent - offboards the agent in the MindSphere (#11)
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
- SDK: started a  PRELIMINARY SDK for the new commands which require additional MindSphere APIs
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
- We are working on the legal framework to let outside (non-Siemens) collaborators contribute. Stay tuned :)

## About the SDK in the project and what to expect

The SDK in this package is only a **preliminary version** which is used to provide support for the CLI.

Even though you can already play with it, don't rely on it too much because it will be redesigned in the future to support
different scenarios like deployment in the browser and also different authentication mechanisms like frontend authentication,
backend authentication and token service authentication (for cross tenant access) in the SDK.

This is at the moment really just a pre-pre-alpha version which was necessary in order to be able to provide the CLI commands and it only
works with service credentials authentication.

## Bulk Imports and Standard Imports

At this point in time (May 2019) the Bulk Import only works for Simulation Assets and not for Performance Assets. This is why in this version
we still use the standard APIs for the import of the historical data. Please be aware that the use of this feature has a direct impact
on *your* MindSphere resource consumption and that you might get a notice that you will need to upgrade your account's data ingest rate.

The standard import feature will be deprecated and removed from the CLI once bulk upload also gets enabled for performance assets.

## 3.4.0 - (Malachite Vienna) - April 2019

- new CLI commands mc starter-ts and mc starter-js for starter projects
- added version to user-agent

## Bugfixes 3.4.0

- refactored the CLI commands to separate files
- made lock private in MindConnect storage
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

- Made the agent demo implementation more resilient

## 3.0.2 - (Iceberg Vienna) - November 2018

- added retry support to CLI
- added examples how to retry operations

## Bugfixes 3.0.2

- Fixed the starterjs and starterts templates

## 3.0.1 - (Honeydew Vienna) - November 2018

- Added MindSphere Developer License Agreement
- Added RSA_3072 support
- Preparation for Open Source Release
- Refactored to separate authentication and function

### Bugfixes 3.0.1

- The cli uses now os.homedir() per default for settings instead of local directory

## 3.0.0 - Beta 8  (Lime Vienna) - August 2018

- Bulk upload of time series data for the agent (for CLI support)
- Added MindConnect CLI (command line interface)
- Added MindConnect CLI onboard command
- Added MindConnect CLI upload-file command
- Added MindConnect CLI upload-timeseries command
- Added MindConnect CLI create-event command

## 3.0.0 - Beta 7 (Crimson Vienna) - June 2018

- Bugfix for chunked upload

### Bugfixes 3.0.0 - Beta 7

- Fixed bug in chunked upload

## 3.0.0 - Beta 6 (Red Vienna) - June 2018

- Added event support to the library
- Added file upload to the library
- Warning chunking is experimental for fileUpload!
- Added repository for the libraries
- Preparation for GitHub - automated legal and security checks

### Bugfixes 3.0.0 - Beta 6

- Backward compatibility node.js (UrlSearchParam polyfill, compatible with node v.6.x.x)
- Audit and security dependency upgrade

## 3.0.0 - Beta 5 (Beige Vienna) - April 2018

### New Features 3.0.0 - Beta 5

- Added Validation for PostData Message (Thanks @Patrick Niederlohner for Contribution!)
- Fixed some path errors
- Added generators for starter agents (typescript and javascript)
- Support for MindSphere 3.0 version of the MindConnect API.
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

- The agent now throws a (quite dramatical) exception when it can't store the data in the `.mc` folder

## 2.0.2 - (Jackson Violet) - October 2017

### BugFixes 2.0.2

- Fixed the missing prepare state in package.json.

## 2.0.0 - (Saint Paul Lily) - October 2017

### New Features 2.0.0

- Initial version for MindSphere 2.0
