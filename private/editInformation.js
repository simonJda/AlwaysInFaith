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

window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const paramKey = params.get("key") || params.get("blogKey");
    titleHeading.textContent = decodeURIComponent(paramKey);
    fetch("/api/getBlogInformation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ blogKey: decodeURIComponent(paramKey) })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            blogInformation = data.blogContent;
            console.log(blogContent);
        }
        else {
            badAlert.innerHTML = data.message;
            showBadAlert();
            setTimeout(() => {
                removeBadAlert();
            }, 3000);
        }
    })
});

let saveInformationButton = document.getElementById("saveInformation");

saveInformationButton.addEventListener("click", () => {
    const editetHeading = document.getElementById("blogHeadingInput").value;
    const editetDate = document.getElementById("blogDateInput").value;
    const editetAuthor = document.getElementById("blogAuthorInput").value;
    const editetDescription = document.getElementById("blogDescriptionInput").value;

    const params = new URLSearchParams(window.location.search);
    const paramKey = params.get("key") || params.get("blogKey");

    if(editetHeading.trim() !== "") {
        blogInformation.heading = editetHeading;
        blogInformation.thumbnail.title = editetHeading;
    }

    if(editetDate.trim() !== "") {
        blogInformation.date = editetDate;
    }

    if(editetAuthor.trim() !== "") {
        blogInformation.author = editetAuthor;
    }

    if(editetDescription.trim() !== "") {
        blogInformation.thumbnail.description = editetDescription;
    }

    fetch("/api/editetContent", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ blogInformation, blogKey: decodeURIComponent(paramKey) })
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
        
        badAlert.innerHTML = data.message;
        showBadAlert();
        setTimeout(() => {
           removeBadAlert(); 
        }, 3000);
    });
});