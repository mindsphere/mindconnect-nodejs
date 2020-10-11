import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { DataLakeModels } from "./data-lake.models";

export class DataLakeClient extends SdkClient {
    private _baseUrl: string = "/api/datalake/v3";

    /**
     * * Allows users to request temporary, limited-privilege AWS credentials to get read-only or write-only access on the URI returned in the response.
     * * Read permission will always be on the root level.
     * * Path field is optional for READ permission - If value for path is not provided then it will be considered on root level (“/”).
     * * Ensure to enable write access on the path before requesting token with write permission.
     * * Write access can be enabled using POST /accessTokenPermissions endpoint.
     * * An access token requested for a given path also automatically gives access to all subpaths of the path. For example, if an access token is requested for path /a and there are subpaths /a/b and /a/b/c, the token allows to access those too.
     * * An access token with write permissions can only be requested for the paths defined by resource accessTokenPermissions. An acecss token with read permissions can only be requested for the root path /.
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
     * List all folders having write permission.
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
     * Details of the write folder request for the given id
     * Details of the write folder request for the given id
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
     * Delete write permission on folder for the given id
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
