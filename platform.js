class Platform{
    constructor(game, x, y, width, height, bColor) {
        this.game = game;
        //this.width = gameWorld.width/4;
        this.width = width;
        //this.height = 30;
        this.height = height;
        //this.x = Math.floor(gameWorld.width/8);
        this.x = x;
        //this.y = Math.floor(gameWorld.height/1.3);
        this.y = y;

        this.bColor = bColor;
        this.removeFromWorld = false;

        this.box = new BoundingBox(this.x, this.y, this.width, this.height, this.bColor);
    };
    update() {
        
    };
    draw(ctx) {
        ctx.fillStyle = this.bColor ||  `#818087`;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw collision box
        if (this.game.debugMode) {
            ctx.strokeStyle = `#03333c`;
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        }
    };
}
