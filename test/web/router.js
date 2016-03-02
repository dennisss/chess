var jsdom = require("jsdom");

var Router = require(__src + '/web/scripts/router');

describe('Router', function(){

	beforeEach(function(done){

		jsdom.env({
			html: '<p></p>',
			url: 'http://127.0.0.1/',
			done: function(err, window){

				jsdom.jQueryify(window, "http://code.jquery.com/jquery-2.1.1.js", function(){
					global.window = window;
					global.document = window.document;
					global.$ = window.$;
					global.location = window.location;

					done(err);
				});

			}
		});

	});


	it('should redirect to the default state if none is specified', function(done){

		var loaded = false;

		Router({
			states: {
				home: {
					path: '/mystate',
					controller: {
						load: function(){

							loaded = true;
						},
						enter: function(){
							assert(loaded);
							done();
						}
					}
				},
			},

			default: 'home'
		});
	});

	afterEach(function(done){
		setTimeout(function(){
			delete global.window;
			delete global.document;
			delete global.$;
			delete global.location;
			done();
		}, 0);
	})


	/*
	var jsdom = require("jsdom").jsdom;
	var doc = jsdom("", {


	});
	var window = doc.defaultView;
	*/


})
