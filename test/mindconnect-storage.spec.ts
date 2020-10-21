// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import "url-search-params-polyfill";
import { DefaultStorage, IMindConnectConfiguration, retry } from "../src";
import { mochaAsync } from "./test-utils";
const rimraf = require("rimraf");

import _ = require("lodash");
chai.should();

describe("Default Storage", () => {
    const rsaConfig: IMindConnectConfiguration = require("./testconfig.json");

    process.env.DEBUG = "mindconnect-storage";

    it(
        "should instantiate. @s4f",
        mochaAsync(async () => {
            const storage = new DefaultStorage("./.mochatest/");
            storage.should.not.be.null;
            rimraf.sync("./.mochatest/");
        })
    );

    it(
        "should be able to read configuration @s4f",
        mochaAsync(async () => {
            const storage = new DefaultStorage("./.mochatest/");
            const config = await storage.GetConfig(rsaConfig);
            config.should.not.be.null;
            _.isEqual(rsaConfig, config).should.be.true;
            rimraf.sync("./.mochatest/");
        })
    );

    it(
        "should be able to save configuration @s4f",
        mochaAsync(async () => {
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
        })
    );

    it(
        "should be able to revert configuration if content changes @s4f",
        mochaAsync(async () => {
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
            delete rsaConfig.urls;

            const revertedConfig = await storage.GetConfig(rsaConfig);

            (revertedConfig.urls === undefined).should.be.true;
            rimraf.sync("./.mochatest/");
        })
    );

    it(
        "should be able to syncronize the locks @s4f",
        mochaAsync(async () => {
            const storage = new DefaultStorage("./.mochatest/");
            rsaConfig.urls = ["TEST"];

            const promises = [];

            (<any>rsaConfig).indexes = [];

            for (let index = 0; index < 25; index++) {
                (<any>rsaConfig).indexes.push(index);
                promises.push(await retry(5, () => storage.SaveConfig(rsaConfig)));
            }

            await Promise.all(promises);

            const newConfig = storage.GetConfig(rsaConfig);
            for (let index = 0; index < (<any>newConfig).indexes.length; index++) {
                const element = (<any>rsaConfig).indexes[index];
                index.should.be.equal(element);
            }

            rimraf.sync("./.mochatest/");
        })
    );
});
