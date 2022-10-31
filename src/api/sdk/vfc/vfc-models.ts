export namespace VisualFlowCreatorModels {
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
     * @interface CannotChangeDefaultProjectError
     */
    export interface CannotChangeDefaultProjectError {
        /**
         *
         * @type {Array<CannotChangeDefaultProjectErrorErrors>}
         * @memberof CannotChangeDefaultProjectError
         */
        errors?: Array<CannotChangeDefaultProjectErrorErrors>;
    }

    /**
     *
     * @export
     * @interface CannotChangeDefaultProjectErrorErrors
     */
    export interface CannotChangeDefaultProjectErrorErrors {
        /**
         *
         * @type {string}
         * @memberof CannotChangeDefaultProjectErrorErrors
         */
        code?: string;
        /**
         *
         * @type {string}
         * @memberof CannotChangeDefaultProjectErrorErrors
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof CannotChangeDefaultProjectErrorErrors
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface CreateProject400Error
     */
    export interface CreateProject400Error {
        /**
         *
         * @type {Array<CreateProject400ErrorErrors>}
         * @memberof CreateProject400Error
         */
        errors?: Array<CreateProject400ErrorErrors>;
    }

    /**
     *
     * @export
     * @interface CreateProject400ErrorErrors
     */
    export interface CreateProject400ErrorErrors {
        /**
         *
         * @type {string}
         * @memberof CreateProject400ErrorErrors
         */
        code?: string;
        /**
         *
         * @type {string}
         * @memberof CreateProject400ErrorErrors
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof CreateProject400ErrorErrors
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface FoundDuplicatedEndpointError
     */
    export interface FoundDuplicatedEndpointError {
        /**
         *
         * @type {Array<FoundDuplicatedEndpointErrorErrors>}
         * @memberof FoundDuplicatedEndpointError
         */
        errors?: Array<FoundDuplicatedEndpointErrorErrors>;
    }

    /**
     *
     * @export
     * @interface FoundDuplicatedEndpointErrorErrors
     */
    export interface FoundDuplicatedEndpointErrorErrors {
        /**
         *
         * @type {string}
         * @memberof FoundDuplicatedEndpointErrorErrors
         */
        code?: string;
        /**
         *
         * @type {string}
         * @memberof FoundDuplicatedEndpointErrorErrors
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof FoundDuplicatedEndpointErrorErrors
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface NoUserGivenError
     */
    export interface NoUserGivenError {
        /**
         *
         * @type {Array<NoUserGivenErrorErrors>}
         * @memberof NoUserGivenError
         */
        errors?: Array<NoUserGivenErrorErrors>;
    }

    /**
     *
     * @export
     * @interface NoUserGivenErrorErrors
     */
    export interface NoUserGivenErrorErrors {
        /**
         *
         * @type {string}
         * @memberof NoUserGivenErrorErrors
         */
        code?: string;
        /**
         *
         * @type {string}
         * @memberof NoUserGivenErrorErrors
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof NoUserGivenErrorErrors
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface Nodes
     */
    export interface Nodes {
        /**
         *
         * @type {NodesArray}
         * @memberof Nodes
         */
        nodes?: NodesArray;
    }

    /**
     *
     * @export
     * @interface NodesArray
     */
    export interface NodesArray extends Array<VfcNode> {}

    /**
     * !fix: 31.10.2022 - created the type manually instead of propagated "Map" type from Java.
     *
     * The node needs id, type and additional properties required by the type.
     *
     * @export
     * @interface VfcNode
     */
    export interface VfcNode {
        id: string;
        type: string;
        [x: string | number | symbol]: unknown;
    }

    /**
     *
     * @export
     * @interface Project
     */
    export interface Project {
        /**
         *
         * @type {string}
         * @memberof Project
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Project
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof Project
         */
        userId?: string;
        /**
         *
         * @type {string}
         * @memberof Project
         */
        tenant?: string;
    }

    /**
     *
     * @export
     * @interface ProjectAlreadyExistsError
     */
    export interface ProjectAlreadyExistsError {
        /**
         *
         * @type {Array<ProjectAlreadyExistsErrorErrors>}
         * @memberof ProjectAlreadyExistsError
         */
        errors?: Array<ProjectAlreadyExistsErrorErrors>;
    }

    /**
     *
     * @export
     * @interface ProjectAlreadyExistsErrorErrors
     */
    export interface ProjectAlreadyExistsErrorErrors {
        /**
         *
         * @type {string}
         * @memberof ProjectAlreadyExistsErrorErrors
         */
        code?: string;
        /**
         *
         * @type {string}
         * @memberof ProjectAlreadyExistsErrorErrors
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof ProjectAlreadyExistsErrorErrors
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface ProjectName
     */
    export interface ProjectName {
        /**
         *
         * @type {string}
         * @memberof ProjectName
         */
        name?: string;
    }

    /**
     *
     * @export
     * @interface ProjectNotFoundError
     */
    export interface ProjectNotFoundError {
        /**
         *
         * @type {Array<ProjectNotFoundErrorErrors>}
         * @memberof ProjectNotFoundError
         */
        errors?: Array<ProjectNotFoundErrorErrors>;
    }

    /**
     *
     * @export
     * @interface ProjectNotFoundErrorErrors
     */
    export interface ProjectNotFoundErrorErrors {
        /**
         *
         * @type {string}
         * @memberof ProjectNotFoundErrorErrors
         */
        code?: string;
        /**
         *
         * @type {string}
         * @memberof ProjectNotFoundErrorErrors
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof ProjectNotFoundErrorErrors
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface Projects
     */
    export interface Projects {
        /**
         *
         * @type {Array<Project>}
         * @memberof Projects
         */
        projects?: Array<Project>;
    }

    /**
     *
     * @export
     * @interface PutNodes400Error
     */
    export interface PutNodes400Error {
        /**
         *
         * @type {Array<PutNodes400ErrorErrors>}
         * @memberof PutNodes400Error
         */
        errors?: Array<PutNodes400ErrorErrors>;
    }

    /**
     *
     * @export
     * @interface PutNodes400ErrorErrors
     */
    export interface PutNodes400ErrorErrors {
        /**
         *
         * @type {string}
         * @memberof PutNodes400ErrorErrors
         */
        code?: string;
        /**
         *
         * @type {string}
         * @memberof PutNodes400ErrorErrors
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof PutNodes400ErrorErrors
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface TriggerNode
     */
    export interface TriggerNode {
        /**
         *
         * @type {any}
         * @memberof TriggerNode
         */
        payload?: any;
        /**
         *
         * @type {string}
         * @memberof TriggerNode
         */
        topic?: string;
    }

    /**
     *
     * @export
     * @interface TriggerNode400Error
     */
    export interface TriggerNode400Error {
        /**
         *
         * @type {Array<TriggerNode400ErrorErrors>}
         * @memberof TriggerNode400Error
         */
        errors?: Array<TriggerNode400ErrorErrors>;
    }

    /**
     *
     * @export
     * @interface TriggerNode400ErrorErrors
     */
    export interface TriggerNode400ErrorErrors {
        /**
         *
         * @type {string}
         * @memberof TriggerNode400ErrorErrors
         */
        code?: string;
        /**
         *
         * @type {string}
         * @memberof TriggerNode400ErrorErrors
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof TriggerNode400ErrorErrors
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface TriggerNode404Error
     */
    export interface TriggerNode404Error {
        /**
         *
         * @type {Array<ProjectNotFoundErrorErrors>}
         * @memberof TriggerNode404Error
         */
        errors?: Array<ProjectNotFoundErrorErrors>;
    }
}
