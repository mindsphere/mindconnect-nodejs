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
