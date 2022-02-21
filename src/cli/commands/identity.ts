import { Command } from "commander";
import { IdentityManagementClient, IdentityManagementModels } from "../../api/sdk";
import {
    adjustColor,
    errorLog,
    getColor,
    getSdk,
    homeDirLog,
    printObjectInfo,
    proxyLog,
    serviceCredentialLog,
    verboseLog,
} from "./command-utils";

let color = getColor("magenta");
let groupColor = getColor("green");
let roleColor = getColor("yellow");

export default (program: Command) => {
    program
        .command("identity-management")
        .alias("iam")
        .option(
            "-m, --mode [list|create|assign|remove|delete|info]",
            "Mode can be list | create | assign | remove | delete | info",
            "list"
        )
        .option("-u, --user [user]", "user name")
        .option("-g, --group [group]", "user group")
        .option("-l, --role [role]", "user role")
        .option("-m, --membergroup [membergroup]", "member group")
        .option("-t, --meta", "include meta information (ids, login details etc.)")
        .option("-r, --raw", "don't automatically preceed group names with mdsp_usergroup")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-v, --verbose", "verbose output (includes assigned users or groups and roles)")
        .description(color("manage mindsphere users and groups *"))
        .action((options) => {
            (async () => {
                try {
                    // checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const iam = sdk.GetIdentityManagementClient();

                    const users = async () => await getAllUsers(iam, options);
                    const groups = async () => await getAllGroups(iam, options);
                    const roles = async () => await getAllRoles(iam, options);

                    // * list and info commands

                    (options.mode === "list" || options.mode === "info") &&
                        options.user &&
                        printUsers(await users(), await groups(), await roles(), options);

                    (options.mode === "list" || options.mode === "info") &&
                        options.group &&
                        printGroups(await users(), await groups(), await roles(), options);

                    (options.mode === "list" || options.mode === "info") &&
                        options.role &&
                        printRoles(await users(), await groups(), await roles(), options);

                    // options.mode === "create" && options.user && (await createUser(iam, options));
                    // options.mode === "create" && options.group && (await createGroup(iam, options));

                    // options.mode === "delete" && options.user && (await deleteUser(iam, options));
                    // options.mode === "delete" && options.group && (await deleteGroup(iam, options));

                    // options.mode === "assign" && options.role && (await assignRole(iam, options));
                    // options.mode === "assign" && !options.role && (await assign(iam, options));

                    // options.mode === "remove" && (await remove(iam, options));
                } catch (err) {
                    errorLog(err, options.verbose);
                }
            })();
        })
        .on("--help", () => {
            console.log(`\n  Example:\n`);
            console.log(`    mc iam --mode list --user \t\t list all ${color("users")}`);
            console.log(
                `    mc iam --mode list --user [user] \t list all ${color("users")} which contain ${color(
                    "[user]"
                )} in the login name`
            );

            console.log(`    mc iam --mode list --group \t\t list all ${groupColor("groups")}`);
            console.log(
                `    mc iam --mode list --group [group] \t list all ${groupColor("groups")} which contain ${groupColor(
                    "[group]"
                )} in the name`
            );

            console.log(`    mc iam --mode list --role \t\t list all ${groupColor("roles")}`);
            console.log(
                `    mc iam --mode list --role [role] \t list all ${roleColor("roles")} which contain ${roleColor(
                    "[role]"
                )} in the name`
            );

            console.log(
                `    mc iam --mode info --user [user] --meta \t get all infos about ${color(
                    "users"
                )} which contain ${color("[user]")} in the login name`
            );

            console.log(
                `    mc iam --mode info --group [group] --meta \t get all infos about ${groupColor(
                    "groups"
                )} which contain ${groupColor("[group]")} in the name`
            );

            console.log(
                `    mc iam --mode info --role [role]  --meta \t get all infos about ${roleColor(
                    "roles"
                )} which contain ${roleColor("[role]")} in the name`
            );

            // log(`\n    mc iam --mode create|delete --group groupName \t create or delete group`);
            // log(`    mc iam --mode create|delete --user userName \t create or delete user`);
            // log(`\n    mc iam --mode assign --group groupName --user userName \t\t Assign userName to groupName`);
            // log(
            //     `    mc iam --mode assign --group groupName --membergroup memberGroupName \t Assign memberGroupName to groupName`
            // );
            // log(`    mc iam --mode remove --group groupName --user userName \t\t Delete userName from groupName`);
            // log(
            //     `    mc iam --mode remove --group groupName --membergroup memberGroupName \t Delete memberGroupName from groupName`
            // );

            serviceCredentialLog();
        });
};

