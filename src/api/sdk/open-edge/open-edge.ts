// noinspection JSValidateJSDoc

import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { DeploymentWorkflowModels, DeviceConfigurationModels, DeviceManagementModels, DeviceStatusModels, EdgeAppInstanceModels } from "./open-edge-models";

/**
 * Device Management API
 * Device Managment API can be used by device builders to define device types and by device operators to manage device instances. At the moment, device types are only visible to the tenant creating them.  Devices are the basis for managing software and configuration in other edge APIs.     Each device is associated to a device type, which defines the firmware to be installed on the device. Once a device is created, the device type association cannot be changed anymore. Agents must be associated to devices to be able to access the Deployment Workflow API.
 *
 * @export
 * @class DeviceManagementClient
 * @extends {SdkClient}
 */
export class DeviceManagementClient extends SdkClient {
    private _baseUrl: string = "/api/devicemanagement/v3";

    /**
     * * DeviceTypes
     *
     * Get all device types
     * @summary Get all device types
     * @param {{
     *         owner?: string;
     *         code?: string;
     *         assetTypeId?: string;
     *         page?: number;
     *         size?: number;
     *         sort?: string;
     *     }} [params]
     * @param {string} [params.owner] Owner tenant
     * @param {string} [params.code] Device Type Code
     * @param {string} [params.assetTypeId] Associated asset type id
     * @param {number} [params.size] The maximum number of elements returned in one page
     * @param {number} [params.page] The (0-based) index of the page
     * @param {string} [params.sort] The order of returned elements.&lt;br/&gt;Multiple fields could be used separated by commas (e.g. &#39;field1,field2&#39;).&lt;br/&gt;Descending order could be requested by appending &#39;,desc&#39; at the end of parameter.(e.g. &#39;field1,field2,desc&#39;)
     * @example await deviceManagement.GetDeviceTypes();
     * @example await deviceManagement.GetDeviceTypes({sort: 'id,name'});

     * @returns {Promise<DeviceManagementModels.PaginatedDeviceType>}
     *
     * @memberOf DeviceManagementClient
     */
    public async GetDeviceTypes(params?: {
        owner?: string;
        code?: string;
        assetTypeId?: string;
        page?: number;
        size?: number;
        sort?: string;
    }): Promise<DeviceManagementModels.PaginatedDeviceType> {
        const parameters = params || {};
        const { owner, code, assetTypeId, page, size, sort } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/deviceTypes?${toQueryString({ owner, code, assetTypeId, page, size, sort })}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceManagementModels.PaginatedDeviceType;
    }

