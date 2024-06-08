// Copyright (C), Siemens AG 2017
import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import { TreeItem } from "performant-array-to-tree";
import { URL } from "url";
import { TimeStampedDataPoint } from "..";
import { IMindConnectConfiguration } from "./mindconnect-models";
const groupby = require("json-groupby");

export const convertToTdpArray = (data: any[]): TimeStampedDataPoint[] => {
    const tdpArray: TimeStampedDataPoint[] = [];
    const groupedData = groupby(data, ["timestamp"]);
    for (const element in groupedData) {
        groupedData[element].forEach((x: any) => {
            delete x["timestamp"];
        });
        const tdp: TimeStampedDataPoint = {
            timestamp: element,
            values: groupedData[element],
        };
        tdpArray.push(tdp);
    }
    return tdpArray;
};

export type authJson = {
    auth: string;
    iv: string;
    gateway: string;
    tenant: string;
    usertenant: string;
    appName: string;
    appVersion: string;
    selected: boolean;
    type: "SERVICE" | "APP";
    createdAt: string;
};

export function upgradeOldConfiguration(obj: any) {
    if (obj.auth && obj.iv && obj.gateway && obj.tenant) {
        return {
            credentials: [
                {
                    ...obj,
                    selected: true,
                    type: "SERVICE",
                    createdAt: new Date().toISOString(),
                    appName: "",
                    appVersion: "",
                    usertenant: "",
                },
            ],
        };
    }
    return obj;
}

export const isUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

export const getPiamUrl = (gateway: string, tenant: string): string => {
    const piamUrl = gateway.replace("gateway", `${tenant}.piam`);
    return piamUrl.endsWith("/") ? piamUrl : piamUrl + "/";
};

const normalizePasskey = (passkey: string): string => {
    return passkey.length < 32 ? passkey + new Array(33 - passkey.length).join("$") : passkey.substr(0, 32);
};

export const encrypt = ({
    user,
    password,
    passkey,
    gateway,
    tenant,
    type,
    usertenant,
    appName,
    appVersion,
    createdAt,
    selected,
}: credentialEntry): authJson => {
    const base64encoded = Buffer.from(`${user}:${password}`).toString("base64");
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv("aes-256-ctr", Buffer.from(normalizePasskey(passkey)), iv);
    let crypted = cipher.update(`Basic ${base64encoded}`, "utf8", "hex");
    crypted += cipher.final("hex");
    const encryptedAuth = {
        auth: crypted.toString(),
        iv: iv.toString("base64"),
        gateway: gateway,
        tenant: tenant,
        type: type,
        usertenant: usertenant,
        appName: appName,
        appVersion: appVersion,
        createdAt: createdAt,
        selected: selected,
    };
    // console.log(encryptedAuth);
    return encryptedAuth;
};

export type credentialEntry = {
    user: string;
    password: string;
    passkey: string;
    gateway: string;
    tenant: string;
    type: "SERVICE" | "APP";
    usertenant: string;
    appName: string;
    appVersion: string;
    createdAt: string;
    selected: boolean;
};

export const decrypt = (encryptedAuth: authJson, passkey: string): string => {
    const decipher = crypto.createDecipheriv(
        "aes-256-ctr",
        normalizePasskey(passkey),
        Buffer.from(encryptedAuth.iv, "base64")
    );
    let dec = decipher.update(encryptedAuth.auth, "hex", "utf8");
    dec += decipher.final("utf8");
    return dec;
};

export const getAgentDir = (path?: string) => {
    let result;
    if (fs.existsSync(`${path}/.mc/`)) {
        result = `${path}/.mc/`;
    } else if (fs.existsSync(`${process.cwd()}/.mc/`)) {
        result = `${process.cwd()}/.mc/`;
    } else {
        result = getHomeDotMcDir();
    }

    return result;
};

export const getHomeDotMcDir = () => {
    return `${os.homedir()}/.mc/`;
};

export const storeAuth = (auth: { credentials: authJson[] }) => {
    const homeDir = getHomeDotMcDir();
    if (!fs.existsSync(homeDir)) {
        fs.mkdirSync(homeDir);
    }

    const pathName = `${getHomeDotMcDir()}auth.json`;
    fs.writeFileSync(pathName, JSON.stringify(auth));
};

