/**
* @author Gilles Coomans <gilles.coomans@gmail.com>
*/
var deep = require("deepjs");
var middleware = {};
middleware.csrf = function(request, response, next) {
	var session = deep.context("session");
	if(request.session && request.session.user && request.header.uuid !== request.session.uuid)
	{
		response.writeHead(400, {'Content-Type': 'application/json'});
	    response.end(JSON.stringify({ message:"uuid doesn't match. potential csrf attack."}));
	    return;
	}
	else
		next();
};
middleware.context = function(app){
	return function(request, response, next){
		deep.debug("context middleware call : ", request.url);
		return deep.app(app)
		.contextualise()
		.toContext("session", request.session || {})
		.sessionModes()
		.done(function(){
		    return next();
		})
		.fail(function(error){
			deep.error("context middleware error : ");
			deep.utils.dumpError(error);
			response.writeHead(error.status || 500, {'Content-Type': 'plain/text'});
			if(deep.context("debug"))
				response.end(error.toString());
			else
				response.end("error");
		});
	};
};
middleware.login = function(request, response, next){ // on post on  /login
	//throw new Error("bloupi");
	deep.debug("login middleware call.");
	return deep.when(deep.currentApp().login.exec(request.body))
	.done(function(user){
		deep.debug("login middleware user : ", user);
	    response.writeHead(200, {'Content-Type': 'application/json'});
	    response.end(JSON.stringify(user));
	})
	.fail(function (error) {
		//deep.utils.dumpError(error);
		response.writeHead(error.status || 500, {'Content-Type': 'plain/text'});
		response.end("error");
	});
};
middleware.logout = function(request, response, next){ // on post on /logout
	deep.debug("logout middleware call.");
	return deep.when(deep.currentApp().logout.exec())
	.done(function(res){
		deep.debug("logout middleware result : ", res);
	    response.writeHead(200, {'Content-Type': 'application/json'});
	    response.end(JSON.stringify(res));
	})
	.fail(function (error) {
		//deep.utils.dumpError(error);
		response.writeHead(error.status || 500, {'Content-Type': 'plain/text'});
		response.end("error");
	});
};

var parseContentType = function(ct){
	return ct;
};
var parseAcceptType = function(at){
	return at;
};

middleware.routers = function(request, response, next) {
	deep.debug("routers middleware call : ", request.url);
	var opt = {
		contentType : parseContentType(request.headers.contentType),
		acceptType : parseAcceptType(request.headers.acceptType),
		headers : request.headers
	};
	return deep.app()
	.get(request.url, opt)
	.done(function(s){
		deep.debug("routers middleware : " + request.url + " result : ", s);
	    response.writeHead(s.status, s.headers);
	    response.end(s.result);
	})
	.fail(function (e) {
		deep.error("routers middleware error : ", e);
		if(deep.context("debug"))
			deep.utils.dumpError(e);
		if(!e)
		{
			response.writeHead(500, {'Content-Type': 'plain/text'});
	    	response.end("something is wrong.");
	    	return;
		}
		if(e.status == 4000)
			return next();
		response.writeHead(e.status || 500, {'Content-Type': 'plain/text'});
	    response.end(toString(e));
	});
};
module.exports = middleware;
