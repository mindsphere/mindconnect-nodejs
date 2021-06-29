
export namespace DeviceManagementModels {

    /**
     *
     * @export
     * @class RequiredError
     * @extends {Error}
     */
    export class RequiredError extends Error {
        name: "RequiredError" = "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
        }
    }

    /**
     *
     * @export
     * @interface Device
     */
    export interface Device {
        /**
         * id of the device
         * @type {string}
         * @memberof Device
         */
        id?: string;
        /**
         * id of the Device Type this device belongs to
         * @type {string}
         * @memberof Device
         */
        deviceTypeId?: string;
        /**
         * serial number of the device
         * @type {string}
         * @memberof Device
         */
        serialNumber?: string;
        /**
         * creation date of the device
         * @type {string}
         * @memberof Device
         */
        createdAt?: string;
        /**
         * id of the Asset that created Device will be mapped to
         * @type {string}
         * @memberof Device
         */
        assetId?: string;
        /**
         * list of ids referring to the Agent(s) that are responsible for this device
         * @type {Array<string>}
         * @memberof Device
         */
        agents?: Array<string>;
        /**
         * free json block for storing additional properties / characteristics of the device
         * @type {any}
         * @memberof Device
         */
        properties?: any;
    }

    /**
     *
     * @export
     * @interface DeviceCreation
     */
    export interface DeviceCreation {
        /**
         * id of the Device Type this device belongs to
         * @type {string}
         * @memberof DeviceCreation
         */
        deviceTypeId: string;
        /**
         * serial number of the device
         * @type {string}
         * @memberof DeviceCreation
         */
        serialNumber?: string;
        /**
         * id of the Asset that created Device will be mapped to
         * @type {string}
         * @memberof DeviceCreation
         */
        assetId?: string;
        /**
         * list of ids referring to the Agent(s) that are responsible for this device
         * @type {Array<string>}
         * @memberof DeviceCreation
         */
        agents?: Array<string>;
        /**
         * free json block for storing additional properties / characteristics of the device
         * @type {any}
         * @memberof DeviceCreation
         */
        properties?: any;
    }

    /**
     *
     * @export
     * @interface DeviceType
     */
    export interface DeviceType {
        /**
         *
         * @type {string}
         * @memberof DeviceType
         */
        id?: string;
        /**
         * Owner tenant of the device type
         * @type {string}
         * @memberof DeviceType
         */
        owner?: string;
        /**
         * Unique, user defined text to reference a device type
         * @type {string}
         * @memberof DeviceType
         */
        code: string;
        /**
         * Unique, Id of the mapped assetTypeId
         * @type {string}
         * @memberof DeviceType
         */
        assetTypeId: string;
        /**
         *
         * @type {string}
         * @memberof DeviceType
         */
        name: string;
        /**
         *
         * @type {string}
         * @memberof DeviceType
         */
        description: string;
        /**
         * creation date of the device type
         * @type {string}
         * @memberof DeviceType
         */
        createdAt?: string;
        /**
         * free json block for storing additional properties / characteristics of the device type
         * @type {any}
         * @memberof DeviceType
         */
        properties?: any;
    }

    /**
     *
     * @export
     * @interface DeviceTypeUpdate
     */
    export interface DeviceTypeUpdate {
        /**
         *
         * @type {string}
         * @memberof DeviceTypeUpdate
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof DeviceTypeUpdate
         */
        description?: string;
        /**
         * free json block for storing additional properties / characteristics of the device type
         * @type {any}
         * @memberof DeviceTypeUpdate
         */
        properties?: any;
    }

    /**
     *
     * @export
     * @interface DeviceUpdate
     */
    export interface DeviceUpdate {
        /**
         * serial number of the device
         * @type {string}
         * @memberof DeviceUpdate
         */
        serialNumber?: string;
        /**
         * list of ids referring to the Agent(s) that are responsible for this device
         * @type {Array<string>}
         * @memberof DeviceUpdate
         */
        agents?: Array<string>;
        /**
         * free json block for storing additional properties / characteristics of the device
         * @type {any}
         * @memberof DeviceUpdate
         */
        properties?: any;
    }

    /**
     *
     * @export
     * @interface ErrorResponse
     */
    export interface ErrorResponse {
        /**
         *
         * @type {Array<Error>}
         * @memberof ErrorResponse
         */
        errors?: Array<Error>;
    }

    /**
     *
     * @export
     * @interface ModelError
     */
    export interface ModelError {
        /**
         * identifier code for the reason of the error
         * @type {string}
         * @memberof ModelError
         */
        code?: string;
        /**
         * log correlation ID
         * @type {string}
         * @memberof ModelError
         */
        logref?: string;
        /**
         * error message
         * @type {string}
         * @memberof ModelError
         */
        message?: string;
    }

    /**
     * paginated list of devices
     * @export
     * @interface PaginatedDevice
     */
    export interface PaginatedDevice {
        /**
         *
         * @type {Array<Device>}
         * @memberof PaginatedDevice
         */
        content?: Array<Device>;
        /**
         *
         * @type {any}
         * @memberof PaginatedDevice
         */
        page?: any;
    }

    /**
     * paginated list of device types
     * @export
     * @interface PaginatedDeviceType
     */
    export interface PaginatedDeviceType {
        /**
         *
         * @type {Array<DeviceType>}
         * @memberof PaginatedDeviceType
         */
        content?: Array<DeviceType>;
        /**
         *
         * @type {any}
         * @memberof PaginatedDeviceType
         */
        page?: any;
    }

}

export namespace DeviceStatusModels {

