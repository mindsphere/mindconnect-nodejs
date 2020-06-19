// Copyright (C), Siemens AG 2017
export const jstemplate: string = `const { MindConnectAgent, retry } = require ("@mindconnect/mindconnect-nodejs");

(async function () {

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const configuration = require("./agentconfig.json");
    const agent = new MindConnectAgent(configuration);
    const log = (text) => { console.log(\`[\${new Date().toISOString()}] \${text.toString()}\`); };
    const RETRYTIMES = 5; // retry the operation before giving up and throwing exception

    for (let index = 0; index < 5; index++) {
        try {

            log(\`Iteration : \${index}\`);
            // onboarding the agent
            // Check in the local agent state storage if agent is onboarded.
            // https://opensource.mindsphere.io/docs/mindconnect-nodejs/agent-development/agent-state-storage.html
            if (!agent.IsOnBoarded()) {
                // wrapping the call in the retry function makes the agent a bit more resillient
                // if you don't want to retry the operations you can always just call await agent.OnBoard(); instead.
                await retry(RETRYTIMES, () => agent.OnBoard());
                log("Agent onboarded");
            }

            // you can use agent.Sdk().GetAssetManagementClient() to get the asset id and asset type from mindsphere
            // or just copy them from Asset Manager
            const targetAssetId = "1234567....";
            const targetAssetType = "<tenant>.Engine";

            // create data sourceconfiguration and mappings
            // this generates a data source configuration from an asset type
            const config = await agent.GenerateDataSourceConfiguration(targetAssetType);

            // create/overwrite the data source configuration
            await agent.PutDataSourceConfiguration(config);

            // create mappings for asset id
            const mappings = await agent.GenerateMappings(targetAssetId);
            // store mappings in mindsphere
            await agent.PutDataMappings(mappings);

            // instead of creating the data source configuration and mappings separately
            // you can also just use the method below which takes care of everything
            // this is only used for 1:1 asset -> agent mappings
            // the method above can also map the data source configuration to multiple assets
            // just call GenerateMappings with different asset ids

            await agent.ConfigureAgentForAssetId(targetAssetId);

            // Check in the local agent state storage if agent has data source configuration.
            if (!agent.HasDataSourceConfiguration()) {
                await retry(RETRYTIMES, () => agent.GetDataSourceConfiguration());
                log("Configuration aquired");
            }

            const values = [
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

            const event = {
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

            // upload file;  you can also just call await agent.Upload(...) if you don't want to retry the operation
            await retry(RETRYTIMES, () => agent.Upload("package.json", "application/json", "Demo File"));
            log("file uploaded");
            await sleep(1000);

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const bulk = [{
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
