class Spaceship {
    constructor(game) {
        this.game = game;
        const backgroundPath = getAssetPath('levelBackgrounds/level1_background.png');
        this.spritesheet = ASSET_MANAGER.getAsset(backgroundPath);
        this.x = 0;
        this.y = 0;
    };
    update() {
        
    };
    draw(ctx) {
        if (this.spritesheet) {
            ctx.drawImage(this.spritesheet, 0, 0, gameWorld.width, gameWorld.height);
        }
    };
}