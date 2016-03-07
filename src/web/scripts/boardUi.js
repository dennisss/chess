'use strict';

var Chess = require('../../chess'),
	Position = require('../../position'),
	EventEmitter = require('events');



var PeiceText = {};

PeiceText[Chess.Color.White] = {
	1: '&#9812;', // King
	2: '&#9813;', // Queen
	3: '&#9814;', // Rook
	4: '&#9815;', // Bishop
	5: '&#9816;', // Knight
	6: '&#9817;' // Pawn
};

PeiceText[Chess.Color.Black] = {
	1: '&#9818;', // King
	2: '&#9819;', // Queen
	3: '&#9820;', // Rook
	4: '&#9821;', // Bishop
	5: '&#9822;', // Knight
	6: '&#9823;' // Pawn
};



/**
 * States in which the UI can be when playing on a board
 *
 * @enum {number}
 */
var UiState = {
	/** No game is being played */
	None: 0,
	/** The current user needs to pick out a piece */
	Picking: 1,
	/** The current user has picked a peice and must choose a location to move */
	Placing: 2,
	/** After placing, the the move is waiting for validation */
	Pending: 3,
	/** Waiting for the opponent to make a move  */
	Waiting: 4
};



/**
 * Board Manipulation UI Component
 *
 * @property {UiState} state
 * @property {Board} board
 */
class BoardUi extends EventEmitter {

	constructor($el){
		super();

		this.state = UiState.None;

		this.root = $el;

		// Contains a 2d array of cell elements
		this.cells = [];

		var rowEls = [];

		var i;
		for(i = 0; i < 8; i++){

			var row = [];
			var rowEl = $('<div class="row"></div>');

			for(var j = 0; j < 8; j++){

				var dark = (i + j) % 2 !== 0;

				var cell = $('<div class="cell">&nbsp</div>').toggleClass('light', !dark).toggleClass('dark', dark);

				row.push(cell);
				rowEl.append(cell);
			}

			this.cells.push(row);
			rowEls.push(rowEl);
		}

		for(i = 0; i < rowEls.length; i++){
			$el.append(rowEls[i]);
		}




		var self = this;
		$el.click(function(e){

			// Get the clicked cell
			var cell = e.target;
			while(cell !== null){
				if($(cell).hasClass('cell'))
					break;

				cell = cell.parentNode;
			}

			if(cell === null)
				return;


			var $cell = $(cell);
			var position = cell.position;


			if(self.state == UiState.Picking){
				if(!$cell.hasClass('moveable'))
					return;


				self.activePosition = position;

				self.updateState(UiState.Placing);
			}
			else if(self.state == UiState.Placing){
				if(!$cell.hasClass('placeable')){
					self.updateState(UiState.Picking); // If clicking outside an allowed cell, cancel the picking
					return;
				}


				var possible = self.board.getMoves(self.activePosition);

				// Get all the moves that can happen at this target position
				var options = [];
				for(var i = 0; i < possible.length; i++){
					if(possible[i].to.equals(position))
						options.push(possible[i]);
				}

				if(options.length === 0){
					alert('Failed to move here, please try again');
					self.updateState(UiState.Picking);
					return;
				}
				else if(options.length == 1){
					var move = options[0];
					self._submitMove(move);
				}
				else if(options.length > 1){
					// Ask for user to pick which move to do
					// This should only happen for queening/promotion
					self.emit('chooseMove', options, function(move){
						self._submitMove(move);
					});
				}
			}

		});


		this.updatePlayer(0);

		this.root.css('opacity', 1);
	}

	/**
	 * Gets a move ready to be submitted to the server (sent back to the BoardUi host page to do that)
	 *
	 * @private
	 */
	_submitMove(move){
		var self = this;

		this.updateState(UiState.Pending);


		// Emit the move so that it can be validated by the server
		this.emit('move', move, function(err){

			if(err){
				alert(err);
				self.updateState(UiState.Picking);
				return;
			}


			self.board.apply(move);
			self.updateState(); // Show move trace
			self.animateMove(move, function(){
				self.updateBoard();
				self.updateState(UiState.Waiting);

			});

		});


	}


