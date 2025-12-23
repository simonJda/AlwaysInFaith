//Cursor
const cursor = document.querySelector(".digitalCursor");

document.addEventListener("mousemove", e => {
    cursor.style.top = e.clientY + "px";
    cursor.style.left = e.clientX + "px";
});

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

//Thumbnail 

let saveThumbnailButton = document.getElementById("saveThumbnail");

saveThumbnailButton.addEventListener("click", () => {

    goodAlert.innerHTML = "Are you sure? <br>";
    goodAlert.style.textAlign = "center";

    let yesButton = document.createElement("button");
    yesButton.innerText = "Yes";
    goodAlert.appendChild(yesButton);

    let noButton = document.createElement("button");
    noButton.innerText = "Yesn't";
    goodAlert.appendChild(noButton);

    showGoodAlert();
    
    noButton.addEventListener("click", () => {
        goodAlert.innerText = "Congratulations! You just clicked two times for nothing.";
        setTimeout(() => {
            removeGoodAlert();
        }, 2000);
    });

    yesButton.addEventListener("click", () => {

        const thumbnailTitle = document.getElementById("thumbnailTitleInput").value;
        const thumbnailDescription = document.getElementById("thumbnailDescriptionInput").value;
        const thumbnailImage = document.getElementById("thumbnailImageInput");
        const thumbnailAuthor = document.getElementById("thumbnailAuthorInput").value;
        const thumbnailDate = document.getElementById("thumbnailDateInput").value;

        if(thumbnailTitle === "" || thumbnailDescription === "" || thumbnailAuthor === "" || thumbnailDate === "") {
            removeGoodAlert();
            badAlert.innerHTML = "Please fill in all fields. Otherwise, errors may occur. <br>";
            let okayButton = document.createElement("button");
            okayButton.innerText = "Okay";
            badAlert.appendChild(okayButton);
            showBadAlert();

            okayButton.addEventListener("click", () => {
                removeBadAlert();
            });

            return;
        }

        const formData = new FormData();
        formData.append("thumbnailTitle", thumbnailTitle);
        formData.append("thumbnailDescription", thumbnailDescription);
        formData.append("thumbnailAuthor", thumbnailAuthor);
        formData.append("thumbnailDate", thumbnailDate);

        if(thumbnailImage.files && thumbnailImage.files[0]) {
            formData.append("thumbnailImage", thumbnailImage.files[0]);
        }

        fetch("/api/newThumbnail", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                goodAlert.innerText = data.message;
                showGoodAlert();

                setTimeout(() => {
                    removeGoodAlert();
                }, 3000);

                return;
            }        
            badAlert.innerText = data.message;
            removeGoodAlert();
            showBadAlert();

            setTimeout(() => {
                removeBadAlert();
            }, 3000);
        })
    })
});


//help Area

let helpButton = document.getElementById("helpButton");
let helpContainer = document.getElementById("helpContainer");
let closeHelpContainer = document.getElementById("closeHelpContainer");
let helpContainerIsOpen = false;

helpButton.addEventListener("click", () => {
    if(!helpContainerIsOpen) {
        helpContainer.style.display = "block";
        helpContainerIsOpen = true;
    }
});

closeHelpContainer.addEventListener("click", () => {
    if(helpContainerIsOpen) {
        helpContainer.style.display = "none";
        helpContainerIsOpen = false;
    }
});

//Blog Content
let searchTitleButton = document.getElementById("searchTitle");

searchTitleButton.addEventListener("click", () => {
    const titleInput = document.getElementById("blogTitleInput").value;

    if(titleInput.trim() === "") {
        badAlert.innerHTML = "Please enter a title";
        showBadAlert();
        setTimeout(() => {
            removeBadAlert();
        }, 2000);
        return;
    }
    
    fetch("/api/searchTitle", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ titleInput })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            window.location.href = `/api/addContent?blogKey=${encodeURIComponent(data.blogKey)}`;
        }

        badAlert.innerHTML = data.message;
        showBadAlert();
        setTimeout(() => {
            removeBadAlert();
        }, 3000);
    })
});

//Navigation
let addThumbnailNavButton = document.getElementById("addThumbnailNav");
let ThumbnailContainer = document.getElementById("ThumbnailContainer");

