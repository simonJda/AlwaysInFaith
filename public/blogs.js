window.addEventListener("DOMContentLoaded", () => {
    fetch("/api/blogs")
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            const blogsContainer = document.getElementById("blogsContainer");
            blogsContainer.innerHTML = "";
            for(const blogKey in data.blogs) {
                const blog = data.blogs[blogKey];
                const blogsContainerBlock = document.createElement("div");
                blogsContainerBlock.dataset.blogkey = blogKey;
                blogsContainerBlock.classList.add("blogsContainerBlock");

                blogsContainerBlock.addEventListener("click", () => {
                    const encodedKey = encodeURIComponent(blogKey);
                    window.location.href = `finalLayout.html?blog=${encodedKey}`;
                });

                const heading = document.createElement("h3");
                heading.textContent = blog.thumbnail.title;

                const description = document.createElement("p");
                description.textContent = blog.thumbnail.description;

                const image = document.createElement("img");
                image.src = blog.thumbnail.image;


                blogsContainerBlock.appendChild(image);
                blogsContainerBlock.appendChild(heading);
                blogsContainerBlock.appendChild(description);
                blogsContainer.appendChild(blogsContainerBlock);
            }
        }
    });
});