import { SdkClient } from "../common/sdk-client";
import { TenantManagementModels } from "./tenant-management-models";

/**
 * The Tenant Management API provides endpoints for managing subtenants,
 * and the legal configuration and the basic properties of tenants
 *
 * @export
 * @class TenantManagementClient
 * @extends {SdkClient}
 */
export class TenantManagementClient extends SdkClient {
    private _baseUrl = "/api/tenantmanagement/v4";

    /**
     * Get the complete legal information configuration of current tenant
     *
     * @returns {Promise<TenantManagementModels.LegalConfiguration>}
     *
     * @memberOf TenantManagementClient
     */
    public async GetLegalConfigRegions(): Promise<TenantManagementModels.LegalConfiguration> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/legalConfigRegions`,
        });
        return result as TenantManagementModels.LegalConfiguration;
    }

    /**
     * Creates tenant legal information
     *
     * @param {TenantManagementModels.LegalConfiguration} legalConfig
     * @returns {Promise<TenantManagementModels.LegalConfigurationResource>}
     *
     * @memberOf TenantManagementClient
     */
    public async PostLegalConfigRegions(
        legalConfig: TenantManagementModels.LegalConfiguration
    ): Promise<TenantManagementModels.LegalConfigurationResource> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/legalConfigRegions`,
            body: legalConfig,
        });
        return result as TenantManagementModels.LegalConfigurationResource;
    }

    /**
     * Update a region configuration of current tenant
     *
     * @param {string} regionId
     * @param {TenantManagementModels.Region} region
     * @param {{ ifMatch: string }} params
     * @returns {Promise<TenantManagementModels.RegionResource>}
     *
     * @memberOf TenantManagementClient
     */
    public async PutLegalConfigRegions(
        regionId: string,
        region: TenantManagementModels.Region,
        params: { ifMatch: string }
    ): Promise<TenantManagementModels.RegionResource> {
        const parameters = params || {};
        const { ifMatch } = parameters;
        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/legalConfigRegions/${regionId}`,
            body: region,
            additionalHeaders: { "If-Match": ifMatch },
        });
        return result as TenantManagementModels.RegionResource;
    }

    /**
     * Delete legal Config Region
     *
     * @memberOf TenantManagementClient
     */
    public async DeleteLegalConfigRegions() {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/legalConfigRegions`,
            noResponse: true,
        });
    }

    /**
     * Get specific legal information
     *
     * ! Fix: This was manually created in 3.12.0 as MindSphere has a copy/paste error
     * ! saying that this method returns LegalConfiguration
     *
     * @returns {Promise<TenantManagementModels.LegalInfo>}
     *
     * @memberOf TenantManagementClient
     */
    public async GetLegalInfo(): Promise<TenantManagementModels.LegalInfo> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/legalInfo`,
        });
        return result as TenantManagementModels.LegalInfo;
    }

    /**
     * Get the region specific legal information for a given tenant with fallback logic to core tenant
     *
     * ! Fix: This was manually created in 3.12.0 as MindSphere has a copy/paste error
     * ! saying that this method returns LegalConfiguration
     *
     * @param {string} tenantId
     * @returns {Promise<TenantManagementModels.LegalInfo>}
     *
     * @memberOf TenantManagementClient
     */
    public async GetLegalInfoForTenant(tenantId: string): Promise<TenantManagementModels.LegalInfo> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/legalInfo/${tenantId}`,
        });
        return result as TenantManagementModels.LegalInfo;
    }

    /**
     * Get the region specific legal information for a given tenant without fallback logic
     *
     * ! Fix: This was manually created in 3.12.0 as MindSphere has a copy/paste error
     * ! saying that this method returns LegalConfiguration
     *
     * @param {string} tenantId
     * @returns {Promise<TenantManagementModels.LegalInfo>}
     *
     * @memberOf TenantManagementClient
     */
    public async GetLegalInfoForSpecificTenant(tenantId: string): Promise<TenantManagementModels.LegalInfo> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/legalInfoForSpecificTenant/${tenantId}`,
        });
        return result as TenantManagementModels.LegalInfo;
    }

    /**
     * Get tenant info
     *
     * @returns {Promise<TenantManagementModels.TenantInfo>}
     *
     * @memberOf TenantManagementClient
     */
    public async GetTenantInfo(): Promise<TenantManagementModels.TenantInfo> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/tenantInfo`,
        });
        return result as TenantManagementModels.TenantInfo;
    }

    /**
     * Patch tenant info
     *
     * @param {TenantManagementModels.TenantInfoUpdateProperties} tenantInfoUpdateProperties
     * @param {{ ifMatch: string }} params
     *
     * @memberOf TenantManagementClient
     */
    public async PatchTenantInfo(
        tenantInfoUpdateProperties: TenantManagementModels.TenantInfoUpdateProperties,
        params: { ifMatch: string }
    ) {
        const parameters = params || {};
        const { ifMatch } = parameters;

        await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/tenantInfo`,
            body: tenantInfoUpdateProperties,
            additionalHeaders: { "If-Match": ifMatch },
        });
    }

    /**
     * Get tenant logo
     *
     * @returns {Promise<Response>}
     *
     * @memberOf TenantManagementClient
     */
    public async GetTenantInfoLogo(): Promise<Response> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/tenantInfo/logo`,
            rawResponse: true,
        });
        return result as Response;
    }

    /**
     * Upload tenant logo
     *
     * @param {Buffer} file
     * @param {string} [name]
     * @param {string} [mimeType]
     * @returns {Promise<Response>}
     *
     * @memberOf TenantManagementClient
     */
    public async PostTenantInfoLogo(file: Buffer, name?: string, mimeType?: string): Promise<Response> {
        const template = `----mindsphere\r\nContent-Disposition: form-data; name="file"; filename="${name}"\r\nContent-Type: ${
            mimeType || "application/octet-stream"
        }\r\n\r\n`;

        const body = Buffer.concat([Buffer.from(template), file, Buffer.from("\r\n----mindsphere--")]);

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/tenantInfo/logo`,
            body: body,
            multiPartFormData: true,
            rawResponse: true,
            additionalHeaders: { enctype: "multipart/form-data" },
        });
        return result as Response;
    }

    /**
     * Get tenant logo metadata
     *
     * @returns {Promise<TenantManagementModels.UploadedFileResource>}
     *
     * @memberOf TenantManagementClient
     */
    public async GetTenantInfoLogoMetaData(): Promise<TenantManagementModels.UploadedFileResource> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/tenantInfo/logoMetaData`,
        });
        return result as TenantManagementModels.UploadedFileResource;
    }

    /**
     * Get subtenants
     *
     * @returns {Promise<TenantManagementModels.PageSubtenantResource>}
     *
     * @memberOf TenantManagementClient
     */
    public async GetSubtenants(): Promise<TenantManagementModels.PageSubtenantResource> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/subtenants`,
        });
        return result as TenantManagementModels.PageSubtenantResource;
    }

    /**
     * Create a subtenant
     *
     * @param {TenantManagementModels.Subtenant} subtenant
     * @returns {Promise<TenantManagementModels.SubtenantResource>}
     *
     * @memberOf TenantManagementClient
     */
    public async PostSubtenant(
        subtenant: TenantManagementModels.Subtenant
    ): Promise<TenantManagementModels.SubtenantResource> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/subtenants`,
            body: subtenant,
        });
        return result as TenantManagementModels.SubtenantResource;
    }

    /**
     * Get a subtenant by id.
     *
     * @param {string} id
     * @returns {Promise<TenantManagementModels.SubtenantResource>}
     *
     * @memberOf TenantManagementClient
     */
    public async GetSubtenant(id: string): Promise<TenantManagementModels.SubtenantResource> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/subtenants/${id}`,
        });
        return result as TenantManagementModels.SubtenantResource;
    }

    /**
     * Update a subtenant by id
     *
     * @param {string} id
     * @param {TenantManagementModels.SubtenantUpdateProperties} subtenantUpdateProperties
     * @param {{ ifMatch: string }} params
     * @returns {Promise<TenantManagementModels.SubtenantResource>}
     *
     * @memberOf TenantManagementClient
     */
    public async PutSubtenant(
        id: string,
        subtenantUpdateProperties: TenantManagementModels.SubtenantUpdateProperties,
        params: { ifMatch: string }
    ): Promise<TenantManagementModels.SubtenantResource> {
        const parameters = params || {};
        const { ifMatch } = parameters;
        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/subtenants/${id}`,
            body: subtenantUpdateProperties,
            additionalHeaders: { "If-Match": ifMatch },
        });
        return result as TenantManagementModels.SubtenantResource;
    }

    /**
     * Delete a subtenant by id
     *
     * @param {string} id
     *
     * @memberOf TenantManagementClient
     */
    public async DeleteSubtenant(id: string) {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/subtenants/${id}`,
            noResponse: true,
        });
    }
}
