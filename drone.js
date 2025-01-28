class Drone {
    constructor(game) {
        this.game = game;
        this.animator = new Animator(ASSET_MANAGER.getAsset(`./sprites/drone.png`), 0, 0, 50, 50, 4, .2);
        this.x = 960;
        this.y = 500;
        this.velocity = { x: 0, y: 0 };
    }

    update() {
    
    }

    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 25, 25);
    }
}
