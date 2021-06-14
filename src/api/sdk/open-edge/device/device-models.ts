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
