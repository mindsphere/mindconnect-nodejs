#!/usr/bin/env node
// Copyright (C), Siemens AG 2017
import * as program from "commander";
import iotCheckBulkComand from "./commands/iot-bulk-check";
import iotBulkRunCommand from "./commands/iot-bulk-run";
import iotBulkDirCommand from "./commands/iot-prepare-bulk-dir";
import agentStatusCommand from "./commands/mc-agent-status";
import agentTokenCommand from "./commands/mc-agent-token";
import createAgentCommand from "./commands/mc-create-agent";
import createEventCommand from "./commands/mc-create-event";
import getDiagnosticCommand from "./commands/mc-get-diagnostic";
import listAssetsCommand from "./commands/mc-list-assets";
import listFilesCommand from "./commands/mc-list-files";
import offboardCommand from "./commands/mc-offboard-agent";
import onboardCommand from "./commands/mc-onboard";
import registerDiagnosticCommand from "./commands/mc-register-diagnostic";
import renewAgentCommand from "./commands/mc-renew-agent";
import serviceCredentialsCommand from "./commands/mc-service-credentials";
import serviceTokenCommand from "./commands/mc-service-token";
import starterJsCommand from "./commands/mc-starter-js";
import starterTsCommand from "./commands/mc-starter-ts";
import unregisterDiagnoticCommand from "./commands/mc-unregister-diagnostic";
import uploadFileCommand from "./commands/mc-upload-file";
import uploadTimeSeriesCommand from "./commands/mc-upload-timeseries";
import versionAndHelp from "./commands/mc-version-help";
import spectrumAnalysisCommand from "./commands/spectrum-analysis";

// * generic commands
versionAndHelp(program);

// * agent commands
onboardCommand(program);
agentTokenCommand(program);
uploadTimeSeriesCommand(program);

// * common commands
uploadFileCommand(program);
createEventCommand(program);
agentStatusCommand(program);

// * setup commands
createAgentCommand(program);
offboardCommand(program);
renewAgentCommand(program);
serviceCredentialsCommand(program);
serviceTokenCommand(program);
registerDiagnosticCommand(program);
getDiagnosticCommand(program);
unregisterDiagnoticCommand(program);

// * setup for iot bulk upload
iotBulkDirCommand(program);
iotBulkRunCommand(program);
iotCheckBulkComand(program);

// * assets and files handling commands
listAssetsCommand(program);
listFilesCommand(program);

// * analytics command

spectrumAnalysisCommand(program);

// * cli for starter projects
starterTsCommand(program);
starterJsCommand(program);

program.parse(process.argv);

if (!program.args.length) program.help();

export default program;
