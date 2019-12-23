/**
 * CodeExplorer V2.0
 * console.js
 * Description:
 *  Program Explorer console page which runs the selected program and provides
 *  a console for user I/O.
 *
 * Connections:
 *    1. User Login/Logout
 * */

const express = require("express");
const router = express.Router();
const Program = require("./models/program");

/* Render Program Explorer console for program interaction */
router.get("/:username/:progName", function (req, res) {
  let username = req.params.username;
  let progName = req.params.progName;
  console.log(`GET request made to ${req.originalUrl} for ${username}/${progName}`);

  
  // Ensure program exists in DB
  Program.getProgramByUsername(username, progName, function (
    err,
    programDetails
  ) {
    if (err) throw err;
    if (!programDetails) {
      console.log("Error finding program");
      res.status(404).render("404.ejs");
    } else {
      program = programDetails.mainProgram;
      path = `${__dirname}/views/Users/${username}/${progName}/${program}`;
      console.log("Program retrieved, rendering");
      res.render("programViewer", {
        title: "Program Viewer",
        username: username,
        prog: {
          name: progName,
          file: program,
          path: path
        },
        css: "codePage.css"
      });
    }
  });
});

module.exports = router;
