import * as crypto from "crypto";
import * as debug from "debug";
import * as fs from "fs";
import * as path from "path";
import * as stream from "stream";
import { MindConnectBase } from "../../mindconnect-base";
import { IMindConnectConfiguration } from "../../mindconnect-models";
import { throwError } from "../../utils";
import _ = require("lodash");

const mime = require("mime-types");
const log = debug("multipart-uploader");

export type optionalParameters = {
    part?: number | undefined;
    timestamp?: Date | undefined;
    description?: string | undefined;
    type?: string | undefined;
    chunkSize?: number | undefined;
    retry?: number | undefined;
    chunk?: boolean | undefined;
};

type uploadChunkParameters = {
    description: string;
    chunks: number;
    totalChunks: number;
    fileType: string;
    timeStamp: Date;
    uploadPath: string;
    entityId: string;
    buffer: Uint8Array;
    ifmatch?: number;
};

/**
 * The multipart uploader handles the upload of the files to the mindsphere
 * This class is shared between the MindConnectAgent and the IotFileClient
 *
 * @export
 * @class MultipartUploader
 * @extends {MindConnectBase}
 */
export class MultipartUploader extends MindConnectBase {
    GetToken: () => Promise<string>;
    getConfiguration: (() => IMindConnectConfiguration) | undefined;
    gateway: () => string;
    private getTotalChunks(fileLength: number, chunkSize: number, optional: optionalParameters) {
        const totalChunks = Math.ceil(fileLength / chunkSize);
        !optional.chunk && totalChunks > 1 && throwError("File is too big.");
        optional.chunk && totalChunks > 1 && log("WARN: Chunking is experimental!");
        return totalChunks;
    }

    private getTimeStamp(optional: optionalParameters, file: string | Buffer) {
        return optional.timestamp || (file instanceof Buffer ? new Date() : fs.statSync(file).ctime);
    }

    private getFileType(optional: optionalParameters, file: string | Buffer) {
        return (
            optional.type ||
            (file instanceof Buffer ? "application/octet-stream" : `${mime.lookup(file)}` || "application/octet-stream")
        );
    }

    private getStreamFromFile(file: string | Buffer, chunksize: number) {
        return file instanceof Buffer
            ? (() => {
                  const bufferStream = new stream.PassThrough({ highWaterMark: chunksize });
                  for (let index = 0; index < file.length; ) {
                      const end = Math.min(index + chunksize, file.length);
                      bufferStream.write(file.slice(index, end));
                      index = end;
                  }
                  bufferStream.end();
                  return bufferStream;
              })()
            : fs.createReadStream(path.resolve(file), { highWaterMark: chunksize });
    }

    private addDataToBuffer(current: Uint8Array, data: Buffer) {
        const newLength = current.byteLength + data.byteLength;
        const newBuffer = new Uint8Array(newLength);
        newBuffer.set(current, 0);
        newBuffer.set(data, current.byteLength);
        current = newBuffer;
        return current;
    }

    private getBareUrl(url: string) {
        const parsedUrl = new URL(url);
        const bareUrl = url.replace(parsedUrl.search, "");
        return bareUrl;
    }

    private fix_iotFileUpload_3_2_0(result: string | boolean, previousEtag: number | undefined) {
        // ! guess etag for the upload
        // ! in may 2019 mindsphere was not returning eTags for multipart uploads in the header
        // ! but was still expecting them for the new upload
        // ! this fix guesses the new value of the eTag
        return typeof result === "boolean"
            ? previousEtag !== undefined
                ? (previousEtag + 1).toString()
                : "0"
            : result;
    }

    private setIfMatch(url: string, headers: any): number | undefined {
        let result;
        const bareUrl = this.getBareUrl(url);

        (!this.getConfiguration || headers["If-Match"] !== undefined) &&
            throwError("You have to set if-match if you are using this outside the MindConnectAgent");

        if (this.getConfiguration) {
            const config = this.getConfiguration() as any;
            if (config.urls && config.urls[bareUrl]) {
                const eTag = config.urls[bareUrl];
                const etagNumber = parseInt(eTag);
                result = etagNumber;
                (<any>headers)["If-Match"] = etagNumber;
            }
        }
        return result;
    }

    private addUrl(url: string, result: string) {
        if (!this.getConfiguration) return;

        const config = this.getConfiguration() as any;

        if (!config.urls) {
            config.urls = {};
        }

        const entry = this.getBareUrl(url);
        config.urls[entry] = result;
    }

    private async MultipartOperation({
        mode,
        entityId,
        uploadPath,
        ifmatch,
        description,
        fileType,
        timeStamp
    }: {
        mode: "start" | "complete" | "abort";
        entityId: string;
        description: string;
        fileType: string;
        uploadPath: string;
        timeStamp: Date;
        ifmatch?: number;
    }) {
        const url = `/api/iotfile/v3/files/${entityId}/${uploadPath}?upload=${mode}`;
        const token = await this.GetToken();

        const headers = {
            description: description,
            type: fileType,
            timestamp: timeStamp.toISOString()
        };

        ifmatch && ((headers as any)["If-Match"] = ifmatch);
        this.setIfMatch(url, headers);

        const result = await this.HttpAction({
            verb: "PUT",
            authorization: token,
            gateway: this.gateway(),
            baseUrl: url,
            octetStream: true,
            additionalHeaders: headers,
            noResponse: true,
            returnHeaders: true,
            body: Buffer.alloc(0)
        });
        return result;
    }

