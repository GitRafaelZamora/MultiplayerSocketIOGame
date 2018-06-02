var RemotePlayer = function( index, game, player, startX, startY ) {
	var x = startX;
	var y = startY;

	this.game = game;
	this.player = player;
	this.alive = true;

	this.player = game.add.sprite(32, game.world.height - 150, 'enemy');

	this.player.animations.add('left', [0,1,2,3], 10, true);
	this.player.animations.add('right', [5,6,7,8], 10, true);

	
	this.player.anchor.set(0.5);
	this.player.name = index.toString();
	game.physics.enable(this.player, Phaser.Physics.ARCADE);
	this.player.body.gravity.y = 900;
	this.player.body.immovable = true;
	this.player.body.collideWorldBounds = true;
	this.player.scale.setTo(.6,.6);

	this.lastPosition = { x: x, y: y };
}

RemotePlayer.prototype.update = function( ) {
	if (this.player.x !== this.lastPosition.x || this.player.y !== this.lastPosition.y) {
		if (this.player.x < this.lastPosition.x) {
			this.player.play('left');
		} else if (this.player.x > this.lastPosition.x) {
			this.player.play('right');
		} else {
			this.player.animations.stop();
			this.player.frame = 4;
		}
		this.lastPosition.x = this.player.x;
		this.lastPosition.y = this.player.y;
	}
};

window.RemotePlayer = RemotePlayer;