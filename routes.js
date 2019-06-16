/*
	All routes
*/

var sys         = require('./settings.js');
var auth        = require('./auth.js');
var maintenance = require('./maintenance.js');
var getters     = require('./getters.js');
var upload      = require('./upload.js');
var exec 		= require('child_process').exec;
var fs          = require('fs');
var xml2js      = require('xml2js');
var parser      = new xml2js.Parser();

module.exports = {

	init: function(app) {

		//render the homepage
		app.get('/', function(req, res){
			res.render('home.html');
		});

		//render the admin page
		app.get('/admin', auth.isAdminGET, function(req, res){

			//get the default render object for the page
			var render = defRender(req);

			//get any error messages that may have been flashed in.
			render.adminError = req.flash('adminError');
			render.colorError = req.flash('colorError');
			render.materialError = req.flash('materialError');

			//get the colors
			getters.getColors(function(err, colors){
				if(!err){
					//get the materials
					getters.getMaterials(function(err, materials){
						if(!err){

							//if there are colors add them to the render object
							if(colors.length > 0){
								render.colorsExist = true;
								render.colors = colors;
							}

							//if there are materials add them to the render object
							if(materials.length > 0){
								render.materialsExist = true;
								render.materials = materials;
							}

							res.render('admin.html', render);
						}
						else{
							error(res, err);
						}
					});
				}
				else{
					error(res, err);
				}
			});
		});

		//handles a post request to add a new color
		app.post('/newColor', auth.isAdminPOST, upload.uploadColorIcon, function(req, res){
			//check for errors
			if(req.adminError){
				req.flash('adminError', req.adminError);
				res.redirect('/admin');
			}
			else if(req.colorError){
				req.flash('colorError', req.colorError);
				res.redirect('/admin');
			}

			//check if the post request has the valid fields filled out
			else if(req.body.colorName != null){
				//create a strict name
				var name = req.body.colorName.toLowerCase().replace(' ', '_');

				//add a color to the db
				maintenance.addColor(name, req.body.colorName, req.friendly_icon_path, function(err){
					if(!err){
						res.redirect('/admin');
					}
					else{
						error(res, err);
					}
				});
			}
			else{
				req.flash('colorError', 'Please fill out all the required fields.');
			}
		});

		//handles a post request to remove a color
		app.post('/removeColor', auth.isAdminPOST, function(req, res){

			if(req.body.cid != null){
				//remove the files from the file path
				exec('rm -rf ' + sys.color_icon_path + '/' + req.body.cid, function(err, stdout, stderr){
					if(!err){
						//remove a color from the db
						maintenance.removeColor(req.body.cid, function(err){
							if(!err){
								res.redirect('/admin');
							}
							else{
								error(res, err);
							}
						});
					}
					else{
						error(res, err);
					}
				});
			}	
			else{
				error(res, "Please select a color to delete.");
			}
		});

		//handles a post request for a new material
		app.post('/newMaterial', auth.isAdminPOST, upload.uploadMaterialIcon, function(req, res){

			//check for errors
			if(req.adminError){
				req.flash('adminError', req.adminError);
				res.redirect('/admin');
			}
			else if(req.materialError){
				req.flash('materialError', req.materialError);
				res.redirect('/admin');
			}

			//check if the post request has the valid fields filled out
			else if(req.body.materialName != null){
				//create a strict name
				var name = req.body.materialName.toLowerCase().replace(' ', '_');

				//add a material to the db
				maintenance.addMaterial(name, req.body.materialName, req.friendly_icon_path, function(err){
					if(!err){
						res.redirect('/admin');
					}
					else{
						error(res, err);
					}
				});
			}
			else{
				req.flash('materialError', "All required fields must be filled out.");
				res.redirect('/admin');
			}
		});

		//handles a post request to remove a material
		app.post('/removeMaterial', auth.isAdminPOST, function(req, res){

			if(req.body.mid != null){
				//remove the files from the file path
				exec('rm -rf ' + sys.material_icon_path + '/' + req.body.mid, function(err, stdout, stderr){
					if(!err){
						//remove a material from the db
						maintenance.removeMaterial(req.body.mid, function(err){
							if(!err){
								res.redirect('/admin');
							}
							else{
								error(res, err);
							}
						});
					}
					else{
						error(res, err);
					}
				});
			}
			else{
				error(res, "Please select a material to delete.");
			}
		});

		//handles the upload of a new shoe svg (post request done with jquery)
		app.post('/newShoe', auth.isAdminPOST, upload.uploadShoeSvg, function(req, res){
			 //check for errors
			 if(req.adminError){
			 	res.send({adminError: req.adminError});
			 }
			 else if(req.shoeError){
			 	res.send({shoeError: req.shoeError});
			 }

			 //create a new shoe and parse it
			 else if(req.body.shoeName != null){
			 	//create the strict name
			 	var name = req.body.shoeName.toLowerCase().replace(' ', '_');

			 	//add the shoe to the db
			 	maintenance.addShoe(name, req.body.shoeName, req.friendly_shoe_path, function(err){
			 		if(!err){
			 			//get all of the colors
			 			getters.getColors(function(err, colors){
			 				if(!err){
			 					//get all of the materials
			 					getters.getMaterials(function(err, materials){
			 						if(!err){
			 							//read the svg file
							 			fs.readFile('./assets' + req.friendly_shoe_path, function(err, file){
							 				parser.parseString(file, function(err, shoe_info){
							 					data = {
							 						colorsExist: colors.length > 0,
							 						colors: colors,
							 						materialsExist: materials.length > 0,
							 						materials: materials,
							 						friendly_shoe_path: req.friendly_shoe_path,
							 						shoe_info: shoe_info
							 					};
							 					res.send(data);
							 				});
							 			});
			 						}
			 						else{
			 							error(res, err);
			 						}
			 					});
			 				}
			 				else{
			 					error(res, err);
			 				}
			 			});
			 		}
			 		else{
			 			error(res, err);
			 		}
			 	});
			 }
			 else{
			 	res.send({shoeError: "Please fill out all required fields."});
			 }
		});
	}
}

//the default render for an authenticated admin
function defRender(req) {
	// if user is authenticated & has session
	if (req.isAuthenticated() && req.user && req.user.local) {
			// basic render object for fully authenticated user
			return {
				auth: {
					isAuthenticated: true,
					userUID: req.user.local.uid,
					givenName: req.user.name.givenName
				}
			};
	} else {
		// default welcome message for unauthenticated user
		return {};
	}
}

// render an error message to user
function error(res, message) {
	res.render('error.html', { message: message });
}