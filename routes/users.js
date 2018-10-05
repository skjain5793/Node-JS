
/*
 * GET users listing.
 */

exports.list = function(req, res){

  req.getConnection(function(err,connection){
       
        var query = connection.query('SELECT * FROM users',function(err,rows)
        {
            
            if(err)
                console.log("Error Selecting : %s ",err );
     
            res.render('users',{page_title:"users - Node.js",data:rows});
                
           
         });
         
         //console.log(query.sql);
    });
  
};

exports.add = function(req, res){
  res.render('add_user',{page_title:"Add users - Node.js"});
};

exports.forgot_password_page = function(req,res) {
  res.render('forgot_password',{email:''});
}

/* exports.gmaillogincredientials = function(req, res){
	nodemailer = require("nodemailer");
	
	smtpTransport = nodemailer.createTransport({
		service: "Gmail",
		auth: {
			user: "mukesh.samaarambh@gmail.com",
			pass: "make-in-india@@"
		}
	});
} */

function gmaillogincredientials(){
	nodemailer = require("nodemailer");
	
	smtpTransport = nodemailer.createTransport({
		service: "Gmail",
		auth: {
			user: "sanjeev.samaarambh@gmail.com",
			pass: "make-in-india@@"
		}
	});
}

/* function nexmoconfig(){
	Nexmo = require('nexmo')

	nexmo = new Nexmo({
	  apiKey: "c0f3475f",
	  apiSecret: "eoSyW9X8ILCaVQxz"
	})
} */

exports.reset_password_page = function(req,res) {
  var url = require('url');
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  var id = req.query.id;
  res.render('reset_password',{user_password:'', id: id});
}

exports.resetPassword = function(req,res) {
	
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
    var id = req.query.id;
	
	req.assert('user_password', 'Please enter your new password').notEmpty()  //Validate poassword
	var errors = req.validationErrors();
	
	if( !errors ) {
		
		var input = JSON.parse(JSON.stringify(req.body));
		user_password = input.user_password;
		
		hash = id;
		
		req.getConnection(function (err, connection) {
			var query = connection.query('SELECT * FROM users WHERE hash = ?',[hash],function(err,rows){
				numRows = rows.length;
				//console.log(numRows);
				if(numRows==0){
					var error_msg = 'Error';            
					req.flash('error', error_msg)        

					res.render('reset_password', { 
						user_password: user_password,
						id: id
					});	
				} else{
					
					var data = {
						user_password : input.user_password,					
					};
					console.log(hash);
					connection.query("UPDATE users set ? WHERE hash = ? ",[data,hash], function(err, rows)
					{
			  
					  if (err){
						  var error_msg = 'Sorry Something went wrong. Please try again!';            
							req.flash('error', error_msg)        

							res.render('reset_password', { 
								user_password: user_password,
								id: id
							});	
					  }else{
						  success_msg = "Your password has been updated. Now you can login with new password.";
						  req.flash('success', success_msg)
						  res.render('reset_password', { 
								user_password: user_password,
								id: id
						  });	
					  }
					 
					  //res.redirect('/users');
					  
					});
				}
			});
		});
		
	} else{
		var error_msg = '';
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})                
		req.flash('error', error_msg)        

		res.render('reset_password', { 
			user_password: req.body.user_password,
			id: id
		});	
	}
}

exports.forgot_password = function(req,res) {
	
	req.assert('email', 'Invalid email id').isEmail()  //Validate email
		
	var errors = req.validationErrors();
		
	if( !errors ) {
		
		var input = JSON.parse(JSON.stringify(req.body));
		
		email   = input.email;
		
		req.getConnection(function (err, connection) {
		
			var query = connection.query('SELECT * FROM users WHERE email = ?',[email],function(err,rows){
			numRows = rows.length;
				//console.warn(numRows);
				if(numRows==0){
					var error_msg = 'Sorry, this email id is not registered';
					req.flash('error', error_msg)        
			
					res.render('forgot_password', { 
						email: req.body.email
					});
				} else{
					module.exports.resetpasswordmail(email,req,res);
				}
			});
		}); 
	}	
	else{
		var error_msg = '';
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})                
		req.flash('error', error_msg)        

		res.render('forgot_password', { 
			email: req.body.email
		});	
	}
};

