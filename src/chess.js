'use strict';

var Position = require('./position');


/**
 * An enum of possible piece types
 */
var Type = {
	King: 1,
	Queen: 2,
	Rook: 3,
	Bishop: 4,
	Knight: 5,
	Pawn: 6
};

/**
 * Enum of player color
 * Black is on the top (moving down) and white is towards the bottom (moving up)
 */
var Color = {
	White: 1,
	Black: 2
};


/**
 * A single moveable piece placed on a board
 *
 * @property {number} type
 * @property {number} color
 * @property {boolean} moved
 */
class Piece {


	/**
	 * Makes a new peice
	 *
	 * @param {number} type the rank of the piece
	 * @param {number} color value specifying the color of the piece. if not specified, the type is parsed as a code as returned by code()
	 * @param {boolean} moved whether or not the peice has moved from the its default position
	 */
	constructor(type, color, moved){

		if(arguments.length == 1){ // Just given raw piece code
			var code = arguments[0];
			type = code & 0b1111;
			color = code >> 4;
		}

		this.type = type;
		this.color = color;
		this.moved = moved;
	};

	/**
	 * A single byte representation of the piece (0b0MCC TTTT)
	 *
	 * @return {number}
	 */
	code(){
		return this.type | (this.color << 4) | ((this.moved ? 1 : 0) << 6);
	};


	/**
	 * Determine if the given move is valid. Assumes the positions are valid
	 *
	 * @param {Board} board
	 * @param {Move} move
	 */
	isLegalMove(board, move){

		// TODO: Assert that all positions are integer values

		if(move.from.equals(move.to)) // Cannot move to the same spot
			return false;


		// TODO: Handle special moves like castling and queening here





		//// Regular moves : pieces aren't mutated and only one piece is moved
		// For the most part, the logic whitelists moves, so avoid returning false

		// Assert not taking your own piece
		if(board.at(move.to) !== null && board.at(move.to).color === this.color)
			return false;

		var diff = move.from.sub(move.to);


		if(this.type == Type.King){
			if(Math.abs(diff.x) <= 1 && Math.abs(diff.y) <= 1)
				return true;
		}
		if(this.type == Type.Rook || this.type == Type.Queen){

			if(diff.x == 0 || diff.y == 0)
				return true;


			// Check clearance of the path
		}
		if(this.type == Type.Bishop || this.type == Type.Queen){

			// Check that it is diagonal
			if(Math.abs(diff.x) == Math.abs(diff.y))
				return true;


			// Check clearance of the path

		}
		if(this.type == Type.Knight){

			var ax = Math.abs(diff.x), ay = Math.abs(diff.y);

			if((ax == 2 && ay == 1) || (ax == 1 && ay == 2))
				return true;
		}
		if(this.type == Type.Pawn){

			// Forward moves
			if(board.at(move.to) === null){

				// Pawns cannot move horizontally unless attacking
				if(move.from.x != move.to.x)
					return false;

				if(this.color == Color.Black){
					if(move.from.y == 1 && move.to.y == 3) // Allow 2 unit move in default position
						return true;
					else if(move.to.y - move.from.y == 1)
						return true;
				}
				else if(this.color == Color.White){
					if(move.from.y == 6 && move.to.y == 4)
						return true;
					else if(move.from.y - move.to.y == 1)
						return true;
				}
			}
			else{ // Attacking

				if(Math.abs(move.from.x - move.to.x) !== 1)
					return false;

				if(this.color == Color.Black){
					if(move.to.y - move.from.y == 1)
						return true;
				}
				else if(this.color == Color.White){
					if(move.from.y - move.to.y == 1)
						return true;
				}



			}
		}

		return false;

	};


	/**
	 * Get the available moves for this piece
	 *
	 * @param {Board} board the game state
	 * @param {Position} pos the i,j position on the grid of the piece
	 * @return {Move[]}
	 */
	getMoves(board, pos){

		var moves = [];

		for(var i = 0; i < board.grid.length; i++){
			for(var j = 0; j < board.grid[i].length; j++){
				var p = new Position(j, i);
				var m = new Move(pos, p);
				if(this.isLegalMove(board, m))
					moves.push(m);
			}
		}

		return moves;
	};



	/**
	 * Serialize the piece. Deserialize by doing "new Piece(other.toJSON())"
	 *
	 * @returns {number}
	 */
	toJSON(){
		return this.code();
	};


};


/**
 * A move from one position on the board to another
 */
class Move {

	/**
	 * Creates a move object
	 *
	 * @param {Position} from the start position of the piece
	 * @param {Position} to the end position of the piece
	 * @param {number} color the color of the player performing the move
	 *
	 */
	constructor(from, to, color){
		if(arguments.length == 1){
			var data = arguments[0];
			from = new Position(data.from);
			to = new Position(data.to);
			color = data.color;
		}

		this.from = from;
		this.to = to;
		this.color = color;
	}



};




/**
 * A collection of pieces
 *
 * @property {Piece[][]} grid an 8x8 array of pieces placed on the board (null indicates no piece)
 * @property {number} turn the color of the player who goes next
 */
class Board {

	/**
	 * Create an empty chess board
	 *
	 * @param data options serialized form to use to build
	 */
	constructor(data){

		// Deserialize it
		if(arguments.length == 1){

			// Instantiate each piece
			for(var i = 0; i < data.grid.length; i++){
				for(var j = 0; j < data.grid[i].length; j++){
					if(data.grid[i][j])
						data.grid[i][j] = new Piece(data.grid[i][j]);
					else
						data.grid[i][j] = null;
				}
			}

			this.grid = data.grid;
			this.turn = data.turn;

			return;
		}



		// Create an empty board
		this.grid = [];
		for(var i = 0; i < 8; i++){
			var row = [];
			for(var j = 0; j < 8; j++){
				row.push(null);
			}
			this.grid.push(row);
		}

		this.turn = -1;
	};

