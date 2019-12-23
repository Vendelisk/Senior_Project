/**
 * CodeExplorer V2.0
 * searchProjects.js
 * Description:
 *  Allows user to search database of projects by username.
 *
 * Connections:
 *    1. Projects page for a given user
 * */

const express = require("express");
const router = express.Router();
const User = require("./models/user");

// Render searchProjects page
router.get("/", function (req, res) {
  console.log(`GET request made to ${req.originalUrl}`);
  res.render("searchProjects", {
    title: "Program Finder",
    css: "style.css"
  });
});

// Searches for a user in DB that matches provided username
router.post("/", function (req, res) {
  var username = req.body.username;

  User.getUserByUsername(username, function (err, user) {
    if (err) throw err;
    console.log(`Search request made for user ${username}`);
    if (user != null) {
      console.log(`Search for ${username} succeeded: redirecting`);
      res.redirect(`/explore/${username}`);
    } else {
      console.log(`Search for ${username} failed: alerting`);
      res.render("searchProjects", {
        title: "Program Finder",
        error: [{ msg: "Invalid username" }],
        css: "style.css"
      });
    }
  });
});

module.exports = router;
