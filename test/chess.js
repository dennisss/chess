var Chess = require('../src/chess'),
	Position = require('../src/position');

var Move = Chess.Move;

describe('Chess', function(){

	describe('Piece', function(){

		describe('isLegalMove()', function(){

			it('cannot move to the same position', function(){
				var b = Chess.Board.Default();
				var p = b.grid[0][0];

				assert(!p.isLegalMove(b, new Move(new Position(0,0), new Position(0,0))));
			});

			it('a pawn in default position can move two units forward', function(){

				var b = Chess.Board.Default();

				// TODO: Check other side pawns going in the other direction as well
				for(var i = 0; i < 8; i++) {
					var p = b.grid[1][i];
					assert(p.isLegalMove(b, new Move(new Position(i, 1), new Position(i, 3))));
				}
			});

			it.skip('a knight can move from its default position', function(){


			});

		});


	});

	describe('Board', function(){

		it('should be 8x8', function(){

			var b = new Chess.Board();
			assert(b.grid.length == 8);

			for(var i = 0; i < b.length; i++)
				assert(b.grid[i].length == 8);

		});


	});

	describe('Game', function(){





	});



});
