var App = require(__src + '/app');

var ss = require('selenium-standalone');

var webdriverio = require('webdriverio');
var options = { desiredCapabilities: { browserName: 'firefox' } };


describe('Web', function(){

	require('./router');

	describe.skip('Pages', function(){

		// Spin up full server for automated testing
		var server, child;
		before(function(done){
			// TODO: Compile the latest bundle

			this.timeout(50000)

			server = App();
			server.listen(8000, function(){

				ss.start({
					spawnOptions: {
						stdio: 'ignore'
					}
				}, function(err, c){
					child = c;


					// Open a browser
					global.client = webdriverio.remote(options)
					client.init().then(function(err){
						done();
					});
				});
			});
		})
		after(function(done){
			global.client.end().then(function(){
				child.kill();
				server.close();
				done();
			});
		});




		require('./home');

	});


});
