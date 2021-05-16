import * as chalk from "chalk";
import { log } from "console";
import * as updateNotifier from "update-notifier";
import { FrontendAuth } from "../../api/frontend-auth";
import { AssetManagementModels, MindSphereSdk } from "../../api/sdk";
import { decrypt, getHomeDotMcDir, loadAuth } from "../../api/utils";
import { MC_NAME, MC_VERSION } from "../../version";

const magenta = getColor("magenta");
const yellow = getColor("yellow");
const green = getColor("green");
const red = getColor("red");
const cyan = getColor("cyan");

export function checkForUpdates() {
    const pkgInfo = {
        pkg: {
            name: `@mindconnect/${MC_NAME}`,
            version: `${MC_VERSION}`,
        },
    };

    const notifier = updateNotifier(pkgInfo);

    if (notifier.update) {
        console.log(
            `\n\t There is an update available: ${magenta(notifier.update.latest + " ")} (${notifier.update.type})`
        );
        console.log(`\t Run ${magenta("npm install -g ")}${magenta(pkgInfo.pkg.name)} to update`);
        console.log(`\t or download the release for your system from`);
        console.log(`\t ${magenta("https://github.com/mindsphere/mindconnect-nodejs/releases")}\n`);
    }
}

export const serviceCredentialLog = (color: Function = magenta) => {
    if (
        process.env.MDSP_PASSKEY ||
        (process.env.MDSP_HOST && process.env.MDSP_SESSION && process.env.MDSP_XSRF_TOKEN)
    ) {
        checkForUpdates();
        return;
    }

    log(`\n  Important: `);
    log(`\n  Authentication with ${color("service credentials")} or ${color("app credentials")}:\n`);

    log(`    \t- either append option [--passkey <your passkey>] to the command `);
    log(`    \t- or create environment variable ${color("MDSP_PASSKEY")} with your current passkey`);

    log(`\n  Authentication with ${yellow("borrowed session cookie and xsrf-token cookie")}: \n`);

    log(
        `    \t- create environment variables ${yellow("MDSP_HOST")} , ${yellow("MDSP_SESSION")} and ${yellow(
            "MDSP_XSRF_TOKEN"
        )} using borrowed cookies `
    );
    log(`\n  Full Documentation: \n`);
    log(`    ${color("https://opensource.mindsphere.io/docs/mindconnect-nodejs/cli/setting-up-the-cli.html")}\n`);

    checkForUpdates();
};

export function colorizeStatus(message: string) {
    switch (message) {
        case "SUCCESS":
            return green(message);

        case "IN_PROGRESS":
            return chalk.yellow(message);

        case "ERROR":
            return red(message);

        default:
            return message;
    }
}

export const subtractSecond = (date: Date, seconds: number): Date => {
    const newDate = new Date(date);
    newDate.setUTCMilliseconds(date.getUTCMilliseconds() - Math.floor(seconds * 1000));
    return newDate;
};

export const displayCsvHelp = (color: (chalk: string) => string) => {
    const now = new Date();
    log("\n  Examples:\n");
    log(`    mc ts -f timeseries.csv \t\t\t\t\t upload timeseries from the csv file to mindsphere `);
    log(`    mc upload-timeseries --file timeseries.csv  --size 100  \t use http post size of 100 records `);

    log(`\n  ${color("Data Format:")} (use your own data point ids from mindsphere)\n`);
    log(`  timestamp, ${color("dataPointId")}, ${green("qualityCode")}, ${yellow("value")}`);
    log(`  ${subtractSecond(now, 2).toISOString()}, ${color("DP-Temperature")} ,${green("0")}, ${yellow("20.34")}`);
    log(`  ${subtractSecond(now, 1).toISOString()}, ${color("DP-Humidity")}, ${green("0")}, ${yellow("70")}`);
    log(`  ${subtractSecond(now, 0).toISOString()}, ${color("DP-Pressure")}, ${green("0")}, ${yellow("1012.3")}`);

    log(
        `\n  Make sure that the timestamp is in ISO format. The headers and the casing (timestamp, dataPointId) are important.`,
        `\n  The values must correspond with data types configured in mindsphere (in example: ${color(
            "DP-Humidity"
        )} must be an ${color("integer")})`
    );

    log(`\n  ${color("Important:")}\n`);
    log(
        `    You have to configure the data source and data mappings in mindsphere asset manager before you can upload the data`
    );
    log(
        `    See also: ${color(
            "https://documentation.mindsphere.io/resources/html/asset-manager/en-US/116404525451.html"
        )}`
    );
};