export const loadAuth = (): authJson => {
    const fullConfig = getFullConfig();

    let result: authJson | undefined = undefined;

    for (let index = 0; index < fullConfig.credentials.length; index++) {
        const element = fullConfig.credentials[index];

        if (element.selected) {
            result = element;
            break;
        }
    }

    !result &&
        throwError(
            "please configure the authentication: https://developer.siemens.com/industrial-iot-open-source/mindconnect-nodejs/cli/setting-up-the-cli.html "
        );

    return result!;
};

export function getFullConfig(): { credentials: authJson[] } {
    const homeDir = getHomeDotMcDir();
    if (!fs.existsSync(homeDir)) {
        fs.mkdirSync(homeDir);
        console.log(`creating ${homeDir} folder`);
    }

    // create empty auth.json
    const pathName = `${getHomeDotMcDir()}auth.json`;
    if (!fs.existsSync(pathName)) {
        fs.writeFileSync(pathName, JSON.stringify({ credentials: [] }));
        console.log(`initializing ${pathName} with empty configuration`);
    }

    const buffer = fs.readFileSync(pathName);
    let obj = JSON.parse(buffer.toString());

    // console.log(obj);

    if (obj.auth && obj.iv && obj.gateway && obj.tenant) {
        const upgraded = upgradeOldConfiguration(obj);
        fs.writeFileSync(pathName, JSON.stringify(upgraded));
        obj = upgraded;
        console.log("upgraded configuration to the new format");
    }
    return obj;
}

export const getConfigProfile = (config: IMindConnectConfiguration): string => {
    try {
        const result = `${config.content.clientCredentialProfile}`;
        if (["SHARED_SECRET", "RSA_3072"].indexOf(result) < 0) {
            throw new Error(
                "Configuration profile not supported. The library only supports the shared_secret and RSA_3072 config profiles"
            );
        }
        return result;
    } catch (err) {
        throw new Error(
            "Configuration profile not supported. The library only supports the shared_secret and RSA_3072 config profiles"
        );
    }
};

export const checkCertificate = (config: IMindConnectConfiguration, options: any): boolean => {
    const profile = getConfigProfile(config);

    if (profile === "RSA_3072") {
        if (!options.cert) {
            throw new Error("You have to specify --cert parameter for RSA_3072 agents");
        }

        if (!fs.existsSync(options.cert)) {
            throw new Error(`Can't find file ${options.cert}`);
        }
    }
    return profile === "RSA_3072";
};

const sleep = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * retry the function n times (while progressively waiting for the success) until success
 * the waiting schema is iteration * timeoutInMiliseconds (default is 300ms)
 *
 * @param {number} n
 * @param {Function} func
 * @param {number} [timoutinMilliseconds=300]
 * @param {Function} [logFunction]
 * @returns
 */
export const retry = async (n: number, func: Function, timoutinMilliseconds: number = 300, logFunction?: Function) => {
    let error;
    for (let i = 0; i < n; i++) {
        try {
            if (logFunction) {
                logFunction();
            }
            if (i > 0) {
                await sleep(i * timoutinMilliseconds);
            }
            return await func();
        } catch (err) {
            error = err;
        }
    }
    throw error;
};

export const checkAssetId = (agentId: string) => {
    if (!/[a-f0-9]{32}/gi.test(agentId)) {
        throw new Error("You have to pass valid 32 char long asset id");
    }
};

export const throwError = (error: string) => {
    throw new Error(error);
};

export const toQueryString = (qs: any) => {
    return Object.keys(qs || {})
        .filter((key) => {
            return qs[key] !== undefined;
        })
        .map((key) => {
            const value = qs[key] instanceof Date ? qs[key].toISOString() : qs[key];
            return encodeURIComponent(key) + "=" + encodeURIComponent(value);
        })
        .join("&");
};

export const removeUndefined = (obj: any) => {
    Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
    return obj;
};

export async function checksumFile(hashName: string, path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash(hashName);
        const stream = fs.createReadStream(path);
        stream.on("error", (err) => reject(err));
        stream.on("data", (chunk) => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest("hex")));
    });
}

