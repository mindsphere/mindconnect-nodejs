export namespace MessageBrokerModels {
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
        code: string;
        /**
         * Logging correlation ID for debugging purposes.
         * @type {string}
         * @memberof ErrorsErrors
         */
        logref: string;
        /**
         * Human readable error message in English.
         * @type {string}
         * @memberof ErrorsErrors
         */
        message: string;
    }
    /**
     *
     * @export
     * @interface Messages
     */
    export interface Messages {
        /**
         * Message to publish.
         * @type {string}
         * @memberof Messages
         */
        content?: string;

        //! fix: manual fix for the type as the OpenAPI spec was not complete
        [x: string]: any | undefined;
    }
    /**
     *
     * @export
     * @interface SubscriberTopicInput
     */
    export interface SubscriberTopicInput {
        /**
         *
         * @type {WebHookURL}
         * @memberof SubscriberTopicInput
         */
        uri: WebHookURL;
    }
    /**
     * Id of the topic. Format: mdsp.{tenant}.{service}.v{version}.{type}.{additional}
     * @export
     */
    export type TopicId = string;
    /**
     * Gateway uri on which the app will receive notifications.
     * @export
     */
    export type WebHookURL = string;
}