	/**
	 * Create the default start of game board
	 *
	 * @return {Board} the created board
	 */
	static Default(){

		var b = new Board();

		// Fill in the default pieces (top black, bottom white)
		var order = [ Type.Rook, Type.Knight, Type.Bishop, Type.Queen, Type.King, Type.Bishop, Type.Knight, Type.Rook ]; // The ordering of the back rows
		for(var i = 0; i < 8; i++){
			b.grid[0][i] = new Piece(order[i], Color.Black);
			b.grid[1][i] = new Piece(Type.Pawn, Color.Black);
			// Empty in the middle
			b.grid[6][i] = new Piece(Type.Pawn, Color.White);
			b.grid[7][i] = new Piece(order[i], Color.White);
		}

		// Have white take the first turn
		b.turn = Color.White;

		return b;
	};


	/**
	 * Determines whether or not a position has a piece in it
	 *
	 * @param {Position} pos
	 * @returns {boolean}
     */
	isOccupied(pos){
		return this.at(pos) !== null;
	}

	/**
	 * Serialize the board. The board can be recreated by doing "new Board(other.toJSON())"
	 *
	 * @returns {number[][]}
	 */
	toJSON(){
		return {
			grid: this.grid,
			turn: this.turn
		};
	};


	/**
	 * Determine if the position is valid in the board
	 *
	 * @param {Position} pos
	 */
	isValidPosition(pos){
		return !( pos.y < 0 || pos.y >= this.grid.length || pos.x < 0 || pos.x > this.grid[pos.y].length );
	}

	/**
	 * Get the piece at the given position
	 *
	 * @param {Position} pos
	 * @return {Piece|null} a piece or null if an invalid position/no piece at that position
	 */
	at(pos, value){

		// Check out of bounds
		if(!this.isValidPosition(pos))
			return null;


		if(arguments.length == 2){
			this.grid[pos.y][pos.x] = value;
		}

		return this.grid[pos.y][pos.x];
	};


	/**
	 * Get an identical copy of the board
	 */
	clone(){
		return new Board(JSON.parse(JSON.stringify(this.toJSON())));
	}

	/**
	 * Applys the move to the current board
	 *
	 * @param {Move} move
	 * @return {string} an error message if the apply failed
	 */
	apply(move){

		var p = this.at(move.from);

		if(move.color != this.turn){ // Not the current player's turn
			return 'Not the player\'s turn';
		}

		if(p === null || !this.isValidPosition(move.to)){ // Can't move if no piece
			return 'Can\'t move if no piece';
		}

		if(move.color != p.color){ // Can't move someone else's piece
			return 'Can\' move someone else\'s peice';
		}

		if(!p.isLegalMove(this, move)){
			return 'Not a legal move';
		}


		// Simple pick and place
		// TODO: Handle castling, queening etc.
		var p = this.at(move.from);
		this.at(move.from, null);
		this.at(move.to, p);


		// Switch players
		this.turn = (this.turn == Color.Black) ? Color.White : Color.Black;

		return null;
	}

	/**
	 * Determine if the current player is being checked (at the least)
	 */
	inCheck() {
		// Get all available moves for the opponent

		// Determine if a king of the current player can be taken
			// If so, mark that the game is in check


	};


	/**
	 * Get all available moves for the given player
	 *
	 * @param {number} color the color of the player (or null if moves for the current player should be found)
	 * @return {Move[]}
	 */
	getMoves(color) {

		if(arguments.length == 0)
			color = this.turn;


		var moves = [];

		for(var i = 0; i < this.grid.length; i++){
			for(var j = 0; j < this.grid[i].length; j++){
				var pos = new Position(j, i);
				var pc = this.at(pos);

				if(pc !== null && pc.color === color){
					var ms = pc.getMoves(this, pos);
					for(var k = 0; k < ms.length; k++)
						moves.push(ms[k]);
				}
			}
		}

		return moves;
	};



	/**
	 * Determine if the game is in checkmate (the current player lost)
	 *
	 * @return {boolean} whether or not the current player lost
	 */
	isEndGame(){

		if(!this.inCheck())
			return false;

		var moves = this.getMoves();
		for(var i = 0; i < moves.length; i++){
			var state = this.clone();
			state.apply(moves[i]);

			if(!state.inCheck())
				return false;
		}

		return true;
	}

	isDraw(){

	}

}


/**
 * A game of chess
 *
 * @property {Board} board
 * @property {User} white_player the profiles of each player
 * @property {User} black_player the profiles of each player
 * @property {Array.<Board>} history all previous states of the game
 */
class Game {

	/**
	 * Creates a new game of chess
	 *
	 * @param {User} white_player
	 * @param {User} black_player
	 * @example
	 * var game = new Game({ id: '', name: 'Bob' }, { id: '', name: 'John' });
	 */
	constructor(white_player, black_player){

		if(arguments.length == 1){
			var data = arguments[0];
			this.board = new Board(data.board);
			this.white_player = data.white_player;
			this.black_player = data.black_player;

			return;
		}


		this.board = Board.Default();
		this.white_player = white_player;
		this.black_player = black_player;
	};



	toJSON(){
		return {
			board: this.board,
			white_player: this.white_player,
			black_player: this.black_player
		};
	};



};



module.exports = {
	Type: Type,
	Color: Color,
	Piece: Piece,
	Board: Board,
	Game: Game,
	Move: Move
};
