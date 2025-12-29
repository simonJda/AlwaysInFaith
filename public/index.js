let homeAboutMeText2 = document.getElementById("homeAboutMeText2");
let aboutMeShowMoreButton = document.getElementById("aboutMeShowMoreButton");
let homeAboutMeText2IsOpen = false;

aboutMeShowMoreButton.addEventListener("click", () => {
    if(!homeAboutMeText2IsOpen) {
        homeAboutMeText2.style.height = homeAboutMeText2.scrollHeight + "px";
        aboutMeShowMoreButton.innerHTML = "<u>Show less</u>";
        homeAboutMeText2IsOpen = true;
    }
    else {
        homeAboutMeText2.style.height = "0px";
        aboutMeShowMoreButton.innerHTML = "<u>Show more</u>";
        homeAboutMeText2IsOpen = false;
    }
});

let homeBlog1 = document.getElementById("homeBlog1");
let homeBlog2 = document.getElementById("homeBlog2");
let homeBlog3 = document.getElementById("homeBlog3");

homeBlog1.addEventListener("click", () => {
    let blog = "but behold, O Lord, You know it altogether";
    const encodedKey = encodeURIComponent(blog);
    window.location.href = `finalLayout.html?blog=${encodedKey}`;
});

homeBlog2.addEventListener("click", () => {
    let blog = document.getElementById("homeBlog2Title").innerText;
    const encodedKey = encodeURIComponent(blog);
    window.location.href = `finalLayout.html?blog=${encodedKey}`;
});

homeBlog3.addEventListener("click", () => {
    let blog = document.getElementById("homeBlog3Title").innerText;
    const encodedKey = encodeURIComponent(blog);
    window.location.href = `finalLayout.html?blog=${encodedKey}`;
});