    /**
     * * DeviceTypes
     *
     * Get device type by given device type id
     * @summary Get device type by given device type id
     * @param {string} id Id of device type
     * @returns {Promise<DeviceManagementModels.DeviceType>}
     *
     * @example await deviceManagement.GetDeviceType("mdsp.EnvironmentDevice")
     * @memberOf DeviceManagementClient
     */
    public async GetDeviceType(id: string): Promise<DeviceManagementModels.DeviceType> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceManagementModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetDeviceType."
            );
        }
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/deviceTypes/${id}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceManagementModels.DeviceType;
    }

    /**
     * * DeviceTypes
     * Create a new device type
     * @summary Create a new device type
     * @param {DeviceType} deviceType Device type fields
     * @returns {Promise<DeviceManagementModels.DeviceType>}
     *
     * @example await deviceManagement.PostDeviceType (myDeviceType)
     * @memberOf DeviceManagementClient
     */
    public async PostDeviceType(
        deviceType: DeviceManagementModels.DeviceType
    ): Promise<DeviceManagementModels.DeviceType> {
        // verify required parameter 'deviceType' is not null or undefined
        if (deviceType === null || deviceType === undefined) {
            throw new DeviceManagementModels.RequiredError(
                "deviceType",
                "Required parameter deviceType was null or undefined when calling PostDeviceType."
            );
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/deviceTypes`,
            body: deviceType,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceManagementModels.DeviceType;
    }

    /**
     * * DeviceTypes
     * Update device type by given device type id
     * @summary Update device type by given device type id
     * @param {string} id Id of device type
     * @param {DeviceManagementModels.DeviceTypeUpdate} deviceType Device type info in JSON format
     * @returns {Promise<DeviceManagementModels.DeviceType>}
     *
     * @example await deviceManagement.PostDeviceType (myDeviceType)
     * @memberOf DeviceManagementClient
     */
    public async PatchDeviceType(
        id: string,
        deviceType: DeviceManagementModels.DeviceTypeUpdate
    ): Promise<DeviceManagementModels.DeviceType> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceManagementModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PatchDeviceType."
            );
        }
        // verify required parameter 'deviceType' is not null or undefined
        if (deviceType === null || deviceType === undefined) {
            throw new DeviceManagementModels.RequiredError(
                "deviceType",
                "Required parameter deviceType was null or undefined when calling PatchDeviceType."
            );
        }

        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/deviceTypes/${id}`,
            body: deviceType,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceManagementModels.DeviceType;
    }

    /**
     * Deletes the device type with the specified id # Idempotency # This endpoint provides idempotent deletes, i.e., repeated deletes to the same resource will always return 204 responses regardless whether the resource existed in the first place or not.
     * @summary Delete devicetype
     * @param {string} id id of the device tye
     *
     * @example await deviceManagement.DeleteDeviceType("mdsp.EnvironmentDevice")
     *
     * @memberOf DeviceManagementClient
     */
    public async DeleteDeviceType(id: string) {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceManagementModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling DeleteDeviceType."
            );
        }

        try {
            await this.HttpAction({
                verb: "DELETE",
                gateway: this.GetGateway(),
                authorization: await this.GetToken(),
                baseUrl: `${this._baseUrl}/deviceTypes/${id}`,
                noResponse: true,
            });
        } catch (error) {
            console.error(
                "At the time of creation of this client (May 2021), MindSphere didn't have any support for DELETE operation on  device-types."
            );
            console.error("This was reported to mindsphere development team and should eventually start working.");
            throw error;
        }
    }

    /**
     * * Devices
     * Returns a paginated list of all devices within the caller tenant  Searching / filtering is currently not supported
     * @summary List devices
     * @summary List devices
     * @param {{
     *         assetId?: string;
     *         page?: number;
     *         size?: number;
     *     }} [params]
     * @param {number} [params.size] The maximum number of elements returned in one page
     * @param {number} [params.page] The (0-based) index of the page
     * @param {string} [params.assetId] Associated asset id
     *
     * @example await deviceManagement.GetDevices();
     * @example await deviceManagement.GetDevices({size: 10});

     * @returns {Promise<DeviceManagementModels.PaginatedDevice>}
     *
     * @memberOf DeviceManagementClient
     */
    public async GetDevices(params?: {
        assetId?: string;
        page?: number;
        size?: number;
    }): Promise<DeviceManagementModels.PaginatedDevice> {
        const parameters = params || {};
        const { assetId, page, size } = parameters;
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices?${toQueryString({ assetId, page, size })}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceManagementModels.PaginatedDevice;
    }

    /**
     * * Devices
     * Returns the specified device
     * @summary Fetch a device
     * @param {string} id id of the device
     * @returns {Promise<DeviceManagementModels.Device>}
     *
     * @example await deviceManagement.GetDevice("mdsp.EnvironmentDevice")
     * @memberOf DeviceManagementClient
     */
    public async GetDevice(id: string): Promise<DeviceManagementModels.Device> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceManagementModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetDevice."
            );
        }
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceManagementModels.Device;
    }

    /**
     * * Devices
     * Updates the device.  # Constraints # * All fields are optional. If a field is null or is omitted, the current value will be preserved. * If the read-only fields `id` and `deviceTypeId` are present, they must match the current value or an error is returned. * The `agents` list and `properties` json block are replaced with the content specified in the request if present. Partial modification of these elements is not possible.
     * @summary Update device
     * @param {string} id id of the device
     * @param {DeviceManagementModels.DeviceUpdate} deviceMetadata Device metadata
     * @returns {Promise<Device>}
     *
     * @example await deviceManagement.PatchDevice("mdsp.EnvironmentDevice", myDevice;Metadata)
     * @memberOf DeviceManagementClient
     */
    public async PatchDevice(
        id: string,
        deviceMetadata: DeviceManagementModels.DeviceUpdate
    ): Promise<DeviceManagementModels.Device> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceManagementModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PatchDevice."
            );
        }
        // verify required parameter 'deviceMetadata' is not null or undefined
        if (deviceMetadata === null || deviceMetadata === undefined) {
            throw new DeviceManagementModels.RequiredError(
                "deviceMetadata",
                "Required parameter deviceMetadata was null or undefined when calling PatchDevice."
            );
        }

        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}`,
            body: deviceMetadata,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceManagementModels.Device;
    }

    /**
     * * Devices
     * Creates a new device.   # Constraints #  The (mandatory) device type cannot be modified after the device has been created.
     * @summary Create a new device
     * @param {DeviceManagementModels.DeviceCreation} deviceMetadata Device metadata
     * @returns {Promise<DeviceManagementModels.Device}
     *
     * @example await deviceManagement.PostDeviceType (myDeviceType)
     * @memberOf DeviceManagementClient
     */
    public async PostDevice(
        deviceMetadata: DeviceManagementModels.DeviceCreation
    ): Promise<DeviceManagementModels.Device> {
        // verify required parameter 'deviceType' is not null or undefined
        if (deviceMetadata === null || deviceMetadata === undefined) {
            throw new DeviceManagementModels.RequiredError(
                "deviceMetadata",
                "Required parameter deviceMetadata was null or undefined when calling PostDevice."
            );
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices`,
            body: deviceMetadata,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceManagementModels.Device;
    }

    /**
     * Deletes the device with the specified id # Idempotency # This endpoint provides idempotent deletes, i.e., repeated deletes to the same resource will always return 204 responses regardless whether the resource existed in the first place or not.
     * @summary Delete device
     * @param {string} id id of the device
     *
     * @example await deviceManagement.DeleteDevice("mdsp.EnvironmentDevice")
     *
     * @memberOf DeviceManagementClient
     */
    public async DeleteDevice(id: string) {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceManagementModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling DeleteDevice."
            );
        }

        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}`,
            noResponse: true,
        });
    }
}

/**
 * Device Status API
 * Device Status API allows devices to provide status information to be queried by backend applications. Device status comprises information about device health, connection status, and the installed software inventory. Health information can be flexibly extended to contain custom health information.
 *
 *
 * @export
 * @class DeviceStatusManagementClient
 * @extends {SdkClient}
 */
export class DeviceStatusManagementClient extends SdkClient {
    private _baseUrl: string = "/api/devicestatus/v3";

    /**
     * Allows the devices to report on the device health status
     * @summary Report device health status
     * @param {string} id ID of the device
     * @param {DeviceStatusModels.DeviceHealthStatusReportInput} healthStatusReport Report of the device health status
     * @throws {DeviceStatusModels.RequiredError}
     * @memberof DeviceStatusManagementClient
     */
    public async PatchDeviceHealth(
        id: string,
        healthStatusReport: DeviceStatusModels.DeviceHealthStatusReportInput
    ): Promise<DeviceStatusModels.DeviceHealthStatusReport> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceStatusModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PatchDeviceHealth."
            );
        }
        // verify required parameter 'healthStatusReport' is not null or undefined
        if (healthStatusReport === null || healthStatusReport === undefined) {
            throw new DeviceStatusModels.RequiredError(
                "healthStatusReport",
                "Required parameter healthStatusReport was null or undefined when calling PatchDeviceHealth."
            );
        }

        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/health`,
            body: healthStatusReport,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceStatusModels.DeviceHealthStatusReport;
    }

    /**
     * Retrieves the device health status
     * @summary Retrieves the device health status
     * @param {string} id id of the device
     * @throws {DeviceStatusModels.RequiredError}
     * @memberof DeviceStatusManagementClient
     */
    public async GetDeviceHealth(
        id: string
    ): Promise<DeviceStatusModels.DeviceHealthStatusReport> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceStatusModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetDeviceHealth."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/health`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceStatusModels.DeviceHealthStatusReport;
    }

    /**
     * Persist data configuration health status.
     * @summary Persist data configuration health status
     * @param {string} id ID of the device
     * @param {DeviceStatusModels.DataConfigHealthInput} dataConfig Data configuration health status
     * @throws {DeviceStatusModels.RequiredError}
     * @memberof DeviceStatusManagementClient
     */
    public async PatchDeviceHealthDataConfig(
        id: string,
        dataConfig: DeviceStatusModels.DataConfigHealthInput
    ): Promise<DeviceStatusModels.DataConfigHealth> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceStatusModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PatchDeviceHealthDataConfig."
            );
        }
        // verify required parameter 'dataConfig' is not null or undefined
        if (dataConfig === null || dataConfig === undefined) {
            throw new DeviceStatusModels.RequiredError(
                "dataConfig",
                "Required parameter dataConfig was null or undefined when calling PatchDeviceHealthDataConfig."
            );
        }

        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/health/dataConfig`,
            body: dataConfig,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceStatusModels.DataConfigHealth;
    }

    /**
     * Retrieves the data configuration health status.
     * @summary Retrieves the data configuration health status
     * @param {string} id id of the device
     * @throws {DeviceStatusModels.RequiredError}
     * @memberof DeviceStatusManagementClient
     */
    public async GetDeviceHealthDataConfig(
        id: string
    ): Promise<DeviceStatusModels.DeviceHealthStatusReport> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceStatusModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetDeviceHealthDataConfig."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/health/dataConfig`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceStatusModels.DeviceHealthStatusReport;
    }

    /**
     * Sends the heartbeat.
     * @summary Sends the heartbeat
     * @param {string} id ID of the device
     * @throws {DeviceStatusModels.RequiredError}
     * @memberof DeviceStatusManagementClient
     */
    public async PostDeviceHeartbeat(
        id: string
    ): Promise<Response> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceStatusModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PostDeviceHeartbeat."
            );
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/sendHeartbeat/`,
            rawResponse: true,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as Response;
    }

    /**
     * Retrieves the device connection status
     * @summary Retrieves the device connection status
     * @param {string} id ID of the device
     * @throws {DeviceStatusModels.RequiredError}
     * @memberof DeviceStatusManagementClient
     */
    public async GetDeviceConnectionStatus(
        id: string
    ): Promise<DeviceStatusModels.OnlineStatus> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceStatusModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetDeviceConnectionStatus."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/connectionStatus`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceStatusModels.OnlineStatus;
    }

    /**
     * Returns a paginated list of all software (firmware, apps, etc) installed on the device  # Searching / Filtering # The following filter criteria can be specified as query parameters * *type*: return only firmware or apps or ... * *softwareId*: return only software belonging to the specified product (potentially multiple different versions could be installed at the same time)
     * @summary List software installed on device
     * @param {string} id ID of the device
     * @param {'FIRMWARE' | 'APP'} [type] type of software
     * @param {string} [softwareId] id of the software
     * @param {number} [size] The maximum number of elements returned in one page
     * @param {number} [page] The (0-based) index of the page
     * @throws {DeviceStatusModels.RequiredError}
     * @memberof DeviceStatusManagementClient
     */
    public async GetDeviceSoftwares(
        id: string,
        type?: "FIRMWARE" | "APP",
        softwareId?: string,
        page?: number,
        size?: number
    ): Promise<DeviceStatusModels.PaginatedSoftwareInventoryRecord> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceStatusModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetDeviceSoftwares."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/software?${toQueryString({ type, softwareId, size, page })}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceStatusModels.PaginatedSoftwareInventoryRecord;
    }

    /**
     * Returns the software inventory of the device.
     * @summary Get inventory
     * @param {string} id ID of the device
     * @param {'FIRMWARE' | 'APP'} [type] type of software
     * @throws {DeviceStatusModels.RequiredError}
     * @memberof DeviceStatusManagementClient
     */
    public async GetDeviceInventory(
        id: string,
        type?: "FIRMWARE" | "APP"
    ): Promise<DeviceStatusModels.InventoryArray> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceStatusModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetDeviceInventory."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/inventory?${toQueryString({type})}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceStatusModels.InventoryArray;
    }

    /**
     * Updates the software inventory of the device. The whole inventory is replaced with the content sent by the device.
     * @summary Update inventory
     * @param {string} id ID of the device
     * @param {Array<DeviceStatusModels.InventoryEntry>} installationSoftwareInventory List of installed software
     * @throws {DeviceStatusModels.RequiredError}
     * @memberof DeviceStatusManagementClient
     */
    public async PatchDeviceSoftwareInventory(
        id: string,
        installationSoftwareInventory: Array<DeviceStatusModels.InventoryEntry>
    ): Promise<Array<DeviceStatusModels.InventoryEntry>> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceStatusModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PatchDeviceSoftwareInventory."
            );
        }
        // verify required parameter 'installationSoftwareInventory' is not null or undefined
        if (installationSoftwareInventory === null || installationSoftwareInventory === undefined) {
            throw new DeviceStatusModels.RequiredError(
                "installationSoftwareInventory",
                "Required parameter installationSoftwareInventory was null or undefined when calling PatchDeviceSoftwareInventory."
            );
        }

        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/inventory`,
            body: installationSoftwareInventory,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as Array<DeviceStatusModels.InventoryEntry>;
    }

    /**
     * Updates the software inventory of the device for firmware type Provided as a convenience method for device implementations that use separate processes for managing firmware and app updates. By utilizing this endpoint the device does not have to aggregate firmware and apps into a wholistic list but can update firmware independently.
     * @summary Update firmware inventory on a device
     * @param {string} id ID of the device
     * @param {Array<DeviceStatusModels.InventoryFirmwareEntry>} installationFirmwareInventory List of installed firmware
     * @throws {DeviceStatusModels.RequiredError}
     * @memberof DeviceStatusManagementClient
     */
    public async PatchDeviceFirmwareInventory(
        id: string,
        installationFirmwareInventory: Array<DeviceStatusModels.InventoryFirmwareEntry>
    ): Promise<Array<DeviceStatusModels.InventoryEntry>> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceStatusModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PatchDeviceFirmwareInventory."
            );
        }
        // verify required parameter 'installationFirmwareInventory' is not null or undefined
        if (installationFirmwareInventory === null || installationFirmwareInventory === undefined) {
            throw new DeviceStatusModels.RequiredError(
                "installationFirmwareInventory",
                "Required parameter installationFirmwareInventory was null or undefined when calling PatchDeviceFirmwareInventory."
            );
        }

        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/inventory/firmware`,
            body: installationFirmwareInventory,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as Array<DeviceStatusModels.InventoryEntry>;
    }

    /**
     * Updates the software inventory of the device for edge application type Provided as a convenience method for device implementations that use separate processes for managing firmware and app updates. By utilizing this endpoint the device does not have to aggregate firmware and apps into a wholistic list but can update edge applications independently.
     * @summary Update edge application inventory on a device
     * @param {string} id ID of the device
     * @param {Array<DeviceStatusModels.InventoryApplicationEntry>} installationApplicationInventory List of installed edge applications
     * @throws {DeviceStatusModels.RequiredError}
     * @memberof DeviceStatusManagementClient
     */
    public async PatchDeviceApplicationInventory(
        id: string,
        installationApplicationInventory: Array<DeviceStatusModels.InventoryApplicationEntry>
    ): Promise<DeviceStatusModels.InventoryApplicationArray> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceStatusModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PatchDeviceApplicationInventory."
            );
        }
        // verify required parameter 'installationApplicationInventory' is not null or undefined
        if (installationApplicationInventory === null || installationApplicationInventory === undefined) {
            throw new DeviceStatusModels.RequiredError(
                "installationApplicationInventory",
                "Required parameter installationApplicationInventory was null or undefined when calling PatchDeviceApplicationInventory."
            );
        }

        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/inventory/apps`,
            body: installationApplicationInventory,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceStatusModels.InventoryApplicationArray;
    }
}

/**
 * Device Configuration API
 * Device Configuration API can be used to manage device configuration files and to coordinate configuration tasks for devices. The provided operations do not trigger any actions themselves, but are meant to be used by northbound applications to coordinate user and device efforts. Configuration tasks consist of different states that require the app operator user and the target device to participate in order to complete a task.  Devices should use Deployment Workflow API to find out about configuration tasks. Device Configuration Service is based on Deployment Workflow Service and reflects all changes applied through Deployment Workflow API. Once a task is created in this API, it will be available also through Deployment Workflow API. The configuration task status can be advanced at this API or at Deployment Workflow API.
 *
 * @export
 * @class DeviceConfigurationClient
 * @extends {SdkClient}
 */
export class DeviceConfigurationClient extends SdkClient {
    private _baseUrl: string = "/api/deviceconfiguration/v3";

    /**
     * Returns a paginated list of all tasks of the specified device ordered by descending creation date (newest tasks first)
     * @summary List all tasks of a device
     * @param {string} id Id of the device that owns the task.
     * @param {number} [size] The maximum number of elements returned in one page
     * @param {number} [page] The (0-based) index of the page
     * @param {string} [sort] The order in which the elements are returned. Multiple fields could be used spearated by comma
     * @returns {Promise<DeviceConfigurationModels.PaginatedConfigurationTask>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetConfigurationTasks("mdsp.myDevice")
     * @memberof DeviceConfigurationClient
     */
    public async GetConfigurationTasks(
        id: string,
        size?: number,
        page?: number,
        sort?: string
    ): Promise<DeviceConfigurationModels.PaginatedConfigurationTask>  {
        // verify required parameter 'deviceId' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "deviceId",
                "Required parameter id was null or undefined when calling GetConfigurationTasks."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/configurationTasks?${toQueryString({size, page, sort })}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.PaginatedConfigurationTask;
    }

    /**
     * Returns the specified task   # Current State #   The `currentState` field contains information about the current state in the state machine as well as the progress inside this state (if updated by the device)   # History #  The 'history' field contains a \"trace\" of all the past states this task was in, as well as the entry and exit times. It can be used to reconstruct the sequence of event/ actions that happend in this task.
     * @summary Get task
     * @param {string} id Id of the device that owns the task.
     * @param {string} taskId Id of the task
     * @returns {Promise<DeviceConfigurationModels.ConfigurationTask>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetDeviceConfigurationTask("mdsp.EnvironmentDevice", "345af46...")
     * @memberOf DeviceConfigurationClient
     */
    public async GetDeviceConfigurationTask(id: string, taskId: string): Promise<DeviceConfigurationModels.ConfigurationTask> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetDeviceConfigurationTask."
            );
        }
        // verify required parameter 'taskId' is not null or undefined
        if (taskId === null || taskId === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "taskId",
                "Required parameter taskId was null or undefined when calling GetDeviceConfigurationTask."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/configurationTasks/${taskId}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.ConfigurationTask;
    }

    /**
     * Create a new config deployment task.  # Start of Execution # The newly created task will be in the CREATED state and thus not visible to the device. In order to start the execution of the task, update it to the CONFIGURE state.  # Files # Each task refers to one or more files. Devices are expected to apply all files of a task in an \"atomic\" fashion (as far as this is feasible) The specified URI will be passed \"as-is\" to the device. Devices are expected to access this URI using Mindsphere credentials. Typically this URI will refer to a file in the Configuration File Storage, however it is possible to pass any URIs to the device as long as the device has the appropriate credentials to access the URI.  # CustomData #  The optional customData field can be used to pass arbitrary json data from the backend to the device in order. The backend will forward this information \"as-is\" to the device.
     * @summary Create new task
     * @param {string} id Id of the device that owns the task.
     * @param {DeviceConfigurationModels.TaskDefinition} taskDefinition task definition
     * @returns {Promise<DeviceConfigurationModels.ConfigurationTask>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await DeviceConfigurationClient.PostNewDeploymentTaskConfiguration("myDeviceID", ...)
     * @memberOf DeviceConfigurationClient
     */
    public async PostNewDeploymentTaskConfiguration(
        id: string,
        taskDefinition: DeviceConfigurationModels.TaskDefinition
    ): Promise<DeviceConfigurationModels.ConfigurationTask> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PostNewDeploymentTaskConfiguration."
            );
        }
        // verify required parameter 'taskDefinition' is not null or undefined
        if (taskDefinition === null || taskDefinition === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "taskDefinition",
                "Required parameter taskDefinition was null or undefined when calling PostNewDeploymentTaskConfiguration."
            );
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/configurationTasks`,
            body: taskDefinition,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.ConfigurationTask;
    }

    /**
     * Updates the task.  Updates must follow the state machine definition. Failing to do so will cause a 409 error
     * @summary Update a task
     * @param {string} id Id of the device that owns the task.
     * @param {string} taskId Id of the task
     * @param {DeviceConfigurationModels.Updatetask} progressReport Updated configuration
     * @returns {Promise<DeviceConfigurationModels.ConfigurationTask>}
     *
     * @example await DeviceConfigurationClient.PatchDeploymentTaskConfiguration("myDeviceID", "mytaskID", ...)
     * @memberOf DeviceConfigurationClient
     */
    public async PatchDeploymentTaskConfiguration(
        id: string,
        taskId: string,
        progressReport: DeviceConfigurationModels.Updatetask
    ): Promise<DeviceConfigurationModels.ConfigurationTask> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PatchDeploymentTaskConfiguration."
            );
        }
        // verify required parameter 'taskId' is not null or undefined
        if (taskId === null || taskId === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "taskId",
                "Required parameter taskId was null or undefined when calling PatchDeploymentTaskConfiguration."
            );
        }
        // verify required parameter 'progressReport' is not null or undefined
        if (progressReport === null || progressReport === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "progressReport",
                "Required parameter progressReport was null or undefined when calling PatchDeploymentTaskConfiguration."
            );
        }


        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/configurationTasks/${taskId}`,
            body: progressReport,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.ConfigurationTask;
    }

    /**
     * Lists all files # Filtering / Searching # Using the `pathPrefix` query parameter, this endpoint can be used to  look up the ids of files with a given path prefix. The supplied prefix will be compared with the `path` field of the file metadata. Users of the API should pick a naming scheme that allows efficient searching of files, e.g., using `{id}/{filename}.json` allows efficient listing of all files \"belonging\" to a specific device id.
     * @summary List files
     * @param {string} pathPrefix the prefix to search for
     * @param {number} [size] The maximum number of elements returned in one page
     * @param {number} [page] The (0-based) index of the page
     * @param {string} [sort] The order in which the elements are returned. Multiple fields could be used spearated by comma
     * @returns {Promise<DeviceConfigurationModels.PaginatedFileMetaData>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetFiles("./myfile")
     * @memberof DeviceConfigurationClient
     */
    public async GetFiles(
        pathPrefix: string,
        size?: number,
        page?: number,
        sort?: string
    ): Promise<DeviceConfigurationModels.PaginatedFileMetaData>  {
        // verify required parameter 'pathPrefix' is not null or undefined
        if (pathPrefix === null || pathPrefix === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "pathPrefix",
                "Required parameter pathPrefix was null or undefined when calling GetFiles."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files?${toQueryString({ pathPrefix, size, page, sort })}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.PaginatedFileMetaData;
    }

    /**
     * Returns the metadata of the specified file. # File Id to Path Mapping # To obtain the id of a file, the GET `files` endpoint can be used which allows looking up file ids based on a path prefix  # File Metadata / File Content # This endpoint returns the metadata of the file. To access the content of the file, either use the `files/{id}/head` endpoint (to access the latest revision) or list all available revisions via  `files/{id}/revisions` and access the content of a specific revision via `files/{id}/revisions/{hash}/content`
     * @summary Get file metadata
     * @param {string} id the ID of the file
     * @returns {Promise<DeviceConfigurationModels.FileMetaData>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetFileMetadata("myFileID")
     * @memberOf DeviceConfigurationClient
     */
    public async GetFileMetadata(id: string): Promise<DeviceConfigurationModels.FileMetaData> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetFileMetadata."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.FileMetaData;
    }

    /**
     * Create a new config file. The specified path must be unique (see general documentation about paths)
     * @summary Create a new empty file
     * @param {DeviceConfigurationModels.ConfigurationFile} file configuration file object
     * @returns {Promise<DeviceConfigurationModels.FileMetaData>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await DeviceConfigurationClient.PostNewFile( ...)
     * @memberOf DeviceConfigurationClient
     */
    public async PostNewFile(
        file: DeviceConfigurationModels.ConfigurationFile
    ): Promise<DeviceConfigurationModels.FileMetaData> {
        // verify required parameter 'file' is not null or undefined
        if (file === null || file === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "file",
                "Required parameter file was null or undefined when calling PostNewFile."
            );
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files`,
            body: file,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.FileMetaData;
    }

    /**
     * Updates the \"head\" of this file, i.e., creates a new revision containing the data sent with the requests and updates the head resource to point to this new revision. Clients should use the If-Match header to safeguard against lost updates, i.e. concurrent access to the head resource  # Content Metadata #  Information about the content type and content length of the file are taken from the corresponding http header fields and must be correctly set by the client
     * @summary Update \"head\"
     * @param {string} id the ID of the file
     * @param {DeviceConfigurationModels.Payload} content Binary content of file.
     * @param {string} [contentType] Defines the accept header value to be used when retrieving the content
     * @returns {Promise<DeviceConfigurationModels.FileMetaData>}
     *
     * @example await DeviceConfigurationClient.PatchDeploymentTaskConfiguration("myFileID", ...)
     * @memberOf DeviceConfigurationClient
     */
    public async PatchFileHead(
        id: string,
        content: DeviceConfigurationModels.Payload,
        contentType?: string
    ): Promise<DeviceConfigurationModels.FileMetaData> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PatchFileHead."
            );
        }
        // verify required parameter 'content' is not null or undefined
        if (content === null || content === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "content",
                "Required parameter content was null or undefined when calling PatchFileHead."
            );
        }

        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}/head`,
            body: content,
            additionalHeaders: { "Content-Type": contentType ? contentType : "*/*" },
        });

        return result as DeviceConfigurationModels.FileMetaData;
    }

    /**
     * Deletes the specified file. This will also delete any revisions of this file and their content. # Idempotency # This endpoint provides idempotent deletes, i.e., repeated deletes to the same resource will always return 204 responses regardless whether the resource existed in the first place or not.
     * @summary Delete file
     * @param {string} id the ID of the file
     *
     * @example await DeviceConfigurationClient.DeleteFile("myFileID")
     *
     * @memberOf DeviceConfigurationClient
     */
    public async DeleteFile(id: string) {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling DeleteFile."
            );
        }

        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}`,
            noResponse: true,
        });
    }

    /**
     * Returns a paginated list of all revisions of the specified file. # File Metadata / File Content # This endpoint returns the metadata of the revision. To access the  content use the`files/{id}/revisions/{hash}/content` endpoint
     * @summary List revisions of a file
     * @param {string} id the ID of the file
     * @param {number} [size] The maximum number of elements returned in one page
     * @param {number} [page] The (0-based) index of the page
     * @param {string} [sort] The order in which the elements are returned. Multiple fields could be used spearated by comma
     * @returns {Promise<DeviceConfigurationModels.PaginatedRevisionMetaData>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetFileRevisions("myFileID")
     * @memberof DeviceConfigurationClient
     */
    public async GetFileRevisions(
        id: string,
        size?: number,
        page?: number,
        sort?: string
    ): Promise<DeviceConfigurationModels.PaginatedRevisionMetaData>  {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetFiles."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}/revisions?${toQueryString({ size, page, sort })}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.PaginatedRevisionMetaData;
    }

    /**
     * Returns the metadata of the specified file revision
     * @summary Get revision metadata
     * @param {string} id the ID of the file
     * @param {string} hash the hash, also serves as id of the revision
     * @returns {Promise<DeviceConfigurationModels.RevisionMetaData>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetFileMetadata("myFileID", "8ac80b...")
     * @memberOf DeviceConfigurationClient
     */
    public async GetFileRevisionMetadata(
        id: string,
        hash: string
    ): Promise<DeviceConfigurationModels.RevisionMetaData> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetFileRevisionMetadata."
            );
        }

        // verify required parameter 'hash' is not null or undefined
        if (hash === null || hash === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "hash",
                "Required parameter hash was null or undefined when calling GetFileRevisionMetadata."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}/revisions/${hash}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeviceConfigurationModels.RevisionMetaData;
    }

    /**
     * Returns the content of the specified file revision.
     * @summary Get revision content
     * @param {string} id the ID of the file
     * @param {string} hash the hash, also serves as id of the revision
     * @param {string} [accept] If provided, must equal Content-Type provided while uploading
     * @returns {Promise<DeviceConfigurationModels.Payload>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetFileRevisionContent("myFileID",...)
     * @memberOf DeviceConfigurationClient
     */
    public async GetFileRevisionContent(
        id: string,
        hash: string,
        accept?: string
    ): Promise<DeviceConfigurationModels.Payload> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetFileRevisionContent."
            );
        }

        // verify required parameter 'hash' is not null or undefined
        if (hash === null || hash === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "hash",
                "Required parameter hash was null or undefined when calling GetFileRevisionContent."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}/revisions/${hash}/content`,
            additionalHeaders: { "Accept": accept ? accept : "application/octet-stream"},
        });

        return result as DeviceConfigurationModels.Payload;
    }

    /**
     * Creates a new revision containing the provided content. This endpoint will not update the \"head\" of the file to point to the new revision. # Content Metadata #  Information about the content type and content length of the file are taken from the corresponding http header fields and must be correctly set by the client
     * @summary Create a new revision
     * @param {string} id the ID of the file
     * @param {Payload} content Binary content of file.
     * @param {string} [contentType] Defines the accept header value to be used when retrieving the content
     * @returns {Promise<DeviceConfigurationModels.RevisionMetaData>}
     * @throws {DeviceConfigurationModels.RequiredError}
     *
     * @example await DeviceConfigurationClient.PostFileRevision("myFileID", ...)
     * @memberOf DeviceConfigurationClient
     */
    public async PostFileRevision(
        id: string,
        content: DeviceConfigurationModels.Payload,
        contentType?: string
    ): Promise<DeviceConfigurationModels.RevisionMetaData> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PostFileRevision."
            );
        }

        // verify required parameter 'content' is not null or undefined
        if (content === null || content === undefined) {
            throw new DeviceConfigurationModels.RequiredError(
                "content",
                "Required parameter content was null or undefined when calling PostFileRevision."
            );
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/files/${id}/revisions`,
            body: content,
            additionalHeaders: { "Content-Type": contentType ? contentType : "application/octet-stream"},
        });

        return result as DeviceConfigurationModels.RevisionMetaData;
    }
}

