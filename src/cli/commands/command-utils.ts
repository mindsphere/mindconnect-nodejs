import chalk from "chalk";
import { log } from "console";

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

const subtractSecond = (date: Date, seconds: number): string => {
    const newDate = new Date(date);
    newDate.setSeconds(date.getSeconds() - seconds);
    return newDate.toISOString();
};

export const displayCsvHelp = (color: (chalk: string) => string) => {
    const now = new Date();
    log("\n  Examples:\n");
    log(`    mc ts -f timeseries.csv \t\t\t\t\t upload timeseries from the csv file to mindsphere `);
    log(`    mc upload-timeseries --file timeseries.csv  --size 100  \t use http post size of 100 records `);

    log(`\n  ${color("Data Format:")} (use your own data point ids from mindsphere)\n`);
    log(`  timestamp, ${color("dataPointId")}, ${chalk.greenBright("qualityCode")}, ${chalk.yellowBright("value")}`);
    log(
        `  ${subtractSecond(now, 2)}, ${color("DP-Temperature")} ,${chalk.greenBright("0")}, ${chalk.yellowBright(
            "20.34"
        )}`
    );
    log(`  ${subtractSecond(now, 1)}, ${color("DP-Humidity")}, ${chalk.greenBright("0")}, ${chalk.yellowBright("70")}`);
    log(
        `  ${subtractSecond(now, 0)}, ${color("DP-Pressure")}, ${chalk.greenBright("0")}, ${chalk.yellowBright(
            "1012.3"
        )}`
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
    log(`\nthe directory ${chalk.magentaBright(path)} is ready`);
    log(`you can now edit the template files in the directory`);
    log(`\nwhen you are done run:`);
    log(`\tmc ${chalk.magentaBright(verifyCommand)} command to verify directory and then`);
    log(`\tmc ${chalk.magentaBright(runCommand)} command to upload files and start the job`);
    log(`\nchecking progress:`);
    log(`\tmc ${chalk.magentaBright(jobCommand)} to check the progress of the job`);
};
