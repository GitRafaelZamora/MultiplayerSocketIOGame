var express = require('express');
var io = require('socket.io');
var http = require('http');
var path=require('path');
var ecstatic = require('ecstatic');

var Player = require('./Player');

var socket;
var players;

var port = process.env.PORT || 8080;

var server = http.createServer( 
	ecstatic({ root: path.resolve(__dirname, '../public') })
	).listen(port, function(err) {
		if (err) {
			throw err;
		}
		init();
});

function init() {
	// Initial an array of players.
	players = [];

	// Initialize a players socket to the game server.
	socket = io.listen( server );

	setEventHandlers();
}

var setEventHandlers = function ( ) {
	// Establishing a connection for all the players.
	socket.sockets.on('connection', onSocketConnection);
}

function onSocketConnection( client ) {
	console.log('New Player Has Connected : ', client.id);

	client.on('disconnect', onClientDisconnect);
	client.on('new player', onNewPlayer);
	client.on('move player', onMovePlayer);
}

function onClientDisconnect( ) {
	console.log('Player Has Disconnected : ', this.id);
	var removePlayer = playerById(this.id);

	if (!removePlayer) {
		console.log(' clientDisconnect Player not found : ', this.id);
		return;
	}

	players.splice(players.indexOf(removePlayer), 1);
	this.broadcast.emit('remove player', {id: this.id});
	console.log("removePlayer");
}

function onNewPlayer( data ) {
	var newPlayer = new Player( data.x , data.y );

	// Giving the player a unique id 
	// corresponding to the clients socket id.
	newPlayer.id = this.id;

	// Tell everyone else that there is a new
	// player on the connecting. 
	this.broadcast.emit('new player', {
		id: newPlayer.id, 
		x: newPlayer.getX(), 
		y: newPlayer.getY() 
	});

	var i;
	var existingPlayer;

	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];

		this.emit('new player', {
			id: existingPlayer.id, 
			x: existingPlayer.getX(), 
			y: existingPlayer.getY() 
		});
	}

	players.push(newPlayer);
}	

function onMovePlayer( data ) {
	var movePlayer = playerById(this.id);
	if (!movePlayer) {
		console.log('Player not found : ', this.id);
		return;
	}
	
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);

	this.broadcast.emit('move player', {
		id: movePlayer.id, 
		x: movePlayer.getX(), 
		y: movePlayer.getY() 
	});
}

function playerById( id ) {
	var i; 

	for (i = 0; i < players.length; i++) {
		if (players[i].id === id) {
			return players[i];
		}
	}
	return false;
}





















