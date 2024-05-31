import { expect } from "chai";
import { it } from "mocha";
import { removeTrailingSlash } from "../src/api/utils";

describe("[UTILS] Path normalization", () => {
    it("should normalize paths", () => {
        const testurl =
            "https://gateway.{region}.{mindsphere-domain}/api/iottsaggregates/v3/aggregates/{assetId}/{aspectName}/";

        const result = removeTrailingSlash(testurl);
        expect(result).to.equal(
            "https://gateway.{region}.{mindsphere-domain}/api/iottsaggregates/v3/aggregates/{assetId}/{aspectName}"
        );

        const testurl2 =
            "https://{tenantName}-assetmanagement.{region}.{mindsphere-domain}/api/assetmanagement/v3/assets/{id}/?includeShared=true";

        const result2 = removeTrailingSlash(testurl2);
        expect(result2).to.equal(
            "https://{tenantName}-assetmanagement.{region}.{mindsphere-domain}/api/assetmanagement/v3/assets/{id}?includeShared=true"
        );

        expect(removeTrailingSlash("https://www.test.test")).to.equal("https://www.test.test");
        expect(removeTrailingSlash("https://www.test.test///")).to.equal("https://www.test.test");
        expect(removeTrailingSlash("https://www.test.test/?abc=123")).to.equal("https://www.test.test?abc=123");

        expect(removeTrailingSlash("https://www.test.test/1/2/3/4/5/6/7/8/?9")).to.equal(
            "https://www.test.test/1/2/3/4/5/6/7/8?9"
        );
    });
});