/**
 * Deployment Workflow API
 * This API allows to create and execute reusable deployment worfklows for devices defined by Device Management. Each workflow is modeled as a state machine running in the backend, with tasks to be executed against devices. Examples of tasks are installation of firmware or other types of commands issued to  devices.  The API offers model resources to be used to set up workflow templates, which define possible workflow states and transistions between them. While device builders can define custom models, predefined models are available for default installation and removal tasks. Instance resources represent instantiated workflows and allow to trigger state transitions.  Only a subset of the operations in this API is meant for use by agents, defined in the following table.  | Path | Method | Audience | |--------|------|----------| | models | POST | Northbound | | models | GET | Northbound | | models | DELETE | Northbound | | instances | POST | Northbound | | instances | GET | Northbound, Southbound | | instances/{id} | GET | Northbound, Southbound | | instances/{id} | PATCH | Northbound, Southbound | | instances/{id}/cancel | POST | Northbound, Southbound |  Northbound: The term stands for interactive or technical users which initiate the request Southbound: The term stands for agents which initiate the request
 *
 * @export
 * @class DeploymentWorkflowClient
 * @extends {SdkClient}
 */
export class DeploymentWorkflowClient extends SdkClient {
    private _baseUrl: string = "/api/deploymentworkflow/v3";

