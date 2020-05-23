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
    $("#saveButtonMessage").show();
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

    ["passkey", "username", "password", "gateway", "tenant"].forEach((x) => {
        valid = validateInput(`#text-${x}`) && valid;
    });

    ["usertenant", "appname", "appversion"].forEach((x) => {
        valid = validateInput(`#text-${x}`) && valid;
    });

    const element = {
        passkey: "" + $("#text-passkey").val(),
        username: "" + $("#text-username").val(),
        password: "" + $("#text-password").val(),
        gateway: "" + $("#text-gateway").val(),
        tenant: "" + $("#text-tenant").val(),
        usertenant: "" + $("#text-usertenant").val(),
        appName: "" + $("#text-appname").val(),
        appVersion: "" + $("#text-appversion").val(),
        createdAt: new Date().toISOString(),
        selected: true,
    };

    for (let i = 0; i < window.configuration.credentials.length; i++) {
        const element = window.configuration.credentials[i];
        element.selected = false;
    }

    valid && window.configuration.credentials.push(element);
    valid && $("#addDialog").removeClass("is-shown");
    valid && $("#saveButton").removeClass("is-disabled");
    valid && $("#saveButtonMessage").show();
    // window.alert(JSON.stringify(element, null, 2));
}

async function retrieveData() {
    let response = await fetch("configuration.json");
    window.configuration = await response.json();
    $("#saveButtonMessage").hide();
    $("#saveButton").addClass("is-disabled");
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
    await retrieveData();
    bindList();

    $("#refreshButton").on("click", async () => {
        await retrieveData();
        bindList(window.configuration);
    });
}
