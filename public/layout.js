let menuButton = document.getElementById("menuButton");
let menuHr1 = document.getElementById("menuHr1");
let menuHr2 = document.getElementById("menuHr2");
let menuHr3 = document.getElementById("menuHr3");
let menuIsOpen = false;
let menuContainer = document.getElementById("menuContainer");
let darker = document.getElementById("darker");

menuButton.addEventListener("click", () => {
    if(!menuIsOpen) {
        menuHr1.style.animation = "open1 0.5s forwards";
        menuHr2.style.animation = "open2 0.5s forwards";
        menuHr3.style.animation = "open3 0.5s forwards";
        menuIsOpen = true;
        menuContainer.style.top = "-40px";
        darker.style.opacity = "1";
    }
    else {
        menuHr1.style.animation = "close1 0.5s forwards";
        menuHr2.style.animation = "close2 0.5s forwards";
        menuHr3.style.animation = "close3 0.5s forwards";
        menuIsOpen = false;
        menuContainer.style.top = "-800px";
        darker.style.opacity = "0";
    }
});

document.addEventListener("click", (e) => {
  const sparkCount = 10;         // wie viele Funken
  const sparkSize = 2;           // Größe der Funken
  const sparkColor = "#000";   // Farbe
  const spread = 20;             // Radius der Explosion in px
  const duration = 500;          // Dauer des Effekts

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