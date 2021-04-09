export namespace ModelManagementModels {
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
     * @interface Column
     */
    export interface Column {
        /**
         *
         * @type {string}
         * @memberof Column
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof Column
         */
        type?: string;
        /**
         *
         * @type {string}
         * @memberof Column
         */
        description?: string;
        /**
         *
         * @type {any}
         * @memberof Column
         */
        value?: any;
    }

    /**
     *
     * @export
     * @interface Dependency
     */
    export interface Dependency {
        /**
         *
         * @type {string}
         * @memberof Dependency
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof Dependency
         */
        type?: string;
        /**
         *
         * @type {string}
         * @memberof Dependency
         */
        version?: string;
    }

    /**
     *
     * @export
     * @interface Errors
     */
    export interface Errors {
        /**
         *
         * @type {Array<VndError>}
         * @memberof Errors
         */
        errors?: Array<VndError>;
    }

    /**
     *
     * @export
     * @interface IO
     */
    export interface IO {
        /**
         *
         * @type {string}
         * @memberof IO
         */
        consumes?: string;
        /**
         *
         * @type {Array<Column>}
         * @memberof IO
         */
        input?: Array<Column>;
        /**
         *
         * @type {Array<Column>}
         * @memberof IO
         */
        output?: Array<Column>;
        /**
         * Field which should contain any relevant metadat information which can refer to how to further process or interpret the input or output files.
         * @type {any}
         * @memberof IO
         */
        optionalParameters?: any;
    }

    /**
     *
     * @export
     * @interface KPI
     */
    export interface KPI {
        /**
         *
         * @type {string}
         * @memberof KPI
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof KPI
         */
        value?: string;
    }

    /**
     *
     * @export
     * @interface Model
     */
    export interface Model {
        /**
         *
         * @type {string}
         * @memberof Model
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Model
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof Model
         */
        description?: string;
        /**
         *
         * @type {string}
         * @memberof Model
         */
        type?: string;
        /**
         *
         * @type {string}
         * @memberof Model
         */
        author?: string;
        /**
         *
         * @type {Version}
         * @memberof Model
         */
        lastVersion?: Version;
    }

    /**
     *
     * @export
     * @interface ModelArray
     */
    export interface ModelArray {
        /**
         *
         * @type {Array<Model>}
         * @memberof ModelArray
         */
        models?: Array<Model>;
        /**
         *
         * @type {Page}
         * @memberof ModelArray
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface ModelDefinition
     */
    export interface ModelDefinition {
        /**
         *
         * @type {string}
         * @memberof ModelDefinition
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof ModelDefinition
         */
        description?: string;
        /**
         *
         * @type {string}
         * @memberof ModelDefinition
         */
        type?: string;
    }

    /**
     *
     * @export
     * @interface Page
     */
    export interface Page {
        /**
         * Number of current page.
         * @type {number}
         * @memberof Page
         */
        number?: number;
        /**
         * Size of the page
         * @type {number}
         * @memberof Page
         */
        size?: number;
        /**
         * Number of the total pages
         * @type {number}
         * @memberof Page
         */
        totalPages?: number;
        /**
         * The total number of elements
         * @type {number}
         * @memberof Page
         */
        totalElements?: number;
    }

    /**
     * Returned version information. Contains the submitted version entity, as well as additional information provided by the system, such as user information, created date.
     * @export
     * @interface Version
     */
    export interface Version {
        /**
         *
         * @type {string}
         * @memberof Version
         */
        id?: string;
        /**
         *
         * @type {number}
         * @memberof Version
         */
        number?: number;
        /**
         *
         * @type {string}
         * @memberof Version
         */
        expirationDate?: string;
        /**
         *
         * @type {string}
         * @memberof Version
         */
        author?: string;
        /**
         *
         * @type {string}
         * @memberof Version
         */
        creationDate?: string;
        /**
         *
         * @type {Array<Dependency>}
         * @memberof Version
         */
        dependencies?: Array<Dependency>;
        /**
         *
         * @type {IO}
         * @memberof Version
         */
        io?: IO;
        /**
         *
         * @type {Array<string>}
         * @memberof Version
         */
        producedBy?: Array<string>;
        /**
         *
         * @type {Array<KPI>}
         * @memberof Version
         */
        kpi?: Array<KPI>;
    }

    /**
     *
     * @export
     * @interface VersionArray
     */
    export interface VersionArray {
        /**
         *
         * @type {Array<Version>}
         * @memberof VersionArray
         */
        versions?: Array<Version>;
        /**
         *
         * @type {Page}
         * @memberof VersionArray
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface VersionDefinition
     */
    export interface VersionDefinition {
        /**
         *
         * @type {number}
         * @memberof VersionDefinition
         */
        number?: number;
        /**
         *
         * @type {string}
         * @memberof VersionDefinition
         */
        expirationDate?: string;
        /**
         *
         * @type {Array<Dependency>}
         * @memberof VersionDefinition
         */
        dependencies?: Array<Dependency>;
        /**
         *
         * @type {IO}
         * @memberof VersionDefinition
         */
        io?: IO;
        /**
         *
         * @type {Array<string>}
         * @memberof VersionDefinition
         */
        producedBy?: Array<string>;
        /**
         *
         * @type {Array<KPI>}
         * @memberof VersionDefinition
         */
        kpi?: Array<KPI>;
    }

    /**
     *
     * @export
     * @interface VndError
     */
    export interface VndError {
        /**
         *
         * @type {string}
         * @memberof VndError
         */
        code?: string;
        /**
         *
         * @type {string}
         * @memberof VndError
         */
        message?: string;
        /**
         *
         * @type {string}
         * @memberof VndError
         */
        logref?: string;
    }

    /**
     *
     * @export
     * @interface ModelPayload
     */
    export interface ModelPayload {
        /**
         *
         * @type {string}
         * @memberof ModelPayload
         */
        fileName?: string;
        /**
         *
         * @type {string}
         * @memberof ModelPayload
         */
        mimeType?: string;
        /**
         *
         * @type {Buffer}
         * @memberof ModelPayload
         */
        buffer?: Buffer;
    }
}
