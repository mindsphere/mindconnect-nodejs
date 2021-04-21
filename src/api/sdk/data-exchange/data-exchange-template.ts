import { DataExchangeModels } from "./data-exchange-models";

export const dataExchangeTemplate = (metadata: DataExchangeModels.ResourcePatch, buffer: Buffer) => `
----mindsphere\r\n\
Content-Disposition: form-data; name="file"; filename="${metadata.name}"\
\r\n\
Content-Type: ${metadata.type}\
\r\n\r\n${buffer.toString("ascii")}\r\n\
----mindsphere\r\n\
Content-Disposition: form-data; name="metadata"\
\r\n\
Content-Type: application/json\
\r\n\r\n\
${JSON.stringify(metadata, null, 2)}\r\n\
\r\n----mindsphere--`;

export const putFileTemplate = (buffer: Buffer) => `
----mindsphere\r\n\
Content-Disposition: form-data; name="file"; filename="replacementFile"\
\r\n\
Content-Type: some/content\
\r\n\r\n${buffer.toString("ascii")}\r\n\
\r\n----mindsphere--`;
