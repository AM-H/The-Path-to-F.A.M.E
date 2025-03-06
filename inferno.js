class inferno {
    constructor(game) {
        this.game = game;

        // Load animations
        this.idleRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/IdleRight.png`), -55, 11, 150, 64, 8, 0.6);
        this.idleLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/IdleLeft.png`), -55, 11, 150, 64, 8, 0.6);
        this.walkRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/runRight.png`), -55, 11, 150, 64, 8, 0.6);
        this.walkLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/runLeft.png`), -55, 11, 150, 64, 8, 0.6);
        this.attackRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/attackRight.png`),-55, 11, 150, 64, 8, 1);
        this.attackLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/inferno/attackLeft.png`), -55, 11, 150, 64, 8, 1);

        // Position setup
        this.x = 600;
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
        this.facing = -1;
        this.state = `idle`;
        this.targetPlatform = null;
        this.jumpPhase = `none`;
        this.isOnPlatform = false;

        // Combat ranges
        this.attackRange = 50;
        this.chaseRange = 400;
        this.minDistance = 100;
        this.jumpThreshold = 100;

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

    takeDamage(amount) {
        if (this.damageCooldown <= 0) {
            this.hitpoints = Math.max(0, this.hitpoints - amount);
            this.damageCooldown = 0.5;
            console.log(`Boss takes ${amount} damage! Remaining HP: ${this.hitpoints}`);
        }
    }

    getPlayer() {
        return this.game.entities.find(entity =>
            entity instanceof AzielSeraph || entity instanceof HolyDiver || entity instanceof Grim || entity instanceof Kanji || entity instanceof Kyra
        );
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
                        console.log(`Boss takes axe damage! HP: ${this.hitpoints}`);
                    }
                }
            });

            // Check for Skull projectile collision
            this.game.entities.forEach(entity => {
                if (entity instanceof SkullProjectile) {
                    if (this.box.collide(entity.box)) {
                        this.takeDamage(5);
                        entity.removeFromWorld = true;
                        console.log(`Boss takes projectile damage! HP: ${this.hitpoints}`);
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
                this.state = `attacking`;
            } else if (distToPlayer < this.chaseRange) {
                this.state = `chasing`;
                this.x += this.moveSpeed * moveDir;
                this.facing = moveDir;
            } else {
                this.state = `idle`;
            }
        }

        // Apply gravity and movement
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;
        this.x += this.velocity.x * TICK;

        this.updateLastBB();
        this.updateBoundingBox();

        // Platform and ground collisions
        let isOnGround = false;
        this.game.entities.forEach(entity => {
            if (entity instanceof Platform) {
                if (this.box.collide(entity.box)) {
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
                entity.takeDamage(10);
                console.log(`Aziel takes damage! HP: ${entity.hitpoints}`);
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

        this.damageCooldown -= TICK;
        this.checkPlayerAttack();
        this.healthbar.update();
    }

    draw(ctx) {
        if (this.state === `attacking`) {
            if (this.facing === -1) {
                this.attackLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25);
            } else {
                this.attackRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25);
            }
        } else {
            if (this.state === `chasing` || this.state === `moving` || this.jumpPhase === `jumping`) {
                if (this.facing === -1) {
                    this.walkLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25);
                } else {
                    this.walkRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25);
                }
            } else {
                if (this.facing === -1) {
                    this.idleLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25);
                } else {
                    this.idleRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.25);
                }
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


