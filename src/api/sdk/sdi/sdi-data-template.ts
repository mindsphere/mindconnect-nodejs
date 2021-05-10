export const sdiDataTemplate = (fileName: string, buffer: Buffer, mimeType?: string) => `
----mindsphere\r\n\
Content-Disposition: form-data; name="file"; filename="${fileName}"\
\r\n\
Content-Type: ${mimeType}\
\r\n\r\n${(buffer as Buffer).toString("ascii")}\r\n\
----mindsphere--`;
