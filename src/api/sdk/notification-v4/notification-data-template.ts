import { NotificationModelsV4 } from "./notification-v4-models";

export const notificationEmailTemplate = (
    metadata: NotificationModelsV4.MulticastEmailNotificationRequestMetadata,
    attachments?: NotificationModelsV4.Attachment[]
) => {
    let attachementString = "";

    (attachments || []).forEach((attachement) => {
        attachementString += `Content-Disposition: form-data; name="file"; filename="${attachement.fileName}"\r\n\
Content-Type: ${attachement.mimeType}\r\n\r\n${(attachement.buffer as Buffer).toString("ascii")}\r\n\
----mindsphere\r\n`;
    });

    const result = `----mindsphere\r\n${attachementString}\
Content-Disposition: form-data; name="metadata"\
\r\n\
Content-Type: application/json\
\r\n\r\n\
${JSON.stringify(metadata, null, 2)}\
\r\n----mindsphere--`;
    return result;
};
