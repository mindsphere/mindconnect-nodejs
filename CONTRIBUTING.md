# Contributing

We welcome contributions in several forms, e.g.

* Sponsoring
* Documenting
* Testing
* Coding
* etc.

Please check for the issues in the project and look for unassigned ones or create a new one. The good issues for newcomers are marked with **good-first-issue**.

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

## Setting up the local development environment

You will need a MindSphere Account to setup the development environment.
If you don't have an account yet, you can [register here for a free account](https://siemens.mindsphere.io/en/start). (that is free as in a beer :)

### Executing unit tests

The unit tests require the configured service credentials and a 3072 bit agent certificate.

First: install the library and CLI globally and run the create service credentials command

```bash
# install the cli
npm install -g @mindconnect/mindconnect-nodejs
```

After that setup the app or service credentials which you will be using for unit testing

```bash
# create service credentials
mc service-credentials

# mc service-credentials --help will provide more help (you can use app credentials or service credentials)
```

Here is a step by step description how to set up the app or service credentials:

[Setting up the MindSphere CLI](https://opensource.mindsphere.io/docs/mindconnect-nodejs/cli/setting-up-the-cli.html)

After that you have to configure the MDSP_PASSKEY variable in your environment:

Bash:

```bash
export MDSP_PASSKEY="my.complex.passkey"
```

Windows CMD

```cmd
set "MDSP_PASSKEY=my.complex.passkey"
```

Windows PowerShell

```powershell
$Env:MDSP_PASSKEY="my.complex.passkey"
```

*(Note: The older versions, including 3.9.0 had hardcoded passkey for unit tests `passkey.4.unit.test` . Please set up your app/service credentials accordingly if you are running unit tests for older versions)*

After setting up the CLI, you will need a 3072 bit certificate. (make sure that you have **OpenSSL** installed and available)

```bash
# run only once to create certificate
npm run createkey
```

You are now all set and should be able to run the unit tests locally. Please note that not all tests will run on your machine if you have a start-for-free account due to MindSphere restrictions. There is a special set of unit tests which you can call with `npm run s4f` if you want to
sanity-check the library before creating a pull request.

```bash
npm run test
```

### Local Development Scripts

### Developing new features and unit tests `npm run dev`

The `npm run dev` command will start the typescript transpiler and mocha unit testing in a watch mode so that you can add new features to the library.

### Developing new CLI Commands `npm run ts:watch`

Start in one shell `npm run ts:watch` to run the typescript transpiler in the watch mode. You can run the command you are developing with:

```bash
node src/cli/mc [list of parameters...]
```

A useful shortcut is to create an alias in your shell for this:

```bash
alias lmc='node src/cli/mc'
```

Running the commands is now very similar to the installed version but instead of `mc command [options]`
you will use `lmc command [options]`, for example like this:

```bash
lmc list-assets
```

Don't forget to start another shell with `npm run ts:watch` which runs the typescript transpiler.

## package.json scripts

### `npm run clean`

Deletes `dist/`, `starterts/` and `starterjs` directory.

### `npm run clean:dist`

Deletes `dist/` directory.

### `npm run prepare`

Prepares the library for installation. It is called by `npm pack` and `npm install` commands.

The script executes following steps:

* cleans the `dist/` directory (`npm run clean`)
* transpiles the typescript code to `dist/` directory (`npm run ts:build`)
* copies the html files for `mc service-credentials` command to `dist/` directory (`npm run copyfiles:dist`)
* executes the webpack build for the browser distribution of the SDK (`npm run browser:build`)

### `npm run copyfiles:dist`

copies the html files for `mc service-credentials` command to `dist/` directory. This script is usually only called from the `prepare` script.

### `npm run test`

Transpiles the typescript and runs the full mocha unit test suite. (this only works on normal developer tenants)

### `npm run sanity`

Transpiles the typescript and runs the mocha unit tests marked with @sanity (this only works on normal developer tenants)

### `npm run s4f`

Transpiles the typescript and runs the mocha unit tests marked with @s4f. This can be used on start-for-free tenants to 
sanity check the library before submiting a pull request.

### `npm run test-dev`

Transpiles the typescript and runs the mocha unit test suite with NODE_TLS_REJECT_UNAUTHORIZED=0 so that you can inspect the HTTP traffic e.g. by using Telerik Fiddler as a proxy server.

### `npm run test-jenkins`

Called by jenkins to create test resports in CI/CD pipeline.

### `npm run ts:build`

Run the typescript transpiler.

### `npm run ts:build:dist`

Run the typescript transpiler and save results in `dist/` folder. (used by `prepare` script)

### `npm run ts:watch`

Run typescript transpiler in watch mode (used for development)

### `npm run lint`

Start typescript linter

### `npm run dev`

Local development for new features. Runs concurrently typescript transpiler in watch mode (`npm run ts:watch`) and mocha in watch mode (`npm run test:watch`)

### `npm run doc`

Generates the documentation.

### `npm run createkey`

Creates a private RSA_3072 key with help of openssl library (which must be available in your PATH)

### `npm run license`

Checks if all depenedent libraries are in a set of allowed libraries. Used by jenkins CI/CD pipeline.

### `npm run license:summary`

Prints out a license summary for the whole dependency tree.

### `npm run pkg`

Creates the binary files with the CLI for Windows, Linux and MacOS.

## Contributing to MindSphere TypeScript SDK

If you want to contribute with a new Client Implementation to typescript SDK here are some guidelines

## 1. Create Issue

Tell the community that you are working on an client :)

