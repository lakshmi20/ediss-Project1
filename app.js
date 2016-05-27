var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes');
var users = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(session({
      secret: 'meera', 
      saveUninitialized: true, 
      resave: true, 
      cookie: {
      path: '/', 
      httpOnly: true, 
      maxAge: 90000
      }, 
      rolling: true}
      )
      );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.get('/', routes.index);
app.get('/users', users.list);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'ediss'
});

connection.connect();

var user_ses;

app.post('/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    
    
    if(username == "" || password == "" || typeof username == 'undefined' || typeof password == 'undefined'){
      res.json({"error":"Please enter username and password"});
    }
    else{
    
    connection.query('SELECT * FROM users WHERE username = ?  AND password = ?',[username,password],function(err,rows){
    	  if(err){
    		  res.json({"error":"There seems to be an issue with the username/password combination that you entered"});
    	  }
    	  if(rows.length > 0){
    	  user_ses = req.session;
    	        user_ses.user = username;
                user_ses.status = "logged in";
                var id = req.sessionID;
                var name = rows[0].firstname;
    	res.json({"message":"Welcome " +name,});
    	
    	connection.query('UPDATE users SET sessionid = ? WHERE username = ?',[id,username], function(err,rows) {

            if(err) {
              //res.json({"error":"session upadate failed"});
            }

          });
    	  }
    	  else{
    		  
    	        res.json({"error":"There seems to be an issue with the username/password combination that you entered"});
    	  }
      });
    }

});

  app.post('/logout', function(req, res) {
  user_ses = req.session;
  var id = req.sessionID;
  var username = user_ses.user;
  
  connection.query('SELECT * FROM users WHERE sessionid = ?',[id],function(err,rows) {            
      if(err) {
        
        res.json({"message":"You are not currently logged in" +id});
      }
      if(rows.length > 0) {
        user_ses.destroy();
        res.json({"success":"You have been  succesfully logged out" +id});
      }
      else {
        res.json({"message":"You are not currently logged in"});
      } 
    });
  });
  
  app.post('/add',function(req,res){
  
  user_ses = req.session;
  var id = req.sessionID;
  
  if(user_ses.user){
  
  var num1 = parseInt(req.body.num1);
  var num2 = parseInt(req.body.num2);
  
  var ans = num1 + num2;
  
  res.json({"answer":ans});
  
  }
  else{
  res.json({"message":"You must be logged in before acccesing this function"});
  }
  
  
  });
  app.post('/multiply',function(req,res){
  
  user_ses = req.session;
  var id = req.sessionID;
  
  if(user_ses.user){
  
  var num1 = parseInt(req.body.num1);
  var num2 = parseInt(req.body.num2);
  
  var ans = num1 * num2;
  
  res.json({"answer":ans});
  
  }
  else{
  res.json({"message":"You must be logged in before acccesing this function"});
  }
  
  });

app.post('/divide',function(req,res){
  
  user_ses = req.session;
  var id = req.sessionID;
  
  if(user_ses.user){
  
  	var num1 = parseInt(req.body.num1);
  	var num2 = parseInt(req.body.num2);
  
  	if(num2 != 0){
  
 	var ans = num1 / num2;
  
  	res.json({"answer":ans});
  	}

  	else{
  
  	res.json({"error":"The numbers you entered are not valid"});
  	}
  }
  else{
  	res.json({"message":"You must be logged in before acccesing this function"});
  	}
  
  
});
module.exports = app;

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port)

});

