export namespace AssetManagementModels {
    // ! fix (3.13.0): manual fixes for Asset Management Data Types
    // ! fix (3.13.0): search for export interface.*\{\} , check if they are Ids and replace them with string types instead

    export class RequiredError extends Error {
        name: "RequiredError" = "RequiredError";
        constructor(public field: string, msg?: string) {
            super(msg);
        }
    }

    /**
     *
     * @export
     * @interface Aspect
     */
    export interface Aspect {
        /**
         *
         * @type {string}
         * @memberof Aspect
         */
        name?: string;
        /**
         *
         * @type {Array<Variable>}
         * @memberof Aspect
         */
        variables?: Array<Variable>;
    }

    /**
     *
     * @export
     * @interface AspectLinks
     */
    export interface AspectLinks {
        /**
         *
         * @type {AspectLinksSelf}
         * @memberof AspectLinks
         */
        self?: AspectLinksSelf;
        /**
         *
         * @type {AspectLinksAsset}
         * @memberof AspectLinks
         */
        asset?: AspectLinksAsset;
        /**
         *
         * @type {AspectLinksAspectType}
         * @memberof AspectLinks
         */
        aspectType?: AspectLinksAspectType;
    }

    /**
     *
     * @export
     * @interface AspectLinksAspectType
     */
    export interface AspectLinksAspectType {
        /**
         * Link to the origin aspect type of the aspect
         * @type {string}
         * @memberof AspectLinksAspectType
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface AspectLinksAsset
     */
    export interface AspectLinksAsset {
        /**
         * Link to the asset
         * @type {string}
         * @memberof AspectLinksAsset
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface AspectLinksSelf
     */
    export interface AspectLinksSelf {
        /**
         * Link to the aspect
         * @type {string}
         * @memberof AspectLinksSelf
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface AspectListResource
     */
    export interface AspectListResource {
        /**
         *
         * @type {AspectListResourceEmbedded}
         * @memberof AspectListResource
         */
        _embedded?: AspectListResourceEmbedded;
        /**
         *
         * @type {Page}
         * @memberof AspectListResource
         */
        page?: Page;
        /**
         *
         * @type {PagingLinks}
         * @memberof AspectListResource
         */
        _links?: PagingLinks;
    }

    /**
     *
     * @export
     * @interface AspectListResourceEmbedded
     */
    export interface AspectListResourceEmbedded {
        /**
         *
         * @type {Array<AspectResource>}
         * @memberof AspectListResourceEmbedded
         */
        aspects?: Array<AspectResource>;
    }

    /**
     *
     * @export
     * @interface AspectResource
     */
    export interface AspectResource {
        /**
         * ID of the Aspect type
         * @type {string}
         * @memberof AspectResource
         */
        aspectTypeId?: string;
        /**
         *
         * @type {UniqueId}
         * @memberof AspectResource
         */
        holderAssetId?: UniqueId;
        /**
         * Name of the aspect
         * @type {string}
         * @memberof AspectResource
         */
        name: string;
        /**
         *
         * @type {string}
         * @memberof AspectResource
         */
        category?: AspectResource.CategoryEnum;
        /**
         * The description of the aspect
         * @type {string}
         * @memberof AspectResource
         */
        description?: string;
        /**
         *
         * @type {Array<AspectVariable>}
         * @memberof AspectResource
         */
        variables?: Array<AspectVariable>;
        /**
         *
         * @type {AspectLinks}
         * @memberof AspectResource
         */
        _links?: AspectLinks;
    }

    /**
     * @export
     * @namespace AspectResource
     */
    export namespace AspectResource {
        /**
         * @export
         * @enum {string}
         */
        export enum CategoryEnum {
            Dynamic = "dynamic",
            Static = "static",
        }
    }

    /**
     *
     * @export
     * @interface AspectType
     */
    export interface AspectType {
        /**
         * Name of the aspect type. It has to be unique inside the tenant and cannot be changed later.
         * @type {string}
         * @memberof AspectType
         */
        name: string;
        /**
         * If the aspect-type is used for static data or time-series. Cannot be changed once the aspect-type is created.
         * @type {string}
         * @memberof AspectType
         */
        category: AspectType.CategoryEnum;
        /**
         * Visibility of aspecttype. Setting this property to public makes it available to other tenants. Private types are only visible to the user's own tenant. Currently only private types can be created.
         * @type {string}
         * @memberof AspectType
         */
        scope?: AspectType.ScopeEnum;
        /**
         * The description of the aspect type
         * @type {string}
         * @memberof AspectType
         */
        description?: string;
        /**
         * Variables of the aspect-type. Variable names should be unique inside an aspect-type. Once a variable is added to the aspect that it cannot be renamed or removed. Only variables of static aspect-type can have default values.
         * @type {Array<AspectVariable>}
         * @memberof AspectType
         */
        variables: Array<AspectVariable>;
    }

    /**
     * @export
     * @namespace AspectType
     */
    export namespace AspectType {
        /**
         * @export
         * @enum {string}
         */
        export enum CategoryEnum {
            Static = "static",
            Dynamic = "dynamic",
        }
        /**
         * @export
         * @enum {string}
         */
        export enum ScopeEnum {
            Public = "public",
            Private = "private",
        }
    }

