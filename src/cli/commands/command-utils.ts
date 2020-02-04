import chalk from "chalk";
import { log } from "console";
import { AssetManagementModels } from "../../api/sdk";
import { getHomeDotMcDir } from "../../api/utils";

const magenta = getColor("magenta");
const yellow = getColor("yellow");
const green = getColor("green");
const red = getColor("red");
const cyan = getColor("cyan");

export const serviceCredentialLog = (color: Function = magenta) => {
  log(`\n  Important: \n`);
  log(
    `    you need to supply the ${color(
      "service credentials"
    )} for this operation and provide the passkey \n`
  );
  log(`    how to get service credentials: `);
  log(
    color(
      `    https://developer.mindsphere.io/howto/howto-selfhosted-api-access.html#creating-service-credentials`
    )
  );

  log(`\n  More Information: \n`);
  log(`    ${color("https://opensource.mindsphere.io")}\n`);
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
  newDate.setUTCMilliseconds(
    date.getUTCMilliseconds() - Math.floor(seconds * 1000)
  );
  return newDate;
};

export const displayCsvHelp = (color: (chalk: string) => string) => {
  const now = new Date();
  log("\n  Examples:\n");
  log(
    `    mc ts -f timeseries.csv \t\t\t\t\t upload timeseries from the csv file to mindsphere `
  );
  log(
    `    mc upload-timeseries --file timeseries.csv  --size 100  \t use http post size of 100 records `
  );

  log(
    `\n  ${color(
      "Data Format:"
    )} (use your own data point ids from mindsphere)\n`
  );
  log(
    `  timestamp, ${color("dataPointId")}, ${green("qualityCode")}, ${yellow(
      "value"
    )}`
  );
  log(
    `  ${subtractSecond(now, 2).toISOString()}, ${color(
      "DP-Temperature"
    )} ,${green("0")}, ${yellow("20.34")}`
  );
  log(
    `  ${subtractSecond(now, 1).toISOString()}, ${color(
      "DP-Humidity"
    )}, ${green("0")}, ${yellow("70")}`
  );
  log(
    `  ${subtractSecond(now, 0).toISOString()}, ${color(
      "DP-Pressure"
    )}, ${green("0")}, ${yellow("1012.3")}`
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
  log(`\nthe directory ${green(path)} is ${green("ready")}`);
  log(`you can now edit the template files in the directory`);
  log(`\nwhen you are done run:`);
  log(`\tmc ${magenta(runCommand)} command to upload files and start the job`);
  log(`\nchecking progress:`);
  log(`\tmc ${magenta(jobCommand)} to check the progress of the job`);
};

export function modeInformation(
  asset: AssetManagementModels.AssetResourceWithHierarchyPath,
  options: any
) {
  const MAX_SIZE_FOR_TS = 100;
  console.log(
    `\nRunning ${
      options.timeseries
        ? `${yellow("standard")} TimeSeries ${yellow("(deprecated)")}`
        : `${magenta("bulk")} TimeSeries`
    } ingest for ${magenta(asset.name)} of type ${magenta(
      "" + asset.typeId
    )} with twintype ${magenta("" + asset.twinType)}`
  );
  if (
    asset.twinType === AssetManagementModels.TwinType.Performance &&
    options.timeseries
  ) {
    if (parseInt(options.size, 10) > MAX_SIZE_FOR_TS) {
      options.size = MAX_SIZE_FOR_TS;
    }
    console.log(`\n${magenta("Important:")}`);
    console.log(
      `\nYou are using the ${magenta(
        "standard timeseries"
      )} ingest for the asset.`
    );
    console.log(
      `The calls to the API will be ${magenta(
        "throttled"
      )} to match your throttling limits.`
    );
    console.log(
      `The number of the records per message will be reduced to ${magenta(
        options.size
      )} per message.\n`
    );
    console.log(
      `Using this feature has a direct impact on ${magenta(
        "your"
      )} MindSphere resource consumption.`
    );
    console.log(
      `You might get a notice that you will need to upgrade your account's data ingest rate.`
    );
    console.log(
      `${yellow("Warning")} This feature is ${yellow("deprecated")}!\n`
    );
  }
}

export function getColor(name: string) {
  return chalk.level < 2
    ? (chalk as any)[name]
    : (chalk as any)[`${name}Bright`];
}

export function agentConfigLog({
  gateway,
  host,
  tenant,
  agentid,
  color
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
        `${gateway.replace(
          host,
          tenant + "-assetmanager"
        )}/entity/${agentid}/plugin/uipluginassetmanagermclib`
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
  verboseLog(
    proxy ? `Using ${c(proxy)} as proxy server` : "No proxy configured.",
    verbose
  );
};

export const homeDirLog = (verbose: any, color: Function) => {
  const c = color;
  verboseLog(`Using configuration stored in ${c(getHomeDotMcDir())}`, verbose);
};

export const retrylog = function(operation: string, c: Function = cyan) {
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
  variableName: string = "variable1"
) {
  const startDate = new Date();
  const results = [];
  for (let index = 0; index < size; index++) {
    const time = subtractSecond(startDate, size - index);
    const value = fn(index);

    if (value !== undefined) {
      const item: any = {
        _time: time.toISOString()
      };

      item[variableName] = value!.toString();
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
