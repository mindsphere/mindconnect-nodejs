export namespace WorkOrderModels {
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
     * Association is object holds information about the entity associated to work order e.g. ASSETs
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
     * Files can be attached to work orders  Files uploaded to IOT file services are accepted here  e.g. https://gateway.eu1.mindsphere.io/api/iotfile/v3/files/cb72dfd7400e4fc6a275f22e6751cce6/AA-019/file.pdf
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
     *
     * @export
     * @interface PickAttachmentExcludeKeyofAttachmentUrl_
     */
    export interface PickAttachmentExcludeKeyofAttachmentUrl_ {
        /**
         *
         * @type {string}
         * @memberof PickAttachmentExcludeKeyofAttachmentUrl_
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof PickAttachmentExcludeKeyofAttachmentUrl_
         */
        assetId?: string;
        /**
         *
         * @type {string}
         * @memberof PickAttachmentExcludeKeyofAttachmentUrl_
         */
        path?: string;
    }
    /**
     *
     * @export
     * @interface PickWorkOrderRequestDTOExcludeKeyofWorkOrderRequestDTOAttachmentsOrAssociationsOrDueDateOrTitle_
     */
    export interface PickWorkOrderRequestDTOExcludeKeyofWorkOrderRequestDTOAttachmentsOrAssociationsOrDueDateOrTitle_ {
        /**
         * Email id of tenant user;  example: test@test.com
         * @type {string}
         * @memberof PickWorkOrderRequestDTOExcludeKeyofWorkOrderRequestDTOAttachmentsOrAssociationsOrDueDateOrTitle_
         */
        assignedTo?: string;
        /**
         * Description may include details about what needs to be done as part of this work order
         * @type {string}
         * @memberof PickWorkOrderRequestDTOExcludeKeyofWorkOrderRequestDTOAttachmentsOrAssociationsOrDueDateOrTitle_
         */
        description?: string;
        /**
         *
         * @type {PriorityEnum}
         * @memberof PickWorkOrderRequestDTOExcludeKeyofWorkOrderRequestDTOAttachmentsOrAssociationsOrDueDateOrTitle_
         */
        priority?: PriorityEnum;
        /**
         *
         * @type {StatusEnum}
         * @memberof PickWorkOrderRequestDTOExcludeKeyofWorkOrderRequestDTOAttachmentsOrAssociationsOrDueDateOrTitle_
         */
        status?: StatusEnum;
        /**
         *
         * @type {TypeEnum}
         * @memberof PickWorkOrderRequestDTOExcludeKeyofWorkOrderRequestDTOAttachmentsOrAssociationsOrDueDateOrTitle_
         */
        type?: TypeEnum;
        /**
         * If set to true email is sent to assignee
         * @type {boolean}
         * @memberof PickWorkOrderRequestDTOExcludeKeyofWorkOrderRequestDTOAttachmentsOrAssociationsOrDueDateOrTitle_
         */
        notifyAssignee?: boolean;
    }
    /**
     *
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
     *   Get count of work orders by statues and severity  When aggregate=true
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
     *
     * @export
     * @enum {string}
     */
    export enum StatusEnum {
        OPEN = <any>"OPEN",
        INPROGRESS = <any>"INPROGRESS",
        ONHOLD = <any>"ONHOLD",
        DONE = <any>"DONE",
        OVERDUE = <any>"OVERDUE",
    }
    /**
     *
     * @export
     * @enum {string}
     */
    export enum TypeEnum {
        PLANNED = <any>"PLANNED",
        INCIDENT = <any>"INCIDENT",
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
    /**
     * Response for aggregate work orders
     * @export
     * @interface WorkOrderAggregateResponse
     */
    export interface WorkOrderAggregateResponse {
        /**
         *
         * @type {WorkOrderAggregateResponsePriorityInfo}
         * @memberof WorkOrderAggregateResponse
         */
        priorityInfo?: WorkOrderAggregateResponsePriorityInfo;
        /**
         *
         * @type {WorkOrderAggregateResponseStatusInfo}
         * @memberof WorkOrderAggregateResponse
         */
        statusInfo?: WorkOrderAggregateResponseStatusInfo;
        /**
         *
         * @type {SeverityByStatus}
         * @memberof WorkOrderAggregateResponse
         */
        severityByStatus?: SeverityByStatus;
        /**
         *
         * @type {number}
         * @memberof WorkOrderAggregateResponse
         */
        totalWorkOrders?: number;
    }
    /**
     * Count of work orders by priority
     * @export
     * @interface WorkOrderAggregateResponsePriorityInfo
     */
    export interface WorkOrderAggregateResponsePriorityInfo {
        /**
         *
         * @type {CounterInfo}
         * @memberof WorkOrderAggregateResponsePriorityInfo
         */
        EMERGENCY?: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof WorkOrderAggregateResponsePriorityInfo
         */
        MEDIUM?: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof WorkOrderAggregateResponsePriorityInfo
         */
        HIGH?: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof WorkOrderAggregateResponsePriorityInfo
         */
        LOW?: CounterInfo;
    }
    /**
     * Count of work orders by status
     * @export
     * @interface WorkOrderAggregateResponseStatusInfo
     */
    export interface WorkOrderAggregateResponseStatusInfo {
        /**
         *
         * @type {CounterInfo}
         * @memberof WorkOrderAggregateResponseStatusInfo
         */
        OPEN?: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof WorkOrderAggregateResponseStatusInfo
         */
        INPROGRESS?: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof WorkOrderAggregateResponseStatusInfo
         */
        ONHOLD?: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof WorkOrderAggregateResponseStatusInfo
         */
        DONE?: CounterInfo;
        /**
         *
         * @type {CounterInfo}
         * @memberof WorkOrderAggregateResponseStatusInfo
         */
        OVERDUE?: CounterInfo;
    }
    /**
     * Response for get multiple work orders    Maximum work orders for a tenant is 1000
     * @export
     * @interface WorkOrderListResponse
     */
    export interface WorkOrderListResponse {
        /**
         *
         * @type {PageResponse}
         * @memberof WorkOrderListResponse
         */
        page?: PageResponse;
        /**
         *
         * @type {Array<WorkOrderSummaryResponse>}
         * @memberof WorkOrderListResponse
         */
        workOrders?: Array<WorkOrderSummaryResponse>;
    }
    /**
     * Request body to create/update a work order
     * @export
     * @interface WorkOrderRequestDTO
     */
    export interface WorkOrderRequestDTO {
        /**
         * Email id of tenant user;  example: test@test.com
         * @type {string}
         * @memberof WorkOrderRequestDTO
         */
        assignedTo?: string;
        /**
         * List of files attached to work order
         * @type {Array<AttachmentDTO>}
         * @memberof WorkOrderRequestDTO
         */
        attachments?: Array<AttachmentDTO>;
        /**
         * List of associated entities with work order
         * @type {Array<AssociationDTO>}
         * @memberof WorkOrderRequestDTO
         */
        associations?: Array<AssociationDTO>;
        /**
         * Description may include details about what needs to be done as part of this work order
         * @type {string}
         * @memberof WorkOrderRequestDTO
         */
        description?: string;
        /**
         * Due date by which this work order needs to be addressed
         * @type {string}
         * @memberof WorkOrderRequestDTO
         */
        dueDate: string;
        /**
         *
         * @type {PriorityEnum}
         * @memberof WorkOrderRequestDTO
         */
        priority?: PriorityEnum;
        /**
         *
         * @type {StatusEnum}
         * @memberof WorkOrderRequestDTO
         */
        status?: StatusEnum;
        /**
         * Short title of activity to be performed as part of work order; example: Fuel Check
         * @type {string}
         * @memberof WorkOrderRequestDTO
         */
        title: string;
        /**
         *
         * @type {TypeEnum}
         * @memberof WorkOrderRequestDTO
         */
        type?: TypeEnum;
        /**
         * If set to true email is sent to assignee
         * @type {boolean}
         * @memberof WorkOrderRequestDTO
         */
        notifyAssignee?: boolean;
    }
    /**
     *   Response body for GET Work Order
     * @export
     * @interface WorkOrderResponse
     */
    export interface WorkOrderResponse {
        /**
         * Email id of tenant user;  example: test@test.com
         * @type {string}
         * @memberof WorkOrderResponse
         */
        assignedTo?: string;
        /**
         * Description may include details about what needs to be done as part of this work order
         * @type {string}
         * @memberof WorkOrderResponse
         */
        description?: string;
        /**
         *
         * @type {PriorityEnum}
         * @memberof WorkOrderResponse
         */
        priority?: PriorityEnum;
        /**
         *
         * @type {StatusEnum}
         * @memberof WorkOrderResponse
         */
        status?: StatusEnum;
        /**
         *
         * @type {TypeEnum}
         * @memberof WorkOrderResponse
         */
        type?: TypeEnum;
        /**
         * If set to true email is sent to assignee
         * @type {boolean}
         * @memberof WorkOrderResponse
         */
        notifyAssignee?: boolean;
        /**
         *
         * @type {Array<Attachment>}
         * @memberof WorkOrderResponse
         */
        attachments?: Array<Attachment>;
        /**
         *
         * @type {Array<Association>}
         * @memberof WorkOrderResponse
         */
        associations?: Array<Association>;
        /**
         *
         * @type {string}
         * @memberof WorkOrderResponse
         */
        dueDate?: string;
        /**
         *
         * @type {string}
         * @memberof WorkOrderResponse
         */
        title?: string;
        /**
         *
         * @type {string}
         * @memberof WorkOrderResponse
         */
        woHandle?: string;
        /**
         *
         * @type {string}
         * @memberof WorkOrderResponse
         */
        createdBy?: string;
        /**
         *
         * @type {number}
         * @memberof WorkOrderResponse
         */
        createdDate?: number;
        /**
         *
         * @type {string}
         * @memberof WorkOrderResponse
         */
        modifiedBy?: string;
        /**
         *
         * @type {number}
         * @memberof WorkOrderResponse
         */
        modifiedDate?: number;
        /**
         *
         * @type {boolean}
         * @memberof WorkOrderResponse
         */
        overdue?: boolean;
    }
    /**
     *
     * @export
     * @interface WorkOrderResponseStatus
     */
    export interface WorkOrderResponseStatus {
        /**
         *
         * @type {string}
         * @memberof WorkOrderResponseStatus
         */
        message?: string;
        /**
         *
         * @type {string}
         * @memberof WorkOrderResponseStatus
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof WorkOrderResponseStatus
         */
        woHandle?: string;
        /**
         *
         * @type {string}
         * @memberof WorkOrderResponseStatus
         */
        compKey?: string;
        /**
         *
         * @type {string}
         * @memberof WorkOrderResponseStatus
         */
        code?: string;
    }
    /**
     *   Response body for GET Work Order
     * @export
     * @interface WorkOrderSummaryResponse
     */
    export interface WorkOrderSummaryResponse {
        /**
         * Email id of tenant user;  example: test@test.com
         * @type {string}
         * @memberof WorkOrderSummaryResponse
         */
        assignedTo?: string;
        /**
         * Description may include details about what needs to be done as part of this work order
         * @type {string}
         * @memberof WorkOrderSummaryResponse
         */
        description?: string;
        /**
         *
         * @type {PriorityEnum}
         * @memberof WorkOrderSummaryResponse
         */
        priority?: PriorityEnum;
        /**
         *
         * @type {StatusEnum}
         * @memberof WorkOrderSummaryResponse
         */
        status?: StatusEnum;
        /**
         *
         * @type {TypeEnum}
         * @memberof WorkOrderSummaryResponse
         */
        type?: TypeEnum;
        /**
         * If set to true email is sent to assignee
         * @type {boolean}
         * @memberof WorkOrderSummaryResponse
         */
        notifyAssignee?: boolean;
        /**
         *
         * @type {string}
         * @memberof WorkOrderSummaryResponse
         */
        dueDate?: string;
        /**
         *
         * @type {string}
         * @memberof WorkOrderSummaryResponse
         */
        title?: string;
        /**
         *
         * @type {string}
         * @memberof WorkOrderSummaryResponse
         */
        woHandle?: string;
        /**
         *
         * @type {string}
         * @memberof WorkOrderSummaryResponse
         */
        createdBy?: string;
        /**
         *
         * @type {number}
         * @memberof WorkOrderSummaryResponse
         */
        createdDate?: number;
        /**
         *
         * @type {string}
         * @memberof WorkOrderSummaryResponse
         */
        modifiedBy?: string;
        /**
         *
         * @type {number}
         * @memberof WorkOrderSummaryResponse
         */
        modifiedDate?: number;
        /**
         *
         * @type {boolean}
         * @memberof WorkOrderSummaryResponse
         */
        overdue?: boolean;
    }
}