    private async UploadChunk({
        description,
        chunks,
        totalChunks,
        fileType,
        timeStamp,
        uploadPath,
        entityId,
        buffer,
        ifmatch
    }: uploadChunkParameters): Promise<boolean> {
        if (buffer.length <= 0) return false;

        const headers = {
            description: description,
            type: fileType,
            timestamp: timeStamp.toISOString()
        };

        ifmatch && ((headers as any)["If-Match"] = ifmatch);

        let part = totalChunks === 1 ? "" : `?part=${chunks}`;
        if (part === `?part=${totalChunks}`) {
            part = `?upload=complete`;
        }

        const url = `/api/iotfile/v3/files/${entityId}/${uploadPath}${part}`;
        const previousEtag = this.setIfMatch(`${this.gateway}${url}`, headers);

        const token = await this.GetToken();

        const result = await this.HttpAction({
            verb: "PUT",
            baseUrl: url,
            gateway: this.gateway(),
            authorization: token,
            body: buffer,
            octetStream: true,
            additionalHeaders: headers,
            noResponse: true,
            returnHeaders: true
        });

        // * only set the eTag after the upload is complete
        if (totalChunks > 1 && !url.endsWith(`upload=complete`)) {
            return true;
        }
        const newEtag = this.fix_iotFileUpload_3_2_0(!!result, previousEtag);
        this.addUrl(url, newEtag);
        return true;
    }

    public async UploadFile(
        entityId: string,
        filepath: string,
        file: string | Buffer,
        optional?: {
            part?: number;
            ifmatch?: number;
            timestamp?: Date;
            description?: string;
            type?: string;
            chunkSize?: number;
            retry?: number;
            chunk?: boolean;
            paralelUploads?: number;
        }
    ): Promise<string> {
        optional = optional || {};
        const chunkSize = optional.chunkSize || 8 * 1024 * 1024;
        optional.chunk &&
            chunkSize < 5 * 1024 * 1024 &&
            throwError("The chunk size must be at least 5 MB for multipart upload.");

        const fileLength = file instanceof Buffer ? file.length : fs.statSync(file).size;
        const totalChunks = this.getTotalChunks(fileLength, chunkSize, optional);

        const shortFileName = path.basename(filepath);
        const fileInfo = {
            description: optional.description || shortFileName,
            timeStamp: this.getTimeStamp(optional, file),
            fileType: this.getFileType(optional, file),
            uploadPath: filepath,
            totalChunks: totalChunks,
            entityId: entityId
        };

        optional.ifmatch && ((fileInfo as any)["If-Match"] = optional.ifmatch);

        const mystream = this.getStreamFromFile(file, chunkSize);
        const hash = crypto.createHash("md5");
        const promises: any[] = [];

        let current = new Uint8Array(0);
        let chunks = 0;

        // console.log(totalChunks);
        optional.chunk &&
            totalChunks > 1 &&
            (await this.MultipartOperation({
                mode: "start",
                ...fileInfo
            }));

        return new Promise((resolve, reject) => {
            mystream
                .on("error", err => reject(err))
                .on("data", async (data: Buffer) => {
                    if (current.byteLength + data.byteLength < chunkSize) {
                        current = this.addDataToBuffer(current, data);
                    } else {
                        if (current.byteLength > 0) {
                            const currentBuffer = Buffer.from(current);
                            promises.push(() =>
                                this.UploadChunk({
                                    ...fileInfo,
                                    chunks: ++chunks,
                                    buffer: currentBuffer
                                })
                            );
                        }
                        current = new Uint8Array(data.byteLength);
                        current.set(data, 0);
                    }
                })
                .on("end", () => {
                    const currentBuffer = Buffer.from(current);
                    promises.push(() =>
                        this.UploadChunk({
                            ...fileInfo,
                            chunks: ++chunks,
                            buffer: currentBuffer
                        })
                    );
                })
                .pipe(hash)
                .once("finish", async () => {
                    try {
                        // * this is the last promise (for multipart) the one which completes the upload
                        // * this has to be awaited last.
                        const lastPromise = promises.pop();

                        // * the chunks before last can be uploaded in paralell to mindsphere
                        const maxParalellUploads = (optional && optional.paralelUploads) || 25;
                        const splitedPromises = _.chunk(promises, maxParalellUploads);

                        for (const partPromises of splitedPromises) {
                            const uploadParts: any = [];
                            partPromises.forEach(async f => {
                                uploadParts.push(f());
                            });

                            await Promise.all(uploadParts);
                        }
                        // * for non-multipart-upload this is the only promise which is ever resolved
                        await lastPromise();
                        resolve(hash.read().toString("hex"));
                    } catch (err) {
                        reject(new Error("upload failed" + err));
                    }
                });
        });
    }

    constructor({
        getToken,
        getConfiguration,
        gateway
    }: {
        getToken: () => Promise<string>;
        getConfiguration?: () => IMindConnectConfiguration;
        gateway: () => string;
    }) {
        super();
        this.GetToken = getToken;
        this.gateway = gateway;
        this.getConfiguration = getConfiguration;
    }
}
