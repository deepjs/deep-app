/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
 
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "deep-jquery-http/lib/json"], function(require){
	var registerClient = {
		protocols:{
			register:new deep.jquery.http.JSON({ basePath:"/api/register" })
		}
	}
});