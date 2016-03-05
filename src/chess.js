'use strict';

var Position = require('./position'),
	_ = require('underscore');


/**
 * An enum of possible piece and move types
 */
var Type = {
	None: 0,
	King: 1,
	Queen: 2,
	Rook: 3,
	Bishop: 4,
	Knight: 5,
	Pawn: 6,

	EnPassant: 8,
	Castling: 16,
	Promotion: 32 // For queening, the promotion type is ANDed with this value
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
			color = (code >> 4) & 0b11;
			moved = (code >> 6)? true : false;
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
	 * Simple clearance checking function for parallel, perpendicular, and diagonal moves.
	 *
	 * @private
	 */
	_isClear(board, start, stop){

		// Get a normalized increment between pieces in the line path
		var step = stop.sub(start);
		if(step.x != 0)
			step.x /= Math.abs(step.x);
		if(step.y != 0)
			step.y /= Math.abs(step.y);


		start = start.add(step);
		var i = 0; // Just in case there is invalid data, terminate instead of infinite looping
		while(!start.equals(stop) && i++ <= 8){

			if(board.at(start) !== null)
				return false;

			start = start.add(step);
		}

		return true;
	};


	/**
	 * Determine if the given move is valid. Assumes the positions are valid
	 *
	 * @param {Board} board
	 * @param {Move} move
	 */
	isLegalMove(board, move){

		var possible = this.getMoves(board, move.from);

		for(var i = 0; i < possible.length; i++){
			if(possible[i].equals(move))
				return true;
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

		//assert(pos instanceof Position)

		var self = this;
		var moves = [];


		// Quick validation of a target position for a normal move
		function availableSpot(to){
			if(to.equals(pos)) // Never allow a regular move to the same spot
				return false;

			var at = board.at(to);
			return at === null || at.color !== self.color;
		}

		// Generate positions reachable from the starting point
		function buildPath(stepx, stepy){

			var step = new Position(stepx, stepy);
			var start = pos;
			var spots = [];

			var to = start.add(step);
			while(board.isValidPosition(to)){

				if(availableSpot(to)){
					spots.push(to);
				}

				// Stop at a collision with another piece
				var at = board.at(to);
				if(at !== null){
					break;
				}

				to = to.add(step);
			}

			return spots;
		}

		function isClear(xmin, xmax, y){
			for(var i = xmin; i <= xmax; i++){
				if(board.at(new Position(i, y)) !== null)
				   return false;
			}
			return true;
		}


		function addMove(to, type){
			if(availableSpot(to))
				moves.push(new Move(pos, to, self.color, type));
		}


		// Add spots to which you want to move
		function addNormalSpots(spots){
			_.map(spots, function(to){
				addMove(to);
			})
		}

		// Add position changes
		function addNormalDeltas(deltas){
			addNormalSpots(_.map(deltas, function(d){ return pos.add(d) }));
		}







		if(this.type === Type.King){

			var spots = Position.cartesianProduct([-1, 0, 1], [-1, 0, 1]);

			// Add Basic Moves
			addNormalDeltas(spots);


			// Add castling moves
			// TODO: Ensure castling move does not result in the player going into check
			if(!this.moved){

				var leftCastle = board.at(new Position(0, pos.y));
				var rightCastle = board.at(new Position(7, pos.y));

				if(leftCastle !== null && leftCastle.type === Type.Castle && leftCastle.color === this.color && !leftCastle.moved){
					if(isClear(1, pos.x, pos.y)){
						addMove(new Position(pos.x - 2, pos.y), Type.Castling);
					}
				}

				if(rightCastle !== null && rightCastle.type === Type.Castle && rightCastle.color === this.color && !rightCastle.moved){
					if(isClear(pos.x, 6, pos.y)){
						addMove(new Position(pos.x + 2, pos.y), Type.Castling);
					}
				}

			}
		}
		if(this.type === Type.Rook || this.type === Type.Queen){

			var spots = [].concat(
				buildPath(0, 1),
				buildPath(0, -1),
				buildPath(1, 0),
				buildPath(-1, 0)
			);

			addNormalSpots(spots);

		}
		if(this.type === Type.Bishop || this.type === Type.Queen){

			var spots = [].concat(
				buildPath(1, 1),
				buildPath(-1, -1),
				buildPath(-1, 1),
				buildPath(1, -1)
			);

			addNormalSpots(spots);

		}
		if(this.type === Type.Knight){
			var spots = [].concat(
				Position.cartesianProduct([-1, 1], [-2, 2]),
				Position.cartesianProduct([-2, 2], [-1, 1])
			);

			addNormalDeltas(spots);
		}
		if(this.type === Type.Pawn){


			// The y direction in which this pawn moves
			var dir = this.color == Color.Black? 1 : -1;


			// Add normal single and double moves for pawns
			// TODO: For a double jump, make sure there is no other piece in the way of the pawn moving
			var moveSpots = [];
			if(!this.moved) // Double
				moveSpots.push(pos.add(0, 2*dir));
			moveSpots.push(pos.add(0, dir)); // Single
			for(var i = 0; i < moveSpots.length; i++){
				var spot = moveSpots[i];

				// Only allow if empty
				if(board.at(spot) !== null)
					continue;

				// Queening
				if(spot.y === 0 || spot.y === 7){
					addMove(spot, Type.Promotion | Type.Queen);
					addMove(spot, Type.Promotion | Type.Rook);
					addMove(spot, Type.Promotion | Type.Bishop);
					addMove(spot, Type.Promotion | Type.Knight);
					continue;
				}

				addMove(spot);
			}


			// Add attacking moves
			var attackSpots = [pos.add(1, dir), pos.add(-1, dir)];
			for(var i = 0; i < attackSpots.length; i++){

				var spot = attackSpots[i];

				// En Passant (only valid when there is at least one parent state)
				if(board.parent){

					var adj = new Position(spot.x, pos.y);
					var adjP = board.at(adj)

					if(adjP !== null && adjP.type === Type.Pawn && adjP.color !== this.color){

						// Check that the other pawn just did a double move
						if(board.move.to.equals(adj) && Math.abs(board.move.from.y - board.move.to.y) === 2){
							addMove(spot, Type.EnPassant);
							continue; // This will ensure that en-passant is prefered to a regular movement
						}
					}
				}

				// Regular attack
				if(board.at(spot) === null)
					continue;

				addMove(spot);
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
 *
 * @property {Position} from
 * @property {Position} to
 * @property {Color} color
 * @property {Type} type
 */
class Move {

	/**
	 * Creates a move object
	 *
	 * @param {Position} from the start position of the piece
	 * @param {Position} to the end position of the piece
	 * @param {number} color the color of the player performing the move
	 * @param {number} type
	 *
	 */
	constructor(from, to, color, type){
		if(arguments.length == 1){
			var data = arguments[0];
			from = new Position(data.from);
			to = new Position(data.to);
			color = data.color;
			type = data.type;
		}

		if(!type)
			type = Type.None;

		this.from = from;
		this.to = to;
		this.color = color;
		this.type = type;
	}


	/**
	 * Perform the action of the move on a board. We assume that the move has been validated and is legal
	 */
	perform(board){

		var p = board.at(this.from);


		if(this.type === Type.None){
			// Simple pick and (re)place
			// Handled by the code outside the if statements
		}
		else if(this.type & Type.Promotion !== 0){
			// Promote piece
			var promoType = this.type & 0x111;
			p = new Piece(promoType, p.color, true);
		}
		else if(this.type === Type.EnPassant){
			// Capture
			board.at(new Position(this.to.x, this.from.y), null);
		}
		else if(this.type === Type.Castling){

			var rank = this.from.y;
			var dir = this.to.x - this.from.x;

			var castleFrom, castleTo;

			if(dir < 0){
				castleFrom = new Position(0, rank);
				castleTo = new Position(this.to.x + 1, rank);
			}
			else{
				castleFrom = new Position(7, rank);
				castleTo = new Position(this.to.x - 1, rank);
			}


			var castle = board.at(castleFrom);
			castle.moved = true;
			board.at(castleFrom, null);
			board.at(castleTo, castle);
		}
		else{
			// Throw error?
		}


		// Move the main piece
		p.moved = true;
		board.at(this.from, null);
		board.at(this.to, p);
	}



	equals(other){
		return this.type === other.type
			&& this.from.equals(other.from)
			&& this.to.equals(other.to);
	}



};




/**
 * A collection of pieces
 *
 * @property {Piece[][]} grid an 8x8 array of pieces placed on the board (null indicates no piece)
 * @property {number} turn the color of the player who goes next
 * @property {Board} parent the previous state to this one
 * @property {Move} move the move that was performed to get from the parent to this state
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

		//assert(pos instanceof Position);

		// TODO: Do integer validation

		return pos.y >= 0 && pos.y < this.grid.length && pos.x >= 0 && pos.x < this.grid[pos.y].length;
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


		var old = this.clone();
		old.parent = this.parent;
		old.move = this.move;

		move.perform(this);

		// Switch players
		this.turn = (this.turn == Color.Black) ? Color.White : Color.Black;


		this.parent = old;
		this.move = move;

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
