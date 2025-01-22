class AzielSeraph {
    constructor(game) {
        this.game = game;
        this.animator = new Animator(ASSET_MANAGER.getAsset(`./sprites/idle.png`), 8, 0, 32, 32, 4, .35);
        this.x = 94;
        this.y = 0;

    };
    update () {
        
    };
    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 25, 25);
    };
};