import { checkAssetId, toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { AssetManagementModels } from "./asset-models";

/**
 * Service for configuring, reading and managing assets, asset ~ and aspect types.
 *
 * @export
 * @class AssetManagementClient
 * @extends {SdkClient}
 */
export class AssetManagementClient extends SdkClient {
    private _baseUrl: string = "/api/assetmanagement/v3";

    /**
     * * AspectTypes
     *
     * Managing static and dynamic aspect types.
     *
     * List all aspect types
     *
     * @param {{
     *         page?: number;
     *         size?: number;
     *         sort?: string;
     *         filter?: string;
     *         ifNoneMatch?: number;
     *     }} [params]
     * @param [params.page] Specifies the requested page index
     * @param [params.size] Specifies the number of elements in a page
     * @param [params.sort] Specifies the ordering of returned elements
     * @param [params.filter] Specifies the additional filtering criteria
     * @param [params.ifnonematch] ETag hash of previous request to allow caching
     *
     * @example await assetManagement.GetAspectTypes();
     * @example await assetManagement.GetAspectTypes({filter: "id eq mdsp.wing"});

     * @returns {Promise<AssetManagementModels.AspectTypeListResource>}
     *
     * @memberOf AssetManagementClient
     */
    public async GetAspectTypes(params?: {
        page?: number;
        size?: number;
        sort?: string;
        filter?: string;
        ifNoneMatch?: number;
    }): Promise<AssetManagementModels.AspectTypeListResource> {
        const parameters = params || {};
        const { page, size, sort, filter, ifNoneMatch } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/aspecttypes?${toQueryString({ page, size, sort, filter })}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch }
        });

        return result as AssetManagementModels.AspectTypeListResource;
    }

    /**
     * * AspectTypes
     *
     * Create or Update an aspect type.
     * Only adding variables supported.
     * User can increase the length of a static STRING variable.
     * The length cannot be decreased.
     * The length of a dynamic STRING variable cannot be changed.
     *
     * @param {string} id The type’s id is a unique identifier. The id’s length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9", “_” and “.” beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {AssetManagementModels.AspectType} aspectType aspect type
     * @param {{ ifMatch?: number; ifNoneMatch?: string }} [params]
     * @param {{number}} [params.ifMatch] Last known version to facilitate optimistic locking. Required for modification.
     * @param {{number}} [params.ifNoneMatch] Set ifNoneMatch header to “*” for ensuring create request
     * @returns {Promise<AssetManagementModels.AspectTypeResource>}
     *
     * @example await am.PutAspectType ("mdsp.EnvironmentAspects", myAspectType, {ifNoneMatch:"*"})
     * @memberOf AssetManagementClient
     */
    public async PutAspectType(
        id: string,
        aspectType: AssetManagementModels.AspectType,
        params?: { ifMatch?: number; ifNoneMatch?: string }
    ): Promise<AssetManagementModels.AspectTypeResource> {
        const parameters = params || {};
        const { ifMatch, ifNoneMatch } = parameters;
        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/aspecttypes/${id}`,
            body: aspectType,
            additionalHeaders: { "If-Match": ifMatch, "If-None-Match": ifNoneMatch }
        });

        return result as AssetManagementModels.AspectTypeResource;
    }

    /**
     * * AspectTypes
     *
     * Patch an aspect type. Only adding variables supported.
     * Patching requires the inclusion of already existing variables.
     *  Other fields may be omitted. Conforms to RFC 7396 - JSON merge Patch.
     *
     * @param {string} id The type’s id is a unique identifier. The id’s length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9", “_” and “.” beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {AssetManagementModels.AspectType} aspectType aspect type
     * @param {{ ifMatch: number}} params
     * @param {{number}} params.ifMatch Last known version to facilitate optimistic locking. Required for modification.
     * @returns {Promise<AssetManagementModels.AspectTypeResource>}
     *
     * @example await am.PatchAspectType ("mdsp.EnvironmentAspect", myAspectType, {ifMatch:"0"})
     * @memberOf AssetManagementClient
     */
    public async PatchAspectType(
        id: string,
        aspectType: AssetManagementModels.AspectType,
        params: { ifMatch: number }
    ): Promise<AssetManagementModels.AspectTypeResource> {
        const parameters = params || {};
        const { ifMatch } = parameters;
        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/aspecttypes/${id}`,
            body: aspectType,
            additionalHeaders: { "If-Match": ifMatch, "Content-Type": "application/merge-patch+json" }
        });

        return result as AssetManagementModels.AspectTypeResource;
    }

    /**
     * * AspectTypes
     *
     * Delete an aspect type. Aspect type can only be deleted if there is no asset type using it.
     *
     * @param {string} id The type’s id is a unique identifier. The id’s length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9", “_” and “.” beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {{ ifMatch: number }} params
     * @param {{ ifMatch: number }} params.ifMatch Last known version to facilitate optimistic locking, required for deleting
     * @returns {Promise<Object>} - return empty object
     *
     * @example await am.DeleteAspectType("mdsp.EnvironmentAspect", {ifMatch:0})
     * @memberOf AssetManagementClient
     *
     */
    public async DeleteAspectType(id: string, params: { ifMatch: number }) {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/aspecttypes/${id}`,
            additionalHeaders: { "If-Match": params.ifMatch },
            noResponse: true
        });
    }

    /**
     * * AspectTypes
     *
     * Read an aspect type.
     *
     * @param {string} id he type’s id is a unique identifier. The id’s length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9", “_” and “.” beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {{ ifNoneMatch?: number }} [params] ETag hash of previous request to allow caching
     * @returns {Promise<AssetManagementModels.AspectTypeResource>}
     *
     * @example await am.GetAspectType("mdsp.EnvironmentAspect")
     * @memberOf AssetManagementClient
     */
    public async GetAspectType(
        id: string,
        params?: { ifNoneMatch?: number }
    ): Promise<AssetManagementModels.AspectTypeResource> {
        const parameters = params || {};
        const { ifNoneMatch } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/aspecttypes/${id}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch }
        });

        return result as AssetManagementModels.AspectTypeResource;
    }

    /**
     * * AssetTypes
     * ! important: the default setting for inherited properties is false
     * ! important: @see [params.exploded]
     *
     * List all asset types
     *
     * @param {{
     *         page?: number;
     *         size?: number;
     *         sort?: string;
     *         filter?: string;
     *         ifNoneMatch?: number;
     *         exploded?: boolean;
     *     }} [params]
     * @param [params.page] Specifies the requested page index
     * @param [params.size] Specifies the number of elements in a page
     * @param [params.sort] Specifies the ordering of returned elements
     * @param [params.filter] Specifies the additional filtering criteria
     * @param [params.ifnonematch] ETag hash of previous request to allow caching
     * @param [params.exploded] Specifies if the asset type should include all of it’s inherited variables and aspects. Default is false.
     *
     * @example await assetManagement.GetAssetTypes();
     * @example await assetManagement.GetAssetTypes({filter: "id eq mdsp.spaceship"});

     * @returns {Promise<AssetManagementModels.AssetTypeListResource>}
     *
     * @memberOf AssetManagementClient
     *
     */
    public async GetAssetTypes(params?: {
        page?: number;
        size?: number;
        sort?: string;
        filter?: string;
        ifNoneMatch?: number;
        exploded?: boolean;
    }): Promise<AssetManagementModels.AssetTypeListResource> {
        const parameters = params || {};
        const { page, size, sort, filter, ifNoneMatch, exploded } = parameters;

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assettypes?${toQueryString({ page, size, sort, filter, exploded })}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch }
        });

        return result as AssetManagementModels.AssetTypeListResource;
    }

    /**
     * * AssetTypes
     *
     * Create or Update an asset type
     * User can increase the length of a STRING variable.
     * The length cannot be decreased.
     *
     * @param {string} id
     * @param {AssetManagementModels.AssetType} assetType
     * @param {{ ifMatch?: number; ifNoneMatch?: string; exploded?: boolean }} [params]
     * @param {{number}} [params.ifMatch] Last known version to facilitate optimistic locking. Required for modification.
     * @param {{number}} [params.ifNoneMatch] Set ifNoneMatch header to “*” for ensuring create request
     * @param {{boolean}} [params.exploded] Specifies if the asset type should include all of it’s inherited variables and aspects. Default is false.
     * @returns {Promise<AssetManagementModels.AssetTypeResource>}
     *
     * @example await am.PutAssetType("mdsp.SimulationEngine", myAssetType)
     * @memberOf AssetManagementClient
     */
    public async PutAssetType(
        id: string,
        assetType: AssetManagementModels.AssetType,
        params?: { ifMatch?: number; ifNoneMatch?: string; exploded?: boolean }
    ): Promise<AssetManagementModels.AssetTypeResource> {
        const parameters = params || {};
        const { ifMatch, ifNoneMatch, exploded } = parameters;
        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assettypes/${id}?${toQueryString({ exploded: exploded })}`,
            body: assetType,
            additionalHeaders: { "If-Match": ifMatch, "If-None-Match": ifNoneMatch }
        });

        return result as AssetManagementModels.AssetTypeResource;
    }

    /**
     * * AssetTypes
     *
     * Patch an asset type.
     * Patching requires the inclusion of all existing variables and aspects.
     * Missing file assignments will be deleted.
     * Other fields may be omitted. Conforms to RFC 7396 - JSON merge Patch.
     *
     * @param {string} id
     * @param {AssetManagementModels.AssetType} assetType
     * @param {{ ifMatch: number; exploded?: boolean }} params
     * @param {{number}} [params.ifMatch] Last known version to facilitate optimistic locking. Required for modification.
     * @param {{boolean}} [params.exploded] Specifies if the asset type should include all of it’s inherited variables and aspects. Default is false.
     * @returns {Promise<AssetManagementModels.AssetTypeResource>}
     *
     * @example await am.PatchAssetType("mdsp.SimulationEngine", myAssetType)
     * @memberOf AssetManagementClient
     */
    public async PatchAssetType(
        id: string,
        assetType: AssetManagementModels.AssetType,
        params: { ifMatch: number; exploded?: boolean }
    ): Promise<AssetManagementModels.AssetTypeResource> {
        const parameters = params || {};
        const { ifMatch, exploded } = parameters;
        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assettypes/${id}?${toQueryString({ exploded: exploded })}`,
            body: assetType,
            additionalHeaders: { "If-Match": ifMatch, "Content-Type": "application/merge-patch+json" }
        });

        return result as AssetManagementModels.AssetTypeResource;
    }

    /**
     * * AssetTypes
     *
     * Deletes an asset type.
     * Deletion only possible when the type has no child-type and there is no asset that instantiate it.
     *
     * @param {string} id The type’s id is a unique identifier. The id’s length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9", “_” and “.” beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {{ ifMatch: number }} params
     * @param {{ ifMatch: number }} params.ifMatch Last known version to facilitate optimistic locking, required for deleting
     * @returns {Promise<Object>} - return empty object
     *
     * @example await am.DeleteAssetType("mdsp.SimulationEnigine", {ifMatch:0})
     * @memberOf AssetManagementClient
     *
     */
    public async DeleteAssetType(id: string, params: { ifMatch: number }) {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assettypes/${id}`,
            additionalHeaders: { "If-Match": params.ifMatch },
            noResponse: true
        });
    }

    /**
     * Read and asset type
     * ! important: the default setting for inherited properties is false
     * ! important: @see [params.exploded]
     *
     * @param {string} id
     * @param {{ ifNoneMatch?: number; exploded?: boolean }} [params]
     * @returns {Promise<AssetManagementModels.AssetTypeResource>}
     *
     * @example await am.GetAssetType("mdsp.SimulationEngine")
     * @memberOf AssetManagementClient
     */
    public async GetAssetType(
        id: string,
        params?: { ifNoneMatch?: number; exploded?: boolean }
    ): Promise<AssetManagementModels.AssetTypeResource> {
        const parameters = params || {};
        const { ifNoneMatch, exploded } = parameters;
        const ex = exploded === undefined ? false : exploded;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assettypes/${id}?exploded=${ex}`,
            additionalHeaders: { "If-Match": ifNoneMatch }
        });
        return result as AssetManagementModels.AssetTypeResource;
    }

    public async GetAsset(assetId: string): Promise<AssetManagementModels.AssetResourceWithHierarchyPath> {
        checkAssetId(assetId);
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets/${assetId}`,
            message: "GetAsset"
        });
        return result as AssetManagementModels.AssetResourceWithHierarchyPath;
    }

    public async GetAspects(assetId: string): Promise<AssetManagementModels.AspectListResource> {
        checkAssetId(assetId);
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets/${assetId}/aspects`,
            message: "GetAspects"
        });
        return result as AssetManagementModels.AspectListResource;
    }

    public async PutAsset(assetId: string, asset: any): Promise<boolean> {
        checkAssetId(assetId);
        await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
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
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets`,
            body: asset,
            message: "PostAsset"
        });
        return result as AssetManagementModels.AssetResourceWithHierarchyPath;
    }

    public async GetRootAsset(): Promise<AssetManagementModels.RootAssetResource> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets/root`,
            message: "PostAsset"
        });
        return result as AssetManagementModels.RootAssetResource;
    }
}
