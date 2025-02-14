class SkullProjectile {
    constructor(game, x, y, direction, playerVelocity = { x: 0, y: 0 }) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = 350; 
        
        this.velocityX = this.direction.x * this.speed;
        this.velocityY = this.direction.y * this.speed;
        this.animator = new Animator(ASSET_MANAGER.getAsset(`./sprites/LongRangeGrim.png`), 9, 8, 32, 32, 4, 0.1);
        this.width = 32;
        this.height = 32;
        this.box = new BoundingBox(this.x, this.y, this.width, this.height);
    }

    update() {
        this.lastBox = this.box;

        // Update position using delta time
        this.x += this.velocityX * this.game.clockTick;
        this.y += this.velocityY * this.game.clockTick;

        this.box = new BoundingBox(this.x, this.y, this.width, this.height);

        // Collision checks remain the same
        this.game.entities.forEach(entity => {
            if (entity !== this && entity.box && this.box.collide(entity.box)) {
                if (entity instanceof Platform || entity instanceof Boss || entity instanceof Drone) {
                    this.removeFromWorld = true;
                }
            }
        });

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