'use strict'
const  express = require('express');
const sessions = require('client-sessions');
const bodyParser = require("body-parser");
// const Database = require('./database.js');
const { User } = require('./models.js')
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(sessions({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
})); 

// The default page
// @param req - the request
// @param res - the response
app.get("/", function(req, res) {
	// Is this user logged in?
	if(req.session.username) {
		// Yes!
		res.redirect('/dashboard');
	}	else {
		// No!
		res.render('loginpage');
	}
});

// The login page
// @param req - the request
// @param res - the response
app.get('/dashboard', function(req, res) {
	// Is this user logged in? Then show the dashboard
	if(req.session.username) {
		res.render('dashboard', {username: req.session.username});
	} else {
	//Not logged in! Redirect to the mainpage
		res.redirect('/');
	}
});

// The login script
// @param req - the request
// @param res - the response
app.post('/login', async function(req, res){
	// Get the username and password data from the form
	let userName = req.body.username;
	let password = req.body.password;
  let match = false;
  
  const user = await User.findByPk(userName);
  
  if (user.password === password) {
    console.log("We have a match!");
    match = true;
  }
 	// Login succeeded! Set the session variable and send the user to the dashboard
  if(match) {
    req.session.username = userName;
    user.update('session_id', req.session);
    res.redirect('/dashboard');
  } else {
    // If no matches have been found, we are done
    res.send("<b>Wrong</b>");				
  }
});

// The logout function
// @param req - the request
// @param res - the response
app.get('/logout', function(req, res){
	// Kill the session
	req.session.reset();
	res.redirect('/');
});

app.listen(3000);

