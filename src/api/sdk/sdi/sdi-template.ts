export function sdiTemplate(
    fileName: string,
    buffer: Buffer,
    mimeType?: string,
    params?: {
        ontologyDescription?: string;
        ontologyId?: string;
        ontologyName?: string;
        keyMappingType?: string;
    }
) {
    let result =
        `----mindsphere\r\n` +
        `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
        `Content-Type: ${mimeType || "application/octet-stream"}\r\n` +
        `\r\n` +
        `${(buffer as Buffer).toString("ascii")}\r\n`;

    for (const [k, v] of Object.entries(params || {})) {
        if (v) {
            result += `----mindsphere\r\n` + `Content-Disposition: form-data; name="${k}"\r\n` + `\r\n` + `${v}\r\n`;
        }
    }

    result += `----mindsphere--`;
    return result;
}