exports.signuppage = function(req, res){

  res.render('signup',{ 
        name: '',
		phone: '',
        email: '',
		user_password: '',		
	});
};

/* exports.edit = function(req, res){
    
    var id = req.params.id;
    
    req.getConnection(function(err,connection){
       
        var query = connection.query('SELECT * FROM users WHERE id = ?',[id],function(err,rows)
        {
            
            if(err)
                console.log("Error Selecting : %s ",err );
     
            res.render('edit_user',{page_title:"Edit users - Node.js",data:rows});
                
           
         });
         
         //console.log(query.sql);
    }); 
}; */

/*Save the users*/
exports.save = function(req,res){
    
    var input = JSON.parse(JSON.stringify(req.body));
    
    req.getConnection(function (err, connection) {
		
		req.assert('name', 'Name is required').notEmpty()           //Validate name
		req.assert('phone', 'Mobile no. is required').notEmpty()             //Validate password
		req.assert('phone', 'Inavlid Mobile no.').isMobilePhone('en-IN')             //Validate mobile number
		req.assert('user_password', 'Password is required').notEmpty()             //Validate mobile number
		req.assert('email', 'A valid email is required').isEmail()  //Validate email
		
		var errors = req.validationErrors();
		
		if( !errors ) {
		
			email   = input.email;
			
			phone   = input.phone;
			
			//console.warn(email);
			var query = connection.query('SELECT * FROM users WHERE email = ?',[email],function(err,rows){
				numRows = rows.length;
				//console.warn(numRows);
				if(numRows>0){
					var error_msg = 'Email id already exists';
					req.flash('error', error_msg)        
			
					/**
					 * Using req.body.name 
					 * because req.param('name') is deprecated
					 */ 
					res.render('signup', { 
						name: req.body.name,
						phone: req.body.phone,
						user_password: req.body.user_password,
						email: req.body.email
					})
				}else{
					var data = {
				
						name    : input.name,
						//address : input.address,
						email   : input.email,
						phone   : input.phone,
						//username : input.username,
						user_password : input.user_password,
						group_id : 2,
						active : 0,
						verified : 0,
						created_on : new Date()
					};
					
					var query = connection.query("INSERT INTO users set ? ",data, function(err, rows)
					{
			  
					  if (err){
						  var error_msg = 'Sorry something went wrong. Please try again!';
							req.flash('error', error_msg)        
					
							/**
							 * Using req.body.name 
							 * because req.param('name') is deprecated
							 */ 
							res.render('signup', { 
								name: req.body.name,
								phone: req.body.phone,
								user_password: req.body.user_password,
								email: req.body.email
							})
					  }else{
						  //email = encodeURIComponent(email);
						  //res.redirect('/verifyemail/'+email);
						  //console.log(__dirname+'/views/php/sendsms.php');
						  module.exports.verificationmail(email,phone,req,res);
					  }			  
					});
				}
			});

			
			/* console.warn("no error");
			
			var data = {
				
				name    : input.name,
				//address : input.address,
				email   : input.email,
				phone   : input.phone,
				//username : input.username,
				user_password : input.user_password,
				active : 0
			
			};
			
			var query = connection.query("INSERT INTO users set ? ",data, function(err, rows)
			{
	  
			  if (err){
				  console.log("Error inserting : %s ",err );
			  }else{
				  //email = encodeURIComponent(email);
				  //res.redirect('/verifyemail/'+email);
				  module.exports.verificationmail(email,req,res);
			  }			  
			}); */
		}
		else {   //Display errors to user
			var error_msg = ''
			errors.forEach(function(error) {
				error_msg += error.msg + '<br>'
			})                
			req.flash('error', error_msg)        
			
			/**
			 * Using req.body.name 
			 * because req.param('name') is deprecated
			 */ 
			res.render('signup', { 
				name: req.body.name,
				phone: req.body.phone,
				user_password: req.body.user_password,
				email: req.body.email
			})
		}
			
		   // console.log(query.sql); get raw query
    
    });
};

