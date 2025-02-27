class Shizoku {
    constructor(game) {
        this.game = game;

        // Load animations
        this.idleRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/Shizoku/IdleRight.png`), 0, -11, 80, 64, 9, 0.3);
        this.idleLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/Shizoku/IdleLeft.png`), 0, -11, 80, 64, 9, 0.3);
        this.walkRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/Shizoku/runRight.png`), 0, -11, 80, 64, 6, 0.35);
        this.walkLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/Shizoku/runLeft.png`), 0, -11, 80, 64, 6, 0.35);
        this.attackRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/Shizoku/attackRight.png`), 0, 0, 80, 64, 12, 0.06);
        this.attackLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/Shizoku/attackLeft.png`), 0, 0, 80, 64, 12, 0.06);

        // Position setup
        this.x = 500;
        const groundHeight = gameWorld.height - 70;
        this.y = groundHeight - 300;

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
            this.x + xOffset + 30,
            this.y + 40,
            this.boxWidth * 2,
            this.boxHeight * 1.2
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
            entity instanceof AzielSeraph || entity instanceof HolyDiver || entity instanceof Grim || entity instanceof Kanji
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
            if ((entity instanceof  Kanji || entity instanceof AzielSeraph) && this.box.collide(entity.box) && this.state == `attacking`) {
                //entity.takeDamage(10); // Deal 10 damage to boss
                console.log(`Aziel takes damage! HP: ${entity.hitpoints}`);
            }
        });

        // If not on any platform, check if we've fallen below ground level
        const groundLevel = gameWorld.height - 190;  // Adjust this value based on your ground height
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

        if (this.state === 'attacking') {
            if (this.facing === -1) {
                this.attackLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2, false, true);
            } else {
                this.attackRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
            }
        } else {
            if (this.state === 'chasing' || this.state === 'moving' || this.jumpPhase === 'jumping') {
                if (this.facing === -1) {
                    this.walkLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2, false, true);
                } else {
                    this.walkRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
                }
            } else {
                if (this.facing === -1) {
                    this.idleLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2, false, true);
                } else {
                    this.idleRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
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