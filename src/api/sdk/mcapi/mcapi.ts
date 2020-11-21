import { DataPoint, DataSource, DataSourceConfiguration, Mapping } from "../../..";
import { throwError, toQueryString } from "../../utils";
import { AssetManagementModels } from "../asset/asset-models";
import { SdkClient } from "../common/sdk-client";
import { MindConnectApiModels } from "./mcapi-models";

/**
 * MindConnect API Client
 *
 * @export
 * @class MindConnectApiClient
 * @extends {SdkClient}
 */
export class MindConnectApiClient extends SdkClient {
    private _baseUrl: string = "/api/mindconnect/v3";

    /**
     * * diagnostic
     *
     * * Register agent for diagnostic activation
     *
     * @param {string} agentId
     * @returns {Promise<MindConnectApiModels.DiagnosticActivation>}
     *
     * @memberOf MindConnectApiClient
     */
    public async PostDiagnosticActivation(agentId: string): Promise<MindConnectApiModels.DiagnosticActivation> {
        const body = { agentId: agentId };

        return (await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/diagnosticActivations`,
            body: body,
            message: "PostDiagnosticActivation",
        })) as MindConnectApiModels.DiagnosticActivation;
    }

    /**
     * * diagnostic
     *
     * Get the list of diagnostic activations
     *
     * @param {{
     *         size?: number;
     *         page?: number;
     *         sort?: string;
     *     }} [optional]
     * @returns {Promise<MindConnectApiModels.PagedDiagnosticActivation>}
     *
     * @memberOf MindConnectApiClient
     */
    public async GetDiagnosticActivations(optional?: {
        size?: number;
        page?: number;
        sort?: string;
    }): Promise<MindConnectApiModels.PagedDiagnosticActivation> {
        const qs = toQueryString(optional);

        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/diagnosticActivations?${qs}`,
            message: "GetDiagnosticActivations",
        })) as MindConnectApiModels.PagedDiagnosticActivation;
    }

    /**
     *
     * *diagnostic
     *
     * Put diagnostic api client
     *
     * @param {string} id
     * @param {MindConnectApiModels.DiagnosticActivationStatus} diagnosticStatus
     * @returns {Promise<MindConnectApiModels.DiagnosticActivation>}
     *
     * @memberOf MindConnectApiClient
     */
    public async PutDiagnosticActivation(
        id: string,
        diagnosticStatus: MindConnectApiModels.DiagnosticActivationStatus
    ): Promise<MindConnectApiModels.DiagnosticActivation> {
        const body = diagnosticStatus;

        return (await this.HttpAction({
            verb: "PUT",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/diagnosticActivations/${id}`,
            body: body,
            message: "PutDiagnosticActivation",
        })) as MindConnectApiModels.DiagnosticActivation;
    }

    /**
     * * diagnostic
     *
     * Get current diagnostic activation
     *
     * @param {string} id
     * @returns {Promise<MindConnectApiModels.DiagnosticActivation>}
     *
     * @memberOf MindConnectApiClient
     */
    public async GetDiagnosticActivation(id: string): Promise<MindConnectApiModels.DiagnosticActivation> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/diagnosticActivations/${id}`,
            message: "GetDiagnosticActivation",
        })) as MindConnectApiModels.DiagnosticActivation;
    }

    /**
     * *diagnostic
     *
     * Delete diagnostic activation.
     *
     * @param {string} id
     * @returns
     *
     * @memberOf MindConnectApiClient
     */
    public async DeleteDiagnosticActivation(id: string) {
        return await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/diagnosticActivations/${id}`,
            message: "DeleteDiagnosticActivation",
            noResponse: true,
        });
    }

    /**
     * *diagnostic
     *
     * Get messages
     *
     * @param {string} id
     * @param {{ filter?: string; size?: number; page?: number; sort?: string }} [optional]
     * @returns {Promise<MindConnectApiModels.PagedDiagnosticInformationMessages>}
     *
     * @memberOf MindConnectApiClient
     */
    public async GetDiagnosticActivationMessages(
        id: string,
        optional?: { filter?: string; size?: number; page?: number; sort?: string }
    ): Promise<MindConnectApiModels.PagedDiagnosticInformationMessages> {
        const qs = toQueryString(optional);
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/diagnosticActivations/${id}/messages?${qs}`,
            message: "GetDiagnosticActivationMessages",
        })) as MindConnectApiModels.PagedDiagnosticInformationMessages;
    }

    /**
     * * diagnostic
     *
     * @deprecated please use GetDiagnosticActivationMessages
     *
     * Get list of diagnostic informations
     *
     * @param {{
     *         filter?: string;
     *         size?: number;
     *         page?: number;
     *         sort?: string;
     *     }} [optional]
     * @returns {Promise<MindConnectApiModels.PagedDiagnosticInformationMessages>}
     *
     * @memberOf MindConnectApiClient
     */
    public async GetDiagnosticInformation(optional?: {
        filter?: string;
        size?: number;
        page?: number;
        sort?: string;
    }): Promise<MindConnectApiModels.PagedDiagnosticInformationMessages> {
        const qs = toQueryString(optional);
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/diagnosticInformation?${qs}`,
            message: "GetDiagnosticInformation",
        })) as MindConnectApiModels.PagedDiagnosticInformationMessages;
    }

    /**
     *
     * * diagnostic
     *
     * Deletes all diagnostic activations
     *
     *
     * @memberOf MindConnectApiClient
     */
    public async DeleteAllDiagnosticActivations() {
        const activations = await this.GetDiagnosticActivations();
        for (const activation of activations.content) {
            if (activation.id) await this.DeleteDiagnosticActivation(activation.id);
        }
    }

    /**
     * * diagnostic
     *
     * Get all diagnostic information paged (for the CLI)
     *
     * @param {string} agentId
     * @param {(x: MindConnectApiModels.DiagnosticInformation[], ...args: any[]) => any} [callback]
     * @param {*} [callbackOptions]
     * @param {boolean} [skipToLast=true]
     * @returns
     *
     * @memberOf MindConnectApiClient
     */
    public async GetAllDiagnosticInformation(
        agentId: string,
        callback?: (x: MindConnectApiModels.DiagnosticInformation[], ...args: any[]) => any,
        callbackOptions?: any,
        skipToLast: boolean = true
    ) {
        let pagedInformation: MindConnectApiModels.PagedDiagnosticInformation;
        let page = 0;
        do {
            pagedInformation = await this.GetDiagnosticActivationMessages(agentId, { page: page++ });
            if (skipToLast) {
                page = pagedInformation.totalPages - 2;
                if (page < 0) page = 0;
                skipToLast = false;
                if (!pagedInformation.last) {
                    continue;
                }
            }
            if (callback) {
                callback(pagedInformation.content, callbackOptions);
            }
        } while (!pagedInformation.last);
        return pagedInformation;
    }

    /**
     * * mappings
     *
     * Create single mapping
     *
     * @param {MindConnectApiModels.Mapping} mapping
     * @returns
     *
     * @memberOf MindConnectApiClient
     */
    public async PostDataPointMapping(mapping: MindConnectApiModels.Mapping, optional?: { ignoreCodes: number[] }) {
        const body = mapping;
        return await this.HttpAction({
            verb: "POST",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataPointMappings`,
            body: body,
            message: "PostDataPointMapping",
            noResponse: true,
            ignoreCodes: optional?.ignoreCodes,
        });
    }

    /**
     *
     * * mappings
     *
     * Get mappings
     *
     * @param {{
     *         filter?: string;
     *         size?: number;
     *         page?: number;
     *         sort?: string;
     *     }} [optional]
     * @returns {Promise<MindConnectApiModels.PagedMapping>}
     *
     * @memberOf MindConnectApiClient
     */
    public async GetDataPointMappings(optional?: {
        filter?: string;
        size?: number;
        page?: number;
        sort?: string;
    }): Promise<MindConnectApiModels.PagedMapping> {
        const qs = toQueryString(optional);
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataPointMappings?${qs}`,
            message: "GetDataPointMappings",
        })) as MindConnectApiModels.PagedMapping;
    }

    /**
     * * mappings
     *
     * Get a mapping by id
     *
     * @param {string} id
     * @returns {Promise<MindConnectApiModels.Mapping>}
     *
     * @memberOf MindConnectApiClient
     */
    public async GetDataPointMapping(id: string): Promise<MindConnectApiModels.Mapping> {
        return (await this.HttpAction({
            verb: "GET",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataPointMappings/${id}`,
            message: "GetDataPointMapping",
        })) as MindConnectApiModels.Mapping;
    }

    /**
     *
     * Delete a mapping
     *
     * @param {string} id
     * @returns
     *
     * @memberOf MindConnectApiClient
     */
    public async DeleteDataMapping(id: string, optional?: { ignoreCodes: number[] }) {
        return await this.HttpAction({
            verb: "DELETE",
            gateway: this.GetGateway(),
            authorization: await this.GetToken(),
            baseUrl: `${this._baseUrl}/dataPointMappings/${id}`,
            message: "DeleteDataMapping",
            noResponse: true,
            ignoreCodes: optional?.ignoreCodes,
        });
    }

    /**
     * Generates a Data Source Configuration for specified Asset Type
     *
     * you still have to generate the mappings (or use ConfigureAgentForAssetId method)
     *
     *
     * @param {AssetManagementModels.AssetTypeResource} assetType
     * @param {("NUMERICAL" | "DESCRIPTIVE")} [mode="DESCRIPTIVE"]
     * * NUMERICAL MODE will use names like CF0001 for configurationId , DS0001,DS0002,DS0003... for data source ids and DP0001, DP0002... for dataPointIds
     * * DESCRIPTIVE MODE will use names like CF-assetName for configurationId , DS-aspectName... for data source ids and DP-variableName for data PointIds (default)
     * @returns {Promise<DataSourceConfiguration>}
     *
     * @memberOf MindconnectApiClient
     */
    public GenerateDataSourceConfiguration(
        assetType: AssetManagementModels.AssetTypeResource,
        mode: "NUMERICAL" | "DESCRIPTIVE" = "DESCRIPTIVE"
    ): DataSourceConfiguration {
        let dataSourceConfiguration: DataSourceConfiguration = {
            configurationId: mode === "NUMERICAL" ? "CF0001" : `CF-${assetType!.id!.toString().substr(0, 30)}`,
            dataSources: [],
        };

        const dynamicAspects =
            assetType.aspects?.filter(
                (x) => x.aspectType!.category === AssetManagementModels.AspectType.CategoryEnum.Dynamic
            ) || [];

        let ds = 0,
            dp = 0;

        dynamicAspects!.forEach((aspect) => {
            const aspectType = (aspect.aspectType as unknown) as AssetManagementModels.AspectTypeResource;

            const dataSource: DataSource = {
                name:
                    mode === "NUMERICAL"
                        ? `DS${(++ds).toString().padStart(5, "0")}`
                        : `DS-${aspect.name!.substr(0, 61)}`,
                dataPoints: [],
                customData: {
                    aspect: aspect.name!,
                },
            };

            aspectType.variables.forEach((variable) => {
                dataSource.dataPoints.push({
                    id:
                        mode === "NUMERICAL"
                            ? `DP${(++dp).toString().padStart(5, "0")}`
                            : `DP-${variable!.name!.substr(0, 33)}`,
                    name: variable!.name!.substr(0, 64),
                    type: (variable.dataType as unknown) as DataPoint.TypeEnum,
                    unit: `${variable.unit}`,
                    customData: {
                        variable: `${variable.name}`,
                    },
                });
            });
            dataSourceConfiguration.dataSources.push(dataSource);
        });

        dataSourceConfiguration =
            mode === "NUMERICAL" ? dataSourceConfiguration : this.CreateUniqueDataPoints(dataSourceConfiguration);

        return dataSourceConfiguration;
    }

    private CreateUniqueDataPoints(configuration: DataSourceConfiguration): DataSourceConfiguration {
        // check if dataSourceNames are unique

        const datasources = configuration.dataSources.map((x) => x.name);
        const duplicates = this.getDuplicates(datasources);

        duplicates.forEach((duplicate) => {
            let ds: number = 0;
            configuration.dataSources
                .filter((x) => x.name === duplicate)
                .forEach((d) => {
                    d.name = `${d.name.substr(0, 58)}${(++ds).toString().padStart(5, "0")}`;
                });
        });

        const dataPointIds: string[] = [];

        configuration.dataSources.forEach((ds) => {
            const ids = ds.dataPoints.map((x) => x.id);
            dataPointIds.push(...ids);
        });

        const dataPointDuplicates = this.getDuplicates(dataPointIds);

        dataPointDuplicates.forEach((duplicate) => {
            let dp: number = 0;
            configuration.dataSources.forEach((ds) => {
                const dataPoints = ds.dataPoints.filter((x) => x.id === duplicate);
                dataPoints.forEach((p) => {
                    p.id = `${p.id.substr(0, 28)}${(++dp).toString().padStart(5, "0")}`;
                });
            });
        });

        return configuration;
    }

    getDuplicates(x: Array<any>): Array<any> {
        return [...new Set(x.filter((e, i, a) => a.indexOf(e) !== i))];
    }

    /**
     *  * Generate automatically the mappings for the specified target assetid
     *
     * !Important! this only works if you have created the data source coniguration automatically
     *
     * @param {DataSourceConfiguration} dataSourceConfiguration
     * @param {string} agentId
     * @param {string} targetAssetId
     * @returns {Mapping[]}
     *
     * @memberOf MindConnectApiClient
     */
    public GenerateMappings(
        dataSourceConfiguration: DataSourceConfiguration,
        agentId: string,
        targetAssetId: string
    ): Mapping[] {
        const mappings = [];

        !dataSourceConfiguration &&
            throwError(
                "no data source configuration! (have you forgotten to create / generate the data source configuration first?"
            );

        for (const dataSource of dataSourceConfiguration!.dataSources) {
            (!dataSource.customData || !dataSource.customData!.aspect!) &&
                throwError(
                    "GenerateMappings works only on configurations created with GenerateDataSourceConfiguration method!"
                );
            for (const datapoint of dataSource.dataPoints) {
                (!datapoint.customData || !datapoint.customData!.variable) &&
                    throwError(
                        "GenerateMappings works only on configurations created with GenerateDataSourceConfiguration method!"
                    );

                mappings.push({
                    agentId: agentId,
                    dataPointId: datapoint.id,
                    entityId: targetAssetId,
                    propertyName: datapoint.customData!.variable,
                    propertySetName: dataSource.customData!.aspect,
                    keepMapping: true,
                });
            }
        }
        return mappings;
    }
}