    /**
     * Model description for a given key
     * @summary Model description for a given key
     * @param {string} modelKey Unique key for the model
     * @returns {Promise<DeploymentWorkflowModels.Model>}
     * @throws {DeploymentWorkflowModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetWorkflowModel( "345af46...")
     * @memberOf DeploymentWorkflowClient
     */
    public async GetWorkflowModel(modelKey: string, ): Promise<DeploymentWorkflowModels.Model> {
        // verify required parameter 'modelKey' is not null or undefined
        if (modelKey === null || modelKey === undefined) {
            throw new DeploymentWorkflowModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetWorkflowModel."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models/${modelKey}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeploymentWorkflowModels.Model;
    }

    /**
     * Add a new workflow model
     * @summary Add a new workflow model
     * @param {Model} model Workflow model object that needs to be added
     * @returns {Promise<DeploymentWorkflowModels.Model>}
     * @throws {DeploymentWorkflowModels.RequiredError}
     *
     * @example await DeploymentWorkflowClient.PostNewWorkflowModel(...)
     * @memberOf DeploymentWorkflowClient
     */
    public async PostNewWorkflowModel(
        model: DeploymentWorkflowModels.Model
    ): Promise<DeploymentWorkflowModels.Model> {
        // verify required parameter 'model' is not null or undefined
        if (model === null || model === undefined) {
            throw new DeploymentWorkflowModels.RequiredError(
                "model",
                "Required parameter id was null or undefined when calling PostNewWorkflowModel."
            );
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models`,
            body: model,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeploymentWorkflowModels.Model;
    }

    /**
     * Deletes a model with a given key
     * @summary Deletes a model with a given key
     * @param {string} modelKey Key for the model
     *
     * @example await DeploymentWorkflowClient.DeleteWorkflowModel("myModelKey")
     *
     * @memberOf DeploymentWorkflowClient
     */
    public async DeleteWorkflowModel(modelKey: string) {
        // verify required parameter 'modelKey' is not null or undefined
        if (modelKey === null || modelKey === undefined) {
            throw new DeploymentWorkflowModels.RequiredError(
                "modelKey",
                "Required parameter modelKey was null or undefined when calling DeleteWorkflowModel."
            );
        }

        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/models/${modelKey}`,
            noResponse: true,
        });
    }







