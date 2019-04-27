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
}
