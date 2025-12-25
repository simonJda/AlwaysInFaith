window.addEventListener("DOMContentLoaded", () => {
    let mainContainer = document.getElementById("mainContainer");
    let heading = document.getElementById("heading");
    let date = document.getElementById("date");
    let author = document.getElementById("author");
    let mainText = document.getElementById("mainText");
    let noContentHeading = document.getElementById("noContentHeading");

    if (mainText) mainText.textContent = "Loading...";

    const params = new URLSearchParams(window.location.search);
    const blogKey = params.get("blog");

    fetch("/api/blogs")
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            const blogContent = data.blogs[blogKey];
            console.log(blogContent);

            if(!blogContent || !blogContent.mainText) {
                if (mainContainer) mainContainer.style.display = "none";
                if (noContentHeading) noContentHeading.textContent = "Blog still in progress. You can check out the other Blogs (:";
                return;
            }

            if (heading) heading.innerHTML = blogContent.thumbnail.title;
            if (date) date.innerHTML = blogContent.date;
            if (author) author.innerHTML = blogContent.author;
            if (mainText) mainText.innerHTML = blogContent.mainText;
        }
    });

    let menuButton = document.getElementById("menuButton");
    let menuHr1 = document.getElementById("menuHr1");
    let menuHr2 = document.getElementById("menuHr2");
    let menuHr3 = document.getElementById("menuHr3");
    let menuIsOpen = false;
    let menuContainer = document.getElementById("menuContainer");
    let darker = document.getElementById("darker");

    if (menuButton) {
        menuButton.addEventListener("click", () => {
            if(!menuIsOpen) {
                if (menuHr1) menuHr1.style.animation = "open1 0.5s forwards";
                if (menuHr2) menuHr2.style.animation = "open2 0.5s forwards";
                if (menuHr3) menuHr3.style.animation = "open3 0.5s forwards";
                menuIsOpen = true;
                if (menuContainer) menuContainer.style.top = "60px";
                if (darker) darker.style.opacity = "1";
            }
            else {
                if (menuHr1) menuHr1.style.animation = "close1 0.5s forwards";
                if (menuHr2) menuHr2.style.animation = "close2 0.5s forwards";
                if (menuHr3) menuHr3.style.animation = "close3 0.5s forwards";
                menuIsOpen = false;
                if (menuContainer) menuContainer.style.top = "-800px";
                if (darker) darker.style.opacity = "0";
            }
        });
    }

    document.addEventListener("click", (e) => {
      const sparkCount = 10;         
      const sparkSize = 2;           
      const sparkColor = "#000";   
      const spread = 20;             
      const duration = 500;          

      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement("div");
        spark.style.position = "fixed";
        spark.style.width = sparkSize + "px";
        spark.style.height = sparkSize + "px";
        spark.style.background = sparkColor;
        spark.style.borderRadius = "50%";
        spark.style.pointerEvents = "none";
        spark.style.left = e.clientX + "px";
        spark.style.top = e.clientY + "px";

        document.body.appendChild(spark);

        const angle = (Math.PI * 2 * i) / sparkCount;
        const x = Math.cos(angle) * spread;
        const y = Math.sin(angle) * spread;

        spark.animate(
          [
            {
              transform: "translate(0, 0)",
              opacity: 1
            },
            {
              transform: `translate(${x}px, ${y}px)`,
              opacity: 0
            }
          ],
          {
            duration: duration,
            easing: "ease-out"
          }
        );

        setTimeout(() => spark.remove(), duration);
      }
    });

});