export const directoryReadyLog = ({
    path,
    runCommand,
    jobCommand,
}: {
    path: string;
    runCommand: string;
    jobCommand: string;
}) => {
    log(`\nthe directory ${green(path)} is ${green("ready")}`);
    log(`you can now edit the template files in the directory`);
    log(`\nwhen you are done run:`);
    log(`\tmc ${runCommand} command to upload files and start the job`);
    log(`\nchecking progress:`);
    log(`\tmc ${jobCommand} to check the progress of the job`);
};

export function modeInformation(asset: AssetManagementModels.AssetResourceWithHierarchyPath, options: any, color: any) {
    const MAX_SIZE_FOR_TS = 100;
    console.log(
        `\nRunning ${
            options.timeseries
                ? `${yellow("standard")} TimeSeries ${yellow("(deprecated)")}`
                : `${color("bulk")} TimeSeries`
        } ingest for ${color(asset.name)} of type ${color("" + asset.typeId)} with twintype ${color(
            "" + asset.twinType
        )}`
    );
    if (asset.twinType === AssetManagementModels.TwinType.Performance && options.timeseries) {
        if (parseInt(options.size, 10) > MAX_SIZE_FOR_TS) {
            options.size = MAX_SIZE_FOR_TS;
        }
        console.log(`\n${color("Important:")}`);
        console.log(`\nYou are using the ${color("standard timeseries")} ingest for the asset.`);
        console.log(`The calls to the API will be ${color("throttled")} to match your throttling limits.`);
        console.log(`The number of the records per message will be reduced to ${color(options.size)} per message.\n`);
        console.log(`Using this feature has a direct impact on ${color("your")} MindSphere resource consumption.`);
        console.log(`You might get a notice that you will need to upgrade your account's data ingest rate.`);
        console.log(`${yellow("Warning")} This feature is ${yellow("deprecated")}!\n`);
    }
}

export function getColor(name: string) {
    return chalk.level < 2 ? (chalk as any)[name] : (chalk as any)[`${name}Bright`];
}

export function adjustColor(color: any, options: any, analyticcommand: boolean = false) {
    if ((process.env.MDSP_PASSKEY || options.passkey) && !analyticcommand) {
        return getColor("magenta");
    } else if (process.env.MDSP_HOST && process.env.MDSP_SESSION && process.env.MDSP_XSRF_TOKEN) {
        return getColor("yellow");
    } else {
        return color;
    }
}

export function getSdk(options: any) {
    let sdk: MindSphereSdk;
    const magenta = getColor("magenta");
    const yellow = getColor("yellow");

    if (options.passkey) {
        verboseLog(
            `The passkey was specified as command line option using ${magenta("service/app credentials")}`,
            options.verbose
        );

        const auth = loadAuth();
        options._selected_mode = "passkey";
        sdk = new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, options.passkey) });
    } else if (process.env.MDSP_PASSKEY && process.env.MDSP_PASSKEY !== "") {
        verboseLog(
            `The passkey was specified in environment variable MDSP_PASSKEY using ${magenta(
                "service/app credentials"
            )}`,
            options.verbose
        );
        const auth = loadAuth();
        options.passkey = process.env.MDSP_PASSKEY;
        options._selected_mode = "passkey";
        sdk = new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, options.passkey) });
    } else if (process.env.MDSP_HOST && process.env.MDSP_SESSION && process.env.MDSP_XSRF_TOKEN) {
        verboseLog(
            `Using borrowed ${yellow("SESSION")}  and ${yellow("XSRF-TOKEN")}  cookies from ${yellow(
                process.env.MDSP_HOST
            )} for authentication`,
            options.verbose
        );

        let host = process.env.MDSP_HOST || "";
        if (!process.env.MDSP_HOST.toLowerCase().startsWith("https://")) {
            host = `https://${host}`;
        }

        sdk = new MindSphereSdk(new FrontendAuth(host, process.env.MDSP_SESSION, process.env.MDSP_XSRF_TOKEN));
        options._selected_mode = "cookie";
    } else {
        throw new Error("The passkey was not provided and there are no environment variables");
    }
    return sdk;
}

