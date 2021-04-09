import { ModelManagementModels } from "./model-models";

export const modelDataTemplate = (
    metadata: ModelManagementModels.VersionDefinition | ModelManagementModels.ModelDefinition,
    payload: ModelManagementModels.ModelPayload
) => `
----mindsphere\r\n\
Content-Disposition: form-data; name="file"; filename="${payload.fileName}"\
\r\n\
Content-Type: ${payload.mimeType}\
\r\n\r\n${(payload.buffer as Buffer).toString("ascii")}\r\n\
----mindsphere\r\n\
Content-Disposition: form-data; name="metadata"\
\r\n\
Content-Type: application/json\
\r\n\r\n\
${JSON.stringify(metadata, null, 2)}\r\n\
\r\n----mindsphere--`;
