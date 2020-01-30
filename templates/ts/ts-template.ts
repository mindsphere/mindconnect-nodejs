// Copyright (C), Siemens AG 2017
export const tstemplate: string = `import { DataPointValue, MindConnectAgent, MindsphereStandardEvent, retry, TimeStampedDataPoint } from "@mindconnect/mindconnect-nodejs";

(async function () {

    const sleep = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));
    const configuration = require("./agentconfig.json");
    const agent = new MindConnectAgent(configuration);
    const log = (text: any) => { console.log(\`[\${new Date().toISOString()}] \${text.toString()}\`); };
    const RETRYTIMES = 5; // retry the operation before giving up and throwing exception

    for (let index = 0; index < 5; index++) {
        try {

            log(\`Iteration : \${index}\`);
            // onboarding the agent
            if (!agent.IsOnBoarded()) {
                // wrapping the call in the retry function makes the agent a bit more resillient
                // if you don't want to retry the operations you can always just call await agent.OnBoard(); instead.
                await retry(RETRYTIMES, () => agent.OnBoard());
                log("Agent onboarded");
            }

            if (!agent.HasDataSourceConfiguration()) {
                await retry(RETRYTIMES, () => agent.GetDataSourceConfiguration());
                log("Configuration aquired");
            }

            const values: DataPointValue[] = [
                { "dataPointId": "DP-Temperature", "qualityCode": "0", "value": (Math.sin(index) * (20 + index % 2) + 25).toString() },
                { "dataPointId": "DP-Pressure", "qualityCode": "0", "value": (Math.cos(index) * (20 + index % 25) + 25).toString() },
                { "dataPointId": "DP-Humidity", "qualityCode": "0", "value": ((index + 30) % 100).toString() },
                { "dataPointId": "DP-Acceleration", "qualityCode": "0", "value": (1000.0 + index).toString() },
                { "dataPointId": "DP-Frequency", "qualityCode": "0", "value": (60.0 + (index * 0.1)).toString() },
                { "dataPointId": "DP-Displacement", "qualityCode": "0", "value": (index % 10).toString() },
                { "dataPointId": "DP-Velocity", "qualityCode": "0", "value": (50.0 + index).toString() }
            ];

            // same like above, you can also just call  await agent.PostData(values) if you don't want to retry the operation
            // this is how to send the data with specific timestamp
            // await agent.PostData(values, new Date(Date.now() - 86400 * 1000));

            await retry(RETRYTIMES, () => agent.PostData(values));
            log("Data posted");
            await sleep(1000);

            const event: MindsphereStandardEvent = {
                "entityId": agent.ClientId(), // use assetid if you want to send event somewhere else :)
                "sourceType": "Event",
                "sourceId": "application",
                "source": "Meowz",
                "severity": 20, // 0-99 : 20:error, 30:warning, 40: information
                "timestamp": new Date().toISOString(),
                "description": "Test"
            };

            // send event with current timestamp; you can also just call agent.PostEvent(event) if you don't want to retry the operation
            await retry(RETRYTIMES, () => agent.PostEvent(event));
            log("event posted");
            await sleep(1000);

            // upload file
            // the upload-file can be a multipart operation and therefore can be configured to
            // retry the upload of the chunks instead the upload of the whole file.
            // if you don't specify the type , the mimetype is automatically determined by the library
            await agent.UploadFile(agent.ClientId(), "custom/mindsphere/path/package.json", "package.json", {
                retry: RETRYTIMES,
                description: "File uploaded with MindConnect-NodeJS Library",
                chunk: true // the chunk parameter activates multipart upload
            });

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const bulk: TimeStampedDataPoint[] =
                [{
                    "timestamp": yesterday.toISOString(),
                    "values":
                        [{ "dataPointId": "DP-Temperature", "qualityCode": "0", "value": "10" },
                        { "dataPointId": "DP-Pressure", "qualityCode": "0", "value": "10" }]
                },
                {
                    "timestamp": new Date().toISOString(),
                    "values": [{ "dataPointId": "DP-Temperature", "qualityCode": "0", "value": "10" },
                    { "dataPointId": "DP-Pressure", "qualityCode": "0", "value": "10" }]
                }];

            await retry(RETRYTIMES, () => agent.BulkPostData(bulk));
            log("bulk data uploaded");
            await sleep(1000);

        } catch (err) {
            // add proper error handling (e.g. store data somewhere, retry later etc. )
            console.error(err);
        }
    }
})();`;

export const tsconfigjson = {
  compilerOptions: {
    target: "es2015",
    module: "commonjs",
    lib: ["es2015", "dom"],
    allowJs: false,
    declaration: true,
    sourceMap: true,
    strict: true
  }
};
