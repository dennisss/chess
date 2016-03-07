/*
 * SRS: so many, but the ones that are PRIMARILY tested here are below:
 * 3.1.1.4.10, 3.1.1.4.11, 3.1.1.4.13
 *
 * */

var Chess = require('../src/chess'),
	Position = require('../src/position');

var Move = Chess.Move;


describe('Chess', function(){

	describe('Piece', function(){

		describe('isLegalMove()', function(){

			describe('All pieces', function() {

				it('cannot move to the same position', function () {
					var board = Chess.Board.Default();

					assert(!board.isLegalMove(new Move(new Position(0, 0), new Position(0, 0))));
				});

				it('no piece can invade another piece of the same color\'s spot', function(){

					var board = new Chess.Board();

					// Place an attacking black pawn
					board.at(new Position(0, 5), new Chess.Piece(Chess.Type.Queen, Chess.Color.Black));
					board.at(new Position(0, 6), new Chess.Piece(Chess.Type.Queen, Chess.Color.Black));

					// Make sure you can't move the white pawn forward
					assert(!board.isLegalMove(new Move(new Position(0, 6), new Position(0, 5), Chess.Color.Black)));

					// Make sure you can't move the black pawn forward
					assert(!board.isLegalMove(new Move(new Position(0, 5), new Position(0, 6), Chess.Color.Black)));
				});
			});

			describe('Special cases', function() {

				describe('Castling', function() {

					it('Rook and King can partake in Castling', function(){
						var board = Chess.Board.Default();

						// Clear space for castling
						board.at(new Position(1, 7), null);
						board.at(new Position(2, 7), null);
						board.at(new Position(3, 7), null);

						var leftCastle = board.at(new Position(0, 7));
						var king = board.at(new Position(4,7));

						var castling = new Move(new Position(4,7), new Position(2,7), Chess.Color.White, Chess.Type.Castling);

						assert(board.isLegalMove(castling));

						assert.equal(board.apply(castling), null);

						assert.equal(board.at(new Position(2,7)), king);
						assert.equal(board.at(new Position(3,7)), leftCastle);

					});

					it('Cannot castle if king is in check', function () {
						var board = Chess.Board.Default();

						// Clear space for castling
						board.at(new Position(1, 7), null);
						board.at(new Position(2, 7), null);
						board.at(new Position(3, 7), null);

						// Put king in check by black queen
						var queen = new Chess.Piece(Chess.Type.Queen, Chess.Color.Black, true);
						var queenpos = new Position(4, 6);
						board.at(new Position(4, 6), null);
						board.at(queenpos, queen);

						var leftCastle = board.at(new Position(0, 7));
						var king = board.at(new Position(4,7));

						var castling = new Move(new Position(4,7), new Position(2,7), Chess.Color.White, Chess.Type.Castling);

						assert(!board.isLegalMove(castling));
					});

					it('Cannot castle if king will be in check at any point in the move', function () {
						var board = Chess.Board.Default();

						// Clear space for castling
						board.at(new Position(1, 7), null);
						board.at(new Position(2, 7), null);
						board.at(new Position(3, 7), null);

						// Put king in check by black queen
						var queen = new Chess.Piece(Chess.Type.Queen, Chess.Color.Black, true);
						var queenpos = new Position(1, 6);
						board.at(new Position(1, 6), null);
						board.at(queenpos, queen);

						var leftCastle = board.at(new Position(0, 7));
						var king = board.at(new Position(4,7));

						var castling = new Move(new Position(4,7), new Position(2,7), Chess.Color.White, Chess.Type.Castling);

						assert(!board.isLegalMove(castling));
					});

					it('Cannot castle if there are pieces between the king and castle', function () {
						var board = Chess.Board.Default();

						// Clear space for castling
						board.at(new Position(1, 7), null);
						board.at(new Position(2, 7), null);
						board.at(new Position(3, 7), null);

						// Put king in check by black queen
						var queen = new Chess.Piece(Chess.Type.Pawn, Chess.Color.Black, true);
						var queenpos = new Position(3, 7);
						board.at(new Position(3, 7), null);
						board.at(queenpos, queen);

						var leftCastle = board.at(new Position(0, 7));
						var king = board.at(new Position(4,7));

						var castling = new Move(new Position(4,7), new Position(2,7), Chess.Color.White, Chess.Type.Castling);

						assert(!board.isLegalMove(castling));
					});

					it('Cannot castle if king has been moved at any point', function () {
						// 2 ways to check this - if we keep track of all moves, we can check that they've never moved
						// or we can just check that they're each in default locations
						var board = Chess.Board.Default();

						// Clear space for castling
						board.at(new Position(1, 7), null);
						board.at(new Position(2, 7), null);
						board.at(new Position(3, 7), null);

						var leftCastle = board.at(new Position(0, 7));
						var king = board.at(new Position(4,7));

						king.moved = true;

						var castling = new Move(new Position(4,7), new Position(2,7), Chess.Color.White, Chess.Type.Castling);

						assert(!board.isLegalMove(castling));
					});

					it('Cannot castle if rook has been moved at any point', function () {
						// 2 ways to check this - if we keep track of all moves, we can check that they've never moved
						// or we can just check that they're each in default locations
						var board = Chess.Board.Default();

						// Clear space for castling
						board.at(new Position(1, 7), null);
						board.at(new Position(2, 7), null);
						board.at(new Position(3, 7), null);

						var leftCastle = board.at(new Position(0, 7));
						var king = board.at(new Position(4,7));

						leftCastle.moved = true;

						var castling = new Move(new Position(4,7), new Position(2,7), Chess.Color.White, Chess.Type.Castling);

						assert(!board.isLegalMove(castling));
					});
				});

				describe('En Passant', function() {
					// If a pawn has moved up 2 spaces then did not move again

					it('En Passant is a possible move - this test cases captures all pieces', function(){
						var board = Chess.Board.Default();

						// Place an attacking black pawn
						board.at(new Position(1, 4), new Chess.Piece(Chess.Type.Pawn, Chess.Color.Black));

						// Move the White pawn up two spaces
						board.apply(new Move(new Position(0, 6), new Position(0, 4), Chess.Color.White));

						// The adjacent pawn should be in place (precondition)
						assert(board.at(new Position(0, 4)) !== null);

						// Construct the move
						var enPassant = new Move(new Position(1, 4), new Position(0, 5), Chess.Color.Black, Chess.Type.EnPassant);
						assert(board.isLegalMove(enPassant));

						// Perform the move
						var err = board.apply(enPassant);
						assert.equal(err, null);

						// The adjacent pawn should be gone
						assert(board.at(new Position(0, 4)) === null);
					});

					it('After capture, the attacking pawn moves normally (diagonally)', function(){
						var board = Chess.Board.Default();

						// Place an attacking black pawn
						var blkpawn = new Chess.Piece(Chess.Type.Pawn, Chess.Color.Black)
						board.at(new Position(1, 4), blkpawn);

						// Move the White pawn up two spaces
						board.apply(new Move(new Position(0, 6), new Position(0, 4), Chess.Color.White));

						// The adjacent pawn should be in place (precondition)
						assert(board.at(new Position(0, 4)) !== null);

						// Construct the move
						var enPassant = new Move(new Position(1, 4), new Position(0, 5), Chess.Color.Black, Chess.Type.EnPassant);
						assert(board.isLegalMove(enPassant));

						// Perform the move
						var err = board.apply(enPassant);

						// The adjacent pawn should be gone
						assert(board.at(new Position(0, 5)) != null);
					});

					it('After capture,the defending pawn is replaced with an empty square', function(){
						var board = Chess.Board.Default();

						// Place an attacking black pawn
						board.at(new Position(1, 4), new Chess.Piece(Chess.Type.Pawn, Chess.Color.Black));

						// Move the White pawn up two spaces
						board.apply(new Move(new Position(0, 6), new Position(0, 4), Chess.Color.White));

						// Construct the move
						var enPassant = new Move(new Position(1, 4), new Position(0, 5), Chess.Color.Black, Chess.Type.EnPassant);

						// Perform the move
						var child = board.apply(enPassant);

						// The adjacent pawn should be gone
						assert(board.at(new Position(0, 4)) === null);
					});

					it('Cannot occur if defending pawn has made ANY other move', function(){
						var board = Chess.Board.Default();

						// Place an attacking black pawn
						var blkpawn = new Chess.Piece(Chess.Type.Pawn, Chess.Color.Black);
						board.at(new Position(1, 4), blkpawn);

						// Move the White pawn up two spaces but one at a time
						var whtpwn = new Chess.Piece(Chess.Type.Pawn, Chess.Color.White);
						board.at(new Position(0, 6), whtpwn);
						board.apply(new Move(new Position(0, 6), new Position(0, 5), Chess.Color.White));
						board.apply(new Move(new Position(3, 1), new Position(3, 1), Chess.Color.Black)); // irrelevent move
						board.apply(new Move(new Position(0, 5), new Position(0, 4), Chess.Color.White));

						// Construct the move
						var enPassant = new Move(new Position(1, 4), new Position(0, 5), Chess.Color.Black, Chess.Type.EnPassant);
						assert(!board.isLegalMove(enPassant));
					});
				});

				describe('Promotion', function() {

					it('When a pawn reaches the other side,it is requested to be promoted', function(){
						var board = new Chess.Board();

						var piece = new Chess.Piece(Chess.Type.Pawn, Chess.Color.White, true);
						var pos = new Position(2, 1);

						// Place the pawn down
						board.at(pos, piece);
						board.turn = Chess.Color.White;


						var moves = board.getMoves(pos);

						assert.lengthOf(moves, 4);

						for(var i = 0; i < moves.length; i++){

							var child = board.clone();
							var err = child.apply(moves[i]);

							assert.equal(err, null);

							var p = child.at(new Position(2, 0));

							assert(p !== null);
							assert.equal(p.type, moves[i].type & (~Chess.Type.Promotion));
						}
					});

					it('Once promoted, the pawn no longer exists and has been replaced', function(){
						var board = new Chess.Board();

						var piece = new Chess.Piece(Chess.Type.Pawn, Chess.Color.White, true);
						var pos = new Position(2, 1);

						board.at(pos, piece);
						board.turn = Chess.Color.White;

						var moves = board.getMoves(pos);

						for(var i = 0; i < moves.length; i++){

							var child = board.clone();
							var err = child.apply(moves[i]);

							var oldlocation = child.at(pos);
							assert(oldlocation === null);
						}
					});
				});
			});

			describe('Pawns', function() {

				it('a pawn in default position can move two units forward', function () {

					var board = Chess.Board.Default();

					// Test all the white pawns
					for (var i = 0; i < 8; i++) {
						assert(board.isLegalMove(new Move(new Position(i, 6), new Position(i, 4))));
					}

					// Change the turn to black, then test all the black pawns
					board.turn = Chess.Color.Black;
					for (i = 0; i < 8; i++) {
						assert(board.isLegalMove(new Move(new Position(i, 1), new Position(i, 3))));
					}
				});

				it('if attacking, a pawn cannot move straight ahead', function(){
					var board = Chess.Board.Default();

					// Place an attacking black pawn
					board.at(new Position(0, 5), new Chess.Piece(Chess.Type.Pawn, Chess.Color.Black));
					var b = board.grid[5][0];
					var w = board.grid[6][0];

					// Make sure you can't move the white pawn forward
					assert(!board.isLegalMove(new Move(new Position(0, 6), new Position(0, 5), Chess.Color.White)));

					// Make sure you can't move the black pawn forward
					assert(!board.isLegalMove(new Move(new Position(0, 5), new Position(0, 6), Chess.Color.Black)));
				});

				it('if attacking, a pawn can move 1 step diagonally', function(){

					var board = Chess.Board.Default();
					var w = board.grid[6][3];

					var pawn = new Chess.Piece(Chess.Type.Pawn, Chess.Color.Black, true);
					var pawnpos = new Position(1, 4);

					// Place the pawn down
					board.at(pawnpos, pawn);
					board.turn = Chess.Color.White;

					// Check that white can't attack diagonally two spaces
					assert(!board.isLegalMove(new Move(new Position(3,6), new Position(1,4), Chess.Color.White)));
				});

				it('a pawn can never move backwards', function(){
					var board = Chess.Board.Default();

					// Move a white and black pawn up two spaces
					board.apply(new Move(new Position(0, 6), new Position(0, 4), Chess.Color.White));
					board.apply(new Move(new Position(1, 1), new Position(1, 3), Chess.Color.Black));

					// Test that the white pawn can't move backwards, and that it can still move forward
					assert(!board.isLegalMove(new Move(new Position(0,4), new Position(0,5))));
					assert(board.isLegalMove(new Move(new Position(0,4), new Position(0,3))));

					board.turn = Chess.Color.Black;
					// Test that the black pawn can't move backwards, and that it can still move forward
					assert(!board.isLegalMove(new Move(new Position(1,3), new Position(1,2))));
					assert(board.isLegalMove(new Move(new Position(1,3), new Position(1,4))));

				});

				it('a pawn can only move directly forward one step normally', function(){
					var board = Chess.Board.Default();

					// Move a white and black pawn up two spaces
					board.apply(new Move(new Position(0, 6), new Position(0, 4), Chess.Color.White));
					board.apply(new Move(new Position(1, 1), new Position(1, 3), Chess.Color.Black));

					// Test that the white pawn only move forward one space normally
					assert(!board.isLegalMove(new Move(new Position(0,4), new Position(0,2))));
					assert(board.isLegalMove(new Move(new Position(0,4), new Position(0,3))));

					board.turn = Chess.Color.Black;
					// Test that the black pawn can only move forward once space normally
					assert(!board.isLegalMove(new Move(new Position(1,3), new Position(1,5))));
					assert(board.isLegalMove(new Move(new Position(1,3), new Position(1,4))));
				});

				it('a pawn cannot move OVER another piece', function(){
					// this should only be relevant when moving from its original location
					var board = Chess.Board.Default();
					var w = board.grid[6][0];

					var pawn = new Chess.Piece(Chess.Type.Pawn, Chess.Color.Black, true);
					var pawnpos = new Position(0, 5);

					// Place the pawn down
					board.at(pawnpos, pawn);
					board.turn = Chess.Color.White;

					// Try to move the white pawn over the black pawn that's in the way
					assert(!board.isLegalMove(new Move(new Position(0,6), new Position(0,4), Chess.Color.White)));
				});
			});

			describe('Knights', function() {

				it('a knight can move from its default position', function(){
					// does this refer to the face that a knight can move even if no pawns have moved?
					var board = Chess.Board.Default();

					// Test all four starting positions

					// Test white
					assert(board.isLegalMove(new Move(new Position(1,7), new Position(2,5))));
					assert(board.isLegalMove(new Move(new Position(1,7), new Position(0,5))));

					assert(board.isLegalMove(new Move(new Position(6,7), new Position(5,5))));
					assert(board.isLegalMove(new Move(new Position(6,7), new Position(7,5))));

					board.turn = Chess.Color.Black;
					// Test black
					assert(board.isLegalMove(new Move(new Position(1,0), new Position(2,2))));
					assert(board.isLegalMove(new Move(new Position(1,0), new Position(0,2))));

					assert(board.isLegalMove(new Move(new Position(6,0), new Position(5,2))));
					assert(board.isLegalMove(new Move(new Position(6,0), new Position(7,2))));
				});

				it('a knight cannot move outside of the L shape', function(){
					var board = new Chess.Board();

					// Place a knight in the middle of an empty board.
					board.at(new Position(4, 3), new Chess.Piece(Chess.Type.Knight, Chess.Color.White));

					// Test all spaces adjacent to the knight
					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(3, 2))));
					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(4, 2))));
					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(5, 2))));
					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(3, 3))));
					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(5, 3))));
					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(3, 4))));
					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(4, 4))));
					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(5, 4))));
				});

				// a knight CAN move over other pieces.
			});

			describe('Queens', function() {

				it('a queen can move in a diagonal line', function(){
					var board = new Chess.Board();

					var queen = new Chess.Piece(Chess.Type.Queen, Chess.Color.Black, true);
					var queenpos = new Position(4, 3);

					board.at(queenpos, queen);
					board.turn = Chess.Color.Black;

					var b = board.grid[3][4];

					assert(board.isLegalMove(new Move(new Position(4, 3), new Position(2, 1), Chess.Color.Black)));
				});

				it('a queen can not move in a random position', function(){
					var board = new Chess.Board();

					var queen = new Chess.Piece(Chess.Type.Queen, Chess.Color.Black, true);
					var queenpos = new Position(4, 3);

					board.at(queenpos, queen);
					board.turn = Chess.Color.Black;

					var b = board.grid[3][4];

					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(1, 1), Chess.Color.Black)));
				});

				it('a queen can move horizontally', function(){
					var board = new Chess.Board();

					var queen = new Chess.Piece(Chess.Type.Queen, Chess.Color.Black, true);
					var queenpos = new Position(4, 3);

					board.at(queenpos, queen);
					board.turn = Chess.Color.Black;

					var b = board.grid[3][4];

					assert(board.isLegalMove(new Move(new Position(4, 3), new Position(4, 2), Chess.Color.Black)));
				});

				it('a queen can move vertically', function(){
					var board = new Chess.Board();

					var queen = new Chess.Piece(Chess.Type.Queen, Chess.Color.Black, true);
					var queenpos = new Position(4, 3);

					board.at(queenpos, queen);
					board.turn = Chess.Color.Black;

					var b = board.grid[3][4];

					assert(board.isLegalMove(new Move(new Position(4, 3), new Position(3,3), Chess.Color.Black)));
				});

				it('a queen cannot move OVER another piece', function(){
					var board = new Chess.Board();

					var piece = new Chess.Piece(Chess.Type.Rook, Chess.Color.White, true);
					var piecepos = new Position(4, 3);

					var queen = new Chess.Piece(Chess.Type.Queen, Chess.Color.Black, true);
					var queenpos = new Position(3,3);

					board.at(piecepos, piece);
					board.at(queenpos, queen);
					board.turn = Chess.Color.Black;

					var b = board.grid[3][4];

					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(2, 3), Chess.Color.Black)));
				});
			});

			describe('Kings', function() {

				it('should not have available moves at the start of the game', function(){
					var board = Chess.Board.Default();

					var kingPos = new Position(4,7);
					var king = board.at(kingPos);
					assert(king.type === Chess.Type.King);

					assert.lengthOf(board.getMoves(kingPos), 0);
				});

				it('a king can move to any directly adjacent location', function(){
					var board = new Chess.Board();
					var kingPos = new Position(4,3);

					// Insert a king in the middle of the board
					board.at(kingPos, new Chess.Piece(Chess.Type.King, Chess.Color.White));
					board.turn = Chess.Color.White;
					// There should be exactly 8 adjacent spaces available
					assert.lengthOf(board.getMoves(kingPos), 8);
				});
			});

			describe('Rooks', function() {

				it('a rook can not move in a diagonal line', function(){
					var board = new Chess.Board();

					var rook = new Chess.Piece(Chess.Type.Rook, Chess.Color.Black, true);
					var rookpos = new Position(4, 3);

					board.at(rookpos, rook);
					board.turn = Chess.Color.Black;

					var b = board.grid[3][4];

					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(2, 1), Chess.Color.Black)));
				});

				it('a rook can not move in a random position', function(){
					var board = new Chess.Board();

					var rook = new Chess.Piece(Chess.Type.Rook, Chess.Color.Black, true);
					var rookpos = new Position(4, 3);

					board.at(rookpos, rook);
					board.turn = Chess.Color.Black;

					var b = board.grid[3][4];

					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(1, 1), Chess.Color.Black)));
				});

				it('a rook can move horizontally', function(){
					var board = new Chess.Board();

					var rook = new Chess.Piece(Chess.Type.Rook, Chess.Color.Black, true);
					var rookpos = new Position(4, 3);

					board.at(rookpos, rook);
					board.turn = Chess.Color.Black;

					var b = board.grid[3][4];

					assert(board.isLegalMove(new Move(new Position(4, 3), new Position(4, 2), Chess.Color.Black)));
				});

				it('a rook can move vertically', function(){
					var board = new Chess.Board();

					var rook = new Chess.Piece(Chess.Type.Rook, Chess.Color.Black, true);
					var rookpos = new Position(4, 3);

					board.at(rookpos, rook);
					board.turn = Chess.Color.Black;

					var b = board.grid[3][4];

					assert(board.isLegalMove(new Move(new Position(4, 3), new Position(3,3), Chess.Color.Black)));
				});

				it('a rook cannot move OVER another piece', function(){
					var board = new Chess.Board();

					var piece = new Chess.Piece(Chess.Type.Rook, Chess.Color.White, true);
					var piecepos = new Position(4, 3);

					var rook = new Chess.Piece(Chess.Type.King, Chess.Color.Black, true);
					var rookpos = new Position(3,3);

					board.at(piecepos, piece);
					board.at(rookpos, rook);
					board.turn = Chess.Color.Black;

					var b = board.grid[3][4];

					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(2, 3), Chess.Color.Black)));
				});
			});

			describe('Bishops', function() {

				it('a bishop can move in a diagonal line', function(){
					var board = new Chess.Board();

					var bishop = new Chess.Piece(Chess.Type.Bishop, Chess.Color.Black, true);
					var bishoppos = new Position(4, 3);

					board.at(bishoppos, bishop);
					board.turn = Chess.Color.Black;

					var b = board.grid[3][4];

					assert(board.isLegalMove(new Move(new Position(4, 3), new Position(2, 1), Chess.Color.Black)));
				});

				it('a bishop can not move in a random position', function(){
					var board = new Chess.Board();

					var bishop = new Chess.Piece(Chess.Type.Bishop, Chess.Color.Black, true);
					var bishoppos = new Position(4, 3);

					board.at(bishoppos, bishop);
					board.turn = Chess.Color.Black;

					var b = board.grid[3][4];

					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(1, 1), Chess.Color.Black)));
				});

				it('a bishop can not move horizontally', function(){
					var board = new Chess.Board();

					var bishop = new Chess.Piece(Chess.Type.Bishop, Chess.Color.Black, true);
					var bishoppos = new Position(4, 3);

					board.at(bishoppos, bishop);
					board.turn = Chess.Color.Black;

					var b = board.grid[3][4];

					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(4, 2), Chess.Color.Black)));
				});

				it('a bishop can not move vertically', function(){
					var board = new Chess.Board();

					var bishop = new Chess.Piece(Chess.Type.Bishop, Chess.Color.Black, true);
					var bishoppos = new Position(4, 3);

					board.at(bishoppos, bishop);
					board.turn = Chess.Color.Black;

					var b = board.grid[3][4];

					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(3,3), Chess.Color.Black)));
				});

				it('a bishop cannot move OVER another piece', function(){
					var board = new Chess.Board();

					var piece = new Chess.Piece(Chess.Type.Bishop, Chess.Color.White, true);
					var piecepos = new Position(4, 3);

					var bishop = new Chess.Piece(Chess.Type.King, Chess.Color.Black, true);
					var bishoppos = new Position(3,2);

					board.at(piecepos, piece);
					board.at(bishoppos, bishop);
					board.turn = Chess.Color.Black;

					var b = board.grid[3][4];

					assert(!board.isLegalMove(new Move(new Position(4, 3), new Position(2, 1), Chess.Color.Black)));
				});
			});
		});
	});

	describe('Move', function(){
		// Not sure if needed: it('should have an origin, destination, color, and (optional) type', function(){});
		describe('perform()', function(){
			it.skip('move pieces to empty space and clear the previously occupied space', function(){});
			it.skip('correctly replace pawn during promotion with the user-selected piece', function(){});
			it.skip('removes the pawn passed by en passant', function(){});
			it.skip('correctly moves king and rook in castling', function(){});
		});
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

			// i want to make sure none of the moves the king is allowed to make put him in check.

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

				var moves = board.getMoves(kingpos);

				assert(board.inCheck());

				assert.lengthOf(moves, 6);

				for(var i = 0; i < moves.length; i++){

					var child = board.clone();
					var err = child.apply(moves[i]);

					assert.equal(err, null);

					var p = child.at(kingpos);

					assert(!child.inCheck());
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

				var moves = board.getMoves(kingpos);

				assert.lengthOf(moves, 6);

				for(var i = 0; i < moves.length; i++){

					var child = board.clone();
					var err = child.apply(moves[i]);

					assert.equal(err, null);
					assert(!child.inCheck());
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

				assert(board.inCheck());

				var moves = board.getMoves(kingpos);

				assert.lengthOf(moves, 6);

				for(var i = 0; i < moves.length; i++){
					var child = board.clone();
					var err = child.apply(moves[i]);

					assert.equal(err, null);
					assert(!child.inCheck());
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

				assert(board.inCheck());

				var moves = board.getMoves(kingpos);

				assert.lengthOf(moves, 6);

				for(var i = 0; i < moves.length; i++){

					var child = board.clone();
					var err = child.apply(moves[i]);

					assert.equal(err, null);
					assert(!child.inCheck());
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

				assert(board.inCheck());

				var moves = board.getMoves(kingpos);

				assert.lengthOf(moves, 4); // TODO: verify this is the right size

				for(var i = 0; i < moves.length; i++){

					var child = board.clone();
					var err = child.apply(moves[i]);

					assert.equal(err, null);
					assert(!child.inCheck());
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

				assert(board.inCheck());

				var moves = board.getMoves(kingpos);

				assert.lengthOf(moves, 4); // TODO: verify this is the right size

				for(var i = 0; i < moves.length; i++){

					var child = board.clone();
					var err = child.apply(moves[i]);

					assert.equal(err, null);
					assert(!child.inCheck());
				}
			});

			it('king is in check if rook is in its row', function(){
				var board = new Chess.Board();

				var piece = new Chess.Piece(Chess.Type.Rook, Chess.Color.White, true);
				var piecepos = new Position(2, 1);

				var king = new Chess.Piece(Chess.Type.King, Chess.Color.Black, true);
				var kingpos = new Position(2, 7);

				// Place the pawn down
				board.at(piecepos, piece);
				board.at(kingpos, king);
				board.turn = Chess.Color.Black;

				assert(board.inCheck());

				var moves = board.getMoves(kingpos);

				assert.lengthOf(moves, 4); // TODO: verify this is the right size

				for(var i = 0; i < moves.length; i++){

					var child = board.clone();
					var err = child.apply(moves[i]);

					assert.equal(err, null);

					var p = child.at(kingpos);
					assert(!child.inCheck());
				}
			});

			it('king is in check if rook is in its column', function(){
				var board = new Chess.Board();

				var piece = new Chess.Piece(Chess.Type.Rook, Chess.Color.White, true);
				var piecepos = new Position(1, 2);

				var king = new Chess.Piece(Chess.Type.King, Chess.Color.Black, true);
				var kingpos = new Position(7, 2);

				// Place the pawn down
				board.at(piecepos, piece);
				board.at(kingpos, king);
				board.turn = Chess.Color.Black;

				var moves = board.getMoves(kingpos);

				assert.lengthOf(moves, 4); // TODO: verify this is the right size

				for(var i = 0; i < moves.length; i++){

					var child = board.clone();
					var err = child.apply(moves[i]);

					assert.equal(err, null);

					var p = child.at(kingpos);

					assert(!child.inCheck());
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

			it('detects a simple checkmate to ensure its on the right player', function(){

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
		it.skip('should have one player assigned to white, and one to black', function(){});
		it.skip('should contain a board with pieces in the starting positions', function(){});
		describe('toJSON()', function(){
			it.skip('should return a valid JSON string', function(){});
			it.skip('should contain the serialized board, as well as which player is which color.', function(){});
		});
	});
});
