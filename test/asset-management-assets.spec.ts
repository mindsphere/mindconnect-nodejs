import * as chai from "chai";
import "url-search-params-polyfill";
import { AssetManagementClient, AssetManagementModels, MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth, throwError } from "../src/api/utils";
import { getPasskeyForUnitTest, sleep } from "./test-utils";
chai.should();

const timeOffset = new Date().getTime();

describe("[SDK] AssetManagementClient.Assets", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });
    const am = sdk.GetAssetManagementClient();
    const tenant = sdk.GetTenant();
    let falconAassetId = "";

    const testAsset: AssetManagementModels.Asset = {
        name: "MilleniumFalcon",
        externalId: "SN 123456-123-123456",
        description: "The ship of Han Solo and Chewbacca",
        location: {
            country: "Austria",
            region: "Tyrol",
            locality: "Innsbruck",
            streetAddress: "Industriestraße 21 A/II",
            postalCode: "6020",
            longitude: 53.5125546,
            latitude: 9.9763411,
        },
        variables: [],
        aspects: [],
        fileAssignments: [],
        typeId: `core.basicsite`,

        timezone: "Europe/Berlin",
        twinType: AssetManagementModels.TwinType.Performance,
    };

    before(async () => {
        await deleteAssets(am);
        testAsset.parentId = (await am.GetRootAsset()).assetId;
        testAsset.name = `Falcon_${timeOffset}_A`;
        const result = await am.PostAsset(testAsset);
        falconAassetId = `${result.assetId}`;
        testAsset.name = `Falcon_${timeOffset}_B`;
        await am.PostAsset(testAsset);
        testAsset.name = `Falcon_${timeOffset}_C`;
        await am.PostAsset(testAsset);
    });
    after(async () => {
        await deleteAssets(am);
    });

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
    });

    it("standard properties shoud be defined", async () => {
        am.should.not.be.undefined;
        am.GetGateway().should.be.equal(auth.gateway);
        (await am.GetToken()).length.should.be.greaterThan(200);
        (await am.GetToken()).length.should.be.greaterThan(200);
    });

    it("should GET asset(s)", async () => {
        am.should.not.be.undefined;
        const assets = await am.GetAssets();
        assets.should.not.be.undefined;
        assets.should.not.be.null;
        (assets as any).page.number.should.equal(0);
        (assets as any).page.size.should.equal(10);
        (assets as any)._embedded.assets.length.should.be.greaterThan(0);
    });

    it("should GET asset(s) with filter", async () => {
        am.should.not.be.undefined;
        const assets = await am.GetAssets({
            filter: JSON.stringify({
                typeId: {
                    startsWith: `${tenant}`,
                },
            }),
        });
        assets.should.not.be.undefined;
        assets.should.not.be.null;
        assets._embedded || throwError("there have to be some aspecttypes with that filter!");
        (assets as any)._embedded.assets.length.should.be.greaterThan(0);
    });

    it("should GET asset(s) with sorting", async () => {
        am.should.not.be.undefined;
        const assets = await am.GetAssets({
            filter: JSON.stringify({
                and: {
                    deleted: null,
                    name: {
                        startsWith: `Falcon_${timeOffset}`,
                    },
                },
            }),
            sort: "ASC",
            page: 0,
            size: 0,
        });
        assets.should.not.be.undefined;
        assets.should.not.be.null;

        assets._embedded || throwError("there have to be some assets with that filter!");
        (assets as any)._embedded.assets.length.should.be.greaterThan(0);
    });

    it("should GET specific asset ", async () => {
        am.should.not.be.undefined;

        const asset = await am.GetAsset(falconAassetId);
        asset.should.not.be.undefined;
    });

    it("should POST specific asset ", async () => {
        am.should.not.be.undefined;
        testAsset.name = `Falcon_${timeOffset}_D`;
        const asset = await am.PostAsset(testAsset);
        asset.should.not.be.null;

        await am.DeleteAsset(`${asset.assetId}`, { ifMatch: `${asset.etag}` });
    });

    it("should PATCH specific asset ", async () => {
        am.should.not.be.undefined;
        testAsset.name = `FalconE`;
        const asset = await am.PostAsset(testAsset);

        asset.externalId = "12354";
        const patchedAssetType = await am.PatchAsset(`${asset.assetId}`, asset, {
            ifMatch: `${asset.etag}`,
        });
        patchedAssetType.should.not.be.null;
        (patchedAssetType as any).externalId.should.be.equal("12354");

        asset.should.not.be.null;
        await am.DeleteAsset(`${asset.assetId}`, { ifMatch: `${patchedAssetType.etag}` });
    });

    it("should DELETE specific asset ", async () => {
        am.should.not.be.undefined;
        testAsset.name = `Falcon_${timeOffset}_F`;
        const asset = await am.PostAsset(testAsset);
        await am.DeleteAsset(`${asset.assetId}`, { ifMatch: `${asset.etag}` });
    });

    it("should throw error on Put File assignment ", async () => {
        am.should.not.be.undefined;
        const asset = await am.GetAsset(falconAassetId);
        try {
            await am.PutAssetFileAssignment(
                `${asset.assetId}`,
                "Keyword",
                {
                    fileId: "abcd",
                },
                { ifMatch: `${asset.etag}` }
            );
        } catch (err) {
            err.message.should.contain("abcd");
        }
    });

    it("should throw error on Delete File assignment ", async () => {
        am.should.not.be.undefined;
        const asset = await am.GetAsset(falconAassetId);
        try {
            await am.DeleteAssetFileAssignment(`${asset.assetId}`, "xyz", { ifMatch: `${asset.etag}` });
        } catch (err) {
            err.message.should.contain("xyz");
        }
    });

    it("should GET root asset  ", async () => {
        am.should.not.be.undefined;
        const asset = await am.GetRootAsset();
        asset.should.not.be.undefined;
        `${asset.assetId}`.length.should.equal(32);
    });

    it("should GET aspects  ", async () => {
        am.should.not.be.undefined;
        const asset = await am.GetRootAsset();
        const aspects = await am.GetAspects(`${asset.assetId}`, { size: 2000 });
        (aspects as any)._embedded.aspects.length.should.be.greaterThan(0);
    });

    it("should GET Variables  ", async () => {
        am.should.not.be.undefined;
        const asset = await am.GetRootAsset();
        const variables = await am.GetVariables(`${asset.assetId}`, { size: 2000 });
        (variables as any)._embedded.variables.length.should.be.greaterThan(0);
    });

    it("should PUT LOCATION  ", async () => {
        am.should.not.be.undefined;
        const asset = await am.GetAsset(falconAassetId);
        const updatedAsset = await am.PutAssetLocation(
            falconAassetId,
            { country: "Bosnia", locality: "Sarajevo", streetAddress: "Ferhadija 1" },
            { ifMatch: `${asset.etag}` }
        );

        (updatedAsset as any).location.country.should.be.equal("Bosnia");
        (updatedAsset as any).location.locality.should.be.equal("Sarajevo");
        (updatedAsset as any).location.streetAddress.should.be.equal("Ferhadija 1");
    });
});
async function deleteAssets(am: AssetManagementClient) {
    await sleep(2000);
    const assets = (await am.GetAssets({
        filter: JSON.stringify({
            and: {
                deleted: null,
                name: {
                    startsWith: `Falcon_${timeOffset}`,
                },
            },
        }),
        sort: "DESC",
        page: 0,
        size: 0,
    })) as any;
    await sleep(2000);
    for (const x of assets._embedded.assets) {
        await am.DeleteAsset(x.assetId, { ifMatch: x.etag });
    }
}
