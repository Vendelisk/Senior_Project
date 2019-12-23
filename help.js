/**
 * CodeExplorer V2.0
 * help.js
 * Description: 
 *  Help Page
 * 
 * Connections:
 * */

var express = require('express');
var router = express.Router();

/* Render Help page */
router.get('/', function (req, res) {
  res.render('help', {
    title: "Program Explorer Help!",
    css: "style.css"
  });
});

module.exports = router;