function printUsers(
    users: IdentityManagementModels.ScimUserResponse[],
    groups: IdentityManagementModels.ScimGroup[],
    roles: IdentityManagementModels.ScimGroup[],
    options: any
) {
    if (typeof options.user === "string") {
        users = users.filter((user) => user.userName?.includes(options.user));
    }

    users.forEach((user) => {
        printUser(user, groups, roles, options);
    });

    console.log(`\n${color(users.length)} users found`);
}

function printGroups(
    users: IdentityManagementModels.ScimUserResponse[],
    groups: IdentityManagementModels.ScimGroup[],
    roles: IdentityManagementModels.ScimGroup[],
    options: any
) {
    const selected =
        typeof options.group === "string"
            ? groups.filter((group) => group.displayName?.includes(options.group))
            : groups;

    selected.forEach((group) => {
        prettyPrintMembers(group, users, groups, roles, options);

        options.meta && printObjectInfo("Meta:", group.meta || {}, options, ["lastModified"], color, 0);
    });

    console.log(`\n${groupColor(selected.length)} groups found`);
}

function prettyPrintMembers(
    group: IdentityManagementModels.ScimGroup,
    users: IdentityManagementModels.ScimUserResponse[],
    allGroups: IdentityManagementModels.ScimGroup[],
    allRoles: IdentityManagementModels.ScimGroup[],
    options: any
) {
    const members = group.members || [];

    const assignedUsers = members.filter((x) => x.type === IdentityManagementModels.ScimGroupMember.TypeEnum.USER);
    const assignedGroups = members.filter((x) => x.type === IdentityManagementModels.ScimGroupMember.TypeEnum.GROUP);
    const assignedRoles = allRoles
        .filter((role) => role.members?.map((y) => y.value).includes(group.id!))
        .map((role) => role.displayName);

    const groupOrRoleColor = options.role ? roleColor : groupColor;

    console.log(
        `${groupOrRoleColor(group.displayName)} [${assignedUsers.length + " users"} , ${groupColor(
            assignedGroups.length + " subgroups"
        )}, ${roleColor(assignedRoles.length + " roles")}]`
    );

    if (options.mode === "info") {
        console.log("Users:");
        assignedUsers.forEach((member) => {
            console.log(`\t${users.find((x) => x.id === member.value)?.userName}`);
        });

        console.log(groupColor("Groups:"));
        assignedGroups.forEach((member) => {
            console.log(`\t${allGroups.find((x) => x.id === member.value)?.displayName}`);
        });

        console.log(roleColor("Roles:"));
        assignedRoles.forEach((role) => {
            console.log(`\t${roleColor(role)}`);
        });
    }
}

function printRoles(
    users: IdentityManagementModels.ScimUserResponse[],
    groups: IdentityManagementModels.ScimGroup[],
    roles: IdentityManagementModels.ScimGroup[],
    options: any
) {
    const selected =
        typeof options.role === "string" ? roles.filter((role) => role.displayName?.includes(options.role)) : roles;

    selected.forEach((role) => {
        prettyPrintMembers(role, users, groups, roles, options);
        options.meta && printObjectInfo("Meta:", role.meta || {}, options, ["lastModified"], color, 0);
    });
    console.log(`\n${roleColor(selected.length)} roles found.`);
}

async function getAllUsers(iam: IdentityManagementClient, options: any) {
    const users = [];
    let startIndex = 1;
    let count = 500;
    let userPage;

    do {
        userPage = await iam.GetUsers({ startIndex: startIndex, count: 500, sortBy: "userName" });
        users.push(...userPage.resources!);

        startIndex += count;
    } while (startIndex < (userPage.totalResults || 1));

    return users;
}

function findInMembers(
    roleId: string,
    groups: IdentityManagementModels.ScimGroup[],
    roles: IdentityManagementModels.ScimGroup[]
) {
    const ids: string[] = [];
    const groupsandroles = groups.concat(roles);
    const foundGroups = groupsandroles.filter((x) => x.id === roleId);
    if (foundGroups.length > 0) {
        foundGroups.forEach((group) => {
            if (group.members) {
                group.members.forEach((member) => {
                    if (member.type === IdentityManagementModels.ScimGroupMember.TypeEnum.GROUP) {
                        ids.push(member.value);
                    }
                });
            }
        });
    }

    const result = groupsandroles.filter((x) => ids.includes(x.id!)).map((x) => x.displayName);

    return result.filter((value, index, self) => self.indexOf(value) === index);
}

