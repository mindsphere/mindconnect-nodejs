#!/usr/bin/env node
// Copyright (C), Siemens AG 2017
import * as program from "commander";
import iotBulkDirCommand from "./commands/iot-prepare-bulk-dir";
import agentStatusCommand from "./commands/mc-agent-status";
import agentTokenCommand from "./commands/mc-agent-token";
import createEventCommand from "./commands/mc-create-event";
import getDiagnosticCommand from "./commands/mc-get-diagnostic";
import onboardCommand from "./commands/mc-onboard";
import registerDiagnosticCommand from "./commands/mc-register-diagnostic";
import serviceCredentialsCommand from "./commands/mc-service-credentials";
import serviceTokenCommand from "./commands/mc-service-token";
import starterJsCommand from "./commands/mc-starter-js";
import starterTsCommand from "./commands/mc-starter-ts";
import unregisterDiagnoticCommand from "./commands/mc-unregister-diagnostic";
import uploadFileCommand from "./commands/mc-upload-file";
import uploadTimeSeriesCommand from "./commands/mc-upload-timeseries";
import versionAndHelp from "./commands/mc-version-help";

// * generic commands
versionAndHelp(program);

// * agent commands
onboardCommand(program);
uploadFileCommand(program);
uploadTimeSeriesCommand(program);
createEventCommand(program);
agentTokenCommand(program);
agentStatusCommand(program);

// * setup commands
serviceCredentialsCommand(program);
serviceTokenCommand(program);
registerDiagnosticCommand(program);
getDiagnosticCommand(program);
unregisterDiagnoticCommand(program);

// * setup for iot bulk upload
iotBulkDirCommand(program);

// * cli for starter projects
starterTsCommand(program);
starterJsCommand(program);

program.parse(process.argv);

if (!program.args.length) program.help();

export default program;
