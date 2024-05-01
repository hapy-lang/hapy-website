import * as monaco from 'monaco-editor';
import { monarchSettings } from './monarch-settings';

// elements
var outputContainer = document.getElementById("output");
var pythonCodeContainer = document.getElementById("python_code");
var hapyApiBaseUrl = 'https://hapy-api.onrender.com';

var runEndpoint = hapyApiBaseUrl + '/api/run';

monaco.languages.register({
    id: 'hapy'
});
monaco.languages.setMonarchTokensProvider('hapy', monarchSettings());

// Define a new theme that constains only rules that match this language
monaco.editor.defineTheme('myCoolTheme', {
    base: 'vs',
    inherit: false,
    rules: [
        { token: 'custom-info', foreground: '808080' },
        { token: 'custom-error', foreground: 'ff0000', fontStyle: 'bold' },
        { token: 'custom-notice', foreground: 'FFA500' },
        { token: 'custom-date', foreground: '008800' }
    ]
});

window.editor = monaco.editor.create(document.getElementById('container'), {
    value: getCode(),
    language: 'hapy'
});

// window.editor = monaco.editor.create(document.getElementById('container'), {
//     value: getCode(),
//     language: 'hapy'
// });

let select = document.getElementById("themeselect");
let currentTheme = "vs";
select.onchange = function() {
    currentTheme = select.options[select.selectedIndex].value;
    monaco.editor.setTheme(currentTheme);
};

function getCode() {
    return [
        "#! lang=hausa",
        "",
        "ayyana gayar() {",
        " nuna('Sannu!');",
        "};",
        "",
        "gayar();"
    ].join("\n");
};

function reset() {
    outputContainer.innerText = "";
    outputContainer.style.borderColor = "initial";
    pythonCodeContainer.innerText = "running..."
}

function loading() {
    document.getElementById("loader").style.display = "block";

    setTimeout(() => {
        document.getElementById("loader").style.display = "none";
    }, 1000)
}

export async function runcode() {

    reset();
    loading();

    let code = window.editor.getValue();
    let compile_only = document.getElementById("compile_only");

    let req_body = {
        code,
        option: "execute_only",
        compile_only: compile_only.checked,
        save: false,
        challenge_id: ""
    }


    fetch(runEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            "Authorization": "Bearer " + JSON.parse(localStorage.getItem("hapyland_token"))

        },
        body: JSON.stringify(req_body)
    }).then(async function(response) {
        // ...
        if (response.ok) {
            // console.log('Code compiled successfully!');
            let res = await response.json();

            if (res.status == "error" || res.data.error) {
                outputContainer.innerText = res.data.error;
                outputContainer.style.borderColor = "red";
                pythonCodeContainer.innerText = "ERROR!";
            } else {
                outputContainer.innerText = res.data.python_result;
                pythonCodeContainer.innerText = res.data.python_source;
            }
        } else {
            outputContainer.innerText = "ERROR2!";
            outputContainer.style.borderColor = "red";
            pythonCodeContainer.innerText = "ERROR3!";
        }
    }).catch(async function(response) {
        // console.log('Code compiled successfully!');
        let res = await response.json();
    })

}