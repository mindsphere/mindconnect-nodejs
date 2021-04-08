export const modelDataTemplate = (
    file: Buffer,
    filename: string = "file.wav",
    metadata: string = "{}",
    mimeType: string = "application/octet-stream"
) => `
----mindsphere\r\n\
Content-Disposition: form-data; name="file"; filename="${filename}"\
\r\n\
Content-Type: ${mimeType}\
\r\n\r\n${file.toString("ascii")}\r\n\
----mindsphere\r\n\
Content-Disposition: form-data; name="metadata"\
\r\n\
Content-Type: application/json\
\r\n\r\n\
${metadata}\r\n\
\r\n----mindsphere--`;
