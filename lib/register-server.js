/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
var deep = require("deepjs");
var registerClient = {
	protocols:{
		register:new deep.jquery.http.JSON({ basePath:"/api/register" })
	}
};