	/**
	 * Set up the the ui to start playing a game
	 */
	start(board, me){

		this.updatePlayer(me);
		this.updateBoard(board);

		if(this.board.turn == this.me) {
			this.updateState(UiState.Picking);
		}
		else {
			this.updateState(UiState.Waiting);
			$("#waitingTurn").modal("show");
		}
	}

	/**
	 * Sets which color player is using this board
	 */
	updatePlayer(color){

		this.me = color;

		var flipped = color == Chess.Color.Black;

		for(var i = 0; i < 8; i++){
			for(var j = 0; j < 8; j++){

				var pos;
				if(flipped)
					pos = new Position(7 - j, 7 - i);
				else
					pos = new Position(j, i);

				this.cells[i][j][0].position = pos;


				// a,b,c,d, goes along x to the right
				// 8,7,6,5
				var col = String.fromCharCode('a'.charCodeAt(0) + pos.x);
				var row = '' + (8 - pos.y);
				this.cells[i][j][0].id = col + row;
			}
		}
	}





	/**
	 * Make the UI look like the given board
	 */
	updateBoard(newBoard){
		if(arguments.length == 1){
			this.board = newBoard;
		}

		var board = this.board;

		for(var i = 0; i < 8; i++){
			for(var j = 0; j < 8; j++){

				var cell = this.cells[i][j];
				var p = board.at(cell.get(0).position);
				var html = p === null? '&nbsp;' : ('<div>' + PeiceText[p.color][p.type] + '</div>');

				cell.html(html);
			}
		}
	}

	updateState(s){

		if(arguments.length === 1)
			this.state = s;

		for(var i = 0; i < 8; i++){
			for(var j = 0; j < 8; j++){

				var cell = this.cells[i][j];

				var position = cell[0].position;
				var peice = this.board.at(position);


				var moveable = false, moving = false, placeable = false, recent = false;
				if(this.state == UiState.Picking){
					// Enable all moveable peices
					moveable = peice !== null && peice.color === this.me;
				}
				else if(this.state == UiState.Placing){
					// Highlight the selected peice and enable all possible places to put it

					if(position.equals(this.activePosition))
						moving = true;
					else{

						var options = this.board.getMoves(this.activePosition);

						var hasmove = false;
						for(var k = 0; k < options.length; k++){
							if(options[k].to.equals(position)){
								hasmove = true;
								break;
							}
						}

						// TODO: This will call getMoves for each position (which is slow)
						if(hasmove)
							placeable = true;

					}
				}
				else if(this.state == UiState.Waiting){
					// All pieces should be disabled
				}


				// See if this position was just used in a move
				if(this.board.move && (position.equals(this.board.move.to) || position.equals(this.board.move.from)))
				   recent = true;

				cell.toggleClass('recent', recent).toggleClass('moveable', moveable).toggleClass('moving', moving).toggleClass('placeable', placeable);

			}
		}
	}


	/**
	 * Get the cell element at a given position
	 */
	getCell(pos){
		for(var i = 0; i < 8; i++){
			for(var j = 0; j < 8; j++){
				if(pos.equals(this.cells[i][j][0].position))
					return this.cells[i][j];
			}
		}

		return null;
	}


	/**
	 * Animate a move being done. What more is there to say
	 *
	 * @param {Move} move
	 * @param callback called when the move is done being animated
	 */
	animateMove(move, callback){

		// Movement animation
		var fromC = this.getCell(move.from).children().first();
		var toC = this.getCell(move.to);

		var orig = fromC.offset(), targ = toC.offset();
		fromC
		.css('top', (targ.top - orig.top) + 'px')
		.css('left', (targ.left - orig.left) + 'px');

		$(fromC).one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', callback);
	}

	/**
	 * Process a move that was received (should be called when a move is received from the server)
	 *
	 * @param {Move} move
	 */
	processMove(move){
		var self = this;

		this.board.apply(move);
		this.updateState(); // Show move trace
		this.animateMove(move, function(){
			self.updateBoard();
			self.updateState(UiState.Picking);
		});
	}



	/**
	 * Clear it
	 */
	reset(){
		this.updateBoard(new Chess.Board());
	}








}


module.exports = BoardUi;
