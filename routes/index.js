/*
 * The entire contents of JavaScript modules
 * are automatically in strict mode,
 * with no statement needed to initiate it.
 */
import express from "express";
import sessions from "express-session";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";

// Connect to the database
const mysqlConn = mysql.createConnection({
  host: "localhost",
  user: "appaccount",
  password: "apppass",
  multipleStatements: true,
});

// The express router for the app
const router = express.Router();

// set the view engine to ejs
router.set("view engine", "ejs");
// Needed to parse the request body
router.use(bodyParser.urlencoded({ extended: true }));
// The session settings middleware
router.use(
  sessions({
    cookieName: "session",
    secret: "random_string_goes_here",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
  })
);

/// The default page
// @param req - the request
// @param res - the response
router.get("/", function (req, res) {
  // Is this user logged in?
  if (req.session.username) {
    // Yes!
    res.redirect("/dashboard");
  } else {
    // No!
    res.render("loginpage");
  }
});

// The login page
// @param req - the request
// @param res - the response
router.get("/dashboard", function (req, res) {
  // Is this user logged in? Then show the dashboard
  if (req.session.username) {
    res.render("dashboard", { username: req.session.username });
  }
  //Not logged in! Redirect to the mainpage
  else {
    res.redirect("/");
  }
});

// The login script
// @param req - the request
// @param res - the responser
router.post("/login", function (req, res) {
  // Get the username and password data from the form
  let userName = req.body.username;
  let password = req.body.password;

  // Construct the query
  let query =
    "USE users; SELECT username,password from appusers where username='" +
    userName +
    "' AND password='" +
    password +
    "'";
  console.log(query);

  // Query the DB for the user
  mysqlConn.query(query, function (err, qResult) {
    if (err) throw err;

    console.log(qResult[1]);

    // Does the password match?
    let match = false;

    // Go through the results of the second query
    for (let account of qResult[1]) {
      if (account["username"] == userName && account["password"] == password) {
        console.log("Match!");
        match = true;
        break;
      }
    }

    // Login succeeded! Set the session variable and send the user
    // to the dashboard
    if (match) {
      req.session.username = userName;
      res.redirect("/dashboard");
    } else {
      // If no matches have been found, we are done
      res.send("<b>Wrong</b>");
    }
  });

  if (correctPass && correctPass === password) {
    // Set the session
    req.session.username = userName;
    res.redirect("/dashboard");
  } else {
    res.send("Wrong!");
  }
  res.send("Wrong");
});

// The logout function
// @param req - the request
// @param res - the response
router.get("/logout", function (req, res) {
  // Kill the session
  req.session.reset();
  res.redirect("/");
});

// The default page
// @param req - the request
// @param res - the response
router.get("/", function (req, res) {
  // Is this user logged in?
  if (req.session.username) {
    // Yes!
    res.redirect("/dashboard");
  } else {
    // No!
    res.render("loginpage");
  }
});

// The login page
// @param req - the request
// @param res - the response
router.get("/dashboard", function (req, res) {
  // Is this user logged in? Then show the dashboard
  if (req.session.username) {
    res.render("dashboard", { username: req.session.username });
  }
  //Not logged in! Redirect to the mainpage
  else {
    res.redirect("/");
  }
});

// The login script
// @param req - the request
// @param res - the response
router.post("/login", function (req, res) {
  // Get the username and password data from the form
  let userName = req.body.username;
  let password = req.body.password;

  // Construct the query
  let query =
    "USE users; SELECT username,password from appusers where username='" +
    userName +
    "' AND password='" +
    password +
    "'";
  console.log(query);

  // Query the DB for the user
  mysqlConn.query(query, function (err, qResult) {
    if (err) throw err;

    console.log(qResult[1]);

    // Does the password match?
    let match = false;

    // Go through the results of the second query
    for (let account of qResult[1]) {
      if (account["username"] == userName && account["password"] == password) {
        console.log("Match!");
        match = true;
        break;
      }
    }

    // Login succeeded! Set the session variable and send the user
    // to the dashboard
    if (match) {
      req.session.username = userName;
      res.redirect("/dashboard");
    } else {
      // If no matches have been found, we are done
      res.send("<b>Wrong</b>");
    }
  });

  if (correctPass && correctPass === password) {
    // Set the session
    req.session.username = userName;
    res.redirect("/dashboard");
  } else {
    res.send("Wrong!");
  }
  res.send("Wrong");
});

// The logout function
// @param req - the request
// @param res - the response
router.get("/logout", function (req, res) {
  // Kill the session
  req.session.reset();
  res.redirect("/");
});
