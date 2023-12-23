var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'nodelogin'
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/logout', function(request, response) {
	request.session.destroy(function(error) {
		response.redirect('/');
	});
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.sendFile(path.join(__dirname + '/home.html'));
	} else {
		response.redirect('/');
	}
});

app.get('/', function(request, response) {
    if (request.session.loggedin) {
        response.redirect('/home');
    } else {
        response.sendFile(path.join(__dirname + '/login.html'));
    }
});


app.get('/', function(request, response) {
	if (request.session.loggedin) {
		response.redirect('/home');
	} else {
		response.sendFile(path.join(__dirname + '/login.html'));
	}
});

app.get('/signup', function(request, response) {
    response.sendFile(path.join(__dirname, 'signup.html'));
});

app.post('/signup', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    var email = request.body.email;

    // ตรวจสอบว่ามี username หรือ email นี้ในฐานข้อมูลแล้วหรือไม่

    var checkDuplicateQuery = 'SELECT * FROM accounts WHERE username = ? OR email = ?';
    connection.query(checkDuplicateQuery, [username, email], function(error, results, fields) {
        if (error) throw error;

        if (results.length > 0) {
            response.send('Username or Email already exists. Please choose a different one.');
        } else {
            // เพิ่มข้อมูลในฐานข้อมูล

            var insertQuery = 'INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)';
            connection.query(insertQuery, [username, password, email], function(error, results, fields) {
                if (error) throw error;

                // Redirect ไปที่หน้า Login
                response.redirect('/');
            });
        }
    });
});


app.post('/signup', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    var email = request.body.email;

    // ตรวจสอบว่ามี username หรือ email นี้ในฐานข้อมูลแล้วหรือไม่

    var checkDuplicateQuery = 'SELECT * FROM accounts WHERE username = ? OR email = ?';
    connection.query(checkDuplicateQuery, [username, email], function(error, results, fields) {
        if (error) throw error;

        if (results.length > 0) {
            response.send('Username or Email already exists. Please choose a different one.');
        } else {
            // เพิ่มข้อมูลในฐานข้อมูล

            var insertQuery = 'INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)';
            connection.query(insertQuery, [username, password, email], function(error, results, fields) {
                if (error) throw error;

                response.send('Sign Up successful. You can now <a href="/">login</a>.');
            });
        }
    });
});

app.get('/home', function(request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/home.html'));
    } else {
        response.redirect('/');
    }
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.sendFile(path.join(__dirname + '/home.html'));
	} else {
		response.send('Please login to view this page!');
	}
});

app.listen(3000);
console.log('Server started');