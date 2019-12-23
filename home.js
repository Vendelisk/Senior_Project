/**
 * CodeExplorer V2.0
 * home.js
 * Description: 
 *  Home Page for CodeExplorer
 * 
 * Connections:
 *    1. Account Creation
 *    2. User Login
 *    3. Program Explorer
 * */

const express = require('express');
const router = express.Router();

/**
 * Handle Client Requests to Home Page 
 * */
router.get('/', (req, res) => {
    console.log(`GET request made to ${req.originalUrl}`);
    res.render('home', {
        title: "Program Explorer",
        css: "style.css"
    });
});

module.exports = router;