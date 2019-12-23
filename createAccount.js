const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const fs = require('file-system');
const User = require('./models/user');

/* createAccount '/createAccount' */
router.get('/', function (req, res) {
  res.render('createAccount', {
    title: "Create Account",
    errors: null,
    css: "style.css"
  });
});

/* this event is for when someone enters their information. */
router.post('/',
  /* Username must contain at least 5 alphanumeric characters */
  [check('username', 'Invalid username').matches(/^[a-zA-Z0-9]{5,20}$/),
  check('email', 'Invalid e-mail address').not().isEmpty().isEmail().normalizeEmail(),
  /* Password must contain at least 1: lowercase, uppercase, special, number*/
  check('password', 'Invalid Password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])[a-zA-Z0-9!@#\$%\^&\*]{8,20}$/),
  check('password2', 'Passwords do not match').custom((value, { req }) => (value === req.body.password))
  ],
  function (req, res) {
    console.log('Account creation attempt');

    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("Account creation error");
      res.render('createAccount', {
        title: "Create Account",
        error: errors.array(),
        css: "style.css"
      });
      return;
    }

    /* Check that this username does not already exist */
    User.getUserByUsername(username, function (err, user) {
      if (user) {
        res.render('createAccount', {
          title: "Create Account",
          error: [{ msg: "Username already taken" }],
          css: "style.css"
        });
      } else {
        var newUser = new User({
          username: username,
          email: email,
          password: password
        });

        /* Put the new user in the DB*/
        User.createUser(newUser, function (err, user) {
          if (err) throw err;
        });

        var path = __dirname + '/views/Users/' + username;

        fs.mkdir(path, function (err) {
          if (err) {
            console.log('Failed to create directory', err);
          }
        });
        req.flash('success_msg', 'Your account has been created and now you can login.');
        res.redirect('/login');
      }
    });
  });

module.exports = router;
