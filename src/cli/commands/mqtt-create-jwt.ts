import { CommanderStatic } from "commander";
import { log } from "console";
import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import * as path from "path";
import * as uuid from "uuid";
import { verboseLog } from "../../../dist/src/cli/commands/command-utils";
import { errorLog, getColor } from "./command-utils";

const color = getColor("green");

const tokenHeader: any = {
    alg: "RS256",
    x5c: [],
    typ: "JWT"
};

const tokenBody: any = {
    aud: ["MQTTBroker"],
    schemas: "urn:siemens:mindsphere:v1"
};

export default (program: CommanderStatic) => {
    program
        .command("mqtt-createjwt")
        .alias("jw")
        .option("-i, --clientid <clientid>", "MQTT ClientId", uuid.v4())
        .option("-e, --expiration <expiration>", "time until the token is valid in days", 365)
        .option("-c, --rootca <rootca>", "path to CA root certificate", "CA-root.pem")
        .option("-d, --devicecrt <devicecrt>", "path to device certificate", "device.crt.pem")
        .option("-k, --devicekey <devicekey>", "path to device certificate key", "device.key.pem")
        .option("-p, --passphrase [passphrase]", "passphrase for device certificate key")
        .option("-n, --intermediate [intermediate]", "intermediate ca")
        .option("-t, --tenant [tenant]", "tenant name")
        .option("-v, --verbose", "verbose output")
        .description(color("creates a signed token for opcua pub sub authentication #"))
        .action(options => {
            (async () => {
                try {
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

                    tokenHeader.x5c.push(pruneCert(devicecrt));
                    intermediate && tokenHeader.x5c.push(pruneCert(intermediate));
                    tokenHeader.x5c.push(pruneCert(rootca));

                    const issuedTime = Math.round(new Date().getTime() / 1000);
                    const expirationTime = issuedTime + options.expiration * 24 * 60 * 60;

                    tokenBody.jti = uuid.v4().toString();
                    tokenBody.iat = issuedTime;
                    tokenBody.nbf = issuedTime;
                    tokenBody.exp = expirationTime;
                    tokenBody.tenant = `${options.tenant}`;

                    const signOptions: any = {
                        key: devicekey
                    };

                    if (options.passphrase) {
                        signOptions.passphrase = `${options.passphrase}`;
                    }

                    const signedJwt = jwt.sign(tokenBody, signOptions, { header: tokenHeader, algorithm: "RS256" });
                    console.log(signedJwt);
                    verboseLog(JSON.stringify(tokenHeader, null, 2), options.verbose);
                    verboseLog(JSON.stringify(tokenBody, null, 2), options.verbose);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc mqtt-createjwt --clientid "12345...ef" \\`);
            log(`    --rootca path/to/root.cer.pem \\`);
            log(`    --devicecert path/to/device.cer.pem \\`);
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

function pruneCert(s: string): string {
    return s
        .split(/\r\n|\r|\n/)
        .filter(x => {
            return x.indexOf("CERTIFICATE") < 0;
        })
        .join("");
}
