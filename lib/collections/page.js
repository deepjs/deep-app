/**
* @author Gilles Coomans <gilles.coomans@gmail.com>
*/
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "deep-restful/lib/collection"], function(require, deep){
	return deep.ocm({
		// ENV
		standalone: new deep.Collection({ 
			collection:[{
				id:"i1", 
				owner:"u1",
				date:"",
				title:"hello world",
				descriptions:"lorem ipsum",
				blocks:[]
			}]
		}),
		// ROLES
		full:{
			tests:"req::deep-app/lib/collections/tests/user",
			methods:{
				publish:function(handler){
					this.status = "published";
					return handler.save();
				},
				unpublish:function(handler){
					this.status = "draft";
					return handler.save();
				}
			},
			schema:{
				properties:{
					owner:{ type:"string", required:true, minLength:2, readOnly:true },
					date:{ type:"utc" },
					status:{ type:"string", "enum":["draft", "published"], "default":"draft", required:true },
					title:{ type:"string" },
					description:{ type:"string" },
					blocks:{ 
						type:"array",
						item:[]
					}
				},
				links:[{
					rel:"owner",
					href:"user::{ owner }"
				}]
			}
		},
		admin:{
			_backgrounds:[ "this::../full" ]
		},
		registred:{
			_backgrounds:["this::../admin"],
			ownerRestriction:"write",
			ownerID:"owner"
		},
		'public':{
			_backgrounds:["this::../registred", deep.AllowOnly("get")],
			schema:{
				filter:"?status=published"	
			}
		}
	}, { sensibleTo:["env", "roles"] });
});