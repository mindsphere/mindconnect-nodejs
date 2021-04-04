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
}
