/*
	All functionality for getting information from the db
*/

//require the database
var con = require('./database.js').connection;

module.exports = {

	//get all colors from the database
	getColors: function(cb){
		con.query('SELECT * FROM colors;', function(err, rows){
			if(!err && rows !== undefined){
				cb(err, rows);
			}
			else{
				cb("Unable to retrieve color information.");
			}
		});
	},

	getMaterials: function(cb){
		con.query('SELECT * FROM materials;', function(err, rows){
			if(!err && rows !== undefined){
				cb(err, rows);
			}
			else{
				cb("Unable to retrieve material information.");
			}
		});
	}

}