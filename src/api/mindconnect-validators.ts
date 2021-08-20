// Copyright (C), Siemens AG 2017
import ajv, { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import * as debug from "debug";
import { DataSourceConfiguration } from "..";
import { eventSchema, schemaSubTemplateString, schemaTopTemplateString } from "./schema-template";

const ajvKeywords = require("ajv-keywords");
const log = debug("mindconnect");

/**
 * Generates an json schema validator for the mindsphere datapoints from configuration settings.
 *
 * @export
 * @param {DataSourceConfiguration} model
 * @returns {ajv.ValidateFunction}
 */
export function dataValidator(model: DataSourceConfiguration): ValidateFunction {
    const dataPointIdArray: string[] = [];
    let valueArray: string[] = [];
    const schemaValidator = new ajv({ $data: true, allErrors: false, verbose: true });

    ajvKeywords(schemaValidator, ["uniqueItemProperties", "select"]);

    schemaValidator.addKeyword({
        keyword: "str_number",
        validate: (schema: {}, data: any) => {
            let ret = false;
            Number.isNaN(Number(data)) ? (ret = false) : (ret = true);
            return ret;
        },
        errors: true,
    });

    schemaValidator.addKeyword({
        keyword: "str_integer",
        validate: (schema: {}, data: any) => {
            if (Number.isNaN(Number(data))) return false;

            return Number.isInteger(Number(data));
        },
        errors: true,
    });

    schemaValidator.addKeyword({
        keyword: "str_boolean",
        validate: (schema: {}, data: any) => {
            data = data.toLowerCase();
            return data === "true" || data === "false";
        },
        errors: true,
    });

    schemaValidator.addKeyword({
        keyword: "str_string",
        validate: (schema: {}, data: any) => {
            return true;
        },
        errors: true,
    });

    schemaValidator.addKeyword({
        keyword: "str_bigstring",
        validate: (schema: {}, data: any) => {
            return true;
        },
        errors: true,
    });

    schemaValidator.addKeyword({
        keyword: "str_timestamp",
        validate: (schema: {}, data: any) => {
            return new Date(data).toISOString() === data;
        },
        errors: true,
    });

    model.dataSources.forEach(function (elem) {
        elem.dataPoints.forEach(function (elem2) {
            dataPointIdArray.push(elem2.id);
            valueArray.push(elem2.type.toString());
        });
    });
    valueArray = valueArray.map(function (elem) {
        let tmp = "";
        switch (elem) {
            case "BOOLEAN":
                tmp = "str_boolean";
                break;
            case "INT":
                tmp = "str_integer";
                break;
            case "LONG":
                tmp = "str_integer";
                break;
            case "DOUBLE":
                tmp = "str_number";
                break;
            case "STRING":
                tmp = "str_string";
                break;
            case "BIG_STRING":
                tmp = "str_bigstring";
                break;
            case "TIMESTAMP":
                tmp = "str_timestamp";
                break;
            default:
                console.warn(
                    "Unknown type: " +
                        elem +
                        " in configuration. Supported types: BOOLEAN, INT, LONG, DOUBLE, STRING, BIG_STRING, TIMESTAMP"
                );
                tmp = "str_string";
        }
        return tmp;
    });
    const schema = JSON.parse(schemaTopTemplateString(JSON.stringify(dataPointIdArray), dataPointIdArray.length));
    log(`schema: ${JSON.stringify(schema)}`);

    dataPointIdArray.forEach(function (elem, index) {
        schema.items.selectCases[elem] = JSON.parse(schemaSubTemplateString(valueArray[index]));
    });

    log(JSON.stringify(schema));
    const validate = schemaValidator.compile(schema);
    return validate;
}

export function eventValidator(): ValidateFunction {
    const schemaValidator = new ajv({ $data: true, allErrors: false, verbose: true });
    addFormats(schemaValidator);
    return schemaValidator.compile(eventSchema());
}
