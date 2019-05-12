import * as chai from "chai";
import "url-search-params-polyfill";
import { AssetManagementClient, AssetManagementModels, MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth, retry } from "../src/api/utils";
import { sleep } from "./test-utils";
chai.should();

describe("[SDK] AssetManagementClient.Files", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        basicAuth: decrypt(auth, "passkey.4.unit.test"),
        tenant: auth.tenant,
        gateway: auth.gateway
    });
    const am = sdk.GetAssetManagementClient();

    before(async () => {
        await deleteFiles(am);
    });

    after(async () => {
        await deleteFiles(am);
    });

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
    });

    it("should be able to POST AND GET file", async () => {
        const result = await am.PostFile(Buffer.from("xyz"), "xyz.text", {
            mimeType: "text/plain",
            description: "Blubb2"
        });
        const files = await am.GetFiles({ filter: JSON.stringify({ name: "xyz.text" }) });
        (files._embedded as any).files.length.should.equal(1);

        await am.DeleteFile(`${result.id}`, { ifMatch: `${result.etag}` });
    });

    it("should be able to Download file", async () => {
        const result = await am.PostFile(Buffer.from("xyz"), "xyz.text", {
            mimeType: "text/plain",
            description: "Blubb2"
        });
        // ! the behavior here is asynchronous...
        const file = (await retry(5, () => am.DownloadFile(`${result.id}`))) as Response;
        const text = await file.text();
        text.should.be.equal("xyz");

        await am.DeleteFile(`${result.id}`, { ifMatch: `${result.etag}` });
    });

    it("should be able to DELETE file", async () => {
        const result = await am.PostFile(Buffer.from("abc"), "abc.text", {
            mimeType: "text/plain",
            description: "Blubb2"
        });
        await am.DeleteFile(`${result.id}`, { ifMatch: `${result.etag}` });
    });

    it("should be able to PUT file", async () => {
        const result = await am.PostFile(Buffer.from("abc"), "test2.txt", {
            mimeType: "text/plain",
            description: "Blubb2"
        });

        const updatedFile = await am.PutFile(`${result.id}`, Buffer.from("abcabc"), "test2.txt", {
            scope: AssetManagementModels.FileMetadataResource.ScopeEnum.PRIVATE,
            description: result.description,
            ifMatch: `${result.etag}`
        });

        await am.DeleteFile(`${result.id}`, { ifMatch: `${updatedFile.etag}` });
    });

    it("should be able to Get Billboard", async () => {
        const billboard = await am.GetBillboard();
        billboard.should.not.be.undefined;
    });
});
async function deleteFiles(am: AssetManagementClient) {
    await sleep(2000);
    const files = (await am.GetFiles({
        filter: JSON.stringify({
            and: {
                name: {
                    endsWith: ".text"
                }
            }
        }),
        sort: "DESC",
        page: 0,
        size: 0
    })) as any;
    for (const x of files._embedded.files) {
        await am.DeleteFile(x.id, { ifMatch: x.etag });
    }
}
