//Public
//server.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const { json } = require("stream/consumers");
const pool = require("./db");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const server = express();
const PORT = process.env.PORT || 3000;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

function uploadToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: "blog_thumbnails" }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        streamifier.createReadStream(buffer).pipe(stream);
    });
}

const storage = multer.memoryStorage();
const upload = multer({ storage, fileFilter });

server.use(express.json());
server.use(express.static(path.join(__dirname, "public")));
server.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '1d' }));
server.use(cookieParser());

function fileFilter (req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Nur Bilddateien sind erlaubt."), false);
  } else {
    cb(null, true);
  }
}

function checkAdmin(req, res, next) {
    if(req.cookies.admin === "true") {
        next();
    }
    else {
        return res.status(401).json({ success: false, message: "Not authorized!" });
    }
}

server.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

//Login area

server.get("/api/attemptsControll", (req, res) => {
    const userIP = req.ip;
    const filePath = path.join(__dirname, "jsonFiles", "attempts.json");

    fs.readFile(filePath, "utf-8", (err, data) => {
        if(err) {
            return res.json({ success: false, message: "Error reading file" });
        }

        fileData = {};

        if(data.trim() !== "") {
            try {
                fileData = JSON.parse(data);
            }
            catch(err) {
                return res.json({ success: false, message: "Error parsing data" });
            }
        }

        const currentTime = Date.now();

        if(!fileData[userIP]) {
            fileData[userIP] = {
                attempts: 0,
                lastAttempt: currentTime
            }
        }

        const userData = fileData[userIP];
        const blockDuration = 30 * 60 * 1000; 

        if(userData.attempts >= 10) {
            const timeSinceLastAttempt = currentTime - userData.lastAttempt;

            if(timeSinceLastAttempt < blockDuration) {
                return res.json({ success: false, message: "Too many failed attempts. Try again later.", blockButton: true });
            }

            else {
                userData.attempts = 0;
            }

            fs.writeFile (filePath, JSON.stringify(fileData, null, 2), (err) => {
                if(err) {
                    return res.json({ success: false, message: "Error writing data" });
                }
                return res.json({ success: true, blockButton: false });
            })
        }
        else {
            return res.json({ success: true, blockButton: false });
        }
    });
});

server.post("/login", (req, res) => {
    const { emailInput, passwordInput } = req.body;
    const rightEmail = "annelynn01@outlook.com";
    const filePath = path.join(__dirname, "jsonFiles", "attempts.json");
    const userIP = req.ip;

    fs.readFile(filePath, "utf-8", (err, data) => {
        if(err) {
            return res.json({ success: false, message: "Error reading file" });
        }

        fileData = {};

        if(data.trim() !== "") {
            try {
                fileData = JSON.parse(data);
            }
            catch(err) {
                return res.json({ success: false, message: "Error parsing data" });
            }
        }

        if(!fileData[userIP]) {
            fileData[userIP] = {
                attempts: 0,
                lastAttempt: Date.now()
            }
        }

        const userData = fileData[userIP];

        if (emailInput !== rightEmail) {
            userData.attempts += 1;
            userData.lastAttempt = Date.now();
            fs.writeFile(filePath, JSON.stringify(fileData, null, 2), () => {});
            return res.json({ success: false, message: "Wrong E-Mail!" });
        }

        const passwordHash = process.env.PASSWORD_HASH;

        bcrypt.compare(passwordInput, passwordHash, (err, result) => {
            if (err) {
                return res.json({
                    success: false,
                    message: "Error verifying password. Please contact the administrator."
                });
            }

            if (!result) {
                userData.attempts += 1;
                userData.lastAttempt = Date.now();
                fs.writeFile(filePath, JSON.stringify(fileData, null, 2), () => {});
                return res.json({ success: false, message: "Wrong Password!" });
            }

            userData.attempts = 0;
            userData.lastAttempt = null;

            fs.writeFile(filePath, JSON.stringify(fileData, null, 2), () => {});

            res.cookie("admin", "true", {
                httpOnly: true,
                secure: true,
                maxAge: 1000 * 60 * 60 * 24
                });

            return res.json({ success: true, message: "Login Successful" });
        });
    });
});


