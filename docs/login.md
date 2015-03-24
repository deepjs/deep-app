# deep-login

Proposition for isomorphic custom login/logout/impersonate/session management through deep.context and deep.Modes/deep.modes usage.

The idea is to have standards, secured as possible, login familly patterns and related tools to handle them easily browser, server or shell side.

This lib comes with two kind of tools :

1) "login familly chained API" and "app" config object, usable in two environnements :
* client : modify current login state of current context and changes deep.Modes accordingly (think to single page app login state).
* server : use contextualised promise chain that hold login state in its context and set context modes accordingly (deep.modes) (dedicated to handle concurrents requests or processes).

2) expressjs middlewares for managing session login state and associated OCM modes (used in [autobahnjs](https://github.com/deepjs/autobahn) by example)

## Login Sequence

The login sequence is expressed both sides (client or server or shell) with same rules pattern (mainly with two customs functions : loggedIn and sessionModes), and consist in :

```
login({ /* email/password */ }) or impersonate({ id:... })
==> check validity server side - do a remote call client side) 
	==> if valid : place logged user in session 
		==> call loggedIn(session)
			decorate/manipulate session (do differents things client or server side)
	==> call sessionModes(session)
		define current OCM modes accordingly to current session (global modes client side - context's modes server side).
```



### Login familly chained API and "app" config object

Usage example with OCM restful stores (valid browser, server or shell side) : 
```javascript
deep.login({ email:"toto@doe.com", password:"something" }) // login as and so endorse toto@doe.com privileges
.restful("myStore")
.get() // get-all with toto@doe.com privileges
.done(function(objects){
	//...
})
.impersonate({ id:"an_id" }) // as a login with email + password 
.resftul("myOtherStore")
.post() // post something as user with id = an_id
.session({ /*...*/ }) // endorse privileges dependending on session
.restful("myThirdStore")
.put("hello world", "e123/title")  // update an object with provided session's rights
.log();
```

Really usefull for manipulating objects, testing or debugging by endorseing a particular identity.

Both, single-context and concurrent-contexts "chained login" API, use (almost) the same config pattern.



You would use "single-context login chained API" from within your single page application. Keep in mind than browser side, you are in a single window environnement. So, here, login/logout/session/impersonate manages deep.Modes (aka global modes) and the current deep.context (normally the unique one) and so really modify your application login state.


Shell or server side, you would use concurrent context login chained API to manage concurrent requests or processes with contextualised (through deep.context and deep.modes) promise chains.

## Server and shell side

Here, as you should manage concurrents requests/processes with differents login modes, each time you use a login familly tools, you start a new contextualised (with a new context) promise chain which hold  for

## Licence

LGPL 3.0
