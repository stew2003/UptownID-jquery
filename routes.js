/*
	All routes
*/

var sys = require('./settings.js');
var auth = require('./auth.js');
var maintenance = require('./maintenance.js');
var getters = require('./getters.js');
var upload = require('./upload.js');

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

			if(req.body.colorName != null){
				//create a strict name
				var name = req.body.colorName.toLowerCase().replace(' ', '_');

				//add a color to the db
				maintenance.addColor(name, req.body.colorName, function(err){
					if(!err){
						res.redirect('/admin');
					}
					else{
						error(res, err);
					}
				});
			}
			else{
				error(res, "All required fields must be filled out.");
			}
		});

		//handles a post request to remove a color
		app.post('/removeColor', auth.isAdminPOST, function(req, res){

			if(req.body.cid != null){
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
				error(res, "Please select a color to delete.");
			}
		});

		app.post('/newMaterial', auth.isAdminPOST, function(req, res){

			if(req.body.materialName != null){
				//create a strict name
				var name = req.body.materialName.toLowerCase().replace(' ', '_');

				//add a material to the db
				maintenance.addMaterial(name, req.body.materialName, function(err){
					if(!err){
						res.redirect('/admin');
					}
					else{
						error(res, err);
					}
				});
			}
			else{
				error(res, "All required fields must be filled out.");
			}
		});

		app.post('/removeMaterial', auth.isAdminPOST, function(req, res){

			if(req.body.mid != null){
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
				error(res, "Please select a material to delete.");
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