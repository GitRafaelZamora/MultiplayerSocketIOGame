var RemotePlayer = function( index, game, player, startX, startY ) {
	var x = startX;
	var y = startY;

	this.game = game;
	this.player = player;
	this.alive = true;

	this.player = game.add.sprite(32, game.world.height - 150, 'character');

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

RemotePlayer.prototype.move = function( player ) {
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
    if (cursors.up.isDown && 
    	hitPlatform && 
    	player.body.blocked.down) 
    {
        player.body.velocity.y = -380;
    }
}

RemotePlayer.prototype.update = function( ) {
	if (this.player.x !== this.lastPosition.x || 
		this.player.y !== this.lastPosition.y) 
	{
		this.lastPosition.x = this.player.x;
		this.lastPosition.y = this.player.y;
	}
};

window.RemotePlayer = RemotePlayer;