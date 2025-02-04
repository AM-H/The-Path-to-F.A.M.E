class Background {
    constructor(game, x, y, width, height, path) {
        this.game = game;
        this.spritesheet = ASSET_MANAGER.getAsset(path);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    };
    update() {
        
    };
    draw(ctx) {
        ctx.drawImage(this.spritesheet, this.x , this.y, this.width, this.height);
    };
}