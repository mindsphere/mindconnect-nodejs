// Copyright (C), Siemens AG 2017
export function eventSchema() {

    return {
        "$id": "http://example.com/example.json",
        "type": "object",
        "properties": {
            "entityId": {
                "$id": "/properties/entityId",
                "type": "string",
                "title": "The Entityid Schema ",
                "default": "",
                "examples": [
                    "`12"
                ],
                "minLength": 32,
                "maxLength": 32,
                "pattern": "^[A-Fa-f0-9]*$"
            },
            "timestamp": {
                "$id": "/properties/timestamp",
                "type": "string",
                "format": "date-time",
                "title": "The Timestamp Schema ",
                "default": "",
                "examples": [
                    "2018-06-16T18:38:07.293Z"
                ]
            },
            "sourceType": {
                "$id": "/properties/sourceType",
                "type": "string",
                "title": "The Sourcetype Schema ",
                "default": "",
                "examples": [
                    "Event"
                ]
            },
            "sourceId": {
                "$id": "/properties/sourceId",
                "type": "string",
                "title": "The Sourceid Schema ",
                "default": "",
                "examples": [
                    "application"
                ]
            },
            "source": {
                "$id": "/properties/source",
                "type": "string",
                "title": "The Source Schema ",
                "default": "",
                "examples": [
                    "Meowz"
                ]
            },
            "severity": {
                "$id": "/properties/severity",
                "type": "integer",
                "title": "The Severity Schema ",
                "default": 0,
                "examples": [
                    20
                ]
            },
            "description": {
                "$id": "/properties/description",
                "type": "string",
                "title": "The Description Schema ",
                "default": "",
                "examples": [
                    ""
                ]
            }
        },
        "required": [
            "entityId",
            "timestamp",
            "severity",
            "description",
            "source",
            "sourceId",
            "sourceType"
        ]
    };
}


export function schemaSubTemplateString(string_type: any) {
    return `{
                "required": ["dataPointId","qualityCode", "value"],
                "additionalProperties": false,
                "properties": {
                    "dataPointId": {},
                    "qualityCode": {
                        "type": "string"
                    },
                    "value": {
                        "type": "string",
                        "${string_type}": true
                    }
                }
            }`;
}

export function schemaTopTemplateString(array: any, length: number) {
    return `{
                "type": "array",
                "uniqueItemProperties": ["dataPointId"],
                "minItems": 1,
                "maxItems": ${length},
                "items": {
                    "type": "object",
                    "select": { "$data": "0/dataPointId"},
                    "selectCases": {},
                    "properties": {
                        "dataPointId": {
                            "type": "string",
                            "enum": ${array}
                        }
                    },
                    "required": ["dataPointId"]
                }
            }`;
}
