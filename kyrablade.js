class KyraBlade {
    constructor(game) {
        this.game = game;
        this.animator = new Animator(ASSET_MANAGER.getAsset(`./sprites/idleRight.png`), 0, 0, 48, 50, 4, .2);
        
        // Starting position
        this.x = 0;
        const groundY = gameWorld.height - 70; // Ground height
        this.y = groundY - 100; // Start above ground
        
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.facing = "right";
        
        // Set up animations
        this.animationMap = new Map();
        this.animationMap.set(`runRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/runRight.png`), 0, 0, 50, 50, 6, 0.2));
        this.animationMap.set(`runLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/runLeft.png`), 0, 0, 50, 50, 6, 0.2));
        this.animationMap.set(`idleRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/idleRight.png`), 0, 0, 48, 50, 4, .2));
        this.animationMap.set(`idleLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/idleLeft.png`), 0, 0, 48, 50, 4, 0.2));
        this.animationMap.set(`attackRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/attack1Right.png`), 0, 0, 48, 50, 8, 0.1));
        this.animationMap.set(`attackLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/attack1Left.png`), 0, 0, 48, 50, 8, 0.1));
        this.animationMap.set(`longRangeRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/attack2Right.png`), 0, 0, 48, 50, 8, 0.1));
        this.animationMap.set(`longRangeLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/attack2Left.png`), 0, 0, 48, 50, 8, 0.1));
        
        // Collision box dimensions
        this.boxWidth = 32;
        this.boxHeight = 64;
        
        this.updateBoundingBox();
        this.updateLastBB();
        this.landed = false;
        this.attacking = false;
    }

    updateBoundingBox() {
        // Center the collision box on the sprite horizontally
        const xOffset = 8; // Adjust this value to center the box
        this.box = new BoundingBox(this.x + xOffset, this.y, this.boxWidth, this.boxHeight);
    }

    updateLastBB() {
        this.lastBox = this.box;
    }

    update() {
        const TICK = this.game.clockTick;

        // Save the previous position for collision checking
        const prevX = this.x;
        const prevY = this.y;

        // Movement controls
        if (this.game.left) {
            this.x -= 4;
            if (this.facing !== "left") {
                this.facing = "left";
                this.animator = this.animationMap.get(`runLeft`);
            }
        }
        if (this.game.right) {
            this.x += 4;
            if (this.facing !== "right") {
                this.facing = "right";
                this.animator = this.animationMap.get(`runRight`)
            }
        }
        
        // Idle animation
        if (!this.game.left && !this.game.right) {
            if (this.facing === "left") {
                this.animator = this.animationMap.get(`idleLeft`);
            } else if (this.facing === "right") {
                this.animator = this.animationMap.get(`idleRight`);
            }
        }

        // Jump logic
        if (this.game.jump && this.landed) {
            this.velocity.y = -800;
            this.fallGrav = 1900;
            this.landed = false;
        }

        // Screen boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > gameWorld.width - this.boxWidth) {
            this.x = gameWorld.width - this.boxWidth;
        }

        // Apply gravity and vertical movement
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;

        // Update bounding boxes for collision detection
        this.updateLastBB();
        this.updateBoundingBox();

        // Collision detection
        this.game.entities.forEach(entity => {
            if (entity.box && this.box.collide(entity.box)) {
                // Ground collision (falling)
                if (this.velocity.y > 0) {
                    if ((entity instanceof FirstLevelGround || 
                         entity instanceof FirstLevelPlatform1 || 
                         entity instanceof FirstLevelPlatform2) && 
                        (this.lastBox.bottom) <= entity.box.top) {
                        
                        this.y = entity.box.top - this.boxHeight;
                        this.velocity.y = 0;
                        this.landed = true;
                    }
                }
                // Ceiling collision (jumping)
                else if (this.velocity.y < 0) {
                    if ((entity instanceof FirstLevelPlatform1 || 
                         entity instanceof FirstLevelPlatform2) && 
                        (this.lastBox.top) >= entity.box.bottom) {
                        
                        this.y = entity.box.bottom;
                        this.velocity.y = 0;
                    }
                }

                // Horizontal collisions
                if ((this.game.right || this.game.left) && 
                    !(entity instanceof Boss)) { // Ignore horizontal collisions with boss
                    
                    if (this.lastBox.right <= entity.box.left) {
                        this.x = entity.box.left - this.boxWidth;
                    } else if (this.lastBox.left >= entity.box.right) {
                        this.x = entity.box.right;
                    }
                }
            }
        });

        // Ensure bounding box is updated after all position changes
        this.updateBoundingBox();

        // Attack logic
        if (this.game.closeRange && !this.attacking) {
            this.attacking = true;
            if (this.facing === 'right') {
                this.animator = this.animationMap.get(`attackRight`);
            } else {
                this.animator = this.animationMap.get(`attackLeft`);
            }
        } else if (this.game.longRange && !this.attacking) {
            this.attacking = true;
            if (this.facing === 'right') {
                this.animator = this.animationMap.get(`longRangeRight`);
            } else {
                this.animator = this.animationMap.get(`longRangeLeft`);
            }

            // Spawn bullet
           // const bulletX = this.facing === "right" ? this.x + 50 : this.x - 10;
            //const bulletY = this.y + 20;
           // const bullet = new Bullet(this.game, bulletX, bulletY, this.facing);
            //this.game.addEntity(bullet);
        }

        // Reset attack state
        if (this.attacking && this.animator.isDone()) {
            this.attacking = false;
            this.animator.reset();
        }
    }

    draw(ctx) {
        // Draw the character
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        
        // Draw collision box for debugging
        ctx.strokeStyle = `blue`;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        
        // Draw center point
        ctx.fillStyle = `red`;
        ctx.beginPath();
        ctx.arc(this.x + this.boxWidth/2, this.y + this.boxHeight/2, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}