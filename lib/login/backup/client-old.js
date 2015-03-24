/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 */

define(["require", "deepjs/deep", "deepjs/lib/app", "deep-restful/index"], function(require, deep) {



	var loginHandler = function(obj, store) {
		var app = this, config = app.config;
		return deep.restful(store)
			.post(obj)
			.done(function(user) {
				var session = {
					user: user
				};
				deep.context('session', session);
				if (config.loggedIn)
					this.done(config.loggedIn);
				return session;
			})
			.done(function(session) {
				return deep.restful(config.session.store).post(session, "/session");
			})
			.done(config.sessionModes)
			.done(deep.Modes)
			.elog();
	};

	var appAPI = {
		login: function(obj) {
			return loginHandler.call(this, obj, this.config.login.login);
		},
		impersonate: function(obj) {
			return loginHandler.call(this, obj, this.config.login.impersonate);
		},
		logout: function() {
			var app = this,
				config = app.config;
			return deep.restful(config.login.logout)
				.post({})
				.done(function() {
					delete deep.context('session', null);
					return deep.restful(config.session.store)
					.del("/session");
				})
				.elog();
		},
		session: function(session) {
			if (!session)
				return deep.context('session');
			deep.context('session', session);
			var app = this,
				config = app.config;
			if (session.user && config.loggedIn)
				return deep.when(config.loggedIn(session))
					.done(function(session) {
						return deep.restful(config.session.store)
						.put(session, "/session");
					})
					.done(config.sessionModes)
					.done(function(modes) {
						deep.Modes(modes);
						return session;
					});
			deep.Modes(config.sessionModes(session));
			return deep.restful(config.session.store)
			.put(session, "/session");
		},
		// reload session from local storage (or other) then try a call on server needing user rights elevation (as user retrieval)) : 
		// if error : session was closed and so reload as not logged in
		// if no error : session stills alive : so reload as previously logged in 
		reload: function() {
			var app = this,
				config = app.config;
			// TODO : samething for register and change password
			return deep.restful(config.session.store)
				.get("/session")
				.done(function(session) {
					//console.log("User form appData = ", session);
					if (!session.user)
						return new Error();
					return deep.restful(config.login.userStore)
						.get(user.id)
						.done(function(user) {
							if (config.loggedIn)
								this.done(config.loggedIn);
							session.user = user;
							return session;
						})
						.done(function(session) {
							return deep.restful(config.session.store)
							.put(session, "/session");
						})
						.done(config.sessionModes);
				})
				.fail(function(e) {
					var session = {};
					deep.restful(config.session.store).post(session, "/session");
					return config.sessionModes(session);
				})
				.done(deep.Modes)
				.elog();
		}
	};

	deep.login.client = function(app) {
		// produce login/logout/impersonate/session client oriented handlers
		// store them in app
		// + add reload handler
		return deep.up(app, appAPI);
	};
});