    /**
     * List of instance descriptions belonging to the caller's tenant. By default, this endpoint returns the list of instances in a specific order and predetermined paging properties.  These defaults are:   - Hide model details.     Equivalent of query parameter modelDetails = flase   - Hide history     Equivalent of query parameter history = false   - Ascending sort on createdAt date   - 10 entries per page
     * @summary List of instance descriptions belonging to the caller's tenant
     * @param {boolean} [model] Boolean flag to include the model used for the instance
     * @param {boolean} [history] Boolean flag to include the transition history of the instance
     * @param {string} [currentState] Filter instances based on the current state value
     * @param {string} [group] Filter instances based on the state group they are in
     * @param {string} [deviceId] Filter instances belonging to a specific device with deviceId
     * @param {string} [modelKey] Filter instances that are created from a given key
     * @returns {Promise<DeploymentWorkflowModels.PaginatedFileMetaData>}
     * @throws {DeploymentWorkflowModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetModelInstances();
     * @memberof DeploymentWorkflowClient
     */
    public async GetWorkflowInstances(
        model?: boolean,
        history?: boolean,
        currentState?: string,
        group?: string,
        deviceId?: string,
        modelKey?: string
    ): Promise<DeploymentWorkflowModels.PaginatedInstanceList>  {

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/instances?${toQueryString({
                model,
                history,
                currentState,
                group,
                deviceId,
                modelKey
            })
            }`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeploymentWorkflowModels.PaginatedInstanceList;
    }

    /**
     * Instance description for a given id
     * @summary Instance description for a given id
     * @param {string} id Instance id
     * @param {boolean} [model] Boolean flag to include the model used for the instance
     * @param {boolean} [history] Boolean flag to include the transition history of the instance
     * @returns {Promise<DeploymentWorkflowModels.Instance>}
     * @throws {DeploymentWorkflowModels.RequiredError}
     *
     * @example await deviceConfigurationClient.GetWorkflowInstance("myInstanceId")
     * @memberOf DeploymentWorkflowClient
     */
    public async GetWorkflowInstance(id: string, model?: boolean, history?: boolean): Promise<DeploymentWorkflowModels.Instance> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeploymentWorkflowModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetWorkflowInstance."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/instances/${id}?${toQueryString({ model, history})}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeploymentWorkflowModels.Instance;
    }

    /**
     * Add a new workflow instance
     * @summary Add a new workflow instance
     * @param {DeploymentWorkflowModels.InstanceRequest} workflowInstance Workflow instance that needs to be created
     * @param {boolean} [model] Boolean flag to include the model used for the instance
     * @param {boolean} [history] Boolean flag to include the transition history of the instance
     * @returns {Promise<DeploymentWorkflowModels.Instance>}
     * @throws {DeploymentWorkflowModels.RequiredError}
     *
     * @example await DeploymentWorkflowClient.PostNewWorflowInstance( ...)
     * @memberOf DeploymentWorkflowClient
     */
    public async PostNewWorflowInstance(
        workflowInstance: DeploymentWorkflowModels.InstanceRequest,
        model?: boolean,
        history?: boolean
    ): Promise<DeploymentWorkflowModels.Instance> {
        // verify required parameter 'workflowInstance' is not null or undefined
        if (workflowInstance === null || workflowInstance === undefined) {
            throw new DeploymentWorkflowModels.RequiredError(
                "workflowInstance",
                "Required parameter workflowInstance was null or undefined when calling instancesPost."
            );
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/instances?${toQueryString({ model, history})}`,
            body: workflowInstance,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeploymentWorkflowModels.Instance;
    }