async function getAllGroups(iam: IdentityManagementClient, options: any) {
    let filter = `displayName sw "mdsp_usergroup"`;

    return getGroupsWithFilter(iam, filter);
}

async function getAllRoles(iam: IdentityManagementClient, options: any) {
    let filter = `(displayName sw "mdsp:" or displayName sw "mdsp_customrole:")`;
    return getGroupsWithFilter(iam, filter);
}

async function getGroupsWithFilter(iam: IdentityManagementClient, filterString: string) {
    const groups = [];
    let startIndex = 1;
    let count = 500;
    let groupPage;
    do {
        groupPage = await iam.GetGroups({
            filter: filterString,
            startIndex: startIndex,
            count: 500,
        });
        groups.push(...groupPage.resources!);

        startIndex += count;
    } while (startIndex < (groupPage.totalResults || 1));

    const result = groups.sort((x, y) => {
        return x.displayName!.localeCompare(y.displayName!);
    });

    return result;
}

function printUser(
    user: IdentityManagementModels.ScimUserResponse,
    allGroups: IdentityManagementModels.ScimGroup[],
    allRoles: IdentityManagementModels.ScimGroup[],
    options: any
) {
    const groups = user.groups?.filter((x) => x.display === "mdsp:core:TenantAdmin");

    const userColor = groups && groups.length ? color : (x: string) => x;
    const admin = groups && groups.length > 0 ? color("*") : "-";
    const userGroups = user.groups?.filter((x) => x.display.startsWith("mdsp_usergroup:"));
    const userRoles = user.groups?.filter((x) => !x.display.startsWith("mdsp_usergroup:"));
    let userInfo = `${admin} ${userColor(user.userName)} (${user.name?.familyName || "<empty>"}, ${
        user.name?.givenName || "<empty>"
    }) ${user.active ? "" : color("inactive")} [${groupColor((userGroups?.length || 0) + " groups")}, ${roleColor(
        (userRoles?.length || 0) + " roles"
    )}]`;

    console.log(userInfo);

    if (options.mode == "info") {
        delete user.groups;
        console.log(`${groupColor("Groups")}:`);
        userGroups?.forEach((group) => {
            console.log(`\t${groupColor(group.display + " " + group.type)}`);
        });

        console.log(`${roleColor("Roles")}:`);
        userRoles?.forEach((role) => {
            console.log(
                `\t${roleColor(role.display)} ${
                    role.type === IdentityManagementModels.Group.TypeEnum.DIRECT
                        ? roleColor("(DIRECT)")
                        : roleColor("(INDIRECT) via:") + JSON.stringify(findInMembers(role.value!, allGroups, allRoles))
                }`
            );
        });

        options.meta && printObjectInfo("Meta:", user || {}, options, ["lastModified"], color, 0);
    }
}
// async function listUsers(iam: IdentityManagementClient, options: any) {
//     const filter: any = { attributes: "userName,groups,name" };

//     if (options.user !== true) {
//         filter.filter! = `userName sw "${options.user}"`;
//     }

//     const users = await iam.GetUsers(filter);

//     let tenantAdmins = 0;
//     users.resources?.forEach((user) => {
//         const groups = user.groups?.filter((x) => x.display === "mdsp:core:TenantAdmin");

//         const userColor = groups && groups.length ? color : (x: string) => x;
//         const admin = groups && groups.length > 0 ? color("*") : "-";
//         if (groups && groups.length > 0) tenantAdmins++;

//         let userGroups: IdentityManagementModels.Group[] = [],
//             userRoles: IdentityManagementModels.Group[] = [];

//         user.groups?.forEach((grp) => {
//             if (grp.display.startsWith("mdsp_usergroup:")) {
//                 userGroups.push(grp);
//             } else {
//                 userRoles.push(grp);
//             }
//         });

//         console.log(
//             `${admin} ${userColor(user.userName)} [${groupColor(userGroups.length)} user groups, ${roleColor(
//                 userRoles.length
//             )} roles]`
//         );

