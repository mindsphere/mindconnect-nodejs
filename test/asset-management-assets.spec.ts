import * as chai from "chai";
import "url-search-params-polyfill";
import { AssetManagementModels, MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth, throwError } from "../src/api/utils";
import { sleep } from "./test-utils";
chai.should();

describe("[SDK] AssetManagementClient.Assets", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        basicAuth: decrypt(auth, "passkey.4.unit.test"),
        tenant: auth.tenant,
        gateway: auth.gateway
    });
    const am = sdk.GetAssetManagementClient();
    const tenant = sdk.GetTenant();

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
            latitude: 9.9763411
        },
        variables: [],
        aspects: [],
        fileAssignments: [],
        typeId: `core.basicsite`,

        timezone: "Europe/Berlin",
        twinType: AssetManagementModels.TwinType.Performance
    };

    before(async () => {
        testAsset.parentId = (await am.GetRootAsset()).assetId;
        testAsset.name = "FalconA";
        await am.PostAsset(testAsset);
        testAsset.name = "FalconB";
        await am.PostAsset(testAsset);
        testAsset.name = "FalconC";
        await am.PostAsset(testAsset);
    });
    after(async () => {
        // await sleep(2000);

        const assets = (await am.GetAssets({
            filter: JSON.stringify({
                and: {
                    deleted: null,
                    name: {
                        startsWith: "Falcon"
                    }
                }
            }),
            sort: "DESC",
            page: 0,
            size: 0
        })) as any;

        await sleep(2000);

        for (const x of assets._embedded.assets) {
            await am.DeleteAsset(x.assetId, { ifMatch: x.etag });
        }
    });

    it.only("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
    });

    it.only("standard properties shoud be defined", async () => {
        am.should.not.be.undefined;
        am.GetGateway().should.be.equal(auth.gateway);
        (await am.GetToken()).length.should.be.greaterThan(200);
        (await am.GetServiceToken()).length.should.be.greaterThan(200);
    });

    it.only("should GET asset(s)", async () => {
        am.should.not.be.undefined;
        const assets = await am.GetAssets();
        assets.should.not.be.undefined;
        assets.should.not.be.null;
        (assets as any).page.number.should.equal(0);
        (assets as any).page.size.should.equal(10);
        (assets as any)._embedded.assets.length.should.be.greaterThan(0);
    });

    it.only("should GET asset(s) with filter", async () => {
        am.should.not.be.undefined;
        const assets = await am.GetAssets({
            filter: JSON.stringify({
                typeId: {
                    startsWith: `${tenant}`
                }
            })
        });
        assets.should.not.be.undefined;
        assets.should.not.be.null;
        assets._embedded || throwError("there have to be some aspecttypes with that filter!");
        (assets as any)._embedded.assets.length.should.be.greaterThan(0);
    });

    it.only("should GET asset(s) with sorting", async () => {
        am.should.not.be.undefined;
        const assets = await am.GetAssets({
            filter: JSON.stringify({
                and: {
                    deleted: null,
                    name: {
                        startsWith: "Falcon"
                    }
                }
            }),
            sort: "DESC",
            page: 0,
            size: 0
        });
        assets.should.not.be.undefined;
        assets.should.not.be.null;

        assets._embedded || throwError("there have to be some assets with that filter!");
        (assets as any)._embedded.assets.length.should.be.equal(3);
    });

    it("should GET specific asset ", async () => {
        am.should.not.be.undefined;
        const asset = await am.GetAsset(`${tenant}.FalconA`);
        asset.should.not.be.undefined;
    });

    it.only("should POST specific asset ", async () => {
        am.should.not.be.undefined;
        testAsset.name = `FalconD`;
        const asset = await am.PostAsset(testAsset);
        asset.should.not.be.null;

        await am.DeleteAsset(`${asset.assetId}`, { ifMatch: asset.etag as number });
    });

    it("should PATCH specific asset ", async () => {
        // am.should.not.be.undefined;
        // testAssetType.name = `SpaceShipTypeD`;
        // const asset = await am.PutAssetType(`${tenant}.SpaceShipTypeD`, testAssetType);
        // asset.variables = asset.variables || new Array<AssetManagementModels.VariableDefinitionResource>();
        // asset.variables.push({
        //     dataType: AssetManagementModels.VariableDefinition.DataTypeEnum.BOOLEAN,
        //     name: "test"
        // });
        // const patchedAssetType = await am.PatchAssetType(`${tenant}.SpaceShipTypeD`, asset, {
        //     ifMatch: asset.etag as number
        // });
        // patchedAssetType.should.not.be.null;
        // (patchedAssetType as any).variables.length.should.be.equal(2);
        // asset.should.not.be.null;
        // await am.DeleteAssetType(`${tenant}.SpaceShipTypeD`, { ifMatch: patchedAssetType.etag as number });
    });

    it("should DELETE specific asset ", async () => {
        // am.should.not.be.undefined;
        // testAssetType.name = `SpaceShipTypeF`;
        // const asset = await am.PutAssetType(`${tenant}.SpaceShipTypeF`, testAssetType);
        // await am.DeleteAssetType(`${tenant}.SpaceShipTypeF`, { ifMatch: asset.etag as number });
    });

    it("should throw error on Put File assignment ", async () => {
        // am.should.not.be.undefined;
        // const asset = await am.GetAssetType(`${tenant}.SpaceShipTypeA`);
        // try {
        //     await am.PutFileAssignment(
        //         `${asset.id}`,
        //         "Keyword",
        //         {
        //             fileId: "abcd"
        //         },
        //         { ifMatch: asset.etag as number }
        //     );
        // } catch (err) {
        //     err.message.should.contain("abcd");
        // }
    });

    it("should throw error on Delete File assignment ", async () => {
        // am.should.not.be.undefined;
        // const asset = await am.GetAssetType(`${tenant}.SpaceShipTypeA`);
        // try {
        //     await am.DeleteFileAssignment(`${asset.id}`, "xyz", { ifMatch: 0 });
        // } catch (err) {
        //     err.message.should.contain("xyz");
        // }
    });
});
