var USER = require('../src/user');

describe('User', function(){
	it('Can make a user', function(done){
		this.timeout(500);
		var me = new USER();
		done();
	});
});