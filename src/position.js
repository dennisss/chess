'use strict';


class Position {

	constructor(x,y){
		if(arguments.length == 1){ // Deserialize
			var data = arguments[0];
			x = data[0];
			y = data[1];
		}

		this.x = x;
		this.y = y;
	};


	add(p){
		return new Position(this.x + p.x, this.y + p.y);
	};

	sub(p){
		return this.add(new Position(-p.x, -p.y));
	};

	norm(){
		return Math.sqrt(this.x*this.x, this.y*this.y);
	};


	equals(other){
		return this.x == other.x && this.y == other.y;
	}


	toJSON(){
		return [this.x, this.y];
	};


}

module.exports = Position;
