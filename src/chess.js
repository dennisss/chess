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
 */
class Piece {


	/**
	 *
	 *
	 * @param {number} type the rank of the piece
	 * @param {number} color optional value specifying the color of the piece. if not specified, the type is parsed as a code as returned by code()
	 */
	constructor(type, color){

		if(arguments.length == 1){ // Just given raw piece code
			var code = arguments[0];
			type = code & 0b1111;
			color = code >> 4;
		}

		/**
		 * Whether this component is visible or not
		 *
		 * @name Component#visible
		 * @type Boolean
		 * @default false
		 */
		this.type = type;
		this.color = color;
	};

	/**
	 * A single integer representation of the piece
	 */
	code(){
		return this.type | (this.color << 4);
	};


	/**
	 * Determine if the given move is valid. Assumes the positions are valid
	 *
	 * @param {Board} board
	 * @param {Move} move
	 */
	isLegalMove(board, move){

		if(move.from.equals(move.to)) // Cannot move to the same spot
			return false;



		if(this.type == Type.Pawn){

			// Pawns cannot move horizontally unless attacking
			if(move.from.x != move.to.x)
				return false;

			if(this.color == Color.Black){

				if(move.from.y == 1 && move.to.y == 3) // Allow 2 unit move in default position
					return true;

			}

		}


	};


	/**
	 * Get the available moves for this piece
	 *
	 * @param {Board} board the game state
	 * @param {Position} pos the i,j position on the grid of the peice
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
	 * Serialize the piece. Deserialize by doing "new Peice(other.toJSON())"
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
	 * @param {Position} from the start position of the peice
	 * @param {Position} to the end position of the peice
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

			// Instantiate each peice
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

		// Have black take the first turn
		b.turn = Color.Black;

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
	 * @
	 */
	isValidPosition(pos){
		return !( pos.y < 0 || pos.y >= this.grid.length || pos.x < 0 || pos.x > this.grid[pos.y].length );
	}

	/**
	 * Get the peice at the given position
	 *
	 * @param {Position} pos
	 * @return {Peice|null} a peice or null if an invalid position/no peice at that position
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
		return new Board(this.toJSON());
	}

	/**
	 * Applys the move to the board and returns a new board
	 *
	 */
	apply(move){

		var p = this.at(move.from);

		if(move.color != this.turn) // Not the current player's turn
			return null;

		if(p === null || !this.isValidPosition(move.to)) // Can't move if no peice
			return null;

		if(move.color != p.color) // Can't move someone else's peice
			return null;

		if(!p.isLegalMove(this, move)){
			return null;
		}


		var b = this.clone();

		// Simple pick and place
		// TODO: Handle castling, queening etc.
		var p = b.at(move.from);
		b.at(move.from, null);
		b.at(move.to, p);


		// Switch players
		b.turn = b.turn == Color.Black ? Color.White : Color.Black;

		return b;
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
	 */
	isEndGame(){

		if(!this.inCheck())
			return false;

		var moves = this.getMoves();
		for(var i = 0; i < moves.length; i++){
			var state = this.apply(moves[i]);

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
 * @property {object} white_player the profiles of each player
 * @property {object} black_player the profiles of each player
 */
class Game {

	/**
	 * Creates a new game of chess
	 *
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
