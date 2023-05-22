import express from "express";
import sessions from "client-sessions";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import { passwordStrength } from "check-password-strength";
import { v4 as uuid } from "uuid";
// load environment variables
import { config } from "dotenv";
config();
// define constants
const SEC_TO_MS = 1000;
const MIN_TO_SEC = 60;
const SESSION_DURATION = 30;
const SESSION_ACTIVE = 10;
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
    if (!req.session.sessionID) {
      req.session.sessionID = uuid();
    }
    res.render("login");
  }
});
router.get("/register", function (req, res) {  
  if (!req.session.sessionID) {
    req.session.sessionID = uuid();
  }
  res.render("register");
});
router.get("/tos", function (req, res) {
  res.render("tos");
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
  let userName = req.body.username.toLowerCase();
  let password = req.body.password;
  let sessionID = req.session.sessionID;
  // Construct the query
  const queryUsername =
    "SELECT `username`,`password` from `appusers` where `username`= ?";
  // Query the DB for the user
  const [rows, _fields] = await connection.execute(queryUsername, [userName]);
  if (rows.length === 0) {
    res.redirect("/login");
    return;
  }
  // Check if the password matches
  bcrypt.compare(password, rows[0]["password"], async function (err, match) {
    if (err) throw err;
    // If the password matches, set the session variable
    // and send the user to the dashboard
    if (match) {
      const query = "UPDATE `appusers` SET `session` = ? WHERE `username` = ?";
      try {
        await connection.execute(
        query,
        [sessionID, userName]);
      } catch(err) {
        res.redirect("/login");
        return;
      }
      req.session.username = userName;
      res.redirect("/dashboard");
    } else {
      // If no matches have been found, we are done
      res.redirect("login");
    }
  });
});
// The register script
// @param req: {username: string, password: string}
// @param res - the response
router.post("/register", async (req, res) => {
  // Get the username and password data from the form
  let userName = req.body.username.toLowerCase();
  let password = req.body.password;
  let sessionID = req.sessionID;
  const strength = passwordStrength(password);
  // Check if the password is strong enough
  if (strength.id < 3) {
    res.render("register", { errors: [{ msg: "Password is too weak" }] });
    return;
  }
  // Check if the username is valid
  if (userName.length < 3) {
    res.render("register", { errors: [{ msg: "Username is too short" }] });
    return;
  }
  // Check if the username is already taken
  const [rows, _fields] = await connection.execute(
    "SELECT COUNT(*) FROM `appusers` WHERE `username` = ?",
    [userName]
  );
  if (rows[0] > 0) {
    res.render("register", { errors: [{ msg: "Username is already taken" }] });
    return;
  }
  // Construct the query
  const query =
    "INSERT into `appusers` (`username`, `password`, `session`) VALUES (?, ?, ?)";
  // generate salt with 12 rounds
  const salt = await bcrypt.genSalt(12);
  // Query the DB for the user
  bcrypt.hash(password, salt, async function (err, hash) {
    if (err) throw err;
    try {
      await connection.execute(query, [userName, hash, sessionID]);
    } catch(err) {
      res.redirect("/register");
      return;
    }
    // Registration succeeded!
    req.session.username = userName;
    res.render("dashboard", {username: userName});
  });
});
// The logout function
// @param req - the request
// @param res - the response
router.get("/logout", async (req, res) => {
  // update the user's session column
  const query =
    "UPDATE `appusers` SET `session` = NULL WHERE `session` = ?";
  connection.execute(query, [req.session.sessionID], function (err, result) {
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
