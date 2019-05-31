export const spectralAnalysisTemplate = (
    file: Buffer,
    filename: string = "file.wav",
    windowType: string = "FLATTOP",
    mimeType: string = "audio/wave"
) => `
----mindsphere\r\n\
Content-Disposition: form-data; name="file"; filename="${filename}"\
\r\n\
Content-Type: ${mimeType}\
\r\n\r\n${file.toString("ascii")}\r\n
----mindsphere\r\n\
Content-Disposition: form-data; name="fftProperties"\
\r\n\
Content-Type: ${"application/json"}\
\r\n\
{
    windowType: "${windowType}"
}
\r\n----mindsphere--`;
