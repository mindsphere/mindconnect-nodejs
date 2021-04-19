import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk, NotificationModelsV4 } from "../src/api/sdk";
import { notificationTemplate } from "../src/api/sdk/notification-v4/notification-data-template";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest } from "./test-utils";
chai.should();

describe("[SDK] NotificationClient", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });

    it("SDK should not be undefined @sanity", async () => {
        sdk.should.not.be.undefined;
    });

    it("Notification Client should not be undefined @sanity", async () => {
        sdk.GetNotificationClientV4().should.not.be.undefined;
    });

    it("should create a simple email template @sanity", async () => {
        const result = notificationTemplate({
            subject: "test subject",
            message: "test message",
            fromApplication: "cli",
            priority: NotificationModelsV4.MulticastEmailNotificationRequestMetadata.PriorityEnum.Normal,
            recipients: ["sn0wcat@mindsphere.io"],
        });

        result.startsWith("----mindsphere\r\n").should.be.true;
        result.endsWith("\r\n----mindsphere--").should.be.true;
    });

    it("should create an email template with attachements @sanity", async () => {
        const result = notificationTemplate(
            {
                subject: "test subject",
                message: "test message",
                fromApplication: "cli",
                priority: NotificationModelsV4.MulticastEmailNotificationRequestMetadata.PriorityEnum.Normal,
                recipients: ["sn0wcat@mindsphere.io"],
            },
            [
                { fileName: "upload.txt", buffer: Buffer.from("some-text"), mimeType: "text/plain" },
                { fileName: "upload2.txt", buffer: Buffer.from("some-text-2"), mimeType: "text/plain" },
            ]
        );

        // console.log(result);
        result.startsWith("----mindsphere\r\n").should.be.true;
        result.indexOf("\r\nsome-text").should.be.greaterThan(0);
        result.indexOf("\r\nsome-text-2").should.be.greaterThan(0);
        result.endsWith("\r\n----mindsphere--").should.be.true;
    });
});
