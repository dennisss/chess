var Chess = require('../src/chess'),
	Position = require('../src/position');

var Move = Chess.Move;

describe('Position', function(){

	it('Verify creating postion as string', function(done){
		var board = new Chess.Board();

		var poscheck = new Position('a5');
		var posknown = new Position(0, 3);

		assert(poscheck.equals(posknown));

		done();
	});

	it('Verify sub', function(done){
		var board = new Chess.Board();

		var poscheck = new Position('a5');
		var posknown = new Position(0, 3);

		var newpos = poscheck.sub(posknown);
		var verifypos = new Position(0, 0);

		assert(newpos.equals(verifypos));

		done();
	});

	it('Verify norm', function(done){
		var board = new Chess.Board();

		var posknown = new Position(0, 2);
		var poscheck = posknown.norm();
		var verifypos = 2;

		assert(poscheck == verifypos);

		done();
	});
});