class Grim {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 500;
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.facing = "right";

        this.canAttack = false;

        this.canAttack = false;
        setTimeout(() => {
            this.canAttack = true;
        }, 100); // Small delay to ensure proper initialization
        
        
        // Create animation map for Grim's animations
        this.animationMap = new Map();
        this.animationMap.set('runRight', new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimRunningR.png`), 13, 16, 48, 32, 6, 0.2));
        this.animationMap.set('runLeft', new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimRunningL.png`), 3.01, 16, 48, 32, 6, 0.2));
        this.animationMap.set('idleRight', new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimIdleR.png`), 0, 16, 42, 32, 5, 0.2));
        this.animationMap.set('idleLeft', new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimIdleL.png`), 5, 16, 48, 32, 5, 0.2));
        this.animationMap.set('attackRight', new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimAttackR.png`), 1.45, 16, 48, 48, 10, 0.06));
        this.animationMap.set('attackLeft', new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimAttackL.png`), 1.45, 16, 48, 48, 10, 0.06));
        
        // Set default animation
        this.animator = this.animationMap.get('idleRight');
        
        this.box = new BoundingBox(this.x, this.y, 64, 64);
        this.updateBoundingBox();
        this.landed = false;
        this.attacking = false;
        this.canShoot = true;
    }

    updateBoundingBox() {
        this.box = new BoundingBox(this.x, this.y, 64, 64);
    }

    updateLastBB() {
        this.lastBox = this.box;
    }

    update() {
        const TICK = this.game.clockTick;
        
        // Left movement
        if (this.game.left) {
            this.x -= 250 * TICK; // Changed from fixed value 4 to speed * TICK
            if (this.facing !== "left") {
                this.facing = "left";
                this.animator = this.animationMap.get('runLeft');
            }
        }
        
        // Right movement
        if (this.game.right) {
            this.x += 250 * TICK; // Changed from fixed value 4 to speed * TICK
            if (this.facing !== "right") {
                this.facing = "right";
                this.animator = this.animationMap.get('runRight');
            }
        }
        
        // Idle state
        if (!this.game.left && !this.game.right && !this.attacking) {
            if (this.facing === "left") {
                this.animator = this.animationMap.get('idleLeft');
            } else if (this.facing === "right") {
                this.animator = this.animationMap.get('idleRight');
            }
        }

         
        
        // attack logic to check for canAttack
        if (this.game.closeAttack && !this.attacking && this.canAttack) {
            this.attacking = true;
            console.log("Attacking"); // Debugging log

            // Use the current facing direction to determine attack animation
            if (this.facing === "right") {
                this.animator = this.animationMap.get('attackRight');
            } else if (this.facing === "left") {
                this.animator = this.animationMap.get('attackLeft');
            }

            // Reset attack state after animation finishes
            setTimeout(() => {
                this.attacking = false;
                // Return to idle animation based on the current facing direction
                if (this.facing === "right") {
                    this.animator = this.animationMap.get('idleRight');
                } else {
                    this.animator = this.animationMap.get('idleLeft');
                }
            }, this.animator.frameCount * this.animator.frameDuration * 1000);
        }

        //long range attack
        if (this.game.rangeAttack && this.canShoot) {
            console.log("long range attack");
            
            // Calculate the center of the character's position
            const centerX = this.x + (this.box.width / 2);
            const centerY = this.y + (this.box.height / 2);

            // Calculate the center position for the projectile
            const projectileCenterX = centerX - 16;  // Half of projectile width (32/2)
            const projectileCenterY = centerY - 16;  // Half of projectile height (32/2)

            // Calculate direction from character center to mouse position
            const deltaX = this.game.mouseX - centerX;
            const deltaY = this.game.mouseY - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Normalize the direction vector
            const direction = {
                x: deltaX / distance,
                y: deltaY / distance
            };

            const projectile = new SkullProjectile(
                this.game, 
                projectileCenterX, 
                projectileCenterY, 
                direction,
                { x: this.velocity.x, y: this.velocity.y }
            );
            this.game.addEntity(projectile);
            
            this.canShoot = false;
        }



        // Add reset shooting capability when right click is released
        if (!this.game.rangeAttack) {
            this.canShoot = true;
        }


        // Jump logic with gravity
        if (this.game.jump && this.landed) {
            this.velocity.y = -800;
            this.fallGrav = 1900;
            this.landed = false;
        }

        // World boundaries
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > gameWorld.width - 48) {
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
                    if ((entity instanceof Platform) 
                        && (this.lastBox.bottom) <= entity.box.top) {
                        this.velocity.y = 0;
                        this.y = entity.box.top - 64;
                        this.landed = true;
                    }
                } else if (this.velocity.y < 0) {
                    if ((entity instanceof Platform) 
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
            }
            this.updateBoundingBox();
        });
    }

    draw(ctx) {
        if(this.facing === "left"){
            this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2, true);
        }else{
            this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        }
        
        // Draw bounding box (for debugging)
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
    }
}