/* exports.save_edit = function(req,res){
    
    var input = JSON.parse(JSON.stringify(req.body));
    var id = req.params.id;
    
    req.getConnection(function (err, connection) {
        
        var data = {
            
            name    : input.name,
            address : input.address,
            email   : input.email,
            phone   : input.phone 
        
        };
        
        connection.query("UPDATE users set ? WHERE id = ? ",[data,id], function(err, rows)
        {
  
          if (err)
              console.log("Error Updating : %s ",err );
         
          res.redirect('/users');
          
        });
    
    });
}; */


/* exports.delete_user = function(req,res){
          
     var id = req.params.id;
    
     req.getConnection(function (err, connection) {
        
        connection.query("DELETE FROM users  WHERE id = ? ",[id], function(err, rows)
        {
            
             if(err)
                 console.log("Error deleting : %s ",err );
            
             res.redirect('/users');
             
        });
        
     });
}; */


exports.login = function(req, res){
  res.render('login',{page_title:"User Login"});
};

exports.upload_documents_page = function(req, res){
	get_user_dcouments(req, res);
	//res.render('upload_documents');
}

exports.verfiypage = function(req, res){
	  var url = require('url');
	  var url_parts = url.parse(req.url, true);
	  var query = url_parts.query;
      var id = req.query.id;
		
		//console.warn(id);
		
		//console.warn(url_parts);
  res.render('verifyemail',{mail_otp: '',
		mobile_otp: '',
		id: id,
  });
};

exports.logout = function(req, res){
	req.session.destroy();
	res.redirect('/');
}

function document_upload_mail(req, res){
	
	console.log("in doc mail fucn");
	
	req.getConnection(function (err, connection) {
	
 		gmaillogincredientials();
		
		user_id = req.session.user_id;
		
		var query = connection.query("SELECT email,phone FROM users WHERE id = ? ", [user_id], function(err, rows)
		{
			if(err){
				res.end(err);
			}
			else{
				to = rows[0].email
				mailOptions={
					to : to,
					subject : "first.projectreviews.in - Document Status",
					//html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
					html : "Your documents has been received. Please wait for final verification. <br><br> Thank you, <br>The first.projectreviews.in Team"
			}
			
			smtpTransport.sendMail(mailOptions, function(error, response){
				 if(error){
						//console.log(error);
						res.end("error"+error);
				 }else{
					console.log("mail sent");
					/* nexmoconfig();
					
					console.log(req.session.user_id);
					
							console.log("phone number "+rows[0].phone);
							const from = 'Acme Inc'
							//const to = 919958408063
							const to = '91'+rows[0].phone
							const text = "We have received documents. Please wait for final verification."
							console.log('to '+to);
							nexmo.message.sendSms(from, to, text) */
							
							//var msg = "We have received documents. Please wait for final verification.";
							
							var msg = "We have received documents. Please wait for final verification."
							
							var execPhp = require('exec-php');

							// php now contain user defined php functions.
							execPhp('../views/php/sendsms.php', function(error, php, outprint){
							php.myfunction(rows[0].phone,msg,function(error, result){
								
								return res.redirect('/upload/documents');
								
								/* if(error){
									res.end('err '+error);
								}else{
									result = JSON.parse(result);
									res.end(result.status);
								} */
							});
							});
							
							
							
							//return res.redirect('/upload/documents');
					}
				});
			 }
		});
	});
}

exports.uploadFile = function(req, res){
	//var filePath = path.join(__dirname, 'Documents');
  /* console.log(filePath);
  govt_id_file = req.files.govt_id;
  govt_id_file_name = govt_id_file.name; */

var path = require('path');  
  
var multer	=	require('multer');

var crypto = require('crypto');

var storage	=	multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/documents');
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Math.floor(Date.now() / 1000) + path.extname(file.originalname));
    });
  }
});
var upload = multer({ storage : storage}).single('govt_id');
  
  upload(req,res,function(err) {
		if(err) {
			return res.end("Error uploading file.");
		}else{
			var filename = req.file.filename;
			console.log(req.session.user_id);
			req.getConnection(function (err, connection) {
				console.log(req.body.document_type);
				console.log(req.body.document_id_number);
					var data = {				
						document_name    : req.file.filename,
						document_id_number : req.body.document_id_number,
						document_type :	req.body.document_type,
						user_id : req.session.user_id,
						submitted_on : new Date()						
					};
					
					var query = connection.query("INSERT INTO user_documents set ? ",data, function(err, rows){
		  
				  if (err){
					  console.log(query);
					  res.end('Error '+err);
					  //console.log("Error inserting : %s ",err );
					   //res.render('login',{page_title:"Error inserting"});
				  }else{
					  document_upload_mail(req, res);
					  //res.redirect('/upload/documents');
				  }
				});
			});			
			
			//res.end("File is uploaded");
			//return file_uploaded_save
		}
	});
  
  /* var fs = require('fs');
	var dir = '92';

	if (!fs.existsSync(filePath+'/'+dir)){
		//fs.mkdirSync(dir);
	} */
  
  /* govt_id_file.mv(filePath+'/'+dir+'/'+govt_id_file_name, function(err) {
    if (err){
      console.log(err);
	}else{
		console.log('File uploaded!');
	}
  }); */
}

