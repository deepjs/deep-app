/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * Server App canevas.
 */
 
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "./app", "./app-routers"], 
function(require, deep, BaseApp){

	var server = {
		_backgrounds:[ baseApp, appRouters ],
		context:{
			isServer:true
		},
		login : {
			encryption:"sha1",
			exec:function(object) {
				if (!object || !object.email || !object.password)
					return deep.errors.Error(400);
				var self = this,
					query = "?email=" + encodeURIComponent(object.email) + "&password=" + deep.utils.Hash(object.password, this.encryption || 'sha1');
				return deep.modes("roles", "full")
				.restful("user")
				.first(query)
				.done(function(user) {
					var output = {
						id:user.id,
						email:user.email,
						modes:user.modes
					};
					deep.context("session").user = output;
					return output;
				});
			}
		},
		logout : {
			exec:function(){
				deep.context("session").user = null;
				return true;
			}
		}
	};
});