class Shizoku {
    constructor(game) {
        this.game = game;

        // Load animations (unchanged)
        this.idleRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/Shizoku/IdleRight.png`), 0, -11, 80, 64, 9, 0.3);
        this.idleLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/Shizoku/IdleLeft.png`), 0, -11, 80, 64, 9, 0.3);
        this.walkRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/Shizoku/runRight.png`), 0, -11, 80, 64, 6, 0.35);
        this.walkLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/Shizoku/runLeft.png`), 0, -11, 80, 64, 6, 0.35);
        this.attackRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/Shizoku/attackRight.png`), 0, 0, 80, 64, 12, 0.06);
        this.attackLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/Shizoku/attackLeft.png`), 0, 0, 80, 64, 12, 0.06);

        // Position setup
        this.x = 400;
        this.y = gameWorld.height - 500;

        // Basic properties
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 1800;
        this.moveSpeed = 200;
        this.landed = true;

        this.spriteScale = 2;
        this.width = 32 * this.spriteScale;
        this.height = 32 * this.spriteScale;
        this.boxHeight = 64;
        this.boxWidth = 32;
        this.box = new BoundingBox(this.x + 5, this.y, 32, 64);

        // State
        this.facing = -1;
        this.state = `idle`;
        this.targetPlatform = null;

        this.jumpCooldown = 0;
        this.lastJumpTime = 0;

        // Combat ranges
        this.attackRange = 50;
        this.chaseRange = 500;
        this.minDistance = 50; // Minimum distance to maintain from player

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

        // Attack properties
        this.attackBoxWidth = 20;
        this.attackBoxHeight = 20;
        this.attackBox = null;
        this.attackDuration = 0.2;
        this.attackTimer = 0;
        this.attackCooldown = 1.0;
        this.attackCooldownTimer = 0;
        this.hasDealtDamage = false;
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

        if (this.jumpCooldown > 0) this.jumpCooldown -= TICK;
        if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= TICK;
        if (this.attackTimer > 0) this.attackTimer -= TICK;

        // Check if jumping is needed
        if (this.shouldJump(player) && this.jumpCooldown <= 0) {
            let targetX = player.x;
            let targetY = player.y;
            if (this.targetPlatform) {
                targetX = this.targetPlatform.x + this.targetPlatform.width / 2 - this.boxWidth / 2;
                targetY = this.targetPlatform.y - this.boxHeight;
            }
            this.facing = targetX > this.x ? 1 : -1;
            this.velocity = this.calculateJumpVelocity(targetX, targetY);
            this.landed = false;
            this.state = "jumping";
            this.jumpCooldown = 1.0;
            if (this.debug) console.log(`Shizoku jumping to (${targetX}, ${targetY}), facing: ${this.facing}`);
        }

        const distToPlayer = Math.abs(this.x + this.width / 2 - (player.x + player.box.width / 2));
        const moveDir = player.x > this.x ? 1 : -1;
        const currentPlatform = this.getCurrentPlatform();
        const playerPlatform = this.getPlayerPlatform(player);

        if (this.landed) {
            if (distToPlayer < this.attackRange && this.attackCooldownTimer <= 0) {
                this.state = `attacking`;
                this.velocity.x = 0;
                this.attackTimer = this.attackDuration;
                this.attackCooldownTimer = this.attackCooldown;
                if (this.attackTimer === this.attackDuration) {
                    const dx = player.x - this.x;
                    this.facing = Math.abs(dx) < 5 ? this.facing : (dx > 0 ? 1 : -1);
                }
                this.hasDealtDamage = false;
                const attackOffsetX = this.facing === 1 ? this.boxWidth : -this.attackBoxWidth;
                this.attackBox = new BoundingBox(
                    this.x + attackOffsetX,
                    this.y + (this.boxHeight - this.attackBoxHeight) / 2,
                    this.attackBoxWidth,
                    this.attackBoxHeight
                );
                if (this.debug) console.log(`Punch attack initiated, facing: ${this.facing}`);
            } else if (distToPlayer < this.chaseRange && this.state !== "attacking") {
                if (this.state !== 'chasing' || Math.abs(this.velocity.x) < 1) {
                    this.state = `chasing`;
                }
                const speedMultiplier = (currentPlatform && playerPlatform && currentPlatform === playerPlatform) ? 1.5 : 1;
                // Only move if outside minDistance (50 pixels)
                if (distToPlayer > this.minDistance) {
                    this.velocity.x = this.moveSpeed * moveDir * speedMultiplier;
                    this.x += this.velocity.x * TICK;
                    // Stop moving closer if within minDistance
                    const newDistToPlayer = Math.abs(this.x + this.width / 2 - (player.x + player.box.width / 2));
                    if (newDistToPlayer < this.minDistance) {
                        this.x = player.x + (moveDir > 0 ? -this.minDistance : this.minDistance) - this.width / 2;
                        this.velocity.x = 0;
                    }
                } else {
                    this.velocity.x = 0; // Stop if already within 50 pixels
                }
                this.facing = moveDir;
            } else if (this.state !== "attacking") {
                this.state = `idle`;
                this.velocity.x = 0;
            }
        }

        if (this.state === `attacking` && this.attackTimer > 0) {
            this.velocity.x = 0;
            if (player.box && this.attackBox && this.attackBox.collide(player.box) && !this.hasDealtDamage) {
                player.takeDamage(3);
                this.hasDealtDamage = true;
            }
        } else if (this.state === `attacking` && this.attackTimer <= 0) {
            this.state = `idle`;
            this.attackBox = null;
            this.hasDealtDamage = false;
            if (this.debug) console.log("Attack ended, attackBox cleared");
        }

        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;
        if (!this.landed) {
            this.x += this.velocity.x * TICK;
        }

        this.updateLastBB();

        let isOnGround = false;
        let justLanded = false;
        this.game.entities.forEach(entity => {
            if (entity instanceof Platform) {
                this.updateBoundingBox();
                if (this.box.collide(entity.box)) {
                    if (this.velocity.y >= 0 && this.lastBox.bottom <= entity.box.top + 5) {
                        this.y = entity.box.top - this.boxHeight;
                        this.velocity.y = 0;
                        if (!this.landed) justLanded = true;
                        this.landed = true;
                        isOnGround = true;
                        if (this.state !== "attacking" || this.attackTimer <= 0) {
                            this.state = "idle";
                        }
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
            if (!this.landed) justLanded = true;
            this.landed = true;
            if (this.state !== "attacking" || this.attackTimer <= 0) {
                this.state = "idle";
            }
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
        const xOffset = ((this.width - this.boxWidth) / 2) - 60;
        const yOffset = this.boxHeight - 115;

        if (this.debug) {
            console.log(`Drawing - State: ${this.state}, Velocity X: ${this.velocity.x}, Facing: ${this.facing}, AttackTimer: ${this.attackTimer}`);
        }

        if (this.state === `attacking`) {
            if (this.facing === 1) {
                this.attackRightAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            } else {
                this.attackLeftAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            }
        } else if (this.state === `jumping`) {
            if (this.facing === 1) {
                this.walkRightAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            } else {
                this.walkLeftAnim.drawFrame(this.game.clockTick, ctx, this.x + xOffset, this.y + yOffset, scale);
            }
        } else if (this.state === `chasing` && this.landed) {
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

        this.healthbar.draw(ctx);

        if (this.debug) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
            if (this.attackBox) {
                ctx.strokeStyle = "blue";
                ctx.strokeRect(this.attackBox.x, this.attackBox.y, this.attackBox.width, this.attackBox.height);
            }
        }
    }

    updateBoundingBox() {
        const xOffset = (this.width - this.boxWidth) / 2;
        this.box = new BoundingBox(this.x + xOffset, this.y, 32, 64);
    }

    updateLastBB() {
        this.lastBox = this.box;
    }

    calculateJumpVelocity(targetX, targetY) {
        if (this.targetPlatform) {
            targetX = this.targetPlatform.x + this.targetPlatform.width / 2 - 32 / 2;
            targetY = this.targetPlatform.y - 64;
        }

        const dx = targetX - this.x;
        const dy = targetY - this.y;

        let vx = dx > 0 ? 300 : -300;
        if (Math.abs(dx) < 100) vx = dx * 3;

        const time = Math.abs(dx / vx) || 0.5;
        let vy = (dy - 0.5 * this.fallGrav * time * time) / time;

        if (isNaN(vy)) {
            vy = dy < 0 ? -800 : 0;
        } else if (dy < 0 && (vy > 0 || Math.abs(vy) < 200)) {
            vy = -800;
        } else if (vy < -1000) {
            vy = -1000;
        }

        if (this.debug) console.log(`Jump velocity: (${vx}, ${vy}), target: (${targetX}, ${targetY})`);
        return { x: vx, y: vy };
    }

    getCurrentPlatform() {
        let currentPlatform = null;
        this.game.entities.forEach(entity => {
            if (entity instanceof Platform) {
                if (this.y + this.boxHeight >= entity.y - 10 &&
                    this.y + this.boxHeight <= entity.y + 20 &&
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
                if (player.y + player.box.height >= entity.y - 10 &&
                    player.y + player.box.height <= entity.y + 20 &&
                    player.x + player.box.width > entity.x &&
                    player.x < entity.x + entity.width) {
                    playerPlatform = entity;
                }
            }
        });
        return playerPlatform;
    }

    shouldJump(player) {
        if (!this.landed) {
            return false;
        }

        const currentTime = this.game.timer.gameTime;
        const playerPlatform = this.getPlayerPlatform(player);
        const currentPlatform = this.getCurrentPlatform();

        if (playerPlatform && currentPlatform && playerPlatform === currentPlatform) {
            if (player.y < this.y - 150) {
                if (this.debug) console.log("Kanji is much higher on same platform, will jump");
                this.lastJumpTime = currentTime;
                this.targetPlatform = playerPlatform;
                return true;
            }
            return false;
        }

        if (playerPlatform && (!currentPlatform || playerPlatform !== currentPlatform)) {
            if (this.debug) console.log("Kanji is on a different platform, will jump");
            this.lastJumpTime = currentTime;
            this.targetPlatform = playerPlatform;
            return true;
        }

        if (!currentPlatform && player.y < this.y - 100) {
            if (this.debug) console.log("Kanji is higher, no platform detected, will jump");
            this.lastJumpTime = currentTime;
            this.targetPlatform = playerPlatform;
            return true;
        }

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
        let player = this.game.entities.find(entity => entity instanceof Kanji);
        if (!player) {
            player = this.game.entities.find(entity =>
                entity instanceof AzielSeraph ||
                entity instanceof HolyDiver ||
                entity instanceof Grim
            );
        }
        return player;
    }
}