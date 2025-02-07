class Grim {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 500;
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.facing = "right";
        
        // Create animation map for Grim's animations - updated filenames to match loaded assets
        this.animationMap = new Map();
<<<<<<< HEAD
        this.animationMap.set('runRight', new Animator(ASSET_MANAGER.getAsset('./sprites/GrimRunningR.png'), 8, -8, 48, 48, 6, 0.2));
        this.animationMap.set('runLeft', new Animator(ASSET_MANAGER.getAsset('./sprites/GrimRunningL.png'), 4.25, -8, 48, 48, 6, 0.2));
        this.animationMap.set('idleRight', new Animator(ASSET_MANAGER.getAsset('./sprites/GrimIdleR.png'), 7, -8, 48, 48, 4, 0.2));
        this.animationMap.set('idleLeft', new Animator(ASSET_MANAGER.getAsset('./sprites/GrimIdleL.png'), 4.25, -8, 48, 48, 4, 0.2));
=======
        this.animationMap.set('runRight', new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimRunningR.png`), 13, 16, 48, 32, 6, 0.2));
        this.animationMap.set('runLeft', new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimRunningL.png`), 3.01, 16, 48, 32, 6, 0.2));
        this.animationMap.set('idleRight', new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimIdleR.png`), 0, 16, 42, 32, 5, 0.2));
        this.animationMap.set('idleLeft', new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimIdleL.png`), 5, 16, 48, 32, 5, 0.2));
>>>>>>> faisal01-code
        
        // Set default animation
        this.animator = this.animationMap.get('idleRight');
        
        // Set up bounding box for collisions - using sprite dimensions
<<<<<<< HEAD
        this.box = new BoundingBox(this.x, this.y, 80, 95); // Height is doubled for proper collision
=======
        this.box = new BoundingBox(this.x, this.y, 64, 64); // Height is doubled for proper collision
>>>>>>> faisal01-code
        this.updateBoundingBox();
        this.landed = false;
    }

    updateBoundingBox() {
<<<<<<< HEAD
        this.box = new BoundingBox(this.x, this.y, 80, 95);
=======
        this.box = new BoundingBox(this.x, this.y, 64, 64);
>>>>>>> faisal01-code
    }

    updateLastBB() {
        this.lastBox = this.box;
    }

    update() {
        const TICK = this.game.clockTick;
        
        // Left movement
        if (this.game.left) {
            this.x -= 4;
            if (this.facing !== "left") {
                this.facing = "left";
                this.animator = this.animationMap.get('runLeft');
            }
        }
        
        // Right movement
        if (this.game.right) {
            this.x += 4;
            if (this.facing !== "right") {
                this.facing = "right";
                this.animator = this.animationMap.get('runRight');
            }
        }
        
        // Idle state
        if (!this.game.left && !this.game.right) {
            if (this.facing === "left" && this.facing !== "idle") {
                this.facing = "idle";
                this.animator = this.animationMap.get('idleLeft');
            } else if (this.facing === "right" && this.facing !== "idle") {
                this.facing = "idle";
                this.animator = this.animationMap.get('idleRight');
            }
        }

        // Jump logic with gravity
        if (this.game.jump && this.landed) {
<<<<<<< HEAD
            this.velocity.y = -800;
=======
            this.velocity.y = -800; //change this for jumping height
>>>>>>> faisal01-code
            this.fallGrav = 1900;
            this.landed = false;
        }

        // World boundaries
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > gameWorld.width - 48) { // Updated to match sprite width
            this.x = gameWorld.width - 48;
        }

        // Gravity and vertical movement
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;
        
        this.updateLastBB();
        this.updateBoundingBox();

        // Collision detection
        this.game.entities.forEach(entity => {
            if (entity.box && this.box.collide(entity.box)) {
                if (this.velocity.y > 0) {
<<<<<<< HEAD
                    if ((entity instanceof FirstLevelGround || entity instanceof FirstLevelPlatform1 || entity instanceof FirstLevelPlatform2) 
                        && (this.lastBox.bottom) <= entity.box.top) {
                        this.velocity.y = 0;
                        this.y = entity.box.top - 96; // Updated to match sprite height
                        this.landed = true;
                    }
                } else if (this.velocity.y < 0) {
                    if ((entity instanceof FirstLevelPlatform1 || entity instanceof FirstLevelPlatform2) 
=======
                    if ((entity instanceof Platform) 
                        && (this.lastBox.bottom) <= entity.box.top) {
                        this.velocity.y = 0;
                        this.y = entity.box.top - 64; // Updated to match sprite height
                        this.landed = true;
                    }
                } else if (this.velocity.y < 0) {
                    if ((entity instanceof Platform) 
>>>>>>> faisal01-code
                        && (this.lastBox.top) >= entity.box.bottom) {
                        this.velocity.y = 300;
                        this.y = entity.box.bottom;
                    }
                } else {
                    this.landed = false;
                }

                // Horizontal collision
                if (this.game.right || this.game.left) {
                    if (this.lastBox.right <= entity.box.left) {
                        this.x = entity.box.left - this.box.width;
                    } else if (this.lastBox.left >= entity.box.right) {
                        this.x = entity.box.right;
                    }
                }
<<<<<<< HEAD
            }
=======
             }
>>>>>>> faisal01-code
            this.updateBoundingBox();
        });
    }

    draw(ctx) {
<<<<<<< HEAD
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y);
=======
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
>>>>>>> faisal01-code
        
        // Draw bounding box (for debugging)
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
    }
}