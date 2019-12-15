# MindConnect-NodeJS

## nodejs library for the MindConnect API (V3)

![mindconnect-nodejs](images/mc3.png)

The mindconnect-nodejs library enables the user to upload time series data, files and events to Siemens MindSphere Platform.

This project has started as a community effort at Siemens AG and is now available for general use.

[![Build Status](https://jenkins.mindconnect.rocks/buildStatus/icon?job=mindconnect-nodejs/master)](https://jenkins.mindconnect.rocks/blue/organizations/jenkins/mindconnect-nodejs/activity/) [![The MIT License](https://img.shields.io/badge/license-MIT-009999.svg?style=flat)](./LICENSE.md)
[![npm](https://img.shields.io/npm/v/@mindconnect/mindconnect-nodejs/latest.svg?style=flat)](https://www.npmjs.com/package/@mindconnect/mindconnect-nodejs) ![downloads](https://img.shields.io/npm/dw/@mindconnect/mindconnect-nodejs.svg?colorB=009999)
[![Known Vulnerabilities](https://snyk.io/test/github/mindsphere/mindconnect-nodejs/badge.svg?targetFile=package.json)](https://snyk.io/test/github/mindsphere/mindconnect-nodejs?targetFile=package.json)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/mindsphere/mindconnect-nodejs.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/mindsphere/mindconnect-nodejs/context:javascript)  [![Greenkeeper badge](https://badges.greenkeeper.io/mindsphere/mindconnect-nodejs.svg)](https://greenkeeper.io/)
[![Documentation](https://img.shields.io/badge/mindsphere-documentation-%23009999.svg)](https://opensource.mindsphere.io/docs/mindconnect-nodejs/index.html)
[![Forum](https://img.shields.io/badge/mindsphere-community-%23009999.svg)](https://community.plm.automation.siemens.com/t5/Developer-Space/bd-p/MindSphere-platform-forum)

## Full documentation

The full documentation can be found at [https://opensource.mindsphere.io/docs/mindconnect-nodejs/index.html](https://opensource.mindsphere.io/docs/mindconnect-nodejs/index.html)

## Installing the library

There are several ways to install the library. The most common one is via npm registry:

```bash
# install the latest stable library from the npm registry
npm install @mindconnect/mindconnect-nodejs

# install the latest alpha version from the npm registry
npm install @mindconnect/mindconnect-nodejs@alpha
```

As an alternative, you can also clone the repository, pack and install the files from local file:

```bash
# clone the repository and run in the library directory
npm install
npm pack

#this creates a mindconnect-....tgz file

# in your project directory run
npm install mindconnect-...tgz --save
```

## Installing the Command Line Interface

The library comes with a command line interface which can also be installed globally. You can use the command line mode to upload timeseries, files and create events in the mindsphere.

```bash
# install the library globaly if you want to use its command line interface.
 npm install -g @mindconnect/mindconnect-nodejs
```

## Using CLI

The CLI can be used to create starter projects, upload timeseries, events and files, read agent diagnostics etc.

```bash
# run mc --help to see the full help inforamtion
mc --help
```

Here are some examples how to use the CLI:

![image](images/full.gif)

<!-- <img src="images/full.gif"> -->

## Using CLI to generate starter projects

```bash
# install the library globaly if you want to use its command line interface.
 npm install -g @mindconnect/mindconnect-nodejs

# for typescript nodejs project run
mc starter-ts

# for javascript nodejs project run
mc starter-js

# This will create a folder starterts (or starterjs) which you can use as a starting point for your agent.
# Don't forget to run npm install there.

# for full help run
mc starter-ts --help # or
mc starter-js --help
```

## How to create a nodejs MindSphere agent

The following steps describe the easiest way to test the library. You can of course create the required dependencies also programmatically via API calls.

### Step 0: Create an asset type and aspect types

Mindsphere V3 IoT model requires that you create an asset type and aspect types to describe your assets. For the example we will create an asset type of type Engine with two aspect types: Environment and Vibration. (Note that my tenant is called castidev, you will have to use your own tenant name)

![assetype](images/types.png)

More information about [MindSphere Data Model](http://bit.ly/2IgVB9T).

### Step 1: Create an asset

Create an asset (In example it is called **AcmeMotor**) of type Engine in AssetManager for your data.

### Step 2: Create an agent of type MindConnectLib in Mindsphere

Create an agent in Asset Manager of type core.MindConnectLib create initial JSON token and store it to file (e.g. agentconfig.json)

```json
{
    "content": {
        "baseUrl": "https://southgate.eu1.mindsphere.io",
        "iat": "<yourtokenishere>",
        "clientCredentialProfile": [
            "SHARED_SECRET"
        ],
        "clientId": "a3ac5ae889544717b02fa8282a30d1b4",
        "tenant": "<yourtenantishere>"
    },
    "expiration": "2018-04-06T00:47:39.000Z"
}
```

More Information about [core.MindConnectLib](http://bit.ly/2HZ2ehE) configuration.

### Step 3 : Create an agent

Read the initial configuration from the config file and create the agent.
If you are using the **SHARED_SECRET** profile there is no need to setup the local certificate for the communication (recommended for smaller devices).

```typescript
    const configuration = require("../../agentconfig.json");
    const agent = new MindConnectAgent(configuration);
```

 If you want to use the **RSA_3072** profile you must also set up the agent certificate.

```typescript
// you can create the private.key for example using openssl:
// openssl genrsa -out private.key 3072

agent.SetupAgentCertificate(fs.readFileSync("private.key"));
```

### Step 4: Onboard the agent

The first operation is onboarding of the agent. This creates a client secret which is used for the communication with mindshpere.

This data is stored by default in the .mc folder in your application if you don't change the base path in the constructor of the agent.

**Important**: Make sure that your folder with the configurations is not reachable from the internet as it contains the client_secret for the authentication.

```typescript
if (!agent.IsOnBoarded()) {
    await agent.OnBoard();
}
```

### Step 5: Configure the data model and data mappings to asset variables. (via UI)

In the mindsphere  version 3 you can configure the data model and mappings to aspect variables in the UI of the asset manager as well. Just go to configuration of mindconnectlib and configure the data sources like this.

![datasources](images/datasources.png)

![datasources](images/mappings.png)

(it might be a bit tedious to click through all mappings).

After that you can pull the configuration from mindsphere.

```typescript
if (!agent.HasDataSourceConfiguration()) {
    await agent.GetDataSourceConfiguration();
}
```

### Step 6 After this you can send the data in the code

```typescript
for (let index = 0; index < 5; index++) {

    const values: DataPointValue[] = [
        { "dataPointId": "DP-Temperature", "qualityCode": "0", "value": (Math.sin(index) * (20 + index % 2) + 25).toString() },
        { "dataPointId": "DP-Pressure", "qualityCode": "0", "value": (Math.cos(index) * (20 + index % 25) + 25).toString() },
        { "dataPointId": "DP-Humidity", "qualityCode": "0", "value": ((index + 30) % 100).toString() },
        { "dataPointId": "DP-Acceleration", "qualityCode": "0", "value": (1000.0 + index).toString() },
        { "dataPointId": "DP-Frequency", "qualityCode": "0", "value": (60.0 + (index * 0.1)).toString() },
        { "dataPointId": "DP-Displacement", "qualityCode": "0", "value": (index % 10).toString() },
        { "dataPointId": "DP-Velocity", "qualityCode": "0", "value": (50.0 + index).toString() }
    ];

    // there is an optional timestamp parameter if you need to use something else instead of Date.now()
    const result = await agent.PostData(values);
}
```

(If you were using UI to configure data mappings you will have long integers instead of human-readable data point Ids.)

### Step 6.1 using bulk upload

If you don't want to send the data points one by one, you can also use the bulkpostdata method

```typescript
const bulk: TimeStampedDataPoint[] =
    [{
        "timestamp": "2018-08-23T18:38:02.135Z",
        "values":
            [{ "dataPointId": "DP-Temperature", "qualityCode": "0", "value": "10" },
            { "dataPointId": "DP-Pressure", "qualityCode": "0", "value": "10" }]
    },
    {
        "timestamp": "2018-08-23T19:38:02.135Z",
        "values": [{ "dataPointId": "DP-Temperature", "qualityCode": "0", "value": "10" },
        { "dataPointId": "DP-Pressure", "qualityCode": "0", "value": "10" }]
    }];

await agent.BulkPostData (bulk);
```

## Events

Events can now be created with the library. You can create events for your agent or for your entities. In order to create an event for your entity you need to know the asssetid of the asset.

```javascript
const configuration = require("../../agentconfig.json");
const agent = new MindConnectAgent(configuration);

if (!agent.IsOnBoarded()) {
    await agent.OnBoard();
}

const event: MindsphereStandardEvent = {
    "entityId": configuration.content.clientId, // use assetid if you dont want to store event in the agent :)
    "sourceType": "Event",
    "sourceId": "application",
    "source": "Meowz",
    "severity": 20, // 0-99 : 20:error, 30:warning, 40: information
    "timestamp": new Date().toISOString(),
    "description": "Test"
};

// send event with current timestamp
await agent.PostEvent(event);
```

![events](images/events.png)

## File Upload

Files can now be uploaded via the library. You can upload files for your agent or for your entities. In order to create an event for your entity you need to know the assetid of the asset.

Since version 3.5.1. the agents are using the multipart upload API of the MindSphere. This means that the agents can upload files also bigger > 8 MB, The
multipart upload must be switched on (chunk:true) if you want to activate this behavior. The parameter parallelUploads determine the maximal number of paraellel uploads. You can increase this on a powerfull computer to speed up the upload or decrease to prevent network congestion.

```javascript
const configuration = require("../../agentconfig.json");
const agent = new MindConnectAgent(configuration);

if (!agent.IsOnBoarded()) {
    await agent.OnBoard();
}


await agent.UploadFile(agent.ClientId(), "custom/mindsphere/path/package.json", "package.json", {
    retry: RETRYTIMES,
    description: "File uploaded with MindConnect-NodeJS Library",
    parallelUploads: 5,
    chunk: true
});
```

![files](images/files.png)

## Full Agent

Here is a demo agent implementation.

[![mindsphere-agent](https://img.shields.io/badge/mindsphere-agent-green.svg)](src/demoagent/test-agent.ts)

## Making sure that the data arrives also with flaky internet connection

You can wrap all asynchronous object calls into the retry function which will automatically retry the operation for n times before throwing an exception.

```typescript
import { MindConnectAgent, MindsphereStandardEvent, retry, TimeStampedDataPoint } from "@mindconnect/mindconnect-nodejs";

// if you want to be more resillient you can wrap every async method
// in the retry function which will try to retry several times before throwing an exception

// onboarding over flaky connection
await retry (5, ()=>agent.OnBoard())

// bulk upload with 5 retries
const bulk: TimeStampedDataPoint[] =
[{
    "timestamp": "2018-08-23T18:38:02.135Z",
    "values":
        [{ "dataPointId": "DP-Temperature", "qualityCode": "0", "value": "10" },
        { "dataPointId": "DP-Pressure", "qualityCode": "0", "value": "10" }]
},
{
    "timestamp": "2018-08-23T19:38:02.135Z",
    "values": [{ "dataPointId": "DP-Temperature", "qualityCode": "0", "value": "10" },
    { "dataPointId": "DP-Pressure", "qualityCode": "0", "value": "10" }]
}];

await retry(5, () => agent.BulkPostData(bulk));

```

## Generating the documentation

You can always generate the current HTML documentation by running the command below.

```bash
#this generates a docs/ folder the with full documentation of the library.
npm run doc
```

## Proxy support

Set the http_proxy or HTTP_PROXY environment variable if you need to connect via proxy.

```bash
# set http proxy environment variable if you are using e.g. fiddler on the localhost.

export HTTP_PROXY=http://localhost:8888
```

## Data in the mindsphere

Environment data:

![Environment Data](images/environmentdata.PNG)

Vibration data:

![Vibration Data](images/vibrationdata.PNG)

## Command Line Interface

The CLI commands should only be used **in secure enviroments!** (e.g on your working station, not on the agents). In the next major version the CLI will be
moved to a separate package to reduce the size of the library.

Here is an overview of CLI commands:

```bash
# run mc --help to get a full list of the commands
mc --help
```

![CLI](images/cli.png)

### Setup and diagnostic

The diagnostic endpoint gives informations about the possible problems which an agent might have on the cloud side. However, these operations require service credentials which should only be used for setup and diagnostic tasks in secure environments.

![setup](images/setup.gif)

### Bulk Import and Standard Import of the historical data

The CLI provides the commands to import historical data to the MindSphere IoT services.
The commands use bulk import API for simulation assets and standard time series for performance assets.

If you use the standard import to the IoT services, the calls to the API will be **throttled** to match your throttling limits.
The number of the records per message will be reduced to max 200 per message. Using this feature has direct impact on mindsphere resource consumption.
You might get a notice that you will need to upgrade your account's data ingest rate.

The feature will be deprecated once bulk upload also works for performance assets.

## Legal

This project has been released under an [Open Source license](./LICENSE.md). The release may include and/or use APIs to Siemens’ or third parties’ products or services. In no event shall the project’s Open Source license grant any rights in or to these APIs, products or services that would alter, expand, be inconsistent with, or supersede any terms of separate license agreements applicable to those APIs. “API” means application programming interfaces and their specifications and implementing code that allows other software to communicate with or call on Siemens’ or third parties’ products or services and may be made available through Siemens’ or third parties’ products, documentations or otherwise.
