import { CommanderStatic } from "commander";
import { log } from "console";
import { IdentityManagementClient, IdentityManagementModels, MindSphereSdk } from "../../api/sdk";
import { decrypt, loadAuth, throwError } from "../../api/utils";
import { errorLog, getColor, homeDirLog, proxyLog, serviceCredentialLog, verboseLog } from "./command-utils";

const color = getColor("magenta");

export default (program: CommanderStatic) => {
    program
        .command("identity-management")
        .alias("iam")
        .option(
            "-m, --mode [list|create|assign|remove|delete]",
            "Mode can be list | create | assign | remove | delete",
            "list"
        )
        .option("-u, --user [user]", "user name")
        .option("-g, --group [group]", "user group")
        .option("-m, --membergroup [membergroup]", "member group")
        .option("-r, --raw", "don't automatically preceed group names with mdsp_usergroup")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-v, --verbose", "verbose output")
        .description(color("manage mindsphere users and groups *"))
        .action((options) => {
            (async () => {
                try {
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);
                    checkRequiredParamaters(options);

                    const auth = loadAuth();

                    const sdk = new MindSphereSdk({ ...auth, basicAuth: decrypt(auth, options.passkey) });
                    const iam = sdk.GetIdentityManagementClient();

                    options.mode === "list" && options.user && (await listUsers(iam, options));
                    options.mode === "list" && options.group && (await listGroups(iam, options));
                    options.mode === "create" && options.user && (await createUser(iam, options));
                    options.mode === "create" && options.group && (await createGroup(iam, options));
                    options.mode === "delete" && options.user && (await deleteUser(iam, options));
                    options.mode === "delete" && options.group && (await deleteGroup(iam, options));
                    options.mode === "assign" && (await assign(iam, options));
                    options.mode === "remove" && (await remove(iam, options));
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            log(`\n  Example:\n`);
            log(`    mc --mode list --user \t\t list all users`);
            log(`    mc --mode list --user prefix \t list all users which start with "prefix"`);
            log(`    mc --mode list --group \t\t list all groups`);
            log(`    mc --mode list --group prefix \t list all groups which start with "prefix"`);
            log(`\n    mc --mode create|delete --group groupName \t create or delete group`);
            log(`    mc --mode create|delete --user userName \t create or delete user`);
            log(`\n    mc --mode assign --group groupName --user userName \t\t Assign userName to groupName`);
            log(
                `    mc --mode assign --group groupName --membergroup memberGroupName \t Assign memberGroupName to groupName`
            );
            log(`    mc --mode remove --group groupName --user userName \t\t Delete userName from groupName`);
            log(
                `    mc --mode remove --group groupName --membergroup memberGroupName \t Delete memberGroupName from groupName`
            );

            serviceCredentialLog();
        });
};

async function listUsers(iam: IdentityManagementClient, options: any) {
    const filter: any = { attributes: "userName,groups,name" };

    if (options.user !== true) {
        filter.filter! = `userName sw "${options.user}"`;
    }

    const users = await iam.GetUsers(filter);

    users.resources?.forEach((user) => {
        const groups = user.groups?.filter((x) => x.display === "mdsp:core:TenantAdmin");

        const userColor = groups && groups.length ? color : (x: string) => x;
        const admin = groups && groups.length > 0 ? color("*") : "-";

        console.log(`${admin} ${userColor(user.userName)} [${user.groups?.length} groups]`);
        options.verbose &&
            user.groups?.forEach((grp) => {
                console.log(`\t - ${grp.display}`);
            });
    });
    console.log(`Found: ${color(users.totalResults)} users`);
}

async function listGroups(iam: IdentityManagementClient, options: any) {
    const filter: any = {};
    if (options.group !== true) {
        filter.filter! = `displayName sw "${normalizeGroupName(options.group, options)}"`;
    }

    const groups = await iam.GetGroups(filter);

    for await (const group of groups.resources || []) {
        const userCount = options.verbose ? `[${group.members?.length} users]` : "";
        console.log(`${color(group.displayName)} ${userCount}`);
        if (options.verbose) {
            for await (const member of group.members!) {
                if (member.type === IdentityManagementModels.ScimGroupMember.TypeEnum.USER) {
                    const user = await iam.GetUser(member.value);
                    console.log(`\t ${user.userName}`);
                } else {
                    const group = await iam.GetGroup(member.value);
                    console.log(`\t ${group.displayName}`);
                }
            }
        }
    }
    console.log(`Found: ${color(groups.totalResults)} groups`);
}

async function createUser(iam: IdentityManagementClient, options: any) {
    const user = await iam.PostUser({ userName: options.user });
    console.log(`user with username ${color(user.userName)} created`);
    verboseLog(JSON.stringify(user, null, 2), options.verbose);
}

async function createGroup(iam: IdentityManagementClient, options: any) {
    const name = normalizeGroupName(options.group, options);

    const group = await iam.PostGroup({ displayName: name, description: `created using CLI` });
    console.log(`group with displayName ${color(group.displayName)} created`);
    verboseLog(JSON.stringify(group, null, 2), options.verbose);
}

function normalizeGroupName(name: string, options: any) {
    if (name === undefined) {
        return name;
    }
    if (!options.raw && !name.startsWith("mdsp_usergroup:")) {
        name = `mdsp_usergroup:${name}`;
    }
    return name;
}

async function deleteUser(iam: IdentityManagementClient, options: any) {
    const users = await iam.GetUsers({ filter: `userName eq "${options.user}"` });
    if (users.totalResults === 1) {
        const deletedUser = await iam.DeleteUser(users.resources![0].id!);
        console.log(`user with username ${color(users.resources![0].userName!)} deleted`);
        verboseLog(JSON.stringify(deletedUser, null, 2), options.verbose);
    } else {
        throwError(`found ${color(users.totalResults)} users users but expected 1 `);
    }
}

async function deleteGroup(iam: IdentityManagementClient, options: any) {
    const groups = await iam.GetGroups({ filter: `displayName eq "${normalizeGroupName(options.group, options)}"` });
    if (groups.totalResults === 1) {
        const deletedGroup = await iam.DeleteGroup(groups.resources![0].id!);
        console.log(`group ${color(groups.resources![0].displayName!)} deleted`);
        verboseLog(JSON.stringify(deletedGroup, null, 2), options.verbose);
    } else {
        throwError(`found ${color(groups.totalResults)} groups but expected 1 `);
    }
}

async function assign(iam: IdentityManagementClient, options: any) {
    const users = await iam.GetUsers({ filter: `userName eq "${options.user}"` });
    const groups = await iam.GetGroups({ filter: `displayName eq "${normalizeGroupName(options.group, options)}"` });
    const membergroups = await iam.GetGroups({
        filter: `displayName eq "${normalizeGroupName(options.membergroup, options)}"`,
    });

    if (options.user && users.totalResults === 1 && groups.totalResults === 1) {
        const assigned = await iam.PostGroupMember(groups.resources![0].id!, {
            type: IdentityManagementModels.ScimGroupMember.TypeEnum.USER,
            value: users.resources![0].id!,
        });
        console.log(`assigned user ${color(options.user)} to ${color(normalizeGroupName(options.group, options))}`);
        verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
    } else if (options.user) {
        throwError(
            `found ${color(users.totalResults)} users and ${color(groups.totalResults)} groups but expected 1 of each`
        );
    } else if (options.membergroup && membergroups.totalResults === 1 && groups.totalResults === 1) {
        const assigned = await iam.PostGroupMember(groups.resources![0].id!, {
            type: IdentityManagementModels.ScimGroupMember.TypeEnum.GROUP,
            value: membergroups.resources![0].id!,
        });
        console.log(
            `assigned member ${color(options.membergroup)} to ${color(normalizeGroupName(options.group, options))}`
        );
        verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
    } else if (options.membergroup) {
        throwError(
            `found ${color(membergroups.totalResults)} membergroups && ${color(
                groups.totalResults
            )} groups but expected 1 of each`
        );
    }
}

async function remove(iam: IdentityManagementClient, options: any) {
    const users = await iam.GetUsers({ filter: `userName eq "${options.user}"` });
    const groups = await iam.GetGroups({ filter: `displayName eq "${normalizeGroupName(options.group, options)}"` });
    const membergroups = await iam.GetGroups({
        filter: `displayName eq "${normalizeGroupName(options.membergroup, options)}"`,
    });

    if (options.user && users.totalResults === 1 && groups.totalResults === 1) {
        const assigned = await iam.DeleteGroupMember(groups.resources![0].id!, users.resources![0].id!);
        console.log(`deleted user ${color(options.user)} from ${color(normalizeGroupName(options.group, options))}`);
        verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
    } else if (options.user) {
        throwError(
            `found ${color(users.totalResults)} users and ${color(groups.totalResults)} groups but expected 1 of each`
        );
    } else if (options.membergroup && membergroups.totalResults === 1 && groups.totalResults === 1) {
        const assigned = await iam.DeleteGroupMember(groups.resources![0].id!, membergroups.resources![0].id!);
        console.log(
            `deleted member ${color(options.membergroup)} from ${color(normalizeGroupName(options.group, options))}`
        );
        verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
    } else if (options.membergroup) {
        throwError(
            `found ${color(membergroups.totalResults)} membergroups && ${color(
                groups.totalResults
            )} groups but expected 1 of each`
        );
    }
}

function checkRequiredParamaters(options: any) {
    !options.passkey && throwError("you have to provide the passkey for the mc iam command");

    !(["list", "create", "assign", "remove", "delete"].indexOf(options.mode) >= 0) &&
        throwError(`invalid mode ${options.mode} (must be config, list, select or add)`);

    ["list", "create", "delete"].forEach((x) => {
        options.mode === x &&
            !options.user &&
            !options.group &&
            throwError(`you have to specify either --user [user] or --group [group]  for mc iam --mode ${x} command`);

        options.mode === x &&
            options.user &&
            options.group &&
            throwError(
                `you have to specify either --user [user] or --group [group]  for mc iam --mode ${x} command but not both`
            );
    });

    ["create", "delete", "assign", "remove"].forEach((x) => {
        options.mode === x &&
            options.user &&
            options.user === true &&
            throwError(`you have to specify full user name for iam --mode ${x} command`);

        options.mode === x &&
            options.group &&
            options.group === true &&
            throwError(`you have to specify full user name for iam --mode ${x} command`);
    });

    ["assign", "remove"].forEach((x) => {
        options.mode === x &&
            (options.group === true || !options.group) &&
            throwError(`you have to specify --group [group] iam --mode ${x} command`);

        options.mode === x &&
            options.user &&
            options.membergroup &&
            throwError(
                `you have to specify --user [user] or --membergroup [membergroup] iam --mode ${x} command but not both`
            );

        options.mode === x &&
            !options.user &&
            !options.membergroup &&
            throwError(
                `you have to specify either --user [user] or --membergroup [membergroup] iam --mode ${x} command `
            );

        options.mode === x &&
            (options.user === true || options.membergroup === true) &&
            throwError(
                `you have to specify either --user [user] or --membergroup [membergroup] iam --mode ${x} command  (no empty parameters)`
            );
    });
}
