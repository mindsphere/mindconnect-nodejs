import { checkAssetId } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { AspectListResource, Asset } from "./asset-models";
const debug = require("debug");

export class AssetManagement extends SdkClient {
    public async GetAsset(assetId: string): Promise<Asset> {
        checkAssetId(assetId);
        const result = await this.HttpAction("GET", `/api/assetmanagement/v3/assets/${assetId}`, "GetAsset");
        return result as Asset;
    }

    public async GetAspects(assetId: string): Promise<AspectListResource> {
        checkAssetId(assetId);
        const result = await this.HttpAction("GET", `/api/assetmanagement/v3/assets/${assetId}/aspects`, "GetAspects");
        return result as AspectListResource;
    }
}
