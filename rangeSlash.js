class RangeSlash {
    constructor(game, x, y, direction, playerVelocity = { x: 0, y: 0 }) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = 450;

        // Apply speed to direction
        this.velocityX = this.direction.x * this.speed;
        this.velocityY = this.direction.y * this.speed;

        // Choose animation based on direction
        this.animations = {
            right: new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/slashRight.png`), 150, 0, 495, 363, 1, 0.1),
            left: new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/slashLeft.png`), 0, 0, 495, 363, 1, 0.1),
            up: new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/slashUp.png`), 0, 0, 363, 495, 1, 0.1),
            down: new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/slashDown.png`), 0, 0, 363, 495, 1, 0.1)
        };

        this.setAnimation(); // Set the correct animation based on direction

        this.width = 48;
        this.height = 48;
        this.box = new BoundingBox(this.x, this.y, this.width, this.height);
    }

    setAnimation() {
        const angle = Math.atan2(this.direction.y, this.direction.x) * (180 / Math.PI);

        if (angle >= -45 && angle <= 45) {
            this.animator = this.animations.right; // Right
        } else if (angle > 45 && angle < 135) {
            this.animator = this.animations.down; // Down
        } else if (angle < -45 && angle > -135) {
            this.animator = this.animations.up; // Up
        } else {
            this.animator = this.animations.left; // Left
        }
    }

    update() {
        this.lastBox = this.box;

        // Update position using delta time
        this.x += this.velocityX * this.game.clockTick;
        this.y += this.velocityY * this.game.clockTick;

        this.box = new BoundingBox(this.x, this.y, this.width, this.height);

        // Collision detection
        this.game.entities.forEach(entity => {
            if (entity !== this && entity.box && this.box.collide(entity.box)) {
                if (entity instanceof Platform || entity instanceof Boss || entity instanceof Drone || entity instanceof stormSpirit || entity instanceof Phoenix) {
                    this.removeFromWorld = true;
                }
            }
        });

        // Remove slash if it goes out of bounds
        if (this.x < 0 || this.x > gameWorld.width || this.y < 0 || this.y > gameWorld.height) {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 0.15);

        // Draw debug bounding box
        if (this.box) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        }
    }
}