    /**
     *
     * @export
     * @class RequiredError
     * @extends {Error}
     */
    export class RequiredError extends Error {
        name: "RequiredError" = "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
        }
    }

    /**
     *
     * @export
     * @interface DataConfigHealth
     */
    export interface DataConfigHealth {
        /**
         *
         * @type {Date}
         * @memberof DataConfigHealth
         */
        lastUpdate?: Date;
        /**
         *
         * @type {string}
         * @memberof DataConfigHealth
         */
        configurationId: string;
        /**
         *
         * @type {Array<DataSourceHealth>}
         * @memberof DataConfigHealth
         */
        dataSources: Array<DataSourceHealth>;
    }

    /**
     *
     * @export
     * @interface DataConfigHealthInput
     */
    export interface DataConfigHealthInput {
        /**
         *
         * @type {Date}
         * @memberof DataConfigHealthInput
         */
        lastUpdate?: Date;
        /**
         *
         * @type {string}
         * @memberof DataConfigHealthInput
         */
        configurationId: string;
        /**
         *
         * @type {Array<DataSourceHealthNestedInput>}
         * @memberof DataConfigHealthInput
         */
        dataSources: Array<DataSourceHealthNestedInput>;
    }

    /**
     *
     * @export
     * @interface DataConfigHealthNestedInput
     */
    export interface DataConfigHealthNestedInput {
        /**
         *
         * @type {Date}
         * @memberof DataConfigHealthNestedInput
         */
        lastUpdate?: Date;
        /**
         *
         * @type {string}
         * @memberof DataConfigHealthNestedInput
         */
        configurationId: string;
        /**
         *
         * @type {Array<DataSourceHealthNestedInput>}
         * @memberof DataConfigHealthNestedInput
         */
        dataSources: Array<DataSourceHealthNestedInput>;
    }

    /**
     *
     * @export
     * @interface DataPointHealth
     */
    export interface DataPointHealth {
        /**
         *
         * @type {Date}
         * @memberof DataPointHealth
         */
        lastUpdate?: Date;
        /**
         *
         * @type {string}
         * @memberof DataPointHealth
         */
        dataPointId: string;
        /**
         *
         * @type {HealthStatus}
         * @memberof DataPointHealth
         */
        health: HealthStatus;
        /**
         *
         * @type {string}
         * @memberof DataPointHealth
         */
        message?: string;
        /**
         *
         * @type {Date}
         * @memberof DataPointHealth
         */
        lastErrorTime?: Date;
        /**
         *
         * @type {string}
         * @memberof DataPointHealth
         */
        lastErrorMessage?: string;
        /**
         *
         * @type {string}
         * @memberof DataPointHealth
         */
        lastErrorCode?: string;
        /**
         *
         * @type {Date}
         * @memberof DataPointHealth
         */
        lastSuccessfulReadTime?: Date;
    }

    /**
     *
     * @export
     * @interface DataPointHealthNestedInput
     */
    export interface DataPointHealthNestedInput {
        /**
         *
         * @type {Date}
         * @memberof DataPointHealthNestedInput
         */
        lastUpdate?: Date;
        /**
         *
         * @type {string}
         * @memberof DataPointHealthNestedInput
         */
        dataPointId: string;
        /**
         *
         * @type {HealthStatus}
         * @memberof DataPointHealthNestedInput
         */
        health: HealthStatus;
        /**
         *
         * @type {string}
         * @memberof DataPointHealthNestedInput
         */
        message?: string;
        /**
         *
         * @type {string}
         * @memberof DataPointHealthNestedInput
         */
        errorCode?: string;
    }

    /**
     *
     * @export
     * @interface DataSourceHealth
     */
    export interface DataSourceHealth {
        /**
         *
         * @type {Date}
         * @memberof DataSourceHealth
         */
        lastUpdate?: Date;
        /**
         *
         * @type {string}
         * @memberof DataSourceHealth
         */
        name: string;
        /**
         *
         * @type {string}
         * @memberof DataSourceHealth
         */
        dataSourceId?: string;
        /**
         *
         * @type {HealthStatus}
         * @memberof DataSourceHealth
         */
        health: HealthStatus;
        /**
         *
         * @type {string}
         * @memberof DataSourceHealth
         */
        message?: string;
        /**
         *
         * @type {Array<DataPointHealth>}
         * @memberof DataSourceHealth
         */
        dataPoints?: Array<DataPointHealth>;
    }

    /**
     *
     * @export
     * @interface DataSourceHealthNestedInput
     */
    export interface DataSourceHealthNestedInput {
        /**
         *
         * @type {Date}
         * @memberof DataSourceHealthNestedInput
         */
        lastUpdate?: Date;
        /**
         *
         * @type {string}
         * @memberof DataSourceHealthNestedInput
         */
        name: string;
        /**
         *
         * @type {string}
         * @memberof DataSourceHealthNestedInput
         */
        dataSourceId?: string;
        /**
         *
         * @type {HealthStatus}
         * @memberof DataSourceHealthNestedInput
         */
        health: HealthStatus;
        /**
         *
         * @type {string}
         * @memberof DataSourceHealthNestedInput
         */
        message?: string;
        /**
         *
         * @type {Array<DataPointHealthNestedInput>}
         * @memberof DataSourceHealthNestedInput
         */
        dataPoints?: Array<DataPointHealthNestedInput>;
    }

    /**
     *
     * @export
     * @interface DeviceHealthStatusReport
     */
    export interface DeviceHealthStatusReport {
        /**
         *
         * @type {Date}
         * @memberof DeviceHealthStatusReport
         */
        lastUpdate?: Date;
        /**
         *
         * @type {OverallDeviceHealth}
         * @memberof DeviceHealthStatusReport
         */
        overall?: OverallDeviceHealth;
        /**
         *
         * @type {DataConfigHealth}
         * @memberof DeviceHealthStatusReport
         */
        dataConfigHealth?: DataConfigHealth;
        /**
         *
         * @type {{ [key: string]: any; }}
         * @memberof DeviceHealthStatusReport
         */
        customConfigHealth?: { [key: string]: any; };
    }

    /**
     *
     * @export
     * @interface DeviceHealthStatusReportInput
     */
    export interface DeviceHealthStatusReportInput {
        /**
         *
         * @type {OverallDeviceHealth}
         * @memberof DeviceHealthStatusReportInput
         */
        overall?: OverallDeviceHealth;
        /**
         *
         * @type {DataConfigHealthNestedInput}
         * @memberof DeviceHealthStatusReportInput
         */
        dataConfigHealth?: DataConfigHealthNestedInput;
        /**
         *
         * @type {{ [key: string]: any; }}
         * @memberof DeviceHealthStatusReportInput
         */
        customConfigHealth?: { [key: string]: any; };
    }

    /**
     *
     * @export
     * @interface ErrorResponse
     */
    export interface ErrorResponse {
        /**
         *
         * @type {Array<Error>}
         * @memberof ErrorResponse
         */
        errors?: Array<Error>;
    }

    /**
     *
     * @export
     * @enum {string}
     */
    export enum HealthStatus {
        OK = <any> "OK",
        WARNING = <any> "WARNING",
        ERROR = <any> "ERROR"
    }

    /**
     *
     * @export
     * @interface Heartbeat
     */
    export interface Heartbeat {
        /**
         *
         * @type {Date}
         * @memberof Heartbeat
         */
        lastUpdate: Date;
        /**
         *
         * @type {boolean}
         * @memberof Heartbeat
         */
        online: boolean;
    }

    /**
     * collection of installation records for software installed on a device
     * @export
     * @interface InventoryApplicationArray
     */
    export interface InventoryApplicationArray extends Array<InventoryApplicationEntry> {
    }

    /**
     * installation record for a single edge application installed on a device
     * @export
     * @interface InventoryApplicationEntry
     */
    export interface InventoryApplicationEntry {
        /**
         * unique, version independent id of the edge application product
         * @type {string}
         * @memberof InventoryApplicationEntry
         */
        softwareId: string;
        /**
         * the version of the software; uniquely identifies a edge application release in combination with softwareId
         * @type {string}
         * @memberof InventoryApplicationEntry
         */
        version: string;
        /**
         *
         * @type {SoftwareTypeApplication}
         * @memberof InventoryApplicationEntry
         */
        type: SoftwareTypeApplication;
        /**
         * optional; short, human readable description of the edge application, will be displayed directly to end user if the installed edge application is not known to the backend
         * @type {string}
         * @memberof InventoryApplicationEntry
         */
        description?: string;
        /**
         * optional; time of installation; current time will be used if omitted
         * @type {Date}
         * @memberof InventoryApplicationEntry
         */
        installedAt: Date;
    }

    /**
     * collection of installation records for software installed on a device
     * @export
     * @interface InventoryArray
     */
    export interface InventoryArray extends Array<InventoryEntry> {
    }

    /**
     * installation record for a single software installed on a device
     * @export
     * @interface InventoryEntry
     */
    export interface InventoryEntry {
        /**
         * unique, version independent id of the software product
         * @type {string}
         * @memberof InventoryEntry
         */
        softwareId: string;
        /**
         * the version of the software; uniquely identifies a software release in combination with softwareId
         * @type {string}
         * @memberof InventoryEntry
         */
        version: string;
        /**
         *
         * @type {SoftwareType}
         * @memberof InventoryEntry
         */
        type: SoftwareType;
        /**
         * optional; short, human readable description of the software, will be displayed directly to end user if the installed software is not known to the backend
         * @type {string}
         * @memberof InventoryEntry
         */
        description?: string;
        /**
         * optional; time of installation; current time will be used if omitted
         * @type {Date}
         * @memberof InventoryEntry
         */
        installedAt: Date;
    }

    /**
     * installation record for a single firmware installed on a device
     * @export
     * @interface InventoryFirmwareEntry
     */
    export interface InventoryFirmwareEntry {
        /**
         * unique, version independent id of the firmware product
         * @type {string}
         * @memberof InventoryFirmwareEntry
         */
        softwareId: string;
        /**
         * the version of the software; uniquely identifies a firmware release in combination with softwareId
         * @type {string}
         * @memberof InventoryFirmwareEntry
         */
        version: string;
        /**
         *
         * @type {SoftwareTypeFirmware}
         * @memberof InventoryFirmwareEntry
         */
        type: SoftwareTypeFirmware;
        /**
         * optional; short, human readable description of the firmware, will be displayed directly to end user if the installed firmware is not known to the backend
         * @type {string}
         * @memberof InventoryFirmwareEntry
         */
        description?: string;
        /**
         * optional; time of installation; current time will be used if omitted
         * @type {Date}
         * @memberof InventoryFirmwareEntry
         */
        installedAt: Date;
    }

    /**
     *
     * @export
     * @interface ModelError
     */
    export interface ModelError {
        /**
         * identifier code for the reason of the error
         * @type {string}
         * @memberof ModelError
         */
        code?: string;
        /**
         * log correlation ID
         * @type {string}
         * @memberof ModelError
         */
        logref?: string;
        /**
         * error message
         * @type {string}
         * @memberof ModelError
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface OnlineStatus
     */
    export interface OnlineStatus {
        /**
         *
         * @type {Heartbeat}
         * @memberof OnlineStatus
         */
        heartbeat: Heartbeat;
    }

    /**
     *
     * @export
     * @interface OverallDeviceHealth
     */
    export interface OverallDeviceHealth {
        /**
         *
         * @type {Date}
         * @memberof OverallDeviceHealth
         */
        lastUpdate?: Date;
        /**
         *
         * @type {HealthStatus}
         * @memberof OverallDeviceHealth
         */
        health: HealthStatus;
        /**
         *
         * @type {string}
         * @memberof OverallDeviceHealth
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface PaginatedSoftwareInventoryRecord
     */
    export interface PaginatedSoftwareInventoryRecord {
        /**
         *
         * @type {Array<SoftwareInventoryRecord>}
         * @memberof PaginatedSoftwareInventoryRecord
         */
        content?: Array<SoftwareInventoryRecord>;
        /**
         *
         * @type {any}
         * @memberof PaginatedSoftwareInventoryRecord
         */
        page?: any;
    }

    /**
     * information about a software release installed on a device
     * @export
     * @interface SoftwareInventoryRecord
     */
    export interface SoftwareInventoryRecord {
        /**
         * id of the inventory record
         * @type {string}
         * @memberof SoftwareInventoryRecord
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof SoftwareInventoryRecord
         */
        deviceId?: string;
        /**
         *
         * @type {string}
         * @memberof SoftwareInventoryRecord
         */
        softwareType?: SoftwareInventoryRecord.SoftwareTypeEnum;
        /**
         * id of the software \"product\" (version independent id)
         * @type {string}
         * @memberof SoftwareInventoryRecord
         */
        softwareId?: string;
        /**
         * id of the software release (version dependent id)
         * @type {string}
         * @memberof SoftwareInventoryRecord
         */
        softwareReleaseId?: string;
        /**
         * version number of the software release
         * @type {string}
         * @memberof SoftwareInventoryRecord
         */
        version?: string;
        /**
         * installation time (accuracy depends on device side implementation)
         * @type {Date}
         * @memberof SoftwareInventoryRecord
         */
        installedAt?: Date;
        /**
         * source of information, `MANUAL` indicated the device notified the backend that the software is present; SWDEPLOY indicated the software was installed via the software deployment service of the backend
         * @type {string}
         * @memberof SoftwareInventoryRecord
         */
        installedBy?: SoftwareInventoryRecord.InstalledByEnum;
    }

    /**
     * @export
     * @namespace SoftwareInventoryRecord
     */
    export namespace SoftwareInventoryRecord {
        /**
         * @export
         * @enum {string}
         */
        export enum SoftwareTypeEnum {
            FIRMWARE = <any> "FIRMWARE",
            APP = <any> "APP"
        }
        /**
         * @export
         * @enum {string}
         */
        export enum InstalledByEnum {
            MANUAL = <any> "MANUAL",
            SWDEPLOY = <any> "SWDEPLOY"
        }
    }

    /**
     * the type of software, will be extended over time with new values
     * @export
     * @enum {string}
     */
    export enum SoftwareType {
        FIRMWARE = <any> "FIRMWARE",
        APP = <any> "APP"
    }

    /**
     * the type representation of edge applications
     * @export
     * @enum {string}
     */
    export enum SoftwareTypeApplication {
        APP = <any> "APP"
    }

    /**
     * the type representation of firmware
     * @export
     * @enum {string}
     */
    export enum SoftwareTypeFirmware {
        FIRMWARE = <any> "FIRMWARE"
    }
}

export namespace DeviceConfigurationModels {

    /**
     *
     * @export
     * @class RequiredError
     * @extends {Error}
     */
    export class RequiredError extends Error {
        name: "RequiredError" = "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
        }
    }

    /**
     *
     * @export
     * @interface ConfigurationFile
     */
    export interface ConfigurationFile {
        /**
         * unique \"path\" of the file
         * @type {string}
         * @memberof ConfigurationFile
         */
        path: string;
        /**
         * optional description of the file's content or purpose
         * @type {string}
         * @memberof ConfigurationFile
         */
        description?: string;
    }

    /**
     *
     * @export
     * @interface ConfigurationFileReference
     */
    export interface ConfigurationFileReference {
        /**
         * name of the file
         * @type {string}
         * @memberof ConfigurationFileReference
         */
        name: string;
        /**
         * download URI
         * @type {string}
         * @memberof ConfigurationFileReference
         */
        uri: string;
        /**
         * hash of the file in format `<algorithm>:<hash in hex>`
         * @type {string}
         * @memberof ConfigurationFileReference
         */
        checksum: string;
    }

    /**
     * information about a single state of the state machine
     * @export
     * @interface ConfigurationStateInfo
     */
    export interface ConfigurationStateInfo {
        /**
         * date and time when the state was first entered
         * @type {Date}
         * @memberof ConfigurationStateInfo
         */
        entered?: Date;
        /**
         * date and time the state was last updated, will differ from \"entered\" if state is updated repeatedly
         * @type {Date}
         * @memberof ConfigurationStateInfo
         */
        updated?: Date;
        /**
         * progress in current state as value in [0.0, 1.0]
         * @type {number}
         * @memberof ConfigurationStateInfo
         */
        progress?: number;
        /**
         * status message / info, free text from device
         * @type {string}
         * @memberof ConfigurationStateInfo
         */
        message?: string;
        /**
         * arbitrary block of json data, should be used to report additional information such as error details, stack traces, etc; max size in string representation is 20k
         * @type {any}
         * @memberof ConfigurationStateInfo
         */
        details?: any;
        /**
         * name of the state
         * @type {string}
         * @memberof ConfigurationStateInfo
         */
        state?: ConfigurationStateInfo.StateEnum;
    }

    /**
     * @export
     * @namespace ConfigurationStateInfo
     */
    export namespace ConfigurationStateInfo {
        /**
         * @export
         * @enum {string}
         */
        export enum StateEnum {
            CREATED = <any> "CREATED",
            CONFIGURE = <any> "CONFIGURE",
            CONFIGURING = <any> "CONFIGURING",
            CONFIGURED = <any> "CONFIGURED",
            CANCELED = <any> "CANCELED",
            FAILED = <any> "FAILED"
        }
    }

    /**
     * a configuration update task
     * @export
     * @interface ConfigurationTask
     */
    export interface ConfigurationTask {
        /**
         * unique id of the task
         * @type {string}
         * @memberof ConfigurationTask
         */
        id?: string;
        /**
         * unique id of the device owning the task
         * @type {string}
         * @memberof ConfigurationTask
         */
        deviceId?: string;
        /**
         * list of files to be updated as part of this task
         * @type {Array<ConfigurationFileReference>}
         * @memberof ConfigurationTask
         */
        files?: Array<ConfigurationFileReference>;
        /**
         * optional; arbitrary, user defined block of json containing additional information for the device
         * @type {any}
         * @memberof ConfigurationTask
         */
        customData?: any;
        /**
         * creation time of the task
         * @type {Date}
         * @memberof ConfigurationTask
         */
        createdAt?: Date;
        /**
         *
         * @type {ConfigurationStateInfo}
         * @memberof ConfigurationTask
         */
        currentState?: ConfigurationStateInfo;
        /**
         *
         * @type {Target}
         * @memberof ConfigurationTask
         */
        target?: Target;
        /**
         * list of history to be updated as part of this task
         * @type {Array<ConfigurationStateInfo>}
         * @memberof ConfigurationTask
         */
        history?: Array<ConfigurationStateInfo>;
        /**
         * list of history to be updated as part of this task
         * @type {Array<Transition>}
         * @memberof ConfigurationTask
         */
        transitions?: Array<Transition>;
    }

    /**
     *
     * @export
     * @interface ErrorResponse
     */
    export interface ErrorResponse {
        /**
         *
         * @type {Array<Error>}
         * @memberof ErrorResponse
         */
        errors?: Array<Error>;
    }

    /**
     *
     * @export
     * @interface FileMetaData
     */
    export interface FileMetaData {
        /**
         *
         * @type {string}
         * @memberof FileMetaData
         */
        description?: string;
        /**
         *
         * @type {string}
         * @memberof FileMetaData
         */
        head?: string;
        /**
         *
         * @type {string}
         * @memberof FileMetaData
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof FileMetaData
         */
        path?: string;
    }

    /**
     * paginated list of files meta data
     * @export
     * @interface PaginatedFileMetaData
     */
    export interface PaginatedFileMetaData {
        /**
         *
         * @type {Array<FileMetaData>}
         * @memberof PaginatedFileMetaData
         */
        content?: Array<FileMetaData>;
        /**
         *
         * @type {any}
         * @memberof PaginatedFileMetaData
         */
        page?: any;
    }

    /**
     *
     * @export
     * @interface ModelError
     */
    export interface ModelError {
        /**
         * identifier code for the reason of the error
         * @type {string}
         * @memberof ModelError
         */
        code?: string;
        /**
         * log correlation ID
         * @type {string}
         * @memberof ModelError
         */
        logref?: string;
        /**
         * error message
         * @type {string}
         * @memberof ModelError
         */
        message?: string;
    }

    /**
     * paginated list of configuration update tasks
     * @export
     * @interface PaginatedConfigurationTask
     */
    export interface PaginatedConfigurationTask {
        /**
         *
         * @type {Array<ConfigurationTask>}
         * @memberof PaginatedConfigurationTask
         */
        content?: Array<ConfigurationTask>;
        /**
         *
         * @type {any}
         * @memberof PaginatedConfigurationTask
         */
        page?: any;
    }

    /**
     * Content of the file
     * @export
     * @interface Payload
     */
    export interface Payload {
    }

    /**
     *
     * @export
     * @interface RevisionMetaData
     */
    export interface RevisionMetaData {
        /**
         * the hash of the file revision, also serves as unique identifier of the revision (content based addressing)
         * @type {string}
         * @memberof RevisionMetaData
         */
        hash?: string;
        /**
         * the id of the file this revision belongs to
         * @type {string}
         * @memberof RevisionMetaData
         */
        fileId?: string;
        /**
         * length of the content (=file size in bytes)
         * @type {number}
         * @memberof RevisionMetaData
         */
        contentLength?: number;
        /**
         * content type of the content as used by http (MIME type + charset or other attributes)
         * @type {string}
         * @memberof RevisionMetaData
         */
        contentType?: string;
    }

    /**
     * paginated list of files meta data
     * @export
     * @interface PaginatedRevisionMetaData
     */
    export interface PaginatedRevisionMetaData {
        /**
         *
         * @type {Array<RevisionMetaData>}
         * @memberof PaginatedRevisionMetaData
         */
        content?: Array<RevisionMetaData>;
        /**
         *
         * @type {any}
         * @memberof PaginatedRevisionMetaData
         */
        page?: any;
    }

    /**
     * target of the task in the device
     * @export
     * @interface Target
     */
    export interface Target {
        /**
         * target address of the task in the device
         * @type {string}
         * @memberof Target
         */
        address?: string;
    }

    /**
     *
     * @export
     * @interface TaskDefinition
     */
    export interface TaskDefinition {
        /**
         *
         * @type {Array<ConfigurationFileReference>}
         * @memberof TaskDefinition
         */
        files: Array<ConfigurationFileReference>;
        /**
         * optional; arbitrary, user defined block of json containing additional information for the device
         * @type {{ [key: string]: any; }}
         * @memberof TaskDefinition
         */
        customData?: { [key: string]: any; };
        /**
         * optional; arbitrary, user defined block of json containing target
         * @type {any}
         * @memberof TaskDefinition
         */
        target?: any;
    }

    /**
     * a transition state
     * @export
     * @interface Transition
     */
    export interface Transition {
        /**
         * current transition of the task
         * @type {string}
         * @memberof Transition
         */
        from?: string;
        /**
         * next transition of the task
         * @type {string}
         * @memberof Transition
         */
        to?: string;
    }

    /**
     *
     * @export
     * @interface Updatetask
     */
    export interface Updatetask {
        /**
         *
         * @type {string}
         * @memberof Updatetask
         */
        state: Updatetask.StateEnum;
        /**
         * progress in current state as value in [0.0, 1.0]
         * @type {number}
         * @memberof Updatetask
         */
        progress: number;
        /**
         * optional; status message / info, free text from device
         * @type {string}
         * @memberof Updatetask
         */
        message?: string;
        /**
         * optional; arbitrary block of json data, should be used to report additional information such as error details, stack traces, etc; max size in string representation is 20k
         * @type {any}
         * @memberof Updatetask
         */
        details?: any;
    }

    /**
     * @export
     * @namespace Updatetask
     */
    export namespace Updatetask {
        /**
         * @export
         * @enum {string}
         */
        export enum StateEnum {
            CONFIGURING = <any> "CONFIGURING",
            CONFIGURED = <any> "CONFIGURED",
            CANCELED = <any> "CANCELED",
            FAILED = <any> "FAILED"
        }
    }
}

