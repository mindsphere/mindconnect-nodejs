export namespace AgentManagementModels {
    /**
     *
     * @export
     * @interface AccessToken
     */
    export interface AccessToken {
        /**
         * The access token to be used in calls to MindSphere with Bearer authentication scheme.
         * @type {string}
         * @memberof AccessToken
         */
        access_token?: string;
        /**
         * The type of the access token issued.
         * @type {string}
         * @memberof AccessToken
         */
        token_type?: string;
        /**
         * Number of seconds before this token expires from the time of issuance.
         * @type {number}
         * @memberof AccessToken
         */
        expires_in?: number;
        /**
         *
         * @type {Jti}
         * @memberof AccessToken
         */
        jti?: Jti;
        /**
         * Agent permissions list.
         * @type {Array<string>}
         * @memberof AccessToken
         */
        scope?: Array<string>;
    }

    /**
     *
     * @export
     * @interface Agent
     */
    export interface Agent extends AgentUpdate {
        /**
         * Unique identifier of the agent
         * @type {string}
         * @memberof Agent
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Agent
         */
        eTag?: string;
        /**
         * Unique identifier of the entity
         * @type {string}
         * @memberof Agent
         */
        entityId: string;
    }

    /**
     * @export
     * @namespace Agent
     */
    export namespace Agent {}

    /**
     *
     * @export
     * @interface AgentUpdate
     */
    export interface AgentUpdate {
        /**
         * Name must be unique per tenant.
         * @type {string}
         * @memberof AgentUpdate
         */
        name: string;
        /**
         *
         * @type {string}
         * @memberof AgentUpdate
         */
        securityProfile: AgentUpdate.SecurityProfileEnum;
    }

    /**
     * @export
     * @namespace AgentUpdate
     */
    export namespace AgentUpdate {
        /**
         * @export
         * @enum {string}
         */
        export enum SecurityProfileEnum {
            SHAREDSECRET = <any>"SHARED_SECRET",
            RSA3072 = <any>"RSA_3072"
        }
    }

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
     * @interface BadrequestIAM
     */
    export interface BadrequestIAM {
        /**
         *
         * @type {string}
         * @memberof BadrequestIAM
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof BadrequestIAM
         */
        error?: string;
        /**
         * An error message with Correlation-ID value.
         * @type {string}
         * @memberof BadrequestIAM
         */
        error_description?: string;
    }

    /**
     * Client identifier, equals value of 'sub' claim in IAT.
     * @export
     * @interface ClientId
     */
    export interface ClientId {}

    /**
     *
     * @export
     * @interface ClientIdentifier
     */
    export interface ClientIdentifier {
        /**
         *
         * @type {ClientId}
         * @memberof ClientIdentifier
         */
        client_id: ClientId;
        /**
         * Server generated client secret. Required if security profile is SHARED_SECRET.
         * @type {string}
         * @memberof ClientIdentifier
         */
        client_secret?: string;
        /**
         * Epoch time in seconds which client secret expires at.
         * @type {number}
         * @memberof ClientIdentifier
         */
        client_secret_expires_at?: number;
        /**
         *
         * @type {Array<string>}
         * @memberof ClientIdentifier
         */
        grant_types?: Array<ClientIdentifier.GrantTypesEnum>;
        /**
         * The access token to be used at the client configuration endpoint to perform subsequent operations upon the client registration.
         * @type {string}
         * @memberof ClientIdentifier
         */
        registration_access_token: string;
        /**
         * The fully qualified URL of the client configuration endpoint for this client.
         * @type {string}
         * @memberof ClientIdentifier
         */
        registration_client_uri: string;
        /**
         * The client authentication method.
         * @type {string}
         * @memberof ClientIdentifier
         */
        token_endpoint_auth_method?: ClientIdentifier.TokenEndpointAuthMethodEnum;
    }

    /**
     * @export
     * @namespace ClientIdentifier
     */
    export namespace ClientIdentifier {
        /**
         * @export
         * @enum {string}
         */
        export enum GrantTypesEnum {
            SHAREDSECRET = <any>"SHARED_SECRET",
            RSA3072 = <any>"RSA_3072"
        }
        /**
         * @export
         * @enum {string}
         */
        export enum TokenEndpointAuthMethodEnum {
            ClientSecretJwt = <any>"client_secret_jwt",
            PrivateKeyJwt = <any>"private_key_jwt"
        }
    }

    /**
     *
     * @export
     * @interface Configuration
     */
    export interface Configuration {
        /**
         *
         * @type {OnboardingConfigurationContent}
         * @memberof Configuration
         */
        content?: OnboardingConfigurationContent;
        /**
         *
         * @type {Date}
         * @memberof Configuration
         */
        expiration?: Date;
    }

    /**
     * Operation on resource is not allowed due to a conflicting state.
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
     * @interface DataPoint
     */
    export interface DataPoint {
        /**
         * Identifier of this data point. This id needs to be unique per data source configuration. Agents expected to upload timeseries value with this id, enabling backend services to match data with this data point.  This is NOT an auto generated field, enabling agents to specify it before uploading matching timeseries value.
         * @type {string}
         * @memberof DataPoint
         */
        id: string;
        /**
         *
         * @type {string}
         * @memberof DataPoint
         */
        name: string;
        /**
         *
         * @type {string}
         * @memberof DataPoint
         */
        description?: string;
        /**
         *
         * @type {string}
         * @memberof DataPoint
         */
        type: DataPoint.TypeEnum;
        /**
         * Unit of data point. Can be empty.
         * @type {string}
         * @memberof DataPoint
         */
        unit: string;
        /**
         * A list of string tuples. Max 5 tuples allowed.
         * @type {{ [key: string]: string; }}
         * @memberof DataPoint
         */
        customData?: { [key: string]: string };
    }

    /**
     * @export
     * @namespace DataPoint
     */
    export namespace DataPoint {
        /**
         * @export
         * @enum {string}
         */
        export enum TypeEnum {
            INT = <any>"INT",
            LONG = <any>"LONG",
            DOUBLE = <any>"DOUBLE",
            BOOLEAN = <any>"BOOLEAN",
            STRING = <any>"STRING"
        }
    }

    /**
     *
     * @export
     * @interface DataSource
     */
    export interface DataSource {
        /**
         *
         * @type {string}
         * @memberof DataSource
         */
        name: string;
        /**
         *
         * @type {string}
         * @memberof DataSource
         */
        description?: string;
        /**
         *
         * @type {Array<DataPoint>}
         * @memberof DataSource
         */
        dataPoints: Array<DataPoint>;
        /**
         * A list of string tuples. Max 5 tuples allowed.
         * @type {{ [key: string]: string; }}
         * @memberof DataSource
         */
        customData?: { [key: string]: string };
    }

    /**
     *
     * @export
     * @interface DataSourceConfiguration
     */
    export interface DataSourceConfiguration {
        /**
         *
         * @type {string}
         * @memberof DataSourceConfiguration
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof DataSourceConfiguration
         */
        eTag?: string;
        /**
         * Unique identifier of the datasource configuration.
         * @type {string}
         * @memberof DataSourceConfiguration
         */
        configurationId: string;
        /**
         *
         * @type {Array<DataSource>}
         * @memberof DataSourceConfiguration
         */
        dataSources: Array<DataSource>;
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
     * @interface Forbidden
     */
    export interface Forbidden {
        /**
         *
         * @type {string}
         * @memberof Forbidden
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Forbidden
         */
        message?: string;
    }

    /**
     * Unique identifier of the token.
     * @export
     * @interface Jti
     */
    export interface Jti {}

    /**
     *
     * @export
     * @interface Jwks
     */
    export interface Jwks {
        /**
         *
         * @type {Array<Key>}
         * @memberof Jwks
         */
        keys?: Array<Key>;
    }

    /**
     *
     * @export
     * @interface Key
     */
    export interface Key {
        /**
         *
         * @type {string}
         * @memberof Key
         */
        e: string;
        /**
         *
         * @type {string}
         * @memberof Key
         */
        n: string;
        /**
         *
         * @type {string}
         * @memberof Key
         */
        kty: string;
        /**
         *
         * @type {string}
         * @memberof Key
         */
        kid: string;
    }

    /**
     *
     * @export
     * @interface Keys
     */
    export interface Keys {
        /**
         *
         * @type {Jwks}
         * @memberof Keys
         */
        jwks?: Jwks;
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
     * @interface OnboardingConfigurationContent
     */
    export interface OnboardingConfigurationContent {
        /**
         *
         * @type {string}
         * @memberof OnboardingConfigurationContent
         */
        baseUrl?: string;
        /**
         *
         * @type {string}
         * @memberof OnboardingConfigurationContent
         */
        iat?: string;
        /**
         *
         * @type {Array<string>}
         * @memberof OnboardingConfigurationContent
         */
        clientCredentialProfile?: Array<string>;
        /**
         *
         * @type {string}
         * @memberof OnboardingConfigurationContent
         */
        clientId?: string;
        /**
         *
         * @type {string}
         * @memberof OnboardingConfigurationContent
         */
        tenant?: string;
    }

    /**
     *
     * @export
     * @interface OnboardingStatus
     */
    export interface OnboardingStatus {
        /**
         *
         * @type {string}
         * @memberof OnboardingStatus
         */
        status?: OnboardingStatus.StatusEnum;
    }

    /**
     * @export
     * @namespace OnboardingStatus
     */
    export namespace OnboardingStatus {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            NOTONBOARDED = <any>"NOT_ONBOARDED",
            ONBOARDING = <any>"ONBOARDING",
            ONBOARDED = <any>"ONBOARDED"
        }
    }

    /**
     *
     * @export
     * @interface OnlineStatus
     */
    export interface OnlineStatus {
        /**
         *
         * @type {string}
         * @memberof OnlineStatus
         */
        status?: OnlineStatus.StatusEnum;
        /**
         *
         * @type {Date}
         * @memberof OnlineStatus
         */
        since?: Date;
    }

    /**
     * @export
     * @namespace OnlineStatus
     */
    export namespace OnlineStatus {
        /**
         * @export
         * @enum {string}
         */
        export enum StatusEnum {
            ONLINE = <any>"ONLINE",
            OFFLINE = <any>"OFFLINE"
        }
    }

    /**
     *
     * @export
     * @interface Order
     */
    export interface Order {
        /**
         * The order the property shall be sorted for.
         * @type {string}
         * @memberof Order
         */
        direction?: Order.DirectionEnum;
        /**
         * The property to order for.
         * @type {string}
         * @memberof Order
         */
        property?: string;
        /**
         * Whether or not the sort will be case sensitive.
         * @type {boolean}
         * @memberof Order
         */
        ignoreCase?: boolean;
        /**
         *
         * @type {string}
         * @memberof Order
         */
        nullHandling?: Order.NullHandlingEnum;
        /**
         * Whether sorting for this property shall be descending.
         * @type {boolean}
         * @memberof Order
         */
        descending?: boolean;
        /**
         * Whether sorting for this property shall be ascending.
         * @type {boolean}
         * @memberof Order
         */
        ascending?: boolean;
    }

    /**
     * @export
     * @namespace Order
     */
    export namespace Order {
        /**
         * @export
         * @enum {string}
         */
        export enum DirectionEnum {
            ASC = <any>"ASC",
            DESC = <any>"DESC"
        }
        /**
         * @export
         * @enum {string}
         */
        export enum NullHandlingEnum {
            NATIVE = <any>"NATIVE",
            NULLSFIRST = <any>"NULLS_FIRST",
            NULLSLAST = <any>"NULLS_LAST"
        }
    }

    /**
     *
     * @export
     * @interface PagedAgent
     */
    export interface PagedAgent {
        /**
         *
         * @type {Array<Agent>}
         * @memberof PagedAgent
         */
        content: Array<Agent>;
        /**
         * Whether the current item is the last one.
         * @type {boolean}
         * @memberof PagedAgent
         */
        last: boolean;
        /**
         * The number of total pages.
         * @type {number}
         * @memberof PagedAgent
         */
        totalPages: number;
        /**
         * The total amount of elements.
         * @type {number}
         * @memberof PagedAgent
         */
        totalElements: number;
        /**
         * The number of elements currently on this page.
         * @type {number}
         * @memberof PagedAgent
         */
        numberOfElements: number;
        /**
         * Whether the current item is the first one.
         * @type {boolean}
         * @memberof PagedAgent
         */
        first: boolean;
        /**
         * The sorting parameters for the page.
         * @type {Array<Order>}
         * @memberof PagedAgent
         */
        sort: Array<Order>;
        /**
         * The size of the page.
         * @type {number}
         * @memberof PagedAgent
         */
        size: number;
        /**
         * The number of the current item.
         * @type {number}
         * @memberof PagedAgent
         */
        number: number;
    }

    /**
     *
     * @export
     * @interface Preconditionfailed
     */
    export interface Preconditionfailed {
        /**
         *
         * @type {string}
         * @memberof Preconditionfailed
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof Preconditionfailed
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface RotationKeys
     */
    export interface RotationKeys {
        /**
         *
         * @type {string}
         * @memberof RotationKeys
         */
        client_id?: string;
        /**
         *
         * @type {Jwks}
         * @memberof RotationKeys
         */
        jwks?: Jwks;
    }

    /**
     *
     * @export
     * @interface TokenKey
     */
    export interface TokenKey extends Key {
        /**
         *
         * @type {string}
         * @memberof TokenKey
         */
        alg?: string;
        /**
         *
         * @type {string}
         * @memberof TokenKey
         */
        use?: string;
        /**
         *
         * @type {string}
         * @memberof TokenKey
         */
        value?: string;
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

    /**
     *
     * @export
     * @interface UnauthorizedIAM
     */
    export interface UnauthorizedIAM {
        /**
         *
         * @type {string}
         * @memberof UnauthorizedIAM
         */
        id?: string;
        /**
         *
         * @type {string}
         * @memberof UnauthorizedIAM
         */
        error?: string;
        /**
         * An error message with Correlation-ID value.
         * @type {string}
         * @memberof UnauthorizedIAM
         */
        error_description?: string;
    }
}
