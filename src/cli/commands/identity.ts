import { Command } from "commander";
import { IdentityManagementClient, IdentityManagementModels, TenantManagementClient } from "../../api/sdk";
import { throwError } from "../../api/utils";
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
        .option("-r, --role [role]", "user role")
        .option("-s, --subtenant <subtenant>", "subtenant for user")
        .option("-m, --membergroup [membergroup]", "member group")
        .option("-l, --memberrole [memberrole]", "member role")
        .option("-t, --meta", "include meta information (ids, login details etc.)")
        .option("-w, --raw", "don't automatically preceed group names with mdsp_usergroup or role with mdsp_customrole")
        .option("-k, --passkey <passkey>", "passkey")
        .option("-v, --verbose", "verbose output")
        .description(color("manage mindsphere users, groups and roles *"))
        .action((options) => {
            (async () => {
                try {
                    checkRequiredParameters(options);
                    const sdk = getSdk(options);
                    color = adjustColor(color, options);
                    homeDirLog(options.verbose, color);
                    proxyLog(options.verbose, color);

                    const iam = sdk.GetIdentityManagementClient();
                    const tenantManagement = sdk.GetTenantManagementClient();

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

                    // * create commands

                    options.mode === "create" && options.user && (await createUser(iam, tenantManagement, options));
                    options.mode === "create" && options.group && (await createGroup(iam, options));
                    options.mode === "create" && options.role && (await createRole(iam, options));

                    // * delete commands

                    options.mode === "delete" && options.user && (await deleteUser(iam, options));
                    options.mode === "delete" && options.group && (await deleteGroup(iam, options));
                    options.mode === "delete" && options.role && (await deleteRole(iam, options));

                    // * user assign commands (like in settings app)
                    options.mode === "assign" &&
                        options.user &&
                        options.group &&
                        (await assignUserToGroup(iam, options));
                    options.mode === "assign" && options.user && options.role && (await assignUserToRole(iam, options));

                    // * user remove commands (like in settings app)

                    options.mode === "remove" &&
                        options.user &&
                        options.group &&
                        (await removeUserFromGroup(iam, options));

                    options.mode === "remove" &&
                        options.role &&
                        options.user &&
                        (await removeRoleFromUser(iam, options));

                    // * group assign commands (like in settings app)

                    options.mode === "assign" &&
                        options.group &&
                        options.membergroup &&
                        (await addMemberGroupToGroup(iam, options));

                    options.mode === "assign" && options.group && options.role && (await addRoleToGroup(iam, options));

                    // * group remove commands (like in settings app)

                    options.mode === "remove" &&
                        options.group &&
                        options.membergroup &&
                        (await removeMemberGroupFromGroup(iam, options));

                    options.mode === "remove" &&
                        options.group &&
                        options.role &&
                        (await removeRoleFromGroup(iam, options));

                    // * role assign commands (like in settings app)

                    options.mode === "assign" &&
                        options.role &&
                        options.memberrole &&
                        (await addMemberRoleToRole(iam, options));

                    // * role remove commands (like in settings app)

                    options.mode === "remove" &&
                        options.role &&
                        options.memberrole &&
                        (await removeMemberRoleFromRole(iam, options));
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
                `\n    mc iam --mode info --user [user] --meta \t get all infos about ${color(
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

            console.log(`\n    mc iam --mode create|delete --user <user> \t create or delete ${color("user")}`);
            console.log(`    mc iam --mode create|delete --group <group>  create or delete ${groupColor("group")}`);
            console.log(`    mc iam --mode create|delete --role  <role> \t create or delete ${roleColor("role")}`);
            console.log(
                `    mc iam --mode create --user <user> --subtenant subtenant \t create ${color(
                    "user"
                )} in specified subtenant`
            );
            console.log(
                `\n    mc iam --mode assign --user <user> --group <group> \t assign ${color(
                    "user"
                )} to user group ${groupColor("group")}`
            );

            console.log(
                `    mc iam --mode assign --user <user> --role <role> \t assign ${roleColor("role")} to user ${color(
                    "user"
                )}`
            );

            console.log(
                `    mc iam --mode assign --user <user> --group <group> \t assign ${color(
                    "user"
                )} to user group ${groupColor("group")}`
            );

            console.log(
                `    mc iam --mode assign --group <group> --membergroup <membergroup> \t assign ${groupColor(
                    "membergroup"
                )} to user group ${groupColor("group")}`
            );

            console.log(
                `    mc iam --mode assign --group <group> --role <role> \t\t\t assign ${roleColor(
                    "role"
                )} to user group ${groupColor("group")}`
            );

            console.log(
                `    mc iam --mode assign --role <role> --memberrole <memberrole> \t assign ${roleColor(
                    "member role"
                )} to custom role ${roleColor("role")}`
            );

            console.log(
                `\n    mc iam --mode remove --user <user> --group <group> \t remove ${color(
                    "user"
                )} from user group ${groupColor("group")}`
            );

            console.log(
                `    mc iam --mode remove --user <user> --role <role> \t remove ${roleColor("role")} from user ${color(
                    "user"
                )}`
            );

            console.log(
                `    mc iam --mode remove --user <user> --group <group> \t remove ${color(
                    "user"
                )} from user group ${groupColor("group")}`
            );

            console.log(
                `    mc iam --mode remove --group <group> --membergroup <membergroup> \t remove ${groupColor(
                    "membergroup"
                )} from user group ${groupColor("group")}`
            );

            console.log(
                `    mc iam --mode remove --group <group> --role <role> \t\t\t remove ${roleColor(
                    "role"
                )} from user group ${groupColor("group")}`
            );

            console.log(
                `    mc iam --mode remove --role <role> --memberrole <memberrole> \t remove ${roleColor(
                    "member role"
                )} from custom role ${roleColor("role")}`
            );

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

async function createUser(iam: IdentityManagementClient, tm: TenantManagementClient, options: any) {
    const newUser: any = { userName: options.user };

    if (options.subtenant && typeof options.subtenant === "string") {
        const subtenants = await tm.GetSubtenants();
        const subtenant = subtenants.content?.find((x) => x.displayName === options.subtenant);

        if (subtenant) {
            newUser.subtenants = [{ id: subtenant.id }];
        }
    }

    const user = await iam.PostUser(newUser);
    console.log(`user with username ${color(user.userName)} created`);
    verboseLog(JSON.stringify(user, null, 2), options.verbose);
}

async function createRole(iam: IdentityManagementClient, options: any) {
    const name = normalize(options.role, options);
    const role = await iam.PostGroup({ displayName: name, description: `created using CLI` });
    console.log(`custom role with displayName ${roleColor(role.displayName)} created`);
    verboseLog(JSON.stringify(role, null, 2), options.verbose);
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
        if (!options.raw && !name.startsWith("mdsp_customrole:") && !name.startsWith("mdsp:")) {
            if (["Developer", "DeveloperAdmin", "StandardUser", "SubTenatnUser", "TenantAdmin"].includes(name)) {
                name = "mdsp:core:" + name;
            } else {
                name = `mdsp_customrole:${name}`;
            }
        }
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
    const groups = await iam.GetGroups({ filter: `displayName eq "${normalize(options.group, options)}"` });
    if (groups.totalResults === 1) {
        const deletedGroup = await iam.DeleteGroup(groups.resources![0].id!);
        console.log(`group ${groupColor(groups.resources![0].displayName!)} deleted`);
        verboseLog(JSON.stringify(deletedGroup, null, 2), options.verbose);
    } else {
        throwError(
            `found ${color(
                groups.totalResults
            )} groups but expected 1 (--mode delete command expects the full name of the group in --group parameter) `
        );
    }
}

async function deleteRole(iam: IdentityManagementClient, options: any) {
    const roles = await iam.GetGroups({ filter: `displayName eq "${normalize(options.role, options)}"` });
    if (roles.totalResults === 1) {
        const deleteRole = await iam.DeleteGroup(roles.resources![0].id!);
        console.log(`role ${roleColor(roles.resources![0].displayName!)} deleted`);
        verboseLog(JSON.stringify(deleteRole, null, 2), options.verbose);
    } else {
        throwError(
            `found ${color(
                roles.totalResults
            )} roles but expected 1 (--mode delete command expects the full name of the role in --role parameter) `
        );
    }
}

async function assignUserToGroup(iam: IdentityManagementClient, options: any) {
    const users = await iam.GetUsers({ filter: `userName eq "${options.user}"` });
    const groups = await iam.GetGroups({ filter: `displayName eq "${normalize(options.group, options)}"` });

    if (users.totalResults !== 1) {
        throwError(
            `found ${color(users.totalResults)} users but expected 1 (you have to use the full --user name for ${
                options.mode
            } command)`
        );
    }

    if (groups.totalResults !== 1) {
        throwError(
            `found ${groupColor(
                groups.totalResults
            )} groups but expected 1 (you have to use the full --group name for ${options.mode} command)`
        );
    }

    const assigned = await iam.PostGroupMember(groups.resources![0].id!, {
        type: IdentityManagementModels.ScimGroupMember.TypeEnum.USER,
        value: users.resources![0].id!,
    });
    console.log(`assigned user ${color(options.user)} to ${groupColor(normalize(options.group, options))}`);
    verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
}

async function assignUserToRole(iam: IdentityManagementClient, options: any) {
    const users = await iam.GetUsers({ filter: `userName eq "${options.user}"` });
    const roles = await iam.GetGroups({ filter: `displayName eq "${normalize(options.role, options)}"` });

    if (users.totalResults !== 1) {
        throwError(
            `found ${color(users.totalResults)} users but expected 1 (you have to use the full --user name for --mode ${
                options.mode
            } command)`
        );
    }

    if (roles.totalResults !== 1) {
        throwError(
            `found ${roleColor(
                roleColor.totalResults
            )} roles but expected 1 (you have to use the full --role name for --mode ${options.mode} command)`
        );
    }

    const assigned = await iam.PostGroupMember(roles.resources![0].id!, {
        type: IdentityManagementModels.ScimGroupMember.TypeEnum.USER,
        value: users.resources![0].id!,
    });
    console.log(`assigned role ${roleColor(normalize(options.role, options))} to user ${color(options.user)}`);
    verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
}

async function removeUserFromGroup(iam: IdentityManagementClient, options: any) {
    const users = await iam.GetUsers({ filter: `userName eq "${options.user}"` });
    const groups = await iam.GetGroups({ filter: `displayName eq "${normalize(options.group, options)}"` });

    if (users.totalResults !== 1) {
        throwError(
            `found ${color(users.totalResults)} users but expected 1 (you have to use the full --user name for ${
                options.mode
            } command)`
        );
    }

    if (groups.totalResults !== 1) {
        throwError(
            `found ${groupColor(
                groups.totalResults
            )} groups but expected 1 (you have to use the full --group name for ${options.mode} command)`
        );
    }

    const removed = await iam.DeleteGroupMember(groups.resources![0].id!, users.resources![0].id!);
    console.log(`removed user ${color(options.user)} from ${groupColor(normalize(options.group, options))}`);
    verboseLog(JSON.stringify(removed, null, 2), options.verbose);
}

async function removeRoleFromUser(iam: IdentityManagementClient, options: any) {
    const users = await iam.GetUsers({ filter: `userName eq "${options.user}"` });
    const roles = await iam.GetGroups({ filter: `displayName eq "${normalize(options.role, options)}"` });

    if (users.totalResults !== 1) {
        throwError(
            `found ${color(users.totalResults)} users but expected 1 (you have to use the full --user name for ${
                options.mode
            } command)`
        );
    }

    if (roles.totalResults !== 1) {
        throwError(
            `found ${groupColor(roles.totalResults)} groups but expected 1 (you have to use the full --group name for ${
                options.mode
            } command)`
        );
    }

    const removed = await iam.DeleteGroupMember(roles.resources![0].id!, users.resources![0].id!);
    console.log(`removed role ${roleColor(normalize(options.role, options))} from user ${color(options.user)}`);
    verboseLog(JSON.stringify(removed, null, 2), options.verbose);
}

async function addMemberGroupToGroup(iam: IdentityManagementClient, options: any) {
    const groups = await iam.GetGroups({
        filter: `displayName eq "${normalize(options.group, { group: options.group })}"`,
    });
    const memberGroups = await iam.GetGroups({
        filter: `displayName eq "${normalize(options.membergroup, { group: options.membergroup })}"`,
    });

    if (memberGroups.totalResults !== 1) {
        throwError(
            `found ${color(
                memberGroups.totalResults
            )} member groups but expected 1 (you have to use the full --membergroup name for ${options.mode} command)`
        );
    }

    if (groups.totalResults !== 1) {
        throwError(
            `found ${groupColor(
                groups.totalResults
            )} groups but expected 1 (you have to use the full --group name for ${options.mode} command)`
        );
    }

    const assigned = await iam.PostGroupMember(groups.resources![0].id!, {
        type: IdentityManagementModels.ScimGroupMember.TypeEnum.GROUP,
        value: memberGroups.resources![0].id!,
    });
    console.log(
        `assigned memberGroup ${groupColor(
            normalize(options.membergroup, { group: options.membergroup })
        )} to ${groupColor(normalize(options.group, { group: options.group }))}`
    );
    verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
}

async function removeMemberGroupFromGroup(iam: IdentityManagementClient, options: any) {
    const groups = await iam.GetGroups({
        filter: `displayName eq "${normalize(options.group, { group: options.group })}"`,
    });
    const memberGroups = await iam.GetGroups({
        filter: `displayName eq "${normalize(options.membergroup, { group: options.membergroup })}"`,
    });

    if (memberGroups.totalResults !== 1) {
        throwError(
            `found ${color(
                memberGroups.totalResults
            )} member groups but expected 1 (you have to use the full --membergroup name for ${options.mode} command)`
        );
    }

    if (groups.totalResults !== 1) {
        throwError(
            `found ${groupColor(
                groups.totalResults
            )} groups but expected 1 (you have to use the full --group name for ${options.mode} command)`
        );
    }

    const assigned = await iam.DeleteGroupMember(groups.resources![0].id!, memberGroups.resources![0].id!);
    console.log(
        `removed memberGroup ${groupColor(
            normalize(options.membergroup, { group: options.membergroup })
        )} from ${groupColor(normalize(options.group, { group: options.group }))}`
    );
    verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
}

async function addRoleToGroup(iam: IdentityManagementClient, options: any) {
    const groups = await iam.GetGroups({
        filter: `displayName eq "${normalize(options.group, { group: options.group })}"`,
    });
    const roles = await iam.GetGroups({
        filter: `displayName eq "${normalize(options.role, { role: options.role })}"`,
    });

    if (roles.totalResults !== 1) {
        throwError(
            `found ${roleColor(roles.totalResults)} roles but expected 1 (you have to use the full --role name for ${
                options.mode
            } command)`
        );
    }

    if (groups.totalResults !== 1) {
        throwError(
            `found ${groupColor(
                groups.totalResults
            )} groups but expected 1 (you have to use the full --group name for ${options.mode} command)`
        );
    }

    const assigned = await iam.PostGroupMember(roles.resources![0].id!, {
        type: IdentityManagementModels.ScimGroupMember.TypeEnum.GROUP,
        value: groups.resources![0].id!,
    });
    console.log(
        `assigned role ${roleColor(normalize(options.role, { role: options.role }))} to group ${groupColor(
            normalize(options.group, { group: options.group })
        )}`
    );
    verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
}

async function removeRoleFromGroup(iam: IdentityManagementClient, options: any) {
    const groups = await iam.GetGroups({
        filter: `displayName eq "${normalize(options.group, { group: options.group })}"`,
    });
    const roles = await iam.GetGroups({
        filter: `displayName eq "${normalize(options.role, { role: options.role })}"`,
    });

    if (roles.totalResults !== 1) {
        throwError(
            `found ${roleColor(roles.totalResults)} roles but expected 1 (you have to use the full --role name for ${
                options.mode
            } command)`
        );
    }

    if (groups.totalResults !== 1) {
        throwError(
            `found ${groupColor(
                groups.totalResults
            )} groups but expected 1 (you have to use the full --group name for ${options.mode} command)`
        );
    }

    const assigned = await iam.DeleteGroupMember(roles.resources![0].id!, groups.resources![0].id!);
    console.log(
        `removed role ${roleColor(normalize(options.role, { role: options.role }))} from group ${groupColor(
            normalize(options.group, { group: options.group })
        )}`
    );
    verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
}

async function addMemberRoleToRole(iam: IdentityManagementClient, options: any) {
    const roles = await iam.GetGroups({
        filter: `displayName eq "${normalize(options.role, { role: options.role })}"`,
    });
    const memberRoles = await iam.GetGroups({
        filter: `displayName eq "${normalize(options.memberrole, { role: options.role })}"`,
    });

    if (memberRoles.totalResults !== 1) {
        throwError(
            `found ${roleColor(
                memberRoles.totalResults
            )} member roles but expected 1 (you have to use the full --memberrole name for ${options.mode} command)`
        );
    }

    if (roles.totalResults !== 1) {
        throwError(
            `found ${roleColor(roles.totalResults)} roles but expected 1 (you have to use the full --role name for ${
                options.mode
            } command)`
        );
    }

    const assigned = await iam.PostGroupMember(memberRoles.resources![0].id!, {
        type: IdentityManagementModels.ScimGroupMember.TypeEnum.GROUP,
        value: roles.resources![0].id!,
    });
    console.log(
        `assigned member role ${roleColor(normalize(options.memberrole, { group: options.memberrole }))} to ${roleColor(
            normalize(options.role, { group: options.role })
        )}`
    );
    verboseLog(JSON.stringify(assigned, null, 2), options.verbose);
}

async function removeMemberRoleFromRole(iam: IdentityManagementClient, options: any) {
    const roles = await iam.GetGroups({
        filter: `displayName eq "${normalize(options.role, { role: options.role })}"`,
    });
    const memberRoles = await iam.GetGroups({
        filter: `displayName eq "${normalize(options.memberrole, { role: options.role })}"`,
    });

    if (memberRoles.totalResults !== 1) {
        throwError(
            `found ${roleColor(
                memberRoles.totalResults
            )} member roles but expected 1 (you have to use the full --memberrole name for ${options.mode} command)`
        );
    }

    if (roles.totalResults !== 1) {
        throwError(
            `found ${roleColor(roles.totalResults)} roles but expected 1 (you have to use the full --role name for ${
                options.mode
            } command)`
        );
    }

    const removed = await iam.DeleteGroupMember(memberRoles.resources![0].id!, roles.resources![0].id!);
    console.log(
        `removed member role ${roleColor(
            normalize(options.memberrole, { group: options.memberrole })
        )} from ${roleColor(normalize(options.role, { group: options.role }))}`
    );
    verboseLog(JSON.stringify(removed, null, 2), options.verbose);
}

function checkRequiredParameters(options: any) {
    !(["list", "create", "assign", "remove", "delete", "info"].indexOf(options.mode) >= 0) &&
        throwError(`invalid mode ${options.mode} (must be list, creete, assign, remove, delete, info)`);

    ["list", "info"].forEach((x) => {
        options.mode === x &&
            !options.user &&
            !options.group &&
            !options.role &&
            throwError(
                `you have to specify either --user [user] or --group [group] or --role [role] for mc iam --mode ${x} command`
            );
    });

    ["create", "delete"].forEach((x) => {
        options.mode === x &&
            !(typeof options.user === "string") &&
            !(typeof options.group === "string") &&
            !(typeof options.role === "string") &&
            throwError(
                `you have to specify either --user [user] or --group [group] or --role [role] for mc iam --mode ${x} command`
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
            throwError(`you have to specify full group name for iam --mode ${x} command`);

        options.mode === x &&
            options.role &&
            options.role === true &&
            throwError(`you have to specify full role name for iam --mode ${x} command`);
    });
}
