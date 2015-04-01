/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * App-with-routers aspect.
 */
 
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "deep-routes/lib/route"], function(require, deep){
	"use strict";
	var appRouters = {
		init : deep.compose.around(function(sup){
			return function(){
				var self = this;
				return sup.call(this)
				.done(function () {
					var promises = [];
					for(var i in self.routers)
					{
						var router = self.routers[i];
						if(router.init)
							promises.push(router.init());
						// SHOULD parse route entry if an
						if(router.route)
							router.route = new deep.Route(router.route);						
						if(router.protocol)
							self.protocols[router.protocol] = router;
					}
					if(promises.length)
						return deep.all(promises).when(self);
				})
				.elog();

			}
		}),
		outputHeaders:{
			'Pragma': 'no-cache',
			'Cache-Control': 'no-store, no-cache, must-revalidate'
		},
		get:function(uri, opt){
			var self = this;
			for(var i in this.routers)
			{
				var router = this.routers[i], matched, d = null;
				// router.outputType should match opt.acceptType
				// router.inputType should match opt.contentType
				if(!router.route)
					d = deep.when(router.get(uri, opt));
				else if(matched = router.route.match(uri))
					d = deep.when(router.get(matched.parts.slice(matched.index), opt));

				if(d)
					return d.done(function (output) {
						var headers = self.outputHeaders;
						if(!headers)
							return output;
						if(headers._deep_ocm_)
							headers = headers();
						deep.up(output.headers, headers);
					});
			}
			return null;
		}
	};
	return appRouters;
});