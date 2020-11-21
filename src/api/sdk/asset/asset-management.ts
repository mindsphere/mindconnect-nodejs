import { toQueryString } from "../../utils";
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
     *         includeShared?: boolean;
     *     }} [params]
     * @param [params.page] Specifies the requested page index
     * @param [params.size] Specifies the number of elements in a page
     * @param [params.sort] Specifies the ordering of returned elements
     * @param [params.filter] Specifies the additional filtering criteria
     * @param [params.ifnonematch] ETag hash of previous request to allow caching
     * @param [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.

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
        includeShared?: boolean;
    }): Promise<AssetManagementModels.AspectTypeListResource> {
        const parameters = params || {};
        const { page, size, sort, filter, ifNoneMatch, includeShared } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/aspecttypes?${toQueryString({ page, size, sort, filter, includeShared })}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch },
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
     * @param {string} id The type id is a unique identifier. The id length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9","_" and "." beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {AssetManagementModels.AspectType} aspectType aspect type
     * @param {{ ifMatch?: string; ifNoneMatch?: string, includeShared?:boolean }} [params]
     * @param {{number}} [params.ifMatch] Last known version to facilitate optimistic locking. Required for modification.
     * @param {{number}} [params.ifNoneMatch] Set ifNoneMatch header to"*" for ensuring create request
     * @param [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     *
     * @returns {Promise<AssetManagementModels.AspectTypeResource>}
     *
     * @example await am.PutAspectType ("mdsp.EnvironmentAspects", myAspectType, {ifNoneMatch:"*"})
     * @memberOf AssetManagementClient
     */
    public async PutAspectType(
        id: string,
        aspectType: AssetManagementModels.AspectType,
        params?: { ifMatch?: string; ifNoneMatch?: string; includeShared?: boolean }
    ): Promise<AssetManagementModels.AspectTypeResource> {
        const parameters = params || {};
        const { ifMatch, ifNoneMatch, includeShared } = parameters;
        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/aspecttypes/${id}?${toQueryString({ includeShared })}`,
            body: aspectType,
            additionalHeaders: { "If-Match": ifMatch, "If-None-Match": ifNoneMatch },
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
     * @param {string} id The type id is a unique identifier. The id length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9","_" and "." beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {AssetManagementModels.AspectType} aspectType aspect type
     * @param {{ ifMatch: string, includeShared?: boolean}} params
     * @param [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     * @param {{number}} params.ifMatch Last known version to facilitate optimistic locking. Required for modification.
     * @returns {Promise<AssetManagementModels.AspectTypeResource>}
     *
     * @example await am.PatchAspectType ("mdsp.EnvironmentAspect", myAspectType, {ifMatch:"0"})
     * @memberOf AssetManagementClient
     */
    public async PatchAspectType(
        id: string,
        aspectType: AssetManagementModels.AspectType,
        params: { ifMatch: string; includeShared?: boolean }
    ): Promise<AssetManagementModels.AspectTypeResource> {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;
        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/aspecttypes/${id}?${toQueryString({ includeShared })}`,
            body: aspectType,
            additionalHeaders: { "If-Match": ifMatch, "Content-Type": "application/merge-patch+json" },
        });

        return result as AssetManagementModels.AspectTypeResource;
    }

    /**
     * * AspectTypes
     *
     * Delete an aspect type. Aspect type can only be deleted if there is no asset type using it.
     *
     * @param {string} id The type id is a unique identifier. The id length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9","_" and "." beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {{ ifMatch: string, includeShared?: boolean }} params
     * @param {{ ifMatch: string }} params.ifMatch Last known version to facilitate optimistic locking, required for deleting
     * @param [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     * @returns {Promise<Object>} - return empty object
     *
     * @example await am.DeleteAspectType("mdsp.EnvironmentAspect", {ifMatch:0})
     * @memberOf AssetManagementClient
     *
     */
    public async DeleteAspectType(id: string, params: { ifMatch: string; includeShared?: boolean }) {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/aspecttypes/${id}?${toQueryString({ includeShared })}`,
            additionalHeaders: { "If-Match": ifMatch },
            noResponse: true,
        });
    }

    /**
     * * AspectTypes
     *
     * Read an aspect type.
     *
     * @param {string} id he type id is a unique identifier. The id length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9","_" and "." beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {{ ifNoneMatch?: number, includeShared?: boolean }} [params] ETag hash of previous request to allow caching
     * @param [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     *  @returns {Promise<AssetManagementModels.AspectTypeResource>}
     *
     * @example await am.GetAspectType("mdsp.EnvironmentAspect")
     * @memberOf AssetManagementClient
     */
    public async GetAspectType(
        id: string,
        params?: { ifNoneMatch?: number; includeShared?: boolean }
    ): Promise<AssetManagementModels.AspectTypeResource> {
        const parameters = params || {};
        const { ifNoneMatch, includeShared } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/aspecttypes/${id}?${toQueryString({ includeShared })}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch },
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
     *         includeShared? boolean;
     *     }} [params]
     * @param [params.page] Specifies the requested page index
     * @param [params.size] Specifies the number of elements in a page
     * @param [params.sort] Specifies the ordering of returned elements
     * @param [params.filter] Specifies the additional filtering criteria
     * @param [params.ifnonematch] ETag hash of previous request to allow caching
     * @param [params.exploded] Specifies if the asset type should include all of it’s inherited variables and aspects. Default is false.
     * @param [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
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
        ifNoneMatch?: string;
        exploded?: boolean;
        includeShared?: boolean;
    }): Promise<AssetManagementModels.AssetTypeListResource> {
        const parameters = params || {};
        const { page, size, sort, filter, ifNoneMatch, exploded, includeShared } = parameters;

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assettypes?${toQueryString({
                page,
                size,
                sort,
                filter,
                exploded,
                includeShared,
            })}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch },
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
     * @param {{ ifMatch?: string; ifNoneMatch?: string; exploded?: boolean }} [params]
     * @param {{number}} [params.ifMatch] Last known version to facilitate optimistic locking. Required for modification.
     * @param {{string}} [params.ifNoneMatch] Set ifNoneMatch header to "*"" for ensuring create request
     * @param {{boolean}} [params.exploded] Specifies if the asset type should include all of inherited variables and aspects. Default is false.
     * @param {{boolean}} [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     * @returns {Promise<AssetManagementModels.AssetTypeResource>}
     *
     * @example await am.PutAssetType("mdsp.SimulationEngine", myAssetType)
     * @memberOf AssetManagementClient
     */
    public async PutAssetType(
        id: string,
        assetType: AssetManagementModels.AssetType,
        params?: { ifMatch?: string; ifNoneMatch?: string; exploded?: boolean; includeShared?: boolean }
    ): Promise<AssetManagementModels.AssetTypeResource> {
        const parameters = params || {};
        const { ifMatch, ifNoneMatch, exploded, includeShared } = parameters;
        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assettypes/${id}?${toQueryString({ exploded, includeShared })}`,
            body: assetType,
            additionalHeaders: { "If-Match": ifMatch, "If-None-Match": ifNoneMatch },
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
     * @param {{ ifMatch: string; exploded?: boolean; includeShared?:boolean }} params
     * @param {{number}} [params.ifMatch] Last known version to facilitate optimistic locking. Required for modification.
     * @param {{boolean}} [params.exploded] Specifies if the asset type should include all of inherited variables and aspects. Default is false.
     * @param {{boolean}} [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     * @returns {Promise<AssetManagementModels.AssetTypeResource>}
     *
     * @example await am.PatchAssetType("mdsp.SimulationEngine", myAssetType)
     * @memberOf AssetManagementClient
     */
    public async PatchAssetType(
        id: string,
        assetType: AssetManagementModels.AssetType,
        params: { ifMatch: string; exploded?: boolean; includeShared?: boolean }
    ): Promise<AssetManagementModels.AssetTypeResource> {
        const parameters = params || {};
        const { ifMatch, exploded, includeShared } = parameters;
        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assettypes/${id}?${toQueryString({ exploded, includeShared })}`,
            body: assetType,
            additionalHeaders: { "If-Match": ifMatch, "Content-Type": "application/merge-patch+json" },
        });

        return result as AssetManagementModels.AssetTypeResource;
    }

    /**
     * * AssetTypes
     *
     * Deletes an asset type.
     * Deletion only possible when the type has no child-type and there is no asset that instantiate it.
     *
     * @param {string} id The type id is a unique identifier. The id length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9", "_' and "." beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {{ ifMatch: string; includeShared?:boolean; }} params
     * @param {{number}} params.ifMatch Last known version to facilitate optimistic locking, required for deleting
     * @param {{boolean}} [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     *
     * @example await am.DeleteAssetType("mdsp.SimulationEnigine", {ifMatch:0})
     * @memberOf AssetManagementClient
     *
     */
    public async DeleteAssetType(id: string, params: { ifMatch: string; includeShared?: boolean }) {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assettypes/${id}?${toQueryString({ includeShared })}`,
            additionalHeaders: { "If-Match": ifMatch },
            noResponse: true,
        });
    }

    /**
     * * AssetTypes
     *
     * Read an asset type
     * ! important: the default setting for inherited properties is false
     * ! important: @see [params.exploded]
     *
     * @param {string} id
     * @param {{ ifNoneMatch?: string; exploded?: boolean; includeShared?: boolean }} [params]
     * @returns {Promise<AssetManagementModels.AssetTypeResource>}
     *
     * @example await am.GetAssetType("mdsp.SimulationEngine")
     * @memberOf AssetManagementClient
     */
    public async GetAssetType(
        id: string,
        params?: { ifNoneMatch?: string; exploded?: boolean; includeShared?: boolean }
    ): Promise<AssetManagementModels.AssetTypeResource> {
        const parameters = params || {};
        const { ifNoneMatch, exploded, includeShared } = parameters;
        const ex = exploded === undefined ? false : exploded;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assettypes/${id}?${toQueryString({ exploded: ex, includeShared })}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch },
        });
        return result as AssetManagementModels.AssetTypeResource;
    }

    /**
     * * AssetTypes
     *
     * Add a new file assignment to a given asset type. All asset which extends these types will have its file by default.
     *
     * @param {string} id The type id is a unique identifier. The id length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9", "_" and "." beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {string} key Keyword for the file to be assigned to an asset or asset type.
     * @param {AssetManagementModels.KeyedFileAssignment} assignment Data for file assignment
     * @param {{ ifMatch: string ; includeShared?: boolean}} params
     * @param {{number}} params.ifMatch Last known version to facilitate optimistic locking
     * @param {{boolean}} [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     * @returns {Promise<AssetManagementModels.AssetTypeResource>}
     *
     * @memberOf AssetManagementClient
     */
    public async PutAssetTypeFileAssignment(
        id: string,
        key: string,
        assignment: AssetManagementModels.KeyedFileAssignment,
        params: { ifMatch: string; includeShared?: boolean }
    ): Promise<AssetManagementModels.AssetTypeResource> {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;
        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assettypes/${id}/fileAssignments/${key}?${toQueryString({ includeShared })}`,
            body: assignment,
            additionalHeaders: { "If-Match": ifMatch },
        });

        return result as AssetManagementModels.AssetTypeResource;
    }

    /**
     * *AssetTypes
     *
     * Deletes a file assignment from an asset type.
     * If the type parent has defined a file with the same key, the key will be displayed with the inherited value.
     *
     * @param {string} id The type id is a unique identifier. The id length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9","_" and "." beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {string} key Keyword for the file to be assigned to an asset or asset type.
     * @param {AssetManagementModels.KeyedFileAssignment} assignment Data for file assignment
     * @param {{ ifMatch: string; includeShared?: boolean }} params
     * @param {{number}} params.ifMatch Last known version to facilitate optimistic locking
     * @param {{boolean}} [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     *
     * @memberOf AssetManagementClient
     */
    public async DeleteAssetTypeFileAssignment(
        id: string,
        key: string,
        params: { ifMatch: string; includeShared?: boolean }
    ) {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assettypes/${id}/fileAssignments/${key}?${toQueryString({ includeShared })}`,
            additionalHeaders: { "If-Match": ifMatch },
            noResponse: true,
        });
    }

    /**
     * * AssetTypes
     *
     * Updates an existing variable defined on an asset type. Variables cannot be added or deleted using this operation,
     * for adding or deleting variables use patch/put assettype api. Any variable which is not part of the request will remain unchanged
     * Variable's Name, Length, Default Value and Unit can be changed. The unit changes from the api does not compute any value changes
     * derived after the unit changes, the values will remain as it is and only the unit will be updated.
     * The length can only be increased of a string variable and it cannot be decreased.
     * This operation will increment the asset type etag value.
     *
     * @param {string} id The type id is a unique identifier. The id length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9","_" and "." beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {{ ifMatch: string; includeShared?: boolean }} params
     * @param {{number}} params.ifMatch Last known version to facilitate optimistic locking
     * @param {{boolean}} [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     * @param {AssetManagementModels.VariableUpdateMap} variableMap
     * @returns {Promise<Headers>}
     *
     * @memberOf AssetManagementClient
     */
    public async PatchAssetTypeVariable(
        id: string,
        variableMap: AssetManagementModels.VariableUpdateMap,
        params: { ifMatch: string; includeShared?: boolean }
    ): Promise<Headers> {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;
        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assettypes/${id}/variables?${toQueryString({ includeShared })}`,
            body: variableMap,
            returnHeaders: true,
            additionalHeaders: { "If-Match": ifMatch, "Content-Type": "application/merge-patch+json" },
        });

        return result as Headers;
    }

    /**
     * * Asset
     *
     * List all assets available for the authenticated user.
     *
     * @param {{
     *         page?: number;
     *         size?: number;
     *         sort?: string;
     *         filter?: string;
     *         ifNoneMatch?: string;
     *         includeShared? boolean;
     *     }} [params]
     * @param [params.page] Specifies the requested page index
     * @param [params.size] Specifies the number of elements in a page
     * @param [params.sort] Specifies the ordering of returned elements
     * @param [params.filter] Specifies the additional filtering criteria
     * @param [params.ifnonematch] ETag hash of previous request to allow caching
     * @param [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     *
     * @returns {Promise<AssetManagementModels.AssetListResource>}
     *
     * @example await assetManagement.GetAssets();
     * @example await assetManagement.GetAssetTypes({filter: "typeid eq mdsp.spaceship"});
     *
     * @memberOf AssetManagementClient
     */
    public async GetAssets(params?: {
        page?: number;
        size?: number;
        sort?: string;
        filter?: string;
        ifNoneMatch?: string;
        includeShared?: boolean;
    }): Promise<AssetManagementModels.AssetListResource> {
        const parameters = params || {};
        const { page, size, sort, filter, ifNoneMatch, includeShared } = parameters;

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets?${toQueryString({ page, size, sort, filter, includeShared })}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch },
        });

        return result as AssetManagementModels.AssetListResource;
    }

    /**
     * * Asset
     *
     * Creates a new asset with the provided content. Only instantiable types could be used.
     * @param {{
     *         includeShared? boolean;
     *     }} [params]
     * @param [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     *
     * @param {AssetManagementModels.Asset} asset
     * @returns {Promise<AssetManagementModels.AssetResourceWithHierarchyPath>}
     *
     * @example await assetManagement.PostAsset(myasset);
     * @memberOf AssetManagementClient
     */
    public async PostAsset(
        asset: AssetManagementModels.Asset,
        params?: { includeShared?: boolean }
    ): Promise<AssetManagementModels.AssetResourceWithHierarchyPath> {
        const parameters = params || {};
        const { includeShared } = parameters;

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets?${toQueryString({ includeShared })}
            `,
            body: asset,
        });
        return result as AssetManagementModels.AssetResourceWithHierarchyPath;
    }

    /**
     * * Asset
     *
     * Read a single asset. All static properties of asset are returned.
     *
     * @param {string} assetId Unique identifier
     * @param {{ ifNoneMatch?: string; includeShared?: boolean}} [params]
     * @param {{string}} [params.ifNoneMatch]
     * @param [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     * @returns {Promise<AssetManagementModels.AssetResourceWithHierarchyPath>}
     *
     * @memberOf AssetManagementClient
     */
    public async GetAsset(
        assetId: string,
        params?: { ifNoneMatch?: string; includeShared?: boolean }
    ): Promise<AssetManagementModels.AssetResourceWithHierarchyPath> {
        const parameters = params || {};
        const { ifNoneMatch, includeShared } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets/${assetId}?${toQueryString({ includeShared })}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch },
        });

        return result as AssetManagementModels.AssetResourceWithHierarchyPath;
    }

    /**
     * * Asset
     *
     * Updates an asset with the provided content.
     * Only values can be modified, asset structure have to be modified in asset type
     *
     * @param {string} assetId
     * @param {AssetManagementModels.AssetUpdate} asset
     * @param {{ ifMatch: string; includeShared?: boolean }} params
     * @param {{number}} [params.ifMatch] Last known version to facilitate optimistic locking. Required for modification.
     * @param {{boolean}} [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     * @returns {Promise<AssetManagementModels.AssetResourceWithHierarchyPath>}
     *
     * @example await assetManagement.PutAsset (myAsset, {ifMatch: `${myAsset.etag}`})
     *
     * @memberOf AssetManagementClient
     */
    public async PutAsset(
        assetId: string,
        asset: AssetManagementModels.AssetUpdate,
        params: { ifMatch: string; includeShared?: boolean }
    ): Promise<AssetManagementModels.AssetResourceWithHierarchyPath> {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;

        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets/${assetId}?${toQueryString({ includeShared })}`,
            body: asset,
            additionalHeaders: { "If-Match": ifMatch },
        });
        return result as AssetManagementModels.AssetResourceWithHierarchyPath;
    }

    /**
     * * Asset
     *
     * Patch an asset with the provided content.
     * Only values can be modified, asset structure have to be modified in asset type.
     * Conforms to RFC 7396 - JSON merge Patch.
     *
     * @param {string} assetId
     * @param {AssetManagementModels.AssetUpdate} asset
     * @param {{ ifMatch: string; includeShared?: boolean; }} params
     * @param {{number}} [params.ifMatch] Last known version to facilitate optimistic locking. Required for modification.
     * @param {{boolean}} [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     * @returns {Promise<AssetManagementModels.AssetResourceWithHierarchyPath>}
     *
     * @example await assetManagement.Patch (myAsset, {ifMatch: `${myAsset.etag}`})
     *
     * @memberOf AssetManagementClient
     */
    public async PatchAsset(
        assetId: string,
        asset: AssetManagementModels.AssetUpdate,
        params: { ifMatch: string; includeShared?: boolean }
    ): Promise<AssetManagementModels.AssetResourceWithHierarchyPath> {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;

        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets/${assetId}?${toQueryString({ includeShared })}`,
            body: asset,
            additionalHeaders: { "If-Match": ifMatch, "Content-Type": "application/merge-patch+json" },
        });
        return result as AssetManagementModels.AssetResourceWithHierarchyPath;
    }

    /**
     * * Asset
     *
     * Deletes the given asset.
     * After deletion only users with admin role can read it,
     * but modification is not possible anymore.
     * It is not possible to delete an asset if it has children.
     *
     * @param {string} id The type id is a unique identifier. The id s length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9", "_" and "." beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {{ ifMatch: string; includeShared?: booleanl }} params
     * @param {{number}} params.ifMatch Last known version to facilitate optimistic locking, required for deleting
     * @param {{boolean}} [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     * @example await assetManagement.DeleteAsset(id, {ifMatch:0})
     *
     * @memberOf AssetManagementClient
     */
    public async DeleteAsset(id: string, params: { ifMatch: string; includeShared?: boolean }) {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;

        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets/${id}?${toQueryString({ includeShared })}`,
            additionalHeaders: { "If-Match": ifMatch },
            noResponse: true,
        });
    }

    /**
     * * Asset
     *
     * Moves an asset (and all asset children) in the instance hierarchy
     *
     * @param {string} assetId
     * @param {AssetManagementModels.AssetMove} moveParameters
     * @param {{ ifMatch: string; includeShared?: boolean }} params
     * @param {{number}} [params.ifMatch] Last known version to facilitate optimistic locking. Required for modification.
     * @param {{boolean}} [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     * @returns {Promise<AssetManagementModels.AssetResourceWithHierarchyPath>}
     *
     * @example await assetManagement.PutAsset (myAsset, {ifMatch: `${myAsset.etag}`})
     *
     * @memberOf AssetManagementClient
     */
    public async MoveAsset(
        assetId: string,
        moveParameters: AssetManagementModels.AssetMove,
        params: { ifMatch: string; includeShared?: boolean }
    ): Promise<AssetManagementModels.AssetResourceWithHierarchyPath> {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets/${assetId}?${toQueryString({ includeShared })}`,
            body: moveParameters,
            additionalHeaders: { "If-Match": ifMatch },
        });
        return result as AssetManagementModels.AssetResourceWithHierarchyPath;
    }

    /**
     * * Asset
     *
     * Save a file assignment to a given asset
     *
     * @param {string} id The type id is a unique identifier. The id length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9", "_" and ".
     *  beginning with the tenant prefix what has a maximum of 8 characters. (e.g. ten_pref.type_id)
     * @param {string} key Keyword for the file to be assigned to an asset or asset type.
     * @param {AssetManagementModels.KeyedFileAssignment} assignment Data for file assignment
     * @param {{ ifMatch: string; includeShared ?: boolean; }} params
     * @param {{boolean}} [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     * @param {{number}} [params.ifMatch] Last known version to facilitate optimistic locking
     * @returns {Promise<AssetManagementModels.AssetTypeResource>}
     *
     * @memberOf AssetManagementClient
     */
    public async PutAssetFileAssignment(
        id: string,
        key: string,
        assignment: AssetManagementModels.KeyedFileAssignment,
        params: { ifMatch: string; includeShared?: boolean }
    ): Promise<AssetManagementModels.AssetTypeResource> {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;
        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets/${id}/fileAssignments/${key}?${toQueryString({ includeShared })}`,
            body: assignment,
            additionalHeaders: { "If-Match": ifMatch },
        });

        return result as AssetManagementModels.AssetTypeResource;
    }

    /**
     * * Asset
     *
     * Deletes a file assignment from an asset.
     * If the asset parent type has defined a file with the same key, the key will be displayed with the inherited value.
     *
     * @param {string} id The type id is a unique identifier. The id length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9","_" and "." beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {string} key Keyword for the file to be assigned to an asset or asset type.
     * @param {AssetManagementModels.KeyedFileAssignment} assignment Data for file assignment
     * @param {{ ifMatch: string; includeShared?: boolean }} params
     * @param {{number}} params.ifMatch Last known version to facilitate optimistic locking
     *
     * @memberOf AssetManagementClient
     */
    public async DeleteAssetFileAssignment(
        id: string,
        key: string,
        params: { ifMatch: string; includeShared?: boolean }
    ) {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets/${id}/fileAssignments/${key}?${toQueryString({ includeShared })}`,
            additionalHeaders: { "If-Match": ifMatch },
            noResponse: true,
        });
    }

    /**
     * * Asset
     * Returns the root asset of the user.
     * Read the root asset of the user, from which the whole asset hierarchy can be rebuilt.
     *
     * @returns {Promise<AssetManagementModels.RootAssetResource>}
     *
     * @memberOf AssetManagementClient
     */
    public async GetRootAsset(): Promise<AssetManagementModels.RootAssetResource> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets/root`,
        });
        return result as AssetManagementModels.RootAssetResource;
    }

    /**
     * * Asset Structure
     * Get all static and dynamic aspects of a given asset
     *
     * @param {string} assetId
     * @param {{
     *             page?: number;
     *             size?: number;
     *             sort?: string;
     *             filter?: string;
     *             ifNoneMatch?: number;
     *             includeShared?: number;
     *         }} [params]
     * @param [params.page] Specifies the requested page index
     * @param [params.size] Specifies the number of elements in a page
     * @param [params.sort] Specifies the ordering of returned elements
     * @param [params.filter] Specifies the additional filtering criteria
     * @param [params.ifnonematch] ETag hash of previous request to allow caching
     * @param [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     *
     * @returns {Promise<AssetManagementModels.AspectListResource>}
     *
     * @memberOf AssetManagementClient
     */
    public async GetAspects(
        assetId: string,
        params?: {
            page?: number;
            size?: number;
            sort?: string;
            filter?: string;
            ifNoneMatch?: number;
            includeShared?: number;
        }
    ): Promise<AssetManagementModels.AspectListResource> {
        const parameters = params || {};
        const { page, size, sort, filter, ifNoneMatch, includeShared } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets/${assetId}/aspects?${toQueryString({
                page,
                size,
                sort,
                filter,
                includeShared,
            })}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch },
        });
        return result as AssetManagementModels.AspectListResource;
    }

    /**
     * * Asset Structure
     * Get all variables of a given asset including inherited ones
     *
     * @param {string} assetId
     * @param {{
     *             page?: number;
     *             size?: number;
     *             sort?: string;
     *             filter?: string;
     *             ifNoneMatch?: number;
     *             includeShared?: boolean;
     *         }} [params]
     * @param [params.page] Specifies the requested page index
     * @param [params.size] Specifies the number of elements in a page
     * @param [params.sort] Specifies the ordering of returned elements
     * @param [params.filter] Specifies the additional filtering criteria
     * @param [params.ifnonematch] ETag hash of previous request to allow caching
     * @param [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     *
     * @returns {Promise<AssetManagementModels.AspectListResource>}
     *
     * @memberOf AssetManagementClient
     */
    public async GetVariables(
        assetId: string,
        params?: {
            page?: number;
            size?: number;
            sort?: string;
            filter?: string;
            ifNoneMatch?: number;
            includeShared?: boolean;
        }
    ): Promise<AssetManagementModels.VariableListResource> {
        const parameters = params || {};
        const { page, size, sort, filter, ifNoneMatch, includeShared } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets/${assetId}/variables?${toQueryString({
                page,
                size,
                sort,
                filter,
                includeShared,
            })}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch },
        });
        return result as AssetManagementModels.VariableListResource;
    }

    /**
     * * Asset Location
     *
     * Create or Update location assigned to given asset
     *
     * * If the given asset has own location, this endpoint will update that location.
     * * If the given asset has no location, this endpoint will create a new location and update the given asset.
     * * If the given asset has inherited location, this endpoint will create a new location and update the given asset.
     * * If you wanted to update the inherited location you have to use the location url in AssetResource object (with PUT method).
     *
     * @param {string} id The type id is a unique identifier. The id length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9","_" and "." beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {AssetManagementModels.Location} location Data for location
     * @param {{ ifMatch: string; includeShared ?: boolean }} params
     * @param {{number}} params.ifMatch Last known version to facilitate optimistic locking
     * @param {{boolean}} [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     * @returns {Promise<AssetManagementModels.Location>}
     *
     * ! fix: 3.11. : the swagger documentation says that the method is returning Location but it returns AssetResourceWithHierarchyPath
     *
     * @memberOf AssetManagementClient
     */
    public async PutAssetLocation(
        id: string,
        location: AssetManagementModels.Location,
        params: { ifMatch: string; includeShared?: boolean }
    ): Promise<AssetManagementModels.AssetResourceWithHierarchyPath> {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;
        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets/${id}/location?${toQueryString({ includeShared })}`,
            body: location,
            additionalHeaders: { "If-Match": ifMatch },
        });

        return result as AssetManagementModels.AssetResourceWithHierarchyPath;
    }

    /**
     * * Asset Location
     *
     * Delete location assigned to given asset.
     *
     * * Only those locations can be deleted here which assigned to the given asset.
     * * If the location inherited from an ancestor asset, you have to delete the location with the assigned assetId (using location url in AssetResource object with DELETE method).
     * * The response contains the updated AssetResource with the inherited Location details.
     *
     * @param {string} id The type id is a unique identifier. The id length must be between 1 and 128 characters and matches the following symbols "A-Z", "a-z", "0-9","_" and "." beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id)
     * @param {AssetManagementModels.Location} location Data for location
     * @param {{ ifMatch: string; includeShared?: boolean  }} params
     * @param {{number}} params.ifMatch Last known version to facilitate optimistic locking
     * @param {{boolean}} [params.includeShared] Specifies if the operation should take into account shared (received) assets, aspects and asset types.
     * @returns {Promise<AssetManagementModels.AssetResourceWithHierarchyPath>}
     *
     * @memberOf AssetManagementClient
     */
    public async DeleteAssetLocation(id: string, params: { ifMatch: string; includeShared?: boolean }) {
        const parameters = params || {};
        const { ifMatch, includeShared } = parameters;
        const result = await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/assets/${id}/location?${toQueryString({ includeShared })}`,
            additionalHeaders: { "If-Match": ifMatch },
        });

        return result as AssetManagementModels.AssetResourceWithHierarchyPath;
    }

    /**
     * * Asset Files
     *
     * Upload files to be used in Asset Management.
     *
     * @param {Buffer} file
     * @param {string} name
     * @param {{
     *             scope?: AssetManagementModels.FileMetadataResource.ScopeEnum;
     *             description?: string;
     *             mimeType?: string;
     *         }} [params]
     * @returns {Promise<AssetManagementModels.FileMetadataResource>}
     *
     * @memberOf AssetManagementClient
     */
    public async PostFile(
        file: Buffer,
        name: string,
        params?: {
            scope?: AssetManagementModels.FileMetadataResource.ScopeEnum;
            description?: string;
            mimeType?: string;
        }
    ): Promise<AssetManagementModels.FileMetadataResource> {
        const parameters = params || {};
        const { scope, description, mimeType } = parameters;

        const template = `----mindsphere\r\nContent-Disposition: form-data; name="file"; filename="${name}"\r\nContent-Type: ${
            mimeType || "application/octet-stream"
        }\r\n\r\n${file.toString(
            "ascii"
        )}\r\n----mindsphere\r\nContent-Disposition: form-data; name="name"\r\n\r\n${name}\r\n----mindsphere\r\nContent-Disposition: form-data; name="description"\r\n\r\n${
            description || "uploaded file"
        }\r\n\----mindsphere\r\nContent-Disposition: form-data; name="scope"\r\n\r\n${
            scope || "PRIVATE"
        }\r\n----mindsphere--`;

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files`,
            body: template,
            multiPartFormData: true,
        });

        return result as AssetManagementModels.FileMetadataResource;
    }

    /**
     * * Asset files
     *
     * Get metadata of uploaded files.
     * Returns all visible file metadata for the tenant. Will NOT return the files.
     *
     * @param {{
     *         page?: number;
     *         size?: number;
     *         sort?: string;
     *         filter?: string;
     *         ifNoneMatch?: number;
     *     }} [params]
     * * @param {{
     *             page?: number;
     *             size?: number;
     *             sort?: string;
     *             filter?: string;
     *             ifNoneMatch?: number;
     *         }} [params]
     * @param [params.page] Specifies the requested page index
     * @param [params.size] Specifies the number of elements in a page
     * @param [params.sort] Specifies the ordering of returned elements
     * @param [params.filter] Specifies the additional filtering criteria
     * @param [params.ifnonematch] ETag hash of previous request to allow caching

     * @returns {Promise<AssetManagementModels.FileMetadataListResource>}
     *
     * @memberOf AssetManagementClient
     */
    public async GetFiles(params?: {
        page?: number;
        size?: number;
        sort?: string;
        filter?: string;
        ifNoneMatch?: number;
    }): Promise<AssetManagementModels.FileMetadataListResource> {
        const parameters = params || {};
        const { page, size, sort, filter, ifNoneMatch } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files?${toQueryString({ page, size, sort, filter })}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch },
        });

        return result as AssetManagementModels.FileMetadataListResource;
    }

    /**
     * * Asset Files
     *
     * Get metadata of uploaded files.
     *
     * @param {string} fileId
     * @param {{
     *             ifNoneMatch?: number;
     *         }} [params]
     * @returns {Promise<AssetManagementModels.FileMetadataResource>}
     *
     * @memberOf AssetManagementClient
     */
    public async GetFile(
        fileId: string,
        params?: {
            ifNoneMatch?: number;
        }
    ): Promise<AssetManagementModels.FileMetadataResource> {
        const parameters = params || {};
        const { ifNoneMatch } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${fileId}`,
            additionalHeaders: { "If-None-Match": ifNoneMatch },
        });
        return result as AssetManagementModels.FileMetadataResource;
    }

    /**
     * Returns a file by its id
     *
     * @param {string} fileId
     * @param {{
     *             ifNoneMatch?: number;
     *         }} [params]
     * @returns {Promise<Response>} Response Context Type is base64
     *
     * @memberOf AssetManagementClient
     */
    public async DownloadFile(
        fileId: string,
        params?: {
            ifNoneMatch?: number;
        }
    ): Promise<Response> {
        const parameters = params || {};
        const { ifNoneMatch } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${fileId}/file`,
            additionalHeaders: { "If-None-Match": ifNoneMatch },
            rawResponse: true,
        });
        return result as Response;
    }

    /**
     * * Asset Files
     *
     * Update a previously uploaded file.
     * Max file size is 5 MB.
     *
     * @param {string} fileid
     * @param {Buffer} file
     * @param {string} name
     * @param {{
     *             scope: AssetManagementModels.FileMetadataResource.ScopeEnum;
     *             description?: string;
     *             mimeType?: string;
     *             ifMatch: string;
     *         }} params
     * @returns {Promise<AssetManagementModels.FileMetadataResource>}
     *
     * @memberOf AssetManagementClient
     */
    public async PutFile(
        fileid: string,
        file: Buffer,
        name: string,
        params: {
            scope: AssetManagementModels.FileMetadataResource.ScopeEnum;
            description?: string;
            mimeType?: string;
            ifMatch: string;
        }
    ): Promise<AssetManagementModels.FileMetadataResource> {
        const parameters = params || {};
        const { scope, description, mimeType, ifMatch } = parameters;

        const template = `----mindsphere\r\nContent-Disposition: form-data; name="file"; filename="${name}"\r\nContent-Type: ${
            mimeType || "application/octet-stream"
        }\r\n\r\n${file}\r\n----mindsphere\r\nContent-Disposition: form-data; name="name"\r\n\r\n${name}\r\n----mindsphere\r\nContent-Disposition: form-data; name="description"\r\n\r\n${
            description || "uploaded file"
        }\r\n\----mindsphere\r\nContent-Disposition: form-data; name="scope"\r\n\r\n${
            scope || "PRIVATE"
        }\r\n----mindsphere--`;

        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${fileid}`,
            body: template,
            multiPartFormData: true,
            additionalHeaders: { "If-Match": ifMatch },
        });

        return result as AssetManagementModels.FileMetadataResource;
    }

    /**
     * * Asset Files
     *
     * Delete a file
     * Deletion is blocked if there are any file assignment with the given fileId.
     *
     * @param {string} fileId
     * @param {{ ifMatch: string }} params
     *
     * @memberOf AssetManagementClient
     */
    public async DeleteFile(fileId: string, params: { ifMatch: string }) {
        const parameters = params || {};
        const { ifMatch } = parameters;
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${fileId}`,
            additionalHeaders: { "If-Match": ifMatch },
            noResponse: true,
        });
    }

    /**
     * List all links for available resources
     *
     * @returns {Promise<AssetManagementModels.BillboardResource>}
     *
     * @memberOf AssetManagementClient
     */
    public async GetBillboard(): Promise<AssetManagementModels.BillboardResource> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/`,
        });

        return result as AssetManagementModels.BillboardResource;
    }
}