    /**
     * Modify current state of a workflow instance
     * @summary Modify current state of a workflow instance
     * @param {string} id Instance id
     * @param {StateInfo} stateInfo State to be used for advancing the workflow instance to. This is going to be used as progress report from devices or backend.
     * @param {boolean} [history] Boolean flag to include the transition history of the instance
     * @param {boolean} [model] Boolean flag to include the model of the instance in response
     * @param {string} [contentType] Defines the accept header value to be used when retrieving the content
     * @returns {Promise<DeploymentWorkflowModels.Instance>}
     *
     * @example await DeploymentWorkflowClient.PatchWorkflowInstance("myWorkflowId", ...)
     * @memberOf DeploymentWorkflowClient
     */
    public async PatchWorkflowInstance(
        id: string,
        stateInfo: DeploymentWorkflowModels.StateInfo,
        history?: boolean,
        model?: boolean
    ): Promise<DeploymentWorkflowModels.Instance> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeploymentWorkflowModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PatchWorkflowInstance."
            );
        }
        // verify required parameter 'stateInfo' is not null or undefined
        if (stateInfo === null || stateInfo === undefined) {
            throw new DeploymentWorkflowModels.RequiredError(
                "stateInfo",
                "Required parameter stateInfo was null or undefined when calling PatchWorkflowInstance."
            );
        }

        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/instances/${id}?${toQueryString({ model, history})}`,
            body: stateInfo,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeploymentWorkflowModels.Instance;
    }

    /**
     * Cancels the workflow instance if the transition from canceled to current state is defined and available
     * @summary Cancels the workflow instance if the transition from canceled to current state is defined and available
     * @param {string} id Instance id
     * @param {boolean} [history] Boolean flag to include the transition history of the instance
     * @param {boolean} [model] Boolean flag to include the model of the instance in response
     *
     * @example await DeploymentWorkflowClient.PostToCancelWorkflowInstance("myWorkflowID")
     *
     * @memberOf DeploymentWorkflowClient
     */
    public async PostToCancelWorkflowInstance(
        id: string,
        history?: boolean,
        model?: boolean
    ): Promise<DeploymentWorkflowModels.Instance> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeploymentWorkflowModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling DeleteFile."
            );
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/instances/${id}/cancel?${toQueryString({ model, history})}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as DeploymentWorkflowModels.Instance;
    }
}

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
     * Get application instance list by device id.
     * @summary Get application instance list by device id.
     * @param {string} deviceId ID of the device
     * @param {number} [size] The maximum number of elements returned in one page
     * @param {number} [page] The (0-based) index of the page
     * @param {string} [sort] The order in which the elements are returned. Multiple fields could be used spearated by comma
     * @returns {Promise<EdgeAppInstanceModels.PaginatedApplicationInstance>}
     * @throws {EdgeAppInstanceModels.RequiredError}
     *
     * @example await edgeAppInstanceManagementClient.GetAppInstances("mdsp.myDevice")
     * @memberof EdgeAppInstanceManagementClient
     */
    public async GetAppInstances(
        deviceId: string,
        size?: number,
        page?: number,
        sort?: string
    ): Promise<EdgeAppInstanceModels.PaginatedApplicationInstance>  {
        // verify required parameter 'deviceId' is not null or undefined
        if (deviceId === null || deviceId === undefined) {
            throw new EdgeAppInstanceModels.RequiredError(
                "deviceId",
                "Required parameter deviceId was null or undefined when calling GetAppInstances."
            );
        }

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/appInstances?${toQueryString({ deviceId, size, page, sort })}`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as EdgeAppInstanceModels.PaginatedApplicationInstance;
    }

    /**
     * Get the status of the application instance.
     * @summary Get the status of the application instance.
     * @param {string} id ID of the application instance
     * @returns {Promise<EdgeAppInstanceModels.ApplicationInstanceLifeCycleResource>}
     * @throws {EdgeAppInstanceModels.RequiredError}
     *
     * @example await edgeAppInstanceManagementClient.GetAppInstanceLifecycle("myAppInstanceID")
     * @memberOf EdgeAppInstanceManagementClient
     */
    public async GetAppInstanceLifecycle(id: string): Promise<EdgeAppInstanceModels.ApplicationInstanceLifeCycleResource> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new EdgeAppInstanceModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling GetAppInstanceLifecycle."
            );
        }
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/appInstances/${id}/lifecycle`,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as EdgeAppInstanceModels.ApplicationInstanceLifeCycleResource;
    }

    /**
     * This endpoint allows deleting instance.
     * @summary Delete application instance.
     * @param {string} id ID of the application instance
     * @throws {EdgeAppInstanceModels.RequiredError}
     *
     * @example await edgeAppInstanceManagementClient.DeleteAppInstance("mdsp.EnvironmentDeviceAppInst")
     *
     * @memberOf EdgeAppInstanceManagementClient
     */
    public async DeleteAppInstance(id: string) {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new EdgeAppInstanceModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling instanceConfigurationsIdDelete."
            );
        }

        const baseUrl = `${this._baseUrl}/appInstances/${id}`
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
     * Create application instance
     * @summary Create application instance.
     * @param {EdgeAppInstanceModels.ApplicationInstance} applicationInstance Application instance fields.
     * @returns {Promise<EdgeAppInstanceModels.ApplicationInstance>}
     *
     * @example await edgeAppInstanceManagementClient.PostAppInstance(myAppInstanceData)
     * @memberOf EdgeAppInstanceManagementClient
     */
    public async PostAppInstance(
        applicationInstance: EdgeAppInstanceModels.ApplicationInstance
    ): Promise<EdgeAppInstanceModels.ApplicationInstanceResource> {
        // verify required parameter 'applicationInstance' is not null or undefined
        if (applicationInstance === null || applicationInstance === undefined) {
            throw new EdgeAppInstanceModels.RequiredError(
                "instanceConfiguration",
                "Required parameter applicationInstance was null or undefined when calling PostAppInstance.");
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/appInstances`,
            body: applicationInstance,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as EdgeAppInstanceModels.ApplicationInstanceResource;
    }

    /**
     * Update status of the application instance.
     * @summary Set Status of Application Release Instance.
     * @param {string} id ID of the application instance
     * @param {EdgeAppInstanceModels.ApplicationInstanceLifeCycleStatus} applicationInstanceStatus Application instance status fields.
     * @returns {Promise<EdgeAppInstanceModels.ApplicationInstanceLifeCycleResource>}
     *
     * @example await edgeAppInstanceManagementClient.PatchAppInstanceStatus("mdsp.EnvironmentDeviceAppInst", myNewAppStatusData)
     * @memberOf EdgeAppInstanceManagementClient
     */
    public async PatchAppInstanceStatus(
        id: string,
        applicationInstanceStatus: EdgeAppInstanceModels.ApplicationInstanceLifeCycleStatus
    ): Promise<EdgeAppInstanceModels.ApplicationInstanceLifeCycleResource> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new EdgeAppInstanceModels.RequiredError(
                "id",
                "Required parameter id was null or undefined when calling PatchAppInstanceStatus."
            );
        }
        // verify required parameter 'applicationInstanceStatus' is not null or undefined
        if (applicationInstanceStatus === null || applicationInstanceStatus === undefined) {
            throw new EdgeAppInstanceModels.RequiredError(
                "instanceConfiguration",
                "Required parameter instanceConfiguration was null or undefined when calling PatchAppInstanceStatus."
            );
        }

        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/appInstances/${id}/lifecycle`,
            body: applicationInstanceStatus,
            additionalHeaders: { "Content-Type": "application/json" },
        });

        return result as EdgeAppInstanceModels.ApplicationInstanceLifeCycleResource;
    }

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
