class FirstLevelGround {
    constructor(game) {
        this.game = game;
        this.width = gameWorld.width;
        this.height = 70;
        this.x = 0;
        this.y = gameWorld.height-this.height;
        this.box = new BoundingBox(this.x, this.y, this.width, this.height);
    };
    update() {
        
    };
    draw(ctx) {
        ctx.fillStyle = `#282745`;
        ctx.fillRect(this.x,this.y, this.width, this.height);

        // Draw collision box
        ctx.strokeStyle = `green`;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
    };
}
class FirstLevelPlatform{
    constructor(game, x, y, width, height) {
        this.game = game;
        //this.width = gameWorld.width/4;
        this.width = width;
        //this.height = 30;
        this.height = height;
        //this.x = Math.floor(gameWorld.width/8);
        this.x = x;
        //this.y = Math.floor(gameWorld.height/1.3);
        this.y = y;
        this.box = new BoundingBox(this.x, this.y, this.width, this.height);
    };
    update() {
        
    };
    draw(ctx) {
        ctx.fillStyle = `#818087`;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw collision box
        ctx.strokeStyle = `green`;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
    };
}
