import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { DeviceManagementModels } from "./device-models";

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
     * @param {string} [owner] Owner tenant
     * @param {string} [code] Device Type Code
     * @param {string} [assetTypeId] Associated asset type id
     * @param {number} [size] The maximum number of elements returned in one page
     * @param {number} [page] The (0-based) index of the page
     * @param {string} [sort] The order of returned elements.&lt;br/&gt;Multiple fields could be used separated by commas (e.g. &#39;field1,field2&#39;).&lt;br/&gt;Descending order could be requested by appending &#39;,desc&#39; at the end of parameter.(e.g. &#39;field1,field2,desc&#39;)
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
            baseUrl: `${this._baseUrl}/deviceTypes?${toQueryString({owner, code, assetTypeId, page, size, sort})}`,
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
     public async GetDeviceType(
        id: string
    ): Promise<DeviceManagementModels.DeviceType> {
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

        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/deviceTypes/${id}`,
            noResponse: true,
        });
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
     * @param {number} [size] The maximum number of elements returned in one page
     * @param {number} [page] The (0-based) index of the page
     * @param {string} [assetId] Associated asset id
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
            baseUrl: `${this._baseUrl}/devices?${toQueryString({assetId, page, size})}`,
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
     public async GetDevice(
        id: string
    ): Promise<DeviceManagementModels.Device> {
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
