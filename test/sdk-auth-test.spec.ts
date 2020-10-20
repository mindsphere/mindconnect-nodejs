// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import * as debug from "debug";
import "url-search-params-polyfill";
import { BrowserAuth, CredentialAuth, MindSphereSdk, UserAuth } from "../src";
const log = debug("mindconnect-agent-test");
chai.should();

describe("[SDK] using different auths", () => {
    it("should instantiate", () => {
        const sdk = new MindSphereSdk();
        sdk.should.not.be.undefined;
    });

    it("should instantiate with browser auth @sanity", () => {
        const sdk = new MindSphereSdk(new BrowserAuth());
        sdk.should.not.be.undefined;
    });

    it("should instantiate with backend auth @sanity", async () => {
        const sdk = new MindSphereSdk(new UserAuth("123", "https://gateway.eu1.mindsphere.io"));
        sdk.should.not.be.undefined;
        sdk.GetGateway().should.equal("https://gateway.eu1.mindsphere.io");
        const token = await sdk.GetToken();
        token.should.equal("123");
    });

    it("should instantiate with backend auth and bearer @sanity", async () => {
        const sdk = new MindSphereSdk(new UserAuth("Bearer 123", "https://gateway.eu1.mindsphere.io"));
        sdk.should.not.be.undefined;
        sdk.GetGateway().should.equal("https://gateway.eu1.mindsphere.io");
        const token = await sdk.GetToken();
        token.should.equal("123");
    });

    it("should instantiate with CredentialsAuth", async () => {
        const sdk = new MindSphereSdk(
            new CredentialAuth(
                "https://gateway.eu1.mindsphere.io",
                "Basic: " + Buffer.from("a:b").toString("base64"),
                "test"
            )
        );
        sdk.should.not.be.undefined;
        sdk.GetGateway().should.equal("https://gateway.eu1.mindsphere.io");
        sdk.GetAssetManagementClient().GetGateway().should.equal("https://gateway.eu1.mindsphere.io");
        sdk.GetKPICalculationClient().GetTenant().should.equal("test");
    });

    it("should instantiate with ServiceCredentials", async () => {
        const sdk = new MindSphereSdk({
            gateway: "https://gateway.eu1.mindsphere.io",
            basicAuth: "Basic: " + Buffer.from("a:b").toString("base64"),
            tenant: "test",
        });
        sdk.should.not.be.undefined;
        sdk.GetGateway().should.equal("https://gateway.eu1.mindsphere.io");
        sdk.GetAssetManagementClient().GetGateway().should.equal("https://gateway.eu1.mindsphere.io");
        sdk.GetKPICalculationClient().GetTenant().should.equal("test");
    });

    it("should instantiate with AppCredentials", async () => {
        const sdk = new MindSphereSdk({
            gateway: "https://gateway.eu1.mindsphere.io",
            basicAuth: "Basic: " + Buffer.from("a:b").toString("base64"),
            tenant: "test",
            usertenant: "test",
            appName: "test",
            appVersion: "1.0.0",
        });

        sdk.should.not.be.undefined;
        sdk.GetGateway().should.equal("https://gateway.eu1.mindsphere.io");
        sdk.GetAssetManagementClient().GetGateway().should.equal("https://gateway.eu1.mindsphere.io");
        sdk.GetKPICalculationClient().GetTenant().should.equal("test");
    });
});
