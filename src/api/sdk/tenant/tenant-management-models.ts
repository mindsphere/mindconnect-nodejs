export namespace TenantManagementModels {
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
         * @type {string}
         * @memberof ErrorResponse
         */
        errorMessage?: string;
        /**
         *
         * @type {string}
         * @memberof ErrorResponse
         */
        errorType?: ErrorResponse.ErrorTypeEnum;
        /**
         *
         * @type {Array<FieldError>}
         * @memberof ErrorResponse
         */
        fieldErrors?: Array<FieldError>;
        /**
         *
         * @type {string}
         * @memberof ErrorResponse
         */
        logref?: string;
    }

    /**
     * @export
     * @namespace ErrorResponse
     */
    export namespace ErrorResponse {
        /**
         * @export
         * @enum {string}
         */
        export enum ErrorTypeEnum {
            FIELDERROR = <any>"FIELD_ERROR",
            UNEXPECTEDERROR = <any>"UNEXPECTED_ERROR",
            INVALIDSTATE = <any>"INVALID_STATE",
            PARSINGERROR = <any>"PARSING_ERROR",
        }
    }

    /**
     *
     * @export
     * @interface FieldError
     */
    export interface FieldError {
        /**
         *
         * @type {string}
         * @memberof FieldError
         */
        errorMessage?: string;
        /**
         *
         * @type {string}
         * @memberof FieldError
         */
        errorType?: FieldError.ErrorTypeEnum;
        /**
         *
         * @type {string}
         * @memberof FieldError
         */
        field?: string;
    }

    /**
     * @export
     * @namespace FieldError
     */
    export namespace FieldError {
        /**
         * @export
         * @enum {string}
         */
        export enum ErrorTypeEnum {
            INVALIDINPUT = <any>"INVALID_INPUT",
            VALIDATIONERROR = <any>"VALIDATION_ERROR",
            NOTALLOWED = <any>"NOT_ALLOWED",
            UNIQUECONSTRAINTERROR = <any>"UNIQUE_CONSTRAINT_ERROR",
        }
    }

    /**
     *
     * @export
     * @interface LegalConfiguration
     */
    export interface LegalConfiguration {
        /**
         *
         * @type {Array<Region>}
         * @memberof LegalConfiguration
         */
        regions: Array<Region>;
    }

    /**
     *
     * @export
     * @interface LegalConfigurationResource
     */
    export interface LegalConfigurationResource {
        /**
         *
         * @type {Array<RegionResource>}
         * @memberof LegalConfigurationResource
         */
        regions?: Array<RegionResource>;
    }

    /**
     *
     * @export
     * @interface Link
     */
    export interface Link {
        /**
         *
         * @type {string}
         * @memberof Link
         */
        name: string;
        /**
         *
         * @type {string}
         * @memberof Link
         */
        value: string;
    }

    /**
     *
     * @export
     * @interface LinkCollection
     */
    export interface LinkCollection {
        /**
         *
         * @type {string}
         * @memberof LinkCollection
         */
        id: string;
        /**
         *
         * @type {string}
         * @memberof LinkCollection
         */
        type: LinkCollection.TypeEnum;
        /**
         *
         * @type {number}
         * @memberof LinkCollection
         */
        sorting?: number;
        /**
         *
         * @type {{ [key: string]: Link; }}
         * @memberof LinkCollection
         */
        languages: { [key: string]: Link };
    }

    /**
     * @export
     * @namespace LinkCollection
     */
    export namespace LinkCollection {
        /**
         * @export
         * @enum {string}
         */
        export enum TypeEnum {
            Www = <any>"www",
            Phone = <any>"phone",
            Mail = <any>"mail",
        }
    }

    /**
     * Legal Info
     *
     * ! Fix: This was manually created in 3.12.0 as MindSphere has a copy/paste error
     * ! saying that LegalInfo methods return LegalConfiguration
     *
     * @export
     * @interface LegalInfo
     */
    export interface LegalInfo {
        [key: string]: LegalInfoLink[];
    }

    /**
     * Legal Info Link
     *
     * ! Fix: This was manually created in 3.12.0 as MindSphere has a copy/paste error
     * ! saying that LegalInfo methods return LegalConfiguration
     *
     * @export
     * @interface LegalInfoLink
     */
    export interface LegalInfoLink {
        id: string;
        type: string;
        name: string;
        value: string;
    }

    /**
     *
     * @export
     * @interface MdspError
     */
    export interface MdspError {
        /**
         *
         * @type {string}
         * @memberof MdspError
         */
        code?: string;
        /**
         *
         * @type {string}
         * @memberof MdspError
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof MdspError
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface MdspErrors
     */
    export interface MdspErrors {
        /**
         *
         * @type {Array<MdspError>}
         * @memberof MdspErrors
         */
        errors?: Array<MdspError>;
    }

    /**
     *
     * @export
     * @interface PageSubtenantResource
     */
    export interface PageSubtenantResource {
        /**
         *
         * @type {Array<SubtenantResource>}
         * @memberof PageSubtenantResource
         */
        content?: Array<SubtenantResource>;
        /**
         *
         * @type {boolean}
         * @memberof PageSubtenantResource
         */
        first?: boolean;
        /**
         *
         * @type {boolean}
         * @memberof PageSubtenantResource
         */
        last?: boolean;
        /**
         *
         * @type {number}
         * @memberof PageSubtenantResource
         */
        number?: number;
        /**
         *
         * @type {number}
         * @memberof PageSubtenantResource
         */
        numberOfElements?: number;
        /**
         *
         * @type {number}
         * @memberof PageSubtenantResource
         */
        size?: number;
        /**
         *
         * @type {Sort}
         * @memberof PageSubtenantResource
         */
        sort?: Sort;
        /**
         *
         * @type {number}
         * @memberof PageSubtenantResource
         */
        totalElements?: number;
        /**
         *
         * @type {number}
         * @memberof PageSubtenantResource
         */
        totalPages?: number;
    }

    /**
     *
     * @export
     * @interface Region
     */
    export interface Region {
        /**
         *
         * @type {string}
         * @memberof Region
         */
        regionId?: string;
        /**
         *
         * @type {string}
         * @memberof Region
         */
        regionName: string;
        /**
         *
         * @type {Array<string>}
         * @memberof Region
         */
        regionCountries?: Array<string>;
        /**
         *
         * @type {Array<LinkCollection>}
         * @memberof Region
         */
        links?: Array<LinkCollection>;
    }

    /**
     *
     * @export
     * @interface RegionResource
     */
    export interface RegionResource {
        /**
         *
         * @type {number}
         * @memberof RegionResource
         */
        ETag?: number;
        /**
         *
         * @type {Array<LinkCollection>}
         * @memberof RegionResource
         */
        links?: Array<LinkCollection>;
        /**
         *
         * @type {Array<string>}
         * @memberof RegionResource
         */
        regionCountries?: Array<string>;
        /**
         *
         * @type {string}
         * @memberof RegionResource
         */
        regionId?: string;
        /**
         *
         * @type {string}
         * @memberof RegionResource
         */
        regionName?: string;
    }

    /**
     *
     * @export
     * @interface Sort
     */
    export interface Sort {
        /**
         *
         * @type {boolean}
         * @memberof Sort
         */
        sorted?: boolean;
        /**
         *
         * @type {boolean}
         * @memberof Sort
         */
        unsorted?: boolean;
        /**
         *
         * @type {boolean}
         * @memberof Sort
         */
        empty?: boolean;
    }

    /**
     *
     * @export
     * @interface Subtenant
     */
    export interface Subtenant {
        /**
         * A universally unique identifier.
         * @type {string}
         * @memberof Subtenant
         */
        id: string;
        /**
         *
         * @type {string}
         * @memberof Subtenant
         */
        displayName: string;
        /**
         *
         * @type {string}
         * @memberof Subtenant
         */
        description: string;
    }

    /**
     *
     * @export
     * @interface SubtenantResource
     */
    export interface SubtenantResource {
        /**
         *
         * @type {number}
         * @memberof SubtenantResource
         */
        ETag?: number;
        /**
         *
         * @type {string}
         * @memberof SubtenantResource
         */
        description?: string;
        /**
         *
         * @type {string}
         * @memberof SubtenantResource
         */
        displayName?: string;
        /**
         *
         * @type {string}
         * @memberof SubtenantResource
         */
        entityId?: string;
        /**
         *
         * @type {string}
         * @memberof SubtenantResource
         */
        id?: string;
    }

    /**
     *
     * @export
     * @interface SubtenantUpdateProperties
     */
    export interface SubtenantUpdateProperties {
        /**
         *
         * @type {string}
         * @memberof SubtenantUpdateProperties
         */
        displayName?: string;
        /**
         *
         * @type {string}
         * @memberof SubtenantUpdateProperties
         */
        description?: string;
    }

    /**
     *
     * @export
     * @interface TenantInfo
     */
    export interface TenantInfo {
        /**
         *
         * @type {number}
         * @memberof TenantInfo
         */
        ETag?: number;
        /**
         *
         * @type {boolean}
         * @memberof TenantInfo
         */
        allowedToCreateSubtenant?: boolean;
        /**
         *
         * @type {string}
         * @memberof TenantInfo
         */
        companyName?: string;
        /**
         *
         * @type {string}
         * @memberof TenantInfo
         */
        country?: string;
        /**
         *
         * @type {string}
         * @memberof TenantInfo
         */
        displayName?: string;
        /**
         *
         * @type {string}
         * @memberof TenantInfo
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof TenantInfo
         */
        prefix?: string;
        /**
         *
         * @type {string}
         * @memberof TenantInfo
         */
        type?: TenantInfo.TypeEnum;
    }

    /**
     * @export
     * @namespace TenantInfo
     */
    export namespace TenantInfo {
        /**
         * @export
         * @enum {string}
         */
        export enum TypeEnum {
            DEVELOPER = <any>"DEVELOPER",
            OPERATOR = <any>"OPERATOR",
            USER = <any>"USER",
            CUSTOMER = <any>"CUSTOMER",
        }
    }

    /**
     *
     * @export
     * @interface TenantInfoUpdateProperties
     */
    export interface TenantInfoUpdateProperties {
        /**
         *
         * @type {string}
         * @memberof TenantInfoUpdateProperties
         */
        companyName?: string;
        /**
         *
         * @type {string}
         * @memberof TenantInfoUpdateProperties
         */
        displayName?: string;
    }

    /**
     *
     * @export
     * @interface UploadedFileResource
     */
    export interface UploadedFileResource {
        /**
         *
         * @type {number}
         * @memberof UploadedFileResource
         */
        size?: number;
        /**
         *
         * @type {string}
         * @memberof UploadedFileResource
         */
        name?: string;
    }
}
