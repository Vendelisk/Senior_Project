/**
 * CodeExplorer V2.0
 * server.js
 * Description:
 *  NodeJS application that allows users to:
 *    1. Create account
 *    2. Submit program executables
 *    3. Search database for submitted programs
 *    4. Run and interact with programs submitted by other users
 *
 * Every page of the website will have the following connections:
 *  1. Home Page
 *  2. About Page
 *  3. Help Page
 *  4. Logout button (if logged in)
 * 
 * Initialize:
 *  npm init
 *    >Establishes package.json file for project
 *
 *  npm install
 *    >Ensures all dependencies listen in package.json are installed
 *
 *  npm update
 *    >Ensure dependencies are up to date
 *
 *  NodeJS Tutorial: https://www.youtube.com/watch?v=fBNz5xF-Kx4
 * */

/**
 *  Dependencies
 *  Note: When installing new dependencies use ->
 *    npm install --save [dependency]
 *    --This will add the dependency files as well as update our package.json
 * */

/**
 *  Express: npm install --save ejs
 *    - https://expressjs.com/
 *    - Tutorial: https://www.youtube.com/watch?v=L72fhGm1tfE
 *    - Server-side framework. Allows full control of client requests and
 *      responses.
 */
const express = require("express");
const app = express();

/**
 *  Path: npm install --save express-validator
 *    - https://nodejs.org/api/path.html
 *    - The path module provides utilities for working with file and directory
 *      paths.
 */
const path = require("path");

/**
 *  Connect-Flash: npm install --save connect-flash
 *    - https://github.com/jaredhanson/connect-flash
 *    - The flash is a special area of the session used for storing messages.
 *      Messages are written to the flash and cleared after being displayed to
 *      the user. The flash is typically used in combination with redirects,
 *      ensuring that the message is available to the next page that is to be
 *      rendered.
 */
const connectFlash = require("connect-flash");

/**
 *  EJS (Embedded Java Script): npm install --save ejs
 *    - https://ejs.co/
 *    - Templating language that generates HTML markup with plain JavaScript*
 */
const ejs = require("ejs");

/* View Engine */
//Use .ejs extensions
app.set("view engine", "ejs");
//Look for .ejs files in ./views
app.set("views", path.join(__dirname, "views"));
//Register EJS template engine callback as .html
app.engine("html", ejs.renderFile);

/* JSON Parser Middleware*/
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* Set Static Path for Site Content */
app.use(express.static(path.join(__dirname, "views")));

/**
 *  Express-Session: npm install --save express-session
 *    - https://www.npmjs.com/package/express-session
 *    - Create a session middleware with given options.
 *      Provides cookie like storage but stores client information on server
 *      linked to a specified id.
 */
const expressSession = require("express-session");
const IGNORE = "5qFcRqWexG5uuqDiWeRHCPEvECYmDDUxzbAM1zNK";

/* Define a session to use for logged in users. */
app.use(
  expressSession({
    name: "yummy_cookie",
    secret: IGNORE,
    saveUninitialized: false,
    resave: false,
    cookie: {
      httpOnly: true,
      secure: false, // make sure to put true when HTTPS is up!!!!
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  })
);

/**
 *  Express-Validator: npm install --save express-validator
 *    - https://express-validator.github.io/docs/
 *    - Wrapper for validator.js validator & sanitizer functions.
 *      Ensures correctness of user account criteria when creating new user.
 */
const expressValidator = require("express-validator");

/* Express validator error formatter. */
app.use(expressValidator());

/**
 *  Sanitize-filename: npm install --save sanitize-filename
 *    - https://www.npmjs.com/package/sanitize-filename
 *    - Sanitize a string to be safe for use as a filename by removing
 *      directory paths and invalid characters.
 */
const sanitizer = require ("sanitize-filename");

/**
 *  Passport: npm install --save passport
 *    - http://www.passportjs.org/docs/
 *    - Authentication middleware for Node. Authenticates requests.
 */
const passport = require("passport");

/* Passport init used for login */
app.use(passport.initialize());
//Must come after express.session() usage
app.use(passport.session());

/* Establish Flash messages */
//Must come after express.session() usage
app.use(connectFlash());
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.session = req.session;
  next();
});

/**
 *  Mongoose: npm install --save mongoose
 *    - https://www.npmjs.com/package/mongoose
 *    - Must install mongodb first
 *    - For use with MongoDB. Object modeling tool designed to work in an
 *      asynchronous environment.
 */
const mongoose = require("mongoose");

/* MongoDB Connection */
//Use one of:
//For localhost i.e. developing at home
const mdbLocal = "mongodb://localhost/codex";
//OR
//For the server
const mdbServer = "mongodb://localhost:27017/codex";

