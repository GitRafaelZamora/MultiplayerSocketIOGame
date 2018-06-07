var socket;
var map;
var layer;
var player;
var enemies;
var cursors;
var platforms;
var hitPlatform;
var collector = false;
var height = 560;
var width = 1008;

var game = new Phaser.Game(
	width, height, 
	Phaser.AUTO, 
	'phaser', 
	{ preload: preload, create: create, update: update }
);

$(window).resize(
	function() { 
		window.resizeGame(); 
	} 
);

function resizeGame () {
  var height = window.innerHeight;
  var width = window.innerWidth;
 
  game.width = width;
  game.height = height;
  game.stage.bounds.width = width;
  game.stage.bounds.height = height;
 
  if (game.renderType === 1) {
    game.renderer.resize(width, height);
    Phaser.Canvas.setSmoothingEnabled(game.context, false);
  }
}

function preload() {
	game.load.tilemap('world', 'assets/tilemaps/maps/world_map.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.image('tiles', 'assets/tilemaps/tiles/world_tiles.png');
	game.load.spritesheet('character', 'assets/dude.png', 32, 48);
	game.load.spritesheet('enemy', 'assets/dude.png', 32, 48);
}

function create() {
	socket = io.connect();
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.stage.backgroundColor = '#787878';
	createMap();
	createPlayer();
}

function createMap() {
	map = game.add.tilemap('world');
	map.addTilesetImage('world_tileset', 'tiles');
	map.setCollisionBetween(466, 466, true, 'world_layer');
	map.setCollisionBetween(335, 335, true, 'world_layer');
	map.setTileIndexCallback(179, collectBox, this);
	map.setTileIndexCallback(178, depositBox, this);
	layer = map.createLayer('world_layer');
	layer.resizeWorld();
}

function createPlayer() {
	// creating a new player 
	console.log('createPlayer()');
	player = game.add.sprite(32, game.world.height - 150, 'character');
	player.anchor.set(0.5);
	game.physics.enable(player);
	player.body.gravity.y = 900;
	player.body.collideWorldBounds = true;

	player.animations.add('left', [0,1,2,3], 10, true);
	player.animations.add('right', [5,6,7,8], 10, true);
	player.scale.setTo(.6,.6);

	enemies = [];

	player.bringToTop();

	cursors = game.input.keyboard.createCursorKeys();

	setEventHandlers();
}

var setEventHandlers = function() {
	socket.on('connect', onSocketConnected);
	socket.on('disconnect', onSocketDisconnect);
	socket.on('new player', onNewPlayer);
	socket.on('move player', onMovePlayer);
	socket.on('remove player', onRemovePlayer);
}

function onSocketConnected() {
	console.log('Connected to socket server');

	enemies.forEach( function(enemy) {
		enemy.player.kill();
	});

	enemies = [];

	socket.emit('new player', {x: player.x, y: player.y});
}

function onSocketDisconnect() {
	console.log('Disconnected from socket server');
}

function onNewPlayer( data ) {
	console.log('public New player connected : ', data.id);

	var dupe = playerById(data.id);

	if (dupe) {
		console.log('Duplicate player!');
		return;
	}

	enemies.push(new RemotePlayer(data.id, game, player, data.x, data.y));
	for (var i = 0; i < enemies.length; i++) {
		if (enemies[i].alive) {
			enemies[i].update();
			game.physics.arcade.collide(player, enemies[i]);
		}
	}

	hitPlatform = game.physics.arcade.collide(player, layer);
}

function onMovePlayer( data ) {
	var movePlayer = playerById(data.id);

	if (!movePlayer) {
		console.log('Player not Found: ', data.id);
		return;
	}

	movePlayer.x = data.x;
	movePlayer.y = data.y;
}

function onRemovePlayer( data ) {
	var removePlayer = playerById(data.id);

	if (!removePlayer) {
		console.log('Player not found : ', data.id);
		return;
	}

	removePlayer.player.kill();

	enemies.splice(enemies.indexOf(removePlayer), 1);
}

function collectBox(sprite, tile) {
	console.log('Player has colelcted a box: ');
	console.log(tile);
	console.log(sprite);
	if (!collector && tile.index !== -1) {
		collector = true;
		tile.alpha = 0.2;
		tile.index = 0;
		layer.dirty = true;
	}
	console.log('this');
	console.log(this);
	// socket.emit('collect box', {tile: this});
	return false;
}

function depositBox(sprite, tile) {
	if (collector && tile.index !== -1) {
		tile.alpha = 0.2;
		tile.index = -1;
		layer.dirty = true;
		collector = false;
	}
	return false;
}

function update() {

	player.move();

    socket.emit('move player', {
    	id: player.id, 
    	x: player.x, 
    	y: player.y
    });
}

// Find player by ID
function playerById ( id ) {
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i].player.name === id) {
      return enemies[i]
    }
  }

  return false
}









