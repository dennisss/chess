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
			type = code | 0b1111;
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
	 * Determine if the given move is valid
	 *
	 * @param board
	 * @param {Position} from
	 * @param {Position} to
	 */
	isLegalMove(board, from, to){

		if(from.x == to.x && from.y == to.y) // Cannot move to the same spot
			return false;



		if(this.type == Type.Pawn){

			// Pawns cannot move horizontally unless attacking
			if(from.x != to.x)
				return false;

			if(this.color == Color.Black){

				if(from.y == 1 && to.y == 3) // Allow 2 unit move in default position
					return true;

			}

		}


	};


	/**
	 * Get the available moves for this piece
	 *
	 * @param {Board} board the game state
	 * @param {Position} pos the i,j position on the grid
	 * @return {Position[]}
	 */
	getMoves(board, pos){

		var moves = [];

		for(var i = 0; i < board.grid.length; i++){
			for(var j = 0; j < board.grid[i].length; j++){
				var p = new Position(j, i);
				if(this.isLegalMove(board, pos, p))
					moves.push(p);
			}
		}

		return moves;
	};



	/**
	 * Serialize the piece
	 *
	 * @returns {number}
	 */
	toJSON(){
		return this.code();
	};


};



/**
 * A collection of pieces
 *
 * @property {Piece[][]} grid an 8x8 array of pieces placed on the board (null indicates no piece)
 */
class Board {

	/**
	 * Create an empty chess board
	 */
	constructor(){

		// Create an empty board
		this.grid = [];
		for(var i = 0; i < 8; i++){
			var row = [];
			for(var j = 0; j < 8; j++){
				row.push(null);
			}
			this.grid.push(row);
		}
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

		return b;
	};


	/**
	 * Determines whether or not a position has a piece in it
	 *
	 * @param {Position} pos
	 * @returns {boolean}
     */
	isOccupied(pos){
		return this.grid[pos.y][pos.x] !== null;
	}

	/**
	 * Serialize the board
	 *
	 * @returns {number[][]}
	 */
	toJSON(){
		return this.grid.toJSON();
	};


}


/**
 * A game of chess
 *
 * @property {Board} board
 */
class Game {

	/**
	 * Creates a new game of chess
	 */
	constructor(){
		this.board = Board.Default();
	};





};



module.exports = {
	Type: Type,
	Color: Color,
	Piece: Piece,
	Board: Board,
	Game: Game
};