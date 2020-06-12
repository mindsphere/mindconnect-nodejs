import { CommanderStatic } from "commander";
import { log } from "console";
import * as http from "http";
import * as https from "https";
import * as url from "url";
import { MindSphereSdk } from "../../api/sdk";
import { authJson, decrypt, loadAuth } from "../../api/utils";
import { errorLog, getColor, homeDirLog, proxyLog } from "./command-utils";
const HttpsProxyAgent = require("https-proxy-agent");

const color = getColor("magenta");
const red = getColor("red");
const yellow = getColor("yellow");

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Max-Age": 2592000, // 30 days
    "transfer-encoding": "",
    "cache-control": "no-cache",
    "x-proxied-by": "@mindconnect/mindconnect-nodejs development proxy",
    /** add other headers too */
};

export default (program: CommanderStatic) => {
    program
        .command("dev-proxy")
        .alias("px")
        .option("-o, --port <port>", "port for web server", 7707)
        .option("-v, --verbose", "verbose output")
        .option("-k, --passkey <passkey>", "passkey")
        .description(color("starts mindsphere development proxy"))
        .action((options) => {
            (async () => {
                try {
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const auth = loadAuth();

                    const sdk = new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, options.passkey) });

                    await serve({ auth, configPort: options.port, sdk });

                    console.log(auth);
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log("\n  Examples:\n");
            log(`    mc dev-proxy \t\t\t starts mindsphere development proxy on default port (7707)`);
            log(`\n    mc dev-proxy --port 7777 \t\t\t starts mindsphere development proxy on port 7777`);
        });
};

async function serve({ auth, configPort, sdk }: { auth: authJson; configPort?: number; sdk: MindSphereSdk }) {
    const proxy = process.env.http_proxy || process.env.HTTP_PROXY;
    log(`Proxy: ${proxy}`);
    const proxyHttpAgent = proxy ? new HttpsProxyAgent(proxy) : undefined;

    const server = http.createServer();
    const port = configPort || 7707;

    server.on("request", async (req, res: http.ServerResponse) => {
        try {
            const options = {
                hostname: url.parse(auth.gateway).host,
                port: 443,
                path: req.url,
                method: req.method,
                headers: req.headers,
                agent: proxyHttpAgent,
            };

            if (!req.headers["x-xsrf-token"] && !req.headers["X-XSRF-TOKEN"] && !(req.method === "GET")) {
                console.log(
                    `[${color(new Date().toLocaleTimeString())}] ${yellow(
                        "WARN: x-xsrf-token is missing. the app will not work after deployment."
                    )}`
                );
                console.log(
                    `[${color(new Date().toLocaleTimeString())}] ${yellow("WARN: see")}: ${color(
                        "https://developer.mindsphere.io/concepts/concept-authentication.html#calling-apis-from-frontend"
                    )}`
                );
            }

            options.headers.host = url.parse(auth.gateway).host;
            (options.headers as any)["Authorization"] = `Bearer ${await sdk.GetToken()}`;

            const proxy = https.request(options, function (proxyres) {
                const allHeaders = { ...headers, ...proxyres.headers };
                if (req.method === "OPTIONS") {
                    res.writeHead(204, headers);
                    res.end();
                    return;
                }

                res.writeHead(res.statusCode, allHeaders);
                proxyres.pipe(res, {
                    end: true,
                });
            });

            req.pipe(proxy, {
                end: true,
            });

            const logColor = res.statusCode >= 200 && res.statusCode < 300 ? color : red;

            console.log(
                `${logColor(new Date().toISOString())} ${logColor(res.statusCode)} ${options.method} ${options.path}`
            );
        } catch (error) {
            console.log(`${error.message}`);
        }
    });

    server.listen(port);

    console.log(`navigate to ${color("http://localhost:" + port)} to configure the CLI`);
    console.log(`press ${color("CTRL + C")} to exit`);
}
