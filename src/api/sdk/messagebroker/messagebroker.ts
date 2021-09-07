import { SdkClient } from "../common/sdk-client";
import { MessageBrokerModels } from "./messagebroker-models";

export class MessageBrokerClient extends SdkClient {
    private _baseUrl: string = "api/messagebroker/v4";

    /**
     * * Subscribers
     *
     * Managing subscribers - create or update a subscription to the given topic.
     *
     * @param {string} id
     * @param {string} versionId
     * @param {string} topicId
     *
     * TopicId string
     * pattern: mdsp\.[a-z0-9-_]+\.[a-z0-9-_]+\.v[0-9]+\.(pubsub|postbox)\.[a-z0-9-_.]+
     * maxLength: 255
     *
     * @example: mdsp.core.am.v1.postbox.asset.deleted
     * Id of the topic. Format: mdsp.{tenant}.{service}.v{version}.{type}.{additional}
     *
     * @param {MessageBrokerModels.SubscriberTopicInput} subscription
     * @returns {Promise<MessageBrokerModels.SubscriberTopicInput>}
     *
     * @memberOf MessageBrokerClient
     */
    public async PutSubscription(
        id: string,
        versionId: string,
        topicId: string,
        subscription: MessageBrokerModels.SubscriberTopicInput
    ): Promise<MessageBrokerModels.SubscriberTopicInput> {
        const result = await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            body: subscription,
            baseUrl: `${this._baseUrl}/subscribers/${id}/versions/${versionId}/topics/${topicId}`,
        });

        return result as MessageBrokerModels.SubscriberTopicInput;
    }

    /**
     * * Subscribers
     *
     * Get the subscription.
     *
     * @param {string} id
     * @param {string} versionId
     * @param {string} topicId
     *
     * TopicId string
     * pattern: mdsp\.[a-z0-9-_]+\.[a-z0-9-_]+\.v[0-9]+\.(pubsub|postbox)\.[a-z0-9-_.]+
     * maxLength: 255
     *
     * @example: mdsp.core.am.v1.postbox.asset.deleted
     * Id of the topic. Format: mdsp.{tenant}.{service}.v{version}.{type}.{additional}
     *
     * @returns {Promise<MessageBrokerModels.SubscriberTopicInput>}
     *
     * @memberOf MessageBrokerClient
     */
    public async GetSubscription(
        id: string,
        versionId: string,
        topicId: string
    ): Promise<MessageBrokerModels.SubscriberTopicInput> {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/subscribers/${id}/versions/${versionId}/topics/${topicId}`,
        });

        return result as MessageBrokerModels.SubscriberTopicInput;
    }

    /**
     * * Subscribers
     *
     * Delete the subscription.
     *
     * @param {string} id
     * @param {string} versionId
     * @param {string} topicId
     *
     * TopicId string
     * pattern: mdsp\.[a-z0-9-_]+\.[a-z0-9-_]+\.v[0-9]+\.(pubsub|postbox)\.[a-z0-9-_.]+
     * maxLength: 255
     * @example: mdsp.core.am.v1.postbox.asset.deleted
     * Id of the topic. Format: mdsp.{tenant}.{service}.v{version}.{type}.{additional}
     *
     * @memberOf MessageBrokerClient
     */
    public async DeleteSubscription(id: string, versionId: string, topicId: string) {
        const result = await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/subscribers/${id}/versions/${versionId}/topics/${topicId}`,
            noResponse: true,
        });
    }

    /**
     * * Publishes new message to the given topic.
     *
     * @param {string} id
     * Id of the topic. Format: mdsp.{tenant}.{service}.v{version}.{type}.{additional}
     *
     * @param {MessageBrokerModels.Messages} message
     * Input for posting a message on given postbox topic only. The content is what the sender sends and is not modified.
     *
     * @memberOf MessageBrokerClient
     */
    public async SendMessage(id: string, message: MessageBrokerModels.Messages) {
        const result = await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/topics/${id}/sendmessage`,
            noResponse: true,
        });
    }
}
