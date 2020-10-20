import * as chai from "chai";
import "url-search-params-polyfill";
import { IdentityManagementClient, IdentityManagementModels, MindSphereSdk } from "../src/api/sdk";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest } from "./test-utils";
chai.should();

describe("[SDK] Identity Management Client", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });
    const identity = sdk.GetIdentityManagementClient();
    const username = `${new Date().getTime()}@unit.test.mindconnect.rocks`;
    const group = `unit.test.mindconnect.rocks.${new Date().getTime()}`;

    before(async () => {
        await cleanup(identity);
    });

    after(async () => {
        await cleanup(identity);
    });

    it("should instantiate", async () => {
        identity.should.not.be.undefined;
    });

    it("should list all users @sanity", async () => {
        const users = await identity.GetUsers();
        users.totalResults!.should.be.greaterThan(0);
    });

    it("should list all users with attributes", async () => {
        const users = await identity.GetUsers({ attributes: "userName" });
        users.totalResults!.should.be.greaterThan(0);
    });

    it("should list all users sorted", async () => {
        const users = await identity.GetUsers({ sortBy: "userName" });
        users.totalResults!.should.be.greaterThan(0);
    });

    it("the user crud operations on Users should work", async () => {
        const createdUser = await identity.PostUser({ userName: username });
        createdUser.should.not.be.null;
        createdUser.userName!.should.equal(username);

        const extId = new Date().getTime().toString();

        (createdUser as any).externalId! = extId;

        const updatedUser = await identity.PutUser(
            createdUser.id!,
            createdUser as IdentityManagementModels.ScimUserPut
        );

        (updatedUser as any).externalId.should.equal(extId);

        const user = await identity.GetUser(createdUser.id!);
        user.userName!.should.equal(username);

        const result = await identity.DeleteUser(createdUser.id!);
        result.userName!.should.equal(username);
    });

    it("the user crud operations on Groups should work", async () => {
        const createdGroup = await identity.PostGroup({ displayName: group, description: group });
        createdGroup.should.not.be.null;
        createdGroup.displayName!.should.equal(group);
        createdGroup.description!.should.equal(group);

        createdGroup.description = `${group}-updated`;
        const updatedGroup = await identity.PutGroup(
            createdGroup.id!,
            createdGroup as IdentityManagementModels.ScimGroupPost
        );

        updatedGroup.description!.should.equal(`${group}-updated`);

        const requestedGroup = await identity.GetGroup(updatedGroup.id!);
        requestedGroup.displayName!.should.equal(`${group}`);

        const searchedGroups = await identity.GetGroups({ filter: `displayName sw "unit.test.mindconnect.rocks"` });
        searchedGroups.totalResults!.should.equal(1);

        const deletedGroup = await identity.DeleteGroup(createdGroup.id!);
        deletedGroup.id!.should.equal(createdGroup.id!);
    });

    it("the crud operations on GroupMembers should work", async () => {
        const grpName = `unit.test.mindconnect.rocks.${new Date().getTime()}`;
        const createdGroup = await identity.PostGroup({
            displayName: grpName,
            description: grpName,
        });
        createdGroup.should.not.be.null;
        createdGroup.displayName!.should.equal(grpName);
        createdGroup.description!.should.equal(grpName);

        const member = await identity.PostUser({ userName: `${new Date().getTime()}@unit.test.mindconnect.rocks` });
        member.id!.should.not.be.undefined;

        const assign = await identity.PostGroupMember(createdGroup.id!, {
            type: IdentityManagementModels.ScimGroupMember.TypeEnum.USER,
            value: member.id!,
        });

        assign.value.should.equal(member.id);

        const members = await identity.GetGroupMembers(createdGroup.id!);
        members.length.should.equal(1);

        const remove = await identity.DeleteGroupMember(createdGroup.id!, member.id!);
        remove.value.should.equal(member.id);

        const updatedMembers = await identity.GetGroupMembers(createdGroup.id!);
        updatedMembers.length.should.equal(0);

        const deletedGroup = await identity.DeleteGroup(createdGroup.id!);
        deletedGroup.id!.should.equal(createdGroup.id!);
        const deletedUser = await identity.DeleteUser(member.id!);
        deletedUser.id!.should.equal(member.id!);
    });
});
async function cleanup(identity: IdentityManagementClient) {
    const groups = await (await identity.GetGroups({ filter: `displayName sw "unit.test.mindconnect.rocks"` }))
        .resources!;

    for (let index = 0; index < groups.length; index++) {
        const element = groups[index];
        await identity.DeleteGroup(element.id!);
    }

    const users = await (
        await identity.GetUsers({ sortBy: "userName", attributes: "id,userName" })
    ).resources!.filter((x) => x.userName?.endsWith("unit.test.mindconnect.rocks"));

    for (let index = 0; index < users.length; index++) {
        const element = users[index];
        await identity.DeleteUser(element.id!);
    }
}
