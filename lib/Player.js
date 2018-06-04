var Player = function ( startX , startY ) {
	var x = startX;
	var y = startY;
	var hasBox = false;

	var getX = function() {
		return x;
	}

	var getY = function() {
		return y;
	}

	var setX = function( newX ) {
		x = newX;
	}
 
	var setY = function( newY ) {
		y = newY;
	}

	var collectBox = function( ) {
		hasBox = true;
	}

	var depositBox = function( ) {
		hasBox = false;
	}

	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		collectBox: collectBox,
		depositBox: depositBox
	}
}

module.exports = Player;