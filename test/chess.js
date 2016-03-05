var Chess = require('../src/chess'),
	Position = require('../src/position');

var Move = Chess.Move;

describe('Chess', function(){

	describe('Piece', function(){

		describe('isLegalMove()', function(){

			describe('All pieces', function() {

				it('cannot move to the same position', function () {
					var b = Chess.Board.Default();
					var p = b.grid[0][0];

					assert(!p.isLegalMove(b, new Move(new Position(0, 0), new Position(0, 0))));
				});

				it.skip('no piece can invade another piece of the same color\'s spot', function(){

				});
			});

			describe('Special cases', function() {

				describe('Castling', function() {

					it.skip('Rook and King can partake in Castling', function () {

					});

					it.skip('Cannot castle if king is in check', function () {

					});

					it.skip('Cannot castle if king will be in check at any point in the move', function () {

					});

					it.skip('Cannot castle if there are pieces between the king and castle', function () {
						// Actually, this should be redundant if other tests have been implemented properly
					});

					it.skip('Cannot castle if either piece has been moved at any point', function () {
						// 2 ways to check this - if we keep track of all moves, we can check that they've never moved
						// or we can just check that they're each in default locations
					});
				});

				describe('En Passant', function() {
					// If a pawn has moved up 2 spaces then did not move again

					it('works', function(){
						var board = Chess.Board.Default();

						// Place an attacking black pawn
						board.at(new Position(1, 4), new Chess.Piece(Chess.Type.Pawn, Chess.Color.Black));

						// Move the White pawn up two spaces
						board.apply(new Move(new Position(0, 6), new Position(0, 4), Chess.Color.White));

						// The adjacent pawn should be in place (precondition)
						assert(board.at(new Position(0, 4)) !== null);

						// Construct the move
						var enPassant = new Move(new Position(1, 4), new Position(0, 5), Chess.Color.Black, Chess.Type.EnPassant);
						assert(board.at(enPassant.from).isLegalMove(board, enPassant));


						// Perform the move
						assert.equal(board.apply(enPassant), null);

						// The adjacent pawn should be gone
						assert(board.at(new Position(0, 4)) === null);

						// The attacking pawn should have moved up/down
						// TODO

					})

					it.skip('After capture, the attacking pawn moves normally (diagonally)', function(){


					});

					it.skip('After capture,the defending pawn is replaced with an empty square', function(){

					});

					it.skip('Cannot occur if defending pawn has made ANY other move', function(){

					});
				});

				describe('Promotion', function() {
					it.skip('When a pawn reaches the other side,it is requested to be promoted', function(){

					});

					it.skip('Once promoted, the pawn no longer exists and has been replaced', function(){

					});
				});
			});

			describe('Pawns', function() {

				it('a pawn in default position can move two units forward', function () {

					var b = Chess.Board.Default();

					// TODO: Check other side pawns going in the other direction as well
					for (var i = 0; i < 8; i++) {
						var p = b.grid[1][i];
						assert(p.isLegalMove(b, new Move(new Position(i, 1), new Position(i, 3))));
					}
				});

				it.skip('if attacking, a pawn cannot move straight ahead', function(){

				});

				it.skip('if attacking, a pawn can move 1 step diagonally', function(){

				});

				it.skip('a pawn can never move backwards', function(){

				});

				it.skip('a pawn can only move directly forward one step normally', function(){

				});

				it.skip('a pawn cannot move OVER another piece', function(){
					// this should only be relevant when moving from its original location
				});
			});

			describe('Knights', function() {

				it.skip('a knight can move from its default position', function(){
					// does this refer to the face that a knight can move even if no pawns have moved?
				});

				it.skip('a knight cannot move outside of the L shape', function(){

				});

				// a knight CAN move over other pieces.
			});

			describe('Queens', function() {

				it.skip('a queen can only move in a vertical, horizontal, or diagonal line', function(){

				});

				it.skip('a queen cannot move OVER another piece', function(){

				});
			});

			describe('Kings', function() {

				it.skip('a king can move to any directly adjacent location', function(){

				});

				it.skip('a king cannot move OVER another piece', function(){

				});
			});

			describe('Rooks', function() {

				it.skip('a rook can only move in a vertical or either horizontal line', function(){

				});

				it.skip('a rook cannot move OVER another piece', function(){

				});
			});

			describe('Bishops', function() {

				it.skip('a rook can only move in a diagonal line', function(){

				});

				it.skip('a bishop cannot move OVER another piece', function(){

				});
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
