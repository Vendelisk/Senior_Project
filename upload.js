/**
 * CodeExplorer V2.0
 * upload.js
 * Description:
 *  User page for file upload
 *
 * Connections:
 *    1. User Login/Logout
 *    2. File Upload
 * */

const express = require("express");
const router = express.Router();
const Program = require("./models/program");
const sanitizer = require("sanitize-filename");
const fileUpload = require("express-fileupload");
router.use(fileUpload());

const fs = require("file-system");

/**
 * Ensures user is logged in and this page belongs to them
 * If not, redirect to login screen
 * */
function isUser(req, res, next) {
  //User currently logged in
  let sessUser = req.user;
  //User page being accessed
  let reqUser = req.params.username;

  if (sessUser && sessUser.username === reqUser) {
    console.log(`User validation for ${reqUser} succeded. Rendering`);
    next();
  } else {
    console.log(`User validation for ${reqUser} failed. Redirecting`);
    res.redirect("/login");
  }
}

/**
 * Render upload page if user is logged in
 * */
router.get("/:username", isUser, function (req, res) {
  console.log(`GET request made to ${req.originalUrl}`);

  let username = req.params.username;
  res.render("upload", {
    title: "Upload File",
    username: username,
    css: "style.css"
  });
});

/**
 * Allow the user to upload a program along with an arbitrary title.
 * It does some security checks such as making sure the uploaded file is
 * a .py file and the file doesn't import os. */
router.post("/:username", function (req, res) {
  let username = req.params.username;
  let progName = sanitizer(req.body.progName);
  let progTitle = progName;
  let mainFile = req.files.mainFile;
  let supportFiles = req.files.supportFiles;
  let bad_input = false;
  let errors = [];

  /**
   * The following if statements check to see if the user filled in all the
   * required input boxes.
   * */
  if (mainFile.name.indexOf(".py") === -1 &&
    mainFile.name.indexOf(".java") === -1) {
    errors.push({ msg: "Valid file formats are [.py, .java]" });
    bad_input = true;
  }

  /* Check if they are uploading any support files */
  if (supportFiles != null) {
    if (Array.isArray(supportFiles)) {
      supportFiles.forEach(element => {
        if (element.name.indexOf(".py") === -1 &&
          element.name.indexOf(".java") === -1 &&
          element.name.indexOf(".class") === -1) {
          errors.push({ msg: `${element.name}: Valid file formats are [.py, .java, .class]` });
          bad_input = true;
        }
      });
    } else if (supportFiles.name.indexOf(".py") === -1 &&
      supportFiles.name.indexOf(".java") === -1 &&
      supportFiles.name.indexOf(".class") === -1) {
      errors.push({ msg: `${supportFiles.name}: Valid file formats are [.py, .java, .class]` });
      bad_input = true;
    }
  }

  if (bad_input) {
    console.log(`Bad input when uploading file for ${username}`);
    res.render("upload", {
      title: "Upload File",
      username: username,
      error: errors,
      css: "style.css"
    });
    return;
  }

  //Replace any spaces in the name with '_'
  progName = progName.replace(/\W/g, "_");

  //Check the program name to avoid repeated titles
  Program.getProgramByUsername(username, progName, function (
    err,
    programDetails
  ) {
    if (programDetails) {
      /* Found repeated title */
      let errors = [{ msg: "That title is already used by another one of your programs." }];
      console.log(`${username} attempted to use a duplicate program name`);
      res.render("upload", {
        title: "Upload File",
        username: username,
        error: errors,
        css: "style.css"
      });
    } else {
      let path = `${__dirname}/views/Users/${username}/${progName}`;
      console.log (`Attempting to create dir: ${path}`);
      fs.mkdir(path, function (err) {
        if (err) {
          console.log(`${username} upload: could not create path`);
          res.render("upload", {
            title: "Upload File",
            username: username,
            css: "style.css"
          });
        } else {
          // Use the mv() method to place the file somewhere on the server
          let fileName = sanitizer(mainFile.name);
          mainFile.mv(`${path}/${fileName}`, function (err) {
            if (err) return res.status(500).send(err);

            // Esnure uploaded file doesn't use "import os"
            let content = fs.readFileSync(`${path}/${fileName}`);
            if (err) throw err;
            if (content.indexOf("import os") >= 0) {
              bad_file = true;
              errors = ["Python files may not contain use 'imports os'."];
              del([path]);
              console.log(
                `${username} attempted to use upload a program using import os`
              );
              res.render("upload", {
                title: "Upload File",
                username: username,
                error: errors,
                css: "style.css"
              });
              return;
            }

            /* validate any support files */
            if (supportFiles != null) {
              if (Array.isArray(supportFiles)) {
                supportFiles.forEach(element => {
                  let sFileName = sanitizer(element.name);
                  element.mv(`${path}/${sFileName}`, function (err) {
                    if (err) return res.status(500).send(err);

                    /* look in the uploaded file for "import os". */
                    content = fs.readFileSync(`${path}/${sFileName}`);
                    if (err) throw err;
                    if (content.indexOf("import os") >= 0) {
                      bad_file = true;
                      errors = ["Python files may not contain use 'imports os'."];
                      del([path]);
                      console.log(
                        `${username} attempted to use upload a program using import os`
                      );
                      res.render("upload", {
                        title: "Upload File",
                        username: username,
                        error: errors,
                        css: "style.css"
                      });
                      return;
                    }
                  });
                });
              } else {
                let sFileName = sanitizer(supportFiles.name);
                supportFiles.mv(`${path}/${sFileName}`, function (err) {
                  if (err) return res.status(500).send(err);

                  /* look in the uploaded file for "import os". */
                  content = fs.readFileSync(`${path}/${sFileName}`);
                  if (err) throw err;
                  if (content.indexOf("import os") >= 0) {
                    bad_file = true;
                    errors = ["Python files may not contain use 'imports os'."];
                    del([path]);
                    console.log(
                      `${username} attempted to use upload a program using import os`
                    );
                    res.render("upload", {
                      title: "Upload File",
                      username: username,
                      error: errors,
                      css: "style.css"
                    });
                    return;
                  }
                });
              }
            }
          });
          
          let newProg = new Program({
            username: username,
            programName: progName,
            programTitle: progTitle,
            mainProgram: fileName
          });

          ///Add the program info into the DB.
          Program.addProgram(newProg, function (err, newProg) {
            if (err) console.log(err);
            console.log(`Added program for ${username}`);
            req.flash("success", "Added Program");
          });
          res.redirect(`/account/${username}`);
        };
      });
    };
  });
});

module.exports = router;
