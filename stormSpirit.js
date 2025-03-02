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
        this.y =  gameWorld.height - 200;

        // Basic properties
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        // Increase the move speed by 3-4 times for faster movement
        this.moveSpeed = speed;
        this.landed = true;

        this.spriteScale = 1.4;
        this.width = 32 * this.spriteScale;
        this.height = 32 * this.spriteScale;
        this.boxHeight = 36;
        this.boxWidth = 32;
       this.box = new BoundingBox(this.x + 5, this.y, 32, 36);
        // State
        this.facing = -1;
        this.state = `idle`;
        this.targetPlatform = null;

        this.jumpCooldown = 0;

        this.lastJumpTime = 0;

        // Combat ranges
        this.attackRange = 50;
        this.chaseRange = 500; // Increased chase range


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
        this.box = new BoundingBox(this.x + xOffset, this.y, 32, 36);
    }

    updateLastBB() {
        this.lastBox = this.box;
    }

    calculateJumpVelocity(targetX, targetY) {
        if (this.targetPlatform) {
            targetX = this.targetPlatform.x + this.targetPlatform.width / 2 - 32 / 2;
            targetY = this.targetPlatform.y - 64; // Align with platform top
        }

        const dx = targetX - this.x;
        const dy = targetY - this.y;

        let vx = dx > 0 ? 300 : -300;
        if (Math.abs(dx) < 100) vx = dx * 3;

        const time = Math.abs(dx / vx);
        let vy = (dy - 0.5 * this.fallGrav * time * time) / time;

        // Cap vertical velocity for more controlled jumps
        if (vy > 0 || Math.abs(vy) < 200) {
            vy = -800; // Consistent upward impulse
        } else if (vy < -1000) {
            vy = -1000; // Prevent overly strong jumps
        }

        if (this.debug) console.log(`Jump velocity: (${vx}, ${vy}), target: (${targetX}, ${targetY})`);
        return { x: vx, y: vy };
    }

    getCurrentPlatform() {
        let currentPlatform = null;
        this.game.entities.forEach(entity => {
            if (entity instanceof Platform) {
                // Check if StormSpirit's bottom is close to or slightly below the platform's top
                if (this.y + this.boxHeight >= entity.y - 5 && // Reduced tolerance from -10 to -5
                    this.y + this.boxHeight <= entity.y + 10 && // Reduced tolerance from +20 to +10
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
        const player = this.getPlayer();

        if (this.hitpoints <= 0) {
            this.removeFromWorld = true;
            this.defeated = true;
            console.log("Boss defeated!");
            return;
        }

        if (!player) return;

        if (this.jumpCooldown > 0) {
            this.jumpCooldown -= TICK;
        }

        this.checkPlayerAttack();

        // Handle jumping to player's platform
        if (this.shouldJump(player) && this.jumpCooldown <= 0) {
            let targetX = player.x;
            let targetY = player.y;

            if (this.targetPlatform) {
                targetX = this.targetPlatform.x + this.targetPlatform.width / 2 - this.boxWidth / 2;
                targetY = this.targetPlatform.y - this.boxHeight;
            }

            // Set facing direction based on jump target
            this.facing = targetX > this.x ? 1 : -1; // Face right (1) if targetX is right, left (-1) if left

            this.velocity = this.calculateJumpVelocity(targetX, targetY);
            this.landed = false;
            this.state = "jumping";
            this.jumpCooldown = 1.0;

            if (this.debug) console.log(`StormSpirit jumping to (${targetX}, ${targetY}), facing: ${this.facing}`);
        }

        const distToPlayer = Math.abs(this.x + this.width / 2 - (player.x + player.box.width / 2));
        const moveDir = player.x > this.x ? 1 : -1;
        const currentPlatform = this.getCurrentPlatform();
        const playerPlatform = this.getPlayerPlatform(player);

        if (this.landed) {
            if (distToPlayer < this.attackRange) {
                this.state = `attacking`;
                this.velocity.x = 0;
            } else if (distToPlayer < this.chaseRange) {
                if (this.state !== 'chasing' || Math.abs(this.velocity.x) < 1) {
                    this.state = `chasing`;
                }
                const speedMultiplier = (currentPlatform && playerPlatform && currentPlatform === playerPlatform) ? 1.5 : 1;
                this.velocity.x = this.moveSpeed * moveDir * speedMultiplier;
                this.x += this.velocity.x * TICK;
                this.facing = moveDir;
            } else {
                this.state = `idle`;
                this.velocity.x = 0;
            }
        }

        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;
        if (!this.landed) {
            this.x += this.velocity.x * TICK;
        }

        this.updateLastBB();

        let isOnGround = false;
        this.game.entities.forEach(entity => {
            if (entity instanceof Platform) {
                this.updateBoundingBox();
                if (this.box.collide(entity.box)) {
                    if (this.velocity.y > 0 && this.lastBox.bottom <= entity.box.top) {
                        this.y = entity.box.top - this.boxHeight;
                        this.velocity.y = 0;
                        this.landed = true;
                        isOnGround = true;
                        this.state = "idle";
                        if (this.debug) console.log("Landed on platform at y:", this.y);
                    } else if (this.velocity.x > 0 && this.lastBox.right <= entity.box.left) {
                        this.x = entity.box.left - this.boxWidth;
                        this.velocity.x = 0;
                    } else if (this.velocity.x < 0 && this.lastBox.left >= entity.box.right) {
                        this.x = entity.box.right;
                        this.velocity.x = 0;
                    }
                }
            }
        });

        this.updateBoundingBox();

        const groundLevel = gameWorld.height - 70;
        if (!isOnGround && this.y + this.boxHeight > groundLevel) {
            this.y = groundLevel - this.boxHeight;
            this.velocity.y = 0;
            this.velocity.x = 0;
            this.landed = true;
            this.state = "idle";
            this.updateBoundingBox();
            if (this.debug) console.log("Reset to ground level at y:", this.y);
        }

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
        const xOffset = (this.width - this.boxWidth) / 2;
        const yOffset = this.boxHeight - 45;

        // Log state and velocity for debugging
        if (this.debug) {
            console.log(`State: ${this.state}, Velocity X: ${this.velocity.x}, Facing: ${this.facing}`);
        }

        // Check if the character is moving horizontally (with a small threshold to avoid jitter)
        const isMoving = Math.abs(this.velocity.x) > 0.1; // Lowered threshold from 1 to 0.1 for sensitivity

        if (this.state === `attacking`) {
            if (this.facing === 1) {
                this.attackRightAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            } else {
                this.attackLeftAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            }
        } else if (this.state === `jumping`) {
            // Use walking animations during jump for consistency (or adjust if you want a unique jump animation)
            if (this.facing === 1) {
                this.walkRightAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            } else {
                this.walkLeftAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            }
        } else if (isMoving && this.landed) {
            // Use walking animations when moving on the ground
            if (this.facing === 1) {
                this.walkRightAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            } else {
                this.walkLeftAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            }
        } else {
            // Use idle animations when not moving
            if (this.facing === 1) {
                this.idleRightAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            } else {
                this.idleLeftAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            }
        }

        // Draw health bar
        this.healthbar.draw(ctx);

        // Draw bounding box for debugging
        if (this.debug) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        }
    }
}