mongoose.connect(mdbServer, { useNewUrlParser: true, useCreateIndex: true });

/* for forking */
const system = require("child_process");

/**
 * Setup Routers
 * Routers: How an application responds to a client request to a particular
 * endpoint, which is a URI (or path) and a specific HTTP request method (GET,
 * POST, and so on)
 */

const home = require("./home");
const createAccount = require("./createAccount");
const login = require("./login");
const accountPage = require("./accountPage");
const upload = require("./upload");
const search = require("./searchProjects");
const userUploads = require("./projects");
const programViewer = require("./programViewer");
const about = require("./about");
const help = require("./help");

/* When on a specific page, default to that page's router functions */
app.use("/", home);

app.use("/createAccount", createAccount);
app.use("/login", login);
app.use("/account", accountPage);
app.use("/upload", upload);
app.use("/searchProjects", search);
app.use("/explore", userUploads);
app.use("/viewer", programViewer);
app.use("/about", about);
app.use("/help", help);

/**
 *  WebSocket: npm install --save ws
 *    - https://github.com/websockets/ws
 *    - Provides the API for creating and managing a WebSocket connection to a
 *      server, as well as for sending and receiving data on the connection.
 */
const ws = require("ws");

//Check if server has a port # established; otherwise use port 8000
const PORT = process.env.PORT || 8000;

/* Start the server*/
const server = app.listen(PORT, function () {
  console.log(`Server Started on Port ${PORT}.`);
});

const socket = new ws.Server({ server });

socket.on("connection", ws => {
  var intervalID = setInterval(function () { keepAlive(ws); }, 5000); // 5 seconds
  ws.on("message", data => {
    onMessage(ws, data);
  });
  ws.on("close", function close() {
    clearInterval(intervalID);
    console.log("closing :c");
  });
});

function keepAlive(ws) {
  sendtoPage(ws, {
    event: "keepAlive",
    payload: "std"
  });
}

function onMessage(ws, rawData) {
  //console.log(`WS received message: ${rawData}`);

  let message = JSON.parse(rawData);
  let payload = message.payload;
  //console.log(payload);

  switch (message.event) {

    case "compile":
      //console.log("payload: " + payload)
      payload = payload.split(" ");
      console.log("compile: " + payload);
      //console.log("directory: " + process.cwd())
      //console.log("run: " + payload);
      console.log("payload 0: "+ payload[0]);
      console.log("Slice:" + payload.slice(1));
      proc = system.spawn(payload[0], payload.slice(1));

      proc.stdout.on("data", data => {
        //console.log('stdout: ' + data);
        sendtoPage(ws, {
          event: "stdout",
          payload: "" + data
        });
      });

      proc.stderr.on("data", data => {
        sendtoPage(ws, {
          event: "stderr",
          payload: data
        });
      });

      proc.on("exit", code => {
        sendtoPage(ws, {
          event: "cexit",
          payload: "" + code
        });
      });
      break;


    
    case "run":
      //console.log("payload: " + payload)
      payload = payload.split(" ");
      //console.log("run: " + payload);
      //console.log("payload 0: "+ payload[0]);
      //console.log("Slice:" + payload.slice(1));

      proc = system.spawn(payload[0], payload.slice(1));

      proc.stdout.on("data", data => {
        console.log('stdout: ' + data);
        sendtoPage(ws, {
          event: "stdout",
          payload: "" + data
        });
      });

      proc.stderr.on("data", data => {
        sendtoPage(ws, {
          event: "stderr",
          payload: data
        });
      });

      proc.on("exit", code => {
        sendtoPage(ws, {
          event: "exit",
          payload: "" + code
        });
      });
      break;

    case "stdin":
      try {
        proc.stdin.write(payload);
        sendtoPage(ws, {
          event: "stdout",
          payload: "" + payload + "\n"
        });
      } catch (error) {
        sendtoPage(ws, {
          event: "error",
          payload: "dummytext"
        });
      }
      console.log("stdin: " + payload);
      break;
    case "EOF":
      proc.stdin.write("\n");
      break;
    case "signal":
      proc.kill(payload);
      break;
    case "keepAlive":
      //console.log("stalling");
      break;
  }
};

function sendtoPage(ws, payload) {
  ws.send(JSON.stringify(payload));
}

/**
 * Handle logout requests
 * */
app.get("*/logout", function (req, res) {
  req.logout();

  let session = req.session;
  if (session) {
    console.log(`Deleting session: ${req.session}`);
    session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect("/");
      }
    });
  }
});

/* Invalid URL */
app.use(function (req, res, next) {
  res.status(404).render("404.ejs", {
    css: "style.css"
  });
});


