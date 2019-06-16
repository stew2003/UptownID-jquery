/* Handin upload */
var busboy		= require('connect-busboy');		/* process multipart forms */
var fs 			= require('fs');					/* streaming handins to dir */
var mkdirp		= require('mkdirp');				/* creating handin dir */
var exec 		= require('child_process').exec;	/* removing old handins */

var sys = require('./settings.js');
var con = require('./database.js').connection;

// middleware: prepares filesystem and dumps files encoded in form
module.exports = {

	 //for uploading an new icon to go along with a new color
	 uploadColorIcon: function(req, res, next){
	 	//find the next auto incremented cid
	 	con.query('SELECT auto_increment AS next_cid FROM INFORMATION_SCHEMA.TABLES WHERE table_name = "colors";', function(err, next_cid){
	 		if(!err && next_cid[0].next_cid !== undefined){
	 			//create the proper path for the icon.
	 			req.icon_path = sys.color_icon_path + '/' + next_cid[0].next_cid;

	 			//create the path that would be used to find the icon in html
	 			req.friendly_icon_path = req.icon_path.replace('./assets', '');

	 			//remove anything that might be in that icon path
	 			exec('rm -rf ' + req.icon_path + '/*', function (err, stdout, stderr) {
	 				if(!err){
	 					//create the directory
		 				mkdirp(req.icon_path, {mode: 0770}, function(err, made) {
		 					if(!err){
		 						var bb = busboy({limits: sys.icon_limits});
		 						bb(req, res, function() {
		 							//if busboy is malfunctioning
									if (!req.busboy) {
										req.adminError = sys.dev ? 'Busboy is not in the req object' : 'Something went wrong. Try to create color again.';
										return next();
									}

									req.files = [];
									var files = 0, finished = false;

									// field processing - add to req.body
									req.busboy.on('field', function(fieldname, val) {
										req.body[fieldname] = val;
									});

									// file processing - route streams properly and add to req.files
									req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
										//if the file is not null
										if(filename){
											//if the file is too large
											file.on('limit', function () {
												req.colorError = 'You may only upload files of maximum size ' + sys.icon_limits.fileSize / 1024 / 1024 / 8 + 'MB. Please upload a smaller file.';
												return next();
											});

											files++;

											//write the file to the path
											fstream = fs.createWriteStream(req.icon_path + '/' + filename);
											file.pipe(fstream);

											//update the friendly path to include the file name
											req.friendly_icon_path = req.friendly_icon_path + '/' + filename;

											fstream.on('close', function () {
												req.files.push(filename);
												files--;
												if (!files && finished){
													return next();
												}
											});
										}
										else{
											req.colorError = 'Please choose a file to upload';
											return next();
										}

									});

									// too many files?
									req.busboy.on('filesLimit', function() {
										req.colorError = 'You may only upload a maximum of ' + sys.icon_limits.files + ' files.';
										return next();
									});

									// continue only when all form data received
									req.busboy.on('finish', function(){
										finished = true;
										if(!files){
											return next();
										}
									});

									req.pipe(req.busboy);
								});
		 					}
		 					else{
		 						req.adminError = sys.dev ? 'Mkdirp error: ' + err : 'Something went wrong. Try to create color again.';
								return next();
		 					}
		 				});
	 				}
	 				else{
	 					req.adminError = sys.dev ? 'Exec error: ' + err : 'Something went wrong. Try to create color again.';
						return next()
	 				}
	 			});

	 		}
	 		else{
	 			req.adminError = sys.dev ? 'Mysql error: ' + err : 'Something went wrong. Try to create color again.';
				return next();
	 		}
	 	});
	},

	uploadMaterialIcon: function(req, res, next){
		//find the next auto increment mid for the materials
		con.query('SELECT auto_increment AS next_mid FROM INFORMATION_SCHEMA.TABLES WHERE table_name = "materials";', function(err, next_mid){
	 		if(!err && next_mid[0].next_mid !== undefined){
	 			//create the proper path for the icon.
	 			req.icon_path = sys.material_icon_path + '/' + next_mid[0].next_mid;

	 			//create the path that would be used to find the icon in html
	 			req.friendly_icon_path = req.icon_path.replace('./assets', '');

	 			//remove anything that might be in that icon path
	 			exec('rm -rf ' + req.icon_path + '/*', function (err, stdout, stderr) {
	 				if(!err){
	 					//create the directory
		 				mkdirp(req.icon_path, {mode: 0770}, function(err, made) {
		 					if(!err){
		 						var bb = busboy({limits: sys.icon_limits});
		 						bb(req, res, function() {
		 							//if busboy is malfunctioning
									if (!req.busboy) {
										req.adminError = sys.dev ? 'Busboy is not in the req object' : 'Something went wrong. Try to create color again.';
										return next();
									}

									req.files = [];
									var files = 0, finished = false;

									// field processing - add to req.body
									req.busboy.on('field', function(fieldname, val) {
										req.body[fieldname] = val;
									});

									// file processing - route streams properly and add to req.files
									req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
										//if the file has a name (if a file is actually uploaded)
										if(filename){
											//if the file is too large
											file.on('limit', function () {
												req.materialError = 'You may only upload files of maximum size ' + sys.icon_limits.fileSize / 1024 / 1024 / 8 + 'MB. Please upload a smaller file.';
												return next();
											});

											files++;

											//write the file to the path
											fstream = fs.createWriteStream(req.icon_path + '/' + filename);
											file.pipe(fstream);

											//update the friendly path to include the file name
											req.friendly_icon_path = req.friendly_icon_path + '/' + filename;

											fstream.on('close', function () {
												req.files.push(filename);
												files--;
												if (!files && finished){
													return next();
												}
											});
										}
										else{
											req.materialError = 'Please choose a file to upload';
											return next();
										}
									});

									// too many files?
									req.busboy.on('filesLimit', function() {
										req.materialError = 'You may only upload a maximum of ' + sys.icon_limits.files + ' files.';
										return next();
									});

									// continue only when all form data received
									req.busboy.on('finish', function(){
										finished = true;
										if(!files){
											return next();
										}
									});

									req.pipe(req.busboy);
								});
		 					}
		 					else{
		 						req.adminError = sys.dev ? 'Mkdirp error: ' + err : 'Something went wrong. Try to create color again.';
								return next();
		 					}
		 				});
	 				}
	 				else{
	 					req.adminError = sys.dev ? 'Exec error: ' + err : 'Something went wrong. Try to create color again.';
						return next()
	 				}
	 			});

	 		}
	 		else{
	 			req.adminError = sys.dev ? 'Mysql error: ' + err : 'Something went wrong. Try to create color again.';
				return next();
	 		}
	 	});
	},

	uploadShoeSvg: function(req, res, next){
		//find the next auto increment mid for the materials
		con.query('SELECT auto_increment AS next_sid FROM INFORMATION_SCHEMA.TABLES WHERE table_name = "shoes";', function(err, next_sid){
	 		if(!err && next_sid[0].next_sid !== undefined){
	 			//create the proper path for the icon.
	 			req.shoe_path = sys.shoe_path + '/' + next_sid[0].next_sid;

	 			//create the path that would be used to find the icon in html
	 			req.friendly_shoe_path = req.shoe_path.replace('./assets', '');

	 			//remove anything that might be in that icon path
	 			exec('rm -rf ' + req.shoe_path + '/*', function (err, stdout, stderr) {
	 				if(!err){
	 					//create the directory
		 				mkdirp(req.shoe_path, {mode: 0770}, function(err, made) {
		 					if(!err){
		 						var bb = busboy({limits: sys.shoe_limits});
		 						bb(req, res, function() {
		 							//if busboy is malfunctioning
									if (!req.busboy) {
										req.adminError = sys.dev ? 'Busboy is not in the req object' : 'Something went wrong. Try to create color again.';
										return next();
									}

									req.files = [];
									var files = 0, finished = false;

									// field processing - add to req.body
									req.busboy.on('field', function(fieldname, val) {
										req.body[fieldname] = val;

										//if the file is null (this is different than the other two because of the way ajax sends files)
										if(fieldname == "shoeSvgFile" && val == ""){
											req.shoeError = 'Please choose a file to upload';
											return next();
										}
									});

									// file processing - route streams properly and add to req.files
									req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
										//if the file has a name (if a file is actually uploaded)
										if(filename){
											//if the file is too large
											file.on('limit', function () {
												req.materialError = 'You may only upload files of maximum size ' + sys.shoe_limits.fileSize / 1024 / 1024 / 8 + 'MB. Please upload a smaller file.';
												return next();
											});

											files++;

											//write the file to the path
											fstream = fs.createWriteStream(req.shoe_path + '/' + filename);
											file.pipe(fstream);

											//add the filename to the friendly path
											req.friendly_shoe_path = req.friendly_shoe_path + '/' + filename;

											fstream.on('close', function () {
												req.files.push(filename);
												files--;
												if (!files && finished){
													return next();
												}
											});
										}
										else{
											req.shoeError = 'Please choose a file to upload';
											return next();
										}
									});

									// too many files?
									req.busboy.on('filesLimit', function() {
										req.shoeError = 'You may only upload a maximum of ' + sys.shoe_limits.files + ' files.';
										return next();
									});

									// continue only when all form data received
									req.busboy.on('finish', function(){
										finished = true;
										if(!files){
											return next();
										}
									});

									req.pipe(req.busboy);
								});
		 					}
		 					else{
		 						req.adminError = sys.dev ? 'Mkdirp error: ' + err : 'Something went wrong. Try to create color again.';
								return next();
		 					}
		 				});
	 				}
	 				else{
	 					req.adminError = sys.dev ? 'Exec error: ' + err : 'Something went wrong. Try to create color again.';
						return next()
	 				}
	 			});

	 		}
	 		else{
	 			req.adminError = sys.dev ? 'Mysql error: ' + err : 'Something went wrong. Try to create color again.';
				return next();
	 		}
	 	});
	}
}