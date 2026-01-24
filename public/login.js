window.addEventListener("DOMContentLoaded", () => {
    fetch("/api/attemptsControll")
    .then(res => res.json())
    .then(data => {
        if(!data.success) {
            logInButton.disabled = true;
            logInButton.style.backgroundColor = "red";
            alert(data.message);
        }
    });
});

let logInButton = document.getElementById("logInButton");

logInButton.addEventListener("click", () => {
    const emailInput = document.getElementById("emailInput").value;
    const passwordInput = document.getElementById("passwordInput").value;

    logInButton.disabled = true;
    logInButton.style.backgroundColor = "gray";
    setTimeout(() => {
        logInButton.disabled = false;
        logInButton.style.backgroundColor = "#989178";
    }, 1000);

    fetch("/api/attemptsControll")
    .then(res => res.json())
    .then(data => {
        if(!data.success) {
            logInButton.disabled = true;
            logInButton.style.backgroundColor = "red";
            alert(data.message);
        }
    })

    if(emailInput === "" || passwordInput === "") {
        alert("Please fill in all fields!");
    }
    else {
        fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ emailInput, passwordInput })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                window.location.href = "/admin";
            }
            else {
                alert(data.message);
                if(data.blockButton === true) {
                    logInButton.disabled = true;
                    logInButton.style.backgroundColor = "red";
                }
            }
        });
    }
});

let logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", () => {
    fetch("/logout")
    .then(() => {
        window.location.href = "/";
    })
});