export namespace DeploymentWorkflowModels {

    /**
     *
     * @export
     * @class RequiredError
     * @extends {Error}
     */
    export class RequiredError extends Error {
        name: "RequiredError" = "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
        }
    }

    /**
     *
     * @export
     * @interface CustomTransition
     */
    export interface CustomTransition {
        /**
         *
         * @type {string}
         * @memberof CustomTransition
         */
        from: string;
        /**
         *
         * @type {string}
         * @memberof CustomTransition
         */
        to: string;
        /**
         *
         * @type {TransitionType}
         * @memberof CustomTransition
         */
        type: TransitionType;
        /**
         *
         * @type {{ [key: string]: any; }}
         * @memberof CustomTransition
         */
        details?: { [key: string]: any; };
    }

    /**
     *
     * @export
     * @interface ErrorResponse
     */
    export interface ErrorResponse {
        /**
         *
         * @type {Array<Error>}
         * @memberof ErrorResponse
         */
        errors?: Array<Error>;
    }

    /**
     *
     * @export
     * @interface Instance
     */
    export interface Instance {
        /**
         *
         * @type {string}
         * @memberof Instance
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Instance
         */
        deviceId?: string;
        /**
         * date and time when the instance was created
         * @type {Date}
         * @memberof Instance
         */
        createdAt?: Date;
        /**
         *
         * @type {StateInfo}
         * @memberof Instance
         */
        currentState?: StateInfo;
        /**
         *
         * @type {Array<StateInfo>}
         * @memberof Instance
         */
        history?: Array<StateInfo>;
        /**
         *
         * @type {InstanceModel}
         * @memberof Instance
         */
        model?: InstanceModel;
        /**
         *
         * @type {{ [key: string]: any; }}
         * @memberof Instance
         */
        data?: { [key: string]: any; };
    }

    /**
     *
     * @export
     * @interface InstanceModel
     */
    export interface InstanceModel {
        /**
         *
         * @type {string}
         * @memberof InstanceModel
         */
        key?: string;
        /**
         *
         * @type {Array<State>}
         * @memberof InstanceModel
         */
        states?: Array<State>;
        /**
         *
         * @type {Array<CustomTransition>}
         * @memberof InstanceModel
         */
        transitions?: Array<CustomTransition>;
        /**
         *
         * @type {Array<StateGroup>}
         * @memberof InstanceModel
         */
        stateGroups?: Array<StateGroup>;
    }

    /**
     *
     * @export
     * @interface InstanceRequest
     */
    export interface InstanceRequest {
        /**
         *
         * @type {string}
         * @memberof InstanceRequest
         */
        deviceId?: string;
        /**
         *
         * @type {ModelCustomization}
         * @memberof InstanceRequest
         */
        model?: ModelCustomization;
        /**
         *
         * @type {{ [key: string]: any; }}
         * @memberof InstanceRequest
         */
        data?: { [key: string]: any; };
    }

    /**
     *
     * @export
     * @interface Model
     */
    export interface Model {
        /**
         * User provided unique model name
         * @type {string}
         * @memberof Model
         */
        key?: string;
        /**
         *
         * @type {Array<State>}
         * @memberof Model
         */
        states?: Array<State>;
        /**
         *
         * @type {Array<Transition>}
         * @memberof Model
         */
        transitions?: Array<Transition>;
        /**
         *
         * @type {Array<StateGroup>}
         * @memberof Model
         */
        groups?: Array<StateGroup>;
    }

    /**
     *
     * @export
     * @interface ModelCustomization
     */
    export interface ModelCustomization {
        /**
         *
         * @type {string}
         * @memberof ModelCustomization
         */
        key?: string;
        /**
         *
         * @type {Array<CustomTransition>}
         * @memberof ModelCustomization
         */
        customTransitions?: Array<CustomTransition>;
    }

    /**
     *
     * @export
     * @interface ModelError
     */
    export interface ModelError {
        /**
         * identifier code for the reason of the error
         * @type {string}
         * @memberof ModelError
         */
        code?: string;
        /**
         * log correlation ID
         * @type {string}
         * @memberof ModelError
         */
        logref?: string;
        /**
         * error message
         * @type {string}
         * @memberof ModelError
         */
        message?: string;
    }

    /**
     * paginated list of instances
     * @export
     * @interface PaginatedInstanceList
     */
    export interface PaginatedInstanceList {
        /**
         *
         * @type {Array<Instance>}
         * @memberof PaginatedInstanceList
         */
        content?: Array<Instance>;
        /**
         *
         * @type {any}
         * @memberof PaginatedInstanceList
         */
        page?: any;
    }

    /**
     *
     * @export
     * @interface State
     */
    export interface State {
        /**
         *
         * @type {string}
         * @memberof State
         */
        name: string;
        /**
         *
         * @type {string}
         * @memberof State
         */
        description: string;
        /**
         *
         * @type {boolean}
         * @memberof State
         */
        initial?: boolean;
        /**
         *
         * @type {boolean}
         * @memberof State
         */
        _final?: boolean;
        /**
         *
         * @type {boolean}
         * @memberof State
         */
        cancel?: boolean;
    }

    /**
     *
     * @export
     * @interface StateGroup
     */
    export interface StateGroup {
        /**
         *
         * @type {string}
         * @memberof StateGroup
         */
        name?: string;
        /**
         *
         * @type {Array<string>}
         * @memberof StateGroup
         */
        states?: Array<string>;
    }

    /**
     * information about a single state of the state machine
     * @export
     * @interface StateInfo
     */
    export interface StateInfo {
        /**
         * date and time when the state was first entered
         * @type {Date}
         * @memberof StateInfo
         */
        entered?: Date;
        /**
         * date and time the state was last updated, will differ from \"entered\" if state is updated repeatedly
         * @type {Date}
         * @memberof StateInfo
         */
        updated?: Date;
        /**
         * progress in current state as value in [0.0, 1.0]
         * @type {number}
         * @memberof StateInfo
         */
        progress?: number;
        /**
         * status message / info, free text from device
         * @type {string}
         * @memberof StateInfo
         */
        message?: string;
        /**
         * arbitrary block of json data, should be used to report additional information such as error details, stack traces, etc; max size in string representation is 20k
         * @type {{ [key: string]: any; }}
         * @memberof StateInfo
         */
        details?: { [key: string]: any; };
        /**
         * name of the state
         * @type {string}
         * @memberof StateInfo
         */
        state?: string;
    }

    /**
     *
     * @export
     * @interface Transition
     */
    export interface Transition {
        /**
         *
         * @type {string}
         * @memberof Transition
         */
        from: string;
        /**
         *
         * @type {string}
         * @memberof Transition
         */
        to: string;
        /**
         *
         * @type {TransitionType}
         * @memberof Transition
         */
        type: TransitionType;
        /**
         *
         * @type {Array<TransitionType>}
         * @memberof Transition
         */
        allowedTypes?: Array<TransitionType>;
    }

    /**
     *
     * @export
     * @enum {string}
     */
    export enum TransitionType {
        INSTANTANEOUS = <any> "INSTANTANEOUS",
        BACKENDTRIGGER = <any> "BACKEND_TRIGGER",
        DEVICETRIGGER = <any> "DEVICE_TRIGGER",
        BACKENDTIMETRIGGER = <any> "BACKEND_TIME_TRIGGER",
        DEVICETIMETRIGGER = <any> "DEVICE_TIME_TRIGGER"
    }
}

