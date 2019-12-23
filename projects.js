/**
 * CodeExplorer V2.0
 * projects.js
 * Description:
 *  Allows user to select a program to view for a given user
 *
 * Connections:
 *    1. Program Viewer page for a selected program
 * */

const express = require('express');
const router =  express.Router();
const Program = require("./models/program");

// Loads the projects page which displays projects submitted by a user
router.get('/:username', function (req, res) {
    let username = req.params.username;
    
    Program.getAllProgramsByUsername(username, function(err, programs) {
      if (err) throw err;
      res.render("projectsPage", {
        title: "User Programs",
        user: username,
        programs: programs,
        css: "style2.css"
      });
    });
});

module.exports = router;