    /**
     * The aspect type's id is a unique identifier. The id's length must be between 1 and 128 characters and matches the following symbols \"A-Z\", \"a-z\", \"0-9\", \"_\" and \".\" beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id). Once set cannot be changed.
     * ! fix: changed type to string
     * @export
     * @interface AspectTypeId
     */
    export type AspectTypeId = string;

    /**
     *
     * @export
     * @interface AspectTypeLinks
     */
    export interface AspectTypeLinks {
        /**
         *
         * @type {RelSelf}
         * @memberof AspectTypeLinks
         */
        self?: RelSelf;
    }

    /**
     *
     * @export
     * @interface AspectTypeListResource
     */
    export interface AspectTypeListResource {
        /**
         *
         * @type {AspectTypeListResourceEmbedded}
         * @memberof AspectTypeListResource
         */
        _embedded?: AspectTypeListResourceEmbedded;
        /**
         *
         * @type {Page}
         * @memberof AspectTypeListResource
         */
        page?: Page;
        /**
         *
         * @type {PagingLinks}
         * @memberof AspectTypeListResource
         */
        _links?: PagingLinks;
    }

    /**
     *
     * @export
     * @interface AspectTypeListResourceEmbedded
     */
    export interface AspectTypeListResourceEmbedded {
        /**
         *
         * @type {Array<AspectTypeResource>}
         * @memberof AspectTypeListResourceEmbedded
         */
        aspectTypes?: Array<AspectTypeResource>;
    }

    /**
     *
     * @export
     * @interface AspectTypeResource
     */
    export interface AspectTypeResource extends AspectType {
        /**
         *
         * @type {AspectTypeId}
         * @memberof AspectTypeResource
         */
        id?: AspectTypeId;
        /**
         *
         * @type {TenantId}
         * @memberof AspectTypeResource
         */
        tenantId?: TenantId;
        /**
         *
         * @type {ETag}
         * @memberof AspectTypeResource
         */
        etag?: ETag;
        /**
         *
         * @type {SharingResource}
         * @memberof AspectTypeResource
         */
        sharing?: SharingResource;
        /**
         *
         * @type {AspectTypeLinks}
         * @memberof AspectTypeResource
         */
        _links?: AspectTypeLinks;
    }

    /**
     * @export
     * @namespace AspectTypeResource
     */
    export namespace AspectTypeResource {}

    /**
     *
     * @export
     * @interface AspectVariable
     */
    export interface AspectVariable extends VariableDefinition {
        /**
         * Indicates whether the variable has quality code. Cannot be changed.
         * @type {boolean}
         * @memberof AspectVariable
         */
        qualityCode?: boolean;
    }

    /**
     * @export
     * @namespace AspectVariable
     */
    export namespace AspectVariable {}

    /**
     *
     * @export
     * @interface Asset
     */
    export interface Asset extends AssetUpdate {
        /**
         *
         * @type {AssetTypeId}
         * @memberof Asset
         */
        typeId?: AssetTypeId;
        /**
         *
         * @type {UniqueId}
         * @memberof Asset
         */
        parentId?: UniqueId;
        /**
         *
         * @type {Timezone}
         * @memberof Asset
         */
        timezone?: Timezone;
        /**
         *
         * @type {TwinType}
         * @memberof Asset
         */
        twinType?: TwinType;
    }

    /**
     *
     * @export
     * @interface AssetLinks
     */
    export interface AssetLinks {
        /**
         *
         * @type {AssetLinksSelf}
         * @memberof AssetLinks
         */
        self?: AssetLinksSelf;
        /**
         *
         * @type {AssetLinksParent}
         * @memberof AssetLinks
         */
        parent?: AssetLinksParent;
        /**
         *
         * @type {AssetLinksChildren}
         * @memberof AssetLinks
         */
        children?: AssetLinksChildren;
        /**
         *
         * @type {AssetLinksVariables}
         * @memberof AssetLinks
         */
        variables?: AssetLinksVariables;
        /**
         *
         * @type {AssetLinksAspects}
         * @memberof AssetLinks
         */
        aspects?: AssetLinksAspects;
        /**
         *
         * @type {AssetLinksT2Tenant}
         * @memberof AssetLinks
         */
        t2Tenant?: AssetLinksT2Tenant;
        /**
         *
         * @type {AssetLinksLocation}
         * @memberof AssetLinks
         */
        location?: AssetLinksLocation;
    }

