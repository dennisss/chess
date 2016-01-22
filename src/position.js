'use strict';


class Position {

	constructor(x,y){
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



}

module.exports = Position;