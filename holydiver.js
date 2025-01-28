class HolyDiver {
    constructor(game, aziel) {
        this.aziel = aziel;
        this.game = game;
        this.animator = new Animator(ASSET_MANAGER.getAsset(`./sprites/HolyDiver.png`), 0, 0, 32, 32, 8, 0.1);
        this.x = aziel.box.right;
        this.y = aziel.y;
        this.box = new BoundingBox(this.x, this.y, 32,32);
    };

    update() {
        this.x = this.aziel.box.right;
        this.y = this.aziel.y;
    }

    draw(ctx) {
        if (this.game.closeAttack) {
            this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 25, 25);
        }
    }
}