var socket;
var map;
var layer;
var player;
var enemies;
var cursors;
var platforms;
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
}

function onMovePlayer( data ) {
	var movePlayer = playerById(data.id);

	if (!movePlayer) {
		console.log('onMovePlayer Player not Found: ', data.id);
		return;
	}

	movePlayer.player.x = data.x;
	movePlayer.player.y = data.y;
}

function onRemovePlayer( data ) {
	var removePlayer = playerById(data.id);

	if (!removePlayer) {
		console.log('herhehre not found : ', data.id);
		return;
	}

	removePlayer.player.kill();

	enemies.splice(enemies.indexOf(removePlayer), 1);
}

function collectBox(sprite, tile) {
	if (!collector && tile.index !== -1) {
		tile.alpha = 0.2;
		tile.index = 0;
		layer.dirty = true;
		collector = true;
	}
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
	for (var i = 0; i < enemies.length; i++) {
		if (enemies[i].alive) {
			enemies[i].update();
			game.physics.arcade.collide(player, enemies[i].player);
		}
	}
	var hitPlatform = game.physics.arcade.collide(player, layer);
	player.body.velocity.x = 0;
    if (cursors.right.isDown) {
        player.body.velocity.x = 150;
        player.animations.play('right');
    } else if (cursors.left.isDown) {
        player.body.velocity.x = -150;
        player.animations.play('left');
    } else if (cursors.down.isDown) {
        player.body.velocity.y = 150;
    } else {
    	player.animations.stop();
    	player.frame = 4;
    }
    // Jump Mechanics
    if (cursors.up.isDown && hitPlatform && player.body.blocked.down) {
        player.body.velocity.y = -380;
    }

    socket.emit('move player', {id: player.id , x: player.x, y: player.y});
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









