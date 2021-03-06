'use strict';
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['require', 'deepjs', '../lib/browser/app'], function(require, deep, autobahn) {

    //_______________________________________________________________ GENERIC STORE TEST CASES
    var unit = {
        title: 'js::deep-login/tests/concurrent',
        stopOnError: false,
        setup: function() {
            var loggedIn = function(session) {
                //console.log('testcase : loggedIn : ', session)
                session.decorated = true;
                return session;
            };
            return autobahn.app({ // return an "autobahnjs app". will be used as "this" in tests (see below).
                protocols: deep.ocm({
                    'public': {
                        test: { 
                            get: function(path) {
                                return 'hello : public : ' + path;
                            }
                        }
                    },
                    user: {
                        test: {
                            get: function(path) {
                                return 'hello : user : ' + path;
                            }
                        }
                    }
                }, {
                    sensibleTo: 'roles'
                }),
                loggedIn: loggedIn,
                sessionModes: function(session) {
                    //console.log('testcase : sessionModes : ', session)
                    if (session && session.user)
                        return {
                            roles: 'user'
                        };
                    return {
                        roles: 'public'
                    };
                },
                loginConfig: {
                    encryption: 'sha1',
                    store: new deep.Collection(null, [{
                        id: 'u1',
                        email: 'toto@bloup.com',
                        password: deep.utils.Hash('test', 'sha1'),
                        valid:true
                    }, {
                        id: 'u2',
                        email: 'toti@bloup.com',
                        password: deep.utils.Hash('test', 'sha1'),
                        valid:true
                    }]),
                    loginField: 'email',
                    passwordField: 'password'
                }
            });
        },
        tests: {
            login: function() {
                return deep.app(this)
                    .modes('roles', 'public')
                    .login({
                        email: 'toto@bloup.com',
                        password: 'test'
                    })
                    .equal({
                        user: {
                            id: 'u1',
                            email: 'toto@bloup.com', valid:true
                        },
                        decorated: true
                    })
                    .done(function() {
                        return deep.Promise.context.modes.roles;
                    })
                    .equal('user');
            },
            session: function() {
                return deep.app(this)
                    .modes('roles', 'public')
                    .session({
                        user: {
                            id: 'u1',
                            email: 'toto@bloup.com'
                        }
                    })
                    .done(function() {
                        return deep.Promise.context.session;
                    })
                    .equal({
                        user: {
                            id: 'u1',
                            email: 'toto@bloup.com'
                        },
                        decorated: true
                    })
                    .done(function() {
                        return deep.Promise.context.modes.roles;
                    })
                    .equal('user');
            },
            impersonate_id: function() {
                return deep.app(this)
                    .modes('roles', 'public')
                    .impersonate({
                        id: 'u1'
                    })
                    .done(function() {
                        return deep.Promise.context.session;
                    })
                    .equal({
                        parent: {},
                        user: {
                            id: 'u1',
                            email: 'toto@bloup.com', valid:true
                        },
                        decorated: true
                    })
                    .done(function() {
                        return deep.Promise.context.modes.roles;
                    })
                    .equal('user');
            },
            impersonate_email: function() {
                return deep.app(this)
                    .modes('roles', 'public')
                    .impersonate({
                        email: 'toto@bloup.com'
                    })
                    .done(function() {
                        return deep.Promise.context.session;
                    })
                    .equal({
                        parent: {},
                        user: {
                            id: 'u1',
                            email: 'toto@bloup.com', valid:true
                        },
                        decorated: true
                    })
                    .done(function() {
                        return deep.Promise.context.modes.roles;
                    })
                    .equal('user');
            },
            login_logout: function() {
                return deep.app(this)
                    .modes('roles', 'public')
                    .login({
                        email: 'toto@bloup.com',
                        password: 'test'
                    })
                    .done(function() {
                        return deep.Promise.context.modes.roles;
                    })
                    .equal('user')
                    .logout()
                    .done(function() {
                        return deep.Promise.context.modes.roles;
                    })
                    .equal('public');
            },
            impersonate_logout: function() {
                return deep.app(this)
                    .modes('roles', 'public')
                    .impersonate({
                        email: 'toto@bloup.com'
                    })
                    .done(function() {
                        return deep.Promise.context.modes.roles;
                    })
                    .equal('user')
                    .logout()
                    .done(function() {
                        return deep.Promise.context.modes.roles;
                    })
                    .equal('public');
            },
            login_impersonate_logout: function() {
                return deep.app(this)
                    .modes('roles', 'public')
                    .login({
                        email: 'toto@bloup.com',
                        password: 'test'
                    })
                    .impersonate({
                        email: 'toti@bloup.com'
                    })
                    .done(function() {
                        return deep.Promise.context.modes.roles;
                    })
                    .equal('user')
                    .logout()
                    .done(function() {
                        return deep.Promise.context.modes.roles;
                    })
                    .equal('user')
                    .logout()
                    .done(function() {
                        return deep.Promise.context.modes.roles;
                    })
                    .equal('public')
            },
            protocols_public: function() {
                return deep.app(this)
                    .modes('roles', 'public')
                    //.logContext("protocols")
                    /*.done(function(){
                        console.log("_____________________________________________protocols : ", this._context.protocols())
                    })*/
                    .nodes('test::local')
                    .equal('hello : public : local');
            },
            protocols_user: function() {
                return deep.app(this)
                    .modes('roles', 'user')
                    //.logContext("protocols")
                    .done(function(){
                        console.log("protocols : ", this._context.protocols())
                    })
                    .nodes('test::local')
                    .equal('hello : user : local');
            },
            protocols_login_user: function() {
                return deep.app(this)
                    .modes('roles', 'public')
                    .login({
                        email: 'toto@bloup.com',
                        password: 'test'
                    })
                    //.logContext("protocols")
                    .nodes('test::local')
                    .equal('hello : user : local')
                    .logout()
                    .nodes('test::local')
                    .equal('hello : public : local');
            }
        }
    };

    return unit;
});