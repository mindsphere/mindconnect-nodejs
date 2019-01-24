// Copyright (C), Siemens AG 2017
import * as chai from "chai";
import * as debug from "debug";
import * as fs from "fs";
import { TextDecoder } from "text-encoding";
import { MindConnectRawTransform, MindConnectTransform } from "../src";

const log = debug("mindconnect");
chai.should();

describe("File Encoder Agent", () => {

    it("should be able to encode a small file properly using binary encoder", function (done) {

        try {
            // ignore test for version 6, this doesn't work in old node.
            if (process.version.toString().startsWith("v6")) {
                done();
                log("ignoring test v6 doesn't support upload like this");
                return;
            }
            log(process.version);

            const stats = fs.statSync("package.json");
            const chunkSize = 10 * 1024;
            const totalChunks = Math.ceil(stats.size / chunkSize);
            log(totalChunks);
            const mindConnectEncoder = new MindConnectRawTransform("package.json", new Date(), "text/plain", chunkSize, totalChunks);

            const in_stream = fs.createReadStream("package.json", { highWaterMark: chunkSize });
            const decoder = new TextDecoder();
            in_stream.pipe(mindConnectEncoder).on("data", (data: Uint8Array) => debug(decoder.decode(data)));
            done();
        } catch (err) {
            console.error(err);
            done(err);
        }
    });

    it("should be able to encode a small file properly using text encoder", function (done) {

        try {

            const stats = fs.statSync("package.json");
            const chunkSize = 10 * 1024;
            const totalChunks = Math.ceil(stats.size / chunkSize);
            log(totalChunks);
            const mindConnectEncoder = new MindConnectTransform("package.json", new Date(), "text/plain", chunkSize, "utf8", totalChunks);

            const in_stream = fs.createReadStream("package.json", { highWaterMark: chunkSize });
            const decoder = new TextDecoder();
            in_stream.pipe(mindConnectEncoder).on("data", (data: Uint8Array) => debug(decoder.decode(data)));
            done();
        } catch (err) {
            console.error(err);
            done(err);
        }
    });
});