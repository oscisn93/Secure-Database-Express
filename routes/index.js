import express from "express";
import sessions from "express-session";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
// load environment variables
import { config } from "dotenv";
config();
// define constants
const SEC_TO_MS = 1000;
const MIN_TO_SEC = 60;
const SESSION_DURATION = 30;
const SESSION_ACTIVE = 5;
// Connect to the database
const mysqlConn = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});
// The express router for the app
const router = express.Router();
// Needed to parse the request body
router.use(bodyParser.urlencoded({ extended: true }));
// The session settings middleware
router.use(
  sessions({
    resave: false,
    saveUninitialized: false,
    cookieName: "session",
    secret: "6afedb7a8348eb4ebdbe0c77ef92db4c",
    duration: SESSION_DURATION * MIN_TO_SEC * SEC_TO_MS,
    activeDuration: SESSION_ACTIVE * MIN_TO_SEC * SEC_TO_MS,
  })
);
/**
 * Define user api routes
 */
/// The default page
// @param req - the request
// @param res - the response
router.get("/", function (req, res) {
  // Is this user logged in?
  if (req.session.username) {
    res.redirect("/dashboard");
  } else {
    res.render("loginpage");
  }
});
// The login page
// @param req - the request
// @param res - the response
router.get("/dashboard", async (req, res) => {
  // Is this user logged in? Then show the dashboard
  if (req.session.username) {
    res.render("dashboard", { username: req.session.username });
  } else {
    res.redirect("/");
  }
});
// The login script
// @param req - the request
// @param res - the response
router.post("/login", async (req, res) => {
  // Get the username and password data from the form
  let userName = req.body.username;
  let password = req.body.password;
  // TODO: rewrite to use prepared statements
  // Construct the query
  let query =
    "USE users; SELECT username,password from appusers where username='" +
    userName +
    "' AND password='" +
    password +
    "'";
  console.log(query);
  // TODO: refactor to use async await
  // Query the DB for the user
  mysqlConn.query(query, function (err, qResult) {
    if (err) throw err;
    console.log(qResult[1]);
    // Does the password match?
    let match = false;
    // TODO: add bcrypt hashing and password checking
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
      res.send("<b>Incorrect password value</b>");
    }
  });
});
// The logout function
// @param req - the request
// @param res - the response
router.get("/logout", async (req, res) => {
  // Kill the session
  req.session.reset();
  // TODO: update the user's session column
  // in the database so that the session is
  // either null or some prefined value
  res.redirect("/");
});
// export the routes
export default router;
