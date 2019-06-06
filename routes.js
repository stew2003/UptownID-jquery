/*
	All routes
*/

var sys = require('./settings.js');

module.exports = {

	init: function(app) {

		//render the homepage
		app.get('/', function(req, res){
			res.end('Hello!');
		});
	}
}