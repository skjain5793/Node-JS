
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

//load users route
var users = require('./routes/users'); 
var app = express();

var connection  = require('express-myconnection'); 
var mysql = require('mysql');

var cookieParser = require('cookie-parser');
var session = require('express-session');

var admin = require('./routes/admin'); 

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


// all environments
app.set('port', process.env.PORT || 4300);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

document_filePath = path.join(__dirname, 'public/documents');

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*------------------------------------------
    connection peer, register as middleware
    type koneksi : single,pool and request 
-------------------------------------------*/

app.use(
    
    connection(mysql,{
        
        host: 'localhost', //'localhost',
        user: 'root',
        password : 'Rajiv@123',
        port : 3306, //port mysql
        database:'projectreviews'

    },'pool') //or single

);

var expressValidator = require('express-validator')
app.use(expressValidator());
var bodyParser = require('body-parser');
var flash = require('express-flash')
var cookieParser = require('cookie-parser');
var session = require('express-session');

/* var fileUpload = require('express-fileupload');
app.use(fileUpload()); */

app.use(cookieParser('keyboard cat'))
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

// Authentication and Authorization Middleware
var auth = function(req, res, next) {
  if (req.session && (req.session.user_role === "user" || req.session.user_role === "super_admin")){
	res.locals.accesses = req.session.accesses; 
    return next();
  }
  else{
    return res.redirect('/');
  }
};

var authloginpage = function(req, res, next) {
  if (req.session && (req.session.user_role === "user" || req.session.user_role === "super_admin"))
    res.redirect('/upload_documents');
  else
    return next();
};

function sendStatus(err){
	console.log(err);
}

// Upload File Middleware
/* var file_uploaded = function(req, res, next) {
  if (req.session && req.session.user_role === "user")
    return next();
  else
    return sendStatus(401);
};
 */
/* function sendStatus(err){
	console.log(err);
} */

app.use(flash())

app.get('/', authloginpage, routes.index);
//app.get('/users', users.list);
app.get('/users/add', users.add);
app.post('/users/add', users.save);
/*app.get('/users/delete/:id', users.delete_user);
app.get('/users/edit/:id', users.edit);
app.post('/users/edit/:id',users.save_edit); */
//app.get('/login', users.login);
app.post('/login', users.authenticate);
//app.get('/verify_email', users.verfiypage);
//app.get('/send', users.verificationmail);
//app.get('/verifyemail/',users.verificationmail);
app.get('/verifyemail/:?', users.verfiypage);
app.get('/signup', users.signuppage);
app.post('/verify/:?', users.verify);

app.get('/forgot_password', users.forgot_password_page);
app.post('/forgotPassword', users.forgot_password);
app.get('/resetpassword/:?', users.reset_password_page);
app.post('/resetPassword/:?', users.resetPassword);
// initialize cookie-parser to allow us access the cookies stored in the browser. 
//app.use(cookieParser());

/* // initialize express-session to allow us track the logged-in user across sessions.
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true})); */

app.get('/upload/documents', auth, users.upload_documents_page);

/* app.get('/upload_documents', auth, function (req, res) {
    console.log("logged in"+req.session.user_id);
	//users.resetPassword;
});
 */
app.post('/upload', auth, users.uploadFile);

app.get('/logout',users.logout);

// admin routes
var adminauth = function(req, res, next) {
  if (req.session && req.session.user_role === "super_admin")
  {
	res.locals.accesses = req.session.accesses;
    return next();
  }
  else{
    return res.redirect('superman');
  }
};

var adminauthloginpage = function(req, res, next) {
  if (req.session && req.session.user_role === "super_admin")
    res.redirect('superman/dashboard');
  else
    return next();
};

app.get('/superman', adminauthloginpage, admin.login_page);
app.post('/superman/login', admin.authenticate);
app.get('/superman/dashboard', adminauth, admin.dashboard_page);
app.get('/superman/users/groups/add', adminauth, admin.users_groups_add);
app.post('/superman/users/groups/add', adminauth, admin.users_groups_save);
app.get('/superman/users/groups/edit/:id', adminauth, admin.user_groups_edit);
app.post('/superman/users/groups/edit/:id', adminauth, admin.save_user_groups_edit);
app.get('/superman/users/groups/delete/:id', adminauth,  admin.delete_user_groups);
app.get('/superman/users/groups', adminauth, admin.users_groups_list);
app.get('/superman/users', adminauth, admin.users_list);
app.get('/superman/users/add', adminauth, admin.add_user);
app.post('/superman/users/add', adminauth, admin.save_user);
app.get('/superman/users/delete/:id', adminauth, admin.delete_user);
app.get('/superman/users/edit/:id', adminauth, admin.user_edit);
app.post('/superman/users/edit/:id', adminauth, admin.save_user_edit);
app.get('/superman/users/files/:id', adminauth, admin.user_files);

app.get('/download/:filename', function(req, res){
	  var filename = req.params.filename;
	  var file = document_filePath + '/'+filename;
	  res.download(file); // Set disposition and send it.
})

app.post('/superman/users/files/:userid/:documentid', adminauth, admin.user_document_status);

/* app.get('/superman/dashboard', auth, function (req, res) {
    console.log("logged in"+req.session.user_id);
	admin.dashboard_page;
}); */
//app.get('/superman/*', admin.check);
/* app.get('/superman/*', adminauth, function (req, res) {
    console.log("logged in"+req.session.user_id);
	//users.resetPassword;
}); */

app.use(function(req, res, next) {
  res.locals.user = 'hi';
  next();
});

app.use(app.router);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