function get_user_dcouments(req, res){
	id = req.session.user_id;
	
	req.getConnection(function (err, connection) {
	
		var query = connection.query('SELECT * FROM user_documents WHERE user_id = ? order by submitted_on desc ',[id],function(err,rows){
			console.log(rows);
			res.render('upload_documents',{documents:rows});
		});
	});
}

function get_user_groups_permissions(rows){
			var each = require('foreach');
			str = rows[0].permissions;
			str = JSON.parse(str);
			//console.log(typeof(str));
			var permissions_array = [];
			var permission_names = [];
			var result = [];
			each(str, function (value, key, object) {
				permission_names.push(key);
				var arr = key.split("_");
				myStr = arr.toString();
				var newStr = myStr.replace(/,/g, ' ');
				newstr2 = newStr.charAt(0).toUpperCase()+ newStr.slice(1);
				//console.log('Can '+newstr2)
				permissions_array.push('Can '+newstr2);
			});
			result.push(permissions_array,permission_names)
			return result;
}

exports.authenticate = function(req, res){
		var input = JSON.parse(JSON.stringify(req.body));
    
        req.getConnection(function (err, connection) {
        
        email = input.email;
		user_password = input.user_password;

		req.assert('email', 'Please enter your email id').isEmail()  //Validate email
		req.assert('user_password', 'Enter your password').notEmpty()             //Validate mobile number
		
		var errors = req.validationErrors();
        if(!errors){
			var query = connection.query("SELECT * FROM users WHERE email = ? and active = 1", [email], function(err, rows)
			{
	  
			  if (err){
				  //console.log("Error inserting : %s ",err );
				   res.render('index',{page_title:"Error inserting"});
			  }else{
				  if (rows.length > 0) {
					  if (rows[0].user_password == user_password) {
						  var query = connection.query('SELECT permissions from user_groups INNER JOIN users on users.group_id = user_groups.id where users.id = ? ', [rows[0].id], function(err,group_rows)
						 {
							 
							var user_permissions = get_user_groups_permissions(group_rows);
							if(Object.values(user_permissions[1]).indexOf('login_to_frontend') > -1){
								req.session.user_role = "user";
								req.session.user_id = rows[0].id;
								req.session.accesses = user_permissions[1];
								res.locals.accesses = user_permissions[1];
							  /* var success_msg = 'login was successful'              
								req.flash('success', success_msg) */
								get_user_dcouments(req, res);
								res.redirect('/upload/documents');
								/* res.render('index', { 
									email: req.body.email,
									user_password: req.body.user_password,
								}) */
							}
						 });
					  } else{
						  //console.log("Email and Password does not match" );
						  //res.render('index',{page_title:"Username and Password does not match"});
						  var error_msg = 'Invalid Password!'              
							req.flash('error', error_msg)        
							
							res.render('index', { 
								email: req.body.email,
								user_password: req.body.user_password,
							})
					  }
					} else{
						//console.log("Username does not exists!" );
						 //res.render('index',{page_title:"User does not exists!"});
						 var error_msg = 'User does not exists!'              
						req.flash('error', error_msg)        
						
						res.render('index', { 
							email: req.body.email,
							user_password: req.body.user_password,
						})
					}
			  }
			  
			});
		} else {   //Display errors to user
			var error_msg = ''
			errors.forEach(function(error) {
				error_msg += error.msg + '<br>'
			})                
			req.flash('error', error_msg)        
			
			res.render('index', { 
				email: req.body.email,
				user_password: req.body.user_password,
			})
		}
        
       // console.log(query.sql); get raw query
    
    });
};

