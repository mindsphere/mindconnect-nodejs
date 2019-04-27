import { checkAssetId } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { AssetManagementModels } from "./asset-models";

// TODO: finish asset management
export class AssetManagementClient extends SdkClient {
    private _baseUrl: string = "/api/assetmanagement/v3";

    public async GetAssetType(
        typeId: string,
        exploded: boolean = true,
        ifNoneMatch?: number
    ): Promise<AssetManagementModels.AssetTypeResource> {
        const result = await this.HttpAction({
            verb: "GET",
            baseUrl: `${this._baseUrl}/assettypes/${typeId}?exploded=${exploded}`,
            additionalHeaders: { "If-Match": ifNoneMatch }
        });
        return result as AssetManagementModels.AssetTypeResource;
    }

    public async GetAsset(assetId: string): Promise<AssetManagementModels.AssetResourceWithHierarchyPath> {
        checkAssetId(assetId);
        const result = await this.HttpAction({
            verb: "GET",
            baseUrl: `${this._baseUrl}/assets/${assetId}`,
            message: "GetAsset"
        });
        return result as AssetManagementModels.AssetResourceWithHierarchyPath;
    }

    public async GetAspects(assetId: string): Promise<AssetManagementModels.AspectListResource> {
        checkAssetId(assetId);
        const result = await this.HttpAction({
            verb: "GET",
            baseUrl: `${this._baseUrl}/assets/${assetId}/aspects`,
            message: "GetAspects"
        });
        return result as AssetManagementModels.AspectListResource;
    }

    public async PutAsset(assetId: string, asset: any): Promise<boolean> {
        checkAssetId(assetId);
        await this.HttpAction({
            verb: "PUT",
            baseUrl: `${this._baseUrl}/assets/${assetId}`,
            body: asset,
            message: "PutAsset",
            additionalHeaders: { "If-Match": (<any>asset)["etag"] }
        });
        return true;
    }

    public async PostAsset(
        asset: AssetManagementModels.Asset
    ): Promise<AssetManagementModels.AssetResourceWithHierarchyPath> {
        const result = await this.HttpAction({
            verb: "POST",
            baseUrl: `${this._baseUrl}/assets`,
            body: asset,
            message: "PostAsset"
        });
        return result as AssetManagementModels.AssetResourceWithHierarchyPath;
    }

    public async GetRootAsset(): Promise<AssetManagementModels.RootAssetResource> {
        const result = await this.HttpAction({
            verb: "GET",
            baseUrl: `${this._baseUrl}/assets/root`,
            message: "PostAsset"
        });
        return result as AssetManagementModels.RootAssetResource;
    }
}
