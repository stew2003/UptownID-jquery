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
			req.newColor = true;
			//if there is an error
			if(req.adminError || req.colorError){
				renderColorForm(req, res);
			}
			//check if the post request has the valid fields filled out
			else if(req.body.colorName != null){
				//create a strict name
				var name = req.body.colorName.toLowerCase().replace(' ', '_');

				//add a color to the db
				maintenance.addColor(name, req.body.colorName, req.friendly_icon_path, function(err){
					if(err){
						req.colorError = sys.dev ? err : "There was a problem adding the color to the database.";
					}	
					//render the color form
					renderColorForm(req, res);
				});
			}
			else{
				req.colorError ='Please fill out all the required fields.';
				renderColorForm(req, res);
			}	
		});

		//handles a post request to remove a color
		app.post('/removeColor', auth.isAdminPOST, function(req, res){
			req.removeColor = true;
			//if a color is chosen
			if(req.body.cid != null){
				//remove the files from the file path
				exec('rm -rf ' + sys.color_icon_path + '/' + req.body.cid, function(err, stdout, stderr){
					if(!err){
						//remove a color from the db
						maintenance.removeColor(req.body.cid, function(err){
							if(err){
								req.colorError = sys.dev ? err : "There was a problem deleting the color from the database.";
							}
							//render the color form
							renderColorForm(req, res);
						});
					}
					else{
						req.colorError = sys.dev ? err : "There was an error deleting the icon.";
						renderColorForm(req, res);
					}
				});
			}	
			else{
				req.colorError = "Please choose a color to delete.";
				renderColorForm(req, res);
			}
		});

		//handles a post request for a new material
		app.post('/newMaterial', auth.isAdminPOST, upload.uploadMaterialIcon, function(req, res){
			req.newMaterial = true;
			//check for errors
			if(req.adminError || req.materialError){
				renderMaterialForm(req, res);
			}
			//check if the post request has the valid fields filled out
			else if(req.body.materialName != null){
				//create a strict name
				var name = req.body.materialName.toLowerCase().replace(' ', '_');

				//add a material to the db
				maintenance.addMaterial(name, req.body.materialName, req.friendly_icon_path, function(err){
					if(err){
						req.materialError = sys.dev ? err : "There was a problem adding the material to the database.";
					}
					//render the material form
					renderMaterialForm(req, res);
				});
			}
			else{
				req.materialError = "All required fields must be filled out.";
				renderMaterialForm(req, res);
			}
		});

		//handles a post request to remove a material
		app.post('/removeMaterial', auth.isAdminPOST, function(req, res){
			req.removeMaterial = true;
			//if a material is chosen
			if(req.body.mid != null){
				//remove the files from the file path
				exec('rm -rf ' + sys.material_icon_path + '/' + req.body.mid, function(err, stdout, stderr){
					if(!err){
						//remove a material from the db
						maintenance.removeMaterial(req.body.mid, function(err){
							if(err){
								req.materialError = sys.dev ? err : "There was a problem deleting the material from the database.";
							}
							//render the material form
							renderMaterialForm(req, res);
						});
					}
					else{
						req.materialError = sys.dev ? err : "There was an error deleting the icon.";
						renderMaterialForm(req, res);
					}
				});
			}
			else{
				req.colorError = "Please select a material to delete.";
				renderMaterialForm(req, res);
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
			 	maintenance.addShoe(name, req.body.shoeName, req.friendly_shoe_path, function(err, shoe){
			 		if(!err){
			 			//get all of the colors
						getters.getColors(function(err, colors){
							if(!err){
								//get all of the materials
								getters.getMaterials(function(err, materials){
									if(!err){
										//read the svg file
							 			fs.readFile('./assets' + shoe.svg_path, function(err, file){
							 				parser.parseString(file, function(err, shoe_info){
							 					//create the default render object
							 					var render = {
							 						colorsExist: colors.length > 0,
							 						colors: colors,
							 						materialsExist: materials.length > 0,
							 						materials: materials,
							 						friendly_shoe_path: req.friendly_shoe_path,
							 						shoe: shoe,
							 						shoe_paths: shoe_info.svg.g[0].path
							 					};
							 					res.send(render);
							 				});
							 			});
									}
									else{
										res.send({colorsExist: colors.length > 0, colors: colors, materialsExist: false, partError: "There was an error getting the default materials."});
									}
								});
							}
							else{
								res.send({colorsExist: false, materialsExist: false, partError: "There was an error getting the default colors."});
							}
						});
			 		}
			 		else{
			 			res.send({shoeError: sys.dev ? err : "There was an error adding the shoe to the database. Please try again."});
			 		}
			 	});
			 }
			 else{
			 	res.send({shoeError: "Please fill out all required fields."});
			 }
		});

		app.post('/newPart', auth.isAdminPOST, function(req, res){
			//if the part has a name
			console.log(req.body);
			if(req.body.partName != null && req.body.shoe_id != null && req.body.part_id != null && req.body.cid != null && req.body.mid != null){
				//add the part to the db
				maintenance.addPart(req.body.shoe_id, req.body.part_id, req.body.partName, req.body.cid, req.body.mid, null, null, null, null, function(err){
					if(!err){
						getters.getColor(req.body.cid, function(err){
							if(!err){
								getters.getMaterial(req.body.mid, function(err){
									if(!err){

									}
									else{
										res.send({partError: err});
									}
								});
							}
							else{	
								res.send({partError: err});
							}
						});
						var render = {
							part_id: req.body.part_id,
							partSuccess: "Part was succesfully added.",
							cid: req.body.cid,
							mid: req.body.mid,

						}
						res.send({part_id: req.body.part_id, partSuccess: });
					}
					else{
						res.send({partError: err});
					}

				});
			}
			else{
				res.send({partError: "Please fill out all fields."});
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

//render the color part of the admin page.
function renderColorForm(req, res){
	getters.getColors(function(err, colors){
		if(!err){
			//create the default render object
			var render = {
				colorsExist: colors.length > 0,
				colors: colors,
			}
			//check for errors
			render.adminError = req.adminError ? req.adminError : false;
			render.colorError = req.colorError ? req.colorError : false;

			//if no errors were found, add a success message
			if(!render.adminError && !render.colorError){
				//change the success message depending on whether the color is being added or removed.
				if(req.newColor){
					render.colorSuccess = "The color " + req.body.colorName + " was successfully created.";
				}
				else if(req.removeColor){
					render.colorSuccess = "Color successfully deleted.";
				}
			}
			res.send(render);
		}
		else{
			res.send({colorsExist: false, colorError: sys.dev ? err : "There was an error getting the colors"});
		}
	});
}

//render the material part of the admin page.
function renderMaterialForm(req, res){
	getters.getMaterials(function(err, materials){
		if(!err){
			//create the default render object
			var render = {
				materialsExist: materials.length > 0,
				materials: materials
			}
			//check for errors
			render.adminError = req.adminError ? req.adminError : false;
			render.materialError = req.materialError ? req.materialError : false;

			//if no errors were found, add a success message
			if(!render.adminError && !render.materialError){
				//change the success message depending on whether a material is being added or removed.
				if(req.newMaterial){
					render.materialSuccess = "The material " + req.body.materialName + " was successfully created.";
				}
				else if(req.removeMaterial){
					render.materialSuccess = "Material successfully deleted.";
				}
			}
			res.send(render);
		}
		else{
			res.send({materialsExist: false, materialError: sys.dev ? err : "There was an error getting the materials"});
		}
	});
}

//render the parts forms
function renderPartsForms(req, res){
	//get the shoe
	getters.getShoe(req.shoe_id, function(err, shoe){
		if(!err){
			
		}
		else{
			res.send({colorsExist: false, materialsExist: false, partError: err});
		}
	});
}
