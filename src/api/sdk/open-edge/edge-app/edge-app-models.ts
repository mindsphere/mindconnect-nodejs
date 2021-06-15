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
