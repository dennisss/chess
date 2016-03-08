var jsdom = require("jsdom");

var BoardUi = require(__src + '/web/scripts/boardUi'),
	Chess = require(__src + '/chess'),
	Position = require(__src + '/position'),
	Move = Chess.Move;

describe('BoardUi', function(){

	beforeEach(function(done){

		jsdom.env({
			html: '<div class="chessboard"></div>',
			url: 'http://127.0.0.1/',
			scripts: [
				'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js',
				'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js'
			],
			done: function(err, window){
				global.window = window;
				global.document = window.document;
				global.$ = window.$;
				global.location = window.location;

				done(err);
			}
		});

	});

	afterEach(function(done){
		setTimeout(function(){
			delete global.window;
			delete global.document;
			delete global.$;
			delete global.location;
			done();
		}, 0);
	});

	it('Board UI works for white player', function(){

		var $el = $('.chessboard');

		// This will many a bunch of rows and empty cell divs
		var boardUi = new BoardUi($el);

		var board = Chess.Board.Default();

		// Initially draw the board as the white player
		boardUi.start(board, Chess.Color.White);

		// Run through moving a pawn
		assert($('#b2').hasClass('moveable'));
		$('#b2').trigger('click');
		assert($('#b2').hasClass('moving'));

		assert($('#b3').hasClass('placeable'));
		assert($('#b4').hasClass('placeable'));


		$('#b4').trigger('click');
	});

	it('Board UI works for black player', function(){

		var $el = $('.chessboard');

		// This will many a bunch of rows and empty cell divs
		var boardUi = new BoardUi($el);

		var board = Chess.Board.Default();

		// Initially draw the board as the white player
		board.turn = Chess.Color.Black;
		boardUi.start(board, Chess.Color.Black);

		// Run through moving a pawn
		assert($('#b7').hasClass('moveable'));
		$('#b7').trigger('click');
		assert($('#b7').hasClass('moving'));

		assert($('#b6').hasClass('placeable'));
		assert($('#b5').hasClass('placeable'));

		$('#b5').trigger('click');
	});

	it('Board UI doesn\'t work for black player when white turn', function(){

		var $el = $('.chessboard');

		// This will many a bunch of rows and empty cell divs
		var boardUi = new BoardUi($el);

		var board = Chess.Board.Default();

		// Initially draw the board as the white player
		boardUi.start(board, Chess.Color.Black);

		// Run through moving a pawn
		assert(!$('#b7').hasClass('moveable'));
		$('#b7').trigger('click');
		assert(!$('#b7').hasClass('moving'));

		assert(!$('#b6').hasClass('placeable'));
		assert(!$('#b5').hasClass('placeable'));
	});

	describe('getCell()', function() {

		it('Check getcell', function () {

			var $el = $('.chessboard');

			// This will many a bunch of rows and empty cell divs
			var boardUi = new BoardUi($el);

			var board = Chess.Board.Default();

			// Initially draw the board as the white player
			boardUi.start(board, Chess.Color.White);

			var pos = new Position(4, 4);

			var cell = boardUi.getCell(pos);
			assert(cell[0].position.equals(pos));
		});
	});

	describe('animateMove()', function(){

		it('ensure no timeout', function (){

			this.timeout(1000);

			var $el = $('.chessboard');

			// This will many a bunch of rows and empty cell divs
			var boardUi = new BoardUi($el);

			var board = Chess.Board.Default();

			// Initially draw the board as the white player
			boardUi.start(board, Chess.Color.White);

			var move = new Move(new Position('a2'), new Position('a3'), Chess.Color.White);

			boardUi.animateMove(move, function(){});
		});
	});

	describe('processMove()', function(){

		it('ensure no timeout', function (){

			this.timeout(1000);

			var $el = $('.chessboard');

			// This will many a bunch of rows and empty cell divs
			var boardUi = new BoardUi($el);

			var board = Chess.Board.Default();

			// Initially draw the board as the white player
			boardUi.start(board, Chess.Color.White);

			var move = new Move(new Position('a2'), new Position('a3'), Chess.Color.White);

			boardUi.processMove(move, function(){});
		});

		it('move is applied - new position is occupied', function () {

			var $el = $('.chessboard');

			// This will many a bunch of rows and empty cell divs
			var boardUi = new BoardUi($el);

			var board = Chess.Board.Default();

			// Initially draw the board as the white player
			boardUi.start(board, Chess.Color.White);

			var oldpos = new Position('a2');
			var newpos = new Position('a3');

			var move = new Move(oldpos, newpos, Chess.Color.White);

			boardUi.processMove(move, function(){});

			assert(board.isOccupied(newpos));
		});

		it('board is updated - old position is not occupied', function () {

			var $el = $('.chessboard');

			// This will many a bunch of rows and empty cell divs
			var boardUi = new BoardUi($el);

			var board = Chess.Board.Default();

			// Initially draw the board as the white player
			boardUi.start(board, Chess.Color.White);

			var oldpos = new Position('a2');
			var newpos = new Position('a3');

			var move = new Move(oldpos, newpos, Chess.Color.White);

			boardUi.processMove(move, function(){});

			assert(!board.isOccupied(oldpos));
		});
	});

	describe('reset()', function() {

		it('ensure no timeout', function (){

			this.timeout(1000);

			var $el = $('.chessboard');

			// This will many a bunch of rows and empty cell divs
			var boardUi = new BoardUi($el);

			var board = Chess.Board.Default();

			// Initially draw the board as the white player
			boardUi.start(board, Chess.Color.White);

			var move = new Move(new Position('a2'), new Position('a3'), Chess.Color.White);

			boardUi.reset();
		});

		it('board that used to be random is now empty', function () {
			this.timeout(1000);

			var $el = $('.chessboard');

			// This will many a bunch of rows and empty cell divs
			var boardUi = new BoardUi($el);

			var board = Chess.Board.Default();

			// Initially draw the board as the white player
			boardUi.start(board, Chess.Color.White);

			var move = new Move(new Position('a2'), new Position('a3'), Chess.Color.White);
			boardUi.processMove(move, function(){});

			assert(!boardUi.board.equals(new Chess.Board()));
			boardUi.reset();
			assert(boardUi.board.equals(new Chess.Board()));
		});

		it('board that used to be empty is now still empty', function () {
			this.timeout(1000);

			var $el = $('.chessboard');

			// This will many a bunch of rows and empty cell divs
			var boardUi = new BoardUi($el);

			var board = new Chess.Board();

			// Initially draw the board as the white player
			boardUi.start(board, Chess.Color.White);

			assert(boardUi.board.equals(new Chess.Board()));
			boardUi.reset();
			assert(boardUi.board.equals(new Chess.Board()));
		});
	});


	/*
	 describe('submitMove()', function(){

	 it.skip('state gets updated to waiting after move is submitted', function () {

	 });
	 });

	 describe('start()', function(){

	 it.skip('player is updated', function () {

	 });

	 it.skip('player state is updated to waiting', function () {

	 });

	 it.skip('player state is updated to current turn', function () {

	 });
	 });

	 describe('updatePlayer()', function(){

	 it.skip('current player is passed in color', function () {

	 });
	 });

	 describe('updateBoard()', function(){

	 it.skip('features of new board are present', function () {

	 });

	 it.skip('features of old board are not present', function () {

	 });
	 });

	 describe('updateState()', function(){

	 it.skip('state is set to passed in state', function () {

	 });
	 });


	 it.skip('get proper value of empty cell', function () {

	 });

	 it.skip('get proper value of invalid cell', function () {

	 });

	 });*/
});