class inferno {
    constructor(game) {
        this.game = game;

        // Load animations
        this.idleRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/IdleRight.png`), -55, 11, 150, 64, 8, 0.6);
        this.idleLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/IdleLeft.png`), -55, 11, 150, 64, 8, 0.6);
        this.walkRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/runRight.png`), -55, 11, 150, 64, 8, 0.6);
        this.walkLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/runLeft.png`), -55, 11, 150, 64, 8, 0.6);
        this.attackRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/attackRight.png`),-28, 11, 150, 64, 8, 0.05);
        this.attackLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/attackLeft.png`), -28, 11, 150, 64, 8, 1);

        // Position setup - start on right side
        this.x = gameWorld.width - 200;
        const groundHeight = gameWorld.height - 70;
        this.y = groundHeight - 70;

        // Basic properties
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.moveSpeed = 3;
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
        this.battleStarted = false;

        // Combat ranges
        this.attackRange = 60; // Distance to player when boss will attack
        this.chaseRange = 400; // Distance to player when boss will start chasing

        // Animation timing
        this.attackDuration = 1.5; // How long the attack animation lasts
        this.attackTimer = 0;     // Timer for attack animation

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

    getPlayer() {
        return this.game.entities.find(entity =>
            entity instanceof AzielSeraph || entity instanceof HolyDiver || 
            entity instanceof Grim || entity instanceof Kanji
        );
    }

    takeDamage(amount) {
        if (this.damageCooldown <= 0) {
            this.hitpoints = Math.max(0, this.hitpoints - amount);
            this.damageCooldown = 0.5;
            this.battleStarted = true; // Getting hit starts the battle
            console.log(`Boss takes ${amount} damage! Remaining HP: ${this.hitpoints}`);
        }
    }

    update() {
        const TICK = this.game.clockTick;
        const player = this.getPlayer();

        // Basic checks
        if (this.hitpoints <= 0) {
            this.defeated = true;
            this.removeFromWorld = true;
            console.log("Boss defeated!");
            return;
        }

        if (!player) return;
        
        // Calculate distance to player (center to center)
        const distToPlayer = Math.abs(
            (this.x + this.width/2) - (player.x + player.box.width/2)
        );
        
        // Determine which side the player is on
        const playerIsOnLeft = player.x < this.x;
        
        // Check if battle should start based on proximity
        if (!this.battleStarted && distToPlayer < this.chaseRange) {
            this.battleStarted = true;
        }
        
        // Decrease timers
        if (this.attackTimer > 0) {
            this.attackTimer -= TICK;
        }
        
        if (this.damageCooldown > 0) {
            this.damageCooldown -= TICK;
        }
        
        // Handle boss behavior
        if (!this.battleStarted) {
            // Stay idle until player gets close
            this.state = 'idle';
        } else {
            // ALWAYS set facing direction based on player position
            // This ensures boss always faces player, even during attack
            this.facing = playerIsOnLeft ? -1 : 1;
            
            // Handle state transitions
            if (this.attackTimer > 0) {
                // Continue attack animation until timer expires
                this.state = 'attacking';
                
                // Deal damage throughout attack animation when in contact
                if (this.box.collide(player.box)) {
                    if (player.takeDamage && this.damageCooldown <= 0) {
                        player.takeDamage(10);
                        this.damageCooldown = 0.5; // Prevent damage spam
                        console.log("Player takes damage!");
                    }
                }
            } else if (distToPlayer <= this.attackRange) {
                // Start attack when in range
                this.state = 'attacking';
                this.attackTimer = this.attackDuration;
                
                // Deal initial damage when starting attack
                if (this.box.collide(player.box)) {
                    if (player.takeDamage) {
                        player.takeDamage(10);
                        this.damageCooldown = 0.5;
                        console.log("Player takes damage!");
                    }
                }
            } else if (distToPlayer <= this.chaseRange) {
                // Chase the player when in chase range but not in attack range
                this.state = 'chasing';
                
                // Move towards player
                const moveDir = playerIsOnLeft ? -1 : 1;
                this.x += this.moveSpeed * moveDir;
            } else {
                // Default to idle when out of range
                this.state = 'idle';
            }
        }
        
        // Apply gravity
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;
        
        this.updateLastBB();
        this.updateBoundingBox();
        
        // Check ground collision
        const groundLevel = gameWorld.height - 70;
        if (this.y + this.boxHeight > groundLevel) {
            this.y = groundLevel - this.boxHeight;
            this.velocity.y = 0;
            this.landed = true;
        }
        
        // Check platform collisions
        this.game.entities.forEach(entity => {
            if (entity instanceof Platform) {
                if (this.box.collide(entity.box)) {
                    if (this.velocity.y > 0 && this.lastBox.bottom <= entity.box.top) {
                        this.velocity.y = 0;
                        this.y = entity.box.top - this.boxHeight;
                        this.landed = true;
                    }
                }
            }
        });
        
        // Screen boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > gameWorld.width - this.width) {
            this.x = gameWorld.width - this.width;
        }
        
        this.healthbar.update();
    }
    
    draw(ctx) {
        // Draw the appropriate animation based on state and direction
        if (this.state === 'attacking') {
            if (this.facing === -1) {
                this.attackLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25);
            } else {
                this.attackRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25);
            }
        } else if (this.state === 'chasing') {
            if (this.facing === -1) {
                this.walkLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25);
            } else {
                this.walkRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25);
            }
        } else { // idle state
            if (this.facing === -1) {
                this.idleLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25);
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