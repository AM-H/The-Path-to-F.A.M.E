class inferno {
    constructor(game) {
        this.game = game;

        // Load animations
        this.idleRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/IdleRight.png`), -55, 11, 150, 64, 8, 0.6);
        this.idleLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/IdleLeft.png`), -55, 11, 150, 64, 8, 0.6);
        this.walkRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/runRight.png`), -55, 11, 150, 64, 8, 0.6);
        this.walkLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/runLeft.png`), -55, 11, 150, 64, 8, 0.6);
        this.attackRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/attackRight.png`),-28, 11, 150, 64, 8, 1);
        this.attackLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/attackLeft.png`), -28, 11, 150, 64, 8, 1);

        // Position setup - start on right side
        this.x = gameWorld.width - 200;
        const groundHeight = gameWorld.height - 70;
        this.y = groundHeight - 70;

        // Basic properties
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.moveSpeed = 75; // Similar to LeviathDraconis horizontal speed
        this.landed = true;

        // Sprite dimensions
        this.spriteScale = 2;
        this.width = 150 * this.spriteScale;
        this.height = 64 * this.spriteScale;
        this.boxWidth = 32;
        this.boxHeight = 64;

        // State
        this.facing = -1; // Start facing left
        this.state = 'idle';
        this.jumpPhase = 'none';
        this.isOnPlatform = false;
        
        // LeviathDraconis-like properties
        this.timeAbovePlayer = 0;
        this.maxTimeAbovePlayer = 0.5; // Max time that the boss can be above player
        this.isCloseAttacking = false;

        // Combat ranges
        this.attackRange = 95; // Similar to LeviathDraconis close attack distance
        this.chaseRange = 400; // Distance to player when boss will start chasing

        // Initialize bounding boxes
        this.updateBoundingBox();
        this.lastBox = this.box;

        // Healthbar
        this.hitpoints = 150;
        this.maxhitpoints = 150;
        this.healthbar = new HealthBar(this);
        this.damageCooldown = 0;

        this.removeFromWorld = false;
        this.defeated = false;
    }

    updateBoundingBox() {
        const xOffset = (this.width - this.boxWidth) / 2;
        this.box = new BoundingBox(
            this.x + xOffset,
            this.y,
            this.boxWidth,
            this.boxHeight
        );
    }

    updateLastBB() {
        this.lastBox = this.box;
    }

    getPlayerPlatform(player) {
        let playerPlatform = null;
        this.game.entities.forEach(entity => {
            if (entity instanceof Platform) {
                if (player.y + player.box.height >= entity.y &&
                    player.y + player.box.height <= entity.y + 5 &&
                    player.x + player.box.width > entity.x &&
                    player.x < entity.x + entity.width) {
                    playerPlatform = entity;
                }
            }
        });
        return playerPlatform;
    }
    
    getCurrentPlatform() {
        let currentPlatform = null;
        this.game.entities.forEach(entity => {
            if (entity instanceof Platform) {
                if (this.y + this.boxHeight >= entity.y &&
                    this.y + this.boxHeight <= entity.y + 5 &&
                    this.x + this.boxWidth > entity.x &&
                    this.x < entity.x + entity.width) {
                    currentPlatform = entity;
                }
            }
        });
        return currentPlatform;
    }
    
    // Check if boss can jump onto a platform (similar to LeviathDraconis)
    canJump() {
        return this.game.entities.some(entity => 
            entity instanceof Platform &&
            entity.box.y < this.box.y && // The platform is above
            ((Math.abs(entity.box.left - this.box.left) < 64) || 
             (Math.abs(entity.box.right - this.box.right) < 64)) // platform within reach horizontally
        );
    }
    
    // Track player and move (similar to LeviathDraconis)
    trackPlayerAndMove() {
        const TICK = this.game.clockTick;
        const player = this.getPlayer();
        
        if (!player) return;
        
        const distanceX = player.box.x - this.box.x;
        const distanceY = player.box.y - this.box.y;
        const jumpSpeed = -1030;

        if (this.landed) {
            // Horizontal movement
            if (Math.abs(distanceX) > 20) {
                this.velocity.x = distanceX > 0 ? this.moveSpeed : -this.moveSpeed;
                this.facing = distanceX > 0 ? 1 : -1;
                this.state = 'chasing';
            } else {
                this.velocity.x = 0;
                this.state = 'idle';
            }

            // Vertical movement - jump if player is above
            if (distanceY < -60 && this.canJump()) {
                this.velocity.y = jumpSpeed;
                this.landed = false;
                this.jumpPhase = 'jumping';
            }
            
            // Track time spent above player
            if (distanceY > 5) {
                this.timeAbovePlayer += TICK;
            }
            
            // Check for close attack
            if (Math.abs(distanceX) < this.attackRange && Math.abs(distanceY) < this.attackRange) {
                this.state = 'attacking';
                this.isCloseAttacking = true;
                
                // Deal damage to player when in attack range
                if (player.takeDamage && this.damageCooldown <= 0) {
                    player.takeDamage(10);
                    this.damageCooldown = 0.5;
                }
            } else {
                this.isCloseAttacking = false;
            }
        }
    }

    takeDamage(amount) {
        if (this.damageCooldown <= 0) {
            this.hitpoints = Math.max(0, this.hitpoints - amount);
            this.damageCooldown = 0.5;
            console.log(`Boss takes ${amount} damage! Remaining HP: ${this.hitpoints}`);
        }
    }

    getPlayer() {
        return this.game.entities.find(entity =>
            entity instanceof AzielSeraph || entity instanceof HolyDiver || 
            entity instanceof Grim || entity instanceof Kanji
        );
    }

    update() {
        const TICK = this.game.clockTick;
        const player = this.getPlayer();

        if (this.hitpoints <= 0) {
            this.defeated = true;
            this.removeFromWorld = true;
            console.log("Boss defeated!");
            return;
        }

        if (!player) return;

        // Use LeviathDraconis-like tracking and movement
        this.trackPlayerAndMove();

        // Apply gravity and movement
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;
        this.x += this.velocity.x * TICK;

        // Check if we've been stuck above player on platform for too long
        if (this.timeAbovePlayer > this.maxTimeAbovePlayer) {
            this.landed = false;
            this.timeAbovePlayer = 0;
        }

        this.updateLastBB();
        this.updateBoundingBox();

        // Platform and ground collisions
        let isOnGround = false;
        this.game.entities.forEach(entity => {
            if (entity instanceof Platform) {
                if (this.box.collide(entity.box)) {
                    if (this.velocity.y > 0 && this.lastBox.bottom <= entity.box.top) {
                        this.velocity.y = 0;
                        this.y = entity.box.top - this.boxHeight;
                        this.landed = true;
                        this.jumpPhase = 'none';
                        isOnGround = true;
                    }
                }
            }
        });

        // Ground level check
        const groundLevel = gameWorld.height - 70;
        if (!isOnGround && this.y + this.boxHeight > groundLevel) {
            this.y = groundLevel - this.boxHeight;
            this.velocity.y = 0;
            this.landed = true;
            this.jumpPhase = 'none';
        }

        // Screen boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > gameWorld.width - this.width) {
            this.x = gameWorld.width - this.width;
        }

        this.damageCooldown -= TICK;
        this.healthbar.update();
    }
    
    draw(ctx) {
        // Draw the appropriate animation based on state and direction
        if (this.state === 'attacking') {
            if (this.facing === -1) {
                this.attackLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25, false, true);
            } else {
                this.attackRightAnim.drawFrame(this.game.clockTick, ctx, this.x + 48, this.y, 1.25);
            }
        } else if (this.state === 'chasing') {
            if (this.facing === -1) {
                this.walkLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25, false, true);
            } else {
                this.walkRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25);
            }
        } else { // idle state
            if (this.facing === -1) {
                this.idleLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25, false, true);
            } else {
                this.idleRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25);
            }
        }
        
        // Debug bounding box
        if (this.game.debugMode) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        }
        
        this.healthbar.draw(ctx);
    }
}