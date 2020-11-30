export namespace DataLakeModels {
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
     * Access permission requested to be set for the path. Currently READ is allowed for all tenants and subtenants at root level. User can manage WRITE permissions for the paths
     * @export
     * @enum {string}
     */
    export enum AccessPermission {
        WRITE = <any>"WRITE",
    }

    /**
     * Duration for which token will be valid this can be between 900 to 43200 (15 minutes to 12 hours). If value is not provided, the default value will be 3600 seconds(1 hour).
     * @export
     * @interface AccessTokenDurationSeconds
     */
    export interface AccessTokenDurationSeconds {}

    /**
     * Access permission requested for the token. The permission could be READ or WRITE. Access Token with WRITE permission can be requested only on the paths for which WRITE access has been enabled. Default value will READ.
     * @export
     * @enum {string}
     */
    export enum AccessTokenPermission {
        READ = <any>"READ",
        WRITE = <any>"WRITE",
    }

    /**
     *
     * @export
     * @interface AccessTokenPermissionRequest
     */
    export interface AccessTokenPermissionRequest {
        /**
         * Optional, when tenants want to give access to one of their subtenant's path
         * @type {string}
         * @memberof AccessTokenPermissionRequest
         */
        subtenantId?: string;
        /**
         * Path on which write permission is required
         * @type {string}
         * @memberof AccessTokenPermissionRequest
         */
        path: string;
        /**
         *
         * @type {AccessPermission}
         * @memberof AccessTokenPermissionRequest
         */
        permission: AccessPermission;
    }

    /**
     *
     * @export
     * @interface AccessTokenPermissionResource
     */
    export interface AccessTokenPermissionResource {
        /**
         * Optional, subtenant Id, for which path write permission request was raised
         * @type {string}
         * @memberof AccessTokenPermissionResource
         */
        subtenantId?: string;
        /**
         * Auto generated unique id for request
         * @type {string}
         * @memberof AccessTokenPermissionResource
         */
        id: string;
        /**
         * Path on which write perission is given
         * @type {string}
         * @memberof AccessTokenPermissionResource
         */
        path: string;
        /**
         *
         * @type {AccessPermission}
         * @memberof AccessTokenPermissionResource
         */
        permission?: AccessPermission;
        /**
         * Time when write premission for the path was created
         * @type {string}
         * @memberof AccessTokenPermissionResource
         */
        created?: string;
    }

    /**
     *
     * @export
     * @interface AccessTokenPermissionResources
     */
    export interface AccessTokenPermissionResources {
        /**
         *
         * @type {Array<AccessTokenPermissionResource>}
         * @memberof AccessTokenPermissionResources
         */
        accessTokenPermissions?: Array<AccessTokenPermissionResource>;
        /**
         *
         * @type {Page}
         * @memberof AccessTokenPermissionResources
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface AccessTokens
     */
    export interface AccessTokens {
        /**
         *
         * @type {Credentials}
         * @memberof AccessTokens
         */
        credentials: Credentials;
        /**
         * Name of the storage account, in case of AWS S3, it will be S3 bucket name
         * @type {string}
         * @memberof AccessTokens
         */
        storageAccount: string;
        /**
         * Path on which the STS token based permissions are given (upto folder level). Path should be absolute path excluding storage endpoint URL.
         * @type {string}
         * @memberof AccessTokens
         */
        storagePath: string;
        /**
         * Optional, subtenant Id, if STS token is generated for path belonging to subtenant
         * @type {string}
         * @memberof AccessTokens
         */
        subtenantId?: string;
        /**
         *
         * @type {AccessTokenDurationSeconds}
         * @memberof AccessTokens
         */
        durationSeconds?: AccessTokenDurationSeconds;
        /**
         *
         * @type {AccessTokenPermission}
         * @memberof AccessTokens
         */
        permission?: AccessTokenPermission;
    }

    /**
     * AWS STS token
     * @export
     * @interface Credentials
     */
    export interface Credentials {
        /**
         * SECRET_ACCESS_KEY
         * @type {string}
         * @memberof Credentials
         */
        secretAccessKey: string;
        /**
         * ACCESS_KEY_ID
         * @type {string}
         * @memberof Credentials
         */
        accessKeyId: string;
        /**
         * SESSION_TOKEN
         * @type {string}
         * @memberof Credentials
         */
        sessionToken: string;
    }

    /**
     *
     * @export
     * @interface CrossAccount
     */
    export interface CrossAccount {
        /**
         * Unique Id of the cross account resource
         * @type {string}
         * @memberof CrossAccount
         */
        id: string;
        /**
         * name of the cross account
         * @type {string}
         * @memberof CrossAccount
         */
        name: string;
        /**
         * account id of the accessor
         * @type {string}
         * @memberof CrossAccount
         */
        accessorAccountId: string;
        /**
         * comment about why this cross account is required
         * @type {string}
         * @memberof CrossAccount
         */
        description: string;
        /**
         * date time (as defined by RFC 3339, section 5.6) when the access was given or changed for other attributes
         * @type {Date}
         * @memberof CrossAccount
         */
        timestamp: Date;
        /**
         * Contains a subtenant ID in case the cross account gives access to the subtenant's paths. Contains ** in case the cross account gives access to the tenant's paths and all of its subtenants' paths. Is omitted in case the cross account gives access to a tenant's paths only.
         * @type {string}
         * @memberof CrossAccount
         */
        subtenantId?: string;
        /**
         *
         * @type {ETag}
         * @memberof CrossAccount
         */
        eTag: ETag;
    }

    /**
     *
     * @export
     * @interface CrossAccountAccess
     */
    export interface CrossAccountAccess {
        /**
         * Unique Id of the cross account access
         * @type {string}
         * @memberof CrossAccountAccess
         */
        id: string;
        /**
         * comment about why the permissions are given to the path
         * @type {string}
         * @memberof CrossAccountAccess
         */
        description: string;
        /**
         * Name of the storage account, in case of AWS S3, it will be S3 bucket name
         * @type {string}
         * @memberof CrossAccountAccess
         */
        storageAccount: string;
        /**
         * Path on which the permissions are given (upto folder level). Path should be absolute path excluding storage endpoint URL.
         * @type {string}
         * @memberof CrossAccountAccess
         */
        storagePath: string;
        /**
         * Path on which the permissions are given (upto folder level).
         * @type {string}
         * @memberof CrossAccountAccess
         */
        path?: string;
        /**
         *
         * @type {Permission}
         * @memberof CrossAccountAccess
         */
        permission: Permission;
        /**
         * Status of the cross account access.
         * @type {string}
         * @memberof CrossAccountAccess
         */
        status?: CrossAccountAccess.StatusEnum;
        /**
         * Last changed timestamp for the access, according to ISO 8601 extended date/time format 'YYYY-MM-DDThh:mm:ss.sssZ'
         * @type {Date}
         * @memberof CrossAccountAccess
         */
        timestamp: Date;
        /**
         *
         * @type {ETag}
         * @memberof CrossAccountAccess
         */
        eTag: ETag;
    }

    /**
     * @export
     * @namespace CrossAccountAccess
     */
    export namespace CrossAccountAccess {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            ENABLED = <any>"ENABLED",
            DISABLED = <any>"DISABLED",
        }
    }

    /**
     *
     * @export
     * @interface CrossAccountAccessListResource
     */
    export interface CrossAccountAccessListResource {
        /**
         *
         * @type {Array<CrossAccountAccess>}
         * @memberof CrossAccountAccessListResource
         */
        crossAccountAccesses?: Array<CrossAccountAccess>;
        /**
         *
         * @type {Page}
         * @memberof CrossAccountAccessListResource
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface CrossAccountAccessRequest
     */
    export interface CrossAccountAccessRequest {
        /**
         * justification about why the permissions are given to the path
         * @type {string}
         * @memberof CrossAccountAccessRequest
         */
        description?: string;
        /**
         * Path on which the permissions are required. The path should be given upto folder (not upto object).
         * @type {string}
         * @memberof CrossAccountAccessRequest
         */
        path?: string;
        /**
         *
         * @type {Permission}
         * @memberof CrossAccountAccessRequest
         */
        permission?: Permission;
        /**
         * Status of the cross account access. If the quota of ENABLED cross account accesses is exhausted, then cross account access can be created with status as \"DISABLED\".
         * @type {string}
         * @memberof CrossAccountAccessRequest
         */
        status?: CrossAccountAccessRequest.StatusEnum;
    }

    /**
     * @export
     * @namespace CrossAccountAccessRequest
     */
    export namespace CrossAccountAccessRequest {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            ENABLED = <any>"ENABLED",
            DISABLED = <any>"DISABLED",
        }
    }

    /**
     *
     * @export
     * @interface CrossAccountListResource
     */
    export interface CrossAccountListResource {
        /**
         *
         * @type {Array<CrossAccount>}
         * @memberof CrossAccountListResource
         */
        crossAccounts?: Array<CrossAccount>;
        /**
         *
         * @type {Page}
         * @memberof CrossAccountListResource
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface CrossAccountRequest
     */
    export interface CrossAccountRequest {
        /**
         * name of the cross account
         * @type {string}
         * @memberof CrossAccountRequest
         */
        name: string;
        /**
         * account id of the accessor
         * @type {string}
         * @memberof CrossAccountRequest
         */
        accessorAccountId: string;
        /**
         * comment about why this cross account is required
         * @type {string}
         * @memberof CrossAccountRequest
         */
        description: string;
        /**
         * Only to be used by tenants. In case a concrete subtenant ID is given, all accesses are to the subtenant's paths. In case ** is given, accesses are to the tenant's paths and all of its subtenants' paths.
         * @type {string}
         * @memberof CrossAccountRequest
         */
        subtenantId?: string;
    }

    /**
     *
     * @export
     * @interface CrossAccountUpdateRequest
     */
    export interface CrossAccountUpdateRequest {
        /**
         * name of the cross account
         * @type {string}
         * @memberof CrossAccountUpdateRequest
         */
        name: string;
        /**
         * comment about why this cross account is required
         * @type {string}
         * @memberof CrossAccountUpdateRequest
         */
        description: string;
    }

    /**
     *
     * @export
     * @interface DeleteObjectsJobErrorDetailsResponse
     */
    export interface DeleteObjectsJobErrorDetailsResponse {
        /**
         * List of object paths to be deleted.
         * @type {Array<DeleteObjectsJobErrorDetailsResponseObjects>}
         * @memberof DeleteObjectsJobErrorDetailsResponse
         */
        objects?: Array<DeleteObjectsJobErrorDetailsResponseObjects>;
    }

    /**
     *
     * @export
     * @interface DeleteObjectsJobErrorDetailsResponseObjects
     */
    export interface DeleteObjectsJobErrorDetailsResponseObjects {
        /**
         * path of object including object name
         * @type {string}
         * @memberof DeleteObjectsJobErrorDetailsResponseObjects
         */
        path?: string;
        /**
         * Status of the file to be deleted
         * @type {string}
         * @memberof DeleteObjectsJobErrorDetailsResponseObjects
         */
        status?: DeleteObjectsJobErrorDetailsResponseObjects.StatusEnum;
    }

    /**
     * @export
     * @namespace DeleteObjectsJobErrorDetailsResponseObjects
     */
    export namespace DeleteObjectsJobErrorDetailsResponseObjects {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            DELETED = <any>"DELETED",
            FAILED = <any>"FAILED",
            NOTFOUND = <any>"NOTFOUND",
        }
    }

    /**
     *
     * @export
     * @interface DeleteObjectsJobList
     */
    export interface DeleteObjectsJobList {
        /**
         *
         * @type {Array<DeleteObjectsJobResponse>}
         * @memberof DeleteObjectsJobList
         */
        deleteObjectsJobs?: Array<DeleteObjectsJobResponse>;
        /**
         *
         * @type {Page}
         * @memberof DeleteObjectsJobList
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface DeleteObjectsJobProgressDetails
     */
    export interface DeleteObjectsJobProgressDetails {
        /**
         * Count of files submitted to the Delete Objects Job
         * @type {number}
         * @memberof DeleteObjectsJobProgressDetails
         */
        totalObjects?: number;
        /**
         * Count of files which are being deleted by the Delete Objects Job
         * @type {number}
         * @memberof DeleteObjectsJobProgressDetails
         */
        inProgressObjects?: number;
        /**
         * Count of files deleted successfully by the Delete Objects Job
         * @type {number}
         * @memberof DeleteObjectsJobProgressDetails
         */
        deletedObjects?: number;
        /**
         * Count of files for which deletion failed by the Delete Objects Job
         * @type {number}
         * @memberof DeleteObjectsJobProgressDetails
         */
        failedObjects?: number;
    }

    /**
     *
     * @export
     * @interface DeleteObjectsJobRequest
     */
    export interface DeleteObjectsJobRequest {
        /**
         * Only to be used by a tenant, to import the time series data to a subtenant's path. If omitted, data is imported to the tenant's path.
         * @type {string}
         * @memberof DeleteObjectsJobRequest
         */
        subtenantId?: string;
        /**
         * List of object paths to be deleted.
         * @type {Array<DeleteObjectsJobRequestObjects>}
         * @memberof DeleteObjectsJobRequest
         */
        objects?: Array<DeleteObjectsJobRequestObjects>;
    }

    /**
     *
     * @export
     * @interface DeleteObjectsJobRequestObjects
     */
    export interface DeleteObjectsJobRequestObjects {
        /**
         * path of object including object name
         * @type {string}
         * @memberof DeleteObjectsJobRequestObjects
         */
        path?: string;
    }

    /**
     *
     * @export
     * @interface DeleteObjectsJobResponse
     */
    export interface DeleteObjectsJobResponse {
        /**
         * Unique Id of the Delete Objects Job
         * @type {string}
         * @memberof DeleteObjectsJobResponse
         */
        id?: string;
        /**
         * Only to be used by a tenant, to import the time series data to a subtenant's path. If omitted, data is imported to the tenant's path.
         * @type {string}
         * @memberof DeleteObjectsJobResponse
         */
        subtenantId?: string;
        /**
         *
         * @type {DeleteObjectsJobProgressDetails}
         * @memberof DeleteObjectsJobResponse
         */
        progressDetails?: DeleteObjectsJobProgressDetails;
        /**
         *
         * @type {DeleteObjectsJobStatus}
         * @memberof DeleteObjectsJobResponse
         */
        status?: DeleteObjectsJobStatus;
    }

    /**
     * Status of the file to be deleted
     * @export
     * @enum {string}
     */
    export enum DeleteObjectsJobStatus {
        COMPLETED = <any>"COMPLETED",
        INPROGRESS = <any>"IN_PROGRESS",
        COMPLETEDWITHERRORS = <any>"COMPLETED_WITH_ERRORS",
    }

    /**
     *
     * @export
     * @interface DownloadObjectUrls
     */
    export interface DownloadObjectUrls extends Array<ObjectUrlsInner> {}

    /**
     * ETag of the resource
     * @export
     * @interface ETag
     */
    export interface ETag {}

    /**
     * Error response body model.
     * @export
     * @interface Errors
     */
    export interface Errors {
        /**
         * Concrete error codes and messages are defined at operation error response descriptions in this API specification.
         * @type {Array<ErrorsErrors>}
         * @memberof Errors
         */
        errors?: Array<ErrorsErrors>;
    }

    /**
     *
     * @export
     * @interface ErrorsErrors
     */
    export interface ErrorsErrors {
        /**
         * Unique error code. Every code is bound to one message.
         * @type {string}
         * @memberof ErrorsErrors
         */
        code?: string;
        /**
         * Logging correlation ID for debugging purposes.
         * @type {string}
         * @memberof ErrorsErrors
         */
        logref?: string;
        /**
         * Human readable error message in English.
         * @type {string}
         * @memberof ErrorsErrors
         */
        message?: string;
        /**
         * In case an error message is parametrized, the parameter names and values are returned for, e.g., localization purposes. The parametrized error messages are defined at the operation error response descriptions in this API specification. Parameters are denoted by named placeholders '{\\<parameter name\\>}' in the message specifications. At runtime, returned message placeholders are substituted by actual parameter values.
         * @type {Array<ErrorsMessageParameters>}
         * @memberof ErrorsErrors
         */
        messageParameters?: Array<ErrorsMessageParameters>;
    }

    /**
     * Message parameter
     * @export
     * @interface ErrorsMessageParameters
     */
    export interface ErrorsMessageParameters {
        /**
         * Name of message parameter as specified in parametrized error message.
         * @type {string}
         * @memberof ErrorsMessageParameters
         */
        name?: string;
        /**
         * Value of message parameter as substituted in returned error message.
         * @type {string}
         * @memberof ErrorsMessageParameters
         */
        value?: string;
    }

    /**
     *
     * @export
     * @interface GenerateSTSPayload
     */
    export interface GenerateSTSPayload {
        /**
         * Only to be used by tenants, to request access to the subtenant's paths.
         * @type {string}
         * @memberof GenerateSTSPayload
         */
        subtenantId?: string;
        /**
         * object path location on which STS token is requested. This is optional for READ permission - If value for path is not provided then it will be considered on root level (\"/\").
         * @type {string}
         * @memberof GenerateSTSPayload
         */
        path?: string;
        /**
         *
         * @type {AccessTokenDurationSeconds}
         * @memberof GenerateSTSPayload
         */
        durationSeconds?: AccessTokenDurationSeconds;
        /**
         *
         * @type {AccessTokenPermission}
         * @memberof GenerateSTSPayload
         */
        permission?: AccessTokenPermission;
    }

    /**
     *
     * @export
     * @interface GenerateUrlPayload
     */
    export interface GenerateUrlPayload {
        /**
         *
         * @type {Paths}
         * @memberof GenerateUrlPayload
         */
        paths?: Paths;
        /**
         *
         * @type {SubtenantId}
         * @memberof GenerateUrlPayload
         */
        subtenantId?: SubtenantId;
    }

    /**
     *
     * @export
     * @interface ImportJobDetails
     */
    export interface ImportJobDetails extends ImportJobResponse {
        /**
         * List of aspect names.
         * @type {Array<string>}
         * @memberof ImportJobDetails
         */
        aspectNames: Array<string>;
        /**
         * List of asset IDs.
         * @type {Array<string>}
         * @memberof ImportJobDetails
         */
        assetIds: Array<string>;
        /**
         * Beginning of the time range to read
         * @type {string}
         * @memberof ImportJobDetails
         */
        from: string;
        /**
         * End of the time range to read.
         * @type {string}
         * @memberof ImportJobDetails
         */
        to: string;
        /**
         * Time series bulk import job progress. This is a number between 0.0 to 100.00
         * @type {number}
         * @memberof ImportJobDetails
         */
        progress: number;
        /**
         * Number of files imported
         * @type {number}
         * @memberof ImportJobDetails
         */
        fileCount: number;
        /**
         * Response related to import job handling
         * @type {string}
         * @memberof ImportJobDetails
         */
        responseMessage?: string;
        /**
         * Name of the storage account, in case of AWS S3, it will be S3 bucket name
         * @type {string}
         * @memberof ImportJobDetails
         */
        storageAccount?: string;
        /**
         * Path on which the subscription is created (upto folder level). Path should be absolute path excluding storage endpoint URL.
         * @type {string}
         * @memberof ImportJobDetails
         */
        storagePath?: string;
    }

    /**
     * @export
     * @namespace ImportJobDetails
     */
    export namespace ImportJobDetails {}

    /**
     *
     * @export
     * @interface ImportJobListResource
     */
    export interface ImportJobListResource {
        /**
         *
         * @type {Array<ImportJobResponse>}
         * @memberof ImportJobListResource
         */
        timeSeriesImportJobs?: Array<ImportJobResponse>;
        /**
         *
         * @type {Page}
         * @memberof ImportJobListResource
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface ImportJobRequest
     */
    export interface ImportJobRequest {
        /**
         * Name of the time series bulk import job
         * @type {string}
         * @memberof ImportJobRequest
         */
        name: string;
        /**
         * User specified destination folder
         * @type {string}
         * @memberof ImportJobRequest
         */
        destination?: string;
        /**
         * Only to be used by a tenant, to import the time series data to a subtenant's path. If omitted, data is imported to the tenant's path.
         * @type {string}
         * @memberof ImportJobRequest
         */
        subtenantId?: string;
        /**
         * List of aspect names.
         * @type {Array<string>}
         * @memberof ImportJobRequest
         */
        aspectNames: Array<string>;
        /**
         * List of asset IDs.
         * @type {Array<string>}
         * @memberof ImportJobRequest
         */
        assetIds: Array<string>;
        /**
         * Beginning of the time range to read
         * @type {string}
         * @memberof ImportJobRequest
         */
        from: string;
        /**
         * End of the time range to read.
         * @type {string}
         * @memberof ImportJobRequest
         */
        to: string;
    }

    /**
     *
     * @export
     * @interface ImportJobResponse
     */
    export interface ImportJobResponse {
        /**
         * Unique Id of the time series bulk import job
         * @type {string}
         * @memberof ImportJobResponse
         */
        id: string;
        /**
         * Name of the time series bulk import job
         * @type {string}
         * @memberof ImportJobResponse
         */
        name: string;
        /**
         * User specified destination folder
         * @type {string}
         * @memberof ImportJobResponse
         */
        destinationPath: string;
        /**
         * Status of the time series bulk import job
         * @type {string}
         * @memberof ImportJobResponse
         */
        status: ImportJobResponse.StatusEnum;
        /**
         * Contains a subtenant ID in case the target of the import is a subtenant's path. Is omitted otherwise.
         * @type {string}
         * @memberof ImportJobResponse
         */
        subtenantId?: string;
    }

    /**
     * @export
     * @namespace ImportJobResponse
     */
    export namespace ImportJobResponse {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            PENDING = <any>"PENDING",
            QUEUED = <any>"QUEUED",
            INPROGRESS = <any>"IN_PROGRESS",
            SUCCESS = <any>"SUCCESS",
            FAILED = <any>"FAILED",
        }
    }

    /**
     *
     * @export
     * @interface Metadata
     */
    export interface Metadata {
        /**
         * Array of Metadata.
         * @type {Array<string>}
         * @memberof Metadata
         */
        tags: Array<string>;
    }

    /**
     *
     * @export
     * @interface ObjectListResponse
     */
    export interface ObjectListResponse {
        /**
         *
         * @type {TokenPagePage}
         * @memberof ObjectListResponse
         */
        page: TokenPagePage;
    }

    /**
     *
     * @export
     * @interface ObjectMetaDataResponse
     */
    export interface ObjectMetaDataResponse {
        /**
         * Object Name
         * @type {string}
         * @memberof ObjectMetaDataResponse
         */
        name?: string;
        /**
         * Object path in Data Lake
         * @type {string}
         * @memberof ObjectMetaDataResponse
         */
        path?: string;
        /**
         * Last Modified Time of the Object
         * @type {Date}
         * @memberof ObjectMetaDataResponse
         */
        lastModified?: Date;
        /**
         * Size of the Object
         * @type {number}
         * @memberof ObjectMetaDataResponse
         */
        size?: number;
        /**
         * Size of the Object
         * @type {Array<string>}
         * @memberof ObjectMetaDataResponse
         */
        tags?: Array<string>;
        /**
         * Optional, subtenant Id, if the object metadata belongs to subtenant
         * @type {string}
         * @memberof ObjectMetaDataResponse
         */
        subtenantId?: string;
    }

    /**
     *
     * @export
     * @interface ObjectMetadata
     */
    export interface ObjectMetadata {
        /**
         * Object Name
         * @type {string}
         * @memberof ObjectMetadata
         */
        name?: string;
        /**
         * Object Location in Data Lake
         * @type {string}
         * @memberof ObjectMetadata
         */
        location?: string;
        /**
         * Last Modified Time of the Object
         * @type {Date}
         * @memberof ObjectMetadata
         */
        lastModified?: Date;
        /**
         * Size of the Object
         * @type {number}
         * @memberof ObjectMetadata
         */
        size?: number;
        /**
         * Size of the Object
         * @type {Array<string>}
         * @memberof ObjectMetadata
         */
        tags?: Array<string>;
        /**
         * Name of the storage account, in case of AWS S3, it will be S3 bucket name
         * @type {string}
         * @memberof ObjectMetadata
         */
        storageAccount?: string;
        /**
         * Path on which the subscription is created (upto folder level). Path should be absolute path excluding storage endpoint URL.
         * @type {string}
         * @memberof ObjectMetadata
         */
        storagePath?: string;
        /**
         * Optional, subtenant Id, if the object metadata belongs to subtenant
         * @type {string}
         * @memberof ObjectMetadata
         */
        subtenantId?: string;
    }

    /**
     *
     * @export
     * @interface ObjectUrls
     */
    export interface ObjectUrls extends Array<ObjectUrlsInner> {}

    /**
     *
     * @export
     * @interface ObjectUrlsInner
     */
    export interface ObjectUrlsInner {
        /**
         * The signed url of the object.
         * @type {string}
         * @memberof ObjectUrlsInner
         */
        signedUrl?: string;
        /**
         * The path for the signed url.
         * @type {string}
         * @memberof ObjectUrlsInner
         */
        path?: string;
    }

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
        /**
         *
         * @type {number}
         * @memberof Page
         */
        number?: number;
    }

    /**
     *
     * @export
     * @interface Path
     */
    export interface Path {
        /**
         * The path where to upload object using  the signed url. The path should denote folders and object name. e.g. basefolder/subfolder/objectname.objectext
         * @type {string}
         * @memberof Path
         */
        path: string;
    }

    /**
     *
     * @export
     * @interface Paths
     */
    export interface Paths extends Array<Path> {}

    /**
     * specific access
     * @export
     * @enum {string}
     */
    export enum Permission {
        READ = <any>"READ",
        DELETE = <any>"DELETE",
    }

    /**
     *
     * @export
     * @interface SearchResponse
     */
    export interface SearchResponse {
        /**
         *
         * @type {Array<ObjectMetadata>}
         * @memberof SearchResponse
         */
        objectMetadata?: Array<ObjectMetadata>;
        /**
         *
         * @type {Page}
         * @memberof SearchResponse
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface SignedUrlResponse
     */
    export interface SignedUrlResponse {
        /**
         *
         * @type {ObjectUrls}
         * @memberof SignedUrlResponse
         */
        objectUrls?: ObjectUrls;
        /**
         * Optional, subtenant Id, if the generate Url request is for a subtenant
         * @type {string}
         * @memberof SignedUrlResponse
         */
        subtenantId?: string;
    }

    /**
     * Sort Request defined as array. Defined using Sort criteria object.
     * @export
     * @interface Sort
     */
    export interface Sort extends Array<SortCriteria> {}

    /**
     *
     * @export
     * @interface SortCriteria
     */
    export interface SortCriteria {
        /**
         * Sort Criteria requested by User(name or location or lastModified or size).
         * @type {string}
         * @memberof SortCriteria
         */
        field?: SortCriteria.FieldEnum;
        /**
         * Sort Order
         * @type {string}
         * @memberof SortCriteria
         */
        order?: SortCriteria.OrderEnum;
    }

    /**
     * @export
     * @namespace SortCriteria
     */
    export namespace SortCriteria {
        /**
         * @export
         * @enum {string}
         */
        export enum FieldEnum {
            Name = <any>"name",
            Location = <any>"location",
            LastModified = <any>"lastModified",
            Size = <any>"size",
        }
        /**
         * @export
         * @enum {string}
         */
        export enum OrderEnum {
            DESC = <any>"DESC",
            ASC = <any>"ASC",
        }
    }

    /**
     *
     * @export
     * @interface Subscription
     */
    export interface Subscription {
        /**
         * path on which events result in notification
         * @type {string}
         * @memberof Subscription
         */
        path: string;
        /**
         * endpoint where notification has to be published
         * @type {string}
         * @memberof Subscription
         */
        destination: string;
        /**
         * Only to be used by tenants, to create a subscription to a subtenant's path. If not provided by a tenant, the subscription is for the tenant's path.
         * @type {string}
         * @memberof Subscription
         */
        subtenantId?: string;
    }

    /**
     *
     * @export
     * @interface SubscriptionListResource
     */
    export interface SubscriptionListResource {
        /**
         *
         * @type {Array<SubscriptionResponse>}
         * @memberof SubscriptionListResource
         */
        subscriptions?: Array<SubscriptionResponse>;
        /**
         *
         * @type {Page}
         * @memberof SubscriptionListResource
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface SubscriptionResponse
     */
    export interface SubscriptionResponse {
        /**
         * unique identifier of the subscription
         * @type {string}
         * @memberof SubscriptionResponse
         */
        id: string;
        /**
         * Name of the storage account, in case of AWS S3, it will be S3 bucket name
         * @type {string}
         * @memberof SubscriptionResponse
         */
        storageAccount: string;
        /**
         * Path on which the subscription is created (upto folder level). Path should be absolute path excluding storage endpoint URL.
         * @type {string}
         * @memberof SubscriptionResponse
         */
        storagePath: string;
        /**
         * endpoint where notification has to be published
         * @type {string}
         * @memberof SubscriptionResponse
         */
        destination: string;
        /**
         *
         * @type {ETag}
         * @memberof SubscriptionResponse
         */
        eTag: ETag;
        /**
         * Contains a subtenant ID in case the subscription is for a subtenant's path. Is omitted otherwise.
         * @type {string}
         * @memberof SubscriptionResponse
         */
        subtenantId?: string;
        /**
         * Status of the destination endpoint. By default, status will be active. But, if destination is not reachable then it will be changed to inactive. Patch API can be used to make it Active again. Possible values are \"ACTIVE\" or \"INACTIVE\"
         * @type {string}
         * @memberof SubscriptionResponse
         */
        status: string;
    }

    /**
     *
     * @export
     * @interface SubscriptionUpdate
     */
    export interface SubscriptionUpdate {
        /**
         * path on which events result in notification
         * @type {string}
         * @memberof SubscriptionUpdate
         */
        path?: string;
        /**
         * endpoint where notification has to be published
         * @type {string}
         * @memberof SubscriptionUpdate
         */
        destination?: string;
        /**
         * status for endpoint destination. \"ACTIVE\" is the only valid value
         * @type {string}
         * @memberof SubscriptionUpdate
         */
        status?: string;
    }

    /**
     * Only to be used by tenants, to assign the resource to a subtenant. If not provided by a tenant, the resource is assigned to the tenant.
     * @export
     * @interface SubtenantId
     */
    export interface SubtenantId {}

    /**
     *
     * @export
     * @interface TokenPage
     */
    export interface TokenPage {
        /**
         *
         * @type {TokenPagePage}
         * @memberof TokenPage
         */
        page: TokenPagePage;
    }

    /**
     *
     * @export
     * @interface TokenPagePage
     */
    export interface TokenPagePage {
        /**
         * Opaque token to next page. Can be used in query paramter 'pageToken' to request next page. The property is only present in case there is a next page.
         * @type {string}
         * @memberof TokenPagePage
         */
        nextToken?: string;
    }
}