server.get("/logout", (req, res) => {
    res.clearCookie("admin");
    res.redirect("/");
});

server.post("/api/homeBlog1", (req, res) => {
    const { title } = req.body;
    const filePath = path.join(__dirname, "jsonFiles", "blogs.json");
    fs.readFile(filePath, "utf-8", (err, data) => {
        if(err) {
            return res.json({ success: false, message: "Error reading data file 1" });
        }

        fileData = {}
        if(data.trim() !== "") {
            try {
                fileData = JSON.parse(data);
            }
            catch(err) {
                return res.json({ success: false, message: "Error parsing data file 1" });
            }
        }

        res.json({ success: true, blogs: fileData });
    })
});

//Admin Area
//Files
server.get("/admin", checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "admin.html"));
});

server.get("/adminCSS", checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "admin.css"));
});

server.get("/adminJS", checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "admin.js"));
});

server.get("/adminIcon", checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "assets", "errWB.png"));
});

server.get("/addContent.js", checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "addContent.js"));
});

server.get("/api/addContent", checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "addContent.html"));
});

server.get("/api/editInformation", checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "editInformation.html"));
});

server.get("/editInformation.js", checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "editInformation.js"));
});

//Thumbnail upload area

server.post("/api/newThumbnail", checkAdmin, upload.single("thumbnailImage"), async (req, res) => {
    const { thumbnailTitle, thumbnailDescription, thumbnailDate, thumbnailAuthor } = req.body;

    if (!thumbnailTitle || !thumbnailDescription) {
        return res.json({ success: false, message: "Please fill in all required fields." });
    }

    if (!req.file) {
        return res.json({ success: false, message: "No image uploaded." });
    }

    const blogKey = thumbnailTitle.replace(/[\/\\.#$[\]]+/g, "_");

    try {
        const result = await uploadToCloudinary(req.file.buffer);
        console.log("Cloudinary result:", result);
        const imageUrl = result.secure_url;
        const imagePublicId = result.public_id;

        const check = await pool.query("SELECT id FROM posts WHERE heading = $1", [blogKey]);
        if (check.rows.length > 0) {
            return res.json({ success: false, message: "There is already a blog with this title!" });
        }

        await pool.query(
            `INSERT INTO posts
             (heading, thumbnail_title, thumbnail_description, thumbnail_image, image_public_id, date, author)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [blogKey, thumbnailTitle, thumbnailDescription, imageUrl, imagePublicId, thumbnailDate, thumbnailAuthor]
        );

        res.json({ success: true, message: "Thumbnail erfolgreich gespeichert!" });
    } catch (error) {
        console.error("Upload Fehler:", error);
        res.status(500).json({ success: false, message: "Upload failed" });
    }
});


//Blogs content Area

server.post("/api/searchTitle", checkAdmin, async (req, res) => {
    const { titleInput } = req.body;

    const blogKey = titleInput.replace(/[\/\\.#$[\]]+/g, "_");
    
    try {
        const check = await pool.query(
            "SELECT heading FROM posts WHERE heading = $1",
            [blogKey]
        );

        if(check.rows.length > 0) {
            return res.json({ success: true, message: "Title found!", blogKey });
        }

        res.json({ success: false, message: "Title not found!", blogKey });
    }
    catch (error) {
        console.error("DB Error: ", error);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

//Blogs area

server.get("/api/blogs", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT heading, thumbnail_title, thumbnail_description, thumbnail_image, date, author, main_text
            FROM posts
        `);
        const blogs = {};

        for (const row of result.rows) {
            blogs[row.heading] = {
                thumbnail: {
                    title: row.thumbnail_title,
                    description: row.thumbnail_description,
                    image: row.thumbnail_image
                },
                date: row.date,
                author: row.author,
                mainText: row.main_text
            }
        }
        res.json({ success: true, blogs });
    }
    catch (error) {
        console.error("DB Error: ", error);
        return res.status(500).json({ success: false, message: "DB error" });
    }
});

server.post("/api/getBlogText", async (req, res) => {
    const { blogKey } = req.body;

    try {
        const result = await pool.query(
            "SELECT main_text FROM posts WHERE heading = $1",
            [blogKey]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: "Blog not found"
            });
        }

        return res.json({
            success: true,
            blogContent: result.rows[0].main_text
        });
    }
    catch (error) {
        console.error("DB Error:", error);
        return res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


server.post("/api/addBlogContent", checkAdmin, async (req, res) => {
    const { blogContent, blogKey } = req.body;
    try {
        await pool.query(
            "UPDATE posts SET main_text = $1 WHERE heading = $2",
            [blogContent, blogKey]
        )
        res.json({ success: true, message: "Blog content successfully saved!" });
    }
    catch (error) {
        console.error("DB Error: ", error);
        return res.status(500).json({ success: false, message: "Database error" });
    }
});

server.post("/api/getBlogInformation", checkAdmin, async (req, res) => {
    const { blogKey } = req.body;
    const blogContent = {};

    try {
        const result = await pool.query(
            `
            SELECT heading, thumbnail_title, thumbnail_description, thumbnail_image, date, author, main_text
            FROM posts
            WHERE heading = $1
            `,
            [blogKey]
        )
        if(result.rows.length === 0) {
            return res.json({ success: false, message: "Blog not found" });
        }

        blogContent[blogKey] = {
            heading: result.rows[0].heading,
            date: result.rows[0].date,
            author: result.rows[0].author,
            thumbnail: {
                title: result.rows[0].thumbnail_title,
                description: result.rows[0].thumbnail_description,
                image: result.rows[0].thumbnail_image
            },
            mainText: result.rows[0].main_text
        }

        res.json({ success: true, blogContent });
    }
    catch (error) {
        console.error("DB Error: ", error);
        return res.status(500).json({ success: false, message: "Database error" });
    }
});

server.post("/api/editedContent", checkAdmin, async (req, res) => {
    const { blogContent, blogKey } = req.body;

    try {
        const update = await pool.query (
            `
            UPDATE posts SET heading = $1, thumbnail_title = $1, thumbnail_description = $2, author = $3, date = $4
            WHERE heading = $5
            `,
            [blogContent.heading, blogContent.thumbnail.description, blogContent.author, blogContent.date, blogKey]
        )

        if(update.rowCount === 0) {
            return res.json({ success: false, message: "Blog not found" });
        }

    } catch (error) {
        console.error("DB Error: ", error);
        return res.status(500).json({ success: false, message: "Database Error" });
    }

    res.json({ success: true, message: "Updated information successfully" });
});

server.post("/api/deleteBlog", checkAdmin, async (req, res) => {
    const { blogTitleDeleteInput } = req.body;

    try {
        const blogResult = await pool.query (
            `
            SELECT image_public_id FROM posts WHERE heading = $1
            `, [blogTitleDeleteInput]
        );

        if (blogResult.rows.length === 0) {
            return res.json({ success: false, message: "Blog not found" });
        }

        const publicId = blogResult.rows[0].image_public_id;

        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }


        const result = await pool.query (
            `
            DELETE FROM posts
            WHERE heading = $1
            `, [blogTitleDeleteInput]
        );

        if (result.rowCount === 0) {
            return res.json({
                success: false,
                message: "Blog not found"
            });
        }

        res.json({ success: true, message: "Blog removed successfully!" });
    } catch(error) {
        res.status(500).json({ success: false, message: "Database error" });
    }
});

(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("DB verbunden:", result.rows[0]);
  } catch (error) {
    console.error("DB Fehler:", error);
  }
})();


server.listen(PORT, () => console.log(`Server läuft auf ${PORT}`));