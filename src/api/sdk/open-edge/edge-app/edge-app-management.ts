// noinspection JSValidateJSDoc

import { toQueryString } from "../../../utils";
import { SdkClient } from "../../common/sdk-client";
import { EdgeAppInstanceModels } from "./edge-app-models";

/**
 * Edge App Instance Management API
 *  Edge App Instance Management API can be used to synchronize the edge application instance runtime lifecycle and applied configuration values. The provided operations do not realize the runtime or configuration changes directly to edge application instances. Instead, they are meant as a synchronization point for user-facing applications and applications realizing the changes.   Two resources are offered: application instances model the runtime lifecycle of an edge application instance. An edge application instance can be started or stopped. Instance configuration resources assign a configuration consisting of key-value pairs to an edge application instance running on a device. It is possible to assign individual configurations for different instances running on the same device.
 *
 * @export
 * @class EdgeAppInstanceManagementClient
 * @extends {SdkClient}
 */
export class EdgeAppInstanceManagementClient extends SdkClient {
    private _baseUrl: string = "/api/edgeappinstancemanagement/v3";

    /**
     * Get all instance configurations by deviceId.
     * @summary Get Instance Configurations for a specific device
     * @param {string} deviceId ID of the device
     * @param {number} [size] The maximum number of elements returned in one page
     * @param {number} [page] The (0-based) index of the page
     * @param {string} [sort] The order in which the elements are returned. Multiple fields could be used spearated by comma
     * @returns {Promise<EdgeAppInstanceModels.PaginatedInstanceConfigurationResource>}
     * @throws {EdgeAppInstanceModels.RequiredError}
     *
     * @example await edgeAppInstanceManagementClient.GetAppInstanceConfigurations("mdsp.EnvironmentDevice")
     * @memberof EdgeAppInstanceManagementClient
     */
    public async GetAppInstanceConfigurations(
        deviceId: string,
        size?: number,
        page?: number,
        sort?: string
    ): Promise<EdgeAppInstanceModels.PaginatedInstanceConfigurationResource>  {
        // verify required parameter 'deviceId' is not null or undefined
        if (deviceId === null || deviceId === undefined) {
            throw new EdgeAppInstanceModels.RequiredError(
                "deviceId",
                "Required parameter deviceId was null or undefined when calling GetAppInstanceConfigurations."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/instanceConfigurations?${toQueryString({ deviceId, size, page, sort })}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as EdgeAppInstanceModels.PaginatedInstanceConfigurationResource;
    }

    /**
     * Get an instance configuration by id.
     * @summary Get Instance Configuration
     * @param {string} id ID of the application instance
     * @returns {Promise<EdgeAppInstanceModels.InstanceConfigurationResource>}
     * @throws {EdgeAppInstanceModels.RequiredError}
     *
     * @example await edgeAppInstanceManagementClient.GetAppInstanceConfiguration("myAppInstanceConfiguration")
     * @memberOf EdgeAppInstanceManagementClient
     */
    public async GetAppInstanceConfiguration(id: string): Promise<EdgeAppInstanceModels.InstanceConfigurationResource> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new EdgeAppInstanceModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetAppInstanceConfiguration."
            );
        }
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/instanceConfigurations/${id}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as EdgeAppInstanceModels.InstanceConfigurationResource;
    }

    /**
     * Deletes an instance configuration.
     * @summary Delete Instance Configuration
     * @param {string} id ID of the application instance
     * @throws {EdgeAppInstanceModels.RequiredError}
     *
     * @example await edgeAppInstanceManagementClient.DeleteAppInstanceConfiguration("mdsp.EnvironmentDeviceAppConf")
     *
     * @memberOf EdgeAppInstanceManagementClient
     */
    public async DeleteAppInstanceConfiguration(id: string) {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new EdgeAppInstanceModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling instanceConfigurationsIdDelete."
            );
        }

        const baseUrl = `${this._baseUrl}/instanceConfigurations/${id}`
            .replace(`{${"id"}}`, encodeURIComponent(String(id)));

        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: baseUrl,
            noResponse: true,
        });
    }

    /**
     * Creates a new instance configuration for the given device id and application instance id with the given content.
     * @summary Create instance configuration
     * @param {EdgeAppInstanceModels.InstanceConfiguration} instanceConfiguration Instance configuration object
     * @returns {Promise<EdgeAppInstanceModels.InstanceConfigurationResource>}
     *
     * @example await edgeAppInstanceManagementClient.PostAppInstanceConfigurations(myAppInstanceConfiguration)
     * @memberOf EdgeAppInstanceManagementClient
     */
    public async PostAppInstanceConfigurations(
        instanceConfiguration: EdgeAppInstanceModels.InstanceConfiguration
    ): Promise<EdgeAppInstanceModels.InstanceConfigurationResource> {
        // verify required parameter 'instanceConfiguration' is not null or undefined
        if (instanceConfiguration === null || instanceConfiguration === undefined) {
            throw new EdgeAppInstanceModels.RequiredError(
                "instanceConfiguration",
                "Required parameter instanceConfiguration was null or undefined when calling PostAppInstanceConfigurations.");
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/instanceConfigurations`,
            body: instanceConfiguration,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as EdgeAppInstanceModels.InstanceConfigurationResource;
    }

    /**
     * Patch update for the instance configurations. The list length can be maximum 100.
     * @summary Processes instance configuration
     * @param {EdgeAppInstanceModels.ProcessInstanceConfiguration} configurations List of configuration per instance
     *
     * @example await edgeAppInstanceManagementClient.PatchAppInstanceConfigurations(myNewAppInstanceConfiguration)
     * @memberOf EdgeAppInstanceManagementClient
     */
    public async PatchAppInstanceConfigurations(
        configurations: EdgeAppInstanceModels.ProcessInstanceConfiguration
    ) {
        // verify required parameter 'configurations' is not null or undefined
        if (configurations === null || configurations === undefined) {
            throw new EdgeAppInstanceModels.RequiredError(
                "configurations",
                "Required parameter configurations was null or undefined when calling PatchAppInstanceConfigurations.");
        }

        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/instanceConfigurations`,
            body: configurations,
            additionalHeaders: { "Content-Type": "application/json" },
        });
    }

    /**
     * Updates the specified instance configuration.
     * @summary Update Configuration Data
     * @param {string} id ID of the application instance
     * @param {EdgeAppInstanceModels.InstanceConfiguration} instanceConfiguration Configuration Content
     * @returns {Promise<EdgeAppInstanceModels.InstanceConfigurationResource>}
     *
     * @example await edgeAppInstanceManagementClient.PatchAppInstanceConfigurationData("mdsp.EnvironmentDeviceAppConf", myNewConfigurationData)
     * @memberOf EdgeAppInstanceManagementClient
     */
    public async PatchAppInstanceConfigurationData(
        id: string,
        instanceConfiguration: EdgeAppInstanceModels.InstanceConfiguration
    ): Promise<EdgeAppInstanceModels.InstanceConfigurationResource> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new EdgeAppInstanceModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PatchAppInstanceConfigurationData."
            );
        }
        // verify required parameter 'instanceConfiguration' is not null or undefined
        if (instanceConfiguration === null || instanceConfiguration === undefined) {
            throw new EdgeAppInstanceModels.RequiredError(
                "instanceConfiguration",
                "Required parameter instanceConfiguration was null or undefined when calling PatchAppInstanceConfigurationData."
            );
        }

        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/instanceConfigurations/${id}`,
            body: instanceConfiguration,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as EdgeAppInstanceModels.InstanceConfigurationResource;
    }
}
