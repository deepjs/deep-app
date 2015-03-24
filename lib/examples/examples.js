//____________________________ VIEWS MAP

var mapToViewsSheet = {
	_deep_sheet_:true,
	// for all entry in map that contain a 'how' property : we apply this transformation
	"dq.bottom::./*?_deep_view_=ne=true":new deep.View(),
	"dq.bottom::.//subs/*?_deep_view_=ne=true":new deep.View()
};

var viewsMap = {
	_transformations:[ mapToViewsSheet ],
	header:{
		how: 	"html::/my/header.html",
		where: 	"dom.htmlOf::#header"
	},
	home:{
		route: 	"/[home,$]",
		what: 	"campaign::?status=published&sort(date)",
		how: 	"template::/my/template.html",
		where: 	"dom.htmlOf::#content"
	},
	campaign:{
		route: 	"/campaign/?[q:query,s:campid]",
		what:{
			campaigns: 	"campaign::{ params.campid | params.query | '?status=published&sort(date)' }",
			profile: 	"profile.first::?userId={ context.session.user.id }"
		},
		how: 	"template::/my/campaign.html",
		where: 	"dom.htmlOf::#content",
		//done: 	deep.enhancer.noscroll(),
		subs:{
			title:{
				what: 	"ui-text::/my/title",
				where: 	"dom.htmlOf::.title",
				inPlaceEditable: true
			},
			product:{
				states:{
				 	edit:{
				 		route:"./product/edit/s:prodId",
				 		how:"template::/my/product_edit.html",
				 		done:deep.enhancer.domsheet({
				 			"dom::.button":deep.domsheeter.click(...)
				 		})
				 	},
				 	add:{ 
				 		route:"./product/add",
				 		how:"template::/my/product.html"
				 	},
				 	view:{ 
				 		route:"./product/s:prodId",
				 		how:"template::/my/product.html"
				 	}
				},
				what: 	"product::{ params.prodId }",
				where: 	"dom.htmlOf::#product"
			}
		}
	}
};

//_______________________________ BROWSER

var editInPlace = deep.ocm({ 
	admin:deep.enhancer.inPlaceEditable()
}, { sensibleTo:"roles" });

var customViews = { 
	_deep_sheet_:true,
	"dq.up::.//?inPlaceEditable":{
		done: deep.enhancer.sensibleTo(["roles"], "admin").after(editInPlace)
	},
	"dq.up::./*/subs/*":{ 
		done: deep.enhancer.before(deep.enhancer.hide()).delay(20).fadeIn(100) 
	}
};

var browserApp = {
	_backgrounds: [ browser.app ],
	protocols:{
		dom: 		new deep.jquery.DOM(),

		"app-data": new deep.jstorage.Object(),

		json: 		new deep.jquery.http.JSON({ basePath:"/statics" }),
		template: 	new deep.jquery.http.Swig({ basePath:"/statics" }),
		"ui-text": 	new deep.jquery.http.JSON({ basePath:"/api/ui-text" }),

		user: 		new deep.jquery.http.JSON({ basePath:"/api/user", schema:"schema" }),
		profile: 	new deep.jquery.http.JSON({ basePath:"/api/profile", schema:"schema"  }),
		campaign: 	new deep.jquery.http.JSON({ basePath:"/api/campaign", schema:"schema"  }),
		product: 	new deep.jquery.http.JSON({ basePath:"/api/product", schema:"schema"  })
	},
	routers:{
		views:{
			_transformations:[ viewsRouter ],
			protocol : "views",
			map:{
				_backgrounds : [ viewsMap ],
				_transformations: [ customViews ]
			}
		}
	}
};


/*
	app.init()
	app.context.init(app)
	app.headers


	app.session.init(session)
	app.session.save(session)
	app.session.reset(session)
	app.session.reload(session)
	app.session.toModes(session)
	app.session.kill(session)

	app.routers.restful.map
	app.routers.restful.init()
	app.routers.restful.get(path, opt)
	app.routers.restful.post(obj, opt)
	app.routers.restful.put(obj, opt)
	app.routers.restful.patch(obj, opt)
	app.routers.restful.del(obj, opt)
	app.routers.restful.range(obj, opt)
	app.routers.restful.rpc(obj, opt)
	app.routers.restful.bulk(obj, opt)
	app.routers.restful.head(obj, opt)
	app.routers.restful.relation(rel, obj, opt)

	app.routers.views.map
	app.routers.views.init()
	app.routers.views.get(path, opt)

	app.routers.statics.map
	app.routers.statics.init()
	app.routers.statics.get(path, opt)

	app.login.post(credentials, opt)
	app.logout.post(null, opt)
	app.impersonate.post(credentials, opt)

	app.panic(context)

	app.get(uri, opt)

	// client only
	app.reload()
	app.history.init(app)

 */



