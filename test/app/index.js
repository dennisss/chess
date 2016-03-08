var child_process = require('child_process')

describe('Index', function(){
	it('can start and kill child processes', function *() {
		this.timeout(100);

		server = child_process.spawn('node', ['src/app'], {
			stdio: ['ignore', 1, 2]
		});
		server.kill('SIGINT');
	});
});
