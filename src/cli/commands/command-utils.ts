import chalk from "chalk";
import { log } from "console";
import { AssetManagementModels } from "../../api/sdk";

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

export function colorizeStatus(message: string) {
    switch (message) {
        case "SUCCESS":
            return chalk.greenBright(message);

        case "IN_PROGRESS":
            return chalk.yellow(message);

        case "ERROR":
            return chalk.redBright(message);

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
    runCommand,
    jobCommand
}: {
    path: string;
    runCommand: string;
    jobCommand: string;
}) => {
    log(`\nthe directory ${chalk.greenBright(path)} is ${chalk.greenBright("ready")}`);
    log(`you can now edit the template files in the directory`);
    log(`\nwhen you are done run:`);
    log(`\tmc ${chalk.magentaBright(runCommand)} command to upload files and start the job`);
    log(`\nchecking progress:`);
    log(`\tmc ${chalk.magentaBright(jobCommand)} to check the progress of the job`);
};

export function modeInformation(asset: AssetManagementModels.AssetResourceWithHierarchyPath) {
    console.log(
        `\nRunning timeseries ${
            asset.twinType === AssetManagementModels.TwinType.Performance ? "bulk API" : "API"
        } ingest for ${chalk.magentaBright(asset.name)} of type ${chalk.magentaBright(
            "" + asset.typeId
        )} with twintype ${chalk.magentaBright("" + asset.twinType)}`
    );
    if (asset.twinType === AssetManagementModels.TwinType.Performance) {
        console.log(`\n${chalk.magentaBright("Important:")}`);
        console.log(`\nYou are using the ${chalk.magentaBright("standard timeseries")} ingest for the asset.`);
        console.log(
            `The calls to the API will be ${chalk.greenBright("throttled")} to match your throttling limits.\n`
        );
    }
}
