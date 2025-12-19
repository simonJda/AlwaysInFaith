//Logout
let logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", () => {
    fetch("/logout")
    .then(() => {
        window.location.href = "/";
    })
});

//Alerts
let goodAlert = document.getElementById("goodAlert");
let badAlert = document.getElementById("badAlert");

function showGoodAlert() {
    goodAlert.style.right = "10px";
}

function showBadAlert() {
    badAlert.style.right = "10px";
}

function removeGoodAlert() {
    goodAlert.style.right = "-400px";
    setTimeout(() => {
        goodAlert.innerHTML = "";
    }, 500);
}

function removeBadAlert() {
    badAlert.style.right = "-400px";
    setTimeout(() => {
        badAlert.innerHTML = "";
    }, 500);
}

//help
let questionButton = document.getElementById("questionButton");
let questionContainer = document.getElementById("questionContainer");
let questionIsOpen = false;

questionButton.addEventListener("click", () => {
    if(!questionIsOpen) {
        questionContainer.style.display = "block";
        questionIsOpen = true;
    }
    else {
        questionIsOpen = false;
        questionContainer.style.display = "none";
    }
});

//Back to Admin Home
let backToAdminHomeButton = document.getElementById("backToAdminHome");

backToAdminHomeButton.addEventListener("click", () => {
    window.location.href = "/admin";
});

//Cursor
const cursor = document.querySelector(".digitalCursor");

document.addEventListener("mousemove", e => {
    cursor.style.top = e.clientY + "px";
    cursor.style.left = e.clientX + "px";
});

//Main
let titleHeading = document.getElementById("titleHeading");
let mainText = {};

window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const paramKey = params.get("key") || params.get("blogKey");
    titleHeading.textContent = decodeURIComponent(paramKey);
    fetch("/api/getBlogText", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ blogKey: paramKey })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            mainText = data.blogContent;
            quill.root.innerHTML = mainText;
            console.log(mainText);
        }
    })
});

//Quill function
const quill = new Quill('#editor', {
    theme: 'snow',
    modules: { toolbar: '#toolbar' }
});

const colorPicker = document.getElementById('customColorPicker');

colorPicker.addEventListener('input', () => {
    const range = quill.getSelection();
    if (range) {
        quill.format('color', colorPicker.value);
    }
});


let giveCodeButton = document.getElementById("giveCode"); 

giveCodeButton.addEventListener("click", () => {
    const html = quill.root.innerHTML;
    console.log(html);
});

let givePreviewButton = document.getElementById("givePreview");
let previewContainer = document.getElementById("previewContainer")

givePreviewButton.addEventListener("click", () => {
    const html = quill.root.innerHTML;
    previewContainer.innerHTML = html;
});

let addContentButton = document.getElementById("addContent");

addContentButton.addEventListener("click", () => {
    goodAlert.innerText = "Are You sure you want to add your Text?";
    let yesButton = document.createElement("button");
    yesButton.innerHTML = "Yes!";
    let noButton = document.createElement("button");
    noButton.innerHTML = "Yesn't";

    goodAlert.appendChild(yesButton);
    goodAlert.appendChild(noButton);

    yesButton.addEventListener("click", () => {
        const blogContent = quill.root.innerHTML;

        const params = new URLSearchParams(window.location.search);
        const paramKey = params.get("key") || params.get("blogKey");
        const blogKey = paramKey;

        fetch("/api/addBlogContent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ blogContent, blogKey })
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                goodAlert.innerHTML = data.message;
                showGoodAlert();
                setTimeout(() => {
                    removeGoodAlert();
                }, 2000);
            }
            else {
                badAlert.innerHTML = data.message;
                showBadAlert();
                setTimeout(() => {
                    removeBadAlert();
                }, 2000);
            }
        });
    });

    noButton.addEventListener("click", () => {
        goodAlert.innerHTML = "You wastet my time a little bit";
        setTimeout(() => {
            removeGoodAlert();
        }, 2000);
    });

    showGoodAlert();
});