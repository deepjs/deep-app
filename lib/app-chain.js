/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * App management chained API (Promise Based).
 */

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define(["require", "deepjs/deep"], function(require, deep) {
	"use strict";
	var constructor = function(state, app, forceContextualisation) {
		this._identity = Chain;
		app = app || deep.currentApp();
		if (!app)
			throw deep.errors.Internal("No app provided at app chain constructor. (nor from global nor from context).");
		this.done(function() {
			if (app !== this._context.app)
				deep.Promise.context = this._context = app.context || {};
		});
		if (forceContextualisation)
			this.contextualise();
	};
	var api = {
		get: function(path, opt) {
			var self = this;
			return this.done(function(s, e) {
				var app = self._context.app;
				if (app.get)
					return app.get(path, opt);
				return deep.errors.MethodNotAllowed("app.get not implemented");
			});
		},
		reload: function(opt) {
			var self = this;
			return this.done(function(s, e) {
				var app = self._context.app;
				if (app.reload)
					return app.reload(opt).when(s);
				return deep.errors.MethodNotAllowed("app.reload not implemented");
			});
		},
		panic: function(opt) {
			var self = this;
			return this.done(function(s) {
				var app = self._context.app;
				if (app.panic)
					return app.panic(opt);
				return deep.errors.MethodNotAllowed("app.panic not implemented");
			});
		},
		resetSession: function() {
			// set session to default
			var self = this;
			return this.done(function(s) {
				var app = self._context.app,
					session = self._context.session;
				if (!app.session || !app.session.reset)
					return deep.errors.MethodNotAllowed("app.session.reset not implemented.");
				self.when(app.session.reset(session))
					.done(function(session) {
						self._context.session = session;
						return s;
					});
			});
		},
		sessionModes: function(session, noContextualisation) {
			// set current context.modes through session analyse
			var self = this;
			return this.done(function(s) {
				var app = self._context.app,
					session = session || self._context.session;
				self.when(app.session.toModes(session))
					.done(function(modes) {
						self.modes(modes, null, noContextualisation)
							.when(s);
					});
			});
		},
		saveSession: function(session) {
			var self = this;
			return this.done(function(s) {
				session = session || self._context.session;
				if (!session)
					return s;
				var app = self._context.app;
				if (!app.session.save)
					return deep.errors.MethodNotAllowed("app.session.save not implemented.");
				return deep.when(app.session.save(session))
					.when(s);
				return s;
			});
		},
		reloadSession: function() {
			// reload session from store
			var self = this;
			return this.done(function(s) {
				var app = self._context.app,
					session = self._context.session;
				if (!app.session || !app.session.reload)
					return deep.errors.MethodNotAllowed("app.session.reload not implemented.");
				return deep.when(app.session.reload(session))
					.done(function(session) {
						self._context.session = session;
						return s;
					});
			});
		},
		login: function(object) {
			var self = this;
			return this.done(function(s) {
				if (!self._context.app.login)
					return deep.errors.MethodNotAllowed("app.login not implemented.");
				return deep.when(self._context.app.login.exec(object))
					.done(function() {
						self.sessionModes(null, true)
							.when(s);
					});
			});
		},
		logout: function(object) {
			var self = this;
			return this.done(function(s) {
				if (!self._context.app.login)
					return deep.errors.MethodNotAllowed("app.logout not implemented.");
				return deep.when(self._context.app.logout.exec(object))
					.done(function() {
						self.sessionModes(null, true)
							.when(s);
					});
			});
		}
	};
	deep.Promise._up({
		app: function(app, forceContextualisation) {
			var handler = new Chain(this._state, app, forceContextualisation);
			this._enqueue(handler);
			return handler;
		}
	});
	var Chain = deep.Classes(deep.Promise, constructor, api);
	deep.app = function(app, forceContextualisation) {
		return new Chain(null, app, forceContextualisation).resolve(app || deep.currentApp());
	};
	deep.app.Chain = Chain;
	return Chain;
});