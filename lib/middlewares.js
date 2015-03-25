/**
* @author Gilles Coomans <gilles.coomans@gmail.com>
*/
var deep = require("deepjs");
var middleware = {};
middleware.csrf = function(request, response, next) {
	if(request.header.uuid !== request.session.uuid)
	{
		response.writeHead(400, {'Content-Type': 'application/json'});
	    response.end(JSON.stringify({ message:"uuid doesn't match. potential csrf attack."}));	
	}
	else
		next();
};
middleware.context = function(app){
	return function(request, response, next){
		return deep.app(app)
		.contextualise()
		.toContext("session", request.session || {})
		.sessionModes()
		.done(function(){
		    return next();
		})
		.fail(function(error){
			response.writeHead(error.status || 400, {'Content-Type': 'application/json'});
			if(deep.context("debug"))
				response.end(error.toString());
			else
				response.end("error");
		});
	};
};
middleware.login = function(request, response, next){ // on post on  /login
	return deep.when(deep.currentApp().login.exec(request.body))
	.done(function(user){
	    response.writeHead(200, {'Content-Type': 'application/json'});
	    response.end(JSON.stringify(user));
	});
};
middleware.logout = function(request, response, next){ // on post on /logout
	return deep.when(deep.currentApp().logout.exec())
	.done(function(res){
	    response.writeHead(200, {'Content-Type': 'application/json'});
	    response.end(JSON.stringify(res));
	});
};

var parseContentType = function(ct){
	return ct;
};
var parseAcceptType = function(at){
	return at;
};

middleware.routers = function(request, response, next) {
	var opt = {
		contentType : parseContentType(request.headers.contentType),
		acceptType : parseAcceptType(request.headers.acceptType),
		headers : request.headers
	};
	return deep.app()
	.get(request.url, opt)
	.done(function(s){
	    response.writeHead(s.status, s.headers);
	    response.end(JSON.stringify(s.result));
	})
	.fail(function (e) {
		if(e.status == 404)
			return next();
	});
};
module.exports = middleware;
