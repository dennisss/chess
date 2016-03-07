var jsdom = require("jsdom");

var BoardUi = require(__src + '/web/scripts/boardUi'),
	Chess = require(__src + '/chess');

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

	it('Board UI doesn\t work for black player when white turn', function(){

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

 describe('getCell()', function(){

 it.skip('get proper value of filled in cell', function () {

 });

 it.skip('get proper value of empty cell', function () {

 });

 it.skip('get proper value of invalid cell', function () {

 });
 });

 describe('animateMove()', function(){

 it.skip('ensure no timeout', function () {

 });
 });

 describe('processMove()', function(){

 it.skip('move is applied', function () {

 });

 it.skip('board is updated', function () {

 });

 it.skip('state is updated', function () {

 });
 });

 describe('reset()', function(){

 it.skip('board that used to be random is now default', function () {

 });

 it.skip('board that used to be default is now still default', function () {

 });
 });*/
});