var encrypt = function(cryptkey, iv, cleardata) {
	const crypto = require('crypto');
    var encipher = crypto.createCipheriv('aes-256-cbc', cryptkey, iv);
    return Buffer.concat([
        encipher.update(cleardata,'utf-8'),
        encipher.final()
    ]);
}

/*var decrypt = function(cryptkey, iv, encryptdata) {
	const crypto = require('crypto');
    var decipher = crypto.createDecipheriv('aes-256-cbc', cryptkey, iv);
    return Buffer.concat([
        decipher.update(encryptdata),
        decipher.final()
    ]);
} */

exports.resetpasswordmail = function(to,req,res){
	
	/* var nodemailer = require("nodemailer");
	
	var smtpTransport = nodemailer.createTransport({
		service: "Gmail",
		auth: {
			user: "sanjeev.samaarambh@gmail.com",
			pass: "make-in-india@@"
		}
	}); */
	
	gmaillogincredientials();
	
	var rand,mailOptions,host,link;
	
	const crypto = require('crypto');
		
		/*const crypto_extra = require('crypto-extra'); */
		
		//randomString = crypto_extra.randomString();
		
		rand = Math.floor((Math.random() * 1000000) + 54);
		
		var hashed = to+rand;
		
		console.log(hashed);
		
		var encrypted_hash = crypto.createHash('md5').update(hashed).digest('hex');
		console.log(encrypted_hash);
		
		link="http://"+req.get('host')+"/resetpassword/?id="+encrypted_hash.toString('base64');
		
		var data = {
			hash :encrypted_hash
        };

		req.getConnection(function (err, connection) {
			connection.query("UPDATE users set ? WHERE email = ? ",[data,to], function(err, rows)
			{
	  
			  if (err){
				  //console.log("Error inserting : %s ",err );
				   res.render('login',{page_title:"Error inserting"});
			  }else{
				  mailOptions={
						to : to,
						subject : "Reset Password",
						html : "Hello,<br> Please Click on the following link to reset your password.<br><a href='"+link+"'>"+link+"</a>"
						//html : "Hi, this is your otp."+rand+"<br> Don't share it with anyone."
					}
					//console.log(mailOptions);
					//console.log("mobile_otp "+mob_rand);
					smtpTransport.sendMail(mailOptions, function(error, response){
						 if(error){
								error_msg = "Something went wrong. Please try again!";
								req.flash('error', error_msg)
								res.render('forgot_password', {email: to})
						 }else{
								success_msg = "Please check your email id to reset your password";
								req.flash('success', success_msg)
								res.render('forgot_password', {email:to})
						 }
					}); 
			  }
			  
			});
		});
		
}

