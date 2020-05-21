import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import * as path from "path";
import * as uuid from "uuid";
import { MqttOpcUaAuth } from "../../api/mqtt-opcua-auth";
import { errorLog, getColor, verboseLog } from "./command-utils";

const color = getColor("green");

const tokenHeader: any = {
    alg: "RS256",
    x5c: [],
    typ: "JWT",
};

const tokenBody: any = {
    aud: ["MQTTBroker"],
    schemas: ["urn:siemens:mindsphere:v1"],
};

export default (program: CommanderStatic) => {
    program
        .command("mqtt-createjwt")
        .alias("jw")
        .option("-i, --clientid <clientid>", "MQTT ClientId", uuid.v4())
        .option("-e, --expiration <expiration>", "time until the token is valid in seconds", 1 * 60 * 60)
        .option("-c, --rootca <rootca>", "path to CA root certificate", "CA-root.pem")
        .option("-d, --devicecrt <devicecrt>", "path to device certificate", "device.crt.pem")
        .option("-k, --devicekey <devicekey>", "path to device certificate key", "device.key.pem")
        .option("-p, --passphrase [passphrase]", "passphrase for device certificate key")
        .option("-n, --intermediate [intermediate]", "intermediate ca")
        .option("-t, --tenant [tenant]", "tenant name")
        .option("-v, --verbose", "verbose output")
        .description(color("creates a signed token for opcua pub sub authentication #"))
        .action((options) => {
            (async () => {
                try {
                    checkParameters(options);

                    tokenBody.iss = options.clientid;
                    tokenBody.sub = options.clientid;

                    const rootca = fs.readFileSync(path.resolve(options.rootca)).toString();
                    const devicecrt = fs.readFileSync(path.resolve(options.devicecrt)).toString();
                    const devicekey = fs.readFileSync(path.resolve(options.devicekey)).toString();
                    // console.log(options.intermediate);
                    let intermediate = undefined;
                    if (options.intermediate) {
                        intermediate = fs.readFileSync(path.resolve(options.intermediate)).toString();
                    }

                    const mqttTokenRotation = new MqttOpcUaAuth(
                        options.clientid,
                        rootca,
                        devicecrt,
                        options.expiration,
                        devicekey,
                        intermediate,
                        options.passphrase,
                        options.tenant
                    );

                    let token = mqttTokenRotation.GetMqttToken();
                    token = mqttTokenRotation.GetMqttToken();
                    console.log(token);
                    verboseLog(JSON.stringify(jwt.decode(token, { complete: true }), null, 2), options.verbose);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc mqtt-createjwt --clientid "12345...ef" \\`);
            log(`    --rootca path/to/root.cer.pem \\`);
            log(`    --devicecrt path/to/device.cer.pem \\`);
            log(`    --devicekey path/to/devicekey.pem \\`);
            log(`    --passphrase "device key passphrase"  \\`);
            log(`    --tenant yourtenant`);
            log(`\n  More Information: \n`);
            log(
                `    ${color(
                    "https://developer.mindsphere.io/howto/howto-connect-via-mqtt.html#security-concept-onboarding-certificatebearer"
                )}\n`
            );
        });
};

function checkParameters(options: any) {
    !options.rootca &&
        errorLog(
            "You have to specify the path to the root certificate. Run mc jw --help for full syntax and examples.",
            options.verbose
        );
    !options.devicecrt &&
        errorLog(
            "You have to specify the path to the device certificate. Run mc jw --help for full syntax and examples.",
            options.verbose
        );
    !options.devicekey &&
        errorLog(
            "You have to specify the path to the device key. Run mc jw --help for full syntax and examples.",
            options.verbose
        );
    !options.tenant &&
        errorLog(
            "You have to specify the name of your tenant. Run mc jw --help for full syntax and examples.",
            options.verbose
        );
}
