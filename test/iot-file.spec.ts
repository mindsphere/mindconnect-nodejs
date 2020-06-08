import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth, retry } from "../src/api/utils";
import { sleep } from "./test-utils";
chai.should();

const timeOffset = new Date().getTime();

describe("[SDK] IotFileClient", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, "passkey.4.unit.test"),
    });
    const iotFile = sdk.GetIoTFileClient();
    let rootId = "";

    before(async () => {
        const root = await sdk.GetAssetManagementClient().GetRootAsset();
        rootId = `${root.assetId}`;
        await deleteFiles();
    });

    after(async () => {
        await deleteFiles();
    });

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
        iotFile.should.not.be.undefined;
    });

    it("should be able to PUT AND GET file", async () => {
        await retry(5, () =>
            iotFile.PutFile(rootId, `unit/test/xyz${timeOffset}.txt`, Buffer.from("xyz"), {
                description: "blubb",
                type: "text/plain",
            })
        );
        const file = await retry(5, () => iotFile.GetFile(rootId, `unit/test/xyz${timeOffset}.txt`));
        const text = await file.text();
        text.should.be.equal("xyz");
    });

    it("should be able to upload 8 mb 1byte large file", async () => {
        const checksum = await iotFile.UploadFile(
            rootId,
            `unit/test/xyz${timeOffset}_8xmb.txt`,
            Buffer.alloc(8 * 1024 * 1024 + 1),
            {
                chunk: true,
                retry: 5,
            }
        );

        checksum.should.be.equal("cba5242e77abe5709a262350cf64d835");
    });

    it("should be able to upload 16.25 mb 1byte large file", async () => {
        if (!process.env.CI) return;

        const checksum = await iotFile.UploadFile(
            rootId,
            `unit/test/xyz${timeOffset}_1625mb.txt`,
            Buffer.alloc(16.25 * 1024 * 1024),
            {
                chunk: true,
                retry: 5,
            }
        );

        checksum.should.be.equal("84c8648b8aa9b803ff92515a63aa4580");
    });

    it("should be able to upload 1 byte large file", async () => {
        const checksum = await iotFile.UploadFile(rootId, `unit/test/xyz${timeOffset}_1by.txt`, Buffer.alloc(1), {
            chunk: true,
            retry: 5,
        });

        checksum.should.be.equal("93b885adfe0da089cdf634904fd59f71");
    });

    it("should be able to upload 0 byte large file", async () => {
        const checksum = await iotFile.UploadFile(rootId, `unit/test/xyz${timeOffset}_0by.txt`, Buffer.alloc(0), {
            chunk: true,
            retry: 5,
        });

        checksum.should.be.equal("d41d8cd98f00b204e9800998ecf8427e");
    });

    async function deleteFiles() {
        await sleep(2000);
        const files = await iotFile.GetFiles(rootId, {
            filter: `name eq xyz${timeOffset}*.txt and path eq unit/test/`,
        });

        for (const file of files) {
            await iotFile.DeleteFile(rootId, `${file.path}${file.name}`);
        }
    }
});
