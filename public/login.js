let logInButton = document.getElementById("logInButton");

logInButton.addEventListener("click", () => {
    const emailInput = document.getElementById("emailInput").value;
    const passwordInput = document.getElementById("passwordInput").value;

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
            }
        })
    }
});

let logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", () => {
    fetch("/logout")
    .then(() => {
        window.location.href = "/";
    })
});