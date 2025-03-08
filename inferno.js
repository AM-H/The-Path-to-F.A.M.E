class inferno {
    constructor(game) {
        this.game = game;

        // Load animations
        this.idleRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/IdleRight.png`), -55, 11, 150, 64, 8, 0.09);
        this.idleLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/IdleLeft.png`), -55, 11, 150, 64, 8, 0.09);
        this.walkRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/runRight.png`), -55, 11, 150, 64, 8, 0.09);
        this.walkLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/runLeft.png`), -55, 11, 150, 64, 8, 0.09);
        this.attackRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/attackRight.png`),-28, 11, 150, 64, 8, 0.08);
        this.attackLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/attackLeft.png`), -28, 11, 150, 64, 8, 0.08);
        this.tornadoCastRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/tornadoCastRight.png`), -28, 11, 150, 64, 8, 0.08);
        this.tornadoCastLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/tornadoCastLeft.png`), -28, 11, 150, 64, 8, 0.08);

        // Position setup - start on right side
        this.x = gameWorld.width - 200;
        const groundHeight = gameWorld.height - 70;
        this.y = groundHeight - 70;

        // Basic properties
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.moveSpeed = 175;
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

        this.timeAbovePlayer = 0;
        this.maxTimeAbovePlayer = 1.0; // Increased to 1 second from 0.5
        this.isCloseAttacking = false;
        this.isPhasing = false; // Flag to track when we're phasing through platforms
        this.phasingTime = 0;   // Track how long we've been phasing
        this.maxPhasingTime = 1.5; // Maximum phasing duration in seconds

        // Combat ranges
        this.attackRange = 95;
        this.chaseRange = 400; // Distance to player when boss will start chasing
        this.attackDistance = 40; // Distance to maintain when attacking
        this.tornadoAttackRange = 300; // Range for tornado attack

        // Attack properties
        this.attackBoxWidth = 70; // Width of attack hit box
        this.attackBoxHeight = 40; // Height of attack hit box
        this.attackDuration = 0; // Track attack animation
        this.attackAnimationDuration = 0.8; // Total duration of attack animation
        this.attackCooldown = 0; // Cooldown between attacks

        // Tornado attack properties
        this.tornadoCooldown = 0;
        this.tornadoCastDuration = 0;
        this.tornadoCastAnimationDuration = 0.8;
        this.tornadoMaxCooldown = 7; // Seconds between tornado attacks
        this.isCastingTornado = false;

        // Initialize bounding boxes
        this.updateBoundingBox();
        this.lastBox = this.box;

        // Initialize attack box (will be updated during attacks)
        this.attackBox = null;

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

        // Store the top, bottom, left, right properties for easier collision detection
        this.box.top = this.box.y;
        this.box.bottom = this.box.y + this.box.height;
        this.box.left = this.box.x;
        this.box.right = this.box.x + this.box.width;
    }

    updateAttackBox() {
        // Only create attack box during attack state
        if (this.state === 'attacking') {
            let xOffset;
            // Position attack box based on facing direction
            if (this.facing === 1) { // Facing right
                xOffset = this.box.x + this.boxWidth; // Position at right edge of boss
            } else { // Facing left
                xOffset = this.box.x - this.attackBoxWidth; // Position at left edge of boss
            }

            // Y position centered vertically with boss
            const yOffset = this.box.y + (this.boxHeight / 2) - (this.attackBoxHeight / 2);

            this.attackBox = new BoundingBox(
                xOffset,
                yOffset,
                this.attackBoxWidth,
                this.attackBoxHeight
            );
        } else {
            this.attackBox = null;
        }
    }

    updateLastBB() {
        // Create a deep copy of the box with all properties
        this.lastBox = new BoundingBox(
            this.box.x,
            this.box.y,
            this.box.width,
            this.box.height
        );

        // Copy edge properties
        this.lastBox.top = this.box.top;
        this.lastBox.bottom = this.box.bottom;
        this.lastBox.left = this.box.left;
        this.lastBox.right = this.box.right;
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

    // Check if boss can jump onto a platform
    canJump() {
        // Get player's platform if any
        const player = this.getPlayer();
        const playerPlatform = player ? this.getPlayerPlatform(player) : null;

        // Try to jump to player's platform if player is on one
        if (playerPlatform && playerPlatform.box.y < this.box.y) {
            const horizontalDistance = Math.abs(player.box.x - this.box.x);
            // If close enough horizontally and player is above, prioritize jumping to that platform
            if (horizontalDistance < 200) {
                return true;
            }
        }

        // Otherwise look for any nearby platform above
        return this.game.entities.some(entity =>
            entity instanceof Platform &&
            entity.box.y < this.box.y && // The platform is above
            ((Math.abs(entity.box.left - this.box.left) < 100) ||
                (Math.abs(entity.box.right - this.box.right) < 100)) // platform within reach horizontally
        );
    }

    // Check if boss should start phasing through platforms
    shouldStartPhasing(player) {
        if (!player || this.isPhasing) return false;

        // Check if boss is on a platform
        const currentPlatform = this.getCurrentPlatform();
        if (!currentPlatform) return false;

        // Check if player is below the boss
        const distanceY = player.box.y - this.box.y;
        const distanceX = Math.abs(player.box.x - this.box.x);

        // Boss is above player and accumulated enough time above
        return (distanceY > 20) && (distanceX < 150) && (this.timeAbovePlayer >= this.maxTimeAbovePlayer);
    }

    // Cast tornado attack
    castTornadoAttack() {
        if (this.tornadoCooldown <= 0 && !this.isCastingTornado) {
            // Update facing direction based on player's position before casting
            const player = this.getPlayer();
            if (player) {
                const distanceX = player.box.x - this.box.x;
                this.facing = distanceX > 0 ? 1 : -1; // Face right if player is to the right, left if player is to the left
                console.log(`Casting tornado, facing:`, this.facing); // Debug log to confirm facing
            }

            this.state = 'castingTornado';
            this.isCastingTornado = true;
            this.tornadoCastDuration = 0;
            this.velocity.x = 0; // Stop movement during casting
        }
    }

    // Complete tornado cast and release the tornado
    completeTornadoCast() {
        // Recalculate facing direction before spawning projectile
        const player = this.getPlayer();
        if (player) {
            const distanceX = player.box.x - this.box.x;
            this.facing = distanceX > 0 ? 1 : -1; // Face right if player is to the right, left if player is to the left
            console.log(`Completing tornado cast, facing:`, this.facing); // Debug log to confirm facing
        }

        // Create the tornado projectile
        const tornadoOffsetX = this.facing === 1 ? this.boxWidth + 20 : -20;
        const tornadoY = this.box.y + this.boxHeight / 2;
        const tornadoX = this.box.x + (this.facing === 1 ? this.boxWidth : 0) + tornadoOffsetX;

        const tornado = new TornadoAttack(this.game, tornadoX, tornadoY, false); // Removed unused facing parameter
        this.game.addEntity(tornado);

        // Reset state and set cooldown
        this.isCastingTornado = false;
        this.tornadoCooldown = this.tornadoMaxCooldown;
        this.state = 'idle';
    }

    // Track player and move
    trackPlayerAndMove() {
        const TICK = this.game.clockTick;
        const player = this.getPlayer();

        if (!player) return;

        const distanceX = player.box.x - this.box.x;
        const distanceY = player.box.y - this.box.y;
        const jumpSpeed = -1130;
        const absoluteDistanceX = Math.abs(distanceX);

        // Handle cooldowns
        if (this.attackCooldown > 0) {
            this.attackCooldown -= TICK;
        }
        if (this.tornadoCooldown > 0) {
            this.tornadoCooldown -= TICK;
        }

        // Handle tornado casting state
        if (this.state === 'castingTornado') {
            this.tornadoCastDuration += TICK;
            if (this.tornadoCastDuration >= this.tornadoCastAnimationDuration) {
                this.completeTornadoCast();
            }
            return; // Skip other movement while casting
        }

        // Handle phasing time tracking
        if (this.isPhasing) {
            this.phasingTime += TICK;
            if (this.phasingTime >= this.maxPhasingTime) {
                this.isPhasing = false;
                this.phasingTime = 0;
                this.timeAbovePlayer = 0;
            }
        }

        // Track time spent above player when player is below
        if (distanceY > 20) {
            this.timeAbovePlayer += TICK;
            if (this.shouldStartPhasing(player)) {
                this.isPhasing = true;
                this.phasingTime = 0;
                this.landed = false;
                console.log(`Boss is phasing through platform`);
            }
        } else {
            this.timeAbovePlayer = 0;
        }

        // If not phasing, handle landing state for normal movement
        if (!this.isPhasing && this.landed) {
            // Attack state handling
            if (this.state === 'attacking') {
                this.attackDuration += TICK;
                if (this.attackDuration >= this.attackAnimationDuration) {
                    this.state = 'idle';
                    this.attackDuration = 0;
                    this.attackCooldown = 1;
                    this.isCloseAttacking = false;
                }
                this.velocity.x = 0; // Stop movement during attack
            }
            // Check if we should cast tornado (prioritize over melee attack)
            else if (absoluteDistanceX < this.tornadoAttackRange &&
                absoluteDistanceX > this.attackRange &&
                Math.abs(distanceY) < 100 &&
                this.tornadoCooldown <= 0) {
                this.facing = distanceX > 0 ? 1 : -1;
                this.castTornadoAttack();
            }
            // Check for melee attack conditions
            else if (absoluteDistanceX < this.attackRange &&
                Math.abs(distanceY) < this.attackRange &&
                this.attackCooldown <= 0) {
                this.state = 'attacking';
                this.isCloseAttacking = true;
                this.attackDuration = 0;
                if (absoluteDistanceX < this.attackDistance) {
                    const pushDistance = (this.attackDistance - absoluteDistanceX) * (distanceX > 0 ? -1 : 1);
                    this.x += pushDistance;
                }
                if (player.takeDamage && this.damageCooldown <= 0) {
                    player.takeDamage(10);
                    this.damageCooldown = 0.5;
                }
            }
            // Chase logic, including edge cases
            else {
                if (absoluteDistanceX > this.attackDistance) {
                    this.velocity.x = distanceX > 0 ? this.moveSpeed : -this.moveSpeed;
                    if (this.state !== 'castingTornado') { // Only update facing if not casting
                        this.facing = distanceX > 0 ? 1 : -1;
                    }
                    this.state = 'chasing';
                } else if (absoluteDistanceX < this.attackDistance) {
                    this.velocity.x = distanceX > 0 ? -this.moveSpeed : this.moveSpeed;
                    if (this.state !== 'castingTornado') { // Only update facing if not casting
                        this.facing = distanceX > 0 ? 1 : -1;
                    }
                    this.state = 'chasing';
                } else {
                    this.velocity.x = 0;
                    if (this.state !== 'castingTornado') { // Only update facing if not casting
                        this.facing = distanceX > 0 ? 1 : -1;
                    }
                    this.state = 'idle';
                }


                // Vertical movement - jump if player is above
                if (distanceY < -60 && this.canJump() && this.state !== 'attacking') {
                    this.velocity.y = jumpSpeed;
                    this.landed = false;
                    this.jumpPhase = 'jumping';
                    const playerPlatform = this.getPlayerPlatform(player);
                    if (playerPlatform) {
                        const platformCenter = playerPlatform.x + (playerPlatform.width / 2);
                        const bossCenter = this.box.x + (this.boxWidth / 2);
                        this.velocity.x = platformCenter > bossCenter ?
                            this.moveSpeed * 1.5 : -this.moveSpeed * 1.5;
                    }
                }
            }
        } else {
            // In air or phasing, continue tracking player horizontally
            this.velocity.x = distanceX > 0 ? this.moveSpeed : -this.moveSpeed;
            if (this.state !== 'castingTornado') { // Only update facing if not casting
                this.facing = distanceX > 0 ? 1 : -1;
            }
            this.state = 'chasing';
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
            entity instanceof AzielSeraph || entity instanceof Kyra ||
            entity instanceof Grim || entity instanceof Kanji
        );
    }

    update() {
        const TICK = this.game.clockTick;
        const player = this.getPlayer();

        if (this.hitpoints <= 0) {
            this.defeated = true;
            this.removeFromWorld = true;
            console.log(`Boss defeated!`);
            return;
        }

        if (!player) return;

        this.trackPlayerAndMove();

        // Apply gravity and movement
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;
        this.x += this.velocity.x * TICK;

        // Boundary checks (only clamp if not chasing)
        if (this.state !== 'chasing') {
            if (this.x < 0) this.x = 0;
            if (this.x > gameWorld.width - this.width) {
                this.x = gameWorld.width - this.width;
            }
        }

        this.updateLastBB();
        this.updateBoundingBox();
        this.updateAttackBox();

        // Handle platform collisions and ground detection
        let isOnGround = false;
        this.game.entities.forEach(entity => {
            if (entity instanceof Platform) {
                if (this.box.collide(entity.box)) {
                    if (!this.isPhasing && this.velocity.y > 0 && this.lastBox.bottom <= entity.box.top + 5) {
                        this.velocity.y = 0;
                        this.y = entity.box.top - this.boxHeight;
                        this.landed = true;
                        this.jumpPhase = 'none';
                        isOnGround = true;
                    }
                }
            }
        });

        const groundLevel = gameWorld.height - 70;
        if (!isOnGround && this.y + this.boxHeight > groundLevel) {
            this.y = groundLevel - this.boxHeight;
            this.velocity.y = 0;
            this.landed = true;
            this.jumpPhase = 'none';
            this.isPhasing = false;
        }

        if (this.attackBox && player && this.state === 'attacking') {
            if (this.attackBox.collide(player.box) && this.damageCooldown <= 0) {
                player.takeDamage(10);
                this.damageCooldown = 0.5;
            }
        }

        this.damageCooldown -= TICK;
        this.healthbar.update();
    }

    draw(ctx) {
        // Draw the appropriate animation based on state and direction
        if (this.state === 'castingTornado') {
            if (this.facing === -1) {
                this.tornadoCastLeftAnim.drawFrame(this.game.clockTick, ctx, this.x + 30, this.y, 1.25, false, true);
            } else {
                this.tornadoCastRightAnim.drawFrame(this.game.clockTick, ctx, this.x + 48, this.y, 1.25);
            }
        } else if (this.state === 'attacking') {
            if (this.facing === -1) {
                this.attackLeftAnim.drawFrame(this.game.clockTick, ctx, this.x + 30, this.y, 1.25, false, true);
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

        // Debug bounding boxes
        if (this.game.debugMode) {
            // Draw character box in red
            ctx.strokeStyle = `red`;
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);

            // Draw attack box in yellow when attacking
            if (this.attackBox) {
                ctx.strokeStyle = `yellow`;
                ctx.lineWidth = 2;
                ctx.strokeRect(this.attackBox.x, this.attackBox.y, this.attackBox.width, this.attackBox.height);

                // Optional: Show attack area with semi-transparent fill
                ctx.fillStyle = `rgba(255, 255, 0, 0.3)`;
                ctx.fillRect(this.attackBox.x, this.attackBox.y, this.attackBox.width, this.attackBox.height);
            }

            // Show phasing indicator when phasing through platforms
            if (this.isPhasing) {
                ctx.fillStyle = `rgba(255, 0, 255, 0.6)`;
                ctx.fillRect(this.box.x - 10, this.box.y - 20, this.boxWidth + 20, 10);

                // Show phasing duration
                const progressWidth = (this.phasingTime / this.maxPhasingTime) * (this.boxWidth + 20);
                ctx.fillStyle = `rgba(255, 128, 0, 0.8)`;
                ctx.fillRect(this.box.x - 10, this.box.y - 20, progressWidth, 10);
            }

            // Show tornado cooldown
            if (this.tornadoCooldown > 0) {
                const cooldownWidth = (this.tornadoCooldown / this.tornadoMaxCooldown) * this.boxWidth;
                ctx.fillStyle = `rgba(0, 200, 255, 0.6)`;
                ctx.fillRect(this.box.x, this.box.y - 10, cooldownWidth, 5);

                // Display cooldown text
                ctx.font = '10px Arial';
                ctx.fillStyle = 'white';
                ctx.fillText(`Tornado: ${this.tornadoCooldown.toFixed(1)}s`,
                    this.box.x, this.box.y - 15);
            }
        }

        this.healthbar.draw(ctx);
    }
}