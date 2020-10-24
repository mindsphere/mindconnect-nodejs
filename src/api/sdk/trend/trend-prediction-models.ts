export namespace TrendPredictionModels {
    /**
     * All the information needed to identify a variable.
     * @export
     * @interface BasicVariableDefinition
     */
    export interface BasicVariableDefinition {
        /**
         *
         * @type {string}
         * @memberof BasicVariableDefinition
         */
        entityId: string;
        /**
         *
         * @type {string}
         * @memberof BasicVariableDefinition
         */
        propertySetName: string;
    }

    /**
     * All the information needed to identify a variable.
     * @export
     * @interface BasicVariableDefinitionDirect
     */
    export interface BasicVariableDefinitionDirect {
        /**
         *
         * @type {string}
         * @memberof BasicVariableDefinitionDirect
         */
        assetId: string;
        /**
         *
         * @type {string}
         * @memberof BasicVariableDefinitionDirect
         */
        aspectName: string;
    }

    /**
     * All the information needed to identify a variable.
     * @export
     * @interface BasicVariableDefinitionPredictDirect
     */
    export interface BasicVariableDefinitionPredictDirect {
        /**
         *
         * @type {string}
         * @memberof BasicVariableDefinitionPredictDirect
         */
        assetId: string;
        /**
         *
         * @type {string}
         * @memberof BasicVariableDefinitionPredictDirect
         */
        aspectName: string;
        /**
         *
         * @type {string}
         * @memberof BasicVariableDefinitionPredictDirect
         */
        variableNames?: string;
    }

    /**
     *
     * @export
     * @interface Link
     */
    export interface Link {
        /**
         *
         * @type {string}
         * @memberof Link
         */
        href?: string;
        /**
         *
         * @type {string}
         * @memberof Link
         */
        rel?: string;
        /**
         *
         * @type {boolean}
         * @memberof Link
         */
        templated?: boolean;
    }

    /**
     * A trained regression model.
     * @export
     * @interface ModelDto
     */
    export interface ModelDto {
        /**
         *
         * @type {string}
         * @memberof ModelDto
         */
        id?: string;
        /**
         *
         * @type {MultivarParams}
         * @memberof ModelDto
         */
        metadataConfiguration?: MultivarParams;
        /**
         *
         * @type {number}
         * @memberof ModelDto
         */
        intercept?: number;
        /**
         *
         * @type {Array<number>}
         * @memberof ModelDto
         */
        coefficients?: Array<number>;
        /**
         *
         * @type {string}
         * @memberof ModelDto
         */
        creationDate?: string;
    }

    /**
     * A trained regression model.
     * @export
     * @interface ModelDtoDirect
     */
    export interface ModelDtoDirect {
        /**
         *
         * @type {string}
         * @memberof ModelDtoDirect
         */
        id?: string;
        /**
         *
         * @type {MultivarParamsDirect}
         * @memberof ModelDtoDirect
         */
        metadataConfiguration?: MultivarParamsDirect;
        /**
         *
         * @type {number}
         * @memberof ModelDtoDirect
         */
        intercept?: number;
        /**
         *
         * @type {Array<number>}
         * @memberof ModelDtoDirect
         */
        coefficients?: Array<number>;
        /**
         *
         * @type {string}
         * @memberof ModelDtoDirect
         */
        creationDate?: string;
    }

    /**
     * All the information needed to identify both the input and output variables.
     * @export
     * @interface MultivarParams
     */
    export interface MultivarParams {
        /**
         *
         * @type {VariableDefinition}
         * @memberof MultivarParams
         */
        outputVariable?: VariableDefinition;
        /**
         *
         * @type {Array<VariableDefinition>}
         * @memberof MultivarParams
         */
        inputVariables?: Array<VariableDefinition>;
    }

    /**
     * All the information needed to identify both the input and output variables.
     * @export
     * @interface MultivarParamsDirect
     */
    export interface MultivarParamsDirect {
        /**
         *
         * @type {VariableDefinitionDirect}
         * @memberof MultivarParamsDirect
         */
        outputVariable?: VariableDefinitionDirect;
        /**
         *
         * @type {Array<VariableDefinitionDirect>}
         * @memberof MultivarParamsDirect
         */
        inputVariables?: Array<VariableDefinitionDirect>;
    }

    /**
     * Data structure containing all information required for predicting future values of a given output variable using a pre-trained regression model.
     * @export
     * @interface PredictBody
     */
    export interface PredictBody {
        /**
         *
         * @type {PredictBodyModelConfiguration}
         * @memberof PredictBody
         */
        modelConfiguration?: PredictBodyModelConfiguration;
        /**
         *
         * @type {Array<VariableToTimeseries>}
         * @memberof PredictBody
         */
        predictionData?: Array<VariableToTimeseries>;
    }

    /**
     * Data structure containing all information required for predicting future values of a given output variable using a pre-trained regression model.
     * @export
     * @interface PredictBodyDirect
     */
    export interface PredictBodyDirect {
        /**
         *
         * @type {PredictBodyModelConfiguration}
         * @memberof PredictBodyDirect
         */
        modelConfiguration?: PredictBodyModelConfiguration;
        /**
         *
         * @type {Array<VariableToTimeseriesDirect>}
         * @memberof PredictBodyDirect
         */
        predictionData?: Array<VariableToTimeseriesDirect>;
    }

    /**
     *
     * @export
     * @interface PredictBodyModelConfiguration
     */
    export interface PredictBodyModelConfiguration {
        /**
         *
         * @type {string}
         * @memberof PredictBodyModelConfiguration
         */
        modelId?: string;
    }

    /**
     * An array containing the predicted values of a given output variable.
     * @export
     * @interface PredictionDataArray
     */
    export interface PredictionDataArray extends Array<VariableToTimeseries> {}

    /**
     * An array containing the predicted values of a given output variable.
     * @export
     * @interface PredictionDataArrayDirect
     */
    export interface PredictionDataArrayDirect extends Array<VariableToTimeseriesResponseDirect> {}

    /**
     *
     * @export
     * @interface Timeseries
     */
    export interface Timeseries {
        [key: string]: any | any;

        /**
         * time
         * @type {string}
         * @memberof Timeseries
         */
        time?: string;
    }

    /**
     * Data structure containing all information required for training a regression model.
     * @export
     * @interface TrainBody
     */
    export interface TrainBody {
        /**
         *
         * @type {TrainBodyModelConfiguration}
         * @memberof TrainBody
         */
        modelConfiguration?: TrainBodyModelConfiguration;
        /**
         *
         * @type {MultivarParams}
         * @memberof TrainBody
         */
        metadataConfiguration?: MultivarParams;
        /**
         *
         * @type {Array<VariableToTimeseries>}
         * @memberof TrainBody
         */
        trainingData?: Array<VariableToTimeseries>;
    }

    /**
     * Data structure containing all information required for training a regression model.
     * @export
     * @interface TrainBodyDirect
     */
    export interface TrainBodyDirect {
        /**
         *
         * @type {TrainBodyModelConfiguration}
         * @memberof TrainBodyDirect
         */
        modelConfiguration?: TrainBodyModelConfiguration;
        /**
         *
         * @type {MultivarParamsDirect}
         * @memberof TrainBodyDirect
         */
        metadataConfiguration?: MultivarParamsDirect;
    }

    /**
     *
     * @export
     * @interface TrainBodyModelConfiguration
     */
    export interface TrainBodyModelConfiguration {
        /**
         * Degree of the polynomial to be fitted. If not specified, a default value 1 (corresponding to the linear regression) will be used.
         * @type {number}
         * @memberof TrainBodyModelConfiguration
         */
        polynomialDegree?: number;
    }

    /**
     * Data structure containing all information required for training a regression model and predicting future values of a given output variable.
     * @export
     * @interface TrainPredictBody
     */
    export interface TrainPredictBody {
        /**
         *
         * @type {TrainBodyModelConfiguration}
         * @memberof TrainPredictBody
         */
        modelConfiguration?: TrainBodyModelConfiguration;
        /**
         *
         * @type {MultivarParams}
         * @memberof TrainPredictBody
         */
        metadataConfiguration?: MultivarParams;
        /**
         *
         * @type {Array<VariableToTimeseries>}
         * @memberof TrainPredictBody
         */
        trainingData?: Array<VariableToTimeseries>;
        /**
         *
         * @type {Array<VariableToTimeseries>}
         * @memberof TrainPredictBody
         */
        predictionData?: Array<VariableToTimeseries>;
    }

    /**
     * Data structure containing all information required for training a regression model and predicting future values of a given output variable.
     * @export
     * @interface TrainPredictBodyDirect
     */
    export interface TrainPredictBodyDirect {
        /**
         *
         * @type {TrainBodyModelConfiguration}
         * @memberof TrainPredictBodyDirect
         */
        modelConfiguration?: TrainBodyModelConfiguration;
        /**
         *
         * @type {MultivarParamsDirect}
         * @memberof TrainPredictBodyDirect
         */
        metadataConfiguration?: MultivarParamsDirect;
    }

    /**
     * All the information needed to identify a variable.
     * @export
     * @interface VariableDefinition
     */
    export interface VariableDefinition extends BasicVariableDefinition {
        /**
         *
         * @type {string}
         * @memberof VariableDefinition
         */
        propertyName?: string;
    }

    /**
     * All the information needed to identify a variable.
     * @export
     * @interface VariableDefinitionDirect
     */
    export interface VariableDefinitionDirect extends BasicVariableDefinitionDirect {
        /**
         *
         * @type {string}
         * @memberof VariableDefinitionDirect
         */
        variableName?: string;
    }

    /**
     * Data structure which allows to map the time series values to a given variable.
     * @export
     * @interface VariableToTimeseries
     */
    export interface VariableToTimeseries {
        /**
         *
         * @type {BasicVariableDefinition}
         * @memberof VariableToTimeseries
         */
        variable?: BasicVariableDefinition;
        /**
         *
         * @type {Array<Timeseries>}
         * @memberof VariableToTimeseries
         */
        timeSeries?: Array<Timeseries>;
    }

    /**
     * Data structure which allows to map the time series values to a given variable.
     * @export
     * @interface VariableToTimeseriesDirect
     */
    export interface VariableToTimeseriesDirect {
        /**
         *
         * @type {BasicVariableDefinitionPredictDirect}
         * @memberof VariableToTimeseriesDirect
         */
        variable?: BasicVariableDefinitionPredictDirect;
    }

    /**
     * Data structure which allows to map the time series values to a given variable.
     * @export
     * @interface VariableToTimeseriesResponseDirect
     */
    export interface VariableToTimeseriesResponseDirect {
        /**
         *
         * @type {BasicVariableDefinitionDirect}
         * @memberof VariableToTimeseriesResponseDirect
         */
        variable?: BasicVariableDefinitionDirect;
        /**
         *
         * @type {Array<Timeseries>}
         * @memberof VariableToTimeseriesResponseDirect
         */
        timeSeries?: Array<Timeseries>;
    }

    /**
     *
     * @export
     * @interface VndError
     */
    export interface VndError {
        /**
         *
         * @type {Array<Link>}
         * @memberof VndError
         */
        links?: Array<Link>;
        /**
         *
         * @type {string}
         * @memberof VndError
         */
        logref?: string;
        /**
         *
         * @type {string}
         * @memberof VndError
         */
        message?: string;
    }
}
