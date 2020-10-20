import * as chai from "chai";
import "url-search-params-polyfill";
import { loadAuth, upgradeOldConfiguration } from "../src/api/utils";

chai.should();

describe("[SDK] TokenManager Auth", () => {
    const auth = loadAuth();

    it("should update old service credentials configuration @sanity", () => {
        const oldConfig = {
            auth: "test",
            gateway: "test",
            iv: "test",
            tenant: "test",
        };

        const newConfig = upgradeOldConfiguration(oldConfig);
        newConfig.should.exist;
        newConfig.credentials.should.exist;
        newConfig.credentials.length.should.equal(1);
        newConfig.credentials[0].should.exist;
        newConfig.credentials[0].selected.should.equal(true);
        newConfig.credentials[0].type.should.equal("SERVICE");
    });
});