export function pruneCert(s: string): string {
    return s
        .split(/\r\n|\r|\n/)
        .filter((x) => {
            return x.indexOf("CERTIFICATE") < 0;
        })
        .join("");
}

export function addAndStoreConfiguration(configuration: any) {
    const newConfiguration: {
        credentials: authJson[];
    } = {
        credentials: [],
    };
    (!configuration || !configuration.credentials) && throwError("invalid configuration!");
    configuration.credentials.forEach((element: credentialEntry) => {
        element.gateway = isUrl(element.gateway) ? element.gateway : `https://gateway.${element.gateway}.mindsphere.io`;
        newConfiguration.credentials.push(element.passkey ? encrypt(element) : (element as unknown as authJson));
    });
    checkList(newConfiguration.credentials);
    storeAuth(newConfiguration);
}

export function checkList(list: any[]) {
    let count = 0;
    for (let i = 0; i < list.length; i++) {
        const element = list[i];
        element.selected && count++;
    }

    if (count !== 1) {
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            element.selected = i === 0;
        }
    }
}

/**
 * Iterates over all properties of an object and returns it serialized as data points
 *
 * @export
 * @param {{ [x: string]: any }} obj Object to iterate over
 * @param {string} aspect aspect name in mindsphere
 * @param {((propertyName: string, aspect: string) => string | undefined)} dataPointFunction find id in the object
 * @param {((propertyName: string, aspect: string) => string | undefined)} qualityCodeFunction find quality code in the object
 * @param {(propertyName: string, aspect: string) => void} invalidDataFunction what to do if the data is not available
 * @returns
 */
export function convertToDataPoints(
    obj: { [x: string]: any },
    aspect: string,
    dataPointFunction: (propertyName: string, aspect: string) => string | undefined,
    qualityCodeFunction: (propertyName: string, aspect: string) => string | undefined,
    invalidDataFunction: (propertyName: string, aspect: string) => void
): { dataPointId: string; qualityCode: string; value: string }[] {
    const res: { dataPointId: string; qualityCode: string; value: string }[] = [];
    function recurse(obj: { [x: string]: any }) {
        for (const propertyName in obj) {
            const value = obj[propertyName];
            if (value) {
                if (Array.isArray(value)) {
                    const dataPointId = dataPointFunction(propertyName, aspect);
                    const qualityCode = qualityCodeFunction(propertyName, aspect);
                    if (!dataPointId || !qualityCode) {
                        invalidDataFunction(propertyName, aspect);
                    }
                    res.push({
                        dataPointId: `${dataPointId}`,
                        qualityCode: `${qualityCode}`,
                        value: `${JSON.stringify(value)}`,
                    });
                } else if (value && typeof value === "object") {
                    recurse(value);
                } else {
                    const dataPointId = dataPointFunction(propertyName, aspect);
                    const qualityCode = qualityCodeFunction(propertyName, aspect);
                    if (!dataPointId || !qualityCode) {
                        invalidDataFunction(propertyName, aspect);
                    }
                    res.push({
                        dataPointId: `${dataPointId}`,
                        qualityCode: `${qualityCode}`,
                        value: `${value}`,
                    });
                }
            }
        }
    }
    recurse(obj);
    return res;
}

export function isGuid(x: string): boolean {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(x);
}

export function printTree(treeItem: TreeItem, level: number, color: (x: string) => string) {
    const prefix = level == 0 ? "" : "│   ".repeat(level) + "├─";

    console.log(`${prefix}[${color(treeItem.data.assetId)}] ${treeItem.data.name} [${treeItem.data.typeId}]`);

    treeItem.children.forEach((child: TreeItem) => {
        printTree(child, level + 1, color);
    });
}

export function removeTrailingSlash(url: string): string {
    // billboard ends with /
    if (url.includes("/api/assetmanagement/v3/")) return url;

    if (url.includes("?")) {
        const parts = url.split("?");
        parts[0] = parts[0].replace(/\/+$/, "");
        return parts.join("?");
    } else {
        return url.replace(/\/+$/, "");
    }
}
