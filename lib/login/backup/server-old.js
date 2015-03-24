/**
 * @author Gilles Coomans
 *
 * Concurrent friendly login famillies deepjs tools ("app" definition and login/logout/impersonate through it).
 * And Login/Logout/Impersonate deepjs/chain handlers (based on app).
 *
 * An "app" is just a really simple object that essentially holds your config datas and custom handlers to perform user/session/context/modes management on login. 
w */
var deep = require("deepjs");
require("deepjs/lib/app");

/**
 * login : means create a chain that hold a context that mimics a full login from outside
 * (credentials will be validate as trough real login, and session (in chain context) will be decorated with same methods)
 * The roles of the chain is automatically set to the one from user
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
deep.login = function(obj) {
    return deep.when(obj).login();
};

// apply login from within a chain. (resulting session is placed in chain's context)
deep.Promise.API.login = function(datas) {
    var self = this;
    var func = function(s, e) {
        var app = deep.app();
        if (!app)
            return deep.errors.Error(500, "No app setted in deep to manipulate session.");
        deep.Promise.context = self._context = deep.utils.shallowCopy(self._context);
        self._context.session = {};
        self._context.protocols = app.protocols;
        return deep.when(app.login(datas || s, self._context.session))
            .done(function(session) {
                self.modes(app.sessionModes(session));
                return s;
            });
    };
    func._isDone_ = true;
    return this._enqueue(func);
}
//_________________________
/**
 * logout : means  : if you have previously use deep.login or chain.login : it will destroy the session of current chain context.
 * @return {[type]} [description]
 */
deep.Promise.API.logout = function() {
    var self = this;
    var func = function(s, e) {
        var app = deep.app();
        if (!app)
            return deep.errors.Error(500, "No app setted through deep.mainApp or deep.app to manipulate session.");
        if (self._context.session) {
            if (self._context.session.parent)
                self._context.session = self._context.session.parent;
            else
                self._context.session = {};
        }
        self.modes(app.sessionModes(self._context.session));
        return s;
    };
    func._isDone_ = true;
    return this._enqueue(func);
};

//_________________________
/**
 * Impersonate means : (always in local chains context)
 * mimics and allow a login with only a user ID.
 * @param  {[type]} user [description]
 * @return {[type]}      [description]
 */
deep.impersonate = function(user) {
    return deep.when(user).impersonate();
};

// apply impersonation from within a chain. resulting session is placed in current chain's context.
deep.Promise.API.impersonate = function(user) {
    var self = this;
    var func = function(s, e) {
        var app = deep.app();
        if (!app)
            return deep.errors.Error(500, "No app setted in deep to manipulate session for impersonation.");
        deep.Promise.context = self._context = deep.utils.shallowCopy(self._context);
        //console.log("login : session 2 : ", self._context.session)
        var oldSession = self._context.session = self._context.session || {};
        var session = self._context.session = {};
        session.parent = oldSession.parent || oldSession;
        self._context.protocols = app.protocols;
        return deep.when(app.impersonate(user || s, session))
            .done(function(session) {
                self.modes(app.sessionModes(session));
                return s;
            });
    };
    func._isDone_ = true;
    return this._enqueue(func);
};

//_________________________
/**
 * start a chain with provided session. session is placed in chain's context.
 * @param  {[type]} session [description]
 * @return {[type]}         [description]
 */
deep.session = function(session) {
    if (!session)
        return deep.Promise.context.session;
    return deep.when(session).session(session);
};


// change session fom within a chain (placed in own context)
deep.Promise.API.session = function(session) {
    var self = this;
    var func = function(s, e) {
        var app = deep.app();
        if (!app)
            return deep.errors.Error(500, "No app setted in deep to manipulate session.");
        deep.Promise.context = self._context = deep.utils.shallowCopy(self._context);
        self._context.session = session;
        self._context.protocols = app.protocols;
        if (session.user && app.loggedIn)
            return deep.when(app.loggedIn(session))
                .done(app.sessionModes)
                .done(function(modes) {
                    self.modes(modes);
                    return s;
                });
        self.modes(app.sessionModes(session));
        return s;
    };
    func._isDone_ = true;
    return this._enqueue(func);
};
//_________________________
//_____________________________________

deep.login.server = function(app){
    var config = app.config;
    // produce login/impersonate/logout(/session?) handlers in app.xxx
};

module.exports = deep.login;

var loginHandler = function(config) {
    return function(object) {

        if (!object)
            return deep.errors.Error(400);
        var session = deep.context("session");
        var loginVal = object[config.loginConfig.loginField || "email"];
        var password = object[config.loginConfig.passwordField || "password"];
        //
        //console.log("LOGIN HANLDER : ", object, session);
        if (!loginVal || !password)
            return deep.errors.Error(400);

        password = deep.utils.Hash(password, config.loginConfig.encryption || 'sha1');

        return deep
            .modes({ roles:"admin" })
            .restful(config.loginConfig.store || 'user')
            .get("?" + (config.loginConfig.loginField || "email") + "=" + encodeURIComponent(loginVal) + "&password=" + password)
            .done(function(user) {
                //console.log("************ login get : ", user, session, config.loggedIn);
                if (user.length === 0)
                    return deep.errors.NotFound();
                user = user.shift();

                if (user.valid === false)
                    return deep.errors.Unauthorized('Account is not active.');

                delete user.password;
                session.user = user;
                if (config.loggedIn)
                    return deep.when(config.loggedIn(session))
                        .done(function(session) {
                            return session;
                        });
                return session;
            });
    };
};

var impersonateHandler = function(config) {
    return function(object, session) {
        if (!object)
            return deep.errors.Error(400);
        var toCatch = Object.keys(object)[0];
        var query = "?" + toCatch + "=" + encodeURIComponent(object[toCatch]);

        return deep.modes({
                roles: "admin"
            })
            .restful(config.loginConfig.store || 'user')
            .get(query)
            .done(function(user) {
                //console.log("login get : ", user);
                if (user.length === 0)
                    return deep.errors.NotFound();
                user = user.shift();
                delete user.password;
                session.user = user;
                if (config.loggedIn)
                    return deep.when(config.loggedIn(session))
                        .done(function(session) {
                            return session;
                        });
                return session;
            });
    };
};



