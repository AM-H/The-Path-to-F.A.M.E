class Bullet {
    constructor(game, x, y, angle) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.speed = 200; // Bullet speed
        this.angle = angle; // Direction of the bullet

        this.sprite = ASSET_MANAGER.getAsset(`./sprites/bullet.png`);
        this.width = this.sprite.width;  // Adjust to image dimensions or set manually
        this.height = this.sprite.height;

        // Calculate velocity based on angle
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: Math.sin(this.angle) * this.speed
        };

        this.box = new BoundingBox(this.x, this.y, this.width, this.height);
        this.removeFromWorld = false;
    }

    update() {
        const TICK = this.game.clockTick;

        // Move the bullet
        this.x += this.velocity.x * TICK;
        this.y += this.velocity.y * TICK;

        // Update the bounding box
        this.box = new BoundingBox(this.x, this.y, this.width, this.height);


        let player = this.game.entities.find(e => e instanceof AzielSeraph || e instanceof Grim || e instanceof Kanji);
        if (player && this.box.collide(player.box)) {
            player.takeDamage(10);
            this.removeFromWorld = true;
        }


        // We remove the bullet if it goes out of bounds
        if (
            this.x < 0 ||
            this.x > this.game.ctx.canvas.width ||
            this.y < 0 ||
            this.y > this.game.ctx.canvas.height
        ) {
            this.removeFromWorld = true;
        }


    }

    draw(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);

        if (this.game.debugMode) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        }
    }
}
