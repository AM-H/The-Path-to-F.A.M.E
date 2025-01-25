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
    };
}
class FirstLevelPlatform1{
    constructor(game) {
        this.game = game;
        this.width = gameWorld.width/4;
        this.height = 30;
        this.x = Math.floor(gameWorld.width/8);
        this.y = Math.floor(gameWorld.height/1.3);
        this.box = new BoundingBox(this.x, this.y, this.width, this.height);
    };
    update() {
        
    };
    draw(ctx) {
        ctx.fillStyle = `white`;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
}
class FirstLevelPlatform2{
    constructor(game) {
        this.game = game;
        this.width = gameWorld.width/4;
        this.height = 30;
        this.x = gameWorld.width-(Math.floor(gameWorld.width/8))-this.width;
        this.y = Math.floor(gameWorld.height/1.3);
        this.box = new BoundingBox(this.x, this.y, this.width, this.height);
    };
    update() {
        
    };
    draw(ctx) {
        ctx.fillStyle = `white`;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
}