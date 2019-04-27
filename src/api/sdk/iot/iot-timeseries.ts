import { checkAssetId } from "../../utils";
import { SdkClient } from "../common/sdk-client";
import { TimeSeriesModels } from "./iot-timeseries-models";

export class TimeSeriesClient extends SdkClient {
    private _baseUrl: string = "/api/iottimeseries/v3";

    public async PutTimeSeries(entity: string, propertysetname: string, timeseries: TimeSeriesModels.Timeseries) {
        checkAssetId(entity);
        return await this.HttpAction({
            verb: "PUT",
            baseUrl: `${this._baseUrl}/timeseries/${entity}/${propertysetname}`,
            body: timeseries,
            noResponse: true
        });
    }
}
