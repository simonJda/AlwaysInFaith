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
let blogContent = {};
let blogKey;

window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const paramKey = params.get("key") || params.get("blogKey");
    titleHeading.textContent = decodeURIComponent(paramKey);
    blogKey = paramKey;

    fetch("/api/getBlogInformation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ blogKey })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            blogContent = data.blogContent[blogKey];
        }
        else {
            badAlert.innerHTML = data.message;
            showBadAlert();
            setTimeout(() => {
                removeBadAlert();
            }, 3000);
        }
    });
});

let saveInformationButton = document.getElementById("saveInformation");

saveInformationButton.addEventListener("click", () => {
    const editedHeading = document.getElementById("blogHeadingInput").value;
    if(editedHeading.trim() !== "") {
        blogContent.heading = editedHeading;
        blogContent.thumbnail.title = editedHeading;
    }

    const editedDate = document.getElementById("blogDateInput").value;
    if(editedDate.trim() !== "") {
        blogContent.date = editedDate;
    }

    const editedAuthor = document.getElementById("blogAuthorInput").value;
    if(editedAuthor.trim() !== "") {
        blogContent.author = editedAuthor;
    }

    const editedDescription = document.getElementById("blogDescriptionInput").value;
    if(editedDescription.trim() !== "") {
        blogContent.thumbnail.description = editedDescription;
    }

    fetch("/api/editedContent", {
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
            }, 3000);
        }
        else {
            badAlert.innerHTML = data.message;
            showBadAlert();
            setTimeout(() => {
                removeBadAlert();
            }, 3000);
        }
    });
});