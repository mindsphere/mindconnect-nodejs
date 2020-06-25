# Contributing

**We are currently only accepting code contributions coming from within Siemens organization.**

We welcome contributions in several forms, e.g.

* Sponsoring
* Documenting
* Testing
* Coding
* etc.

Please check for the issues in the project and look for unassigned ones or create a new one. The good issues for newcomers are marked with **help-wanted** and **good-first-issue**.

Working together in an open and welcoming environment is the foundation of our
success, so please respect our [Code of Conduct](CODE_OF_CONDUCT.md).

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

make sure that the tests are running and create a pull request. We would also really appreciate a CLI contribution.

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

First: install the library and CLI globally and run the create service credentials command

```bash
# install the cli
npm install -g @mindconnect/mindconnect-nodejs

# create service credentials
mc service-credentials

# mc service-credentials --help will provide more help (you can use app credentials or service credentials)
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
