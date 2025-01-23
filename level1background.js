class Spaceship {
    constructor(game) {
        this.game = game;
        this.spritesheet = ASSET_MANAGER.getAsset(`./levelBackgrounds/level1_background.png`);
        this.x = 0;
        this.y = 0;
    };
    update() {
        
    };
    draw(ctx) {
        ctx.drawImage(this.spritesheet,0 , 0, gameWorld.width, gameWorld.height);
    };
}