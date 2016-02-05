var Client = require(__src + '/client');

// Make a
Client.make = function(callback){
	var client = new Client('http://127.0.0.1:8000/', { 'force new connection': true });
	client.socket.on('connect', function(){
		callback(null, client);
	});
}
