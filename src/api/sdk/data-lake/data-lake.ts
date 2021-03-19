import fetch from "cross-fetch";
import * as fs from "fs";
import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { DataLakeModels } from "./data-lake.models";
const HttpsProxyAgent = require("https-proxy-agent");

export class DataLakeClient extends SdkClient {
    private _baseUrl: string = "/api/datalake/v3";

    /**
     * * Object Metadata Catalog Operations
     *
     * Get Metadata for the object. If tenant is operating for a subtenant object,
     * he should specify subtenant in request query parameter.
     * If path contains special characters which require URL encoding, it should be done as appropriate.
     *
     * @param {string} path  path of an object denoting folders and object name. e.g. basefolder/subfolder/objectname.objectext
     * @param {{ subtenantid?: string }} [optional]  Only to be used by tenants, to address a subtenants object metadata. If not provided by a tenant, its own object metadata is addressed. Subtenants are not allowed to use this parameter and can only address their own object metadata. e.g. subtenantId 204a896c-a23a-11e9-a2a3-2a2ae2dbcce4
     * @returns {Promise<DataLakeModels.ObjectMetaDataResponse>}
     *
     * @memberOf DataLakeClient
     */
    public async GetObjectMetaData(
        path: string,
        optional?: { subtenantid?: string }
    ): Promise<DataLakeModels.ObjectMetaDataResponse> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/objectMetadata/${path}?${toQueryString(optional)}`,
        })) as DataLakeModels.ObjectMetaDataResponse;
    }

    /**
     * * Object Metadata Catalog Operations
     *
     * Get a list of metadata information with a filter
     *
     * @param {string} path
     * @param {{ filter: string; subtenantid?: string; size?: number; page?: number }} params
     * @returns {Promise<DataLakeModels.SearchResponse>}
     *
     * @memberOf DataLakeClient
     */
    public async GetObjectMetaDatas(
        path: string,
        params: { filter: string; subtenantid?: string; size?: number; page?: number }
    ): Promise<DataLakeModels.SearchResponse> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/objectMetadata/${path}?${toQueryString(params)}`,
        })) as DataLakeModels.SearchResponse;
    }

    /**
     *
     * * Object Metadata Catalog Operations
     *
     * Create/Update metadata. If tenant is operating for a subtenant object,
     * he should specify subtenant in request query parameter.
     * If path contains special characters which require URL encoding, it should be done as appropriate.
     * Maximum 8 tags are allowed, where each tag can be maximum 128 characters.
     *
     * @param {string} path  path of an object denoting folders and object name. e.g. basefolder/subfolder/objectname.objectext
     * @param {DataLakeModels.Metadata}  Metadata
     * @param {{ subtenantid?: string }} [optional]  Only to be used by tenants, to address a subtenants object metadata. If not provided by a tenant, its own object metadata is addressed. Subtenants are not allowed to use this parameter and can only address their own object metadata. e.g. subtenantId 204a896c-a23a-11e9-a2a3-2a2ae2dbcce4
     * @returns
     *
     * @memberOf DataLakeClient
     */
    public async PutObjectMetaData(
        path: string,
        metadata: DataLakeModels.Metadata,
        optional?: { subtenantid?: string }
    ) {
        return await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            body: metadata,
            baseUrl: `${this._baseUrl}/objectMetadata/${path}?${toQueryString(optional)}`,
        });
    }

    /**
     *
     * * Object Access Operations
     *
     * * Generate signed URLs to upload an object.
     *
     * @param {DataLakeModels.GenerateUrlPayload} generateUrlPayload
     * upload payload with path details array and optional subtenant id
     * @returns
     *
     * @memberOf DataLakeClient
     */
    public async GenerateUploadObjectUrls(
        generateUrlPayload: DataLakeModels.GenerateUrlPayload
    ): Promise<DataLakeModels.SignedUrlResponse> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/generateUploadObjectUrls`,
            body: generateUrlPayload,
        })) as DataLakeModels.SignedUrlResponse;
    }

    /**
     *
     * * Object Access Operations
     *
     * * Generate signed URLs to download an object
     *
     * @param {DataLakeModels.GenerateUrlPayload} generateUrlPayload
     * @returns {Promise<DataLakeModels.SignedUrlResponse>}
     *
     * @memberOf DataLakeClient
     */
    public async GenerateDownloadObjectUrls(
        generateUrlPayload: DataLakeModels.GenerateUrlPayload
    ): Promise<DataLakeModels.SignedUrlResponse> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/generateDownloadObjectUrls`,
            body: generateUrlPayload,
        })) as DataLakeModels.SignedUrlResponse;
    }

    /**
     * * Object Access Operations
     * * Upload file to data lake via pre-signed URL
     *
     * @param {(string | Buffer)} file
     * @param {string} signedUrl
     * @returns {Promise<Headers>}
     *
     * @memberOf DataLakeClient
     */
    public async PutFile(file: string | Buffer, signedUrl: string): Promise<Headers> {
        const myBuffer = typeof file === "string" ? fs.readFileSync(file) : (file as Buffer);

        const proxy = process.env.http_proxy || process.env.HTTP_PROXY;
        const proxyHttpAgent: any = proxy ? new HttpsProxyAgent(proxy) : null;

        // x-ms-blob is necessary on eu2 and is ignored on eu1
        const request: any = { method: "PUT", headers: { "x-ms-blob-type": "BlockBlob" }, agent: proxyHttpAgent };
        request.body = myBuffer;
        const response = await fetch(signedUrl, request);
        return response.headers;
    }

    /**
     * * Object Access Operations
     * * Create a cross account
     *
     * Create a cross account on which access needs to be given for paths.
     * If, in request body subtenant is denoted as "**", it is a special cross account.
     * In this case, on this cross account, tenant implicitly gets Read Only access to the storage
     * account's root level data path for itself and for all its subtenants.
     * For this case, the authorization token should be that of the tenant.
     *
     * @param {DataLakeModels.CrossAccountRequest} crossAccountRequest
     * @returns {Promise<DataLakeModels.CrossAccount>}
     *
     * @memberOf DataLakeClient
     */
    public async PostCrossAccount(
        crossAccountRequest: DataLakeModels.CrossAccountRequest
    ): Promise<DataLakeModels.CrossAccount> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/crossAccounts`,
            body: crossAccountRequest,
        })) as DataLakeModels.CrossAccount;
    }

    /**
     * * Object Access Operations
     * * Get list of cross accounts on which access was given.
     *
     * If requester is tenant, all the cross account for the tenant as well as its all subtenants are returned.
     * If requester is a subtenant, all the cross accounts for the subtenant are returned.
     * If tenant wants to filter results for a particular subtenant, filter query parameter subtenantId can be used. This filter query parameter is applicable only if the requester is tenant.
     *
     * @param {{
     *         page?: number;
     *         size?: number;
     *         filter?: string;
     *     }} [params]
     * @returns {Promise<DataLakeModels.CrossAccountListResource>}
     *
     * @memberOf DataLakeClient
     */
    public async GetCrossAccounts(params?: {
        page?: number;
        size?: number;
        filter?: string;
    }): Promise<DataLakeModels.CrossAccountListResource> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/crossAccounts?${toQueryString(params)}`,
        })) as DataLakeModels.CrossAccountListResource;
    }

    /**
     *
     * * Object Access Operations
     * * Get details of selected cross account.
     *
     * @param {string} id unique identifier of the cross account
     * @returns {Promise<DataLakeModels.CrossAccount>}
     *
     * @memberOf DataLakeClient
     */
    public async GetCrossAccount(id: string): Promise<DataLakeModels.CrossAccount> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/crossAccounts/${id}`,
        })) as DataLakeModels.CrossAccount;
    }

    /**
     * * Object Access Operations
     * * Update a cross account on which access needs to be managed.
     *
     * @param {string} id
     * @param {DataLakeModels.CrossAccountUpdateRequest} crossAccountUpdateRequest
     * @param {{ ifMatch: number }} params
     * @returns {Promise<DataLakeModels.CrossAccount>}
     *
     * @memberOf DataLakeClient
     */
    public async PatchCrossAccount(
        id: string,
        crossAccountUpdateRequest: DataLakeModels.CrossAccountUpdateRequest,
        params: { ifMatch: number }
    ): Promise<DataLakeModels.CrossAccount> {
        return (await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/crossAccounts/${id}`,
            additionalHeaders: { "If-Match": params.ifMatch },
            body: crossAccountUpdateRequest,
        })) as DataLakeModels.CrossAccount;
    }

    /**
     * * Object Access Operations
     * * Delete cross account and corresponding accesses.
     *
     * @param {string} id
     * @param {{ ifMatch: number }} params
     * @returns
     *
     * @memberOf DataLakeClient
     */
    public async DeleteCrossAccount(id: string, params: { ifMatch: number }) {
        return await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/crossAccounts/${id}`,
            additionalHeaders: { "If-Match": params.ifMatch },
            noResponse: true,
        });
    }

    /**
     * * Object Access Operations
     * * Create a cross account access.
     * If the cross account is created for tenant and all subtenants (**),
     * then this operation is implicitly handled and not allowed through API.
     * Maximum 5 cross account accesses can be created with ENABLED status.
     * Maximum 10 cross accounts can be created with DISABLED status.
     * @param {string} id
     * @param {DataLakeModels.CrossAccountAccessRequest} crossAccountAccessRequest
     * @returns {Promise<DataLakeModels.CrossAccountAccess>}
     *
     * @memberOf DataLakeClient
     */
    public async PostCrossAccountAccess(
        id: string,
        crossAccountAccessRequest: DataLakeModels.CrossAccountAccessRequest
    ): Promise<DataLakeModels.CrossAccountAccess> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/crossAccounts${id}/accesses`,
            body: crossAccountAccessRequest,
        })) as DataLakeModels.CrossAccountAccess;
    }

    /**
     * * Object Access Operations
     * *Get list of cross account accesses.
     *
     * @param {string} id
     * @param {{
     *             page?: number;
     *             size?: number;
     *         }} [params]
     * @returns {Promise<DataLakeModels.CrossAccountAccessListResource>}
     *
     * @memberOf DataLakeClient
     */
    public async GetCrossAccountAccesses(
        id: string,
        params?: {
            page?: number;
            size?: number;
        }
    ): Promise<DataLakeModels.CrossAccountAccessListResource> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/crossAccounts/${id}/accesses?${toQueryString(params)}`,
        })) as DataLakeModels.CrossAccountAccessListResource;
    }

    /**
     * * Object Access Operations
     * * Get a selected access for a selected cross account.
     *
     * @param {string} id
     * @param {string} accessId
     * @returns {Promise<DataLakeModels.CrossAccountAccess>}
     *
     * @memberOf DataLakeClient
     */
    public async GetCrossAccountAccess(id: string, accessId: string): Promise<DataLakeModels.CrossAccountAccess> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/crossAccounts/${id}/accesses/${accessId}`,
        })) as DataLakeModels.CrossAccountAccess;
    }

    /**
     * * Object Access Operations
     * * Update a cross account access.
     *
     * This operation is not allowed when the cross account is created
     * for special case of tenant and all subtenants (**).
     * Maximum 5 cross account accesses can be present with ENABLED status.
     * Maximum 10 cross accounts can be present with DISABLED status.
     *
     * @param {string} id
     * @param {string} accessId
     * @param {DataLakeModels.CrossAccountAccessRequest} crossAcccountAccessRequest
     * @param {{ ifMatch: number }} params
     * @returns {Promise<DataLakeModels.CrossAccountAccess>}
     *
     * @memberOf DataLakeClient
     */
    public async PatchCrossAccountAccess(
        id: string,
        accessId: string,
        crossAcccountAccessRequest: DataLakeModels.CrossAccountAccessRequest,
        params: { ifMatch: number }
    ): Promise<DataLakeModels.CrossAccountAccess> {
        return (await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/crossAccounts/${id}/accesses/${accessId}`,
            body: crossAcccountAccessRequest,
            additionalHeaders: { "If-Match": params.ifMatch },
        })) as DataLakeModels.CrossAccountAccess;
    }

    /**
     * * Delete a cross account access.
     *
     * If the cross account is created for tenant and all subtenants (**),
     * then this operation is implicitly handled by deletion of cross account and not allowed through API
     *
     *
     * @param {string} id
     * @param {string} accessId
     * @param {{ ifMatch: number }} params
     * @returns
     *
     * @memberOf DataLakeClient
     */
    public async DeleteCrossAccountAccess(id: string, accessId: string, params: { ifMatch: number }) {
        return await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/crossAccounts/${id}/accesses/${accessId}`,
            additionalHeaders: { "If-Match": params.ifMatch },
            noResponse: true,
        });
    }

    /**
     * * Object Event Subscription Operations
     * * Create Object Event Subscription
     *
     * Allows users to subscribe for event notifications generated
     * when the objects of a tenant or subtenant are created,
     * updated, or deleted. Multiple subscriptions for the same path
     * can be created when each has a different destination. Similarly, multiple subscriptions
     * for the same destination can be created when each has a different path.
     * Maximum 15 subscriptions can be created for a tenant or for a subtenant.
     * Path in request payload should be upto folders and not upto object e.g. "myfolder/mysubfolder"
     * Notification Content
     * Based on the configured subscriptions, event notification
     * messages are published to the destination.
     * The event notification content is formatted in JSON according to this example.
     * If object operation happened in subtenant folder, both tenantId and subtenantId
     * will be part of the message. If object operation happened in tenant folder, only
     * tenantId will be part of the message.:
     *
     * @param {DataLakeModels.Subscription} subscription
     * @returns {Promise<DataLakeModels.Subscription>}
     *
     * @memberOf DataLakeClient
     */
    public async PostObjectEventSubscriptions(
        subscription: DataLakeModels.Subscription
    ): Promise<DataLakeModels.Subscription> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/objectEventSubscriptions`,
            body: subscription,
        })) as DataLakeModels.Subscription;
    }

    /**
     * * Object Event Subscription Operations
     * * List object event subscriptions for the tenant or subtenant.
     *
     * If requester is tenant, all the subscriptions for the tenant as well as its all
     * subtenants are returned. If requester is a subtenant, all the subscriptions for
     * the subtenant are returned. If tenant wants to filter results for a particular subtenant,
     * filter query parameter subtenantId can be used. This filter query parameter is applicable
     * only if the requester is tenant.
     *
     * @param {{
     *         page?: number;
     *         size?: number;
     *         filter?: string;
     *     }} [params]
     * @param params.filter
     * JSON-based filter expression. Supported values: 'subtenantId'. Supported operations: 'eq'.
     * Decoded example value:
     * @example { "subtenantId": "204a896c-a23a-11e9-a2a3-2a2ae2dbcce4" }
     *
     * @returns {Promise<DataLakeModels.SubscriptionListResource>}
     *
     * @memberOf DataLakeClient
     */
    public async GetObjectEventSubscriptions(params?: {
        page?: number;
        size?: number;
        filter?: string;
    }): Promise<DataLakeModels.SubscriptionListResource> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/objectEventSubscriptions?${toQueryString(params)}`,
        })) as DataLakeModels.SubscriptionListResource;
    }

    /**
     * * Object Event Subscription Operations
     * * Read event subscription by id
     *
     * Read object event subscription for the tenant
     *
     * @param {string} id
     * @returns {Promise<DataLakeModels.SubscriptionResponse>}
     *
     * @memberOf DataLakeClient
     */
    public async GetObjectEventSubscription(id: string): Promise<DataLakeModels.SubscriptionResponse> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/objectEventSubscriptions/${id}`,
        })) as DataLakeModels.SubscriptionResponse;
    }

    /**
     * * Object Event Subscription Operations
     * * Update object event subscription by id
     *
     * @param {string} id
     * @param {DataLakeModels.SubscriptionUpdate} subscriptionUpdate
     * @param {{ ifMatch: number }} params
     * @returns {Promise<DataLakeModels.SubscriptionResponse>}
     *
     * @memberOf DataLakeClient
     */
    public async PatchObjectEventSubscription(
        id: string,
        subscriptionUpdate: DataLakeModels.SubscriptionUpdate,
        params: { ifMatch: number }
    ): Promise<DataLakeModels.SubscriptionResponse> {
        return (await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/objectEventSubscriptions/${id}`,
            additionalHeaders: { "If-Match": params.ifMatch },
            body: subscriptionUpdate,
        })) as DataLakeModels.SubscriptionResponse;
    }

    /**
     * * Object Event Subscription Operations
     * * Delete object event subscription by id
     *
     * @param {string} id
     * @param {{ ifMatch: number }} params
     * @returns
     *
     * @memberOf DataLakeClient
     */
    public async DeleteObjectEventSubscription(id: string, params: { ifMatch: number }) {
        return await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/objectEventSubscriptions/${id}`,
            additionalHeaders: { "If-Match": params.ifMatch },
            noResponse: true,
        });
    }

    /**
     * * Time Series Bulk Import Operations
     * * Creates a bulk import job of time series data into data
     *
     * Creates an asynchronous job to bulk import time series data into data lake.
     * The import takes into account time series data from the provided aspects associated to the provided assets,
     * in the given time range
     *
     * @param {DataLakeModels.ImportJobRequest} importJob
     * @returns {Promise<DataLakeModels.ImportJobResponse>}
     *
     * @memberOf DataLakeClient
     */
    public async PostTimeSeriesImportJob(
        importJob: DataLakeModels.ImportJobRequest
    ): Promise<DataLakeModels.ImportJobResponse> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/timeSeriesImportJobs`,
            body: importJob,
        })) as DataLakeModels.ImportJobResponse;
    }

    /**
     *
     * * Time Series Bulk Import Operations
     * * Query all time series bulk import jobs
     *
     * Query all time series bulk import jobs currently existing,
     * which are owned by the client's tenant or subtenant.
     * If requester is tenant, all the import jobs for the tenant as well as
     * its all subtenants are returned. If requester is a subtenant,
     * all the iport jobs for the subtenant are returned. If tenant wants to filter results
     * for a particular subtenant, filter query parameter subtenantId can be used.
     * This filter query parameter is applicable only if the requester is tenant.
     *
     * @param {{
     *         page?: number;
     *         size?: number;
     *         filter?: string;
     *     }} [params]
     * @param params.filter
     * JSON-based filter expression. Supported values: 'subtenantId'. Supported operations: 'eq'.
     * Decoded example value:
     * @example { "subtenantId": "204a896c-a23a-11e9-a2a3-2a2ae2dbcce4" }

     * @returns {Promise<DataLakeModels.ImportJobListResource>}
     *
     * @memberOf DataLakeClient
     */
    public async GetTimeSeriesImportJobs(params?: {
        page?: number;
        size?: number;
        filter?: string;
    }): Promise<DataLakeModels.ImportJobListResource> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/timeSeriesImportJobs?${toQueryString(params)}`,
        })) as DataLakeModels.ImportJobListResource;
    }

    /**
     * * Time Series Bulk Import Operations
     * * Retrieve status of time series bulk import job.
     *
     * @param {string} id
     * @returns {Promise<DataLakeModels.ImportJobResponse>}
     *
     * @memberOf DataLakeClient
     */
    public async GetTimeSeriesImportJob(id: string): Promise<DataLakeModels.ImportJobResponse> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/timeSeriesImportJobs/${id}`,
        })) as DataLakeModels.ImportJobResponse;
    }

    /**
     * * Time Series Bulk Import Operations
     * * Delete completed time series bulk import job.
     *
     * @param {string} id
     * @returns
     *
     * @memberOf DataLakeClient
     */
    public async DeleteTimeSeriesImportJob(id: string) {
        return await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/timeSeriesImportJobs/${id}`,
            noResponse: true,
        });
    }

    /**
     * * Time Series Bulk Import Operations
     * * Retreive details of a time series bulk import job.
     *
     * Details are only available once a job is not any longer in status PENDING.
     *
     * @param {string} id
     * @returns {Promise<DataLakeModels.ImportJobDetails>}
     *
     * @memberOf DataLakeClient
     */
    public async GetTimeSeriesImportJobDetails(id: string): Promise<DataLakeModels.ImportJobDetails> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/timeSeriesImportJobs/${id}/details`,
        })) as DataLakeModels.ImportJobDetails;
    }

    /**
     *
     * * Object Operations with Access Token
     *
     * Allows users to request temporary, limited-privilege AWS credentials to get read-only or write-only access on the URI returned in the response.
     * Read permission will always be on the root level.
     * Path field is optional for READ permission - If value for path is not provided then it will be considered on root level (/).
     * Ensure to enable write access on the path before requesting token with write permission.
     * Write access can be enabled using POST /accessTokenPermissions endpoint.
     * An access token requested for a given path also automatically gives access to all subpaths of the path. For example, if an access token is requested for path /a and there are subpaths /a/b and /a/b/c, the token allows to access those too.
     * An access token with write permissions can only be requested for the paths defined by resource accessTokenPermissions. An acecss token with read permissions can only be requested for the root path /.
     *
     * @param {DataLakeModels.GenerateSTSPayload} stsPayload
     * @returns {Promise<DataLakeModels.AccessTokens>}
     *
     * @memberOf DataLakeClient
     */
    public async GenerateAccessToken(
        stsPayload: DataLakeModels.GenerateSTSPayload
    ): Promise<DataLakeModels.AccessTokens> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/generateAccessToken`,
            body: stsPayload,
        })) as DataLakeModels.AccessTokens;
    }

    /**
     * * Object Operations with Access Token
     * * List all folders having write permission.
     * This API can be accessed by tenant admin, to list all write permission folders including of subtenants.
     * Subtenant can access this API, to get list write permission folders owned by subtenant.
     *
     * * Size parameter value should not be more than 1000.
     * @param {{
     *         page?: number;
     *         size?: number;
     *     }} [optional]
     * @returns {Promise<DataLakeModels.AccessTokenPermissionResources>}
     *
     * @memberOf DataLakeClient
     */
    public async GetAccessTokenPermissions(optional?: {
        page?: number;
        size?: number;
    }): Promise<DataLakeModels.AccessTokenPermissionResources> {
        const qs = toQueryString(optional);
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/accessTokenPermissions?${qs}`,
        })) as DataLakeModels.AccessTokenPermissionResources;
    }

    /**
     * * Object Operations with Access Token
     * * Details of the write folder request for the given id
     *
     * This API can be accessed by tenant admin, to get details of the request including for subtenants.
     * Subtenant can access this API, to get details of the request belongs to their write folder.
     * @param {string} id
     * @returns {Promise<DataLakeModels.AccessTokenPermissionResource>}
     *
     * @memberOf DataLakeClient
     */
    public async GetAccessTokenPermission(id: string): Promise<DataLakeModels.AccessTokenPermissionResource> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/accessTokenPermissions/${id}`,
        })) as DataLakeModels.AccessTokenPermissionResource;
    }

    /**
     * * Object Operations with Access Token
     * * Delete write permission on folder for the given id
     *
     * @param {string} id Unique identifier of the write enabled folders
     * @returns {Promise<DataLakeModels.AccessTokenPermissionResource>}
     *
     * @memberOf DataLakeClient
     */
    public async DeleteAccessTokenPermission(id: string) {
        return await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/accessTokenPermissions/${id}`,
            noResponse: true,
        });
    }

    /**
     * * Object Operations with Access Token
     * * Allows to give write premission on folder/path
     *
     * @param {DataLakeModels.AccessTokenPermissionRequest} writePathPayload
     * @returns {Promise<DataLakeModels.AccessTokenPermissionResource>}
     *
     * @memberOf DataLakeClient
     */
    public async PostAccessTokenPermissions(
        writePathPayload: DataLakeModels.AccessTokenPermissionRequest
    ): Promise<DataLakeModels.AccessTokenPermissionResource> {
        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/accessTokenPermissions`,
            body: writePathPayload,
        })) as DataLakeModels.AccessTokenPermissionResource;
    }
}