exports.verificationmail = function(to,phone,req,res){
	
	//console.log(to);
	
		/* var nodemailer = require("nodemailer");
	
		var smtpTransport = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: "sanjeev.samaarambh@gmail.com",
				pass: "make-in-india@@"
			}
		}); */
		
		gmaillogincredientials();
		
		var rand,mailOptions,host,link;
		
		const crypto = require('crypto');
		
		/*const crypto_extra = require('crypto-extra'); */
		
		//randomString = crypto_extra.randomString();
		
		rand = Math.floor((Math.random() * 1000000) + 54);
		
		var hashed = to+rand;
		
		console.log(hashed);
		
		/* var cryptkey = crypto.createHash('sha256').update('Nixnogen').digest(),
		iv = new Buffer('a2xhcgAAAAAAAAAA'),
		buf = new Buffer(hashed, "utf8"), // 32 chars
		encrypted_hash = encrypt(cryptkey, iv, buf); */
		
		var encrypted_hash = crypto.createHash('md5').update(hashed).digest('hex');
		console.log(encrypted_hash);
		
		//encrypted_hash = encrypted_hash.toString('base64');
		
		console.log("encrypted_hash "+encrypted_hash);
		
		mob_rand = Math.floor((Math.random() * 1000000) + 54);
		
		var data = {
            mail_otp   : rand,
			mobile_otp : mob_rand,
			hash :encrypted_hash
        };
		
		
		req.getConnection(function (err, connection) {
			connection.query("UPDATE users set ? WHERE email = ? ",[data,to], function(err, rows)
			{
	  
			  if (err){
				   console.log("Error inserting : %s ",err );
				   var error_msg = ''
				   error_msg = "Sorry something went wrong. Please try again!";
				   req.flash('error', error_msg)  
				   res.render('/users/add');
			  }else{
				  mailOptions={
						to : to,
						subject : "first.projectreviews.in - Signup Email Verification",
						//html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
						html : "This email is sent to you as a response to your Signup process at <a href='first.projectreviews.in'>first.projectreviews.in</a>. <br> To Complete your Signup please verify and confirm your email address by entering this otp : "+rand+"<br><br> Thank you, <br>The first.projectreviews.in Team"
					}
					//console.log(mailOptions);
					console.log("mobile_otp "+mob_rand);
					smtpTransport.sendMail(mailOptions, function(error, response){
						 if(error){
								console.log(error);
								//res.end("error"+error);
						 }else{
							/* const Nexmo = require('nexmo')

							const nexmo = new Nexmo({
							  apiKey: "c0f3475f",
							  apiSecret: "eoSyW9X8ILCaVQxz"
							}) */
							
							console.log("mail sent");

								var msg = "Your otp is "+mob_rand;
							
								var execPhp = require('exec-php');

								// php now contain user defined php functions.
								execPhp('../views/php/sendsms.php', function(error, php, outprint){
									//console.log(" phone "+phone);
								php.myfunction(phone,msg,function(error, result){
									return res.redirect('verifyemail/?id='+encrypted_hash.toString('base64'));
									/* if(error){
										console.log('err '+error);
										res.end('err '+error);
									}else{
										console.log('sms sent');
										result = JSON.parse(result);
										res.end(result.status);
									} */
								});
								});
							
								//nexmoconfig();

								/* const from = 'Acme Inc'
								//const to = 919958408063
								const to = '91'+phone
								const text = "Your otp is "+mob_rand

								nexmo.message.sendSms(from, to, text) */
								//return res.redirect('verifyemail/?id='+encrypted_hash.toString('base64'));
							 }
					}); 
			  }
			  
			});
		});
	
		/* var passedvalues = [randomString,to];
		
		var cryptkey = crypto.createHash('sha256').update('Nixnogen').digest(),
		iv = new Buffer('a2xhcgAAAAAAAAAA'),
		buf = new Buffer(JSON.stringify(passedvalues), "utf8"), // 32 chars
		encrypted_hash = encrypt(cryptkey, iv, buf); */
		//var dec = decrypt(cryptkey, iv, encrypted_hash);
		
		
		
		/* console.log("randomString "+randomString);
		//console.warn("encrypt length: ", enc.length);
		console.warn("encrypt in Base64 hash:", encrypted_hash.toString('base64'));
		console.warn("decrypt all hash: " + JSON.parse(dec.toString().toString('utf8')));  */
		
		//var dec = decrypt(cryptkey, iv, enc);
		
		/* console.log("to  "+to);
		//console.warn("encrypt length: ", enc.length);
		console.warn("encrypt in Base64 to:", enc.toString('base64'));
		console.warn("decrypt all to: " + dec.toString('utf8')); */
		
		//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        
		//host=req.get('host');
		//link="http://"+req.get('host')+"/verify/?id="+encrypted_hash.toString('base64');
		/* mailOptions={
			to : to,
			subject : "Please confirm your Email account",
			//html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
			html : "Hi, this is your otp."+rand+"<br> Don't share it with anyone."
		}
		//console.log(mailOptions);
		smtpTransport.sendMail(mailOptions, function(error, response){
			 if(error){
					console.log(error);
				    //res.end("error"+error);
			 }else{
					console.log("Message sent: " + response.message);
					res.render('verifyemail',{page_title:"A verification link has been sent to your email id. Please verify your email."});
				//res.end("sent");
				 }
		});  */
}

/* exports.check_email_existence = function(req,res,email){
	req.getConnection(function (err, connection) {
		console.warn(email);
		var query = connection.query('SELECT * FROM users WHERE email = ?',[email],function(err,rows){
			numRows = rows.length;
			//console.warn(numRows);
			if(numRows>0){
				//console.warn(numRows);
				return true;
			}else{
				console.warn("not");
				return false;
			}
		});
	});
} */

