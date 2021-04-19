import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { notificationTemplate } from "./notification-data-template";
import { NotificationModelsV4 } from "./notification-v4-models";

/**
 * The Notification API allows developers to manage and utilize the operations related to notification messages,
 * namely Registration of mobile apps and mobile app installation instances for receiving push notifications
 * Sending push notifications to set of users of a mobile app; addressed either by email address or the mobile app
 * instances.
 * Sending emails to a set of target recipients with an option to attach files.
 *
 * Error with HTTP status code 400 - "Invalid property" will be applicable for all operations, wherever applicable.
 *
 * * Limitations
 * This API cannot be accessed by subtenants.
 *
 * The service may decide to throttle API requests temporarily returning a 429 status code.
 *
 * *Generic Errors
 * The following generic error codes might occur at any of the specified operation.
 * Generic errors are prefixed with 'mdsp.core.generic.'.
 * * 204: noContent
 * * 400: invalidParameter
 * * 400: invalidRequestBodyProperty
 * * 400: missingParameter
 * * 400: missingRequestBodyProperty
 * * 401: unauthorized
 * * 403: forbidden
 * * 404: noMatch
 * * 409: conflict
 * * 429: tooManyRequests
 * * 500: internalServerError
 *
 * See the MindSphere API documentation generic errors page for more information.
 *
 * @export
 * @class ModelManagementClient
 * @extends {SdkClient}
 */
export class NotificationClientV4 extends SdkClient {
    private _baseUrl: string = "/api/notification/v4";