//         if (options.verbose) {
//             userGroups
//                 .sort((x, y) => {
//                     return x.display.localeCompare(y.display);
//                 })
//                 .forEach((x) => console.log(`\t - ${formatGroupOrRole(x.display)}`));
//             userRoles
//                 .sort((x, y) => {
//                     return x.display.localeCompare(y.display);
//                 })
//                 .forEach((x) => console.log(`\t - ${formatGroupOrRole(x.display)}`));
//         }
//     });
//     console.log(
//         `Total Users: ${users.totalResults} total users. [${color(tenantAdmins + " tenant admins")}, ${
//             (users.totalResults || 0) - tenantAdmins
//         } other users.]`
//     );
// }

// function formatGroupOrRole(groupName: string) {
//     return groupName.startsWith("mdsp_usergroup:") ? groupColor(groupName) : roleColor(groupName);
// }

// async function listGroupsOrRoles(iam: IdentityManagementClient, options: any) {
//     const filter: any = {};
//     if (options.group) {
//         filter.filter! = `displayName sw "${normalizeGroupName(options.group === true ? "" : options.group, options)}"`;
//     }

//     if (options.role && options.role !== true) {
//         filter.filter! = `displayName sw "${options.role}"`;
//     }

//     let count = 0;
//     const groups = await iam.GetGroups(filter);

//     for await (const group of (groups.resources || []).sort((x, y) => {
//         return x.displayName!.localeCompare(y.displayName!);
//     })) {
//         if (group.displayName!.startsWith("mdsp_usergroup:") && options.role) {
//             continue;
//         }
//         count++;
//         const userCount = options.verbose ? `[${group.members?.length} users]` : "";
//         console.log(`${formatGroupOrRole(group.displayName!)} ${userCount}`);
//         if (options.verbose) {
//             for await (const member of group.members!) {
//                 if (member.type === IdentityManagementModels.ScimGroupMember.TypeEnum.USER) {
//                     const user = await iam.GetUser(member.value);
//                     console.log(`\t ${user.userName}`);
//                 } else {
//                     const group = await iam.GetGroup(member.value);
//                     console.log(`\t ${group.displayName}`);
//                 }
//             }
//         }
//     }

//     if (options.group) {
//         console.log(`Found: ${groupColor(count)} groups`);
//     } else {
//         console.log(`Found: ${roleColor(count)} roles`);
//     }
// }

async function createUser(iam: IdentityManagementClient, options: any) {
    const user = await iam.PostUser({ userName: options.user });
    console.log(`user with username ${color(user.userName)} created`);
    verboseLog(JSON.stringify(user, null, 2), options.verbose);
}

async function createRole(iam: IdentityManagementClient, options: any) {
    createGroup(iam, options);
}

async function createGroup(iam: IdentityManagementClient, options: any) {
    const name = normalize(options.group, options);
    const group = await iam.PostGroup({ displayName: name, description: `created using CLI` });
    console.log(`group with displayName ${groupColor(group.displayName)} created`);
    verboseLog(JSON.stringify(group, null, 2), options.verbose);
}

function normalize(name: string, options: any) {
    if (options.group) {
        if (!options.raw && !name.startsWith("mdsp_usergroup:")) {
            name = `mdsp_usergroup:${name}`;
        }
    } else if (options.role) {
        if (!options.raw && !name.startsWith("mdsp_customrole:")) {
            name = `mdsp_customrole:${name}`;
        }
    }
    return name;
}

function normalizeRoleName(name: string, options: any) {
    if (name === "" || name === "true" || name === undefined) {
        return "mdsp_usergroup:";
    }
    if (!options.raw && !name.startsWith("mdsp_userrole:")) {
        name = `mdsp_usergroup:${name}`;
    }
    return name;
}

// async function deleteUser(iam: IdentityManagementClient, options: any) {
//     const users = await iam.GetUsers({ filter: `userName eq "${options.user}"` });
//     if (users.totalResults === 1) {
//         const deletedUser = await iam.DeleteUser(users.resources![0].id!);
//         console.log(`user with username ${color(users.resources![0].userName!)} deleted`);
//         verboseLog(JSON.stringify(deletedUser, null, 2), options.verbose);
//     } else {
//         throwError(`found ${color(users.totalResults)} users users but expected 1 `);
//     }
// }

// async function deleteGroup(iam: IdentityManagementClient, options: any) {
//     const groups = await iam.GetGroups({ filter: `displayName eq "${normalizeGroupName(options.group, options)}"` });
//     if (groups.totalResults === 1) {
//         const deletedGroup = await iam.DeleteGroup(groups.resources![0].id!);
//         console.log(`group ${groupColor(groups.resources![0].displayName!)} deleted`);
//         verboseLog(JSON.stringify(deletedGroup, null, 2), options.verbose);
//     } else {
//         throwError(`found ${color(groups.totalResults)} groups but expected 1 `);
//     }
// }

