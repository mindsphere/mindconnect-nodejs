export const inferOntologyTemplate = (
    fileName: string,
    buffer: Buffer,
    mimeType: string,
    ontologyDescription?: string,
    ontologyId?: string,
    ontologyName?: string,
    keyMappingType?: string
) => `
----mindsphere\r\n\
Content-Disposition: form-data; name="file"; filename="${fileName}"\
\r\n\
Content-Type: ${mimeType || "application/octet-stream"}\
\r\n\r\n${(buffer as Buffer).toString("ascii")}\r\n\
----mindsphere\r\n\
Content-Disposition: form-data; name="ontologyDescription"\
\r\n\
Content-Type: text/plain\
\r\n\r\n\
${ontologyDescription || ""}\r\n\
----mindsphere\r\n\
Content-Disposition: form-data; name="ontologyId"\
\r\n\
Content-Type: text/plain\
\r\n\r\n\
${ontologyId || ""}\r\n\
----mindsphere\r\n\
Content-Disposition: form-data; name="ontologyName"\
\r\n\
Content-Type: text/plain\
\r\n\r\n\
${ontologyName || ""}\r\n\
----mindsphere\r\n\
Content-Disposition: form-data; name="keyMappingType"\
\r\n\
Content-Type: text/plain\
\r\n\r\n\
${keyMappingType || "INNER JOIN"}\r\n\
\r\n----mindsphere--`;
