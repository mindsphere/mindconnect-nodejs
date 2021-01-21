import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { AssetManagementSharingModels } from "./asset-sharing-models";

/**
 * Service for configuring, reading and managing asset sharings.
 *
 * @export
 * @class AssetManagementSharingClinet
 * @extends {SdkClient}
 */

export class AssetManagementSharingClient extends SdkClient {
    private _baseUrl: string = "/api/sharing/v3";


    public async GetCollaboration(params?: {
        page?: number;
        size?: number;
    }): Promise<AssetManagementSharingModels.CollaborationResource> {
        const parameters = params || {};
        const { page, size } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/collaborations?${toQueryString({ page, size })}`
        });

        return result as AssetManagementSharingModels.CollaborationResource;
    }

}