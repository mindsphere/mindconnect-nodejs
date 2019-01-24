// Copyright (C), Siemens AG 2017
import { DataPointValue } from "..";
import { TimeStampedDataPoint } from "./mindconnect-models";

//tslint:disable
export const dataTemplate = (timestamp: Date, dataPointValues: DataPointValue[], configurationId: string) =>
    `--mindspheremessage
Content-Type:multipart/related;boundary=mindspherepart

--mindspherepart
Content-Type:application/vnd.siemens.mindsphere.meta+json

{
    "type": "item",
    "version": "1.0",
    "payload": {
        "type": "standardTimeSeries",
        "version": "1.0",
        "details": {
            "configurationId": "${configurationId}"
        }
    }
}

--mindspherepart
Content-Type:application/json

[{ "timestamp":"${timestamp.toISOString()}", "values": ${JSON.stringify(dataPointValues)}}]

--mindspherepart--
--mindspheremessage--
`.replace("--mindspherepart--", "\r\n--mindspherepart--");


export const bulkDataTemplate = (timeStampedValues: TimeStampedDataPoint[], configurationId: string) =>
    `--mindspheremessage
Content-Type:multipart/related;boundary=mindspherepart

--mindspherepart
Content-Type:application/vnd.siemens.mindsphere.meta+json

{
    "type": "item",
    "version": "1.0",
    "payload": {
        "type": "standardTimeSeries",
        "version": "1.0",
        "details": {
            "configurationId": "${configurationId}"
        }
    }
}

--mindspherepart
Content-Type:application/json

${JSON.stringify(timeStampedValues)}

--mindspherepart--
--mindspheremessage--
`.replace("--mindspherepart--", "\r\n--mindspherepart--");

export const fileTemplateHeader = (filename: string, creationDate: Date, fileType: string) =>
    `--mindspheremessage
Content-Type:multipart/related;boundary=mindspherepart

--mindspherepart
Content-Type:application/vnd.siemens.mindsphere.meta+json

{
    "type": "item",
    "version": "1.0",
    "payload": {
        "type": "file",
        "version": "1.0",
        "details": {
            "fileName": "${filename}",
            "creationDate" : "${creationDate.toISOString()}",
            "fileType" : "${fileType}"
        }
    }
}

--mindspherepart
Content-Type:application/octet-stream

`;


export const fileTemplateFooter = `--mindspherepart--
--mindspheremessage--
`.replace("--mindspherepart--", "\r\n--mindspherepart--");