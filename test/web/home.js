
describe('/home', function(){


	it('should be the default page', function *(){

		yield client.url('http://127.0.0.1:8000/');
		assert.equal(yield client.getTitle(), 'Friendly Chess');

		var classes = yield client.getAttribute('#first-load-dialog','class');
		assert(classes.indexOf('in') >= 0);

	});

	it('can go to the create room page', function *(){

		yield client.url('http://127.0.0.1:8000/home').click('#btnCreateGame');

		var url = yield client.getUrl();
		assert.match(url, /\/create$/);

		var classes = yield client.getAttribute('#room-creation','class');
		assert(classes.indexOf('in') >= 0);

	})





});
