const goodAlert = document.getElementById("goodAlert");

function goodAlertIn(){
    goodAlert.style.right = "10px";
    setTimeout(() => {
        goodAlert.style.right = "-400px";
    }, 5000);
};

const form = document.getElementById("contactFormular");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("nameInput").value;
    const email = document.getElementById("emailInput").value;
    const subject = document.getElementById("subjectInput").value;
    const message = document.getElementById("messageInput").value;

    if (name && email && subject && message) {
        fetch("/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, subject, message })
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                goodAlert.innerHTML = "<h3>Yay!</h3><p>" + data.message +"</p>";
                goodAlertIn();
            }
            else {
                alert(data.message);
            }
    });
    }
    else {
        alert("Please fill in all fields.");
    }
});