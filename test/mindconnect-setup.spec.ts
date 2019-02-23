// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import * as debug from "debug";
import "url-search-params-polyfill";
import { IMindConnectConfiguration, MindConnectAgent, MindConnectSetup } from "../src";
import { decrypt, loadAuth } from "../src/api/utils";
import { mochaAsync } from "./test-utils";
const log = debug("mindconnect-setup-test");
chai.should();

describe("MindConnect Setup", () => {

    const gateway = process.env.GATEWAY || loadAuth().gateway;
    const tenant = process.env.TENANT || loadAuth().tenant;
    const basicAuth = process.env.BASICAUTH || decrypt(loadAuth(), "passkey.4.unit.test");
    const sharedSecretConfig: IMindConnectConfiguration = require("../agentconfig.json");

    it("should instantiate", () => {
        const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
        log(mcsetup);
        mcsetup.should.exist;
    });

    it("should throw an error with invalid setup", () => {
        chai.expect(() => new MindConnectSetup(gateway, "invalid setup", tenant)).to.throw("You have to pass the basic authentication header");
        chai.expect(() => new MindConnectSetup("not.an.url", basicAuth, tenant)).to.throw("the gateway must be an URL");
    });

    it("should acquire the public key for validation", mochaAsync(async () => {
        const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
        const testObject = <any>mcsetup;
        testObject.should.exist;
        testObject.AcquirePublicKey.should.exist;
        await testObject.AcquirePublicKey();
        testObject._oauthResponse.should.exist;
        testObject._oauthResponse.keys[0].should.exist;
        testObject._oauthResponse.keys[0].value.should.exist;
        log(testObject._oauthResponse.keys[0].value);
    }));

    it("should acquire token via basic auth", mochaAsync(async () => {
        const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
        const testObject = <any>mcsetup;
        testObject.should.exist;
        testObject.AcquireToken.should.exist;
        await testObject.AcquireToken();
        testObject._accessToken.should.exist;
    }));

    it("should validate token", mochaAsync(async () => {
        const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
        const testObject = <any>mcsetup;
        testObject.should.exist;
        testObject.AcquireToken.should.exist;
        await testObject.AcquireToken();
        testObject.ValidateToken.should.exist;
        await testObject.ValidateToken();
        testObject._accessToken.should.exist;
    }));

    it("should renew token", mochaAsync(async () => {
        const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
        const result = await mcsetup.RenewToken();
        result.should.be.true;
    }));

    it("should get diagnostics", mochaAsync(async () => {
        const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
        const diag = await mcsetup.GetDiagnosticInformation();
        mcsetup.should.not.be.null;
        diag.content.should.not.be.undefined;
    }));


    it("should register 2 agents for diagnostics", mochaAsync(async () => {

        if (!process.env.CI) {
            // don't delete all diagnostic registrations all the time on the CI/CD this can disturb the normal workings on the tenants.
            const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
            mcsetup.should.not.be.null;

            await mcsetup.DeleteAllDiagnosticActivations();

            try {
                await mcsetup.RegisterForDiagnostic("2903bf15381646d3a8f4aeeff8d9bd29");
                await mcsetup.RegisterForDiagnostic("68766a93af834984a8f8decfbeec961e");
            } catch (err) {
                if ((("" + err).indexOf("agent limitation")) < 0) {
                    throw err;
                }
            }
            const activations = await mcsetup.GetDiagnosticActivations();
            log(activations.content);
            activations.content.length.should.be.equal(2);
            await mcsetup.DeleteAllDiagnosticActivations();

        }
    }));

    it("should get logs on error", mochaAsync(async () => {
        if (!process.env.CI) {
            const mcsetup = new MindConnectSetup(gateway, basicAuth, tenant);
            mcsetup.should.not.be.null;
            const agent = new MindConnectAgent(sharedSecretConfig);
            agent.should.exist;

            await mcsetup.DeleteAllDiagnosticActivations();

            try {
                const response = await mcsetup.RegisterForDiagnostic(agent.ClientId());
            } catch (err) {
                if ((("" + err).indexOf("Conflict")) < 0) {
                    throw err;
                }
            }
            if (!agent.IsOnBoarded()) {
                agent.OnBoard();
            }
            await agent.PostData([{ dataPointId: "Unexistent", qualityCode: "123123135", value: "12312346.42.23" }], undefined, false);
            const diag = await mcsetup.GetDiagnosticInformation(agent.ClientId());
            diag.content.should.exist;
            let activations = await mcsetup.GetDiagnosticActivations();
            activations.content.length.should.be.greaterThan(0);
            await mcsetup.DeleteDiagnostic(agent.ClientId());
            activations = await mcsetup.GetDiagnosticActivations();
            activations.content.length.should.be.equal(0);
        }
    }));
});