## 2. Create the file structure

**client and models:**

```text
\src\api\sdk\<yourapi>\
                        <yourapi>.models.ts
                        <yourapiclient>.ts
```

**tests:**

```text
\test\
       <yourapiclient>.spec.ts
```

**cli command(s):**

```text
\src\cli\commands folder

```

Just follow the existing code examples ;)

## 3. Generate the Models

You can generate the models form OpenAPI specification using. e.g. [https://editor.swagger.io](https://editor.swagger.io) and typescript-fetch template.
The models belong into the namespace called ```<yourapi>```Models

```typescript
export namespace TimeSeriesAggregateModels {
....models go here
}
```

## 4. Implement the Client, Tests and CLI commands

Implement the client for your API using ```this.HttpAction method``` and following the existing conventions. Using HttpAction ensures that the API Client works with different authorizers. Here is an example for TimeSeriesAggregateClient:

```typescript
// Always extend SdkClient, this will give you access to this.HttpAction
export class TimeSeriesAggregateClient extends SdkClient {
    // base Url from OpenAPI specification
    private _baseUrl: string = "/api/iottsaggregates/v3";

    // the path parameters belong in the function parameters and the querystring parameters in params object
    public async GetAggregates(
        entityid: string,
        propertyset: string,
        params: { from: Date; to: Date; intervalValue: number; intervalUnit: string; select?: string }
    ): Promise<TimeSeriesAggregateModels.Aggregates> {
        const qs = toQueryString(params);
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),           // always use this.GetGateway()  and this.GetToken()
            authorization: await this.GetToken(), //this is overriden in different authorizers
                                                  //and ensures that the Client works in frontend and in backend.
            baseUrl: `${this._baseUrl}/aggregates/${entityid}/${propertyset}?${qs}`,
            message: "GetTimeSeriesAggregates"    // this is used for logging
        })) as TimeSeriesAggregateModels.Aggregates; // always cast to the real result type from models
    }
}
```

You also have to create a Method for lazy loading of your new client on the ```MindSphereSdk``` class

```typescript
private _timeSeriesAggregateClient?: TimeSeriesAggregateClient;

public GetTimeSeriesAggregateClient(): TimeSeriesAggregateClient {
    this._timeSeriesAggregateClient =
        this._timeSeriesAggregateClient || new TimeSeriesAggregateClient(this._authenticator);
    return this._timeSeriesAggregateClient;
}
```

and add export to ```src\api\sdk\index.ts``` file:

```typescript
...
export * from "./iotaggregate/iot-timeseries-aggregate";
export * from "./iotaggregate/iot-timeseries-aggregate-models";
...
```

Make sure that the tests are running and create a pull request. We would also really appreciate a CLI contribution.
