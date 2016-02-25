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

		for(var i = 0; i < 8; i++){

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

		for(var i = 0; i < rowEls.length; i++){
			$el.append(rowEls[i]);
		}




		var self = this;
		$el.click(function(e){

			// Get the clicked cell
			var cell = e.target;
			while(cell !== null){
				if($(cell).hasClass('cell'))
					break;
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

				var move = new Chess.Move(self.activePosition, position, self.me);


				self.updateState(UiState.Pending);

				// Emit the move so that it can be validated by the server
				self.emit('move', move, function(err){

					if(err){
						alert('Invalid Move')
						self.updateState(UiState.Picking);
						return;
					}

					// TODO: Emit it and wait for validation
					var newboard = self.board.apply(move);

					self.board = newboard;
					self.updateBoard();
					self.updateState(UiState.Waiting);

				});
			}

		});


		this.updatePlayer(0);
	}


	/**
	 * Set up the the ui to start playing a game
	 */
	start(board, me){

		this.updatePlayer(me);
		this.updateBoard(board);


		if(this.board.turn == this.me)
			this.updateState(UiState.Picking);
		else
			this.updateState(UiState.Waiting);
	};

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
				var html = p === null? '&nbsp;' : PeiceText[p.color][p.type];

				cell.html(html);
			}
		}
	}

	updateState(s){

		this.state = s;

		for(var i = 0; i < 8; i++){
			for(var j = 0; j < 8; j++){

				var cell = this.cells[i][j];

				var position = cell[0].position;
				var peice = this.board.at(position);


				var moveable = false, moving = false, placeable = false;
				if(this.state == UiState.Picking){
					// Enable all moveable peices
					moveable = peice !== null && peice.color === this.me;
				}
				else if(this.state == UiState.Placing){
					// Highlight the selected peice and enable all possible places to put it

					if(position.equals(this.activePosition))
						moving = true;
					else{

						var activePeice = this.board.at(this.activePosition);
						var m = new Chess.Move(this.activePosition, position, this.me);

						if(activePeice.isLegalMove(this.board, m))
							placeable = true;

					}
				}
				else if(this.state == UiState.Waiting){
					// All pieces should be disabled
				}


				cell.toggleClass('moveable', moveable).toggleClass('moving', moving).toggleClass('placeable', placeable);

			}
		}
	}


	/**
	 * Clear it
	 */
	reset(){
		this.updateBoard(new Chess.Board());
	}








};


module.exports = BoardUi;
