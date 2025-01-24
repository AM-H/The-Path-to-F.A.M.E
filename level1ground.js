class FirstLevelGround {
    constructor(game) {
        this.game = game;
        this.width = gameWorld.width;
        this.height = 70;
        this.x = 0;
        this.y = gameWorld.height-this.height;
    };
    update() {
        
    };
    draw(ctx) {
        ctx.fillStyle = `#282745`;
        ctx.fillRect(this.x,this.y, this.width, this.height);
    };
}