class Eclipser {
    constructor(game) {
        this.game = game;
      
        // Load animations (keeping original animation setup)
        this.idleRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/eclipser/idleR.png`), 0, 0, 25, 108, 8, 0.35, true);
        this.idleLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/eclipser/idleL.png`), 0, 0, 25, 108, 8, 0.35, true);
        this.walkRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/eclipser/walkR.png`), 0, 0, 25, 108, 8, 0.35, true);
        this.walkLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/eclipser/walkL.png`), 0, 0, 25, 108, 8, 0.35, true);
        this.laserImage = ASSET_MANAGER.getAsset(`./sprites/eclipser/laser.png`);

        // Position and movement properties
        this.x = 900;
        const groundHeight = gameWorld.height - 70;
        this.y = groundHeight - 64;
        
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.moveSpeed = 3;
        this.landed = true;
        
        // Visual properties
        this.spriteScale = 2;
        this.width = 32 * this.spriteScale;    
        this.height = 32 * this.spriteScale;   
        this.boxWidth = 32;
        this.boxHeight = 64;  
        
        // State properties
        this.facing = -1;
        this.state = 'idle';
        this.isOnPlatform = false;
        
        // Combat properties
        this.laserCooldown = 3; // Increased cooldown between laser attacks
        this.laserTimer = this.laserCooldown;
        this.laserRange = 300; // Increased range
        this.laserState = 'inactive';
        this.laserChargeTime = 0.5;
        this.laserFireTime = 0.5;
        this.laserDamage = 50;
        this.laserDamageCooldown = 0.8; // Increased cooldown between damage ticks
        this.currentLaserDamageCooldown = 0;
        
        this.attackRange = 50;
        this.chaseRange = 400;
        this.minDistance = 150;

        // Health system
        this.hitpoints = 650;
        this.maxhitpoints = 650;
        
        this.healthbar = new HealthBar(this);
        this.damageCooldown = 0;
        this.invincibilityTime = 0.5; // Time of invincibility after taking damage

        //phasing through platforms
        this.isPhasing = false;
        this.phaseSpeed = 300;



        
        // Add minion spawn properties
        this.lowHealthThreshold = 0.3; // 30% health threshold
        this.hasSpawnedMinions = false;
        this.spawnedMinions = [];
        
        // Define minion spawn points
        this.minionSpawnPoints = [
            { x: 222, y: 200, speed: 300 },
            { x: 500, y: 111, speed: 201 }
        ];

        // Initialize bounding box
        this.updateBoundingBox();

        this.removeFromWorld = false;
        this.defeated = false;
    }

     // Add new method to spawn minions
    spawnMinions() {
        console.log(`Spawning minions!`);
        this.minionSpawnPoints.forEach(point => {
            const drone = new Drone(this.game, point.x, point.y, point.speed);
            this.game.addEntity(drone);
            this.spawnedMinions.push(drone);
        });
        this.hasSpawnedMinions = true;
    }

    // Add method to check if minions are alive
    areMinionsDead() {
        this.spawnedMinions = this.spawnedMinions.filter(minion => !minion.removeFromWorld);
        return this.spawnedMinions.length === 0;
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

    getCurrentPlatformY() {
        const tolerance = 5;
        const feetPosition = this.y + this.boxHeight;
        
        // Check each platform height
        if (Math.abs(feetPosition - 384) <= tolerance) return 384;  // High platform
        if (Math.abs(feetPosition - 480) <= tolerance) return 480;  // Middle platform
        if (Math.abs(feetPosition - 590) <= tolerance) return 590;  // Low platform
        if (Math.abs(feetPosition - 698) <= tolerance) return 698;  // Ground
        
        return null;
    }

    getPlayerPlatformY(player) {
        const tolerance = 5;
        const playerFeet = player.y + player.box.height;
        
        // Check each platform height
        if (Math.abs(playerFeet - 384) <= tolerance) return 384;  // High platform
        if (Math.abs(playerFeet - 480) <= tolerance) return 480;  // Middle platform
        if (Math.abs(playerFeet - 590) <= tolerance) return 590;  // Low platform
        if (Math.abs(playerFeet - 698) <= tolerance) return 698;  // Ground
        
        return null;
    }

    shouldPhase(player) {
        const currentY = this.getCurrentPlatformY();
        const playerY = this.getPlayerPlatformY(player);
        
        if (currentY && playerY) {
            return playerY < currentY; // Return true if player is higher
        }
        return false;
    }

    phaseTowardsPlayer(player, TICK) {
        const playerPlatformY = this.getPlayerPlatformY(player);
        if (!playerPlatformY) return;

        // Calculate target Y position (subtract boxHeight to align feet with platform)
        const targetY = playerPlatformY - this.boxHeight;
        
        // Move vertically at a fixed rate
        const phaseSpeed = 300; // Adjust this value to change phasing speed
        
        if (this.y > targetY) {
            this.y -= phaseSpeed * TICK;
            if (this.y < targetY) this.y = targetY;
        }
    }

    getCurrentPlatform() {
        let currentPlatform = null;

        this.game.entities.forEach(entity => {
            if (entity instanceof Platform) {
                // Check if Eclipser is standing on a platform
                if (
                    this.y + this.boxHeight >= entity.y &&  // Bottom of Eclipser is at or below platform top
                    this.y + this.boxHeight <= entity.y + Math.abs(this.velocity.y) + 5 && // Small buffer to prevent falling through
                    this.x + this.boxWidth > entity.x &&   // Eclipser's right side is beyond platform's left side
                    this.x < entity.x + entity.width       // Eclipser's left side is before platform's right side
                ) {
                    currentPlatform = entity;
                    this.landed = true;
                    this.velocity.y = 0; // Stop falling
                    this.jumpPhase = 'none';
                    this.y = entity.y - this.boxHeight; // Snap to platform top
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
            this.hitpoints -= amount;
            this.damageCooldown = this.invincibilityTime;
        }
    }

    getPlayer() {
        // Find any entity that's a player (AzielSeraph or Grim)
        return this.game.entities.find(entity => 
            entity instanceof AzielSeraph || entity instanceof HolyDiver || entity instanceof Grim || entity instanceof Kanji || entity instanceof Kyra
        );
    }

    handleLaserDamage(player, TICK) {
        if (this.laserState === 'firing') {
            // Update laser damage cooldown
            if (this.currentLaserDamageCooldown > 0) {
                this.currentLaserDamageCooldown -= TICK;
            }
    
            const laserStartX = this.facing === 1 ? this.x + this.boxWidth/2 : this.x - 180
            let laserWidth = 200;
            if (this.facing != 1) {
                laserWidth = 230;
            }
            const laserBox = new BoundingBox(
                laserStartX,
                this.y - 20,
                laserWidth,
                40 
            );
    
            if (player && player.box.collide(laserBox)) {
                if (this.currentLaserDamageCooldown <= 0) {
                    player.takeDamage(this.laserDamage);
                    this.currentLaserDamageCooldown = this.laserDamageCooldown;
                    console.log(`attacking`)
                }
            }
        }
    }
    
    update() {
        const TICK = this.game.clockTick;
        const player = this.getPlayer();
    
        if (!player || this.hitpoints <= 0) {
            if (this.hitpoints <= 0) {
                this.removeFromWorld = true;
                this.defeated = true;
            }
            return;
        }
        // Check if health is low and should spawn minions
        const healthRatio = this.hitpoints / this.maxhitpoints;
        if (healthRatio <= this.lowHealthThreshold && !this.hasSpawnedMinions) {
            this.spawnMinions();
        }

        // Check if minions are dead and can spawn again
        if (this.hasSpawnedMinions && this.areMinionsDead()) {
            this.hasSpawnedMinions = true;  // Allow spawning again
        }
        // Update timers
        if (this.laserTimer > 0) this.laserTimer -= TICK;
        if (this.damageCooldown > 0) this.damageCooldown -= TICK;
    
        const playerCenterX = player.box.x + player.box.width / 2;
        const playerCenterY = player.box.y + player.box.height / 2;
        const eclipserCenterX = this.box.x + this.box.width / 2;
        const eclipserCenterY = this.box.y + this.box.height / 2;
        
        const distToPlayerX = Math.abs(eclipserCenterX - playerCenterX);
        const distToPlayerY = Math.abs(eclipserCenterY - playerCenterY);
        const moveDir = playerCenterX > eclipserCenterX ? 1 : -1;
    
        // **NEW: Smooth vertical movement toward the player**
        const floatSpeed = 50;  // Adjust speed to control how fast Eclipser moves vertically
        if (distToPlayerY > 10) {
            this.y += (playerCenterY > eclipserCenterY ? floatSpeed : -floatSpeed) * TICK;
        }
    
        // **NEW: Prevent jitter by ensuring state changes only when necessary**
        const moveThreshold = 1;  // Minimum movement required to switch states
    
        if (distToPlayerX > this.minDistance) {
            if (Math.abs(this.velocity.x) > moveThreshold) { 
                this.state = 'chasing';
            }
            this.x += this.moveSpeed * moveDir;
            this.facing = moveDir;
        } else {
            if (this.state !== 'idle') {
                this.state = 'idle';
            }
        }
    
        // **Prevent animation reset if already in the correct animation state**
        if (this.state === 'chasing') {
            if ((this.facing === 1 && this.animator !== this.walkRightAnim) ||
                (this.facing === -1 && this.animator !== this.walkLeftAnim)) {
                this.animator = this.facing === 1 ? this.walkRightAnim : this.walkLeftAnim;
            }
        } else if (this.state === 'idle') {
            if ((this.facing === 1 && this.animator !== this.idleRightAnim) ||
                (this.facing === -1 && this.animator !== this.idleLeftAnim)) {
                this.animator = this.facing === 1 ? this.idleRightAnim : this.idleLeftAnim;
            }
        }
    
        // **Handle laser attacks**
        switch (this.laserState) {
            case 'inactive':
                if (this.laserTimer <= 0 && distToPlayerX < this.laserRange) {
                    this.laserState = 'charging';
                    this.laserTimer = this.laserChargeTime;
                    this.facing = moveDir;
                }
                break;
    
            case 'charging':
                this.laserTimer -= TICK;
                if (this.laserTimer <= 0) {
                    this.laserState = 'firing';
                    this.laserTimer = this.laserFireTime;
                    this.currentLaserDamageCooldown = 0;
                }
                break;
    
            case 'firing':
                this.handleLaserDamage(player, TICK);
                this.laserTimer -= TICK;
                if (this.laserTimer <= 0) {
                    this.laserState = 'inactive';
                    this.laserTimer = this.laserCooldown;
                }
                break;
        }
    
        this.updateLastBB();
        this.updateBoundingBox();
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
    
            ctx.fillStyle = `red`;
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
            if (this.game.debugMode) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 1;
            const hitboxX = this.facing === 1 ? this.x + this.boxWidth/2 : this.x - 180;
            let laserWidth = 200;
            if (this.facing != 1) {
                laserWidth = 230;
            }
            ctx.strokeRect(hitboxX, this.y - 20, laserWidth, 30);
            }
        }

        if (this.isPhasing) {
            ctx.globalAlpha = 0.5;  // Make boss semi-transparent while phasing
        }
    

        ctx.globalAlpha = 1.0;
        
        if (this.game.debugMode) {
            ctx.strokeStyle = `red`;
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        };
    
        this.healthbar.draw(ctx);
    }
    
    
}
