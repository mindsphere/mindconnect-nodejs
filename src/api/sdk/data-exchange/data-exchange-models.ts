export namespace DataExchangeModels {
    export enum Root {
        Public = "_PUBLIC_ROOT_ID",
        Private = "_PRIVATE_ROOT_ID",
    }

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
     * @interface Directories
     */
    export interface Directories extends Array<Directory> {}

    /**
     *
     * @export
     * @interface DirectoriesFilesArray
     */
    export interface DirectoriesFilesArray {
        /**
         *
         * @type {Array<Files>}
         * @memberof DirectoriesFilesArray
         */
        files?: Array<Files>;
        /**
         *
         * @type {Array<Directories>}
         * @memberof DirectoriesFilesArray
         */
        directories?: Array<Directories>;
        /**
         *
         * @type {Page}
         * @memberof DirectoriesFilesArray
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface Directory
     */
    export interface Directory {
        /**
         *
         * @type {string}
         * @memberof Directory
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Directory
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof Directory
         */
        parentId?: string;
        /**
         *
         * @type {Date}
         * @memberof Directory
         */
        modifiedDate?: Date;
        /**
         *
         * @type {string}
         * @memberof Directory
         */
        modifiedBy?: string;
    }

    /**
     *
     * @export
     * @interface Files
     */
    export interface Files extends Array<any> {}

    /**
     *
     * @export
     * @interface File
     */
    export interface File {
        /**
         *
         * @type {string}
         * @memberof File
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof File
         */
        parentId?: string;
        /**
         *
         * @type {string}
         * @memberof File
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof File
         */
        type?: string;
        /**
         *
         * @type {number}
         * @memberof File
         */
        sizeInBytes?: number;
        /**
         *
         * @type {Date}
         * @memberof File
         */
        modifiedDate?: Date;
        /**
         *
         * @type {string}
         * @memberof File
         */
        modifiedBy?: string;
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
         * Total of the elements
         * @type {number}
         * @memberof Page
         */
        totalElements?: number;
    }

    /**
     *
     * @export
     * @interface ResourcePatch
     */
    export interface ResourcePatch {
        /**
         *
         * @type {string}
         * @memberof ResourcePatch
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof ResourcePatch
         */
        type?: string;
        /**
         *
         * @type {string}
         * @memberof ResourcePatch
         */
        parentId?: string;
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
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof VndError
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface VndErrors
     */
    export interface VndErrors {
        /**
         *
         * @type {Array<VndError>}
         * @memberof VndErrors
         */
        errors?: Array<VndError>;
    }
}