    /**
     *
     * @export
     * @interface AssetLinksAspects
     */
    export interface AssetLinksAspects {
        /**
         * URL to get the aspect structure of the asset
         * @type {string}
         * @memberof AssetLinksAspects
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface AssetLinksChildren
     */
    export interface AssetLinksChildren {
        /**
         * URL to get the children of the asset
         * @type {string}
         * @memberof AssetLinksChildren
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface AssetLinksLocation
     */
    export interface AssetLinksLocation {
        /**
         * URL to update or delete the location of the asset
         * @type {string}
         * @memberof AssetLinksLocation
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface AssetLinksParent
     */
    export interface AssetLinksParent {
        /**
         * URL to get the parent of the asset
         * @type {string}
         * @memberof AssetLinksParent
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface AssetLinksSelf
     */
    export interface AssetLinksSelf {
        /**
         * URL to get the asset
         * @type {string}
         * @memberof AssetLinksSelf
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface AssetLinksT2Tenant
     */
    export interface AssetLinksT2Tenant {
        /**
         * URL to get the end-customer of the asset
         * @type {string}
         * @memberof AssetLinksT2Tenant
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface AssetLinksVariables
     */
    export interface AssetLinksVariables {
        /**
         * URL to get the variable definitions of the asset
         * @type {string}
         * @memberof AssetLinksVariables
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface AssetListResource
     */
    export interface AssetListResource {
        /**
         *
         * @type {AssetListResourceEmbedded}
         * @memberof AssetListResource
         */
        _embedded?: AssetListResourceEmbedded;
        /**
         *
         * @type {Page}
         * @memberof AssetListResource
         */
        page?: Page;
        /**
         *
         * @type {PagingLinks}
         * @memberof AssetListResource
         */
        _links?: PagingLinks;
    }

    /**
     *
     * @export
     * @interface AssetListResourceEmbedded
     */
    export interface AssetListResourceEmbedded {
        /**
         *
         * @type {Array<AssetResource>}
         * @memberof AssetListResourceEmbedded
         */
        assets?: Array<AssetResource>;
    }

    /**
     *
     * @export
     * @interface AssetMove
     */
    export interface AssetMove {
        /**
         *
         * @type {UniqueId}
         * @memberof AssetMove
         */
        newParentId: UniqueId;
    }

    /**
     *
     * @export
     * @interface AssetResource
     */
    export interface AssetResource extends Asset {
        /**
         *
         * @type {TenantId}
         * @memberof AssetResource
         */
        tenantId?: TenantId;
        /**
         * The id of the end-customer.
         * @type {string}
         * @memberof AssetResource
         */
        subTenant?: string;
        /**
         * The id of the end-customer. This field is DEPRECATED please use subTenant instead.
         * @type {string}
         * @memberof AssetResource
         */
        t2Tenant?: string;
        /**
         *
         * @type {UniqueId}
         * @memberof AssetResource
         */
        assetId?: UniqueId;
        /**
         *
         * @type {Array<FileAssignmentResource>}
         * @memberof AssetResource
         */
        fileAssignments?: Array<FileAssignmentResource>;
        /**
         *
         * @type {Array<LockResource>}
         * @memberof AssetResource
         */
        locks?: Array<LockResource>;
        /**
         *
         * @type {Date}
         * @memberof AssetResource
         */
        deleted?: Date;
        /**
         *
         * @type {string}
         * @memberof AssetResource
         */
        twinType?: TwinType;
        /**
         *
         * @type {SharingResource}
         * @memberof AssetResource
         */
        sharing?: SharingResource;
        /**
         *
         * @type {ETag}
         * @memberof AssetResource
         */
        etag?: ETag;
        /**
         *
         * @type {AssetLinks}
         * @memberof AssetResource
         */
        _links?: AssetLinks;
    }

    // ! fix 11/21/2020 : removed embedded TwinTypeEnum

    /**
     *
     * @export
     * @interface AssetResourceWithHierarchyPath
     */
    export interface AssetResourceWithHierarchyPath extends AssetResource {
        /**
         *
         * @type {Array<AssetResourceWithHierarchyPathHierarchyPath>}
         * @memberof AssetResourceWithHierarchyPath
         */
        hierarchyPath?: Array<AssetResourceWithHierarchyPathHierarchyPath>;
    }

    /**
     * @export
     * @namespace AssetResourceWithHierarchyPath
     */
    export namespace AssetResourceWithHierarchyPath {}

    /**
     *
     * @export
     * @interface AssetResourceWithHierarchyPathHierarchyPath
     */
    export interface AssetResourceWithHierarchyPathHierarchyPath {
        /**
         *
         * @type {UniqueId}
         * @memberof AssetResourceWithHierarchyPathHierarchyPath
         */
        assetId?: UniqueId;
        /**
         * Name of the asset
         * @type {string}
         * @memberof AssetResourceWithHierarchyPathHierarchyPath
         */
        name?: string;
    }

    /**
     *
     * @export
     * @interface AssetType
     */
    export interface AssetType extends AssetTypeBase {
        /**
         * Aspects of the asset-type. Once added aspects cannot be removed.
         * @type {Array<AssetTypeAspects>}
         * @memberof AssetType
         */
        aspects?: Array<AssetTypeAspects>;
        /**
         * Direct variables of the asset-type. Variable names has to be unique inside the whole type-family (ancestors and descendants). Once added variables cannot be changed or removed.
         * @type {Array<VariableDefinition>}
         * @memberof AssetType
         */
        variables?: Array<VariableDefinition>;
        /**
         *
         * @type {Array<FileAssignment>}
         * @memberof AssetType
         */
        fileAssignments?: Array<FileAssignment>;
    }

