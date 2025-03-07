class LevelTransition {
    constructor(game) {
        this.game = game;
        this.animator = new Animator(ASSET_MANAGER.getAsset(`./levelBackgrounds/transitionScreen.png`), 0, 128, 1024, 768, 4, 1);
        this.startTime = 0;
        this.endTime = 4; // 4 seconds needed for countdown
        this.removeFromWorld = false;
    }
    update() {
        this.startTime+=this.game.clockTick;
        if (this.startTime >= this.endTime) {
            this.removeFromWorld = true;
        }
    };
    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, 0, 0, 1);
    };
}