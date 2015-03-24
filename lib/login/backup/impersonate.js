/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * Impersonate  middleware for expressjs/autobahnjs/deepjs
 * To imperonsate means to take identity of someone without 
 */

var deep = require('deepjs');


exports.middleware = function(handlers) {
	return function(req, response, next) {
		if (!req.body)
			return deep.errors.Error(400);
		var handler = handlers.impersonate;
		deep.when(handler(req.body, req.session))
			.done(function(session) {
				req.session = session;
				response.writeHead(200, {
					'Content-Type': 'application/json'
				});
				response.end(JSON.stringify(session.user));
			})
			.fail(function(e) {
				response.writeHead(400, {
					'Content-Type': 'text/html'
				});
				response.end("error.");
			});
	};
};