export namespace EdgeAppInstanceModels {

    /**
     *
     * @export
     * @class RequiredError
     * @extends {Error}
     */
    export class RequiredError extends Error {
        name: "RequiredError" = "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
        }
    }
    /**
     *
     * @export
     * @interface ApplicationInstance
     */
    export interface ApplicationInstance {
        /**
         *
         * @type {string}
         * @memberof ApplicationInstance
         */
        name: string;
        /**
         *
         * @type {string}
         * @memberof ApplicationInstance
         */
        appInstanceId: string;
        /**
         *
         * @type {string}
         * @memberof ApplicationInstance
         */
        deviceId: string;
        /**
         *
         * @type {string}
         * @memberof ApplicationInstance
         */
        releaseId: string;
        /**
         *
         * @type {string}
         * @memberof ApplicationInstance
         */
        applicationId: string;
    }

    /**
     * paginated list of app instance configurations
     * @export
     * @interface PaginatedApplicationInstance
     */
    export interface PaginatedApplicationInstance {
        /**
         *
         * @type {Array<ApplicationInstance>}
         * @memberof PaginatedApplicationInstance
         */
        content?: Array<ApplicationInstance>;
        /**
         *
         * @type {any}
         * @memberof PaginatedApplicationInstance
         */
        page?: any;
    }

    /**
     *
     * @export
     * @interface ApplicationInstanceLifeCycleResource
     */
    export interface ApplicationInstanceLifeCycleResource {
        /**
         *
         * @type {string}
         * @memberof ApplicationInstanceLifeCycleResource
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof ApplicationInstanceLifeCycleResource
         */
        status?: ApplicationInstanceLifeCycleResource.StatusEnum;
    }

    /**
     * @export
     * @namespace ApplicationInstanceLifeCycleResource
     */
    export namespace ApplicationInstanceLifeCycleResource {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            STOPPED = <any> "STOPPED",
            RUNNING = <any> "RUNNING"
        }
    }

    /**
     *
     * @export
     * @interface ApplicationInstanceLifeCycleStatus
     */
    export interface ApplicationInstanceLifeCycleStatus {
        /**
         *
         * @type {string}
         * @memberof ApplicationInstanceLifeCycleStatus
         */
        status?: ApplicationInstanceLifeCycleStatus.StatusEnum;
    }

    /**
     * @export
     * @namespace ApplicationInstanceLifeCycleStatus
     */
    export namespace ApplicationInstanceLifeCycleStatus {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            STOPPED = <any> "STOPPED",
            RUNNING = <any> "RUNNING"
        }
    }

    /**
     *
     * @export
     * @interface ApplicationInstanceResource
     */
    export interface ApplicationInstanceResource {
        /**
         *
         * @type {string}
         * @memberof ApplicationInstanceResource
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof ApplicationInstanceResource
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof ApplicationInstanceResource
         */
        deviceId?: string;
        /**
         *
         * @type {string}
         * @memberof ApplicationInstanceResource
         */
        releaseId?: string;
        /**
         *
         * @type {string}
         * @memberof ApplicationInstanceResource
         */
        applicationId?: string;
        /**
         *
         * @type {string}
         * @memberof ApplicationInstanceResource
         */
        status?: ApplicationInstanceResource.StatusEnum;
    }

    /**
     * @export
     * @namespace ApplicationInstanceResource
     */
    export namespace ApplicationInstanceResource {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            STOPPED = <any> "STOPPED",
            RUNNING = <any> "RUNNING"
        }
    }

    /**
     *
     * @export
     * @interface ErrorResponse
     */
    export interface ErrorResponse {
        /**
         *
         * @type {Array<any>}
         * @memberof ErrorResponse
         */
        errors?: Array<any>;
    }

    /**
     *
     * @export
     * @interface InstanceConfiguration
     */
    export interface InstanceConfiguration {
        /**
         * ID of the device
         * @type {string}
         * @memberof InstanceConfiguration
         */
        deviceId: string;
        /**
         * ID of the application product
         * @type {string}
         * @memberof InstanceConfiguration
         */
        appId: string;
        /**
         * ID of the application release
         * @type {string}
         * @memberof InstanceConfiguration
         */
        appReleaseId: string;
        /**
         * ID of the application instance
         * @type {string}
         * @memberof InstanceConfiguration
         */
        appInstanceId: string;
        /**
         * User defined custom properties
         * @type {{ [key: string]: any; }}
         * @memberof InstanceConfiguration
         */
        configuration: { [key: string]: any; };
    }

    /**
     *
     * @export
     * @interface InstanceConfigurationResource
     */
    export interface InstanceConfigurationResource {
        /**
         * ID of the device
         * @type {string}
         * @memberof InstanceConfigurationResource
         */
        deviceId?: string;
        /**
         * ID of the application product
         * @type {string}
         * @memberof InstanceConfigurationResource
         */
        appId?: string;
        /**
         * ID of the application release
         * @type {string}
         * @memberof InstanceConfigurationResource
         */
        appReleaseId?: string;
        /**
         * ID of the application instance
         * @type {string}
         * @memberof InstanceConfigurationResource
         */
        appInstanceId?: string;
        /**
         * User defined custom properties
         * @type {{ [key: string]: any; }}
         * @memberof InstanceConfigurationResource
         */
        configuration?: { [key: string]: any; };
    }

    /**
     * paginated list of app instance configurations
     * @export
     * @interface PaginatedInstanceConfigurationResource
     */
    export interface PaginatedInstanceConfigurationResource {
        /**
         *
         * @type {Array<InstanceConfigurationResource>}
         * @memberof PaginatedInstanceConfigurationResource
         */
        content?: Array<InstanceConfigurationResource>;
        /**
         *
         * @type {any}
         * @memberof PaginatedInstanceConfigurationResource
         */
        page?: any;
    }

    /**
     *
     * @export
     * @interface ProcessInstanceConfiguration
     */
    export interface ProcessInstanceConfiguration {
        /**
         *
         * @type {Array<any>}
         * @memberof ProcessInstanceConfiguration
         */
        instanceConfigurations?: Array<any>;
    }
}

