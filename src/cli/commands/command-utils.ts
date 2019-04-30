import chalk from "chalk";
import { log } from "console";
import * as fs from "fs";
import { AssetManagementModels } from "../../api/sdk";
import { verboseLog } from "../../api/utils";

export const serviceCredentialLog = () => {
    log(`\n  Important: \n`);
    log(
        `    you need to supply the ${chalk.magentaBright(
            "service credentials"
        )} for this operation and provide the passkey \n`
    );
    log(`    how to get service credentials: `);
    log(
        chalk.magentaBright(
            `    https://developer.mindsphere.io/howto/howto-selfhosted-api-access.html#creating-service-credentials`
        )
    );
};

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
    log(`  timestamp, ${color("dataPointId")}, ${chalk.greenBright("qualityCode")}, ${chalk.yellowBright("value")}`);
    log(
        `  ${subtractSecond(now, 2).toISOString()}, ${color("DP-Temperature")} ,${chalk.greenBright(
            "0"
        )}, ${chalk.yellowBright("20.34")}`
    );
    log(
        `  ${subtractSecond(now, 1).toISOString()}, ${color("DP-Humidity")}, ${chalk.greenBright(
            "0"
        )}, ${chalk.yellowBright("70")}`
    );
    log(
        `  ${subtractSecond(now, 0).toISOString()}, ${color("DP-Pressure")}, ${chalk.greenBright(
            "0"
        )}, ${chalk.yellowBright("1012.3")}`
    );

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
    verifyCommand,
    runCommand,
    jobCommand
}: {
    path: string;
    verifyCommand: string;
    runCommand: string;
    jobCommand: string;
}) => {
    log(`\nthe directory ${chalk.greenBright(path)} is ${chalk.greenBright("ready")}`);
    log(`you can now edit the template files in the directory`);
    log(`\nwhen you are done run:`);
    log(`\tmc ${chalk.magentaBright(verifyCommand)} command to verify directory and then`);
    log(`\tmc ${chalk.magentaBright(runCommand)} command to upload files and start the job`);
    log(`\nchecking progress:`);
    log(`\tmc ${chalk.magentaBright(jobCommand)} to check the progress of the job`);
};

export const generateRandom = (() => {
    const variables: string[] = [];
    return (timestamp: Date, type: AssetManagementModels.VariableDefinition.DataTypeEnum, variableName: string) => {
        !variables.includes(variableName) && variables.push(variableName);
        let result;

        // multiply the sine curves with factor to have every variable visible
        const factor = variables.indexOf(variableName) + 1;
        switch (type) {
            case AssetManagementModels.VariableDefinition.DataTypeEnum.DOUBLE:
                result = (Math.sin(timestamp.getTime()) * factor * 10).toFixed(2) + 20;
                break;
            case AssetManagementModels.VariableDefinition.DataTypeEnum.INT:
            case AssetManagementModels.VariableDefinition.DataTypeEnum.LONG:
                result = Math.floor(Math.sin(timestamp.getTime()) * factor * 20) + 40;
                break;
            case AssetManagementModels.VariableDefinition.DataTypeEnum.BOOLEAN:
                result = true;
                break;
            case AssetManagementModels.VariableDefinition.DataTypeEnum.STRING:
            case AssetManagementModels.VariableDefinition.DataTypeEnum.BIGSTRING:
                result = `${type}_${Math.random()}`;
            default:
                throw new Error(`invalid type ${type}`);
        }
        return result;
    };
})();

export function generateCsv({
    name,
    variables,
    options,
    path,
    mode
}: {
    name: string;
    variables: AssetManagementModels.AspectVariable[];
    options: any;
    path: string;
    mode: AssetManagementModels.TwinType;
}) {
    verboseLog(`Generating ${options.size} entries for ${name}`, options.verbose);
    verboseLog(`Asset TwinType: ${mode}`, options.verbose);

    const startDate = new Date();

    for (let file = options.files; file > 0; file--) {
        const date = new Date(startDate);
        date.setUTCDate(date.getUTCDate() - parseInt(options.offset));
        console.log(options.offset);

        console.log(date);
        if (mode === AssetManagementModels.TwinType.Performance) {
            // * generate one file per day
            date.setUTCDate(date.getUTCDate() - (file - 1));
            date.setUTCHours(0, 0, 0, 0);
        } else {
            // * generate one file per hour
            date.setUTCHours(file - 1, 0, 0, 0);
        }

        const fileName = `${path}/csv/${name}/${file}.csv`;
        verboseLog(`generating: ${chalk.magentaBright(fileName)}`, options.verbose);
        const stream = fs.createWriteStream(fileName);

        let headers = `_time, `;
        variables.forEach(variable => {
            headers += variable.name + ", ";
            if (variable.qualityCode) headers += variable.name + "_qc, ";
        });
        stream.write(headers.trimRight().slice(0, -1) + "\n");

        variables.forEach(variable => {
            headers += variable.name + ", ";
            if (variable.qualityCode) headers += variable.name + "_qc, ";
        });

        for (let index = options.size; index > 0; index--) {
            const currentDate =
                mode === AssetManagementModels.TwinType.Performance
                    ? subtractSecond(date, (86400 / options.size) * index)
                    : subtractSecond(date, (3600 / options.size) * index);
            let line = currentDate.toISOString() + ", ";

            variables.forEach(variable => {
                line += generateRandom(currentDate, variable.dataType, `${variable.name}`) + ", ";
                if (variable.qualityCode) line += "0, ";
            });

            stream.write(line.trimRight().slice(0, -1) + "\n");
        }
        stream.end();
    }
}

export function writeNewAssetJson(options: any, root: AssetManagementModels.RootAssetResource, path: any) {
    const asset: AssetManagementModels.Asset = {
        name: "NewAsset",
        twinType: AssetManagementModels.TwinType.Simulation,
        typeId: options.typeid,
        parentId: root.assetId,
        location: {
            country: "Germany",
            postalCode: "91052",
            region: "Bayern",
            streetAddress: "Schuhstr 60",
            latitude: 49.59099,
            longitude: 11.00783
        }
    };
    const newAssetJson = `${path}/asset.json`;
    verboseLog(`Writing ${chalk.magentaBright(newAssetJson)}`, options.verbose);
    fs.writeFileSync(`${path}/asset.json`, JSON.stringify(asset, null, 2));
}

export function createAspectDirs(path: any, element: AssetManagementModels.AssetTypeResourceAspects, options: any) {
    const csvDir = `${path}/csv/${element.name}`;
    verboseLog(`creating directory: ${chalk.magentaBright(csvDir)}`, options.verbose);
    fs.mkdirSync(csvDir);
    const jsonDir = `${path}/json/${element.name}`;
    verboseLog(`creating directory: ${chalk.magentaBright(jsonDir)}`, options.verbose);
    fs.mkdirSync(jsonDir);
}

export function makeCsvAndJsonDir(options: any) {
    const path = options.dir;
    fs.mkdirSync(path);
    fs.mkdirSync(`${path}/csv/`);
    fs.mkdirSync(`${path}/json/`);
    return path;
}
