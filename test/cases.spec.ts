import { expect } from "chai";
import { it } from "mocha";
import { MindSphereSdk } from "../src";
import { decrypt, loadAuth } from "../src/api/utils";
import { getPasskeyForUnitTest } from "./test-utils";

describe("[Cases] Cases", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });

    const cmg = sdk.GetCaseManagementClient();

    before(async () => {
        const unitTestCases = await cmg.GetCases({
            filter: JSON.stringify({ title: { startsWith: "[UNIT TEST]" } }),
        });

        unitTestCases.cases = unitTestCases.cases || [];

        for (let index = 0; index < unitTestCases.cases?.length; index++) {
            const currentCase = unitTestCases.cases[index];
            await cmg.DeleteCase(currentCase.handle!, { ifMatch: currentCase.eTag! });
        }
        // console.log(`deleted ${unitTestCases.cases.length} cases`);
    });

    it("should create a case ", async () => {
        const createdCase = await cmg.CreateCase({
            title: `[UNIT TEST] ${new Date().toISOString()}`,
            dueDate: new Date().toISOString(),
        });
        expect(createdCase.handle).to.not.be.undefined;
    });

    it("should update a case ", async () => {
        const createdCase = await cmg.CreateCase({
            title: `[UNIT TEST] ${new Date().toISOString()}`,
            dueDate: new Date().toISOString(),
        });
        const updatedCase = await cmg.UpdateCase(
            createdCase.handle!,
            { description: "123", dueDate: new Date().toISOString(), title: `[UNIT TEST] ${new Date().toISOString()}` },
            { ifMatch: createdCase.eTag! }
        );
        expect(updatedCase.handle).to.not.be.undefined;
    });

    it("should get case activities  ", async () => {
        await cmg.CreateCase({ title: `[UNIT TEST] ${new Date().toISOString()}`, dueDate: new Date().toISOString() });
        const caseActivities = await cmg.GetCasesActivities();
        expect(caseActivities.activities?.length).to.be.greaterThan(0);
    });

    it("should get case summary", async () => {
        await cmg.CreateCase({ title: "[UNIT TEST]", dueDate: new Date().toISOString() });
        const caseSummary = await cmg.GetCasesAggregate();
        expect(caseSummary.totalCases).to.be.greaterThan(0);
    });

    it("should create case comment", async () => {
        const createdCase = await cmg.CreateCase({
            title: `[UNIT TEST] ${new Date().toISOString()}`,
            dueDate: new Date().toISOString(),
        });
        const comment = await cmg.CreateComment(createdCase.handle!, {
            description: "This is a comment",
            isActive: true,
        });
        expect(comment.isActive).to.be.true;
    });
});
