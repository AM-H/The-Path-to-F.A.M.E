class Boss {
    constructor(game) {
        this.game = game;
      
        // Load animations
        this.idleRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/BossIdleR.png`), 0, 0, 32, 32, 4, 0.35);
        this.idleLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/BossIdleL.png`), 0, 0, 32, 32, 4, 0.35);
        this.walkRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/BossWalkR.png`), 0, 0, 32, 32, 6, 0.35);
        this.walkLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/BossWalkL.png`), 0, 0, 32, 32, 6, 0.35);
        this.attackRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/BossAttackR.png`), 0, 0, 32, 32, 8, 0.25);
        this.attackLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/BossAttackL.png`), 0, 0, 32, 32, 8, 0.25);
        
        // Position setup
        this.x = 600;
        const groundHeight = gameWorld.height - 70;
        this.y = groundHeight - 64;
        
        // Basic properties
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.moveSpeed = 3;
        this.landed = true;
        
        this.spriteScale = 2;
        this.width = 32 * this.spriteScale;    
        this.height = 32 * this.spriteScale;   
        this.boxWidth = 32;
        this.boxHeight = 64;  
        
        // State
        this.facing = -1;
        this.state = 'idle';
        this.targetPlatform = null;
        this.jumpPhase = 'none';
        this.isOnPlatform = false;  
        
        // Combat ranges
        this.attackRange = 50;
        this.chaseRange = 400;
        this.minDistance = 100;

        // Canvas middle point
        this.canvasMiddle = gameWorld.width / 2;
        
        // Platform jumping
        this.jumpCooldown = 0;
        this.jumpCooldownTime = 1.5;
        
        // Initialize bounding boxes
        this.updateBoundingBox();
        this.lastBox = this.box;

        // Healthbar
        this.hitpoints = 150;
        this.maxhitpoints = 150;
        this.radius = 20;
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

    isPlayerOnPlatform(player, platform) {
        if (!platform) return false;
        return player.y + player.box.height <= platform.y + 5 &&
               player.x + player.box.width > platform.x &&
               player.x < platform.x + platform.width;
    }

    calculateJumpVelocity(targetX, targetY) {
        const jumpTime = 1.0;
        const dx = targetX - this.x;
        const vx = dx / jumpTime;
        const dy = targetY - this.y;
        const vy = (dy - (0.5 * this.fallGrav * jumpTime * jumpTime)) / jumpTime;
        return { x: vx, y: vy };
    }

    moveToMiddle() {
        const distanceToMiddle = Math.abs(this.x - this.canvasMiddle);
        if (distanceToMiddle > this.moveSpeed) {
            this.x += this.moveSpeed * (this.x < this.canvasMiddle ? 1 : -1);
            this.facing = this.x < this.canvasMiddle ? 1 : -1;
            return false;
        }
        return true;
    }

    isOnSamePlatformLevel(platform) {
        if (!platform) return false;
        return Math.abs(this.y + this.boxHeight - platform.y) < 5;
    }

    takeDamage(amount) {
        if (this.damageCooldown <= 0) {
            this.hitpoints = Math.max(0, this.hitpoints - amount);
            this.damageCooldown = 0.5;
            console.log(`Boss takes ${amount} damage! Remaining HP: ${this.hitpoints}`);
        }
    }

    getPlayer() {
        // Find any entity that's a player (AzielSeraph or Grim)
        return this.game.entities.find(entity => 
            entity instanceof AzielSeraph || entity instanceof Grim
        );
    }

    checkPlayerAttack() {
        const player = this.getPlayer();
        if (!player) return;

        // Check for close attack collision
        if (this.box.collide(player.box)) {
            if (player instanceof AzielSeraph) {
                // Check for HolyDiver attack
                const holyDiver = this.game.entities.find(entity => entity instanceof HolyDiver);
                if (holyDiver && this.box.collide(holyDiver.box) && player.game.closeAttack) {
                    this.takeDamage(10);
                }
            } else if (player instanceof Grim) {
                // Handle Grim's attack
                if (player.game.closeAttack) {
                    this.takeDamage(10);
                }
            }
        }
    }

    update() {
        const TICK = this.game.clockTick;
        const player = this.game.entities.find(entity => entity instanceof AzielSeraph);
        const holydiver = this.game.entities.find(entity => entity instanceof HolyDiver);

        if (this.hitpoints <= 0) {
            // Remove the boss from the game when dead
            this.removeFromWorld = true;
            this.defeated = true;
            console.log("Boss defeated!");
            return;
        }
        
        if (this.jumpCooldown > 0) {
            this.jumpCooldown -= TICK;
        }

        if (player) {
            let playerIsOnPlatform = false;
            let currentPlatform = null;

            // Check if player is on any platform
            this.game.entities.forEach(entity => {
                if ((entity instanceof Platform)) {
                    if (this.isPlayerOnPlatform(player, entity)) {
                        playerIsOnPlatform = true;
                        currentPlatform = entity;
                    }
                    if (this.isOnSamePlatformLevel(entity)) {
                        this.isOnPlatform = true;
                    }
                }
            });

            if (!playerIsOnPlatform && this.jumpPhase !== 'none') {
                this.jumpPhase = 'none';
                this.targetPlatform = null;
                this.state = 'chasing';
                this.velocity = { x: 0, y: 0 };
            }

            if (playerIsOnPlatform && currentPlatform && !this.isOnPlatform && 
                this.jumpPhase === 'none' && this.landed) {
                this.targetPlatform = currentPlatform;
                this.jumpPhase = 'moving_to_middle';
                this.state = 'moving';
            } else if (this.isOnPlatform || this.jumpPhase === 'none') {
                const distToPlayer = Math.abs(this.x + this.width/2 - (player.x + player.box.width/2));
                const moveDir = player.x > this.x ? 1 : -1;
                
                if (distToPlayer < this.attackRange) {
                    this.state = 'attacking';
                } else if (distToPlayer < this.chaseRange) {
                    this.state = 'chasing';
                    this.x += this.moveSpeed * moveDir;
                    this.facing = moveDir;
                } else {
                    this.state = 'idle';
                }
            }

            if (this.jumpPhase === 'moving_to_middle') {
                if (this.moveToMiddle()) {
                    const targetX = currentPlatform.x + (currentPlatform.width / 2);
                    const targetY = currentPlatform.y - this.boxHeight;
                    const jumpVel = this.calculateJumpVelocity(targetX, targetY);
                    
                    this.velocity = jumpVel;
                    this.jumpPhase = 'jumping';
                    this.landed = false;
                    this.jumpCooldown = this.jumpCooldownTime;
                    this.facing = this.velocity.x > 0 ? 1 : -1;
                }
            }
        }

        if (this.jumpPhase === 'jumping') {
            this.x += this.velocity.x * TICK;
        }

        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;
        
        this.updateLastBB();
        this.updateBoundingBox();
        
        this.isOnPlatform = false;
        
        // Platform and ground collisions
        this.game.entities.forEach(entity => {
            if ((entity instanceof Platform) && 
                this.box.collide(entity.box)) {
                
                if (this.velocity.y > 0 && this.lastBox.bottom <= entity.box.top) {
                    this.velocity.y = 0;
                    this.y = entity.box.top - this.boxHeight;
                    this.landed = true;
                    
                    if (entity instanceof Platform) {
                        this.isOnPlatform = true;
                    }
                    
                    if (this.jumpPhase === 'jumping') {
                        this.jumpPhase = 'none';
                        this.targetPlatform = null;
                        this.velocity.x = 0;
                    }
                }
            }
        });
        
        // Screen boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > gameWorld.width - this.width) {
            this.x = gameWorld.width - this.width;
        }
        
        this.updateBoundingBox();
        this.damageCooldown -= TICK;

        if (player.isAttacking && this.box.collide(holydiver.box)) {
            console.log("Player is attacking!");  // Debugging log
            this.takeDamage(30);
            player.isAttacking = false;
        }

        // console.log(`Player Box: x=${player.box.x}, y=${player.box.y}, w=${player.box.width}, h=${player.box.height}`);
        // console.log(`Boss Box: x=${this.box.x}, y=${this.box.y}, w=${this.box.width}, h=${this.box.height}`);
        // console.log(`Collision detected: ${this.box.collide(player.box)}`);

        this.healthbar.update();
    }

    draw(ctx) {
        const scale = this.spriteScale;
        
        if (this.state === 'attacking') {
            if (this.facing === -1) {
                this.attackLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, scale);
            } else {
                this.attackRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, scale);
            }
        } else {
            if (this.state === 'chasing' || this.state === 'moving' || this.jumpPhase === 'jumping') {
                if (this.facing === -1) {
                    this.walkLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, scale);
                } else {
                    this.walkRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, scale);
                }
            } else {
                if (this.facing === -1) {
                    this.idleLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, scale);
                } else {
                    this.idleRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, scale);
                }
            }
        }
        
        // Debug bounding box
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);



        this.healthbar.draw(ctx);
    }
}