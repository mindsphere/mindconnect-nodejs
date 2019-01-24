// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import "url-search-params-polyfill";
import { DefaultStorage, IMindConnectConfiguration } from "../src";
import { mochaAsync } from "./test-utils";
const rimraf = require("rimraf");

import _ = require("lodash");
chai.should();

describe("Default Storage", () => {

    const rsaConfig: IMindConnectConfiguration = require("../agentconfig.rsa.json");

    process.env.DEBUG = "mindconnect-storage";

    it("should instantiate.", mochaAsync(async () => {
        const storage = new DefaultStorage("./.mochatest/");
        storage.should.not.be.null;
        rimraf.sync("./.mochatest/");
    }));


    it("should be able to read configuration", mochaAsync(async () => {
        const storage = new DefaultStorage("./.mochatest/");
        const config = await storage.GetConfig(rsaConfig);
        config.should.not.be.null;
        _.isEqual(rsaConfig, config).should.be.true;
        rimraf.sync("./.mochatest/");
    }));

    it("should be able to save configuration", mochaAsync(async () => {
        const storage = new DefaultStorage("./.mochatest/");
        rsaConfig.urls = ["TEST"];

        const config = await storage.SaveConfig(rsaConfig);
        config.should.not.be.null;
        _.isEqual(rsaConfig, config).should.be.true;
        (<any>config).urls.should.not.be.undefined;
        (<any>config).urls[0].should.equal("TEST");

        const newConfig = await storage.GetConfig(rsaConfig);
        _.isEqual(config, newConfig).should.be.true;
        (<any>newConfig).urls.should.not.be.undefined;
        (<any>newConfig).urls[0].should.equal("TEST");

        rimraf.sync("./.mochatest/");
    }));


    it("should be able to revert configuration if content changes", mochaAsync(async () => {
        const storage = new DefaultStorage("./.mochatest/");
        rsaConfig.urls = ["TEST"];

        const config = await storage.SaveConfig(rsaConfig);
        config.should.not.be.null;
        _.isEqual(rsaConfig, config).should.be.true;
        (<any>config).urls.should.not.be.undefined;
        (<any>config).urls[0].should.equal("TEST");

        const newConfig = await storage.GetConfig(rsaConfig);

        _.isEqual(config, newConfig).should.be.true;
        (<any>newConfig).urls.should.not.be.undefined;
        (<any>newConfig).urls[0].should.equal("TEST");

        rsaConfig.content.clientCredentialProfile = ["SHARED_SECRET"];
        delete (rsaConfig.urls);

        const revertedConfig = await storage.GetConfig(rsaConfig);

        (revertedConfig.urls === undefined).should.be.true;
        rimraf.sync("./.mochatest/");
    }));


    // it.only("should be able to save and retrieve configuration", mochaAsync(async () => {
    //     const storage = new DefaultStorage("./.mochatest/");

    //     const config = await storage.SaveConfig(rsaConfig);
    //     config.urls = ["TEST"];
    //     config.should.not.be.null;

    //     _.isEqual(rsaConfig, config).should.be.true;
    //     config.urls.should.not.be.undefined;
    //     (<any>config).urls[0].should.equal("TEST");

    //     const newConfig = await storage.GetConfiguration(rsaConfig);
    //     console.log(newConfig)
    //     _.isEqual(config, newConfig).should.be.true;
    //     (<any>newConfig).urls.should.not.be.undefined;
    //     (<any>newConfig).urls[0].should.equal("TEST");

    //     rimraf.sync("./.mochatest/");
    // }));




});