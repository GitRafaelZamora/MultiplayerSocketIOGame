var config = {
	type	: Phaser.AUTO,
	width	: 560,
	height	: 1080,
	physics : {
		default	: 'arcade',
		arcade  : {
			gravity : { y : 200 }
		}
	},
	scene : {
		preload : preload,
		create	: create,
		update	: update
	}
};

var game = new Phaser.Game(config);

function preload() {
	this.load.spritesheet('character', 'assets/dude.png', 32, 48);
}

var player;
var facing = "left";
var hozMove = 160;
var vertMove = -120;
var jumpTimer = 0;

function create() {
	this.stage.backgroundColor = '#D3D3D3';

	this.physics.startSystem(Phaser.Physics.ARCADE);

	player = this.add.sprite(2, 2, 'character');

	this.physics.enable(player);

	player.body.collideWorldBounds = true; // MIGHT NEED TO CHANGE.

	player.body.gravity.y = 96;
}

function update() {
	console.log("working");
	player.body.velocity.x = 0;

	if (this.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
		player.body.velocity.x = -hozMove;

		if (facing !== "left") {
			facing = "left";
		}
	} else if (this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
		player.body.velocity.x = hozMove;

		if (facing !== "right") {
			facing = "right";
		}
	}

	if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && player.body.onFloor() && game.time.now > jumpTimer) {
		player.body.velocity.y = vertMove;

		jumpTimer = this.time.now + 650;
	}

	if (facing == "left") {
		player.frame = 1;
	} else {
		player.frame = 0;
	}
}











