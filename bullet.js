class Bullet {
    constructor(game, x, y, facing) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 10; // Bullet width
        this.height = 5; // Bullet height
        this.speed = 400; // Bullet speed
        this.facing = facing; // Direction the bullet is facing
        this.velocity = facing === "right" ? { x: this.speed, y: 0 } : { x: -this.speed, y: 0 };
        this.removeFromWorld = false; // Mark bullets for removal if they go off-screen
    }

    update() {
        const TICK = this.game.clockTick;

        // Move the bullet
        this.x += this.velocity.x * TICK;

        // Mark for removal if out of bounds
        if (this.x < 0 || this.x > this.game.ctx.canvas.width) {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        // Draw the bullet as a rectangle
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
