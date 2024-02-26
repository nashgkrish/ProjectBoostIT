var express = require('express');
var session = require('express-session');
var path = require('path');
var app = express();
/*const ibmdb = require('ibm_db');*/

 
var mysql=require('mysql');
var connection=require('./dbConfig');
 
//ejs template
app.set('view engine','ejs');

app.use(session({
	secret: 'yoursecret',
	resave: true,
	saveUninitialized: true
}));

app.use('/public', express.static('public'));
 
//this is for read POST data
app.use(express.json());
 
app.use(express.urlencoded({
	extended:true
}));
 
app.get('/', function (req, res){
	res.render("home");
	})
 
 
 app.get('/about', function (req, res){
	res.render("about");
	})

app.get('/contactus', function (req, res) {
connection.query("SELECT * FROM contactus", function(err,result){
	if (err) throw err;
	console.log(result);
	res.render('contactus', {title: 'Contactus', customerData:result});
	}); 
});
 
app.get('/services', function(req, res) {
	res.render('services');
});

app.post('/', function(req, res){
	var name = req.body.name;
	var phonenumber = req.body.phonenumber;
	var email = req.body.email;
	var message = req.body.message;
	console.log(req.body);
	var sql = `INSERT INTO users (name, phone_number, email, message) VALUES ("Bar", "1234567890", "bar@gmail.com", "Your message here")`;
	connection.query(sql, function(err, result){
		if (err) throw err;
		console.log("record inserted");
	});
	return res.render('home', { errormessage: 'insert data sussesfully' });
});

app.post('/contactus', function (req, res, next){

	var name = req.body.Name;
	var phonenumber = req.body.PhoneNumber;

	var email = req.body.Email;
	var message = req.body.Message;

	var sql = `INSERT INTO contactus (Name,PhoneNumber, Email, Message) VALUES ("${name}", "${phonenumber}", "${email}","${message}")`;

	connection.query(sql, function(err, result) {

		if (err) throw err;

		console.log('message recorded');

		res.render('contactus');

	});
});

	// Login and Register

	app.get('/loginRegister', function (req, res){
		res.render("loginRegister");
	});
		
	app.get('/login', function(req, res) {
		res.render('login.ejs');
	});
	
	app.post('/auth', function(req, res) {
		let username = req.body.username;
		let password = req.body.password;
		if (username && password) {
			connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
				if (error) throw error;
				if (results.length > 0) {
					req.session.loggedin = true;
					req.session.username = username;
					res.redirect('/membersOnly');
				} else {
					res.send('Incorrect Username and/or Password!');
				}			
				res.end();
			});
		} else {
			res.send('Please enter Username and Password!');
			res.end();
		}
	});
	
	app.get('/register', function (req, res){
		res.render("register");
	});
	
	//REGISTER USER
	app.post('/register', function(req, res) {
		let username = req.body.username;
		let password = req.body.password;
		if (username && password) {
			var sql = `INSERT INTO users (username, password) VALUES ("${username}", "${password}")`;
			connection.query(sql, function(err, result) {
				if (err) throw err;
				console.log('record inserted');
				res.render('loginRegister');
			})
		}
		else {
			console.log("Error");
		}
	  });
	  
	// Users can access this if they are logged in
	app.get('/membersOnly', function (req, res, next) {
		if (req.session.loggedin) {
			res.render('membersOnly');
		} 
		else {
			res.send('Please login to view this page!');
		}
	});
	
	app.get('/logout',(req,res) => {
		req.session.destroy();
		res.redirect('/');
	});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Running at port ${PORT}`);
});