export namespace EdgeAppDeploymentModels {

    /**
     *
     * @export
     */
    export const COLLECTION_FORMATS = {
        csv: ",",
        ssv: " ",
        tsv: "\t",
        pipes: "|",
    };

    /**
     *
     * @export
     * @class RequiredError
     * @extends {Error}
     */
    export class RequiredError extends Error {
        name: "RequiredError" = "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
        }
    }

    /**
     *
     * @export
     * @interface ErrorResponse
     */
    export interface ErrorResponse {
        /**
         *
         * @type {Array<any>}
         * @memberof ErrorResponse
         */
        errors?: Array<any>;
    }

    /**
     *
     * @export
     * @interface Task
     */
    export interface Task {
        /**
         * ID of the device (Will be taken from path if omitted)
         * @type {string}
         * @memberof Task
         */
        deviceId: string;
        /**
         * Globally unique ID of the software product (Version independent)
         * @type {string}
         * @memberof Task
         */
        softwareId: string;
        /**
         * Globally unique ID of the release (Version dependent)
         * @type {string}
         * @memberof Task
         */
        softwareReleaseId: string;
        /**
         * Arbitrary, user defined block of json contaning additional information for the device
         * @type {{ [key: string]: any; }}
         * @memberof Task
         */
        customData?: { [key: string]: any; };
    }

    /**
     *
     * @export
     * @interface TaskResource
     */
    export interface TaskResource {
        /**
         * ID of the task
         * @type {string}
         * @memberof TaskResource
         */
        id?: string;
        /**
         * ID of the device owning the task
         * @type {string}
         * @memberof TaskResource
         */
        deviceId?: string;
        /**
         * Type of software artifact
         * @type {string}
         * @memberof TaskResource
         */
        softwareType?: TaskResource.SoftwareTypeEnum;
        /**
         * Globally unique ID of the software product (Version independent)
         * @type {string}
         * @memberof TaskResource
         */
        softwareId?: string;
        /**
         * Globally unique ID of the software release (Version dependent)
         * @type {string}
         * @memberof TaskResource
         */
        softwareReleaseId?: string;
        /**
         * The version of the software release as human readable string
         * @type {string}
         * @memberof TaskResource
         */
        softwareVersion?: string;
        /**
         *
         * @type {any}
         * @memberof TaskResource
         */
        transitions?: any;
        /**
         *
         * @type {any}
         * @memberof TaskResource
         */
        history?: any;
        /**
         *
         * @type {Array<any>}
         * @memberof TaskResource
         */
        artifacts?: Array<any>;
        /**
         * Arbitrary, user defined block of json containing additional information for the device
         * @type {{ [key: string]: any; }}
         * @memberof TaskResource
         */
        customData?: { [key: string]: any; };
        /**
         * Datetime when the task was created
         * @type {Date}
         * @memberof TaskResource
         */
        createdAt?: Date;
        /**
         *
         * @type {any}
         * @memberof TaskResource
         */
        currentState?: any;
    }

    /**
     * paginated list of task ressources
     * @export
     * @interface PaginatedTaskResource
     */
    export interface PaginatedTaskResource {
        /**
         *
         * @type {Array<TaskResource>}
         * @memberof PaginatedTaskResource
         */
        content?: Array<TaskResource>;
        /**
         *
         * @type {any}
         * @memberof PaginatedTaskResource
         */
        page?: any;
    }

    /**
     * @export
     * @namespace TaskResource
     */
    export namespace TaskResource {
        /**
         * @export
         * @enum {string}
         */
        export enum SoftwareTypeEnum {
            APP = <any> "APP"
        }
    }

    /**
     *
     * @export
     * @interface TaskStatus
     */
    export interface TaskStatus {
        /**
         * The new state of the task (might be same as current state)
         * @type {string}
         * @memberof TaskStatus
         */
        state: TaskStatus.StateEnum;
        /**
         * Progress in current state as value in [0.0, 1.0]
         * @type {number}
         * @memberof TaskStatus
         */
        progress: number;
        /**
         * Status message
         * @type {string}
         * @memberof TaskStatus
         */
        message?: string;
        /**
         * Arbitrary block of json data, should be used to report additional information such as error details, stack traces and etc
         * @type {{ [key: string]: any; }}
         * @memberof TaskStatus
         */
        details?: { [key: string]: any; };
    }

    /**
     * @export
     * @namespace TaskStatus
     */
    export namespace TaskStatus {
        /**
         * @export
         * @enum {string}
         */
        export enum StateEnum {
            DOWNLOAD = <any> "DOWNLOAD",
            INSTALL = <any> "INSTALL",
            ACTIVATE = <any> "ACTIVATE",
            CANCELED = <any> "CANCELED",
            FAILED = <any> "FAILED"
        }
    }

    /**
     *
     * @export
     * @interface TermsAndConditions
     */
    export interface TermsAndConditions {
        /**
         * ID of the device
         * @type {string}
         * @memberof TermsAndConditions
         */
        deviceId: string;
        /**
         * ID of the application release
         * @type {string}
         * @memberof TermsAndConditions
         */
        releaseId: string;
    }

    /**
     *
     * @export
     * @interface TermsAndConditionsResource
     */
    export interface TermsAndConditionsResource {
        /**
         * ID of the device
         * @type {string}
         * @memberof TermsAndConditionsResource
         */
        deviceId?: string;
        /**
         * ID of the application release
         * @type {string}
         * @memberof TermsAndConditionsResource
         */
        releaseId?: string;
        /**
         *
         * @type {Date}
         * @memberof TermsAndConditionsResource
         */
        firstAccepted?: Date;
    }
}

