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
        
         // Laser attack system
         this.laserCooldown = 0;
         this.laserRange = 300; 
         this.laserDuration = 1; 
         this.laserState = 'inactive';
         this.laserStartTime = 0;
        
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

    update() {
        const TICK = this.game.clockTick;
        const player = this.getPlayer();

        if (this.hitpoints <= 0) {
            this.removeFromWorld = true;
            this.defeated = true;
            console.log("Boss defeated!");
            return;
        }

        if (!player) return;

        // Handle jumping
        if (this.shouldJump(player)) {
            const playerPlatform = this.getPlayerPlatform(player);
            const targetX = playerPlatform.x + playerPlatform.width/2;
            const targetY = playerPlatform.y - this.boxHeight;
            this.velocity = this.calculateJumpVelocity(targetX, targetY);
            this.landed = false;
        }

        // Normal movement
        const distToPlayer = Math.abs(this.x + this.width/2 - (player.x + player.box.width/2));
        const moveDir = player.x > this.x ? 1 : -1;

        if (this.landed) {  // Only move horizontally when landed
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

        // Apply gravity and movement
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;
        this.x += this.velocity.x * TICK;

        // Laser logic
        if (this.laserState === 'inactive' && this.laserCooldown <= 0) {
            if (distToPlayer < this.laserRange && distToPlayer > this.minDistance) {
                this.state = 'idle'; // Stay idle during attack
                this.laserState = 'charging';
                this.laserStartTime = performance.now();

                // Make sure Eclipser is facing the player before charging
                this.facing = moveDir;
            }
        }

        if (this.laserState === 'charging' && performance.now() - this.laserStartTime > 1000) {
            this.laserState = 'firing';
            this.laserStartTime = performance.now();
        }

        if (this.laserState === 'firing' && performance.now() - this.laserStartTime > 1000) {
            this.laserState = 'inactive';
            this.laserCooldown = 3; // Start cooldown
        }

        // Movement only when not attacking
        if (this.laserState === 'inactive' && distToPlayer > this.minDistance && distToPlayer < this.chaseRange) {
            this.state = 'chasing';
            this.x += this.moveSpeed * moveDir;
            this.facing = moveDir;
        }

        
        this.updateLastBB();
        this.updateBoundingBox();
        
        // Platform and ground collisions
        let isOnGround = false;
        this.game.entities.forEach(entity => {
            if (entity instanceof Platform) {
                if (this.box.collide(entity.box)) {
                    // Only check vertical collisions - no left/right checks
                    if (this.velocity.y > 0 && this.lastBox.bottom <= entity.box.top) {
                        this.velocity.y = 0;
                        this.y = entity.box.top - this.boxHeight;
                        this.landed = true;
                        isOnGround = true;
                    }
                }
            }
        });
        
        //damage to aziel
        this.game.entities.forEach(entity => {
            if (entity instanceof AzielSeraph && this.box.collide(entity.box) && this.state == `attacking`) {
                entity.takeDamage(10); // Deal 10 damage to boss
                console.log(`Aziel takes damage! HP: ${entity.hitpoints}`);
            }
        });


        // If not on any platform, check if we've fallen below ground level
        const groundLevel = gameWorld.height - 70;  // Adjust this value based on your ground height
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

        this.damageCooldown -= TICK;
        //this.checkPlayerAttack();
        this.healthbar.update();
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
        }
        
        // Debug bounding box
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);



        this.healthbar.draw(ctx);
    }
}