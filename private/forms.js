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

//Logout
let logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", () => {
    fetch("/logout")
    .then(() => {
        window.location.href = "/";
    })
});

window.addEventListener("load", () => {
    fetch("/api/getForms", {})
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            let formsContainer = document.getElementById("formsContainer");

            console.log(data.forms);

            data.forms.forEach(form => {
                let formElement = document.createElement("div");
                formElement.classList.add("formElement");
                formElement.innerHTML = `
                <div class="nameAndEmail">
                    <h3>${form.name}</h3>
                    <a href="mailto:${form.email}">${form.email}</a>
                </div>
                <hr>
                <h4><u>Subject:</u></h4>
                <p class="subject">${form.subject}</p>
                
                <h4><u>Message:</u></h4>
                <p>${form.message}</p>
                <button id="deleteButton-${form.id}">Delete</button>
                `
                formsContainer.appendChild(formElement);

                let deleteButton = document.getElementById("deleteButton-" + form.id);
                deleteButton.addEventListener("click", () => {
                    let blurred = document.getElementById("blurred");
                    blurred.style.opacity = "1";
                    blurred.style.pointerEvents = "all";

                    let sureContainer = document.createElement("div");
                    sureContainer.classList.add("sureContainer");
                    sureContainer.innerHTML = "<h2>Are you sure?</h2>";

                    const formYesButton = document.createElement("button");
                    formYesButton.innerHTML = "Yes";

                    const formNoButton = document.createElement("button");
                    formNoButton.innerHTML = "Yesn't";

                    sureContainer.appendChild(formYesButton);
                    sureContainer.appendChild(formNoButton);

                    formElement.appendChild(sureContainer);

                    formNoButton.addEventListener("click", () => {
                        blurred.style.opacity = "0";
                        blurred.style.pointerEvents = "none";
                        sureContainer.remove();
                    });

                    formYesButton.addEventListener("click", () => {
                        fetch("/api/deleteForm", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({id: form.id})
                        })
                        .then(res => res.json())
                        .then(data => {
                            if(data.success) {
                                blurred.style.opacity = "0";
                                blurred.style.pointerEvents = "none";
                                formElement.remove();
                            };
                        });
                    });
                });
            });
        };
    });
});