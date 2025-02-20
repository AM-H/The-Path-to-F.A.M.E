class Eclipser {
    constructor(game) {
        this.game = game;
      
        // Load animations
        this.idleRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/eclipser/idleR.png`), 0, 0, 25, 108, 8, 0.35, true);
        this.idleLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/eclipser/idleL.png`), 0, 0, 25, 108, 8, 0.35, true);
        this.walkRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/eclipser/walkR.png`), 0, 0, 25, 108, 8, 0.35, true);
        this.walkLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/eclipser/walkL.png`), 0, 0, 25, 108, 8, 0.35, true);
        this.laserImage = ASSET_MANAGER.getAsset(`./sprites/eclipser/laser.png`);

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
        
         //laser attack system
        this.laserCooldown = 2; // Time between laser attacks
        this.laserTimer = 0;
        this.laserRange = 200;
        this.laserState = 'inactive';
        this.laserChargeTime = 1;
        this.laserFireTime = 1;
        this.laserDamageCooldown = 0.5; // Time between each laser damage tick
        this.currentLaserDamageCooldown = 0;
        
        // Combat ranges
        this.attackRange = 50;
        this.chaseRange = 400;
        this.minDistance = 150;
        this.jumpThreshold = 100; // Distance at which boss decides to jump to player's platform

        // Initialize bounding boxes
        this.updateBoundingBox();
        this.lastBox = this.box;

        // Healthbar
        this.hitpoints = 150;
        this.maxhitpoints = 150;
        this.healthbar = new HealthBar(this);
        this.damageCooldown = 0;

        this.debug = true;

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

    calculateJumpVelocity(targetX, targetY) {
        const jumpTime = 1.0;
        const dx = targetX - this.x;
        const vx = dx / jumpTime;
        const dy = targetY - this.y;
        const vy = (dy - (0.5 * this.fallGrav * jumpTime * jumpTime)) / jumpTime;
        return { x: vx, y: vy };
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

    shouldJump(player) {
        if (!this.landed) return false;
        
        const playerPlatform = this.getPlayerPlatform(player);
        const currentPlatform = this.getCurrentPlatform();
        
        if (!playerPlatform || !currentPlatform) return false;
        
        return playerPlatform.y < currentPlatform.y && 
               Math.abs(this.x - player.x) < this.chaseRange;
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
            entity instanceof AzielSeraph || entity instanceof HolyDiver || entity instanceof Grim
        );
    }

    checkPlayerAttack() {
        const player = this.getPlayer();
        if (!player) return;
        // Check for close attack collision
        if (player.box && this.box.collide(player.box)) {
            console.log(`HERE`);
            if (player instanceof AzielSeraph || player instanceof HolyDiver) {
                // Check for HolyDiver attack
                //const holyDiver = this.game.entities.find(entity => entity instanceof HolyDiver);
                if (player.box && this.box.collide(player.box) && this.game.closeAttack) {
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

    handleLaserDamage(player, TICK) {
        if (this.laserState === 'firing') {
            console.log('Laser is FIRING!');
    
            // Update laser damage cooldown
            this.currentLaserDamageCooldown -= TICK;
    
            let laserStartX = this.facing === 1 ? this.x + 35 : this.x - 200;
    
            const laserBox = new BoundingBox(
                laserStartX,
                this.y - 20,
                200,
                40
            );
    
            if (player.box.collide(laserBox)) {
                console.log('Laser hitbox colliding with player!');
                // Only deal damage if both laser damage cooldown and player damage cooldown are done
                if (this.currentLaserDamageCooldown <= 0 && (!player.damageCooldown || player.damageCooldown <= 0)) {
                    player.takeDamage(20); // Deal damage to the player
                    this.currentLaserDamageCooldown = this.laserDamageCooldown; // Reset laser damage cooldown
                    console.log(`Laser hit player! Player HP: ${player.hitpoints}`);
                }
            }
        }
    }

    update() {
        const TICK = this.game.clockTick;
        const player = this.getPlayer();
    
        if (this.hitpoints <= 0) {
            this.removeFromWorld = true;
            this.defeated = true;
            return;
        }
    
        if (!player) return;
    
        // Update timers
        this.laserTimer -= TICK;
        this.damageCooldown -= TICK;
    
        const distToPlayer = Math.abs(this.x + this.width / 2 - (player.x + player.box.width / 2));
        const moveDir = player.x > this.x ? 1 : -1;
    
        // Laser state machine
        switch (this.laserState) {
            case 'inactive':
                if (this.laserTimer <= 0 && distToPlayer < this.laserRange && distToPlayer > this.minDistance) {
                    console.log('Starting laser charge!');
                    this.laserState = 'charging';
                    this.laserTimer = this.laserChargeTime;
                    this.facing = moveDir;
                    this.state = 'idle';
                }
                break;
    
            case 'charging':
                this.laserTimer -= TICK;
                if (this.laserTimer <= 0) {
                    console.log('Laser charge complete - FIRING!');
                    this.laserState = 'firing';
                    this.laserTimer = this.laserFireTime;
                    this.currentLaserDamageCooldown = 0; // Reset damage cooldown when starting to fire
                }
                break;
    
            case 'firing':
                this.handleLaserDamage(player, TICK);
                this.laserTimer -= TICK;
    
                if (this.laserTimer <= 0) {
                    console.log('Laser firing complete - entering cooldown');
                    this.laserState = 'inactive';
                    this.laserTimer = this.laserCooldown;
                }
                break;
        }
    
        // Movement only when not using laser
        if (this.laserState === 'inactive') {
            if (this.landed) {
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
        }
    
        // Apply gravity and movement
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;
        if (this.laserState === 'inactive') {  // Only move horizontally when not using laser
            this.x += this.velocity.x * TICK;
        }
    
        this.updateLastBB();
        this.updateBoundingBox();
    
        // Platform collisions
        let isOnGround = false;
        this.game.entities.forEach(entity => {
            if (entity instanceof Platform && this.box.collide(entity.box)) {
                if (this.velocity.y > 0 && this.lastBox.bottom <= entity.box.top) {
                    this.velocity.y = 0;
                    this.y = entity.box.top - this.boxHeight;
                    this.landed = true;
                    isOnGround = true;
                }
            }
        });
    
        // Ground level check
        const groundLevel = gameWorld.height - 70;
        if (!isOnGround && this.y + this.boxHeight > groundLevel) {
            this.y = groundLevel - this.boxHeight;
            this.velocity.y = 0;
            this.velocity.x = 0;
            this.landed = true;
        }
    
        // Screen boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > gameWorld.width - this.width) {
            this.x = gameWorld.width - this.width;
        }
    
        this.checkPlayerAttack();
        this.healthbar.update();
    }

    checkPlayerAttack() {
        const player = this.getPlayer();
        if (!player) return;

        // Check for Grim's attacks
        if (player instanceof Grim) {
            // Check for GrimAxe collision
            this.game.entities.forEach(entity => {
                if (entity instanceof GrimAxe) {
                    if (entity.isAnimating && this.box.collide(entity.box)) {
                        this.takeDamage(10);
                    }
                }
            });

            // Check for Skull projectile collision
            this.game.entities.forEach(entity => {
                if (entity instanceof SkullProjectile) {
                    if (this.box.collide(entity.box)) {
                        this.takeDamage(5);
                        entity.removeFromWorld = true;
                    }
                }
            });
        }

        // Check for other player attacks
        if (player instanceof AzielSeraph || player instanceof HolyDiver) {
            if (player.box && this.box.collide(player.box) && this.game.closeAttack) {
                this.takeDamage(10);
            }
        }
    }

    draw(ctx) {
        const scale = this.spriteScale;
    
        const yOffset = 150; // Adjust this value to move the sprite up
    
        if (this.state === 'idle' || this.state === 'attacking') {
            if (this.facing === -1) {
                this.idleLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y - yOffset, 2);
            } else {
                this.idleRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y - yOffset, 2);
            }
        } else if (this.state === 'chasing') {
            if (this.facing === -1) {
                this.walkLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y - yOffset, 2);
            } else {
                this.walkRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y - yOffset, 2);
            }
        }
    
        // Draw red eye during charging phase
        if (this.laserState === 'charging' || this.laserState === 'firing') {
            const eyeX = this.facing === 1 ? this.x + 35 : this.x + 20;
            const eyeY = this.y - 10;
    
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    
        // Draw laser image when firing
        if (this.laserState === 'firing') {
            const laserX = this.facing === 1 ? this.x + 20 : this.x - 180; // Adjusted for facing direction
            const laserY = this.y - 16;
    
            ctx.drawImage(this.laserImage, laserX, laserY, 200, 20);
    
            // Debug: Draw laser hitbox
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 1;
            const hitboxX = this.facing === 1 ? this.x + 35 : this.x - 200;
            ctx.strokeRect(hitboxX, this.y - 20, 200, 30);
        }
    
        // Debug bounding box
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
    
        this.healthbar.draw(ctx);
    }
}