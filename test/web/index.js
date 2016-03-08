var App = require(__src + '/app');

var ss = require('selenium-standalone');

var webdriverio = require('webdriverio');
var options = { desiredCapabilities: { browserName: 'chrome' } };




global.makeClient = function(done){
	var client = webdriverio.remote(options);
	client.init().then(function(err){
		client.windowHandle().then(function(handle){
			global.hFirst = handle.value;
			done();
		});
	});

	return client;
};

global.endClient = function(client, done){
	client.end().then(done);
};

global.makeWindow = function(callback){
	client.newWindow('http://127.0.0.1:8000/', 'Window', 'width=420,height=230,resizable,scrollbars=yes,status=1').windowHandle().then(function(handle){
		global.hSecond = handle.value; //'{' + handle.sessionId + '}';
		callback();
	});
};

global.endWindow = function(callback){
	client.window(hSecond).close().then(callback);
}

describe('Web', function(){

	require('./router');
	require('./boardUi');
	describe('Pages', function(){

		// Spin up full server for automated testing
		var server, child;
		before(function(done){
			// TODO: Compile the latest bundle

			this.timeout(50000);

			server = App();
			server.listen(8000, function(){

				ss.start({
					spawnOptions: {
						stdio: 'ignore'
					}
				}, function(err, c){
					child = c;

					// Open a primary browser
					global.client = makeClient(done);
				});
			});
		});
		after(function(done){
			this.timeout(4000);
			endClient(global.client, function(){
				child.kill();
				server.close();
				done();
			});
		});

		require('./home');
		require('./game');

	});

});
