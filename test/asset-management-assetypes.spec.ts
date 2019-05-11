import * as chai from "chai";
import "url-search-params-polyfill";
import { AssetManagementClient, AssetManagementModels, MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth, throwError } from "../src/api/utils";
import { sleep } from "./test-utils";
chai.should();

describe("[SDK] AssetManagementClient.AssetTypes", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        basicAuth: decrypt(auth, "passkey.4.unit.test"),
        tenant: auth.tenant,
        gateway: auth.gateway
    });
    const am = sdk.GetAssetManagementClient();
    const tenant = sdk.GetTenant();

    const testAssetType = {
        name: `SpaceShip`,
        description: "Hyperspace jump capable space ship",
        parentTypeId: `core.basicdevice`,
        instantiable: true,
        scope: AssetManagementModels.AssetTypeBase.ScopeEnum.Private,
        aspects: [],
        variables: [
            {
                name: "temperature",
                dataType: AssetManagementModels.VariableDefinition.DataTypeEnum.STRING,
                unit: "C/F",
                searchable: true,
                length: 5,
                defaultValue: "25/77"
            }
        ],
        fileAssignments: []
    };

    before(async () => {
        await deleteAssetTypes(am, tenant);
        testAssetType.name = "SpaceShipTypeA";
        await am.PutAssetType(`${tenant}.SpaceShipTypeA`, testAssetType);
        testAssetType.name = "SpaceShipTypeB";
        await am.PutAssetType(`${tenant}.SpaceShipTypeB`, testAssetType);
        testAssetType.name = "SpaceShipTypeC";
        await am.PutAssetType(`${tenant}.SpaceShipTypeC`, testAssetType);
    });
    after(async () => {
        await deleteAssetTypes(am, tenant);
    });

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
    });

    it("standard properties shoud be defined", async () => {
        am.should.not.be.undefined;
        am.GetGateway().should.be.equal(auth.gateway);
        (await am.GetToken()).length.should.be.greaterThan(200);
        (await am.GetServiceToken()).length.should.be.greaterThan(200);
    });

    it("should GET asset types", async () => {
        am.should.not.be.undefined;
        const assetTypes = await am.GetAssetTypes();
        assetTypes.should.not.be.undefined;
        assetTypes.should.not.be.null;
        (assetTypes as any).page.number.should.equal(0);
        (assetTypes as any).page.size.should.equal(10);
        (assetTypes as any)._embedded.assetTypes.length.should.be.greaterThan(0);
    });

    it("should GET asset types with filter", async () => {
        am.should.not.be.undefined;
        const assetTypes = await am.GetAssetTypes({
            filter: JSON.stringify({
                id: {
                    startsWith: `${tenant}`
                }
            })
        });
        assetTypes.should.not.be.undefined;
        assetTypes.should.not.be.null;
        assetTypes._embedded || throwError("there have to be some aspecttypes with that filter!");
        (assetTypes as any)._embedded.assetTypes.length.should.be.greaterThan(0);
    });

    it("should GET asset types with sorting", async () => {
        am.should.not.be.undefined;
        const assetTypes = await am.GetAssetTypes({
            filter: JSON.stringify({
                and: {
                    id: {
                        startsWith: `${tenant}`
                    },
                    name: {
                        startsWith: "SpaceShipType"
                    }
                }
            }),
            sort: "DESC",
            page: 0,
            size: 0
        });
        assetTypes.should.not.be.undefined;
        assetTypes.should.not.be.null;
        assetTypes._embedded || throwError("there have to be some aspecttypes with that filter!");
        (assetTypes as any)._embedded.assetTypes.length.should.be.equal(3);
        (assetTypes as any)._embedded.assetTypes[0].variables.length.should.be.equal(1);
    });

    it("should GET exploded asset types", async () => {
        am.should.not.be.undefined;
        const assetTypes = await am.GetAssetTypes({
            filter: JSON.stringify({
                and: {
                    id: {
                        startsWith: `${tenant}`
                    },
                    name: {
                        startsWith: "SpaceShipType"
                    }
                }
            }),
            exploded: true
        });
        assetTypes.should.not.be.undefined;
        assetTypes.should.not.be.null;
        assetTypes._embedded || throwError("there have to be some aspecttypes with that filter!");
        (assetTypes as any)._embedded.assetTypes.length.should.be.equal(3);
        (assetTypes as any)._embedded.assetTypes[0].variables.length.should.be.equal(3);
    });

    it("should GET specific asset type ", async () => {
        am.should.not.be.undefined;
        const assetType = await am.GetAssetType(`${tenant}.SpaceShipTypeA`);
        (assetType as any).variables.length.should.equal(1);

        const explodedFalse = await am.GetAssetType(`${tenant}.SpaceShipTypeA`, { exploded: false });
        (explodedFalse as any).variables.length.should.equal(1);

        const explodedAssetType = await am.GetAssetType(`${tenant}.SpaceShipTypeA`, { exploded: true });
        (explodedAssetType as any).variables.length.should.equal(3);
        assetType.should.not.be.null;
    });

    it("should PUT specific asset type ", async () => {
        am.should.not.be.undefined;
        testAssetType.name = `SpaceShipTypeD`;
        const assetType = await am.PutAssetType(`${tenant}.SpaceShipTypeD`, testAssetType);
        assetType.should.not.be.null;
        await am.DeleteAssetType(`${tenant}.SpaceShipTypeD`, { ifMatch: `${assetType.etag}` });
    });

    it("should PATCH specific asset type ", async () => {
        am.should.not.be.undefined;
        testAssetType.name = `SpaceShipTypeD`;
        const assetType = await am.PutAssetType(`${tenant}.SpaceShipTypeD`, testAssetType);

        assetType.variables = assetType.variables || new Array<AssetManagementModels.VariableDefinitionResource>();

        assetType.variables.push({
            dataType: AssetManagementModels.VariableDefinition.DataTypeEnum.BOOLEAN,
            name: "test"
        });

        const patchedAssetType = await am.PatchAssetType(`${tenant}.SpaceShipTypeD`, assetType, {
            ifMatch: `${assetType.etag}`
        });

        patchedAssetType.should.not.be.null;
        (patchedAssetType as any).variables.length.should.be.equal(2);
        assetType.should.not.be.null;
        await am.DeleteAssetType(`${tenant}.SpaceShipTypeD`, { ifMatch: `${patchedAssetType.etag}` });
    });

    it("should DELETE specific asset type ", async () => {
        am.should.not.be.undefined;
        testAssetType.name = `SpaceShipTypeF`;
        const assetType = await am.PutAssetType(`${tenant}.SpaceShipTypeF`, testAssetType);
        await am.DeleteAssetType(`${tenant}.SpaceShipTypeF`, { ifMatch: `${assetType.etag}` });
    });

    it("should throw error on Put File assignment ", async () => {
        am.should.not.be.undefined;
        const assetType = await am.GetAssetType(`${tenant}.SpaceShipTypeA`);

        try {
            await am.PutAssetTypeFileAssignment(
                `${assetType.id}`,
                "Keyword",
                {
                    fileId: "abcd"
                },
                { ifMatch: `${assetType.etag}` }
            );
        } catch (err) {
            err.message.should.contain("abcd");
        }
    });

    it("should throw error on Delete File assignment ", async () => {
        am.should.not.be.undefined;
        const assetType = await am.GetAssetType(`${tenant}.SpaceShipTypeA`);

        try {
            await am.DeleteAssetTypeFileAssignment(`${assetType.id}`, "xyz", { ifMatch: "0" });
        } catch (err) {
            err.message.should.contain("xyz");
        }
    });
});

async function deleteAssetTypes(am: AssetManagementClient, tenant: string) {
    await sleep(2000);
    const assetTypes = (await am.GetAssetTypes({
        filter: JSON.stringify({
            and: {
                id: {
                    startsWith: `${tenant}`
                },
                name: {
                    startsWith: "SpaceShipType"
                }
            }
        }),
        sort: "DESC",
        page: 0,
        size: 0
    })) as any;
    for (const x of assetTypes._embedded.assetTypes) {
        await am.DeleteAssetType(x.id, { ifMatch: x.etag });
    }
}
