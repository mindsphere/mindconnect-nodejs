import { NotificationModelsV4 } from "./notification-v4-models";

export const notificationTemplate = (
    metadata: NotificationModelsV4.MulticastEmailNotificationRequestMetadata,
    attachments?: NotificationModelsV4.Attachment[]
) => {
    let attachementString = "";

    (attachments || []).forEach((attachement) => {
        attachementString += `\r\n----mindsphere\r\n\
Content-Disposition: form-data; name="attachment"; filename="${attachement.fileName}"\r\n\
Content-Type: ${attachement.mimeType}\r\n\r\n${(attachement.buffer as Buffer).toString("ascii")}\r\n`;
    });

    const result = `----mindsphere\r\n\
Content-Disposition: form-data; name="metadata"\
\r\n\
Content-Type: application/json\
\r\n\r\n\
${JSON.stringify(metadata, null, 2)}\
${attachementString}\
\r\n----mindsphere--`;
    return result;
};
