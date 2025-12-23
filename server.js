//Public
//server.js

const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const multer = require("multer");
const { json } = require("stream/consumers");
require("dotenv").config();


const server = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const originalName = file.originalname;
    const timestamp = Date.now();
    cb(null, `${timestamp}-${originalName}`);
  }
});

const upload = multer({ storage });

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

server.post("/login", (req, res) => {
    const { emailInput, passwordInput } = req.body;
    const rightEmail = "test@email.com";
    const userIP = req.ip;
    const filePath = path.join(__dirname, "jsonFiles", "attempts.json");

    fs.readFile(filePath, "utf-8", (err, data) => {
        if (err) {
            return res.json({ success: false, message: "1.1 Error reading data file 2" });
        }

        let fileData = {};
        if (data.trim() !== "") {
            try {
                fileData = JSON.parse(data);
            } catch (err) {
                return res.json({ success: false, message: "1.1 Error parsing data file 2" });
            }
        }

        if (!fileData[userIP]) {
            fileData[userIP] = { attempts: 0, lastAttempt: null };
        }

        const currentTime = Date.now();
        const twoHours = 2 * 60 * 60 * 1000;

        if (fileData[userIP].lastAttempt !== null) {
            const timeDifference = currentTime - fileData[userIP].lastAttempt;

            if (timeDifference > twoHours) {
                fileData[userIP].attempts = 0;
            }
        }

        fileData[userIP].attempts += 1;
        fileData[userIP].lastAttempt = currentTime;

        fs.writeFile(filePath, JSON.stringify(fileData, null, 2), (err) => {
            if (err) {
                return res.json({ success: false, message: "1.1 Error saving data file 2" });
            }

            if (fileData[userIP].attempts > 5) {
                return res.json({ success: false, message: "Too many tries! Please try again in 2 hours." });
            }



            if (emailInput !== rightEmail) {
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
                    return res.json({ success: false, message: "Wrong Password!" });
                }

                res.cookie("admin", "true", {
                    httpOnly: true,
                    secure: true,
                    maxAge: 1000 * 60 * 60 * 24
                });

                fs.readFile(filePath, "utf-8", (err, data) => {
                    if(err) {
                        return res.json({ success: false, message: "1.2 Error reading data file 2" });
                    }

                    let fileData = {}

                    if(data.trim() !== "") {
                        try {
                            fileData = JSON.parse(data);
                        }
                        catch(err) {
                            return res.json({ success: false, message: "1.2 Error parsing data file 2" });
                        }
                    }

                    fileData[userIP].attempts = 0;

                    fs.writeFile(filePath, JSON.stringify(fileData, null, 2), (err) => {
                        if(err) {
                            return res.json({ success: false, message: "1.2 Error saving data file 2" });
                        }
                    })

                    return res.json({ success: true, message: "Login Successful" });
                });
            });
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

server.post("/newThumbnail", checkAdmin, upload.single("thumbnailImage"), (req, res) => {
    const { thumbnailTitle, thumbnailDescription, thumbnailDate, thumbnailAuthor }  = req.body;

    if(!thumbnailTitle || !thumbnailDescription) {
        return res.json({ success: false, message: "Please fill all fields!" });
    }

    let imagePath = null;

    if(req.file) {
        imagePath = "/uploads/" + req.file.filename;
    }

    const filePath = path.join(__dirname, "jsonFiles", "blogs.json");

    fs.readFile(filePath, "utf-8", (err, data) => {
        if(err) {
            return res.json({ success: false, message: "Error reading data file" });
        }

        let fileData = {};
        if(data.trim() !== "") {
            try {
                fileData = JSON.parse(data);
            }
            catch(err) {
                return res.json({ success: false, message: "Error parsing data file" });
            }
        } 

        const blogKey = thumbnailTitle.replace(/[\/\\.#$[\]]+/g, "_");

        if(fileData[blogKey]) {
            return res.json({ success: false, message: "There is already a blog with this title. Please choose a different title or edit the existing blog." });
        }

        if(!fileData[blogKey]) {
            fileData[blogKey] = {};
        }

        fileData[blogKey].thumbnail = {
            title: thumbnailTitle,
            description: thumbnailDescription,
            image: imagePath
        };

        fileData[blogKey].heading = blogKey;

        fileData[blogKey].date = thumbnailDate;

        fileData[blogKey].author = thumbnailAuthor;

        fs.writeFile(filePath, JSON.stringify(fileData, null, 2), (err) => {
            if(err) {
                return res.json({ success: false, message: "Error writing to data file" });
            }
            
            res.json({ success: true, message: "Thumbnail saved successfully! YAY!" });
        });
    });
});

//Blogs content Area

server.post("/searchTitle", checkAdmin, (req, res) => {
    const { titleInput } = req.body;
    const filePath = path.join(__dirname, "jsonFiles", "blogs.json");

    fs.readFile(filePath, "utf-8", (err, data) => {
        if(err) {
            return res.json({ success: false, message: "Error reading the blogs file!" });
        }

        let fileData = {};
        if(data.trim() !== "") {
            try{
                fileData = JSON.parse(data);
            }
            catch(err) {
                return res.json({ success: false, message: "Error parsing blogs file!" });
            }
        };

        const blogKey = titleInput.replace(/[\/\\.#$[\]]+/g, "_");

        if(fileData[blogKey]) {
           return res.json({ success: true, message: "Title found", blogKey });
        }

        res.json({ success: false, message: "Title not found!" });     
    });
});

//Blogs area

server.get("/api/blogs", (req, res) => {
    const filePath = path.join(__dirname, "jsonFiles", "blogs.json");

    fs.readFile(filePath, "utf8", (err, data) => {
        if(err) {
            return res.json({ success: false, message: "Error reading blogs file!" });
        }

        let fileData = {};

        if(data.trim() !== "") {
            try {
                fileData = JSON.parse(data);
            }
            catch(err) {
                return res.json({ success: false, message: "Error parsing blogs file!" });
            }
        }
        res.json({ success: true, blogs: fileData, message: "Blog found successfully" });
    });
});

server.post("/api/getBlogText", (req, res) => {
    const { blogKey } = req.body;
    const filePath = path.join(__dirname, "jsonFiles", "blogs.json");

    fs.readFile(filePath, "utf-8", (err, data) => {
        if(err) {
            return res.json({ success: false, message: "Error reading blogs file!" });
        }

        let fileData = {};

        if(data.trim() !== "") {
            try{
                fileData = JSON.parse(data);
            }
            catch(err) {
                return res.json({ success: false, message: "Error parsing blogs file!" });
            }

            if(fileData[blogKey] && fileData[blogKey].mainText) {
                return res.json({ success: true, blogContent: fileData[blogKey].mainText });
            }
        }
    });
});

server.post("/api/addBlogContent", checkAdmin, (req, res) => {
    const { blogContent, blogKey } = req.body;
    const filePath = path.join(__dirname, "jsonFiles", "blogs.json");

    fs.readFile(filePath, "utf-8", (err, data) => {
        if(err) {
            return res.json({ success: false, message: "Error reading blogs file!" });
        }

        let fileData = {};

        if(data.trim() !== "") {
            try{
                fileData = JSON.parse(data);
            }
            catch(err) {
                return res.json({ success: false, message: "Error parsing blogs file!" });
            }
        }

        fileData[blogKey].mainText = blogContent;
        fs.writeFile(filePath, JSON.stringify(fileData, null, 2), (err) => {
            if(err) {
                return res.json({ success: false, message: "Error writing data file!" });
            }

            res.json({ success: true, message: "Text uploaded successfully" });
        });
    });
});

server.post("/api/getBlogInformation", checkAdmin, (req, res) => {
    const { blogKey } = req.body;
    const filePath = path.join(__dirname, "jsonFiles", "blogs.json");

    fs.readFile(filePath, "utf-8", (err, data) => {
        if(err) {
            return res.json({ success: false, message: "Error reading data file" });
        }

        fileData = {};

        if(data.trim() !== "") {
            try{
                fileData = JSON.parse(data);
            }
            catch(err) {
                return res.json({ success: false, message: "Error parsing data" });
            }
        }

        const blogContent = fileData[blogKey];

        res.json({ success: true, blogContent });
    });
});

server.post("/api/editetContent", checkAdmin, (req, res) => {
    const { blogInformation, blogKey } = req.body;
    const filePath = path.join(__dirname, "jsonFiles", "blogs.json");

    fs.readFile(filePath, "utf-8", (err, data) => {
        if(err) {
            return res.json({ success: false, message: "Error reading data file!" });
        }

        fileData = {};

        if(data.trim() !== "") {
            try{
                fileData = JSON.parse(data);
            }
            catch(err) {
                return res.json({ success: false, message: "Error parsing data!" });
            }
        }

        const newKey = blogInformation.heading.replace(/[\/\\.#$[\]]+/g, "_");

        if (newKey !== blogKey && fileData[newKey]) {
            return res.json({ success: false, message: "There is already a blog with this Title" });
        }

        const updatedInformation = {
            heading: blogInformation.heading,
            thumbnail: {
                title: blogInformation.heading,
                description: blogInformation.thumbnail.description,
                image: fileData[blogKey].thumbnail.image
            },
            date: blogInformation.date,
            author: blogInformation.author,
            mainText: fileData[blogKey].mainText
        };

        if(newKey !== blogKey) {
            delete fileData[blogKey];
            fileData[newKey] = updatedInformation;
        }
        else {
            fileData[blogKey] = updatedInformation;
        }

        fs.writeFile(filePath, JSON.stringify(fileData, null, 2), (err) => {
            if(err) {
                return res.json({ success: false, message: "Error writing data file" });
            }

            res.json({ success: true, message: "Successfully updated blog information" });
        });
    });
});

server.post("/api/deleteBlog", checkAdmin, (req, res) => {
    const { blogTitleDeleteInput } = req.body;
    const filePath = path.join(__dirname, "jsonFiles", "blogs.json");

    fs.readFile(filePath, "utf-8", (err, data) => {
        if(err) {
            return res.json({ success: false, message: "Error reading file data!" });
        }

        fileData = {};

        if(data.trim() !== "") {
            try {
                fileData = JSON.parse(data);
            }
            catch(err) {
                return res.json({ success: false, message: "Error parsing file data!" });
            }
        }

        const blogKey = blogTitleDeleteInput.replace(/[\/\\.#$[\]]+/g, "_");

        if(!fileData[blogKey]) {
            return res.json({ success: false, message: "There is no blog with this title!" });
        }

        const imagePath = fileData[blogKey].thumbnail.image;
        const finalImagePath = path.join(__dirname, imagePath);

        fs.unlink(finalImagePath, (err) => {
            if(err) {
                console.log("Image was not found");
            }

            delete fileData[blogKey];

            fs.writeFile(filePath, JSON.stringify(fileData, null, 2), (err) => {
                if(err) {
                    return res.json({ success: false, message: "Error writing file data!" });
                }

                res.json({ success: true, message: "Removed blog successfully" });
            });
        });
    });
});

server.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


server.listen(PORT, () => console.log(`Server läuft auf ${PORT}`));