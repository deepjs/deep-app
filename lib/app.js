/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * App base canevas.
 */
 
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(["require", "deepjs/deep"], function(require, deep){
	"use strict";
	var App = {
		headers:{},
		protocols: {
		},
		context:{
			// should be contextualised first for each request/action-as-session under server env.
			isServer: false,
			init : function(app ){
				this.app = app;
				this.protocols = app.protocols;
				this.logs = app.logs;
				return app;
			}
		},
		session:{
			init:function (session) {},
			reset:function(session){},
			toModes:function(session){
				if(session && session.user)
					if(session.user.modes)
						return session.user.modes;
					else
						return { roles:"registred" };
				return { roles:"public" };
			}
		},
		init : function(){
			var self = this, p;
			this.context = this.context || {};
			if(this.context.init)
				p = deep.when(this.context.init(this));
			else
				p = new deep.Promise().resolve(null);
			
			return p.done(function(success){
			     this._context = deep.Promise.context = self.context;
			});
		}
	};

	return App;
});