    /**
     * @export
     * @namespace AssetType
     */
    export namespace AssetType {}

    /**
     *
     * @export
     * @interface AssetTypeAspects
     */
    export interface AssetTypeAspects {
        /**
         * Name of the aspect. It has to be unique inside the type-family (ancestors and descendants).Cannot be changed. Reserved words (id, name, description, tenant, etag, scope, properties, propertySets, extends, variables, aspects, parentTypeId) cannot be used as aspect names.
         * @type {string}
         * @memberof AssetTypeAspects
         */
        name?: string;
        /**
         *
         * @type {AspectTypeId}
         * @memberof AssetTypeAspects
         */
        aspectTypeId?: AspectTypeId;
    }

    /**
     *
     * @export
     * @interface AssetTypeBase
     */
    export interface AssetTypeBase {
        /**
         * The type's name.
         * @type {string}
         * @memberof AssetTypeBase
         */
        name: string;
        /**
         * description
         * @type {string}
         * @memberof AssetTypeBase
         */
        description?: string;
        /**
         *
         * @type {AssetTypeId}
         * @memberof AssetTypeBase
         */
        parentTypeId?: AssetTypeId;
        /**
         * If instances can be created from this type. A non-instantiable type could be changed to be instantiable but not the other way around.
         * @type {boolean}
         * @memberof AssetTypeBase
         */
        instantiable?: boolean;
        /**
         * Visibility of the assettype. Setting this property to public makes it available to other tenants. Private types are only visible to the user's own tenant. Currently only private types could be created.
         * @type {string}
         * @memberof AssetTypeBase
         */
        scope?: AssetTypeBase.ScopeEnum;
    }

    /**
     * @export
     * @namespace AssetTypeBase
     */
    export namespace AssetTypeBase {
        /**
         * @export
         * @enum {string}
         */
        export enum ScopeEnum {
            Public = "public",
            Private = "private",
        }
    }

    /**
     * The asset type's id is a unique identifier. The id's length must be between 1 and 128 characters and matches the following symbols \"A-Z\", \"a-z\", \"0-9\", \"_\" and \".\" beginning with the tenant prefix what has a maximum of 8 characters. (e.g . ten_pref.type_id). Once set cannot be changed.
     * ! fix: changed type to string
     * @export
     * @interface AssetTypeId
     */
    export type AssetTypeId = string;

    /**
     *
     * @export
     * @interface AssetTypeLinks
     */
    export interface AssetTypeLinks {
        /**
         *
         * @type {RelSelf}
         * @memberof AssetTypeLinks
         */
        self?: RelSelf;
        /**
         *
         * @type {AssetTypeLinksParent}
         * @memberof AssetTypeLinks
         */
        parent?: AssetTypeLinksParent;
    }

    /**
     *
     * @export
     * @interface AssetTypeLinksParent
     */
    export interface AssetTypeLinksParent {
        /**
         * Link to the parent asset type
         * @type {string}
         * @memberof AssetTypeLinksParent
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface AssetTypeListResource
     */
    export interface AssetTypeListResource {
        /**
         *
         * @type {AssetTypeListResourceEmbedded}
         * @memberof AssetTypeListResource
         */
        _embedded?: AssetTypeListResourceEmbedded;
        /**
         *
         * @type {Page}
         * @memberof AssetTypeListResource
         */
        page?: Page;
        /**
         *
         * @type {PagingLinks}
         * @memberof AssetTypeListResource
         */
        _links?: PagingLinks;
    }

    /**
     *
     * @export
     * @interface AssetTypeListResourceEmbedded
     */
    export interface AssetTypeListResourceEmbedded {
        /**
         *
         * @type {Array<AssetTypeResource>}
         * @memberof AssetTypeListResourceEmbedded
         */
        assetTypes?: Array<AssetTypeResource>;
    }

    /**
     *
     * @export
     * @interface AssetTypeResource
     */
    export interface AssetTypeResource extends AssetTypeBase {
        /**
         *
         * @type {AssetTypeId}
         * @memberof AssetTypeResource
         */
        id?: AssetTypeId;
        /**
         *
         * @type {TenantId}
         * @memberof AssetTypeResource
         */
        tenantId?: TenantId;
        /**
         *
         * @type {ETag}
         * @memberof AssetTypeResource
         */
        etag?: ETag;
        /**
         *
         * @type {Array<AssetTypeResourceAspects>}
         * @memberof AssetTypeResource
         */
        aspects?: Array<AssetTypeResourceAspects>;
        /**
         * Direct variables of the asset-type. Variable names has to be unique inside the whole type-family (ancestors and descendants). Once added variables cannot be changed or removed.
         * @type {Array<VariableDefinitionResource>}
         * @memberof AssetTypeResource
         */
        variables?: Array<VariableDefinitionResource>;
        /**
         *
         * @type {Array<FileAssignmentResource>}
         * @memberof AssetTypeResource
         */
        fileAssignments?: Array<FileAssignmentResource>;
        /**
         *
         * @type {SharingResource}
         * @memberof AssetTypeResource
         */
        sharing?: SharingResource;
        /**
         *
         * @type {AssetTypeLinks}
         * @memberof AssetTypeResource
         */
        _links?: AssetTypeLinks;
    }

