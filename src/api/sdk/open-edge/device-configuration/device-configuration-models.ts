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
