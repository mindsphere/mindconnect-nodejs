// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import * as debug from "debug";
import "url-search-params-polyfill";
import { IMindConnectConfiguration, MindConnectAgent } from "../src";
const log = debug("mindconnect-agent-test");
const HttpsProxyAgent = require("https-proxy-agent");
chai.should();

describe("MindConnectApi perf test", () => {

    const sharedSecretConfig: IMindConnectConfiguration = require("../agentconfig.json");

    it("should instantiate shared secret agent.", () => {
        const agent = new MindConnectAgent(sharedSecretConfig);
        agent.should.not.be.null;
        (<any>agent)._configuration.should.not.be.null;
        (<any>agent)._configuration.content.clientCredentialProfile[0].should.be.equal("SHARED_SECRET");
        (<any>agent)._storage.should.not.be.null;
    });
});