    /**
     * @export
     * @namespace AssetTypeResource
     */
    export namespace AssetTypeResource {}

    /**
     * @export
     * @interface AssetTypeResourceAspectType
     */
    export interface AssetTypeResourceAspectType extends AspectTypeResource {}

    /**
     *
     * @export
     * @interface AssetTypeResourceAspects
     */
    export interface AssetTypeResourceAspects {
        /**
         * Name of the aspect type, it must be unique for the asset type.
         * @type {string}
         * @memberof AssetTypeResourceAspects
         */
        name?: string;
        /**
         *
         * @type {AssetTypeResourceAspectType}
         * @memberof AssetTypeResourceAspects
         */
        aspectType?: AssetTypeResourceAspectType;
        /**
         *
         * @type {AssetTypeResourceLinks}
         * @memberof AssetTypeResourceAspects
         */
        _links?: AssetTypeResourceLinks;
    }

    /**
     *
     * @export
     * @interface AssetTypeResourceLinks
     */
    export interface AssetTypeResourceLinks {
        /**
         *
         * @type {AssetTypeResourceLinksOrigin}
         * @memberof AssetTypeResourceLinks
         */
        origin?: AssetTypeResourceLinksOrigin;
    }

    /**
     *
     * @export
     * @interface AssetTypeResourceLinksOrigin
     */
    export interface AssetTypeResourceLinksOrigin {
        /**
         * Link to the asset type defining the aspect. *Only visible if aspect is inherited.*
         * @type {string}
         * @memberof AssetTypeResourceLinksOrigin
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface AssetUpdate
     */
    export interface AssetUpdate {
        /**
         * Name of the asset
         * @type {string}
         * @memberof AssetUpdate
         */
        name: string;
        /**
         * The id given by the user
         * @type {string}
         * @memberof AssetUpdate
         */
        externalId?: string;
        /**
         * The description of the asset
         * @type {string}
         * @memberof AssetUpdate
         */
        description?: string;
        /**
         *
         * @type {Location}
         * @memberof AssetUpdate
         */
        location?: Location;
        /**
         *
         * @type {Array<Variable>}
         * @memberof AssetUpdate
         */
        variables?: Array<Variable>;
        /**
         *
         * @type {Array<Aspect>}
         * @memberof AssetUpdate
         */
        aspects?: Array<Aspect>;
        /**
         *
         * @type {Array<FileAssignment>}
         * @memberof AssetUpdate
         */
        fileAssignments?: Array<FileAssignment>;
    }

    /**
     *
     * @export
     * @interface BillboardResource
     */
    export interface BillboardResource {
        /**
         *
         * @type {BillboardResourceSelf}
         * @memberof BillboardResource
         */
        self?: BillboardResourceSelf;
        /**
         *
         * @type {BillboardResourceAspectTypes}
         * @memberof BillboardResource
         */
        aspectTypes?: BillboardResourceAspectTypes;
        /**
         *
         * @type {BillboardResourceAssetTypes}
         * @memberof BillboardResource
         */
        assetTypes?: BillboardResourceAssetTypes;
        /**
         *
         * @type {BillboardResourceAssets}
         * @memberof BillboardResource
         */
        assets?: BillboardResourceAssets;
        /**
         *
         * @type {BillboardResourceFiles}
         * @memberof BillboardResource
         */
        files?: BillboardResourceFiles;
    }

    /**
     *
     * @export
     * @interface BillboardResourceAspectTypes
     */
    export interface BillboardResourceAspectTypes {
        /**
         * Link to aspect-types resource
         * @type {string}
         * @memberof BillboardResourceAspectTypes
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface BillboardResourceAssetTypes
     */
    export interface BillboardResourceAssetTypes {
        /**
         * Link to asset-types resource
         * @type {string}
         * @memberof BillboardResourceAssetTypes
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface BillboardResourceAssets
     */
    export interface BillboardResourceAssets {
        /**
         * Link to assets resource
         * @type {string}
         * @memberof BillboardResourceAssets
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface BillboardResourceFiles
     */
    export interface BillboardResourceFiles {
        /**
         * Link to files resource
         * @type {string}
         * @memberof BillboardResourceFiles
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface BillboardResourceSelf
     */
    export interface BillboardResourceSelf {
        /**
         * Link to the billboard url
         * @type {string}
         * @memberof BillboardResourceSelf
         */
        href?: string;
    }

    /**
     * ! fix: changed type to string
     *
     * incremental counter for optimistic locking
     * @export
     * @interface ETag
     */
    export type ETag = string;

    /**
     *
     * @export
     * @interface Errors
     */
    export interface Errors {
        /**
         *
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
         *
         * @type {string}
         * @memberof ErrorsErrors
         */
        code?: string;
        /**
         *
         * @type {string}
         * @memberof ErrorsErrors
         */
        errorcode?: string;
        /**
         *
         * @type {string}
         * @memberof ErrorsErrors
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof ErrorsErrors
         */
        message?: string;
    }

