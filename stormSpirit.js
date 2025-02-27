class stormSpirit{
    constructor(game, x, speed) {
        this.game = game;

        // Load animations
        this.idleRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/stormSpirit/IdleRight.png`), 0, 0, 32, 32, 4, 0.5);
        this.idleLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/stormSpirit/IdleLeft.png`), 0, 0, 32, 32, 4, 0.5);
        this.walkRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/stormSpirit/runRight.png`), 0, 0, 32, 32, 6, 0.5);
        this.walkLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/stormSpirit/runLeft.png`), 0, 0, 32, 32, 6, 0.5);
        this.attackRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/stormSpirit/attackRight.png`), 0, 0, 32, 32, 6, 0.6);
        this.attackLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/stormSpirit/attackLeft.png`), 0, 0, 32, 32, 6, 0.6);

        // Position setup
        this.x = x;
        const groundHeight = gameWorld.height;
        this.y = groundHeight + 70;

        // Basic properties
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        // Increase the move speed by 3-4 times for faster movement
        this.moveSpeed = speed * 3.5;
        this.landed = true;

        this.spriteScale = 1.4;
        this.width = 32 * this.spriteScale;
        this.height = 32 * this.spriteScale;
        this.boxWidth = 32;
        this.boxHeight = 64;

        // State
        this.facing = -1;
        this.state = `idle`;
        this.targetPlatform = null;
        this.jumpPhase = `none`;
        this.isOnPlatform = false;
        this.jumpCooldown = 0;
        this.jumpAttemptTimer = 0;
        this.lastJumpTime = 0;

        // Combat ranges
        this.attackRange = 50;
        this.chaseRange = 500; // Increased chase range
        this.minDistance = 100;
        this.jumpThreshold = 500; // Increased jump threshold

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

        // Debug flag
        this.debug = true;
    }

    updateBoundingBox() {
        const xOffset = (this.width - this.boxWidth) / 2;
        this.box = new BoundingBox(
            this.x + xOffset + 10,
            this.y - 45,
            this.boxWidth - 5,
            this.boxHeight - 24
        );
    }

    updateLastBB() {
        this.lastBox = this.box;
    }

    calculateJumpVelocity(targetX, targetY) {
        // If targeting a platform, adjust targetX and targetY to the platform's center
        if (this.targetPlatform) {
            targetX = this.targetPlatform.x + this.targetPlatform.width / 2 - this.boxWidth / 2; // Center of platform
            targetY = this.targetPlatform.y - this.boxHeight; // Top of platform
        }

        const dx = targetX - this.x;
        const dy = targetY - this.y;

        // Determine horizontal speed based on distance
        let vx = dx > 0 ? 300 : -300; // Fixed horizontal speed
        if (Math.abs(dx) < 100) vx = dx * 3; // Scale down for small distances

        // Calculate time to reach targetX
        const time = Math.abs(dx / vx);

        // Calculate vertical velocity to reach targetY, accounting for gravity
        const vy = (dy - 0.5 * this.fallGrav * time * time) / time;

        // Ensure upward velocity is strong enough
        if (vy > 0 || Math.abs(vy) < 200) {
            const minVy = -800; // Minimum upward velocity for a decent jump
            if (this.debug) console.log(`Adjusted vy from ${vy} to ${minVy} for better jump`);
            return { x: vx, y: minVy };
        }

        if (this.debug) console.log(`Jump velocity: (${vx}, ${vy}), target: (${targetX}, ${targetY})`);

        return { x: vx, y: vy };
    }

    getCurrentPlatform() {
        let currentPlatform = null;
        this.game.entities.forEach(entity => {
            if (entity instanceof Platform) {
                // Check if stormSpirit is standing on this platform
                if (this.y + this.boxHeight >= entity.y - 10 &&
                    this.y + this.boxHeight <= entity.y + 20 && // Increased tolerance
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
                // Check if player is standing on this platform
                if (player.y + player.box.height >= entity.y - 10 &&
                    player.y + player.box.height <= entity.y + 20 && // Increased tolerance
                    player.x + player.box.width > entity.x &&
                    player.x < entity.x + entity.width) {
                    playerPlatform = entity;
                }
            }
        });
        return playerPlatform;
    }

    shouldJump(player) {
        // Don't jump if we're already in the air
        if (!this.landed) {
            return false;
        }

        const currentTime = this.game.timer.gameTime;
        const playerPlatform = this.getPlayerPlatform(player);
        const currentPlatform = this.getCurrentPlatform();

        // If on the same platform as Kanji, don't jump unless Kanji is much higher
        if (playerPlatform && currentPlatform && playerPlatform === currentPlatform) {
            // Only jump if Kanji is significantly higher (e.g., a small vertical gap on the same platform)
            if (player.y < this.y - 150) { // Increased threshold to prevent flicker
                if (this.debug) console.log("Kanji is much higher on same platform, will jump");
                this.lastJumpTime = currentTime;
                this.targetPlatform = playerPlatform;
                return true;
            }
            return false; // No jump needed, let chasing handle movement
        }

        // Jump if Kanji is on a different platform
        if (playerPlatform && (!currentPlatform || playerPlatform !== currentPlatform)) {
            if (this.debug) console.log("Kanji is on a different platform, will jump");
            this.lastJumpTime = currentTime;
            this.targetPlatform = playerPlatform;
            return true;
        }

        // Jump if Kanji is significantly higher and no platform is detected
        if (!currentPlatform && player.y < this.y - 100) {
            if (this.debug) console.log("Kanji is higher, no platform detected, will jump");
            this.lastJumpTime = currentTime;
            this.targetPlatform = playerPlatform;
            return true;
        }

        // Force a jump every few seconds if Kanji is higher and we haven’t jumped recently
        if (currentTime - this.lastJumpTime > 3 && player.y < this.y - 50 && (!currentPlatform || playerPlatform !== currentPlatform)) {
            if (this.debug) console.log("Forcing jump due to time and height difference");
            this.lastJumpTime = currentTime;
            this.targetPlatform = playerPlatform;
            return true;
        }

        return false;
    }
    takeDamage(amount) {
        if (this.damageCooldown <= 0) {
            this.hitpoints = Math.max(0, this.hitpoints - amount);
            this.damageCooldown = 0.5;
            console.log(`Boss takes ${amount} damage! Remaining HP: ${this.hitpoints}`);
        }
    }

    getPlayer() {
        // Find Kanji character first, if present
        let player = this.game.entities.find(entity => entity instanceof Kanji);

        // If Kanji not found, look for other player characters
        if (!player) {
            player = this.game.entities.find(entity =>
                entity instanceof AzielSeraph ||
                entity instanceof HolyDiver ||
                entity instanceof Grim
            );
        }

        return player;
    }

    checkPlayerAttack() {
        const player = this.getPlayer();
        if (!player) return;

        // Check for close attack collision
        if (player.box && this.box.collide(player.box)) {
            if (player instanceof AzielSeraph || player instanceof HolyDiver) {
                if (player.box && this.box.collide(player.box) && this.game.closeAttack) {
                    this.takeDamage(10);
                }
            } else if (player instanceof Grim) {
                if (player.game.closeAttack) {
                    this.takeDamage(10);
                }
            } else if (player instanceof Kanji) {
                if (player.attackBox && this.box.collide(player.attackBox) && player.attacking) {
                    this.takeDamage(15);
                }
            }
        }
    }

    update() {
        const TICK = this.game.clockTick;
        const player = this.getPlayer(); // Prioritizes Kanji

        if (this.hitpoints <= 0) {
            this.removeFromWorld = true;
            this.defeated = true;
            console.log("Boss defeated!");
            return;
        }

        if (!player) return;

        // Decrease jump cooldown
        if (this.jumpCooldown > 0) {
            this.jumpCooldown -= TICK;
        }

        // Check for player attacks
        this.checkPlayerAttack();

        // Handle jumping to player's platform
        if (this.shouldJump(player) && this.jumpCooldown <= 0) {
            let targetX = player.x; // Default to player position
            let targetY = player.y;

            // If targeting a platform, use its coordinates
            if (this.targetPlatform) {
                targetX = this.targetPlatform.x + this.targetPlatform.width / 2 - this.boxWidth / 2;
                targetY = this.targetPlatform.y - this.boxHeight;
            }

            // Calculate and apply jump velocity
            this.velocity = this.calculateJumpVelocity(targetX, targetY);
            this.landed = false;
            this.state = "jumping";

            // Set jump cooldown to prevent constant jumping
            this.jumpCooldown = 1.0;

            if (this.debug) console.log(`StormSpirit jumping to (${targetX}, ${targetY})`);
        }

        // Update state based on conditions
        const distToPlayer = Math.abs(this.x + this.width / 2 - (player.x + player.box.width / 2));
        const moveDir = player.x > this.x ? 1 : -1;
        const currentPlatform = this.getCurrentPlatform();
        const playerPlatform = this.getPlayerPlatform(player);

        if (this.landed) {
            if (distToPlayer < this.attackRange) {
                this.state = `attacking`;
            } else if (distToPlayer < this.chaseRange) {
                this.state = `chasing`;
                // Move faster when on the same platform
                const speedMultiplier = (currentPlatform && playerPlatform && currentPlatform === playerPlatform) ? 1.5 : 1;
                this.x += this.moveSpeed * moveDir * TICK * speedMultiplier;
                this.facing = moveDir;
            } else {
                this.state = `idle`;
            }
        } else {
            // In-air state handling
            this.state = "jumping";
            if (this.velocity.x > 0) {
                this.facing = 1;
            } else if (this.velocity.x < 0) {
                this.facing = -1;
            }
        }

        // Apply gravity and movement
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;
        if (!this.landed) {
            this.x += this.velocity.x * TICK;
        }

        this.updateLastBB();
        this.updateBoundingBox();

        // Platform collision handling
        let isOnGround = false;
        this.game.entities.forEach(entity => {
            if (entity instanceof Platform) {
                if (this.box.collide(entity.box)) {
                    if (this.velocity.y > 0 && this.lastBox.bottom <= entity.box.top) {
                        // Landing on a platform
                        this.velocity.y = 0;
                        this.y = entity.box.top - this.boxHeight;
                        this.landed = true;
                        isOnGround = true;
                        this.state = "idle"; // Reset to idle, let chasing take over
                        if (this.debug) console.log("Landed on platform");
                    } else if (this.velocity.y < 0 && this.lastBox.top >= entity.box.bottom) {
                        // Hitting head on bottom of platform
                        this.velocity.y = 0;
                        this.y = entity.box.bottom;
                    } else if (this.velocity.x > 0 && this.lastBox.right <= entity.box.left) {
                        // Hitting right side of platform
                        this.x = entity.box.left - this.boxWidth;
                        this.velocity.x = 0;
                    } else if (this.velocity.x < 0 && this.lastBox.left >= entity.box.right) {
                        // Hitting left side of platform
                        this.x = entity.box.right;
                        this.velocity.x = 0;
                    }
                }
            }
        });

        // If StormSpirit falls off, reset to the ground
        const groundLevel = gameWorld.height - 70;
        if (!isOnGround && this.y + this.boxHeight > groundLevel) {
            this.y = groundLevel - this.boxHeight;
            this.velocity.y = 0;
            this.velocity.x = 0;
            this.landed = true;
            this.state = "idle";
            if (this.debug) console.log("Reset to ground level");
        }

        // Screen boundaries
        if (this.x < 0) {
            this.x = 0;
            this.velocity.x = 0;
        }
        if (this.x > gameWorld.width - this.width) {
            this.x = gameWorld.width - this.width;
            this.velocity.x = 0;
        }

        this.damageCooldown -= TICK;
        this.healthbar.update();
    }

    draw(ctx) {
        const scale = this.spriteScale;

        // Adjust offset to align sprite with bounding box
        const xOffset = (this.width - 32) / 2; // 32 is the sprite frame width
        const yOffset = this.boxHeight - 115; // Adjust if sprite is not vertically aligned

        if (this.state === `attacking`) {
            if (this.facing === 1) {
                this.attackRightAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            } else {
                this.attackLeftAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            }
        } else if (this.state === `chasing` || this.state === `jumping`) {
            if (this.facing === 1) {
                this.walkRightAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            } else {
                this.walkLeftAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            }
        } else {
            if (this.facing === 1) {
                this.idleRightAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            } else {
                this.idleLeftAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            }
        }

        // Draw health bar
        this.healthbar.draw(ctx);

        // Draw bounding box for debugging
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
    }
}