// class Bullet {
//     constructor(game, x, y) {
//         this.game = game;
//         this.x = x;
//         this.y = y;
//         this.speed = 400; // Bullet speed
//         this.facing = facing;
//
//         // Load bullet image
//         this.sprite = ASSET_MANAGER.getAsset('./sprites/bullet.png');
//         this.width = this.sprite.width;  // Adjust to image dimensions or set manually
//         this.height = this.sprite.height;
//
//         this.velocity = facing === "right" ? { x: this.speed, y: 0 } : { x: -this.speed, y: 0 };
//         this.box = new BoundingBox(this.x, this.y, this.width, this.height);
//         this.removeFromWorld = false;
//     }
//
//     update() {
//         const TICK = this.game.clockTick;
//
//         // Move the bullet
//         this.x += this.velocity.x * TICK;
//
//         // Update the bounding box
//         this.box = new BoundingBox(this.x, this.y, this.width, this.height);
//
//         // Remove the bullet if it goes out of bounds
//         if (this.x < 0 || this.x > this.game.ctx.canvas.width) {
//             this.removeFromWorld = true;
//         }
//     }
//
//     draw(ctx) {
//         // Draw the bullet image
//         ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
//     }
// }

class Bullet {
    constructor(game, x, y, angle) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.speed = 200; // Bullet speed
        this.angle = angle; // Direction of the bullet

        this.sprite = ASSET_MANAGER.getAsset(getAssetPath('sprites/bullet.png'));
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


        const player = this.game.entities.find(entity => entity instanceof AzielSeraph);

        if (player) {
            if (this.box.collide(player.box)) {
                this.removeFromWorld = true; // Remove bullet on collision
                //player.takeDamage();
            }
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
    }
}
