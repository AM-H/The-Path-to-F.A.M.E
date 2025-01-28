class Bullet {
    constructor(game, x, y, facing) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.speed = 400; // Bullet speed
        this.facing = facing;
        
        // Load bullet image
        this.sprite = ASSET_MANAGER.getAsset('./sprites/bullet.png');
        this.width = this.sprite.width;  // Adjust to image dimensions or set manually
        this.height = this.sprite.height;
        
        this.velocity = facing === "right" ? { x: this.speed, y: 0 } : { x: -this.speed, y: 0 };
        this.box = new BoundingBox(this.x, this.y, this.width, this.height);
        this.removeFromWorld = false;
    }

    update() {
        const TICK = this.game.clockTick;

        // Move the bullet
        this.x += this.velocity.x * TICK;

        // Update the bounding box
        this.box = new BoundingBox(this.x, this.y, this.width, this.height);

        // Remove the bullet if it goes out of bounds
        if (this.x < 0 || this.x > this.game.ctx.canvas.width) {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        // Draw the bullet image
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }
}