export namespace FirmwareDeploymentModels {

    /**
     *
     * @export
     */
    export const COLLECTION_FORMATS = {
        csv: ",",
        ssv: " ",
        tsv: "\t",
        pipes: "|",
    };

    /**
     *
     * @export
     * @class RequiredError
     * @extends {Error}
     */
    export class RequiredError extends Error {
        name: "RequiredError" = "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
        }
    }

    /**
     *
     * @export
     * @interface ErrorResponse
     */
    export interface ErrorResponse {
        /**
         *
         * @type {Array<Error>}
         * @memberof ErrorResponse
         */
        errors?: Array<Error>;
    }

    /**
     *
     * @export
     * @interface InstallationArtifact
     */
    export interface InstallationArtifact {
        /**
         * name of the file
         * @type {string}
         * @memberof InstallationArtifact
         */
        name: string;
        /**
         * download URI
         * @type {string}
         * @memberof InstallationArtifact
         */
        uri: string;
        /**
         * hash of the file in format `<algorithm>:<hash in hex>`
         * @type {string}
         * @memberof InstallationArtifact
         */
        checksum: string;
        /**
         * expiry time for `uri`
         * @type {Date}
         * @memberof InstallationArtifact
         */
        validUntil?: Date;
    }

    /**
     * information about a single state of the state machine
     * @export
     * @interface InstallationStateInfo
     */
    export interface InstallationStateInfo {
        /**
         * date and time when the state was first entered
         * @type {Date}
         * @memberof InstallationStateInfo
         */
        entered?: Date;
        /**
         * date and time the state was last updated, will differ from \"entered\" if state is updated repeatedly
         * @type {Date}
         * @memberof InstallationStateInfo
         */
        updated?: Date;
        /**
         * progress in current state as value in [0.0, 1.0]
         * @type {number}
         * @memberof InstallationStateInfo
         */
        progress?: number;
        /**
         * status message / info, free text from device
         * @type {string}
         * @memberof InstallationStateInfo
         */
        message?: string;
        /**
         * arbitrary block of json data, should be used to report additional information such as error details, stack traces, etc; max size in string representation is 20k
         * @type {any}
         * @memberof InstallationStateInfo
         */
        details?: any;
        /**
         * name of the state
         * @type {string}
         * @memberof InstallationStateInfo
         */
        state?: InstallationStateInfo.StateEnum;
    }

    /**
     * @export
     * @namespace InstallationStateInfo
     */
    export namespace InstallationStateInfo {
        /**
         * @export
         * @enum {string}
         */
        export enum StateEnum {
            CREATED = <any> "CREATED",
            DOWNLOAD = <any> "DOWNLOAD",
            DOWNLOADING = <any> "DOWNLOADING",
            DOWNLOADED = <any> "DOWNLOADED",
            INSTALL = <any> "INSTALL",
            INSTALLING = <any> "INSTALLING",
            INSTALLED = <any> "INSTALLED",
            ACTIVATE = <any> "ACTIVATE",
            ACTIVATING = <any> "ACTIVATING",
            ACTIVATED = <any> "ACTIVATED",
            CANCELED = <any> "CANCELED",
            FAILED = <any> "FAILED"
        }
    }

    /**
     * single task
     * @export
     * @interface InstallationTask
     */
    export interface InstallationTask {
        /**
         * globally unique id of the task
         * @type {string}
         * @memberof InstallationTask
         */
        id?: string;
        /**
         * id of the device owning the task
         * @type {string}
         * @memberof InstallationTask
         */
        deviceId?: string;
        /**
         * type of software artifact: firmware, app, etc; list will be extended in future releases
         * @type {string}
         * @memberof InstallationTask
         */
        softwareType?: InstallationTask.SoftwareTypeEnum;
        /**
         * globally unique id of the software product (version independent id)
         * @type {string}
         * @memberof InstallationTask
         */
        softwareId?: string;
        /**
         * globally unique id of the specific release (version dependent)
         * @type {string}
         * @memberof InstallationTask
         */
        softwareReleaseId?: string;
        /**
         * the version of the software as human readable string
         * @type {string}
         * @memberof InstallationTask
         */
        softwareVersion?: string;
        /**
         * Indicates whether to install or remove the software
         * @type {string}
         * @memberof InstallationTask
         */
        actionType?: InstallationTask.ActionTypeEnum;
        /**
         * if set to true, task is going to be cancelled
         * @type {boolean}
         * @memberof InstallationTask
         */
        shouldCancel?: boolean;
        /**
         * possible set of transitions
         * @type {Array<Transition>}
         * @memberof InstallationTask
         */
        transitions?: Array<Transition>;
        /**
         * previously passed states of task
         * @type {Array<InstallationStateInfo>}
         * @memberof InstallationTask
         */
        history?: Array<InstallationStateInfo>;
        /**
         *
         * @type {Array<InstallationArtifact>}
         * @memberof InstallationTask
         */
        artifacts?: Array<InstallationArtifact>;
        /**
         * optional; arbitrary, user defined block of json containing additional information for the device
         * @type {{ [key: string]: any; }}
         * @memberof InstallationTask
         */
        customData?: { [key: string]: any; };
        /**
         * date and time when the task was created
         * @type {Date}
         * @memberof InstallationTask
         */
        createdAt?: Date;
        /**
         *
         * @type {InstallationStateInfo}
         * @memberof InstallationTask
         */
        currentState?: InstallationStateInfo;
    }

    /**
     * @export
     * @namespace InstallationTask
     */
    export namespace InstallationTask {
        /**
         * @export
         * @enum {string}
         */
        export enum SoftwareTypeEnum {
            FIRMWARE = <any> "FIRMWARE",
            APP = <any> "APP"
        }
        /**
         * @export
         * @enum {string}
         */
        export enum ActionTypeEnum {
            INSTALL = <any> "INSTALL",
            REMOVE = <any> "REMOVE"
        }
    }

    /**
     *
     * @export
     * @interface InstallationTaskInfo
     */
    export interface InstallationTaskInfo {
        /**
         * optional, id of the device; will be taken from path if omitted
         * @type {string}
         * @memberof InstallationTaskInfo
         */
        deviceId?: string;
        /**
         * type of software artifact (firmware, app, etc); list will be extended in future releases
         * @type {string}
         * @memberof InstallationTaskInfo
         */
        softwareType: InstallationTaskInfo.SoftwareTypeEnum;
        /**
         * globally unique id of the software product (version independent id)
         * @type {string}
         * @memberof InstallationTaskInfo
         */
        softwareId: string;
        /**
         * globally unique id of the specific release (version dependent)
         * @type {string}
         * @memberof InstallationTaskInfo
         */
        softwareReleaseId: string;
        /**
         * custom transitions
         * @type {Array<Transition>}
         * @memberof InstallationTaskInfo
         */
        transitions?: Array<Transition>;
        /**
         * optional; arbitrary, user defined block of json containing additional information for the device
         * @type {{ [key: string]: any; }}
         * @memberof InstallationTaskInfo
         */
        customData?: { [key: string]: any; };
    }

    /**
     * @export
     * @namespace InstallationTaskInfo
     */
    export namespace InstallationTaskInfo {
        /**
         * @export
         * @enum {string}
         */
        export enum SoftwareTypeEnum {
            FIRMWARE = <any> "FIRMWARE",
            APP = <any> "APP"
        }
    }

    /**
     *
     * @export
     * @interface ModelError
     */
    export interface ModelError {
        /**
         * identifier code for the reason of the error
         * @type {string}
         * @memberof ModelError
         */
        code?: string;
        /**
         * log correlation ID
         * @type {string}
         * @memberof ModelError
         */
        logref?: string;
        /**
         * error message
         * @type {string}
         * @memberof ModelError
         */
        message?: string;
    }

    /**
     * paginated list of configuration update tasks
     * @export
     * @interface PaginatedInstallationTask
     */
    export interface PaginatedInstallationTask {
        /**
         *
         * @type {Array<InstallationTask>}
         * @memberof PaginatedInstallationTask
         */
        content?: Array<InstallationTask>;
        /**
         *
         * @type {any}
         * @memberof PaginatedInstallationTask
         */
        page?: any;
    }

    /**
     * backend sent progress update
     * @export
     * @interface TaskUpdate
     */
    export interface TaskUpdate {
        /**
         * the new state of the task (might be same as current state)
         * @type {string}
         * @memberof TaskUpdate
         */
        state: TaskUpdate.StateEnum;
        /**
         * progress in current state as value in [0.0, 1.0]
         * @type {number}
         * @memberof TaskUpdate
         */
        progress: number;
        /**
         * optional; status message / info, free text from backend
         * @type {string}
         * @memberof TaskUpdate
         */
        message?: string;
        /**
         * arbitrary block of json data, should be used to report additional information such as error details, stack traces, etc; max size in string representation is 20k
         * @type {any}
         * @memberof TaskUpdate
         */
        details?: any;
    }

    /**
     * @export
     * @namespace TaskUpdate
     */
    export namespace TaskUpdate {
        /**
         * @export
         * @enum {string}
         */
        export enum StateEnum {
            CREATED = <any> "CREATED",
            DOWNLOAD = <any> "DOWNLOAD",
            DOWNLOADING = <any> "DOWNLOADING",
            DOWNLOADED = <any> "DOWNLOADED",
            INSTALL = <any> "INSTALL",
            INSTALLING = <any> "INSTALLING",
            INSTALLED = <any> "INSTALLED",
            ACTIVATE = <any> "ACTIVATE",
            ACTIVATING = <any> "ACTIVATING",
            ACTIVATED = <any> "ACTIVATED",
            CANCELED = <any> "CANCELED",
            FAILED = <any> "FAILED"
        }
    }

    /**
     *
     * @export
     * @interface TermsAndConditionsAcceptance
     */
    export interface TermsAndConditionsAcceptance {
        /**
         *
         * @type {string}
         * @memberof TermsAndConditionsAcceptance
         */
        deviceId?: string;
        /**
         *
         * @type {string}
         * @memberof TermsAndConditionsAcceptance
         */
        releaseId?: string;
    }

    /**
     *
     * @export
     * @interface TermsAndConditionsRecord
     */
    export interface TermsAndConditionsRecord {
        /**
         *
         * @type {string}
         * @memberof TermsAndConditionsRecord
         */
        deviceId?: string;
        /**
         *
         * @type {string}
         * @memberof TermsAndConditionsRecord
         */
        releaseId?: string;
        /**
         *
         * @type {Date}
         * @memberof TermsAndConditionsRecord
         */
        firstAccepted?: Date;
        /**
         *
         * @type {string}
         * @memberof TermsAndConditionsRecord
         */
        softwareId?: string;
        /**
         *
         * @type {string}
         * @memberof TermsAndConditionsRecord
         */
        bundleId?: string;
    }

    /**
     * Information about the transition status
     * @export
     * @interface Transition
     */
    export interface Transition {
        /**
         * type of the transition
         * @type {string}
         * @memberof Transition
         */
        type?: string;
        /**
         * name of the state
         * @type {string}
         * @memberof Transition
         */
        from?: Transition.FromEnum;
        /**
         * name of the state
         * @type {string}
         * @memberof Transition
         */
        to?: Transition.ToEnum;
        /**
         *
         * @type {any}
         * @memberof Transition
         */
        details?: any;
    }

    /**
     * @export
     * @namespace Transition
     */
    export namespace Transition {
        /**
         * @export
         * @enum {string}
         */
        export enum FromEnum {
            CREATED = <any> "CREATED",
            DOWNLOAD = <any> "DOWNLOAD",
            DOWNLOADING = <any> "DOWNLOADING",
            DOWNLOADED = <any> "DOWNLOADED",
            INSTALL = <any> "INSTALL",
            INSTALLING = <any> "INSTALLING",
            INSTALLED = <any> "INSTALLED",
            ACTIVATE = <any> "ACTIVATE",
            ACTIVATING = <any> "ACTIVATING",
            ACTIVATED = <any> "ACTIVATED",
            CANCELED = <any> "CANCELED",
            FAILED = <any> "FAILED"
        }
        /**
         * @export
         * @enum {string}
         */
        export enum ToEnum {
            CREATED = <any> "CREATED",
            DOWNLOAD = <any> "DOWNLOAD",
            DOWNLOADING = <any> "DOWNLOADING",
            DOWNLOADED = <any> "DOWNLOADED",
            INSTALL = <any> "INSTALL",
            INSTALLING = <any> "INSTALLING",
            INSTALLED = <any> "INSTALLED",
            ACTIVATE = <any> "ACTIVATE",
            ACTIVATING = <any> "ACTIVATING",
            ACTIVATED = <any> "ACTIVATED",
            CANCELED = <any> "CANCELED",
            FAILED = <any> "FAILED"
        }
    }
}