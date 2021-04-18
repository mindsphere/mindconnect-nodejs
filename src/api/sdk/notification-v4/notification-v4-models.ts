export namespace NotificationModelsV4 {
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
     * email attachment
     *
     * ! Manually created on 4/18/2021 as MindSphere doesn't specify a type for Email Attachments
     *
     * @export
     * @interface Attachment
     */
    export interface Attachment {
        /**
         *
         * File String
         *
         * @type {string}
         * @memberof Attachment
         */
        fileName?: string;
        /**
         *
         * File MimeType
         *
         * @type {string}
         * @memberof Attachment
         */
        mimeType?: string;
        /**
         *
         * File Content
         *
         * @type {Buffer}
         * @memberof Attachment
         */
        buffer?: Buffer;
    }

    /**
     *
     * @export
     * @interface AppInstanceObject
     */
    export interface AppInstanceObject {
        /**
         * Device operating system
         * @type {string}
         * @memberof AppInstanceObject
         */
        deviceOS?: string;
        /**
         * Preffered ISO 639-1 Language code. Defaults to English if not specified.
         * @type {string}
         * @memberof AppInstanceObject
         */
        language?: string;
        /**
         * Masked value of the Push notification identifier from Google or Apple.
         * @type {string}
         * @memberof AppInstanceObject
         */
        pushNotificationToken?: string;
    }

    /**
     *
     * @export
     * @interface AppInstancePatchRequest
     */
    export interface AppInstancePatchRequest {
        /**
         * Device operating system
         * @type {string}
         * @memberof AppInstancePatchRequest
         */
        deviceOS?: string;
        /**
         * Preffered ISO 639-1 Language code. Defaults to English if not specified.
         * @type {string}
         * @memberof AppInstancePatchRequest
         */
        language?: string;
        /**
         * Push notification identifier from Google or Apple.
         * @type {string}
         * @memberof AppInstancePatchRequest
         */
        pushNotificationToken?: string;
    }

    /**
     *
     * @export
     * @interface AppInstanceRequest
     */
    export interface AppInstanceRequest {
        /**
         * Device operating system
         * @type {string}
         * @memberof AppInstanceRequest
         */
        deviceOS?: string;
        /**
         * Preffered ISO 639-1 Language code. Defaults to English if not specified.
         * @type {string}
         * @memberof AppInstanceRequest
         */
        language?: string;
        /**
         * Push notification identifier from Google or Apple.
         * @type {string}
         * @memberof AppInstanceRequest
         */
        pushNotificationToken?: string;
    }

    /**
     *
     * @export
     * @interface AppInstanceResponse
     */
    export interface AppInstanceResponse {
        /**
         * Device operating system
         * @type {string}
         * @memberof AppInstanceResponse
         */
        deviceOS?: string;
        /**
         * Preffered ISO 639-1 Language code. Defaults to English if not specified.
         * @type {string}
         * @memberof AppInstanceResponse
         */
        language?: string;
        /**
         * Masked value of the Push notification identifier from Google or Apple.
         * @type {string}
         * @memberof AppInstanceResponse
         */
        pushNotificationToken?: string;
    }

    /**
     *
     * @export
     * @interface AppInstanceResponseWithEmailAddress
     */
    export interface AppInstanceResponseWithEmailAddress extends AppInstanceResponse {
        /**
         *
         * @type {string}
         * @memberof AppInstanceResponseWithEmailAddress
         */
        userEmailAddress?: string;
    }

    /**
     *
     * @export
     * @interface AppRegistrationRequest
     */
    export interface AppRegistrationRequest {
        /**
         * App names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, hyphens, and periods, must be between 1 and 256 characters long, and must begin with a letter.
         * @type {string}
         * @memberof AppRegistrationRequest
         */
        name?: string;
        /**
         * Describes the device platform. At least one device type should be specified.
         * @type {string}
         * @memberof AppRegistrationRequest
         */
        type?: AppRegistrationRequest.TypeEnum;
        /**
         *
         * @type {any}
         * @memberof AppRegistrationRequest
         */
        android?: any;
        /**
         *
         * @type {any}
         * @memberof AppRegistrationRequest
         */
        ios?: any;
    }

    /**
     * @export
     * @namespace AppRegistrationRequest
     */
    export namespace AppRegistrationRequest {
        /**
         * @export
         * @enum {string}
         */
        export enum TypeEnum {
            Ios = "ios",
            Android = "android",
        }
    }

    /**
     *
     * @export
     * @interface AppRegistrationResponse
     */
    export interface AppRegistrationResponse {
        /**
         * App names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, hyphens, and periods, must be between 1 and 256 characters long, and must begin with a letter.
         * @type {string}
         * @memberof AppRegistrationResponse
         */
        name?: string;
        /**
         * Describes the device platform. At least one device type should be specified.
         * @type {string}
         * @memberof AppRegistrationResponse
         */
        type?: AppRegistrationResponse.TypeEnum;
        /**
         *
         * @type {any}
         * @memberof AppRegistrationResponse
         */
        android?: any;
        /**
         *
         * @type {any}
         * @memberof AppRegistrationResponse
         */
        ios?: any;
    }

    /**
     * @export
     * @namespace AppRegistrationResponse
     */
    export namespace AppRegistrationResponse {
        /**
         * @export
         * @enum {string}
         */
        export enum TypeEnum {
            Ios = "ios",
            Android = "android",
        }
    }

    /**
     *
     * @export
     * @interface AppRegistrationUpdateRequest
     */
    export interface AppRegistrationUpdateRequest {
        /**
         * App names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, hyphens, and periods, must be between 1 and 256 characters long, and must begin with a letter.
         * @type {string}
         * @memberof AppRegistrationUpdateRequest
         */
        name?: string;
        /**
         *
         * @type {any}
         * @memberof AppRegistrationUpdateRequest
         */
        android?: any;
        /**
         *
         * @type {any}
         * @memberof AppRegistrationUpdateRequest
         */
        ios?: any;
    }

    /**
     *
     * @export
     * @interface DispatchStatus
     */
    export interface DispatchStatus {
        /**
         *
         * @type {string}
         * @memberof DispatchStatus
         */
        recipient?: string;
        /**
         * Conveys the notification delivery status to individual recipient. The status \"dispatched\" does not guarantee successful delivery, because of potential failures that may arise from downstream systems. This status might change to \"failed\" in case the delivery was not successful.
         * @type {string}
         * @memberof DispatchStatus
         */
        status?: DispatchStatus.StatusEnum;
    }

    /**
     * @export
     * @namespace DispatchStatus
     */
    export namespace DispatchStatus {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            Dispatched = "dispatched",
            Failed = "failed",
        }
    }

    /**
     *
     * @export
     * @interface DispatchStatusSMS
     */
    export interface DispatchStatusSMS {
        /**
         *
         * @type {string}
         * @memberof DispatchStatusSMS
         */
        recipient?: string;
        /**
         * Conveys the notification delivery status to individual recipient. The status \"dispatched\" does not guarantee successful delivery, because of potential failures that may arise from downstream systems. This status might change to \"failed\" in case the delivery was not successful.
         * @type {string}
         * @memberof DispatchStatusSMS
         */
        status?: DispatchStatusSMS.StatusEnum;
    }

    /**
     * @export
     * @namespace DispatchStatusSMS
     */
    export namespace DispatchStatusSMS {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            Dispatched = "dispatched",
            Failed = "failed",
        }
    }

    /**
     *
     * @export
     * @interface EmailJobResponse
     */
    export interface EmailJobResponse {
        /**
         * The job id of the email job request. This can be used to get the status of the email job.
         * @type {string}
         * @memberof EmailJobResponse
         */
        id?: string;
    }

    /**
     * Error response body model.
     * @export
     * @interface Errors
     */
    export interface Errors {
        /**
         * Concrete error codes and messages are defined at operation error response descriptions in this API specification.
         * @type {Array}
         * @memberof Errors
         */
        errors?: Array<any>;
    }

    /**
     *
     * @export
     * @interface Message
     */
    export interface Message {
        /**
         * The title of the notification. The content is a JSON object which contains a map of language codes to text for each language. The keys in the JSON should reflect valid ISO 639-1 language codes and English (en) should be mandatorily specified.
         * @type {string}
         * @memberof Message
         */
        title?: string;
        /**
         * The content of the push notification. The content is a JSON object which contains a map of language codes to text for each language. Maximum size of a single text content should not exceed 2KB.
         * @type {string}
         * @memberof Message
         */
        text?: string;
    }

    /**
     *
     * @export
     * @interface MobileAppObject
     */
    export interface MobileAppObject {
        /**
         * App names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, hyphens, and periods, must be between 1 and 256 characters long, and must begin with a letter.
         * @type {string}
         * @memberof MobileAppObject
         */
        name?: string;
        /**
         * Describes the device platform. At least one device type should be specified.
         * @type {string}
         * @memberof MobileAppObject
         */
        type?: MobileAppObject.TypeEnum;
        /**
         *
         * @type {any}
         * @memberof MobileAppObject
         */
        android?: any;
        /**
         *
         * @type {any}
         * @memberof MobileAppObject
         */
        ios?: any;
    }

    /**
     * @export
     * @namespace MobileAppObject
     */
    export namespace MobileAppObject {
        /**
         * @export
         * @enum {string}
         */
        export enum TypeEnum {
            Ios = "ios",
            Android = "android",
        }
    }

    /**
     *
     * @export
     * @interface MulticastEmailNotificationJob
     */
    export interface MulticastEmailNotificationJob {
        /**
         * Job ID of the triggered request
         * @type {string}
         * @memberof MulticastEmailNotificationJob
         */
        id?: string;
        /**
         * Source application which triggered the Email Notification request.
         * @type {string}
         * @memberof MulticastEmailNotificationJob
         */
        fromApplication?: string;
        /**
         * Provides status of the email job request. <table>   <tr>     <th>Status</th>     <th>Description</th>   </tr>   <tr>     <td>queued</td>     <td>Email job request is received by the system. In case of attachements, email will be dispatched post scanning</td>   </tr>   <tr>     <td>dispatched</td>     <td>Email job request is proccessed successfully. NOTE: The status \"dispatched\" does not guarantee successful delivery because of potential failures arising from downstream systems. This status might change to \"dispatchedWithFailures\" in case the delivery was not successful to some of the recipeints.</td>   </tr>   <tr>     <td>dispatchedWithFailures</td>     <td>The system will set this status in two cases:   <li>Attachments are found to be infected. In this case the email is sent without attachments.</li>   <li>Delivery to some of the recipients failed.</li></td>   </tr>   <tr>     <td>failed</td>     <td>Failed to dispatch the email job, due to errors arising from downstream systems. No email is sent. The sender is requested to create a new email job request.</td>   </tr> </table>
         * @type {string}
         * @memberof MulticastEmailNotificationJob
         */
        status?: MulticastEmailNotificationJob.StatusEnum | string;
        /**
         * Time when the job was created.
         * @type {string}
         * @memberof MulticastEmailNotificationJob
         */
        startTime?: string;
        /**
         * Details of the files that failed scanning.
         * @type {Array<ScanDetail>}
         * @memberof MulticastEmailNotificationJob
         */
        maliciousAttachments?: Array<ScanDetail>;
    }

    /**
     * @export
     * @namespace MulticastEmailNotificationJob
     */
    export namespace MulticastEmailNotificationJob {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            Queued = "queued",
            Dispatched = "dispatched",
            DispatchedWithFailures = "dispatchedWithFailures",
            Failed = "failed",
        }
    }

    /**
     *
     * @export
     * @interface MulticastEmailNotificationRequestMetadata
     */
    export interface MulticastEmailNotificationRequestMetadata {
        /**
         * Subject to be displayed in the email notification.
         * @type {string}
         * @memberof MulticastEmailNotificationRequestMetadata
         */
        subject?: string;
        /**
         * Body of the email message.
         * @type {string}
         * @memberof MulticastEmailNotificationRequestMetadata
         */
        message?: string;
        /**
         *
         * @type {Array<string>}
         * @memberof MulticastEmailNotificationRequestMetadata
         */
        recipients: Array<string>;
        /**
         * Source application which triggered the Email Notification request. This name should match with the the registered application name with host tenant.
         * @type {string}
         * @memberof MulticastEmailNotificationRequestMetadata
         */
        fromApplication: string;
        /**
         * Optional priority to be requested for the email notification.
         * @type {string}
         * @memberof MulticastEmailNotificationRequestMetadata
         */
        priority?: MulticastEmailNotificationRequestMetadata.PriorityEnum | string;
    }

    /**
     * @export
     * @namespace MulticastEmailNotificationRequestMetadata
     */
    export namespace MulticastEmailNotificationRequestMetadata {
        /**
         * @export
         * @enum {string}
         */
        export enum PriorityEnum {
            Low = "Low",
            Normal = "Normal",
            High = "High",
        }
    }

    /**
     *
     * @export
     * @interface MulticastPushNotificationJobsRequest
     */
    export interface MulticastPushNotificationJobsRequest {
        /**
         * The mobile app identifier.
         * @type {string}
         * @memberof MulticastPushNotificationJobsRequest
         */
        mobileAppId?: string;
        /**
         *
         * @type {any}
         * @memberof MulticastPushNotificationJobsRequest
         */
        recipients?: any;
        /**
         *
         * @type {Message}
         * @memberof MulticastPushNotificationJobsRequest
         */
        message?: Message;
    }

    /**
     *
     * @export
     * @interface MulticastSMSNotificationJob
     */
    export interface MulticastSMSNotificationJob {
        /**
         * Job ID of the triggered request
         * @type {string}
         * @memberof MulticastSMSNotificationJob
         */
        id?: string;
        /**
         * Source application which triggered the SMS Notification request.
         * @type {string}
         * @memberof MulticastSMSNotificationJob
         */
        fromApplication?: string;
        /**
         * Provides status of the sms job request. <table>   <tr>     <th>Status</th>     <th>Description</th>   </tr>   <tr>     <td>queued</td>     <td>SMS job request is received by the system.</td>   </tr>   <tr>     <td>dispatched</td>     <td>SMS job request is proccessed successfully. NOTE: The status \"dispatched\" does not guarantee successful delivery because of potential failures arising from downstream systems. </td>   </tr>   <tr>     <td>failed</td>     <td>Failed to dispatch the sms job, due to errors arising from downstream systems. No SMS is sent. The sender is requested to create a new sms job request.</td>   </tr> </table>
         * @type {string}
         * @memberof MulticastSMSNotificationJob
         */
        status?: MulticastSMSNotificationJob.StatusEnum;
        /**
         * Time when the job was created.
         * @type {string}
         * @memberof MulticastSMSNotificationJob
         */
        startTime?: string;
    }

    /**
     * @export
     * @namespace MulticastSMSNotificationJob
     */
    export namespace MulticastSMSNotificationJob {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            Queued = "queued",
            Dispatched = "dispatched",
            Failed = "failed",
        }
    }

    /**
     *
     * @export
     * @interface MulticastSMSNotificationJobRequest
     */
    export interface MulticastSMSNotificationJobRequest {
        /**
         * Body of the SMS message.
         * @type {string}
         * @memberof MulticastSMSNotificationJobRequest
         */
        message: string;
        /**
         * List of valid mobile numbers including the country code.
         * @type {Array<string>}
         * @memberof MulticastSMSNotificationJobRequest
         */
        recipients: Array<string>;
        /**
         * Source application which triggered the SMS Notification request. This name should match with the the registered application name with host tenant.
         * @type {string}
         * @memberof MulticastSMSNotificationJobRequest
         */
        fromApplication: string;
    }

    /**
     * Shows the dispatch status of the notification per recipient.
     * @export
     * @interface NotificationDispatchStatus
     */
    export interface NotificationDispatchStatus {
        /**
         *
         * @type {Array<DispatchStatus>}
         * @memberof NotificationDispatchStatus
         */
        dispatchStatus?: Array<DispatchStatus>;
        /**
         *
         * @type {Page}
         * @memberof NotificationDispatchStatus
         */
        page?: Page;
    }

    /**
     * Shows the dispatch status of the notification per recipient.
     * @export
     * @interface NotificationDispatchStatusSMS
     */
    export interface NotificationDispatchStatusSMS {
        /**
         *
         * @type {Array<DispatchStatusSMS>}
         * @memberof NotificationDispatchStatusSMS
         */
        dispatchStatus?: Array<DispatchStatusSMS>;
        /**
         *
         * @type {Page}
         * @memberof NotificationDispatchStatusSMS
         */
        page?: Page;
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
     * @interface PagedAppInstanceResponse
     */
    export interface PagedAppInstanceResponse {
        /**
         *
         * @type {Array<AppInstanceResponseWithEmailAddress>}
         * @memberof PagedAppInstanceResponse
         */
        instances?: Array<AppInstanceResponseWithEmailAddress>;
        /**
         *
         * @type {Page}
         * @memberof PagedAppInstanceResponse
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface PagedAppRegistrationResponse
     */
    export interface PagedAppRegistrationResponse {
        /**
         *
         * @type {Array<MobileAppObject>}
         * @memberof PagedAppRegistrationResponse
         */
        mobileApps?: Array<MobileAppObject>;
        /**
         *
         * @type {Page}
         * @memberof PagedAppRegistrationResponse
         */
        page?: Page;
    }

    /**
     *
     * @export
     * @interface SMSJobResponse
     */
    export interface SMSJobResponse {
        /**
         * The job id of the SMS job request. This can be used to get the status of the sms job.
         * @type {string}
         * @memberof SMSJobResponse
         */
        id?: string;
    }

    /**
     *
     * @export
     * @interface ScanDetail
     */
    export interface ScanDetail {
        /**
         *
         * @type {string}
         * @memberof ScanDetail
         */
        filename?: string;
        /**
         * Failed scan text.
         * @type {string}
         * @memberof ScanDetail
         */
        threat?: string;
    }

    /**
     *
     * @export
     * @interface SendResponse
     */
    export interface SendResponse {
        /**
         *
         * @type {string}
         * @memberof SendResponse
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof SendResponse
         */
        status?: SendResponse.StatusEnum | string;
        /**
         * The time at which the job started.
         * @type {Date}
         * @memberof SendResponse
         */
        startTime?: Date;
    }

    /**
     * @export
     * @namespace SendResponse
     */
    export namespace SendResponse {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            Queued = "queued",
            Dispatched = "dispatched",
            Failed = "failed",
        }
    }
}
