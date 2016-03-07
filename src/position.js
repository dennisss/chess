'use strict';

/**
 * A 2d vector representing a position on the chess board
 *
 * @property {number} x the column coordinate
 * @property {number} y the row coordinate
 */
class Position {

	/**
	 * Makes a new position
	 *
	 *
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(x,y){

		// TODO: Validate that it is validate array and valid numbers
		if(arguments.length == 1){ // Deserialize
			var data = arguments[0];

			if(data instanceof Array){
				x = data[0];
				y = data[1];
			}
			else if(typeof(data) === 'string'){ // Parse alphanumeric
				data = data.toLowerCase();
				x = data.charCodeAt(0) - 'a'.charCodeAt(0);
				y = 8 - parseInt(data.charAt(1));

				console.log(x);
				console.log(y);
			}
		}

		this.x = x;
		this.y = y;
	};


	/**
	 * Add another position to this one
	 *
	 * @param {Position} p
	 */
	add(p){
		if(arguments.length === 2){
			p = new Position(arguments[0], arguments[1]);
		}

		return new Position(this.x + p.x, this.y + p.y);
	};

	/**
	 * Subtract another position from the current
	 *
	 * @param {Position} p
	 */
	sub(p){
		return this.add(new Position(-p.x, -p.y));
	};

	/**
	 * Get the Euclidean distance from the origin
	 *
	 * @return {number}
	 */
	norm(){
		return Math.sqrt(this.x*this.x, this.y*this.y);
	};


	/**
	 * Determine if two positions are equal
	 *
	 * @param {Position} other the position that is being compared
	 * @return {boolean} whether or not they are equal
	 */
	equals(other){
		return this.x == other.x && this.y == other.y;
	};



	static cartesianProduct(a, b){
		var out = [];
		for(var i = 0; i < a.length; i++){
			for(var j = 0; j < b.length; j++){
				out.push(new Position(a[i], b[j]));
			}
		}

		return out;
	}



	toJSON(){
		return [this.x, this.y];
	};


}

module.exports = Position;