let addBlogcontentNavButton = document.getElementById("addBlogcontentNav");
let blogContainer = document.getElementById("blogContainer");

let navigationContainer = document.getElementById("navigationContainer");

let goBackButton = document.getElementById("goBack");

addThumbnailNavButton.addEventListener("click", () => {
    navigationContainer.style.display = "none";
    ThumbnailContainer.style.display = "block";
    goBackButton.style.display = "block";
});

addBlogcontentNavButton.addEventListener("click", () => {
    navigationContainer.style.display = "none";
    blogContainer.style.display = "block";
    goBackButton.style.display = "block";
});

goBackButton.addEventListener("click", () => {
    ThumbnailContainer.style.display = "none";
    blogContainer.style.display = "none";
    navigationContainer.style.display = "block";
    goBackButton.style.display = "none";
    editContainer.style.display = "none";
    deleteContainer.style.display = "none";
});

//Edit Area

let editBlogInfoNavButton = document.getElementById("editBlogInfoNav");
let editContainer = document.getElementById("editContainer");
let editContainerIsOpen = false;

editBlogInfoNavButton.addEventListener("click", () => {
    if(!editContainerIsOpen) {
        editContainerIsOpen = true;
        editContainer.style.display = "block";
        navigationContainer.style.display = "none";
        goBackButton.style.display = "block";
    }
    else {
        editContainer.style.display = "none";
        navigationContainer.style.display = "block";
        editContainerIsOpen = false;
        goBackButton.style.display = "none";
    }
});

let searchTitleEditButton = document.getElementById("searchTitleEdit");

searchTitleEditButton.addEventListener("click", () => {
    const titleInput = document.getElementById("blogTitleEditInput").value;

    if(titleInput.trim() === "") {
        badAlert.innerHTML = "Add a title!";
        showBadAlert();
        setTimeout(() => {
            removeBadAlert();
        }, 2000);
        return;
    }

    fetch("/searchTitle", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ titleInput })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            window.location.href = `/api/editInformation?blogKey=${encodeURIComponent(data.blogKey)}`;
            return;
        }

        badAlert.innerHTML = data.message;
        showBadAlert();
        setTimeout(() => {
            removeBadAlert();
        }, 3000);
    });
});

//Delete Area

let deleteBlogNavButton = document.getElementById("deleteBlogNav");
let deleteContainer = document.getElementById("deleteContainer");
let deleteContainerIsOpen = false;

deleteBlogNavButton.addEventListener("click", () => {
    if(!deleteContainerIsOpen) {
        deleteContainer.style.display = "block";
        navigationContainer.style.display = "none";
        goBackButton.style.display = "block";
        deleteContainerIsOpen = true;
    }

    else {
        deleteContainer.style.display = "none";
        navigationContainer.style.display = "block";
        goBackButton.style.display = "none";
        deleteContainerIsOpen = false;
    }
});


let deleteBlogButton = document.getElementById("deleteBlogButton");

deleteBlogButton.addEventListener("click", () => {
    const blogTitleDeleteInput = document.getElementById("blogTitleDeleteInput").value;

    if(blogTitleDeleteInput.trim() === "") {
        badAlert.innerHTML = "Please enter a title!";
        showBadAlert();
        setTimeout(() => {
            removeBadAlert();
        }, 3000);
        return;
    }

    goodAlert.innerHTML = "Are you really sure you want to delete this blog? <br>";

    let yesButton = document.createElement("button");
    yesButton.innerHTML = "Yes";
    goodAlert.appendChild(yesButton);

    let noButton = document.createElement("button");
    noButton.innerHTML = "Yesn't";
    goodAlert.appendChild(noButton);

    showGoodAlert();

    yesButton.addEventListener("click", () => {

        removeGoodAlert();

        fetch("/api/deleteBlog", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ blogTitleDeleteInput })
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
            };
        });
    });

    noButton.addEventListener("click", () => {
        goodAlert.innerHTML = "So why did you even click it?! <br> <h6>(Just kidding)</h6>";
        showGoodAlert();
        setTimeout(() => {
            removeGoodAlert();
        }, 2000);
    });
});