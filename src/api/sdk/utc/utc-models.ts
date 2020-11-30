export namespace UsageTransparencyModels {
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
     * @interface ApplicationResource
     */
    export interface ApplicationResource {
        /**
         * an application that consumes or manipulates a resource and provides some service. an application is the main actor that generates usages. the name should be same as the registered application name. in case no application is specified, alias name will be considered as the application name.
         * @type {string}
         * @memberof ApplicationResource
         */
        application: string;
        /**
         * an application may realize multiple business cases, in such a case aliases can be used to distinguish between the business cases realized by same application. alias should be named so that it conveys the underlying business case. in case no alias is provided, application name will be considered as the alias.
         * @type {string}
         * @memberof ApplicationResource
         */
        alias?: string;
        /**
         * a resource for which the usage is being reported by the application, e.g asset, user, app, action, URL, operation, etc.
         * @type {string}
         * @memberof ApplicationResource
         */
        resource: string;
        /**
         *
         * @type {Array<Usage>}
         * @memberof ApplicationResource
         */
        usages: Array<Usage>;
    }

    /**
     *
     * @export
     * @interface ApplicationUsage
     */
    export interface ApplicationUsage {
        /**
         * an  application that consumes or manipulates a resource and provides some service. an application is the main actor that generates usages
         * @type {string}
         * @memberof ApplicationUsage
         */
        resourceAlias?: string;
        /**
         * a resource for which the usage is being reported by the application (resourceAlias), e.g asset, user, app, action, url, operation
         * @type {string}
         * @memberof ApplicationUsage
         */
        resourceName?: string;
        /**
         *
         * @type {Array<ResourceUsage>}
         * @memberof ApplicationUsage
         */
        UsageData?: Array<ResourceUsage>;
    }

    /**
     *
     * @export
     * @interface BadRequestErrorSchema
     */
    export interface BadRequestErrorSchema {}

    /**
     *
     * @export
     * @interface BillingError
     */
    export interface BillingError extends UsageError {
        /**
         * list of billing data ids that failed
         * @type {string}
         * @memberof BillingError
         */
        errorData?: string;
    }

    /**
     * @export
     * @namespace BillingError
     */
    export namespace BillingError {}

    /**
     *
     * @export
     * @interface ErrorMessageParameters
     */
    export interface ErrorMessageParameters {
        /**
         *
         * @type {string}
         * @memberof ErrorMessageParameters
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof ErrorMessageParameters
         */
        value?: string;
    }

    /**
     *
     * @export
     * @interface ForbiddenErrorSchema
     */
    export interface ForbiddenErrorSchema {}

    /**
     *
     * @export
     * @interface HTTPErrors
     */
    export interface HTTPErrors {
        /**
         *
         * @type {Array<Error>}
         * @memberof HTTPErrors
         */
        errors?: Array<Error>;
    }

    /**
     *
     * @export
     * @interface HTTPErrorsWithStatus
     */
    export interface HTTPErrorsWithStatus {
        /**
         * UTS specific error code
         * @type {string}
         * @memberof HTTPErrorsWithStatus
         */
        code?: string;
        /**
         * error message in english
         * @type {string}
         * @memberof HTTPErrorsWithStatus
         */
        message?: string;
        /**
         * log correlation-id
         * @type {string}
         * @memberof HTTPErrorsWithStatus
         */
        logref?: string;
        /**
         *
         * @type {number}
         * @memberof HTTPErrorsWithStatus
         */
        status?: number;
    }

    /**
     *
     * @export
     * @interface ModelError
     */
    export interface ModelError {
        /**
         *  mdsp.<provider>.<service/app>.<errorid>
         * @type {string}
         * @memberof ModelError
         */
        code?: string;
        /**
         * error message in english
         * @type {string}
         * @memberof ModelError
         */
        message?: string;
        /**
         *
         * @type {Array<ErrorMessageParameters>}
         * @memberof ModelError
         */
        messageParameters?: Array<ErrorMessageParameters>;
        /**
         * log correlation-id
         * @type {string}
         * @memberof ModelError
         */
        logref?: string;
    }

    /**
     *
     * @export
     * @interface OtherUsageError
     */
    export interface OtherUsageError extends UsageError {
        /**
         * description of error
         * @type {string}
         * @memberof OtherUsageError
         */
        errorData?: string;
    }

    /**
     * @export
     * @namespace OtherUsageError
     */
    export namespace OtherUsageError {}

    /**
     *
     * @export
     * @interface Page
     */
    export interface Page {
        /**
         *
         * @type {number}
         * @memberof Page
         */
        number?: number;
        /**
         *
         * @type {number}
         * @memberof Page
         */
        size?: number;
        /**
         *
         * @type {number}
         * @memberof Page
         */
        totalElements?: number;
        /**
         *
         * @type {number}
         * @memberof Page
         */
        totalPages?: number;
    }

    /**
     *
     * @export
     * @interface ResourceUsage
     */
    export interface ResourceUsage {
        /**
         *
         * @type {number}
         * @memberof ResourceUsage
         */
        usage?: number;
        /**
         * represents asnaction performed by the application, e.g. sending sms, onboarding of asset, etc.
         * @type {string}
         * @memberof ResourceUsage
         */
        usageUnit?: string;
        /**
         *
         * @type {string}
         * @memberof ResourceUsage
         */
        usageDate?: string;
    }

    /**
     *
     * @export
     * @interface UnauthorisedErrorSchema
     */
    export interface UnauthorisedErrorSchema {}

    /**
     *
     * @export
     * @interface Usage
     */
    export interface Usage {
        /**
         * represents the amount of units consumed.
         * @type {number}
         * @memberof Usage
         */
        value: number;
        /**
         * represents a trackable or billable action performed by the application, e.g. sending SMS, onboarding of asset, etc.
         * @type {string}
         * @memberof Usage
         */
        unit: string;
        /**
         * time at which the usage occurred, in UTC clock time.
         * @type {string}
         * @memberof Usage
         */
        datetime: string;
    }

    /**
     *
     * @export
     * @interface UsageError
     */
    export interface UsageError extends Error {
        /**
         *
         * @type {string}
         * @memberof UsageError
         */
        errorType?: UsageError.ErrorTypeEnum;
        /**
         * reference to more information if available
         * @type {string}
         * @memberof UsageError
         */
        info?: string;
    }

    /**
     * @export
     * @namespace UsageError
     */
    export namespace UsageError {
        /**
         * @export
         * @enum {string}
         */
        export enum ErrorTypeEnum {
            ValidationError = <any>"ValidationError",
            BillingError = <any>"BillingError",
            OtherError = <any>"OtherError",
        }
    }

    /**
     *
     * @export
     * @interface UsageErrors
     */
    export interface UsageErrors {
        /**
         *
         * @type {Array<UsageError>}
         * @memberof UsageErrors
         */
        errors?: Array<UsageError>;
        /**
         *
         * @type {Page}
         * @memberof UsageErrors
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface UsageUser
     */
    export interface UsageUser {}

    /**
     *
     * @export
     * @interface UsagesJob
     */
    export interface UsagesJob {
        /**
         *
         * @type {string}
         * @memberof UsagesJob
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof UsagesJob
         */
        time?: string;
        /**
         * The status is based on the status of the usages that satisfy the query.
         * @type {string}
         * @memberof UsagesJob
         */
        status?: UsagesJob.StatusEnum;
        /**
         * Number of usages that satisfy the query and were added by addUsagesJob identified by the id.
         * @type {number}
         * @memberof UsagesJob
         */
        usagesCount?: number;
    }

    /**
     * @export
     * @namespace UsagesJob
     */
    export namespace UsagesJob {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            ACCEPTED = <any>"ACCEPTED",
            INPROGRESS = <any>"INPROGRESS",
            ERRORS = <any>"ERRORS",
            COMPLETED = <any>"COMPLETED",
        }
    }

    /**
     *
     * @export
     * @interface UsagesJobQueryResult
     */
    export interface UsagesJobQueryResult {
        /**
         *
         * @type {Array<UsagesJob>}
         * @memberof UsagesJobQueryResult
         */
        jobs?: Array<UsagesJob>;
        /**
         *
         * @type {Page}
         * @memberof UsagesJobQueryResult
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface UsagesJobSummary
     */
    export interface UsagesJobSummary extends UsagesJob {
        /**
         *
         * @type {Array<UsagesSummary>}
         * @memberof UsagesJobSummary
         */
        usagesSummary?: Array<UsagesSummary>;
        /**
         *
         * @type {Page}
         * @memberof UsagesJobSummary
         */
        page?: Page;
    }

    /**
     * @export
     * @namespace UsagesJobSummary
     */
    export namespace UsagesJobSummary {}

    /**
     *
     * @export
     * @interface UsagesSummary
     */
    export interface UsagesSummary {
        /**
         *
         * @type {string}
         * @memberof UsagesSummary
         */
        application?: string;
        /**
         *
         * @type {string}
         * @memberof UsagesSummary
         */
        unit?: string;
        /**
         * number of usages that satisfy the query within the application, unit, and job id.
         * @type {number}
         * @memberof UsagesSummary
         */
        usagesCount?: number;
        /**
         *
         * @type {string}
         * @memberof UsagesSummary
         */
        processStatus?: UsagesSummary.ProcessStatusEnum;
    }

    /**
     * @export
     * @namespace UsagesSummary
     */
    export namespace UsagesSummary {
        /**
         * @export
         * @enum {string}
         */
        export enum ProcessStatusEnum {
            ACCEPTED = <any>"ACCEPTED",
            VERIFIED = <any>"VERIFIED",
            VERIFICATIONFAILED = <any>"VERIFICATIONFAILED",
            NOVERIFICATION = <any>"NOVERIFICATION",
            AGGREGATED = <any>"AGGREGATED",
            SENTFORBILLING = <any>"SENTFORBILLING",
            FAILEDTOSENDFORBILLING = <any>"FAILEDTOSENDFORBILLING",
            RECEIVEDFORBILLING = <any>"RECEIVEDFORBILLING",
        }
    }

    /**
     *
     * @export
     * @interface User
     */
    export interface User {
        /**
         *
         * @type {string}
         * @memberof User
         */
        tenantId: string;
        /**
         *
         * @type {string}
         * @memberof User
         */
        userId?: string;
        /**
         * type of user i.e. interactive user, an agent or usage corresponds to entire tenant. if not specified, default is ‘user
         * @type {string}
         * @memberof User
         */
        userType?: User.UserTypeEnum;
        /**
         *
         * @type {Array<ApplicationResource>}
         * @memberof User
         */
        resources: Array<ApplicationResource>;
    }

    /**
     * @export
     * @namespace User
     */
    export namespace User {
        /**
         * @export
         * @enum {string}
         */
        export enum UserTypeEnum {
            Tenant = "tenant",
            User = "user",
            Agent = "agent",
        }
    }

    /**
     *
     * @export
     * @interface UserUsage
     */
    export interface UserUsage {
        /**
         *
         * @type {string}
         * @memberof UserUsage
         */
        CustomerTenantID: string;
        /**
         *
         * @type {string}
         * @memberof UserUsage
         */
        CustomerUserID: string;
        /**
         *
         * @type {Array<ApplicationUsage>}
         * @memberof UserUsage
         */
        UTSUsageData: Array<ApplicationUsage>;
    }

    /**
     *
     * @export
     * @interface Users
     */
    export interface Users {
        /**
         *
         * @type {Array<User>}
         * @memberof Users
         */
        users: Array<User>;
    }

    /**
     *
     * @export
     * @interface ValidationError
     */
    export interface ValidationError extends UsageError {
        /**
         *
         * @type {Array<User>}
         * @memberof ValidationError
         */
        errorData?: Array<User>;
    }

    /**
     * @export
     * @namespace ValidationError
     */
    export namespace ValidationError {}
}
