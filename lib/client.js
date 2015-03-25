/**
* @author Gilles Coomans <gilles.coomans@gmail.com>
* Client App canevas.
*/

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "./app"],
function(require, deep, baseApp) {
	"use strict";


	var clientApp = {
		_backgrounds:[ baseApp ],
		context:{
			isServer:false
		},
		session:{
			save:function(session){
				session = session || deep.context("session");
				return deep.restful("session")
				.put(session);
			},
			reload:function(session){
				session = session || deep.context("session");
				return deep.restful("session")
				.get(session.id);
			}
		},
		login : {
			exec:function(object) {
				return deep.restful("login-client")
				.post(object)
				.done(function(user){
					deep.context("session").user = user;
					this.app()
					.saveSession()
					.when(user);
				});
			}
		},
		logout : {
			exec:function() {
				return deep.restful("logout-client")
				.post({})
				.done(function(success){
					deep.context("session").user = null;
					this.app()
					.saveSession()
					.when(success);
				});
			}
		},
		// reload session from local storage (or other - if any) then try a call on server needing user rights elevation (as user retrieval)) : 
		// if error : session was closed and so reload as not logged in
		// if no error : session stills alive : so reload as previously logged in 
		reload: function() {
			var app = this, sessionStore = app.session.store;
			if (!sessionStore) {
				var session = app.context.session = {};
				var d = deep.when(session);
				if (app.session.init)
					d.done(function() {
						return app.session.init(session) || session;
					});
				return d.done(app.session.toModes)
					.done(deep.Modes)
					//.slog("Session reinitialised");
			}
			return deep.restful(sessionStore)
				.get("session")
				.elog("while loading session")
				.fail(function(e) {
					// init session from scratch
					this
					.slog("trying to save session.")
					.done(function(session) {
						return this.post(session, "session")
							.elog("while saving session")
							.slog("session saved.")
							.fail(function(e) {
								return session;
							});
					});
					var session = {};
					if (app.session.init)
						return app.session.init(session) || session;
					return session;
				})
				//.slog("session reloaded")
				.done(function(session) {
					if (!session.user)
						return session;
					return deep.restful("user")
						.get(session.user.id)
						.elog("error while loading user")
						.done(function(user) {
							session.user = user;
								this.restful(sessionStore)
								.put()
								.elog("while saving (put) session.")
								.fail(function(e) {
									return session;
								});
							return session;
						})
						.fail(function(error){
						   	return session;
						});

				})
				.done(function(session) {
					app.context.session = session;
				})
				.done(app.session.toModes)
				.done(deep.Modes)
				//.slog("Session modes setted : ")
				.elog()
				.when(app); // inject app as success
		}
	};

	return clientApp;
});