// async function assign(iam: IdentityManagementClient, options: any) {
//     const users = await iam.GetUsers({ filter: `userName eq "${options.user}"` });
//     const groups = await iam.GetGroups({ filter: `displayName eq "${normalizeGroupName(options.group, options)}"` });
//     const membergroups = await iam.GetGroups({
//         filter: `displayName eq "${normalizeGroupName(options.membergroup, options)}"`,
//     });

//     if (options.user && users.totalResults === 1 && groups.totalResults === 1) {
//         const assigned = await iam.PostGroupMember(groups.resources![0].id!, {
//             type: IdentityManagementModels.ScimGroupMember.TypeEnum.USER,
//             value: users.resources![0].id!,
//         });
//         console.log(`assigned user ${color(options.user)} to ${color(normalizeGroupName(options.group, options))}`);
//         verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
//     } else if (options.user) {
//         throwError(
//             `found ${color(users.totalResults)} users and ${color(groups.totalResults)} groups but expected 1 of each`
//         );
//     } else if (options.membergroup && membergroups.totalResults === 1 && groups.totalResults === 1) {
//         const assigned = await iam.PostGroupMember(groups.resources![0].id!, {
//             type: IdentityManagementModels.ScimGroupMember.TypeEnum.GROUP,
//             value: membergroups.resources![0].id!,
//         });
//         console.log(
//             `assigned member ${color(options.membergroup)} to ${color(normalizeGroupName(options.group, options))}`
//         );
//         verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
//     } else if (options.membergroup) {
//         throwError(
//             `found ${color(membergroups.totalResults)} membergroups && ${color(
//                 groups.totalResults
//             )} groups but expected 1 of each`
//         );
//     }
// }

// // the order of parameter is different for some reason in mindsphere when assigning groups and roles
// // this is why we are using second method here to assign roles
// // see also: https://github.com/mindsphere/mindconnect-nodejs/discussions/292
// async function assignRole(iam: IdentityManagementClient, options: any) {
//     const users = await iam.GetUsers({ filter: `userName eq "${options.user}"` });
//     const groups = await iam.GetGroups({ filter: `displayName eq "${normalizeGroupName(options.group, options)}"` });
//     const roles = await iam.GetGroups({ filter: `displayName eq "${options.role}"` });

//     // console.log(users.totalResults, groups.totalResults, roles.totalResults);

//     if (options.user && users.totalResults === 1 && roles.totalResults === 1) {
//         const assigned = await iam.PostGroupMember(roles.resources![0].id!, {
//             type: IdentityManagementModels.ScimGroupMember.TypeEnum.USER,
//             value: users.resources![0].id!,
//         });
//         console.log(`Assigned role ${roleColor(options.role)} to ${color(options.user)} `);
//         verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
//     } else if (options.user) {
//         throwError(
//             `found ${color(users.totalResults)} users and ${roleColor(roles.totalResults)} roles but expected 1 of each`
//         );
//     } else if (options.group && groups.totalResults === 1 && roles.totalResults === 1) {
//         const assigned = await iam.PostGroupMember(roles.resources![0].id!, {
//             type: IdentityManagementModels.ScimGroupMember.TypeEnum.GROUP,
//             value: groups.resources![0].id!,
//         });
//         console.log(`Assigned role ${roleColor(options.role)} to ${color(options.group)} `);
//         verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
//     } else if (options.group) {
//         throwError(
//             `found ${color(groups.totalResults)} groups and ${roleColor(
//                 roles.totalResults
//             )} roles but expected 1 of each`
//         );
//     }

//     //else if (options.role && roles.totalResults === 1) {
//     //     const assigned = await iam.PostGroupMember(roles.resources![0].id!, {
//     //         type: IdentityManagementModels.ScimGroupMember.TypeEnum.GROUP,
//     //         value: roles.resources![0].id!,
//     //     });
//     //     console.log(`assigned role ${color(options.role)} to ${color(normalizeGroupName(options.group, options))}`);
//     //     verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
//     // } else if (options.role) {
//     //     throwError(
//     //         `found ${color(roles.totalResults)} roles and ${color(roles.totalResults)} roles but expected 1 of each`
//     //     );
//     // }
// }

