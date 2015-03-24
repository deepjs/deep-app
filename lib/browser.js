/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * Browser App canevas. (Client with history)
 */
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "./client", "./app-routers"],
function(require, deep, client, appRouters) {
	"use strict";
	return {
		_backgrounds: [ client, appRouters ],
		history: {
			setHashEvent: true,
			hashChangeAlone: true,
			basePath: "",
			hid: true,
			init: function(app) {
				if (!app.history || !window.history || !window.history.init)
					return;
				window.history.init(app.history); // init min-history
				window.addEventListener("popstate", function(e) {
					deep.app(app)
					.views(window.history.location.path, {
						skipHistory: true
					})
					.elog();
				});
			}
		},
		init: deep.compose.before(function() {
			this.history.init(this);
		})
	};
});
