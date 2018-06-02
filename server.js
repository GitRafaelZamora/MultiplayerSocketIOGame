var express = require('express');
var socket = require('socket.io');

var app = express( );

var server = app.listen(4000, function() {
	console.log('listening to request on port : 4000');
});

app.use(express.static('public'));

// Socket Setup
var io = socket( server );

io.on('connection', function( socket ) {
	console.log('new player socket id : ' , socket.id);
	// client events
	socket.on('newPlayer', function( data ) {
		console.log('new player 2');
		io.sockets.emit('newPlayer', data);
	});
});