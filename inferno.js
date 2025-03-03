class inferno {
constructor(game) {
    this.game = game;

    // Just use one animation - idle right
    this.idleRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/IdleRight.png`), -55, 11, 150, 64, 8, 0.6);
    
    // Position setup - start on right side
    this.x = gameWorld.width - 200;
    const groundHeight = gameWorld.height - 70;
    this.y = groundHeight - 70;

    // Basic properties
    this.velocity = { x: 0, y: 0 };
    this.fallGrav = 2000;
    this.moveSpeed = 2; // Adjusted to be faster than 1.5 but still slower than original 3
    this.landed = true;

    // Sprite dimensions
    this.spriteScale = 2;
    this.width = 150 * this.spriteScale;
    this.height = 64 * this.spriteScale;
    this.boxWidth = 32;
    this.boxHeight = 64;

    // State
    this.facing = 1; // Default facing direction
    
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

shouldJump(player) {
    if (!this.landed) return false;

    const playerPlatform = this.getPlayerPlatform(player);
    const currentPlatform = this.getCurrentPlatform();

    // If player or boss is not on a platform, don't jump
    if (!playerPlatform || !currentPlatform) return false;

    // If player is on a higher platform and within chase range, jump
    return playerPlatform.y < currentPlatform.y &&
        Math.abs(this.x - player.x) < 400;
}

calculateJumpVelocity(targetX, targetY) {
    // Simple jump calculation to reach the target
    const jumpTime = 0.8; // Time to reach apex
    const dx = targetX - this.x;
    const vx = dx / jumpTime;
    const dy = targetY - this.y;
    const vy = (dy - (0.5 * this.fallGrav * jumpTime * jumpTime)) / jumpTime;
    return { x: vx * 0.6, y: vy * 0.8 }; // Scale for better game feel
}

updateLastBB() {
    this.lastBox = this.box;
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

    // Handle jumping to player's platform
    if (this.shouldJump(player)) {
        const playerPlatform = this.getPlayerPlatform(player);
        const targetX = player.x; // Jump toward player's position
        const targetY = playerPlatform.y - this.boxHeight;
        this.velocity = this.calculateJumpVelocity(targetX, targetY);
        this.landed = false;
        console.log("Boss jumping to platform");
    }

    // Calculate relative positions
    const bossCenter = this.x + this.width/2;
    const playerCenter = player.x + player.box.width/2;
    const distToPlayer = Math.abs(bossCenter - playerCenter);
    const moveDir = playerCenter > bossCenter ? 1 : -1;
    
    // Maintain minimum distance from player (stops following when too close)
    const minDistance = 100; // Minimum distance to keep from player
    
    if (distToPlayer > minDistance && this.landed) {
        // Only move toward player if beyond minimum distance and landed
        this.x += this.moveSpeed * moveDir;
    }
    
    // Update facing direction based on player position
    this.facing = moveDir;

    // Apply gravity and movement
    this.velocity.y += this.fallGrav * TICK;
    this.y += this.velocity.y * TICK;
    
    // Apply horizontal velocity when jumping
    if (!this.landed) {
        this.x += this.velocity.x * TICK;
    }

    this.updateLastBB();
    this.updateBoundingBox();

    // Platform and ground collisions
    let isOnGround = false;
    this.game.entities.forEach(entity => {
        if (entity instanceof Platform) {
            if (this.box.collide(entity.box)) {
                // Bottom collision with platforms
                if (this.velocity.y > 0 && this.lastBox.bottom <= entity.box.top) {
                    this.velocity.y = 0;
                    this.y = entity.box.top - this.boxHeight;
                    this.landed = true;
                    isOnGround = true;
                }
                
                // Side collisions with platforms
                if (this.lastBox.right <= entity.box.left) {
                    this.x = entity.box.left - this.boxWidth;
                } else if (this.lastBox.left >= entity.box.right) {
                    this.x = entity.box.right;
                }
                
                // No top collision check as requested
            }
        }
    });

    // Ground level check
    const groundLevel = gameWorld.height - 70;
    if (!isOnGround && this.y + this.boxHeight > groundLevel) {
        this.y = groundLevel - this.boxHeight;
        this.velocity.y = 0;
        this.landed = true;
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
    // Always draw idle right animation regardless of direction
    this.idleRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25);
    
    // Debug bounding box
    if (this.game.debugMode) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
    }
    
    this.healthbar.draw(ctx);
}
}