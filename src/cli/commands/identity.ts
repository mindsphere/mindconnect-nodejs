import { Command } from "commander";
import { log } from "console";
import { IdentityManagementClient, IdentityManagementModels } from "../../api/sdk";
import { throwError } from "../../api/utils";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    proxyLog,
    serviceCredentialLog,
    verboseLog,
} from "./command-utils";

let color = getColor("magenta");
let cyan = getColor("cyan");
let yellow = getColor("yellow");

export default (program: Command) => {
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
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

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
            log(`    mc iam --mode list --user \t\t list all users`);
            log(`    mc iam --mode list --user prefix \t list all users which start with "prefix"`);
            log(`    mc iam --mode list --group \t\t list all groups`);
            log(`    mc iam --mode list --group prefix \t list all groups which start with "prefix"`);
            log(`\n    mc iam --mode create|delete --group groupName \t create or delete group`);
            log(`    mc iam --mode create|delete --user userName \t create or delete user`);
            log(`\n    mc iam --mode assign --group groupName --user userName \t\t Assign userName to groupName`);
            log(
                `    mc iam --mode assign --group groupName --membergroup memberGroupName \t Assign memberGroupName to groupName`
            );
            log(`    mc iam --mode remove --group groupName --user userName \t\t Delete userName from groupName`);
            log(
                `    mc iam --mode remove --group groupName --membergroup memberGroupName \t Delete memberGroupName from groupName`
            );

            serviceCredentialLog();
        });
};

async function listUsers(iam: IdentityManagementClient, options: any) {
    let startIndex = 0; // for users the startIndex starts at 0
    let userCount = 0;
    let adminCount = 0;
    let nonAdminCount = 0;

    do {
        const filter: any = { attributes: "userName,groups,name", startIndex: startIndex, sortBy: "userName" };

        if (options.user !== true) {
            filter.filter! = `userName sw "${options.user}"`;
        }

        const users = await iam.GetUsers(filter);

        users.resources?.forEach((user) => {
            userCount++;
            const groups = user.groups?.filter((x) => x.display === "mdsp:core:TenantAdmin");

            const userColor = groups && groups.length ? color : cyan;
            const admin = groups && groups.length > 0 ? color(`*`) : `-`;

            groups && groups.length > 0 ? adminCount++ : nonAdminCount++;

            console.log(`${admin} ${userColor(user.userName)} [${user.groups?.length} groups]`);
            options.verbose &&
                user.groups?.forEach((grp) => {
                    console.log(`\t - ${grp.display}`);
                });
        });

        startIndex = startIndex + users.itemsPerPage! + 1;

        if (users.totalResults === undefined || startIndex > users.totalResults) break;
    } while (true);

    console.log(
        `Found: ${userCount} users. [${color(adminCount)} tenant admins and ${cyan(nonAdminCount)} non-admin users]`
    );
}

async function listGroups(iam: IdentityManagementClient, options: any) {
    let startIndex = 1; //for groups start index starts at 1 for some reason
    let totalGroups = 0;

    let userGroups = 0;
    let coreRoles = 0;
    let otherRoles = 0;

    do {
        const filter: any = { startIndex: startIndex, sortBy: "displayName" };
        if (options.group !== true) {
            filter.filter! = `displayName sw "${normalizeGroupName(options.group, options)}"`;
        }

        const groups = await iam.GetGroups(filter);

        for await (const group of groups.resources || []) {
            const userCount = options.verbose ? `[${group.members?.length} users]` : "";

            let displayName = group.displayName || "";

            if (displayName.startsWith("mdsp_usergroup:")) {
                displayName = cyan(group.displayName);
                userGroups++;
            } else if (displayName.startsWith("mdsp:core:")) {
                displayName = color(group.displayName);
                coreRoles++;
            } else {
                displayName = yellow(group.displayName);
                otherRoles++;
            }

            console.log(`${displayName} ${userCount}`);
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

        // console.log(groups);

        totalGroups = groups.totalResults || 0;
        startIndex = startIndex + groups.itemsPerPage!;
        // console.log(startIndex, groups.startIndex, groups.totalResults);
        if (startIndex > groups.totalResults!) break;
    } while (true);

    console.log(
        `Found: ${totalGroups} groups. [${cyan(userGroups)} user groups, ${color(coreRoles)} core roles and ${yellow(
            otherRoles
        )} other roles]`
    );
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

function checkRequiredParameters(options: any) {
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
