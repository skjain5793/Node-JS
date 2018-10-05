
exports.login_page = function(req, res){
  res.render('admin/index', { email: '', user_password: '' });
};

/* exports.check = function(req, res){
	console.log("in func");
}; */

exports.dashboard_page = function(req, res){
	//console.log("in dashboard page function");
	res.render('admin/dashboard');
};

exports.user_files = function(req, res){
	//console.log("superman users edit");
    
    var id = req.params.id;
    
    req.getConnection(function(err,connection){
       
        var query = connection.query('SELECT * FROM user_documents WHERE user_id = ? order by submitted_on desc ',[id],function(err,rows)
        {
            
            if(err){
                console.log("Error Selecting : %s ",err );
			}else{
				res.render('admin/users_files',{data:rows, user_id:id});
			}
                   
         });
         
         //console.log(query.sql);
    }); 
	//res.render('admin/users_files');
}

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

function send_document_status_mail(id,user_id,status,req, res){
	
	if(status!=''){
	
		gmaillogincredientials();
		
		req.getConnection(function(err,connection){
	
			var query = connection.query("SELECT email FROM users WHERE id = ? ", [user_id], function(err, rows)
			{
				if(err){
					res.end(err);
				}
				else{
					to = rows[0].email
					mailOptions={
						to : to,
						subject : "Document Status",
						//html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
						html : "Your document has been "+status
				}
				
				smtpTransport.sendMail(mailOptions, function(error, response){
					 if(error){
							res.end(error);
							//res.end("error"+error);
					 }else{
						 //console.log(" mail sent ");
						 res.redirect('/superman/users/files/'+userid);
						}
					});
				 }
			});
		});
	}
}

exports.user_document_status = function(req, res){
	
	var userid = req.params.userid;
	var id = req.params.documentid;
    
    req.getConnection(function(err,connection){
       
        var data = {				
			approved    : req.body.document_status,	
		};
        
        connection.query("UPDATE user_documents set ? WHERE id = ? ",[data,id], function(err, rows)
        {
            
            if(err){
                console.log("Error Selecting : %s ",err );
			}else{
				if(req.body.document_status==1){
					status = "approved";
				} else if(req.body.document_status==-1){
					status = "rejected";
				} else{
					status='';
				}
				send_document_status_mail(id,userid,status,req,res);
				//res.redirect('/superman/users/files/'+userid);
				//res.render('admin/users_files',{data:rows});
			}
                   
         });
         
         //console.log(query.sql);
    });
}

exports.user_groups_edit = function(req, res){
	
	var id = req.params.id;
	
	req.getConnection(function (err, connection) {
	
		var query = connection.query('SELECT * FROM user_groups WHERE id = ?',[id],function(err,group_rows)
        {
			if(err){
                res.end("Error Selecting : %s ",err );
			}
			else {
				var query = connection.query('SELECT permissions from user_groups where id = 1 ',function(err,rows)
				{
					
					var user_permissions = get_user_groups_permissions(rows);
						res.render('admin/edit_user_group',{
							permissions_details:user_permissions[0],
							group: group_rows,
							permissions_names:user_permissions[1]
						});
				});
			}
		});
	});
}

exports.delete_user_groups = function(req, res){
	var id = req.params.id;
    
     req.getConnection(function (err, connection) {
        
        connection.query("DELETE FROM user_groups  WHERE id = ? ",[id], function(err, rows)
        {
            
             if(err)
                res.end("Error deleting : %s ",err );
            
             res.redirect('/superman/users/groups')
             
        });
        
     });
}

exports.add_user = function(req, res){
	req.getConnection(function(err,connection){
       
        var query = connection.query('SELECT * from user_groups',function(err,rows)
        {
			res.render('admin/add_user',{groups:rows,name: '',
				phone: '',
				user_password: '',
				email: '',
				user_type: ''});
		});
	});
};

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

exports.users_groups_add = function(req, res){
	req.getConnection(function(err,connection){
       
        var query = connection.query('SELECT permissions from user_groups where id = 1 ',function(err,rows)
        {
			
			var user_permissions = get_user_groups_permissions(rows);
			
			console.log(typeof(user_permissions));
			console.log(user_permissions[0]);
			res.render('admin/add_user_group',{permissions:user_permissions[0],
				group_name: '',
				permissions_names:user_permissions[1]});
		});
	});
}

