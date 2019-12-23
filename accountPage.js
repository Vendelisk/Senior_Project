/**
 * CodeExplorer V2.0
 * accountPage.js
 * Description:
 *  User account page which renders a validated user's dashboard, enabling them
 *  to manage and view their programs
 *
 * Connections:
 *    1. User Login/Logout
 *    2. Program Upload
 *    3. Program Deletion
 *    4. Program Viewer
 * */

const express = require("express");
const router = express.Router();
const del = require("del");
const Program = require("./models/program");

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
 * Render user account page if they are logged in
 * */
router.get("/:username", isUser, function(req, res) {
  console.log(`GET request made to ${req.originalUrl}`);

  let username = req.params.username;

  Program.getAllProgramsByUsername(username, function(err, programs) {
    if (err) throw err;
    res.render("accountPage", {
      title: "User Account Page",
      username: username,
      programs: programs,
      css: "style2.css"
    });
  });
});

/* Handle Requests to remove program */
router.get("/:username/remove/:progName", isUser, function(req, res) {
  let username = req.params.username;
  let progName = req.params.progName;

  /* Remove the program from the DB. */
  Program.removeProgram(username, progName, function(err, deleted_program) {
    if (err) throw err;

    if (deleted_program === null) {
      console.log(
        `${username} requested deletion of program ${progName} but program did not exist`
      );
    } else {
      let path = `${__dirname}/views/Users/${username}/${progName}`;
      del([`${path}/${deleted_program.mainProgram}`]);
      del([path]);
    }
  });
  res.redirect(`/account/${username}`);
});

module.exports = router;
