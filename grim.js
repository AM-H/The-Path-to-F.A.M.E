class Grim {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 500;
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.facing = "right";
        
        // Create animation map for Grim's animations
        this.animationMap = new Map();
        this.animationMap.set('runRight', new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimRunningR.png`), 13, 16, 48, 32, 6, 0.2));
        this.animationMap.set('runLeft', new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimRunningL.png`), 3.01, 16, 48, 32, 6, 0.2));
        this.animationMap.set('idleRight', new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimIdleR.png`), 0, 16, 42, 32, 5, 0.2));
        this.animationMap.set('idleLeft', new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimIdleL.png`), 5, 16, 48, 32, 5, 0.2));
        // Add new attack animations
        this.animationMap.set('attackRight', new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimAttackR.png`), 0, 0, 48, 32, 10, 0.1));
        this.animationMap.set('attackLeft', new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimAttackL.png`), 0, 0, 48, 32, 10, 0.1));
        
        // Set default animation
        this.animator = this.animationMap.get('idleRight');
        
        // Set up bounding box for collisions
        this.box = new BoundingBox(this.x, this.y, 64, 64);
        this.updateBoundingBox();
        this.landed = false;

        // Attack properties
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.attackDuration = 0.6; // Duration of attack animation in seconds
        this.attackTimer = 0;
    }

    updateBoundingBox() {
        this.box = new BoundingBox(this.x, this.y, 64, 64);
    }

    updateLastBB() {
        this.lastBox = this.box;
    }

    update() {
        const TICK = this.game.clockTick;

        // Attack state handling
        if (this.game.closeAttack && this.attackCooldown <= 0 && !this.isAttacking) {
            this.isAttacking = true;
            this.attackTimer = this.attackDuration;
            this.animator = this.animationMap.get(this.facing === 'right' ? 'attackRight' : 'attackLeft');
        }

        if (this.isAttacking) {
            this.attackTimer -= TICK;
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
                this.attackCooldown = 0.2; // Add a small cooldown between attacks
            }
        } else {
            // Only allow movement if not attacking
            if (this.game.left) {
                this.x -= 4;
                if (this.facing !== "left") {
                    this.facing = "left";
                    this.animator = this.animationMap.get('runLeft');
                }
            }
            
            if (this.game.right) {
                this.x += 4;
                if (this.facing !== "right") {
                    this.facing = "right";
                    this.animator = this.animationMap.get('runRight');
                }
            }
            
            // Idle state
            if (!this.game.left && !this.game.right) {
                if (this.facing === "left") {
                    this.animator = this.animationMap.get('idleLeft');
                } else if (this.facing === "right") {
                    this.animator = this.animationMap.get('idleRight');
                }
            }
        }

        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= TICK;
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
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        
        // Draw bounding box (for debugging)
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
    }
}