// async function remove(iam: IdentityManagementClient, options: any) {
//     const users = await iam.GetUsers({ filter: `userName eq "${options.user}"` });
//     const groups = await iam.GetGroups({ filter: `displayName eq "${normalizeGroupName(options.group, options)}"` });
//     const membergroups = await iam.GetGroups({
//         filter: `displayName eq "${normalizeGroupName(options.membergroup, options)}"`,
//     });

//     if (options.user && users.totalResults === 1 && groups.totalResults === 1) {
//         const assigned = await iam.DeleteGroupMember(groups.resources![0].id!, users.resources![0].id!);
//         console.log(`deleted user ${color(options.user)} from ${color(normalizeGroupName(options.group, options))}`);
//         verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
//     } else if (options.user) {
//         throwError(
//             `found ${color(users.totalResults)} users and ${color(groups.totalResults)} groups but expected 1 of each`
//         );
//     } else if (options.membergroup && membergroups.totalResults === 1 && groups.totalResults === 1) {
//         const assigned = await iam.DeleteGroupMember(groups.resources![0].id!, membergroups.resources![0].id!);
//         console.log(
//             `deleted member ${color(options.membergroup)} from ${color(normalizeGroupName(options.group, options))}`
//         );
//         verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
//     } else if (options.membergroup) {
//         throwError(
//             `found ${color(membergroups.totalResults)} membergroups && ${color(
//                 groups.totalResults
//             )} groups but expected 1 of each`
//         );
//     }
// }

// function checkRequiredParameters(options: any) {
//     !(["list", "create", "assign", "remove", "delete", "info"].indexOf(options.mode) >= 0) &&
//         throwError(`invalid mode ${options.mode} (must be list, creete, assign, remove, delete, info)`);

//     ["create", "delete"].forEach((x) => {
//         options.mode === x &&
//             options.role &&
//             throwError(
//                 `CREATE ROLE and DELETE ROLE operations are not public APIs in MindSphere. Please use the developer cockpit to create roles instead.`
//             );

//         options.mode === x &&
//             !options.user &&
//             !options.group &&
//             throwError(`you have to specify either --user [user] or --group [group] for mc iam --mode ${x} command`);
//     });

//     ["list", "info"].forEach((x) => {
//         options.mode === x &&
//             !options.user &&
//             !options.group &&
//             !options.role &&
//             throwError(
//                 `you have to specify either --user [user] or --group [group] or --role [role] for mc iam --mode ${x} command`
//             );

//         options.mode === x &&
//             +!!options.user + +!!options.group + +!!options.role > 1 &&
//             throwError(
//                 `you have to specify either --user [user] or --group [group] or --role [role]  for mc iam --mode ${x} command but not more than one`
//             );
//     });

//     ["info"].forEach((x) => {
//         options.mode === x &&
//             +!!options.user + +!!options.group + +!!options.role > 1 &&
//             throwError(
//                 `you have to specify either --user [user] or --group [group] or --role [role]  for mc iam --mode ${x} command but not more than one`
//             );
//     });

//     ["create", "delete", "assign", "remove"].forEach((x) => {
//         options.mode === x &&
//             options.user &&
//             options.user === true &&
//             throwError(`you have to specify full user name for iam --mode ${x} command`);

//         options.mode === x &&
//             options.group &&
//             options.group === true &&
//             throwError(`you have to specify full group name for iam --mode ${x} command`);

//         options.mode === x &&
//             options.role &&
//             options.role === true &&
//             throwError(`you have to specify full role name for iam --mode ${x} command`);
//     });

//     // ["assign", "remove"].forEach((x) => {
//     //     options.mode === x &&
//     //         (options.group === true || !options.group) &&
//     //         throwError(`you have to specify --group [group] iam --mode ${x} command`);

//     //     options.mode === x &&
//     //         options.user &&
//     //         options.membergroup &&
//     //         throwError(
//     //             `you have to specify --user [user] or --membergroup [membergroup] iam --mode ${x} command but not both`
//     //         );

//     //     options.mode === x &&
//     //         !options.user &&
//     //         !options.membergroup &&
//     //         throwError(
//     //             `you have to specify either --user [user] or --membergroup [membergroup] iam --mode ${x} command `
//     //         );

//     //     options.mode === x &&
//     //         (options.user === true || options.membergroup === true) &&
//     //         throwError(
//     //             `you have to specify either --user [user] or --membergroup [membergroup] iam --mode ${x} command  (no empty parameters)`
//     //         );
//     // });
// }
