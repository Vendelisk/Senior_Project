/**
 * CodeExplorer V2.0
 * about.js
 * Description: 
 *  About page for description of creators/admins
 * 
 * Connections:
 *    1. Admin LinkedIn accounts (via about.json)
 * */

const express = require('express');
const router =  express.Router();

const fs = require('fs');
const contents = fs.readFileSync(`${__dirname}/views/about.json`);
const aboutJSON = JSON.parse(contents);

/* Render about page */
router.get('/', function (req, res) {
    res.render('about', {
      title: "About Us",
      about: aboutJSON,
      css: "style.css"
  });
});

module.exports = router;