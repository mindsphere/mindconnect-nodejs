export namespace CaseManagementModels {
    /**
     *
     * @export
     * @class RequiredError
     * @extends {Error}
     */
    export class RequiredError extends Error {
        name = "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
        }
    }

    /**
     *   Details related to activities or comments pagination
     * @export
     * @interface ActivitiesPageResponse
     */
    export interface ActivitiesPageResponse {
        /**
         *
         * @type {number}
         * @memberof ActivitiesPageResponse
         */
        size?: number;
        /**
         *
         * @type {number}
         * @memberof ActivitiesPageResponse
         */
        totalElements?: number;
        /**
         *
         * @type {number}
         * @memberof ActivitiesPageResponse
         */
        totalPages?: number;
        /**
         *
         * @type {number}
         * @memberof ActivitiesPageResponse
         */
        number?: number;
    }
    /**
     *
     * @export
     * @interface Association
     */
    export interface Association {
        /**
         *
         * @type {string}
         * @memberof Association
         */
        id?: string;
        /**
         *
         * @type {AssociationTypeEnum}
         * @memberof Association
         */
        type?: AssociationTypeEnum;
    }
    /**
     * Association is object holds information about the entity associated to case e.g. ASSETs or EVENTs. Maximum one asset and 10 events can be attached per case.
     * @export
     * @interface AssociationDTO
     */
    export interface AssociationDTO {
        /**
         * ID of entity to be associated e.g. assetId
         * @type {string}
         * @memberof AssociationDTO
         */
        id: string;
        /**
         *
         * @type {AssociationTypeEnum}
         * @memberof AssociationDTO
         */
        type: AssociationTypeEnum;
    }
    /**
     *
     * @export
     * @enum {string}
     */
    export enum AssociationTypeEnum {
        ASSET = <any>"ASSET",
        EVENT = <any>"EVENT",
    }
    /**
     * Request body for partial update of associations
     * @export
     * @interface AssociationsRequestDTO
     */
    export interface AssociationsRequestDTO {
        /**
         *
         * @type {Array<AssociationDTO>}
         * @memberof AssociationsRequestDTO
         */
        associations: Array<AssociationDTO>;
    }
    /**
     *
     * @export
     * @interface Attachment
     */
    export interface Attachment {
        /**
         *
         * @type {string}
         * @memberof Attachment
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof Attachment
         */
        assetId?: string;
        /**
         *
         * @type {string}
         * @memberof Attachment
         */
        path?: string;
        /**
         *
         * @type {string}
         * @memberof Attachment
         */
        url?: string;
    }
    /**
     * Files can be attached to cases  Files uploaded to IOT file services are accepted here  e.g. https://gateway.eu1.mindsphere.io/api/iotfile/v3/files/cb72dfd7400e4fc6a275f22e6751cce6/AA-019/file.pdf
     * @export
     * @interface AttachmentDTO
     */
    export interface AttachmentDTO {
        /**
         * name of the file to be attached  e,g, file.pdf
         * @type {string}
         * @memberof AttachmentDTO
         */
        name: string;
        /**
         * Asset to which file was uploaded  e.g. cb72dfd7400e4fc6a275f22e6751cce6
         * @type {string}
         * @memberof AttachmentDTO
         */
        assetId: string;
        /**
         * Path to file  e.g. AA-019
         * @type {string}
         * @memberof AttachmentDTO
         */
        path: string;
    }
    /**
     *   Request body for partial update of attachments
     * @export
     * @interface AttachmentsRequestDTO
     */
    export interface AttachmentsRequestDTO {
        /**
         *
         * @type {Array<AttachmentDTO>}
         * @memberof AttachmentsRequestDTO
         */
        attachments: Array<AttachmentDTO>;
    }
    /**
     * Response for get list of cases activities     Maximum 100 cases activities for a tenant are allowed to be returned.
     * @export
     * @interface CaseActivitiesListResponse
     */
    export interface CaseActivitiesListResponse {
        /**
         *
         * @type {ActivitiesPageResponse}
         * @memberof CaseActivitiesListResponse
         */
        page?: ActivitiesPageResponse;
        /**
         *
         * @type {Array<CaseActivitiesSummaryResponse>}
         * @memberof CaseActivitiesListResponse
         */
        activities?: Array<CaseActivitiesSummaryResponse>;
    }
    /**
     *   Response body for GET cases activities
     * @export
     * @interface CaseActivitiesSummaryResponse
     */
    export interface CaseActivitiesSummaryResponse {
        /**
         * Unique identification of activity
         * @type {string}
         * @memberof CaseActivitiesSummaryResponse
         */
        id?: string;
        /**
         * Name of the source operating the particular case
         * @type {string}
         * @memberof CaseActivitiesSummaryResponse
         */
        source?: string;
        /**
         *
         * @type {string}
         * @memberof CaseActivitiesSummaryResponse
         */
        handle?: string;
        /**
         *
         * @type {CaseOperationEnum}
         * @memberof CaseActivitiesSummaryResponse
         */
        operation?: CaseOperationEnum;
        /**
         * List of changes performed on case
         * @type {Array<CaseChangesResponse>}
         * @memberof CaseActivitiesSummaryResponse
         */
        changes?: Array<CaseChangesResponse>;
        /**
         * Email id of tenant user;  example: test@test.com
         * @type {string}
         * @memberof CaseActivitiesSummaryResponse
         */
        initiator?: string;
        /**
         * When activity is logged
         * @type {string}
         * @memberof CaseActivitiesSummaryResponse
         */
        timestamp?: string;
    }
    /**
     * Response for aggregate cases
     * @export
     * @interface CaseAggregateResponse
     */
    export interface CaseAggregateResponse {
        /**
         *
         * @type {CaseAggregateResponsePriorityInfo}
         * @memberof CaseAggregateResponse
         */
        priorityInfo?: CaseAggregateResponsePriorityInfo;
        /**
         *
         * @type {CaseAggregateResponseStatusInfo}
         * @memberof CaseAggregateResponse
         */
        statusInfo?: CaseAggregateResponseStatusInfo;
        /**
         *
         * @type {SeverityByStatus}
         * @memberof CaseAggregateResponse
         */
        severityByStatus?: SeverityByStatus;
        /**
         *
         * @type {number}
         * @memberof CaseAggregateResponse
         */
        totalCases?: number;
    }
    /**
     * Count of cases by priority
     * @export
     * @interface CaseAggregateResponsePriorityInfo
     */
    export interface CaseAggregateResponsePriorityInfo {
        /**
         *
         * @type {CounterInfo}
         * @memberof CaseAggregateResponsePriorityInfo
         */
        EMERGENCY?: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof CaseAggregateResponsePriorityInfo
         */
        MEDIUM?: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof CaseAggregateResponsePriorityInfo
         */
        HIGH?: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof CaseAggregateResponsePriorityInfo
         */
        LOW?: CounterInfo;
    }
    /**
     * Count of cases by status
     * @export
     * @interface CaseAggregateResponseStatusInfo
     */
    export interface CaseAggregateResponseStatusInfo {
        /**
         *
         * @type {CounterInfo}
         * @memberof CaseAggregateResponseStatusInfo
         */
        OPEN?: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof CaseAggregateResponseStatusInfo
         */
        INPROGRESS?: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof CaseAggregateResponseStatusInfo
         */
        ONHOLD?: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof CaseAggregateResponseStatusInfo
         */
        DONE?: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof CaseAggregateResponseStatusInfo
         */
        OVERDUE?: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof CaseAggregateResponseStatusInfo
         */
        CANCELLED?: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof CaseAggregateResponseStatusInfo
         */
        ARCHIVED?: CounterInfo;
    }
    /**
     *   case change
     * @export
     * @interface CaseChangesResponse
     */
    export interface CaseChangesResponse {
        /**
         * Type of value changed on case
         * @type {string}
         * @memberof CaseChangesResponse
         */
        valueType?: string;
        /**
         * New value changed on case for corresponding valueType
         * @type {string}
         * @memberof CaseChangesResponse
         */
        newValue?: string;
        /**
         * Old value changed on case for corresponding valueType
         * @type {string}
         * @memberof CaseChangesResponse
         */
        oldValue?: string;
    }
    /**
     * Response for get list of cases comments     Maximum 100 cases comments for a tenant are allowed to be returned.
     * @export
     * @interface CaseCommentsListResponse
     */
    export interface CaseCommentsListResponse {
        /**
         *
         * @type {ActivitiesPageResponse}
         * @memberof CaseCommentsListResponse
         */
        page?: ActivitiesPageResponse;
        /**
         *
         * @type {Array<CaseCommentsResponse>}
         * @memberof CaseCommentsListResponse
         */
        comments?: Array<CaseCommentsResponse>;
    }
    /**
     *   Request body for POST cases comment
     * @export
     * @interface CaseCommentsRequestDTO
     */
    export interface CaseCommentsRequestDTO {
        /**
         * State of comment whether it's active or not.
         * @type {boolean}
         * @memberof CaseCommentsRequestDTO
         */
        isActive?: boolean;
        /**
         *
         * @type {string}
         * @memberof CaseCommentsRequestDTO
         */
        description?: string;
    }
    /**
     *   Response body for GET cases comments
     * @export
     * @interface CaseCommentsResponse
     */
    export interface CaseCommentsResponse {
        /**
         * Unique identification of comment
         * @type {string}
         * @memberof CaseCommentsResponse
         */
        id?: string;
        /**
         * Name of the source operating the particular case
         * @type {string}
         * @memberof CaseCommentsResponse
         */
        source?: string;
        /**
         *
         * @type {string}
         * @memberof CaseCommentsResponse
         */
        handle?: string;
        /**
         * State of comment whether it's active or not.
         * @type {boolean}
         * @memberof CaseCommentsResponse
         */
        isActive?: boolean;
        /**
         *
         * @type {string}
         * @memberof CaseCommentsResponse
         */
        description?: string;
        /**
         *
         * @type {string}
         * @memberof CaseCommentsResponse
         */
        createdBy?: string;
        /**
         *
         * @type {number}
         * @memberof CaseCommentsResponse
         */
        createdDate?: number;
        /**
         *
         * @type {string}
         * @memberof CaseCommentsResponse
         */
        eTag?: string;
        /**
         *
         * @type {string}
         * @memberof CaseCommentsResponse
         */
        modifiedBy?: string;
        /**
         *
         * @type {number}
         * @memberof CaseCommentsResponse
         */
        modifiedDate?: number;
    }
    /**
     * Response for get multiple cases    Maximum 1000 cases for a tenant are allowed to be returned.
     * @export
     * @interface CaseListResponse
     */
    export interface CaseListResponse {
        /**
         *
         * @type {PageResponse}
         * @memberof CaseListResponse
         */
        page?: PageResponse;
        /**
         *
         * @type {Array<CaseSummaryResponse>}
         * @memberof CaseListResponse
         */
        cases?: Array<CaseSummaryResponse>;
    }
    /**
     * Kind of action performed on case, i.e. either insert / update / delete
     * @export
     * @enum {string}
     */
    export enum CaseOperationEnum {
        INSERT = <any>"INSERT",
        UPDATE = <any>"UPDATE",
        DELETE = <any>"DELETE",
    }
    /**
     * Request body to create/update a case
     * @export
     * @interface CaseRequestDTO
     */
    export interface CaseRequestDTO {
        /**
         * Email id of tenant user;  example: test@test.com
         * @type {string}
         * @memberof CaseRequestDTO
         */
        assignedTo?: string;
        /**
         * List of files attached to case
         * @type {Array<AttachmentDTO>}
         * @memberof CaseRequestDTO
         */
        attachments?: Array<AttachmentDTO>;
        /**
         * List of associated entities with case
         * @type {Array<AssociationDTO>}
         * @memberof CaseRequestDTO
         */
        associations?: Array<AssociationDTO>;
        /**
         * Description may include details about what needs to be done as part of this case
         * @type {string}
         * @memberof CaseRequestDTO
         */
        description?: string;
        /**
         * Name of the source initiating case creation
         * @type {string}
         * @memberof CaseRequestDTO
         */
        source?: string;
        /**
         * Due date by which this case needs to be addressed
         * @type {string}
         * @memberof CaseRequestDTO
         */
        dueDate: string;
        /**
         *
         * @type {PriorityEnum}
         * @memberof CaseRequestDTO
         */
        priority?: PriorityEnum;
        /**
         *
         * @type {StatusEnum}
         * @memberof CaseRequestDTO
         */
        status?: StatusEnum;
        /**
         * Short title of activity to be performed as part of case; example: Fuel Check
         * @type {string}
         * @memberof CaseRequestDTO
         */
        title: string;
        /**
         *
         * @type {TypeEnum}
         * @memberof CaseRequestDTO
         */
        type?: TypeEnum;
        /**
         * If set to true email is sent to assignee
         * @type {boolean}
         * @memberof CaseRequestDTO
         */
        notifyAssignee?: boolean;
        /**
         *
         * @type {MetaData}
         * @memberof CaseRequestDTO
         */
        metadata?: MetaData;
        /**
         *
         * @type {Array<ExternalSystems>}
         * @memberof CaseRequestDTO
         */
        externalSystems?: Array<ExternalSystems>;
        /**
         * List of tags on case
         * @type {Array<CaseTags>}
         * @memberof CaseRequestDTO
         */
        tags?: Array<CaseTags>;
    }
    /**
     *   Response body for GET case
     * @export
     * @interface CaseResponse
     */
    export interface CaseResponse {
        /**
         * Email id of tenant user;  example: test@test.com
         * @type {string}
         * @memberof CaseResponse
         */
        assignedTo?: string;
        /**
         * Description may include details about what needs to be done as part of this case
         * @type {string}
         * @memberof CaseResponse
         */
        description?: string;
        /**
         *
         * @type {PriorityEnum}
         * @memberof CaseResponse
         */
        priority?: PriorityEnum;
        /**
         *
         * @type {StatusEnum}
         * @memberof CaseResponse
         */
        status?: StatusEnum;
        /**
         *
         * @type {TypeEnum}
         * @memberof CaseResponse
         */
        type?: TypeEnum;
        /**
         * If set to true email is sent to assignee
         * @type {boolean}
         * @memberof CaseResponse
         */
        notifyAssignee?: boolean;
        /**
         *
         * @type {Array<Attachment>}
         * @memberof CaseResponse
         */
        attachments?: Array<Attachment>;
        /**
         *
         * @type {Array<Association>}
         * @memberof CaseResponse
         */
        associations?: Array<Association>;
        /**
         *
         * @type {string}
         * @memberof CaseResponse
         */
        dueDate?: string;
        /**
         * Name of the source initiating case creation
         * @type {string}
         * @memberof CaseResponse
         */
        source?: string;
        /**
         *
         * @type {string}
         * @memberof CaseResponse
         */
        title?: string;
        /**
         *
         * @type {string}
         * @memberof CaseResponse
         */
        handle?: string;
        /**
         *
         * @type {string}
         * @memberof CaseResponse
         */
        createdBy?: string;
        /**
         *
         * @type {number}
         * @memberof CaseResponse
         */
        createdDate?: number;
        /**
         *
         * @type {string}
         * @memberof CaseResponse
         */
        eTag?: string;
        /**
         *
         * @type {string}
         * @memberof CaseResponse
         */
        modifiedBy?: string;
        /**
         *
         * @type {number}
         * @memberof CaseResponse
         */
        modifiedDate?: number;
        /**
         *
         * @type {boolean}
         * @memberof CaseResponse
         */
        overdue?: boolean;
        /**
         *
         * @type {MetaData}
         * @memberof CaseResponse
         */
        metadata?: MetaData;
        /**
         *
         * @type {Array<ExternalSystems>}
         * @memberof CaseResponse
         */
        externalSystems?: Array<ExternalSystems>;
        /**
         * List of tags on case
         * @type {Array<CaseTags>}
         * @memberof CaseResponse
         */
        tags?: Array<CaseTags>;
    }
    /**
     *
     * @export
     * @interface CaseResponseStatus
     */
    export interface CaseResponseStatus {
        /**
         *
         * @type {string}
         * @memberof CaseResponseStatus
         */
        message?: string;
        /**
         *
         * @type {string}
         * @memberof CaseResponseStatus
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof CaseResponseStatus
         */
        handle?: string;
        /**
         *
         * @type {string}
         * @memberof CaseResponseStatus
         */
        compKey?: string;
        /**
         *
         * @type {string}
         * @memberof CaseResponseStatus
         */
        code?: string;
    }
    /**
     *
     * @export
     * @interface CaseSuccessResponseStatus
     */
    export interface CaseSuccessResponseStatus {
        /**
         *
         * @type {string}
         * @memberof CaseSuccessResponseStatus
         */
        message?: string;
        /**
         *
         * @type {string}
         * @memberof CaseSuccessResponseStatus
         */
        handle?: string;
        /**
         *
         * @type {string}
         * @memberof CaseSuccessResponseStatus
         */
        eTag?: string;
    }
    /**
     *   Response body for GET case
     * @export
     * @interface CaseSummaryResponse
     */
    export interface CaseSummaryResponse {
        /**
         * Email id of tenant user;  example: test@test.com
         * @type {string}
         * @memberof CaseSummaryResponse
         */
        assignedTo?: string;
        /**
         * Description may include details about what needs to be done as part of this case
         * @type {string}
         * @memberof CaseSummaryResponse
         */
        description?: string;
        /**
         *
         * @type {PriorityEnum}
         * @memberof CaseSummaryResponse
         */
        priority?: PriorityEnum;
        /**
         *
         * @type {StatusEnum}
         * @memberof CaseSummaryResponse
         */
        status?: StatusEnum;
        /**
         *
         * @type {TypeEnum}
         * @memberof CaseSummaryResponse
         */
        type?: TypeEnum;
        /**
         * If set to true email is sent to assignee
         * @type {boolean}
         * @memberof CaseSummaryResponse
         */
        notifyAssignee?: boolean;
        /**
         *
         * @type {string}
         * @memberof CaseSummaryResponse
         */
        dueDate?: string;
        /**
         * Name of the source initiating case creation
         * @type {string}
         * @memberof CaseSummaryResponse
         */
        source?: string;
        /**
         *
         * @type {string}
         * @memberof CaseSummaryResponse
         */
        title?: string;
        /**
         *
         * @type {string}
         * @memberof CaseSummaryResponse
         */
        handle?: string;
        /**
         *
         * @type {string}
         * @memberof CaseSummaryResponse
         */
        createdBy?: string;
        /**
         *
         * @type {number}
         * @memberof CaseSummaryResponse
         */
        createdDate?: number;
        /**
         *
         * @type {string}
         * @memberof CaseSummaryResponse
         */
        eTag?: string;
        /**
         *
         * @type {string}
         * @memberof CaseSummaryResponse
         */
        modifiedBy?: string;
        /**
         *
         * @type {number}
         * @memberof CaseSummaryResponse
         */
        modifiedDate?: number;
        /**
         *
         * @type {boolean}
         * @memberof CaseSummaryResponse
         */
        overdue?: boolean;
    }
    /**
     *   case tag
     * @export
     * @interface CaseTags
     */
    export interface CaseTags {
        /**
         * Tag category of this case
         * @type {string}
         * @memberof CaseTags
         */
        category?: string;
        /**
         * Tag value on case for corresponding category
         * @type {string}
         * @memberof CaseTags
         */
        value?: string;
    }
    /**
     *   Request body for patching the cases tags
     * @export
     * @interface CaseTagsRequestDTO
     */
    export interface CaseTagsRequestDTO {
        /**
         * List of tags on case
         * @type {Array<CaseTags>}
         * @memberof CaseTagsRequestDTO
         */
        tags?: Array<CaseTags>;
    }
    /**
     *
     * @export
     * @interface CounterInfo
     */
    export interface CounterInfo {
        /**
         *
         * @type {number}
         * @memberof CounterInfo
         */
        count?: number;
        /**
         *
         * @type {string}
         * @memberof CounterInfo
         */
        fieldName?: string;
    }
    /**
     * It will hold external systems properties.
     * @export
     * @interface ExternalSystemDTO
     */
    export interface ExternalSystemDTO {
        /**
         * Type of external system i.e. source or destination
         * @type {string}
         * @memberof ExternalSystemDTO
         */
        type: string;
        /**
         * Name of external system
         * @type {string}
         * @memberof ExternalSystemDTO
         */
        name: string;
        /**
         * External system generated identity
         * @type {string}
         * @memberof ExternalSystemDTO
         */
        entityId: string;
        /**
         * External system link
         * @type {string}
         * @memberof ExternalSystemDTO
         */
        link: string;
        /**
         * System specific properties
         * @type {any}
         * @memberof ExternalSystemDTO
         */
        metadata: any;
    }
    /**
     * List of external system attached to case
     * @export
     */
    export type ExternalSystems = Array<ExternalSystemDTO>;
    /**
     * Request body for partial update of externalSystems
     * @export
     * @interface ExternalSystemsRequestDTO
     */
    export interface ExternalSystemsRequestDTO {
        /**
         *
         * @type {Array<ExternalSystemDTO>}
         * @memberof ExternalSystemsRequestDTO
         */
        externalSystems: Array<ExternalSystemDTO>;
    }
    /**
     * It will hold dates properties.
     * @export
     * @interface MetaData
     */
    export interface MetaData {
        activationDate: string;
        completedDate: string;
        [key: string]: any;
    }
    /**
     *   Details related to pagination
     * @export
     * @interface PageResponse
     */
    export interface PageResponse {
        /**
         *
         * @type {number}
         * @memberof PageResponse
         */
        size?: number;
        /**
         *
         * @type {number}
         * @memberof PageResponse
         */
        totalElements?: number;
        /**
         *
         * @type {number}
         * @memberof PageResponse
         */
        totalPages?: number;
        /**
         *
         * @type {number}
         * @memberof PageResponse
         */
        number?: number;
    }
    /**
     * Priority of case; example: LOW,MEDIUM,HIGH,EMERGENCY
     * @export
     * @enum {string}
     */
    export enum PriorityEnum {
        EMERGENCY = <any>"EMERGENCY",
        MEDIUM = <any>"MEDIUM",
        HIGH = <any>"HIGH",
        LOW = <any>"LOW",
    }
    /**
     *   Get count of cases by statues and severity  When aggregate=true
     * @export
     * @interface SeverityByStatus
     */
    export interface SeverityByStatus {
        /**
         *
         * @type {SeverityByStatusOverview}
         * @memberof SeverityByStatus
         */
        overview?: SeverityByStatusOverview;
    }
    /**
     *
     * @export
     * @interface SeverityByStatusOverview
     */
    export interface SeverityByStatusOverview {
        /**
         *
         * @type {SeverityByStatusOverviewOPEN}
         * @memberof SeverityByStatusOverview
         */
        OPEN?: SeverityByStatusOverviewOPEN;
        /**
         *
         * @type {SeverityByStatusOverviewOPEN}
         * @memberof SeverityByStatusOverview
         */
        INPROGRESS?: SeverityByStatusOverviewOPEN;
        /**
         *
         * @type {SeverityByStatusOverviewOPEN}
         * @memberof SeverityByStatusOverview
         */
        ONHOLD?: SeverityByStatusOverviewOPEN;
        /**
         *
         * @type {SeverityByStatusOverviewOPEN}
         * @memberof SeverityByStatusOverview
         */
        DONE?: SeverityByStatusOverviewOPEN;
        /**
         *
         * @type {SeverityByStatusOverviewOPEN}
         * @memberof SeverityByStatusOverview
         */
        OVERDUE?: SeverityByStatusOverviewOPEN;
        /**
         *
         * @type {SeverityByStatusOverviewOPEN}
         * @memberof SeverityByStatusOverview
         */
        CANCELLED?: SeverityByStatusOverviewOPEN;
        /**
         *
         * @type {SeverityByStatusOverviewOPEN}
         * @memberof SeverityByStatusOverview
         */
        ARCHIVED?: SeverityByStatusOverviewOPEN;
    }
    /**
     *
     * @export
     * @interface SeverityByStatusOverviewOPEN
     */
    export interface SeverityByStatusOverviewOPEN {
        /**
         *
         * @type {CounterInfo}
         * @memberof SeverityByStatusOverviewOPEN
         */
        LOW: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof SeverityByStatusOverviewOPEN
         */
        HIGH: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof SeverityByStatusOverviewOPEN
         */
        MEDIUM: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof SeverityByStatusOverviewOPEN
         */
        EMERGENCY: CounterInfo;
    }
    /**
     * Status of case; example: OPEN,INPROGRESS,ONHOLD,DONE,CANCELLED,ARCHIVED
     * @export
     * @enum {string}
     */
    export enum StatusEnum {
        OPEN = <any>"OPEN",
        INPROGRESS = <any>"INPROGRESS",
        ONHOLD = <any>"ONHOLD",
        DONE = <any>"DONE",
        OVERDUE = <any>"OVERDUE",
        CANCELLED = <any>"CANCELLED",
        ARCHIVED = <any>"ARCHIVED",
    }
    /**
     * Request body for partial update of tags
     * @export
     * @interface TagsRequestDTO
     */
    export interface TagsRequestDTO {
        /**
         *
         * @type {Array<CaseTagsRequestDTO>}
         * @memberof TagsRequestDTO
         */
        tags: Array<CaseTagsRequestDTO>;
    }
    /**
     * Type of case  is it planned or incident or annotation
     * @export
     * @enum {string}
     */
    export enum TypeEnum {
        PLANNED = <any>"PLANNED",
        INCIDENT = <any>"INCIDENT",
        ANNOTATION = <any>"ANNOTATION",
    }
    /**
     *
     * @export
     * @interface UserInfo
     */
    export interface UserInfo {
        /**
         *
         * @type {string}
         * @memberof UserInfo
         */
        userName: string;
        /**
         *
         * @type {string}
         * @memberof UserInfo
         */
        role: string;
        /**
         *
         * @type {boolean}
         * @memberof UserInfo
         */
        isSubtenant: boolean;
    }
    /**
     *
     * @export
     * @interface VersionInfo
     */
    export interface VersionInfo {
        /**
         *
         * @type {string}
         * @memberof VersionInfo
         */
        version: string;
    }
}
