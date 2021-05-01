import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { DeviceStatusModels } from "./device-status-models";

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
                'id',
                'Required parameter id was null or undefined when calling PatchDeviceHealth.'
            );
        }
        // verify required parameter 'healthStatusReport' is not null or undefined
        if (healthStatusReport === null || healthStatusReport === undefined) {
            throw new DeviceStatusModels.RequiredError(
                'healthStatusReport',
                'Required parameter healthStatusReport was null or undefined when calling PatchDeviceHealth.'
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
                'id',
                'Required parameter id was null or undefined when calling GetDeviceHealth.'
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
                'id',
                'Required parameter id was null or undefined when calling PatchDeviceHealthDataConfig.'
            );
        }
        // verify required parameter 'dataConfig' is not null or undefined
        if (dataConfig === null || dataConfig === undefined) {
            throw new DeviceStatusModels.RequiredError(
                'dataConfig',
                'Required parameter dataConfig was null or undefined when calling PatchDeviceHealthDataConfig.'
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
                'id',
                'Required parameter id was null or undefined when calling GetDeviceHealthDataConfig.'
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
    ): Promise<Response>{
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceStatusModels.RequiredError(
                'id',
                'Required parameter id was null or undefined when calling PostDeviceHeartbeat.'
            );
        }

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/devices/${id}/sendHeartbeat`,
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
                'id',
                'Required parameter id was null or undefined when calling GetDeviceConnectionStatus.'
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
        type?: 'FIRMWARE' | 'APP',
        softwareId?: string,
        size?: number,
        page?: number
    ): Promise<DeviceStatusModels.PaginatedSoftwareInventoryRecord> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceStatusModels.RequiredError(
                'id',
                'Required parameter id was null or undefined when calling GetDeviceSoftwares.'
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
        type?: 'FIRMWARE' | 'APP'
    ): Promise<DeviceStatusModels.InventoryArray> {
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new DeviceStatusModels.RequiredError(
                'id',
                'Required parameter id was null or undefined when calling GetDeviceInventory.'
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
                'id',
                'Required parameter id was null or undefined when calling PatchDeviceSoftwareInventory.'
            );
        }
        // verify required parameter 'installationSoftwareInventory' is not null or undefined
        if (installationSoftwareInventory === null || installationSoftwareInventory === undefined) {
            throw new DeviceStatusModels.RequiredError(
                'installationSoftwareInventory',
                'Required parameter installationSoftwareInventory was null or undefined when calling PatchDeviceSoftwareInventory.'
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
                'id',
                'Required parameter id was null or undefined when calling PatchDeviceFirmwareInventory.'
            );
        }
        // verify required parameter 'installationFirmwareInventory' is not null or undefined
        if (installationFirmwareInventory === null || installationFirmwareInventory === undefined) {
            throw new DeviceStatusModels.RequiredError(
                'installationFirmwareInventory',
                'Required parameter installationFirmwareInventory was null or undefined when calling PatchDeviceFirmwareInventory.'
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
                'id',
                'Required parameter id was null or undefined when calling PatchDeviceApplicationInventory.'
            );
        }
        // verify required parameter 'installationApplicationInventory' is not null or undefined
        if (installationApplicationInventory === null || installationApplicationInventory === undefined) {
            throw new DeviceStatusModels.RequiredError(
                'installationApplicationInventory',
                'Required parameter installationApplicationInventory was null or undefined when calling PatchDeviceApplicationInventory.'
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
