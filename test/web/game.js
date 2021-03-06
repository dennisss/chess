/*
* SRS: 3.1.1.1.1, 3.1.1.1.2, 3.1.1.1.3, 3.1.1.5.1, 3.1.1.5.2
* */


describe('/game', function(){

	var client, second;

	before(function(done){
		makeWindow(function(){
			done();
		})
	});

	beforeEach(function *(){

		this.timeout(10000);

		client = function(){ return global.client.window(hFirst); };
		second = function(){ return global.client.window(hSecond); };



		yield client()
		.url('http://127.0.0.1:8000/r/lobby')
		.setValue('#playerName', 'Player 1').selectByIndex('#experience', 1)
		.click('#btnChooseOp');

		yield client().windowHandleSize({width: 960, height: 1080}).windowHandlePosition( {x: 0, y: 0});


		yield second()
		.url('http://127.0.0.1:8000/r/lobby')
		.setValue('#playerName', 'Player 2').selectByIndex('#experience', 1)
		.click('#btnChooseOp');

		yield second().windowHandleSize({width: 960, height: 1080}).windowHandlePosition({x: 960, y: 0});

		// Make sure it appears in list
		var playertxt = yield client().getText('#availPlayerTable tr.player');
		assert(playertxt.indexOf('Player 2') >= 0);

		yield client().click('#availPlayerTable tr.player');


		// Assert #challengeNotification modal was open

		yield pause(600);
		yield second().click('#challengeAccepted');

		yield pause(600);

		// Click the start game buttons
		//yield client().click('#yourTurnBtn');
		yield second().click('#yourTurnBtn');

	});

	after(function(done){

		endWindow(function(){ done(); });
	});


	it('it can complete a simple game', function *(){

		this.timeout(100000000);

		yield pause(600);
		second().click('#yourTurnBtn');

		// TODO: Add more assertions
		yield pause(600);
		yield second().click('#e2').click('#e3');
		yield pause(600);
		yield client().click('#f7').click('#f5');
		yield pause(600);
		yield second().click('#d1').click('#f3');
		yield pause(600);
		yield client().click('#g8').click('#f6');
		yield pause(600);
		yield second().click('#f3').click('#f5');
		yield pause(600);
		yield client().click('#f6').click('#g8');
		yield pause(600);
		yield second().click('#f1').click('#c4');
		yield pause(600);
		yield client().click('#g7').click('#g6');
		yield pause(600);
		yield second().click('#f5').click('#f7');
		yield pause(600);

		assert.include(yield second().getAttribute('#winNotification','class'), 'in');
		assert.include(yield client().getAttribute('#lossNotification','class'), 'in');
	});

})

