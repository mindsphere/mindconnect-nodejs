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
   *
   * @export
   * @interface Timeseries
   */
  export interface Timeseries {
    [key: string]: number | any;

    /**
     * string
     * @type {any}
     * @memberof Timeseries
     */
    string?: any;
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
