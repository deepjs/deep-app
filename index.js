/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * Main file for deep-app.
 *
 * Load app management and chained API.
 */
 
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "./lib/app-chain"], function(require, deep, AppChain){
	"use strict";
	var appClosure = {
		app: null // global app (if any)
	};
	// holds provided app as main app accessible for deepjs chains.
	deep.mainApp = function(app) {
		if (!app) {
			if (appClosure.app)
				return appClosure.app;
			throw deep.errors.Internal("no global app setted");
		}
		appClosure.app = app;
	};

	deep.currentApp = function() {
		return deep.Promise.context.app || appClosure.app;
	};
});