export function agentConfigLog({
    gateway,
    host,
    tenant,
    agentid,
    color,
}: {
    gateway: string;
    host: string;
    tenant: string;
    agentid: string | undefined;
    color: Function;
}) {
    console.log("\nConfigure your agent at:\n");
    console.log(
        "\t" +
            color(
                `${gateway.replace(host, tenant + "-assetmanager")}/entity/${agentid}/plugin/uipluginassetmanagermclib`
            ) +
            "\n"
    );
}

export const errorLog = (err: any, verbose: any) => {
    if (err.message) {
        console.error(`\n${red(err.message.toString())}`);
        if (verbose && err.stack) {
            console.error(red(err.stack));
        }
    } else {
        console.error(red(err.toString()));
    }
    process.exit(1);
};

export const verboseLog = (message: any, verbose: any, spinner?: any) => {
    verbose && console.log(`... ${message}`);
    if (!verbose && spinner) {
        spinner.text = `... ${message}`;
    }
};

export const proxyLog = (verbose: any, color: Function) => {
    const proxy = process.env.HTTP_PROXY || process.env.http_proxy;
    const c = color;
    verboseLog(proxy ? `Using ${c(proxy)} as proxy server` : "No proxy configured.", verbose);
};

export const homeDirLog = (verbose: any, color: Function) => {
    const c = color;
    verboseLog(`Using configuration stored in ${c(getHomeDotMcDir())}`, verbose);
};

export const retrylog = function (operation: string, c: Function = cyan) {
    let x = 0;
    return () => {
        if (x > 0) {
            console.log(`...Retry no ${c("" + x)} for ${c(operation)} operation.`);
        }
        x++;
    };
};

export const humanFileSize = (size: number) => {
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    const calculatedSize = (size / Math.pow(1024, i)).toFixed(2);
    const suffix = ["B", "KB", "MB", "GB", "TB"][i];
    return `${calculatedSize}${suffix}`;
};

export function generateTestData(
    size: number,
    fn: (x: number) => number | undefined,
    variableName: string = "variable1",
    format: "string" | "number" = "string"
) {
    const startDate = new Date();
    const results = [];
    for (let index = 0; index < size; index++) {
        const time = subtractSecond(startDate, size - index);
        const value = fn(index);

        if (value !== undefined) {
            const item: any = {
                _time: time.toISOString(),
            };

            item[variableName] = format === "string" ? value!.toString() : value;
            results.push(item);
        }
    }
    return results;
}

export function buildFilter(options: any) {
    const filter = (options.filter && JSON.parse(options.filter)) || {};
    let pointer = filter;
    if (options.assetname !== undefined && options.typeid !== undefined) {
        filter.and = {};
        pointer = filter.and;
    }
    if (options.assetname) {
        pointer.name = { contains: `${options.assetname}` };
    }
    if (options.typeid) {
        pointer.typeId = { contains: `${options.typeid}` };
    }
    return filter;
}

export function printObjectInfo(
    title: string,
    dto: object,
    options: any,
    coloredProperties: Array<string>,
    color: Function,
    depth: number = 0
) {
    console.log(`${title}`);

    if (isPrimitive(dto)) {
        console.log(dto);
        return;
    }

    for (const [key, value] of Object.entries(dto)) {
        if (Array.isArray(value)) {
            for (let index = 0; index < value.length; index++) {
                const element = value[index];
                if (isPrimitive(element)) {
                    console.log(`${key}[${color(index)}]: ${element}`);
                } else {
                    printObjectInfo(`${key}[${color(index)}]`, element, options, coloredProperties, color, depth + 1);
                }
            }
        } else if (typeof value === "object" && value !== null) {
            printObjectInfo(key, value, options, coloredProperties, color, depth + 1);
        } else {
            const words = key
                .split(/(?=[A-Z])/)
                .join(" ")
                .toLowerCase();

            console.log(`${"\t".repeat(depth)}${words}: ${coloredProperties.indexOf(key) >= 0 ? color(value) : value}`);
        }
    }
    depth === 0 && verboseLog(JSON.stringify(dto, null, 2), options.verbose);
}

export function isPrimitive(x: any) {
    return x !== Object(x);
}