exports.verify = function(req,res){
	
	/* console.log(req.protocol+":/"+req.get('host'));
	host=req.get('host');
	
	var url = require('url');
	var url_parts = url.parse(request.url, true);
	var query = url_parts.query;
	var id = req.query.id;

	
	var cryptkey = crypto.createHash('sha256').update('Nixnogen').digest(),
	iv = new Buffer('a2xhcgAAAAAAAAAA');
	
	var hash = decrypt(cryptkey, iv, hash);
	
	hash = JSON.parse(dec.toString().toString('utf8'));
	
	console.warn(hash); */
	
	/* if((req.protocol+"://"+req.get('host'))==("http://"+host))
	{
		console.log("Domain is matched. Information is from Authentic email");
		if(req.query.id==rand)
		{
			console.log("email is verified");
			res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
		}
		else
		{
			console.log("email is not verified");
			res.end("<h1>Bad Request</h1>");
		}
	}
	else
	{
		res.end("<h1>Request is from unknown source");
	} */
	
	
	
	 req.getConnection(function (err, connection) {
		 
		var url = require('url');
		var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
		var id = req.query.id;
		
		console.warn(id);
		 
		hash = id;
		
		//console.log(req.body.mail_otp);
		
		req.assert('mail_otp', 'Enter otp sent to your email id.').notEmpty()           //Validate email otp
		req.assert('mobile_otp', 'Enter otp sent to your mobile number.').notEmpty()    //Validate mobile no. otp
		
		var errors = req.validationErrors();
		
		if(!errors){
			var query = connection.query('SELECT * FROM users WHERE hash = ?',[hash],function(err,rows)
			{
				
				 if(err){
				   //console.log("Error Selecting : %s ",err );
				   var error_msg = ''
					error_msg = "Sorry something went wrong. Please try again!";
					req.flash('error', error_msg)        
					
					res.render('verifyemail', { 
						mail_otp: req.body.mail_otp,
						mobile_otp: req.body.mobile_otp,
						id: id
					})
				 }else{

					 mail_otp = req.body.mail_otp;
					 
					 mobile_otp = req.body.mobile_otp;
					 
					 //console.log(rows.length);
					 
					 if(rows.length>0){
				 
						 if(mail_otp == rows[0].mail_otp && mobile_otp==rows[0].mobile_otp){
							 var data = {
								active   : 1         
							 };
							 connection.query("UPDATE users set ? WHERE hash = ? ",[data,hash], function(err, rows)
							{
								if (err){
									var error_msg = ''
									error_msg = "Sorry something went wrong. Please try again!";
									req.flash('error', error_msg)        
									
									res.render('verifyemail', { 
										mail_otp: req.body.mail_otp,
										mobile_otp: req.body.mobile_otp,
										id: id
									})
								}
								else{
									 success_msg = "Your account has been verified! Now you can login with your details. <br> <a href='/'>Click here</a> to login";
									 req.flash('success', success_msg)
									 res.render('verifyemail', { 
										mail_otp: req.body.mail_otp,
										mobile_otp: req.body.mobile_otp,
										id: id
									})
								}
							});
							 //console.log("Your email has been verified");
						} else{
						 var error_msg = ''
						 error_msg = "Wrong OTP";
						req.flash('error', error_msg)        
						
						res.render('verifyemail', { 
							mail_otp: req.body.mail_otp,
							mobile_otp: req.body.mobile_otp,
							id : id
						})
						}
					 } else{
						 var error_msg = ''
						 error_msg = "Wrong OTP";
						 req.flash('error', error_msg)        
						
						res.render('verifyemail', { 
							mail_otp: req.body.mail_otp,
							mobile_otp: req.body.mobile_otp,
							id : id
						})
					 }
				 }
					//res.render('edit_user',{page_title:"Edit Users - Node.js",data:rows});
						
				   
			});
		}
		else {   //Display errors to user
			var error_msg = ''
			errors.forEach(function(error) {
				error_msg += error.msg + '<br>'
			})                
			req.flash('error', error_msg)        
			
			res.render('verifyemail', { 
				mail_otp: req.body.mail_otp,
				mobile_otp: req.body.mobile_otp,
				id: id
			})
		}		
	}); 
}
	


