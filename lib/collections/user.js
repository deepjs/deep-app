/**
* @author Gilles Coomans <gilles.coomans@gmail.com>
*
*/

if (typeof define !== 'function') {
var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "deep-restful/lib/collection"], function(require, deep){
	return deep.ocm({
		// ENV
		standalone: new deep.Collection({ 
			collection:[{
				id:"u1", 
				email:"john@doe.com", 
				password:deep.utils.Hash("test1234"),
				valid:true,
				modes:{ roles:'registred' } 
			},
			{ 
				id:"u2", 
				email:"admin@doe.com", 
				password:deep.utils.Hash("admin1234"), 
				valid:true,
				modes:{ roles:'admin' } 
			}]
		}),
		// ROLES
		full:{
			schema:{
				properties:{
					password:{ type:"string", format:"password", required:true },
					email:{ type:"string", format:"email", required:true },
					valid:{ type:"bool" },
					modes:{
						required:true,
						properties:{
							roles:{ type:"string", "enum":["admin", "registred", "public"] }
						}
					}
				}
			}
		},
		admin:{
			_backgrounds:["this::../full"],
			schema:{
				properties:{
					password:{ "private":true, readOnly:true },
					email:{ readOnly:true },
					valid:{ readOnly:true },
					roles:{ readOnly:true }
				}
			}
		},
		registred:{
			_backgrounds:["this::../admin"]
			ownerRestriction:"id",
			schema:{
			}
		},
		'public':{}
	}, { sensibleTo:["env", "roles"] });
});