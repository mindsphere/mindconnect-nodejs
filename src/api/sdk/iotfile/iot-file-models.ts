export namespace IotFileModels {
    /**
     *
     * @export
     * @interface Badrequest
     */
    export interface Badrequest {
        /**
         *
         * @type {string}
         * @memberof Badrequest
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Badrequest
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface Conflict
     */
    export interface Conflict {
        /**
         *
         * @type {string}
         * @memberof Conflict
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Conflict
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface Error
     */
    export interface Error {
        /**
         *
         * @type {string}
         * @memberof Error
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Error
         */
        message?: string;
    }

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
        name?: string;
        /**
         *
         * @type {string}
         * @memberof File
         */
        path?: string;
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
        size?: number;
        /**
         *
         * @type {Date}
         * @memberof File
         */
        timestamp?: Date;
        /**
         *
         * @type {Date}
         * @memberof File
         */
        created?: Date;
        /**
         *
         * @type {Date}
         * @memberof File
         */
        updated?: Date;
        /**
         *
         * @type {string}
         * @memberof File
         */
        createdBy?: string;
        /**
         *
         * @type {string}
         * @memberof File
         */
        updatedBy?: string;
        /**
         *
         * @type {string}
         * @memberof File
         */
        description?: string;
        /**
         *
         * @type {number}
         * @memberof File
         * !fix: manually fixed to correspond with implementation
         */
        etag?: number;
    }

    /**
     *
     * @export
     * @interface Notfound
     */
    export interface Notfound {
        /**
         *
         * @type {string}
         * @memberof Notfound
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Notfound
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface Notmodified
     */
    export interface Notmodified {
        /**
         *
         * @type {string}
         * @memberof Notmodified
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Notmodified
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface Rangenotsatisfiable
     */
    export interface Rangenotsatisfiable {
        /**
         *
         * @type {string}
         * @memberof Rangenotsatisfiable
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Rangenotsatisfiable
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface Unauthorized
     */
    export interface Unauthorized {
        /**
         *
         * @type {string}
         * @memberof Unauthorized
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Unauthorized
         */
        message?: string;
    }
}