    /**
     *
     * @export
     * @interface FileAssignment
     */
    export interface FileAssignment {
        /**
         * Keyword for the file to be assigned to an asset.
         * @type {string}
         * @memberof FileAssignment
         */
        key?: string;
        /**
         * The id of the file to be assigned
         * @type {string}
         * @memberof FileAssignment
         */
        fileId?: string;
    }

    /**
     *
     * @export
     * @interface FileAssignmentLinks
     */
    export interface FileAssignmentLinks {
        /**
         *
         * @type {FileAssignmentLinksDownload}
         * @memberof FileAssignmentLinks
         */
        download?: FileAssignmentLinksDownload;
        /**
         *
         * @type {FileAssignmentLinksMetadata}
         * @memberof FileAssignmentLinks
         */
        metadata?: FileAssignmentLinksMetadata;
        /**
         *
         * @type {FileAssignmentLinksOrigin}
         * @memberof FileAssignmentLinks
         */
        origin?: FileAssignmentLinksOrigin;
    }

    /**
     *
     * @export
     * @interface FileAssignmentLinksDownload
     */
    export interface FileAssignmentLinksDownload {
        /**
         * Link to download the file
         * @type {string}
         * @memberof FileAssignmentLinksDownload
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface FileAssignmentLinksMetadata
     */
    export interface FileAssignmentLinksMetadata {
        /**
         * Link to get metadata of the file
         * @type {string}
         * @memberof FileAssignmentLinksMetadata
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface FileAssignmentLinksOrigin
     */
    export interface FileAssignmentLinksOrigin {
        /**
         * Link to access the file assignment. Only visible if assignment is inherited
         * @type {string}
         * @memberof FileAssignmentLinksOrigin
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface FileAssignmentResource
     */
    export interface FileAssignmentResource extends FileAssignment {
        /**
         *
         * @type {FileAssignmentLinks}
         * @memberof FileAssignmentResource
         */
        _links?: FileAssignmentLinks;
    }

    /**
     *
     * @export
     * @interface FileMetadataListResource
     */
    export interface FileMetadataListResource {
        /**
         *
         * @type {FileMetadataListResourceEmbedded}
         * @memberof FileMetadataListResource
         */
        _embedded?: FileMetadataListResourceEmbedded;
        /**
         *
         * @type {Page}
         * @memberof FileMetadataListResource
         */
        page?: Page;
        /**
         *
         * @type {PagingLinks}
         * @memberof FileMetadataListResource
         */
        _links?: PagingLinks;
    }

    /**
     *
     * @export
     * @interface FileMetadataListResourceEmbedded
     */
    export interface FileMetadataListResourceEmbedded {
        /**
         *
         * @type {Array<FileMetadataResource>}
         * @memberof FileMetadataListResourceEmbedded
         */
        files?: Array<FileMetadataResource>;
    }

    /**
     *
     * @export
     * @interface FileMetadataResource
     */
    export interface FileMetadataResource {
        /**
         *
         * @type {UniqueId}
         * @memberof FileMetadataResource
         */
        id?: UniqueId;
        /**
         * File name given by the user
         * @type {string}
         * @memberof FileMetadataResource
         */
        name?: string;
        /**
         * Original filename of the file
         * @type {string}
         * @memberof FileMetadataResource
         */
        originalFileName?: string;
        /**
         * File description
         * @type {string}
         * @memberof FileMetadataResource
         */
        description?: string;
        /**
         *
         * @type {TenantId}
         * @memberof FileMetadataResource
         */
        tenantId?: TenantId;
        /**
         * The id of the end-customer
         * @type {string}
         * @memberof FileMetadataResource
         */
        subTenant?: string;
        /**
         * The time of the file upload
         * @type {Date}
         * @memberof FileMetadataResource
         */
        uploaded?: Date;
        /**
         * The time of the latest modification of the file
         * @type {Date}
         * @memberof FileMetadataResource
         */
        lastModified?: Date;
        /**
         * Is the file used in any file assignment
         * @type {boolean}
         * @memberof FileMetadataResource
         */
        isAssigned?: boolean;
        /**
         * The visibility of the file. PRIVATE hides files between subTenants and the t1Tenant's files from the subTenants. PUBLIC is visible for every user of the tenant.
         * @type {string}
         * @memberof FileMetadataResource
         */
        scope?: FileMetadataResource.ScopeEnum;
        /**
         *
         * @type {ETag}
         * @memberof FileMetadataResource
         */
        etag?: ETag;
        /**
         *
         * @type {FileMetadataResourceLinks}
         * @memberof FileMetadataResource
         */
        _links?: FileMetadataResourceLinks;
    }

    /**
     * @export
     * @namespace FileMetadataResource
     */
    export namespace FileMetadataResource {
        /**
         * @export
         * @enum {string}
         */
        export enum ScopeEnum {
            Public = "public",
            Private = "private",
        }
    }

    /**
     *
     * @export
     * @interface FileMetadataResourceLinks
     */
    export interface FileMetadataResourceLinks {
        /**
         *
         * @type {RelSelf}
         * @memberof FileMetadataResourceLinks
         */
        self?: RelSelf;
        /**
         *
         * @type {LinkForDownloadingTheFile}
         * @memberof FileMetadataResourceLinks
         */
        download?: LinkForDownloadingTheFile;
    }

