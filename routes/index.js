import express from "express";
import sessions from "express-session";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
// load environment variables
import { config } from "dotenv";
config();
// define constants
const SEC_TO_MS = 1000;
const MIN_TO_SEC = 60;
const SESSION_DURATION = 30;
const SESSION_ACTIVE = 5;
// Connect to the database
const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});
// The express router we pass
// to the app to handle the routes
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
  if (req.session.username) {
    res.render("dashboard", { username: req.session.username });
  } else {
    res.redirect("/");
  }
});
// The login script
// @param req: {username: string, password: string}
// @param res - the response
router.post("/login", async (req, res) => {
  // Get the username and password data from the form
  let userName = req.body.username;
  let password = req.body.password;
  let sessionID = req.sessionID;
  // Construct the query
  const query = 'SELECT `username`,`password` from `appusers` where `username`= ? AND `password`= ?';
  // Query the DB for the user
  connection.execute(query, [userName, password], function (err, result) {
    if (err) throw err;
    console.log(result[1]);
    // Does the password match?
    let match = false;
    // Go through the results of the second query
    for (let account of result[1]) {
      if (account["username"] == userName) {
        bcrypt.compare(password, account["password"], function (err, passMatch) {
          if (err) throw err;
          match = passMatch;
        });
        if (match) break;
      }
    }
    const query = 'UPDATE `appusers` SET `session_id` = ? WHERE `username` = ? AND `password` = ?';
    connection.execute(query, [sessionID, userName, password], function (err, result) {
      if (err) throw err;
      console.log(result[1]);
    });
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
  // update the user's session column
  const query = 'UPDATE `appusers` SET `session_id` = NULL WHERE `session_id` = ?';
  connection.execute(query, [req.sessionID], function (err, result) {
    if (err) throw err;
    console.log(result[1]);
  });
 // Kill the session
  req.session.reset();
  // Send the user back to the login page
  res.redirect("/");
});
// export the routes
export default router;
