const mustache = (string, data = {}) =>
    Object.entries(data).reduce(
        (res, [key, value]) => res.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), value),
        string
    );

function bindList() {
    checkList();
    const list = $("#configurationList");
    list.empty();
    const template = $("#listItem")[0];

    for (let index = 0; index < window.configuration.credentials.length; index++) {
        const element = window.configuration.credentials[index];

        const x = `${template.innerHTML}`;
        element.index = index;
        element.color = element.selected ? "black has-color-functionalGreen" : "black has-color-forced-gray200";

        // window.alert(x)
        list.append(mustache(x, element));
    }

    return false;
}

function remove(index) {
    window.configuration.credentials.splice(index, 1);
    bindList();
    $("#saveButton").removeClass("is-disabled");
}

function select(index) {
    for (let i = 0; i < window.configuration.credentials.length; i++) {
        const element = window.configuration.credentials[i];
        element.selected = i == index;
    }
    $("#saveButton").removeClass("is-disabled");
    showSaveButtonMessage();
    bindList();
}

function cancelDialog() {
    $("#addDialog").removeClass("is-shown");
}

function showDialog() {
    $("#addDialog").addClass("is-shown");
}

function validateInput(id) {
    let isValid = $(id).val() !== undefined && $(id).val() !== "";
    isValid && $(id).removeClass("is-invalid");
    !isValid && $(id).addClass("is-invalid");

    return isValid;
}

function addNew() {
    let valid = true;

    const appcredentials = $("#radio-button01").is(":checked");

    ["passkey", "user", "password", "gateway", "tenant"].forEach((x) => {
        valid = validateInput(`#text-${x}`) && valid;
    });

    if (appcredentials) {
        ["usertenant", "appname", "appversion"].forEach((x) => {
            valid = validateInput(`#text-${x}`) && valid;
        });
    }

    const element = {
        type: appcredentials ? "APP" : "SERVICE",
        passkey: "" + $("#text-passkey").val(),
        user: "" + $("#text-user").val(),
        password: "" + $("#text-password").val(),
        gateway: "" + $("#text-gateway").val(),
        tenant: "" + $("#text-tenant").val(),
        usertenant: "",
        appName: "",
        appVersion: "",
        createdAt: new Date().toISOString(),
        selected: true,
    };

    if (appcredentials) {
        element.usertenant = "" + $("#text-usertenant").val();
        element.appName = "" + $("#text-appname").val();
        element.appVersion = "" + $("#text-appversion").val();
    }

    for (let i = 0; i < window.configuration.credentials.length; i++) {
        const element = window.configuration.credentials[i];
        element.selected = false;
    }

    valid && window.configuration.credentials.push(element);
    valid && $("#addDialog").removeClass("is-shown");
    valid && $("#saveButton").removeClass("is-disabled");
    valid && showSaveButtonMessage();
    valid && bindList();
}

async function saveData() {
    const cred = window.configuration.credentials || [];

    const body = {
        credentials: [],
    };
    cred.forEach((credential) => {
        let x = { ...credential };
        delete x.index;
        delete x.color;
        body.credentials.push(x);
    });

    let response = await fetch("/sc/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return response;
}

async function retrieveData() {
    let response = await fetch("/sc/config");
    if (!response.ok) {
        throw new Error(`Communication.error ${await response.text()}`);
    }
    window.configuration = await response.json();
    hideSaveButtonMessage();
    $("#saveButton").addClass("is-disabled");
}

function hideSaveButtonMessage() {
    $("#saveButtonMessage").hide();
}

function showSaveButtonMessage() {
    $("#saveButtonMessage").show();
    setTimeout(hideSaveButtonMessage, 3000);
}

function hideErrorMessage() {
    $("#errorMessage").hide();
}

function showErrorMessage(error) {
    $("#errorMessageText").html(`${error.message}`);
    $("#errorMessage").show();
}

function checkList() {
    let count = 0;
    for (let i = 0; i < window.configuration.credentials.length; i++) {
        const element = window.configuration.credentials[i];
        element.selected && count++;
    }

    if (count !== 1) {
        for (let i = 0; i < window.configuration.credentials.length; i++) {
            const element = window.configuration.credentials[i];
            element.selected = i == 0;
        }
    }
}

async function init(e) {
    $("mdsp-logout").hide();
    $("mdsp-platform-dropdown").hide();
    $("._mdsp-operatorType__innerWrap").html(" &nbsp;&nbsp;CLI&nbsp;&nbsp;&nbsp;&nbsp; ");
    window.configuration = [];

    try {
        await retrieveData();
        bindList();
    } catch (err) {
        showErrorMessage(err);
    }

    $("#refreshButton").on("click", async () => {
        try {
            await retrieveData();
            bindList();
        } catch (err) {
            showErrorMessage(err);
        }
    });

    $("#saveButton").on("click", async () => {
        try {
            await saveData();
            await retrieveData();
            bindList();
        } catch (err) {
            showErrorMessage(err);
        }
    });
}
