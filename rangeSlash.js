class RangeSlash {
    constructor(game, x, y, direction, velocity = { x: 0, y: 0 }) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.velocity = velocity;
        this.damage = 20;
        this.speed = 450;

        this.box = new BoundingBox(this.x, this.y, 32, 32); // Set bounding box size for the projectile

        // Apply speed to direction
        this.velocityX = this.direction.x * this.speed;
        this.velocityY = this.direction.y * this.speed;

        // Choose animation based on direction
        this.animations = {
            right: new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/slashRight.png`), 150, 0, 495, 363, 1, 0.1),
            left: new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/slashLeft.png`), 0, 0, 495, 363, 1, 0.1),
            up: new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/slashUp.png`), 0, 0, 363, 495, 1, 0.1),
            down: new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/slashDown.png`), 0, 0, 363, 495, 1, 0.1),
            bottomLeft: new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/bottomLeft.png`), 0, 0, 363, 495, 1, 0.1),
            bottomRight: new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/bottomRight.png`), 0, 0, 363, 495, 1, 0.1),
            topLeft: new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/topLeft.png`), 0, 0, 363, 495, 1, 0.1),
            topRight: new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/topRight.png`), 0, 0, 363, 495, 1, 0.1),
        };

        this.setAnimation();

        // Debugging
        console.log("Direction:", this.direction);
        console.log("Animator:", this.animator);


        this.width = 32;
        this.height = 32;
        this.box = new BoundingBox(this.x, this.y, this.width, this.height);
    }

    setAnimation() {
        const angle = Math.atan2(this.direction.y, this.direction.x) * (180 / Math.PI);

        if (angle >= -22.5 && angle <= 22.5) {
            this.animator = this.animations.right; // Right
        } else if (angle > 22.5 && angle <= 67.5) {
            this.animator = this.animations.bottomRight; // bottom Right
        } else if (angle > 67.5 && angle <= 112.5) {
            this.animator = this.animations.down; // down
        } else if (angle > 112.5 && angle <= 157.5) {
            this.animator = this.animations.bottomLeft; // bottom Left
        } else if (angle > 157.5 || angle <= -157.5) {
            this.animator = this.animations.left; // Left
        } else if (angle > -157.5 && angle <= -112.5) {
            this.animator = this.animations.topLeft; // top Left
        } else if (angle > -112.5 && angle <= -67.5) {
            this.animator = this.animations.up; // Down
        } else if (angle > -67.5 && angle <= -22.5) {
            this.animator = this.animations.topRight; // top Right
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
                if (entity instanceof Drone || entity instanceof stormSpirit || entity instanceof Phoenix || entity instanceof Eclipser || entity instanceof Shizoku || entity instanceof  inferno || entity instanceof LeviathDraconis) {
                    if(entity instanceof Phoenix || entity instanceof Drone){
                        entity.takeDamage(100);
                    }
                    if(entity instanceof Eclipser || entity instanceof  Shizoku || entity instanceof inferno || entity instanceof LeviathDraconis){
                        entity.takeDamage(60);
                    }
                    if(entity instanceof stormSpirit){
                        entity.takeDamage(90);
                    }
                    this.removeFromWorld = true;
                }
                if(entity instanceof Platform){
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
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 0.12);

        // Draw debug bounding box
        if (this.box) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        }
    }
}
