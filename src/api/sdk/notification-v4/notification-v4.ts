import { toQueryString } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { notificationEmailTemplate } from "./notification-data-template";
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
     * * Email Notifications
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
    public async PostMulticastEmailNotificationJobs(
        metadata: NotificationModelsV4.MulticastEmailNotificationRequestMetadata,
        attachments?: NotificationModelsV4.Attachment[]
    ): Promise<NotificationModelsV4.EmailJobResponse> {
        if (metadata === null || metadata === undefined) {
            throw new NotificationModelsV4.RequiredError(
                "metadata",
                "Required parameter metadata was null or undefined when calling PostMulticastEmailNotificationJobs."
            );
        }

        const body = notificationEmailTemplate(metadata, attachments);

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
     * Shows the status of the triggered multicast email notification job.
     *
     * @param {string} id Job ID to fetch the details
     * @returns {Promise<NotificationModelsV4.MulticastEmailNotificationJob>}
     *
     * @memberOf NotificationClientV4
     */
    public async GetMulticastEmailNotificationJobs(
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
}
