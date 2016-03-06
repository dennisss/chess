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

				it('no piece can invade another piece of the same color\'s spot', function(){

					var board = new Chess.Board();

					var piece = new Chess.Piece(Chess.Type.Queen, Chess.Color.Black, true);
					var piecepos = new Position(6, 1);

					var king = new Chess.Piece(Chess.Type.King, Chess.Color.Black, true);
					var kingpos = new Position(6, 2);

					// Place the pawn down
					board.at(piecepos, piece);
					board.at(kingpos, king);
					board.turn = Chess.Color.Black;

					var moves = board.getMoves(board, kingpos);

					assert.lengthOf(moves, 7);

					// TODO: should add more checking of what the moves actually are
				});
			});

			describe('Special cases', function() {

				describe('Castling', function() {

					it('works', function(){
						var board = Chess.Board.Default();

						// Clear space for castling
						board.at(new Position(1, 7), null);
						board.at(new Position(2, 7), null);
						board.at(new Position(3, 7), null);

						var leftCastle = board.at(new Position(0, 7));
						var king = board.at(new Position(4,7));

						var castling = new Move(new Position(4,7), new Position(2,7), Chess.Color.White, Chess.Type.Castling);

						assert(king.isLegalMove(board, castling));

						assert.equal(board.apply(castling), null);

						assert.equal(board.at(new Position(2,7)), king);
						assert.equal(board.at(new Position(3,7)), leftCastle);

					});

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

					});

					it.skip('After capture, the attacking pawn moves normally (diagonally)', function(){

					});

					it.skip('After capture,the defending pawn is replaced with an empty square', function(){

					});

					it.skip('Cannot occur if defending pawn has made ANY other move', function(){

					});
				});

				describe('Promotion', function() {

					it('works', function(){
						var board = new Chess.Board();

						var piece = new Chess.Piece(Chess.Type.Pawn, Chess.Color.White, true);
						var pos = new Position(2, 1);

						// Place the pawn down
						board.at(pos, piece);
						board.turn = Chess.Color.White;


						var moves = piece.getMoves(board, pos);

						assert.lengthOf(moves, 4);

						for(var i = 0; i < moves.length; i++){

							var child = board.clone();
							var err = child.apply(moves[i]);

							assert.equal(err, null)

							var p = child.at(new Position(2, 0));

							assert(p !== null);
							assert.equal(p.type, moves[i].type & (~Chess.Type.Promotion));
						}
					})

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

				it('should not have available moves at the start of the game', function(){
					var board = Chess.Board.Default();

					var kingPos = new Position(4,7);
					var king = board.at(kingPos);

					assert(king.type === Chess.Type.King);

					assert.lengthOf(king.getMoves(board, kingPos), 0);
				});

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

	describe('Move', function(){

	});

	describe('Board', function(){

		it('should be 8x8', function(){

			var b = new Chess.Board();
			assert(b.grid.length == 8);

			for(var i = 0; i < b.length; i++)
				assert(b.grid[i].length == 8);

		});

		describe('isValidPosition()',function(){

			it('check locations outside board', function(){
				var board = Chess.Board.Default();

				var piece = new Chess.Piece(Chess.Type.Pawn, Chess.Color.White, true);
				var piecepos = new Position(1,9);
				assert(!board.isValidPosition(piecepos));


				var piecepos1 = new Position(-1,0);
				assert(!board.isValidPosition(piecepos1));
			});
		});

		describe('children()', function(){

			it('has the correct number of moves for the first turn', function(){
				var board = Chess.Board.Default();
				assert.lengthOf(board.children(), 20);
			});
		});

		describe('isOccupied()', function(){

			it('space with piece in it is occupied', function(){
				var board = new Chess.Board();

				var piece = new Chess.Piece(Chess.Type.Pawn, Chess.Color.White, true);
				var piecepos = new Position(2, 2);

				var king = new Chess.Piece(Chess.Type.King, Chess.Color.Black, true);
				var kingpos = new Position(1,1);

				// Place the pawn down
				board.at(piecepos, piece);
				board.at(kingpos, king);
				board.turn = Chess.Color.Black;

				assert(board.isOccupied(kingpos));
				assert(board.isOccupied(piecepos));
			});
		});

		describe('inCheck()', function(){

			it('initial board should not be in check', function(){
				var board = Chess.Board.Default();
				assert(!board.inCheck());
			});

			it('king is in check if pawn is diagonal from it', function(){
				var board = new Chess.Board();

				var piece = new Chess.Piece(Chess.Type.Pawn, Chess.Color.White, true);
				var piecepos = new Position(2, 2);

				var king = new Chess.Piece(Chess.Type.King, Chess.Color.Black, true);
				var kingpos = new Position(1,1);

				// Place the pawn down
				board.at(piecepos, piece);
				board.at(kingpos, king);
				board.turn = Chess.Color.Black;

				assert(board.inCheck());
			});

			it('king is in check if queen is in its diagonal line - left', function(){
				var board = new Chess.Board();

				var piece = new Chess.Piece(Chess.Type.Queen, Chess.Color.White, true);
				var piecepos = new Position(6, 1);

				var king = new Chess.Piece(Chess.Type.King, Chess.Color.Black, true);
				var kingpos = new Position(4, 3);

				// Place the pawn down
				board.at(piecepos, piece);
				board.at(kingpos, king);
				board.turn = Chess.Color.Black;

				var moves = board.getMoves(board, kingpos);

				assert.lengthOf(moves, 4);

				for(var i = 0; i < moves.length; i++){

					var child = board.clone();
					var err = child.apply(moves[i]);

					assert.equal(err, null);

					var p = child.at(kingpos);

					assert(p !== null);
					assert(!board.inCheck());
				}
			});

			it('king is in check if queen is in its diagonal line - right', function(){
				var board = new Chess.Board();

				var piece = new Chess.Piece(Chess.Type.Queen, Chess.Color.White, true);
				var piecepos = new Position(2, 1);

				var king = new Chess.Piece(Chess.Type.King, Chess.Color.Black, true);
				var kingpos = new Position(4, 3);

				// Place the pawn down
				board.at(piecepos, piece);
				board.at(kingpos, king);
				board.turn = Chess.Color.Black;

				var moves = board.getMoves(board, kingpos);

				assert.lengthOf(moves, 4);

				for(var i = 0; i < moves.length; i++){

					var child = board.clone();
					var err = child.apply(moves[i]);

					assert.equal(err, null);

					var p = child.at(kingpos);

					assert(p !== null);
					assert(!board.inCheck());
				}
			});

			it('king is in check if bishop is in its diagonal line - left', function(){
				var board = new Chess.Board();

				var piece = new Chess.Piece(Chess.Type.Bishop, Chess.Color.White, true);
				var piecepos = new Position(6, 1);

				var king = new Chess.Piece(Chess.Type.King, Chess.Color.Black, true);
				var kingpos = new Position(4, 3);

				// Place the pawn down
				board.at(piecepos, piece);
				board.at(kingpos, king);
				board.turn = Chess.Color.Black;

				var moves = board.getMoves(board, kingpos);

				assert.lengthOf(moves, 4);

				for(var i = 0; i < moves.length; i++){

					var child = board.clone();
					var err = child.apply(moves[i]);

					assert.equal(err, null);

					var p = child.at(kingpos);

					assert(p !== null);
					assert(!board.inCheck());
				}
			});

			it('king is in check if bishop is in its diagonal line - right', function(){
				var board = new Chess.Board();

				var piece = new Chess.Piece(Chess.Type.Bishop, Chess.Color.White, true);
				var piecepos = new Position(2, 1);

				var king = new Chess.Piece(Chess.Type.King, Chess.Color.Black, true);
				var kingpos = new Position(4, 3);

				// Place the pawn down
				board.at(piecepos, piece);
				board.at(kingpos, king);
				board.turn = Chess.Color.Black;

				var moves = board.getMoves(board, kingpos);

				assert.lengthOf(moves, 4);

				for(var i = 0; i < moves.length; i++){

					var child = board.clone();
					var err = child.apply(moves[i]);

					assert.equal(err, null);

					var p = child.at(kingpos);

					assert(p !== null);
					assert(!board.inCheck());
				}
			});

			it('king is in check if queen is in its row', function(){
				var board = new Chess.Board();

				var piece = new Chess.Piece(Chess.Type.Queen, Chess.Color.White, true);
				var piecepos = new Position(2, 1);

				var king = new Chess.Piece(Chess.Type.King, Chess.Color.Black, true);
				var kingpos = new Position(2, 7);

				// Place the pawn down
				board.at(piecepos, piece);
				board.at(kingpos, king);
				board.turn = Chess.Color.Black;

				var moves = board.getMoves(board, kingpos);

				assert.lengthOf(moves, 4);

				for(var i = 0; i < moves.length; i++){

					var child = board.clone();
					var err = child.apply(moves[i]);

					assert.equal(err, null);

					var p = child.at(kingpos);

					assert(p !== null);
					assert(!board.inCheck());
				}
			});

			it('king is in check if queen is in its column', function(){
				var board = new Chess.Board();

				var piece = new Chess.Piece(Chess.Type.Queen, Chess.Color.White, true);
				var piecepos = new Position(1, 2);

				var king = new Chess.Piece(Chess.Type.King, Chess.Color.Black, true);
				var kingpos = new Position(7, 2);

				// Place the pawn down
				board.at(piecepos, piece);
				board.at(kingpos, king);
				board.turn = Chess.Color.Black;

				var moves = board.getMoves(board, kingpos);

				assert.lengthOf(moves, 4);

				for(var i = 0; i < moves.length; i++){

					var child = board.clone();
					var err = child.apply(moves[i]);

					assert.equal(err, null);

					var p = child.at(kingpos);

					assert(p !== null);
					assert(!board.inCheck());
				}
			});

			it('king is in check if castle is in its row', function(){
				var board = new Chess.Board();

				var piece = new Chess.Piece(Chess.Type.Castle, Chess.Color.White, true);
				var piecepos = new Position(2, 1);

				var king = new Chess.Piece(Chess.Type.King, Chess.Color.Black, true);
				var kingpos = new Position(2, 7);

				// Place the pawn down
				board.at(piecepos, piece);
				board.at(kingpos, king);
				board.turn = Chess.Color.Black;

				var moves = board.getMoves(board, kingpos);

				assert.lengthOf(moves, 4);

				for(var i = 0; i < moves.length; i++){

					var child = board.clone();
					var err = child.apply(moves[i]);

					assert.equal(err, null);

					var p = child.at(kingpos);

					assert(p !== null);
					assert(!board.inCheck());
				}
			});

			it('king is in check if castle is in its column', function(){
				var board = new Chess.Board();

				var piece = new Chess.Piece(Chess.Type.Castle, Chess.Color.White, true);
				var piecepos = new Position(1, 2);

				var king = new Chess.Piece(Chess.Type.King, Chess.Color.Black, true);
				var kingpos = new Position(7, 2);

				// Place the pawn down
				board.at(piecepos, piece);
				board.at(kingpos, king);
				board.turn = Chess.Color.Black;

				var moves = board.getMoves(board, kingpos);

				assert.lengthOf(moves, 4);

				for(var i = 0; i < moves.length; i++){

					var child = board.clone();
					var err = child.apply(moves[i]);

					assert.equal(err, null);

					var p = child.at(kingpos);

					assert(p !== null);
					assert(!board.inCheck());
				}
			});
		});

		describe('isEndGame()', function(){

			it('is not the endgame for the initial board', function(){

				var board = Chess.Board.Default();

				board.turn = Chess.Color.White;
				assert(!board.isEndGame());

				board.turn = Chess.Color.Black;
				assert(!board.isEndGame());
			});

			it('detects a simple checkmate', function(){

				var board = new Chess.Board();
				board.at(new Position(5, 3), new Chess.Piece(Chess.Type.King, Chess.Color.White));
				board.at(new Position(7, 3), new Chess.Piece(Chess.Type.King, Chess.Color.Black));
				board.at(new Position(7, 7), new Chess.Piece(Chess.Type.Rook, Chess.Color.White));

				board.turn = Chess.Color.White;
				assert(!board.inCheck());
				assert(!board.isEndGame());


				board.turn = Chess.Color.Black;
				assert(board.inCheck());
				assert(board.isEndGame());
			});
		});
	});

	describe('Game', function(){

	});
});