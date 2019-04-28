import * as fs from "fs";
import { SdkClient } from "..";
import { checkAssetId } from "../../utils";
import { IotFileModels } from "./iot-file-models";
export class IotFileClient extends SdkClient {
    private _baseUrl: string = "/api/iotfile/v3";

    public async GetFiles(
        entityid: string,
        optional?: { offset?: number; limit?: number; count?: number; order?: string; filter?: string }
    ): Promise<IotFileModels.File[]> {
        checkAssetId(entityid);
        return (await (this.HttpAction({
            verb: "GET",
            baseUrl: `${this._baseUrl}/files/${entityid}`,
            additionalHeaders: optional,
            message: "SearchFiles"
        }) as unknown)) as IotFileModels.File[];
    }

    public async PutFile(
        entityid: string,
        filepath: string,
        file: string | Buffer,
        optional?: { part?: number; "If-Match"?: number; timestamp?: Date; description?: string; type: string }
    ): Promise<Headers> {
        checkAssetId(entityid);

        const myBuffer = typeof file === "string" ? fs.readFileSync(file) : (file as Buffer);

        return (await this.HttpAction({
            verb: "PUT",
            baseUrl: `${this._baseUrl}/files/${entityid}/${filepath}`,
            body: myBuffer,
            additionalHeaders: optional,
            noResponse: true,
            returnHeaders: true
        })) as Headers;
    }
}