    /**
     *
     * @export
     * @interface KeyedFileAssignment
     */
    export interface KeyedFileAssignment {
        /**
         * The id of the file to be assigned
         * @type {string}
         * @memberof KeyedFileAssignment
         */
        fileId?: string;
    }

    /**
     *
     * @export
     * @interface LinkForDownloadingTheFile
     */
    export interface LinkForDownloadingTheFile {
        /**
         *
         * @type {string}
         * @memberof LinkForDownloadingTheFile
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface Location
     */
    export interface Location {
        /**
         *
         * @type {string}
         * @memberof Location
         */
        country?: string;
        /**
         * County or other region code or name
         * @type {string}
         * @memberof Location
         */
        region?: string;
        /**
         *
         * @type {string}
         * @memberof Location
         */
        locality?: string;
        /**
         *
         * @type {string}
         * @memberof Location
         */
        streetAddress?: string;
        /**
         *
         * @type {string}
         * @memberof Location
         */
        postalCode?: string;
        /**
         * The longitude part of the geographic coordinates
         * @type {number}
         * @memberof Location
         */
        longitude?: number;
        /**
         * The latitude part of the geographic coordinates
         * @type {number}
         * @memberof Location
         */
        latitude?: number;
    }

    /**
     *
     * @export
     * @interface LockResource
     */
    export interface LockResource {
        /**
         *
         * @type {UniqueId}
         * @memberof LockResource
         */
        id?: UniqueId;
        /**
         * Service creating the lock
         * @type {string}
         * @memberof LockResource
         */
        service?: string;
        /**
         * Reason of lock
         * @type {string}
         * @memberof LockResource
         */
        reason?: string;
        /**
         * Code of the reason
         * @type {string}
         * @memberof LockResource
         */
        reasonCode?: string;
        /**
         *
         * @type {LockResourceLinks}
         * @memberof LockResource
         */
        _links?: LockResourceLinks;
    }

    /**
     *
     * @export
     * @interface LockResourceLinks
     */
    export interface LockResourceLinks {
        /**
         *
         * @type {RelSelf}
         * @memberof LockResourceLinks
         */
        self?: RelSelf;
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
     * @interface PagingLinks
     */
    export interface PagingLinks {
        /**
         *
         * @type {RelSelf}
         * @memberof PagingLinks
         */
        self?: RelSelf;
        /**
         *
         * @type {LinkForDownloadingTheFile}
         * @memberof PagingLinks
         */
        first?: LinkForDownloadingTheFile;
        /**
         *
         * @type {LinkForDownloadingTheFile}
         * @memberof PagingLinks
         */
        prev?: LinkForDownloadingTheFile;
        /**
         *
         * @type {LinkForDownloadingTheFile}
         * @memberof PagingLinks
         */
        next?: LinkForDownloadingTheFile;
        /**
         *
         * @type {LinkForDownloadingTheFile}
         * @memberof PagingLinks
         */
        last?: LinkForDownloadingTheFile;
    }

    /**
     *
     * @export
     * @interface RelSelf
     */
    export interface RelSelf {
        /**
         *
         * @type {string}
         * @memberof RelSelf
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface RootAssetResource
     */
    export interface RootAssetResource extends AssetResource {
        /**
         * Hieararchy path is empty for the root asset
         * @type {Array<string>}
         * @memberof RootAssetResource
         */
        hierarchyPath?: Array<string>;
    }

    /**
     * @export
     * @namespace RootAssetResource
     */
    export namespace RootAssetResource {}

    /**
     * Contains sharing information.
     * @export
     * @interface SharingResource
     */
    export interface SharingResource {
        /**
         * List of sharing modes applicable for this resource. The currently supported modes are SHARER and RECEIVER.  SHARER means this resource is shared by my tenant. RECEIVER means this resource is shared with my tenant. An empty array means this resource is not shared. New modes might be introduced later and clients must expect additional items to be contained in the array.
         * @type {Array<string>}
         * @memberof SharingResource
         */
        modes?: Array<SharingResource.ModesEnum>;
    }

    /**
     * @export
     * @namespace SharingResource
     */
    export namespace SharingResource {
        /**
         * @export
         * @enum {string}
         */
        export enum ModesEnum {
            SHARER = "SHARER",
            RECEIVER = "RECEIVER",
        }
    }

    /**
     * ! fix: changed type to string
     *
     * The unique identifier of the tenant
     * @export
     * @interface TenantId
     */
    export type TenantId = string;

    /**
     * ! fix: changed type to string
     *
     * The timezone to be used for timeseries aggregation. By default it is inherited from the tenant's defaultTimezone, but can be overwritten only during asset creation. The timezone value should be set to a Java time zone ID such as \"America/LosAngeles\" or \"Etc/GMT+2\". Time zones that 15 or 45 minutes off a UTC hour are not supported, such as Nepal standard time (UTC+05:45). Time zones that are 30 minutes off a UTC hour are supported, such as India (UTC+05:30). Once an asset is created with a specific timezone, it cannot be changed later.
     * @export
     * @interface Timezone
     */
    export type Timezone = string;

