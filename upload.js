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
										req.flash('adminError', 'Something went wrong. Try to create color again.');
										res.redirect('/admin');
										res.end();
									}

									req.files = [];
									var files = 0, finished = false;

									// field processing - add to req.body
									req.busboy.on('field', function(fieldname, val) {
										req.body[fieldname] = val;
									});

									// file processing - route streams properly and add to req.files
									req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

										//if the file is too large
										file.on('limit', function () {
											req.flash('colorError', 'You may only upload files of maximum size ' + sys.icon_limits.fileSize / 1024 / 1024 / 8 + 'MB. Please upload a smaller file.');
											res.redirect('/admin');
											res.end();
										});

										files++;

										//write the file to the path
										fstream = fs.createWriteStream(req.icon_path + '/' + filename);
										file.pipe(fstream);

										fstream.on('close', function () {
											req.files.push(filename);
											files--;
											if (!files && finished)
												return next();
										});
									});

									// too many files?
									req.busboy.on('filesLimit', function() {
										req.flash('colorError') = 'You may only upload a maximum of ' + sys.icon_limits.files + ' files.';
										res.redirect('/admin');
										res.end();
									});

									// continue only when all form data received
									req.busboy.on('finish', function(){
										finished = true;
										if(!files){
											return next();
										}
										else{
											req.flash('adminError', 'Something went wrong. Try to create color again.');
											res.redirect('/admin');
											res.end();
										}
									});

									req.pipe(req.busboy);
								});
		 					}
		 					else{
		 						console.log("mkdirp error " + err);
		 						req.flash('adminError', 'Something went wrong. Try to create color again.');
								res.redirect('/admin');
								res.end();
		 					}
		 				});
	 				}
	 				else{
	 					console.log("exec error " + err);
	 					req.flash('adminError', 'Something went wrong. Try to create color again.');
						res.redirect('/admin');
						res.end();
	 				}
	 			});

	 		}
	 		else{
	 			console.log("mysql error " + err);
	 			req.flash('adminError', 'Something went wrong. Try to create color again.');
				res.redirect('/admin');
				res.end();
	 		}
	 	});
	},

	uploadMaterialIcon: function(req, res, next){

	}
}