exports.users_groups_save = function(req, res){
		req.getConnection(function(err,connection){
       
        console.log(req.body.group_name);
		console.log(typeof(JSON.stringify(req.body.permission)));
		
		req.assert('group_name', 'Enter group name').notEmpty() //Validate group name
		
		var errors = req.validationErrors();
		if(!errors){
			var data = {				
				name    : req.body.group_name,
				permissions   : JSON.stringify(req.body.permission),
				created_on : new Date()
			};
			
			var query = connection.query("INSERT INTO user_groups set ? ",data, function(err, rows)
			{
	  
			  if (err){
				  res.end(err);
					/* var query = connection.query('SELECT name from user_groups',function(err,rows)
					{
						res.render('admin/add_user_group',{groups:rows,
							name: req.body.name,
							phone: req.body.phone,
							user_password: req.body.user_password,
							email: req.body.email
						});
					});	 */
			  }else{
				  res.redirect('/superman/users/groups')
			  }			  
			});
		}else {   //Display errors to user
			var error_msg = ''
			errors.forEach(function(error) {
				error_msg += error.msg + '<br>'
			})                
			req.flash('error', error_msg)        
			
			/**
			 * Using req.body.name 
			 * because req.param('name') is deprecated
			 */ 
			var query = connection.query('SELECT permissions from user_groups where id = 1 ',function(err,rows)
			{
			
				var user_permissions = get_user_groups_permissions(rows);
				res.render('admin/add_user_group',{permissions:user_permissions[0],
					group_name: req.body.group_name,
					permissions_names:user_permissions[1]
				});
			});	
		}
	});
}

exports.save_user_groups_edit = function(req,res){
    
    var input = JSON.parse(JSON.stringify(req.body));
    var id = req.params.id;
    
    req.getConnection(function (err, connection) {
        
        var data = {				
			name    : req.body.group_name,
			permissions   : JSON.stringify(req.body.permission)		
		};
        
        connection.query("UPDATE user_groups set ? WHERE id = ? ",[data,id], function(err, rows)
        {
  
          if (err)
              res.end("Error Updating : %s ",err );
         
          //res.render('admin/users');
		  res.redirect('/superman/users/groups')
		 // module.exports.users_list(req,res);
          
        });
    
    });
};

exports.save_user = function(req,res){
    
    var input = JSON.parse(JSON.stringify(req.body));
    
    req.getConnection(function (err, connection) {
		
		console.log(req.body.user_type);
		
		req.assert('name', 'Name is required').notEmpty()           //Validate name
		req.assert('phone', 'Mobile no. is required').notEmpty()             //Validate password
		req.assert('phone', 'Inavlid Mobile no.').isMobilePhone('en-IN')     //Validate mobile number
		req.assert('user_password', 'Password is required').notEmpty()             //Validate mobile number
		req.assert('email', 'A valid email is required').isEmail()  //Validate email
		req.assert('user_type', 'Enter User Role').notEmpty()              //Validate user role
		
		var errors = req.validationErrors();
		
		if( !errors ) {
		
			email   = input.email;
			
			
			//console.warn(email);
			var query = connection.query('SELECT * FROM users WHERE email = ?',[email],function(err,rows){
				numRows = rows.length;
				//console.warn(numRows);
				if(numRows>0){
					var error_msg = 'Email id already exists';
					req.flash('error', error_msg)
					var query = connection.query('SELECT * from user_groups',function(err,rows)
					{
						res.render('admin/add_user',{groups:rows,
							name: req.body.name,
							phone: req.body.phone,
							user_password: req.body.user_password,
							email: req.body.email,
							group_id:2 
						});
					});					
				}else{
					var data = {
				
						name    : input.name,
						//address : input.address,
						email   : input.email,
						phone   : input.phone,
						//username : input.username,
						user_password : input.user_password,
						group_id : input.user_type,
						active : 1,
						verified: 1,
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
							var query = connection.query('SELECT * from user_groups',function(err,rows)
							{
								res.render('admin/add_user',{groups:rows,
									name: req.body.name,
									phone: req.body.phone,
									user_password: req.body.user_password,
									email: req.body.email,
									active: 1
								});
							});	
					  }else{
						  //email = encodeURIComponent(email);
						  //res.redirect('/verifyemail/'+email);
						  //module.exports.verificationmail(email,req,res);
						  res.redirect('/superman/users')
					  }			  
					});
				}
			});

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
			var query = connection.query('SELECT * from user_groups',function(err,rows)
			{
				res.render('admin/add_user',{groups:rows,
					name: req.body.name,
					phone: req.body.phone,
					user_password: req.body.user_password,
					email: req.body.email
				});
			});	
		}
			
		   // console.log(query.sql); get raw query
    
    });
};

/* exports.users_page = function(req, res){
	res.render('admin/users');
}; */

exports.users_list = function(req, res){

  req.getConnection(function(err,connection){
	  
		var id = req.session.user_id;
       
        var query = connection.query('SELECT user_groups.name AS user_type , users.* FROM users left join user_groups on users.group_id = user_groups.id where users.id!=? order by users.created_on desc ',[id],function(err,rows)
        {
            
            if(err)
                res.end("Error Selecting : %s ",err );
     
            res.render('admin/users',{data:rows});
                
           
         });
         
         //console.log(query.sql);
    });
  
};

exports.users_groups_list = function(req, res){

  req.getConnection(function(err,connection){
       
        var query = connection.query('SELECT * from user_groups order by created_on desc ',function(err,rows)
        {
            
            if(err)
                console.log("Error Selecting : %s ",err );
     
            res.render('admin/users_groups',{data:rows});
                
           
         });
         
         //console.log(query.sql);
    });
  
};