    /**
     * * Email
     *
     * Sends an email notification to specified recipients with an option to attach files.
     *
     * Publishes the notification via email to the specified recipients, along with attachments as optional.
     * Maximum 5 files can be uploaded as attachments; where-in the total size of all attachments is limited to 8MB.
     * Only zip, csv, pdf and json file types are supported as attachments.
     *
     * @param {NotificationModelsV4.MulticastEmailNotificationRequestMetadata} metadata Content type must be <application/json>. The size of this attribute is limited to 250KB.
     * @param {NotificationModelsV4.Attachment[]} [attachments] File to be uploaded as attachment in email notification. This parameter must be provided for each file to be attached with the email. Maximum 5 files can be attached with one email request.
     * @returns {Promise<NotificationModelsV4.EmailJobResponse>}
     *
     * @memberOf NotificationClientV4
     */
    public async PostMulticastEmailNotificationJob(
        metadata: NotificationModelsV4.MulticastEmailNotificationRequestMetadata,
        attachments?: NotificationModelsV4.Attachment[]
    ): Promise<NotificationModelsV4.EmailJobResponse> {
        if (metadata === null || metadata === undefined) {
            throw new NotificationModelsV4.RequiredError(
                "metadata",
                "Required parameter metadata was null or undefined when calling PostMulticastEmailNotificationJobs."
            );
        }

        const body = notificationTemplate(metadata, attachments);

        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/multicastEmailNotificationJobs`,
            body: body,
            multiPartFormData: true,
            additionalHeaders: { enctype: "multipart/form-data" },
        });
        return result as NotificationModelsV4.EmailJobResponse;
    }

    /**
     * * Email
     *
     * Shows the status of the triggered multicast email notification job.
     *
     * @param {string} id Job ID to fetch the details
     * @returns {Promise<NotificationModelsV4.MulticastEmailNotificationJob>}
     *
     * @memberOf NotificationClientV4
     */
    public async GetMulticastEmailNotificationJob(
        id: string
    ): Promise<NotificationModelsV4.MulticastEmailNotificationJob> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/multicastEmailNotificationJobs/${id}`,
        });

        return result as NotificationModelsV4.MulticastEmailNotificationJob;
    }

    /**
     * * Email
     *
     * Shows per recipent status of email dispatch status.
     *
     * @param {string} id Job ID to fetch the details
     * @param {{ page?: number; size?: number }} [params] page: specfies the page index, size: elements in a page (max:50)
     * @returns {Promise<NotificationModelsV4.NotificationDispatchStatus>}
     *
     * @memberOf NotificationClientV4
     */
    public async GetMulticastEmailNotificationJobsDeliveries(
        id: string,
        params?: { page?: number; size?: number }
    ): Promise<NotificationModelsV4.NotificationDispatchStatus> {
        const parameters = params || {};
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/multicastEmailNotificationJobs/${id}/deliveries?${toQueryString(parameters)}`,
        });

        return result as NotificationModelsV4.NotificationDispatchStatus;
    }

    /**
     * SMS
     *
     * Sends an SMS notification to specified recipients.
     *
     * Publishes the notification via sms to the specified recipients.
     * The message is scanned for any vulnerabilities before dispatching it to the recipients.
     * A single SMS message can contain up to 140 bytes of information where-in the character quota
     * depends on the encoding scheme. For example, an SMS message can contain:
     * 160 GSM characters
     * 140 ASCII characters
     * 70 UCS-2 characters
     * If the message size exceeds 140 bytes, it will be split into multiple messages and sent.
     * When message is split into multiple messages, each partial message will be billed as a sinlge unit.
     * Eg. If a message size is 200 bytes; then this it be billed as 2 units.
     * Maximum size limit for a message is 1500 bytes.
     *
     * @param {NotificationModelsV4.MulticastSMSNotificationJobRequest} metadata
     * @returns {Promise<NotificationModelsV4.SMSJobResponse>}
     *
     * @memberOf NotificationClientV4
     */
    public async PostMulticastSMSNotificationJob(
        metadata: NotificationModelsV4.MulticastSMSNotificationJobRequest
    ): Promise<NotificationModelsV4.SMSJobResponse> {
        if (metadata === null || metadata === undefined) {
            throw new NotificationModelsV4.RequiredError(
                "metadata",
                "Required parameter metadata was null or undefined when calling PostMulticastSMSNotificationJobs."
            );
        }
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/multicastSMSNotificationJobs`,
            body: metadata,
        });
        return result as NotificationModelsV4.SMSJobResponse;
    }

    /**
     * * SMS
     *
     * Shows the status of the triggered multicast sms notification job.
     *
     * @param {string} id Job ID to fetch the details
     * @returns {Promise<NotificationModelsV4.MulticastSMSNotificationJob>}
     *
     * @memberOf NotificationClientV4
     */
    public async GetMulticastSMSNotificationJob(id: string): Promise<NotificationModelsV4.MulticastSMSNotificationJob> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/multicastSMSNotificationJobs/${id}`,
        });

        return result as NotificationModelsV4.MulticastSMSNotificationJob;
    }

    /**
     *
     * * SMS
     *
     * Shows detailed delivery information of an sms job.
     *
     * @param {string} id Job ID to fetch the details
     * @param {{ page?: number; size?: number }} [params] page: specfies the page index, size: elements in a page (max:50)
     * @returns {Promise<NotificationModelsV4.NotificationDispatchStatusSMS>}
     *
     * @memberOf NotificationClientV4
     */
    public async GetMulticastSMSNotificationJobsDeliveries(
        id: string,
        params?: { page?: number; size?: number }
    ): Promise<NotificationModelsV4.NotificationDispatchStatusSMS> {
        const parameters = params || {};
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/multicastSMSNotificationJobs/${id}/deliveries?${toQueryString(parameters)}`,
        });

        return result as NotificationModelsV4.NotificationDispatchStatusSMS;
    }

    /**
     * * Push
     *
     * Sends a push notification to selected mobile app instances.
     *
     * Publishes the notification via Mobile Push to the selected mobile app instances.
     * The developer can choose to address recipients using their mobile device ids or using the
     * recipient’s email address. When a recipient is addressed using their email address,
     * the Notification Service sends the notifications to all app instances registered with that email address.
     *
     * @param {NotificationModelsV4.MulticastPushNotificationJobsRequest} job
     * @returns {Promise<NotificationModelsV4.SMSJobResponse>}
     *
     * @memberOf NotificationClientV4
     */
    public async PostMulticastPushNotificationJob(
        job: NotificationModelsV4.MulticastPushNotificationJobsRequest
    ): Promise<NotificationModelsV4.SMSJobResponse> {
        if (job === null || job === undefined) {
            throw new NotificationModelsV4.RequiredError(
                "job",
                "Required parameter job was null or undefined when calling PostMulticastSMSNotificationJobs."
            );
        }
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/multicastPushNotificationJobs`,
            body: job,
        });
        return result as NotificationModelsV4.SendResponse;
    }

    /**
     * ! !important! : in April 2021 there was no support in MindSphere for this method. This was reported
     * ! to the developer team and should eventually start working.
     *
     * @param {string} id
     * @returns {Promise<NotificationModelsV4.SendResponse>}
     *
     * @memberOf NotificationClientV4
     */
    public async GetMulticastPushNotificationJob(id: string): Promise<NotificationModelsV4.SendResponse> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/multicastPushNotificationJobs/${id}`,
        });

        return result as NotificationModelsV4.SendResponse;
    }

    /**
     * * Mobile Apps
     *
     * Register a new mobile app.
     *
     * A mobile app developer should use this api to register a mobile app with the Notification Service.
     * This resource represents a mobile app in Notification Service.
     * Either an iOS or Android configuration can be chosen for the app.
     * Registration of the mobile app allows the developer to configure necessary push notification provider credentials.
     * App Configuration details are masked and not displayed in response owing to security reasons.
     *
     * @param {NotificationModelsV4.AppRegistrationRequest} appData
     * @returns {Promise<NotificationModelsV4.AppRegistrationResponse>}
     *
     * @memberOf NotificationClientV4
     */
    public async PostMobileApp(
        appData: NotificationModelsV4.AppRegistrationRequest
    ): Promise<NotificationModelsV4.AppRegistrationResponse> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            body: appData,
            baseUrl: `${this._baseUrl}/mobileApps`,
        });

        return result as NotificationModelsV4.AppRegistrationRequest;
    }

    /**
     * * Mobile Apps
     *
     * Show all registered apps for a tenant.
     * App Configuration details are masked and not displayed in response owing to security reasons.
     *
     * @param {{
     *         page?: number;
     *         size?: number;
     *     }} [params]
     * @returns {Promise<NotificationModelsV4.PagedAppRegistrationResponse>}
     *
     * @memberOf NotificationClientV4
     */
    public async GetMobileApps(params?: {
        page?: number;
        size?: number;
    }): Promise<NotificationModelsV4.PagedAppRegistrationResponse> {
        const parameters = params || {};

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/mobileApps?${toQueryString(parameters)}`,
        });

        return result as NotificationModelsV4.PagedAppRegistrationResponse;
    }

    /**
     * * Mobile Apps
     *
     * Edit a registered mobile app.
     * App Configuration details are masked and not displayed in response
     * for security reasons.
     *
     * @param {string} id
     * @param {NotificationModelsV4.AppRegistrationUpdateRequest} appData
     * @returns {Promise<NotificationModelsV4.AppRegistrationResponse>}
     *
     * @memberOf NotificationClientV4
     */
    public async PatchMobileApp(
        id: string,
        appData: NotificationModelsV4.AppRegistrationUpdateRequest
    ): Promise<NotificationModelsV4.AppRegistrationResponse> {
        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            body: appData,
            baseUrl: `${this._baseUrl}/mobileApps/${id}`,
        });

        return result as NotificationModelsV4.AppRegistrationResponse;
    }

    /**
     * * Mobile Apps
     *
     * Deregister an existing registered mobile app.
     *
     * Deregistration of a mobile app involves deletion of all saved credentials and other configuration.
     * Any pending notification jobs which depend on this configuration will be terminated,
     * marked with a failed status and the notifications will not be dispatched to the intended recipients.
     *
     * @param {string} id
     *
     * @memberOf NotificationClientV4
     */
    public async DeleteMobileApp(id: string) {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/mobileApps/${id}`,
            noResponse: true,
        });
    }

    /**
     * * Mobile Apps
     *
     * Registers a new mobile installation instance with a registered mobile app.
     *
     * Registration is invoked when a mobile app is installed on a device and user details can be updated
     * by the developer based on login.
     * If the instance is already registered, existing instance entry shall be updated.
     * Push notification token detail is masked and not displayed in response owing to security reasons.
     *
     * @param {string} id
     * @param {NotificationModelsV4.AppInstanceRequest} appInstanceData
     * @returns {Promise<NotificationModelsV4.AppInstanceResponse>}
     *
     * @memberOf NotificationClientV4
     */
    public async PostMobileAppInstance(
        id: string,
        appInstanceData: NotificationModelsV4.AppInstanceRequest
    ): Promise<NotificationModelsV4.AppInstanceResponse> {
        const result = await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            body: appInstanceData,
            baseUrl: `${this._baseUrl}/mobileApps/${id}/instances`,
        });

        return result as NotificationModelsV4.AppInstanceResponse;
    }

    /**
     * * Mobile Apps
     *
     * Show all registered mobile app instances for a given mobile app.
     * Push notification token detail is masked and not displayed in response for security reasons.
     *
     * @param {string} id
     * @param {{
     *             page?: number;
     *             size?: number;
     *         }} [params]
     * @returns {Promise<NotificationModelsV4.PagedAppInstanceResponse>}
     *
     * @memberOf NotificationClientV4
     */
    public async GetMobileAppsInstances(
        id: string,
        params?: {
            page?: number;
            size?: number;
        }
    ): Promise<NotificationModelsV4.PagedAppInstanceResponse> {
        const parameters = params || {};

        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/mobileApps/${id}/instances?${toQueryString(parameters)}`,
        });

        return result as NotificationModelsV4.PagedAppInstanceResponse;
    }

    /**
     *
     * * Mobile Apps
     *
     * Edit a specific mobile app instance registration.
     * Push notification token detail is masked and not displayed in response owing to security reasons.
     *
     * @param {string} id
     * @param {string} instanceid
     * @param {NotificationModelsV4.AppInstancePatchRequest} mobileAppInstanceData
     * @returns {Promise<NotificationModelsV4.AppInstanceResponse>}
     *
     * @memberOf NotificationClientV4
     */
    public async PatchMobileAppInstance(
        id: string,
        instanceid: string,
        mobileAppInstanceData: NotificationModelsV4.AppInstancePatchRequest
    ): Promise<NotificationModelsV4.AppInstanceResponse> {
        const result = await this.HttpAction({
            verb: "PATCH",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            body: mobileAppInstanceData,
            baseUrl: `${this._baseUrl}/mobileApps/${id}/instances/${instanceid}`,
        });

        return result as NotificationModelsV4.AppInstanceResponse;
    }

    /**
     * * Mobile Apps
     *
     * Delete a specific mobile app instance registration.
     *
     * Deregistration of a mobile app involves deletion of the corresponding push notification token.
     * Any pending notification jobs which depend on this configuration will be terminated,
     * marked with a failed status and the notifications will not be dispatched to the mobile app instance.
     *
     * @param {string} id
     * @param {string} instanceid
     *
     * @memberOf NotificationClientV4
     */
    public async DeleteMobileAppsInstance(id: string, instanceid: string) {
        await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/mobileApps/${id}/instances/${instanceid}`,
            noResponse: true,
        });
    }
}
