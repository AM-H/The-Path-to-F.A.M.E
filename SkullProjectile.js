class SkullProjectile {
    constructor(game, x, y, direction) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = 5;
        this.animator = new Animator(ASSET_MANAGER.getAsset(`./sprites/LongRangeGrim.png`), 9, 8, 32, 32, 4, 0.1);
        this.width = 32;
        this.height = 32;
        this.box = new BoundingBox(this.x, this.y, this.width, this.height);
        this.lastBox = this.box; // Add this for collision checking
    }

    update() {
        // Update last bounding box
        this.lastBox = this.box;

        // Update position
        this.x += this.direction.x * this.speed * this.game.clockTick * 60;
        this.y += this.direction.y * this.speed * this.game.clockTick * 60;

        // Update current bounding box
        this.box = new BoundingBox(this.x, this.y, this.width, this.height);

        // Check collisions with all entities
        this.game.entities.forEach(entity => {
            if (entity !== this && entity.box && this.box.collide(entity.box)) {
                // Check if entity is a Platform, Boss, or other enemy type
                if (entity instanceof Platform || entity instanceof Boss) { // add all the boss and minions here
                    this.removeFromWorld = true; // Remove projectile on collision
                }
            }
        });

        // Remove if out of bounds (keep this existing check)
        if (this.x < 0 || this.x > gameWorld.width || this.y < 0 || this.y > gameWorld.height) {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        
        // Draw debug bounding box
        if (this.box) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        }
    }
}