exports.user_edit = function(req, res){
	
	//console.log("superman users edit");
    
    var id = req.params.id;
    
    req.getConnection(function(err,connection){
       
        var query = connection.query('SELECT * FROM users WHERE id = ?',[id],function(err,rows)
        {
            
            if(err)
                console.log("Error Selecting : %s ",err );
			
			var query2 = connection.query('SELECT * FROM user_groups',function(err,rows2)
			{
				res.render('admin/edit_user',{data:rows, groups:rows2});
			});
                   
         });
         
         //console.log(query.sql);
    }); 
};

exports.save_user_edit = function(req,res){
    
    var input = JSON.parse(JSON.stringify(req.body));
    var id = req.params.id;
    
    req.getConnection(function (err, connection) {
        
        var data = {
            
            name    : input.name,
            email   : input.email,
            phone   : input.phone,
			group_id : req.body.user_type,
			verified : req.body.user_status,
			active: req.body.user_active,       
        };
        
        connection.query("UPDATE users set ? WHERE id = ? ",[data,id], function(err, rows)
        {
  
          if (err)
              res.end("Error Updating : %s ",err );
         
          //res.render('admin/users');
		  res.redirect('/superman/users')
		 // module.exports.users_list(req,res);
          
        });
    
    });
};

exports.delete_user = function(req,res){
          
     var id = req.params.id;
    
     req.getConnection(function (err, connection) {
        
        connection.query("DELETE FROM users  WHERE id = ? ",[id], function(err, rows)
        {
            
             if(err)
                res.end("Error deleting : %s ",err );
            
             res.redirect('/superman/users')
             
        });
        
     });
};

exports.authenticate = function(req, res){
		var input = JSON.parse(JSON.stringify(req.body));
    
        req.getConnection(function (err, connection) {
        
        email = input.email;
		user_password = input.user_password;

		req.assert('email', 'Please enter your email id').isEmail()  //Validate email
		req.assert('user_password', 'Enter your password').notEmpty() //Validate password
		
		//console.log("admin function");
		
		var errors = req.validationErrors();
        if(!errors){
			//req.getConnection(function (err, connection) {
				var query = connection.query("SELECT * FROM users WHERE email = ? and active = 1", [email], function(err, rows)
				{
		  
				  if (err){
					  //console.log("Error inserting : %s ",err );
						var error_msg = 'Error inserting!'              
							req.flash('error', error_msg)        
							
							res.render('admin/index', { 
								email: req.body.email,
								user_password: req.body.user_password,
							})
					   //res.render('admin/index',{page_title:"Error inserting"});
				  }else{
					  if (rows.length > 0) {
						  if (rows[0].user_password == user_password) {
							 
							 var query = connection.query('SELECT permissions from user_groups INNER JOIN users on users.group_id = user_groups.id where users.id = ? ', [rows[0].id], function(err,group_rows)
							{
							 
							var user_permissions = get_user_groups_permissions(group_rows);
							//req.session.accesses = user_permissions[1];
							  
							 if((rows[0].group_id==1) || (Object.values(user_permissions[1]).indexOf('access_backend') > -1)){
							  req.session.user_role = "super_admin";
							  req.session.user_id = rows[0].id;
							 /*  var success_msg = 'login was successful'              
								req.flash('success', success_msg)    */ 

								/* var query = connection.query('SELECT permissions from user_groups INNER JOIN users on users.group_id = user_groups.id where users.id = ? ', [req.session.user_id], function(err,rows)
									{ */
											
											//var user_permissions = get_user_groups_permissions(rows);
											req.session.accesses = user_permissions[1];
											res.locals.accesses = user_permissions[1];
											res.redirect('/superman/dashboard')							
											/* res.render('admin/dashboard',{check_permissions:user_permissions[1]}) */
									//});
							 } else{
								  //console.log("Email and Password does not match" );
								  //res.render('index',{page_title:"Username and Password does not match"});
								  var error_msg = 'Invalid Login details!'              
									req.flash('error', error_msg)        
									
									res.render('admin/index', { 
										email: req.body.email,
										user_password: req.body.user_password,
									})
							}
							});						
							  
						  } else{
							  //console.log("Email and Password does not match" );
							  //res.render('index',{page_title:"Username and Password does not match"});
							  var error_msg = 'Invalid Password!'              
								req.flash('error', error_msg)        
								
								res.render('admin/index', { 
									email: req.body.email,
									user_password: req.body.user_password,
								})
						  }
						} else{
							//console.log("Username does not exists!" );
							 //res.render('index',{page_title:"User does not exists!"});
							 var error_msg = 'User does not exists!'              
							req.flash('error', error_msg)        
							
							res.render('admin/index', { 
								email: req.body.email,
								user_password: req.body.user_password,
							})
						}
				  }
				  
				//});
			});
		} else {   //Display errors to user
			var error_msg = ''
			errors.forEach(function(error) {
				error_msg += error.msg + '<br>'
			})                
			req.flash('error', error_msg)        
			
			res.render('admin/index', { 
				email: req.body.email,
				user_password: req.body.user_password,
			})
		}
        
    });
};
