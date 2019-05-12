import * as chai from "chai";
import "url-search-params-polyfill";
import { AssetManagementClient, AssetManagementModels, MindSphereSdk } from "../src/api/sdk";
import { decrypt, throwError, loadAuth } from "../src/api/utils";
import { sleep } from "./test-utils";
chai.should();

describe("[SDK] AssetManagementClient.AspectTypes", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        basicAuth: decrypt(auth, "passkey.4.unit.test"),
        tenant: auth.tenant,
        gateway: auth.gateway
    });
    const am = sdk.GetAssetManagementClient();
    const tenant = sdk.GetTenant();

    const testAspectType = {
        name: "UnitTestEngine",
        category: AssetManagementModels.AspectResource.CategoryEnum.Static,
        scope: AssetManagementModels.AspectType.ScopeEnum.Private,
        description: "The engine of the Millenium Falcon",
        variables: [
            {
                name: "temperature",
                dataType: AssetManagementModels.VariableDefinition.DataTypeEnum.STRING,
                unit: "C/F",
                searchable: true,
                length: 5,
                defaultValue: "25/77",
                qualityCode: true
            }
        ]
    };

    before(async () => {
        await sleep(2000);
        await deleteAspectTypes(am, tenant);
        testAspectType.name = "UnitTestEngineA";
        await am.PutAspectType(`${tenant}.UnitTestEngineA`, testAspectType);
        testAspectType.name = "UnitTestEngineB";
        await am.PutAspectType(`${tenant}.UnitTestEngineB`, testAspectType);
        testAspectType.name = "UnitTestEngineC";
        await am.PutAspectType(`${tenant}.UnitTestEngineC`, testAspectType);
    });
    after(async () => {
        await sleep(2000);
        await deleteAspectTypes(am, tenant);
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

    it("should GET aspecttypes", async () => {
        am.should.not.be.undefined;
        const aspectTypes = await am.GetAspectTypes();
        aspectTypes.should.not.be.undefined;
        aspectTypes.should.not.be.null;
        (aspectTypes as any).page.number.should.equal(0);
        (aspectTypes as any).page.size.should.equal(10);
        (aspectTypes as any)._embedded.aspectTypes.length.should.be.equal(10);
    });

    it("should GET aspecttypes with filter", async () => {
        am.should.not.be.undefined;
        const aspectTypes = await am.GetAspectTypes({
            filter: JSON.stringify({
                id: {
                    startsWith: `${tenant}`
                }
            })
        });

        aspectTypes.should.not.be.undefined;
        aspectTypes.should.not.be.null;
        aspectTypes._embedded || throwError("there have to be some aspecttypes with that filter!");
        (aspectTypes as any)._embedded.aspectTypes.length.should.be.equal(10);
    });

    it("should GET aspecttypes with sorting", async () => {
        am.should.not.be.undefined;
        const aspectTypes = await am.GetAspectTypes({
            filter: JSON.stringify({
                and: {
                    id: {
                        startsWith: `${tenant}`
                    },
                    name: {
                        startsWith: "UnitTestEngine"
                    }
                }
            }),
            sort: "DESC",
            page: 0,
            size: 0
        });

        aspectTypes.should.not.be.undefined;
        aspectTypes.should.not.be.null;
        aspectTypes._embedded || throwError("there have to be some aspecttypes with that filter!");
        (aspectTypes as any)._embedded.aspectTypes.length.should.be.equal(3);
    });

    it("should GET specific aspect type ", async () => {
        am.should.not.be.undefined;
        const aspectType = await am.GetAspectType(`${tenant}.UnitTestEngineA`);

        aspectType.should.not.be.null;
    });

    it("should PUT specific aspect type ", async () => {
        am.should.not.be.undefined;
        testAspectType.name = `UnitTestEngineD`;
        const aspectType = await am.PutAspectType(`${tenant}.UnitTestEngineD`, testAspectType);

        aspectType.should.not.be.null;
        await am.DeleteAspectType(`${tenant}.UnitTestEngineD`, { ifMatch: `${aspectType.etag}` });
    });

    it("should PATCH specific aspect type ", async () => {
        am.should.not.be.undefined;
        testAspectType.name = `UnitTestEngineD`;
        const aspectType = await am.PutAspectType(`${tenant}.UnitTestEngineD`, testAspectType);
        aspectType.variables.push({
            dataType: AssetManagementModels.VariableDefinition.DataTypeEnum.BOOLEAN,
            name: "test"
        });

        const patchedAspectType = await am.PatchAspectType(`${tenant}.UnitTestEngineD`, aspectType, {
            ifMatch: `${aspectType.etag}`
        });
        patchedAspectType.should.not.be.null;
        patchedAspectType.variables.length.should.be.equal(2);
        await am.DeleteAspectType(`${tenant}.UnitTestEngineD`, { ifMatch: `${patchedAspectType.etag}` });
    });

    it("should DELETE specific aspect type ", async () => {
        am.should.not.be.undefined;
        testAspectType.name = `UnitTestEngineE`;
        const aspectType = await am.PutAspectType(`${tenant}.UnitTestEngineE`, testAspectType);
        await am.DeleteAspectType(`${tenant}.UnitTestEngineE`, { ifMatch: `${aspectType.etag}` });
    });
});
async function deleteAspectTypes(am: AssetManagementClient, tenant: string) {
    const aspectTypes = (await am.GetAspectTypes({
        filter: JSON.stringify({
            and: {
                id: {
                    startsWith: `${tenant}`
                },
                name: {
                    startsWith: "UnitTestEngine"
                }
            }
        }),
        sort: "DESC",
        page: 0,
        size: 0
    })) as any;
    for (const x of aspectTypes._embedded.aspectTypes) {
        await am.DeleteAspectType(x.id, { ifMatch: x.etag });
    }
}
