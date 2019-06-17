/*
	Functionality for maintaining the db
*/

//require the database
var con = require('./database.js').connection;

module.exports = {

	//adds an admin to the system
	addAdmin: function(name, email, cb){
		//create a new user with the name and email
		if(name && email){
			con.query("INSERT INTO admins (name, email) VALUES (?, ?);", [name, email], function(err){
				cb(err);
			});		
		}
		else{
			cb("All required fields must be filled out.");
		}
	},

	//add a color to the db
	addColor: function(name, friendlyName, icon_path, cb){
		if(name && friendlyName){
			con.query("INSERT INTO colors (name, friendlyName, icon_path) VALUES (?, ?, ?);", [name, friendlyName, icon_path], function(err){
				cb(err);
			});
		}
		else{
			cb("All required fields must be filled out.");
		}
	},

	//remove a color associated with a cid
	removeColor: function(cid, cb){
		if(cid != null && cid > 0){
			con.query('DELETE FROM colors WHERE cid = ?;', [cid], function(err){
				cb(err);
			});
		}
		else{
			cb("Unable to delete color.");
		}
	},

	//add a material to the db
	addMaterial: function(name, friendlyName, icon_path, cb){
		if(name && friendlyName){
			con.query("INSERT INTO materials (name, friendlyName, icon_path) VALUES (?,?,?);", [name, friendlyName, icon_path], function(err){
				cb(err);
			});
		}
		else{
			cb("All required fields must be filled out.");
		}
	},

	//remove a material associated with a mid
	removeMaterial: function(mid, cb){
		if(mid != null && mid > 0){
			con.query('DELETE FROM materials WHERE mid = ?;', [mid], function(err){
				cb(err);
			});
		}
		else{
			cb("Unable to delete material.");
		}
	},

	//add a shoe to the db
	addShoe: function(name, friendlyName, svg_path, cb){
		if(name && friendlyName && svg_path){
			con.query('INSERT INTO shoes (name, friendlyName, svg_path) VALUES (?,?,?); SELECT * FROM shoes WHERE sid = LAST_INSERT_ID();', [name, friendlyName, svg_path], function(err, rows){
				if(!err && rows !== undefined && rows.length > 1){
					cb(err, rows[1][0]);
				}
				else{
					cb(err);
				}
			});
		}
		else{
			cb("All required fields must be filled out.");
		}
	},

	//add a specific part to the db
	addPart: function(shoe_id, part_id, name, default_color, default_material, img_x, img_y, img_width, img_height, cb){
		if(shoe_id != null && part_id != null && name && default_color != null && default_material != null){
			con.query('INSERT INTO parts (shoe_id, part_id, name, default_color, default_material, img_x, img_y, img_width, img_height) VALUES (?,?,?,?,?,?,?,?,?);', [shoe_id, part_id, name, default_color, default_material, img_x, img_y, img_width, img_height], function(err){
				cb(err);
			});
		}
		else{
			cb("All required fields must be filled out.");
		}
	},

	//add meta data to a part
	addPartMeta: function(shoe_id, part_id, color_id, material_id, price, image_path){
		if(shoe_id != null && part_id != null && color_id != null && material_id != null && price != null && image_path){
			con.query('INSERT INTO part_meta(shoe_id, part_id, color_id, material_id, price, image_path) VALUES (?,?,?,?,?,?);', [shoe_id, part_id, color_id, material_id, price, image_path], function(err){
				cb(err);
			});
		}
		else{
			cb("All required fields must be filled out.");
		}
	} 
}