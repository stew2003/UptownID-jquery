/*
	All functionality for getting information from the db
*/

//require the database
var con = require('./database.js').connection;
var sys = require('./settings.js');

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

	//get a specific color based off of a cid.
	getColor: function(cid, cb){
		con.query('SELECT * FROM colors WHERE cid = ?;', [cid], function(err, rows){
			if(!err && rows !== undefined && rows.length > 0){
				cb(err, rows[0]);
			}
			else{
				cb(sys.dev ? err.sqlMessage : "There was an error getting the ")
			}
		});
	},

	//get all materials from the database
	getMaterials: function(cb){
		con.query('SELECT * FROM materials;', function(err, rows){
			if(!err && rows !== undefined){
				cb(err, rows);
			}
			else{
				cb("Unable to retrieve material information.");
			}
		});
	},

	//get a shoe based on a shoe id 
	getShoe: function(sid, cb){
		con.query('SELECT * FROM shoes WHERE sid = ?;', [sid], function(err, rows){
			if(!err && rows !== undefined && rows.length > 0){
				cb(err, rows[0]);
			}
			else{
				cb(sys.dev ? err.sqlMessage : "Unable to get information for shoe.");
			}
		});
	}

}