    /**
     * Indicates that the asset is a real asset (performance) or for simulation. If omitted on creation then it defaults to performance. Setting the twinType to simulation allows high resolution timestamps (microsecond precision).
     * @export
     * @enum {string}
     */
    export enum TwinType {
        Performance = "performance",
        Simulation = "simulation",
    }

    /**
     *
     * ! fix: changed type to string
     * @export
     * @interface UniqueId
     */
    export type UniqueId = string;

    /**
     *
     * @export
     * @interface Variable
     */
    export interface Variable {
        /**
         *
         * @type {string}
         * @memberof Variable
         */
        name?: string;
        /**
         *
         * @type {string}
         * @memberof Variable
         */
        value?: string;
    }

    /**
     *
     * @export
     * @interface VariableDefinition
     */
    export interface VariableDefinition extends VariableUpdate {
        /**
         * Data type of the variable. BIG_STRING could only be used by variables in dynamic aspect-types. Cannot be changed.
         * @type {string}
         * @memberof VariableDefinition
         */
        dataType?: VariableDefinition.DataTypeEnum;
        /**
         * Indicates whether sorting and filtering is allowed on this variable. Only usable for static properties. Cannot be changed.
         * @type {boolean}
         * @memberof VariableDefinition
         */
        searchable?: boolean;
    }

    /**
     * @export
     * @namespace VariableDefinition
     */
    export namespace VariableDefinition {
        /**
         * @export
         * @enum {string}
         */
        export enum DataTypeEnum {
            BOOLEAN = "BOOLEAN",
            INT = "INT",
            LONG = "LONG",
            DOUBLE = "DOUBLE",
            STRING = "STRING",
            TIMESTAMP = "TIMESTAMP",
            BIGSTRING = "BIG_STRING",
        }
    }

    /**
     *
     * @export
     * @interface VariableDefinitionResource
     */
    export interface VariableDefinitionResource extends VariableDefinition {
        /**
         *
         * @type {VariableDefinitionResourceLinks}
         * @memberof VariableDefinitionResource
         */
        _links?: VariableDefinitionResourceLinks;
    }

    /**
     * @export
     * @namespace VariableDefinitionResource
     */
    export namespace VariableDefinitionResource {}

    /**
     *
     * @export
     * @interface VariableDefinitionResourceLinks
     */
    export interface VariableDefinitionResourceLinks {
        /**
         *
         * @type {VariableDefinitionResourceLinksOrigin}
         * @memberof VariableDefinitionResourceLinks
         */
        origin?: VariableDefinitionResourceLinksOrigin;
    }

    /**
     * Link to the asset type defining the variable. *Only visible if variable is inherited.*
     * @export
     * @interface VariableDefinitionResourceLinksOrigin
     */
    export interface VariableDefinitionResourceLinksOrigin {
        /**
         *
         * @type {string}
         * @memberof VariableDefinitionResourceLinksOrigin
         */
        href?: string;
    }

    /**
     *
     * @export
     * @interface VariableListResource
     */
    export interface VariableListResource {
        /**
         *
         * @type {VariableListResourceEmbedded}
         * @memberof VariableListResource
         */
        _embedded?: VariableListResourceEmbedded;
        /**
         *
         * @type {Page}
         * @memberof VariableListResource
         */
        page?: Page;
        /**
         *
         * @type {PagingLinks}
         * @memberof VariableListResource
         */
        _links?: PagingLinks;
    }

    /**
     *
     * @export
     * @interface VariableListResourceEmbedded
     */
    export interface VariableListResourceEmbedded {
        /**
         *
         * @type {Array<VariableDefinition>}
         * @memberof VariableListResourceEmbedded
         */
        variables?: Array<VariableDefinition>;
    }

    /**
     *
     * @export
     * @interface VariableUpdate
     */
    export interface VariableUpdate {
        /**
         * Name of the variable. Once set cannot be changed. Reserved words (id, name, description, tenant, etag, scope, properties, propertySets, extends, variables, aspects, parentTypeId) cannot be used as variable names.
         * @type {string}
         * @memberof VariableUpdate
         */
        name?: string;
        /**
         * Unit of measurement. Cannot be changed.
         * @type {string}
         * @memberof VariableUpdate
         */
        unit?: string;
        /**
         * The max length of the variable's value. The length field is only used for variables of string or big_string dataType. Max length for string is 255 and max length for big_string 100000. Cannot be changed.
         * @type {number}
         * @memberof VariableUpdate
         */
        length?: number;
        /**
         * The default value of the variable. It must be compatible with the dataType! The default value will be inherited by the asset type's child types and by the asset instantiating it. It can be defined in aspect types and asset types.
         * @type {string}
         * @memberof VariableUpdate
         */
        defaultValue?: string;
    }

    /**
     *
     * @export
     * @interface VariableUpdateMap
     */
    export interface VariableUpdateMap {
        [key: string]: VariableUpdate;
    }
}
