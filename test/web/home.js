/*
 * SRS: 3.1.1.2.1, 3.1.1.2.2, 3.1.1.2.7, 3.1.1.3.1, 3.1.1.3.2,
 * 3.1.1.3.3, 3.1.1.3.4, 3.1.1.3.5, 3.1.1.3.6, 3.1.1.3.7, 3.1.1.3.8,
 * 3.1.1.3.9, 3.1.1.3.10, 3.1.1.3.11,
 * 3.1.1.4.1
 * */

describe('/home', function(){


	it('should be the default page', function *(){

		this.timeout(5000);

		yield client.url('http://127.0.0.1:8000/');
		assert.equal(yield client.getTitle(), 'Friendly Chess');

		var classes = yield client.getAttribute('#first-load-dialog','class');
		assert(classes.indexOf('in') >= 0);

	});

	it('can go to the create room page', function *(){

		this.timeout(100000);

		yield client.url('http://127.0.0.1:8000/home')
		yield pause(200);
		yield client.click('#btnCreateGame');

		var url = yield client.getUrl();
		assert.match(url, /\/create$/);

		var classes = yield client.getAttribute('#room-creation','class');
		assert(classes.indexOf('in') >= 0);

	})





});
