class Kyra {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 500;
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.facing = "right";
        this.landed = false;

        this.attackDirection = null;
        this.removeFromWorld = false;
        this.canAttack = false;
        this.canRangeAttack = true;
        this.rangeAttacking = false;

        setTimeout(() => { this.canAttack = true; }, 100);
        setTimeout(() => { this.canRangeAttack = true; }, 500);

        // Animation Map
        this.animationMap = new Map();
        this.animationMap.set(`runRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/RunRightKyra.png`), 0, 8, 96, 48, 4, 0.2));
        this.animationMap.set(`runLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/RunLeftKyra.png`), 0, 8, 95, 48, 4, 0.2));
        this.animationMap.set(`idleRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/IdleRightKyra.png`), 0, 0, 96, 38, 5, 0.35));
        this.animationMap.set(`idleLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/IdleLeftKyra.png`), 0, 0, 96, 38, 5, 0.35));
        this.animationMap.set(`attackRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/AttackRightKyra.png`), 0, 0, 96, 42, 5, 0.07));
        this.animationMap.set(`attackLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/AttackLeftKyra.png`), 0, 0, 95, 42, 5, 0.07));
        this.animationMap.set(`throwRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/ThrowRightKyra.png`), 0, 0, 95, 34, 4, 0.07));
        this.animationMap.set(`throwLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/ThrowLeftKyra.png`), 0, 0, 95, 34, 4, 0.07));
        this.animationMap.set(`shuriken`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/shuriken.png`), 0, 0, 32, 32));

        this.animator = this.animationMap.get(`idleRight`);

        this.attacking = false;
        this.box = new BoundingBox(this.x + 80, this.y + 10, 40, 61);
        this.attackBox = null;
        this.updateBoundingBox();
        this.hitpoints = 100;
        this.maxhitpoints = 100;
        this.healthbar = new HealthBar(this);
        this.attackTimer = 0;
        this.attackDuration = 0;

        this.friction = 800; // Friction set to 800, matching other players
        this.knockbackTimer = 0;
        this.knockbackDuration = 0.3;
        this.knockbackSpeed = 300;
    }

    updateBoundingBox() {
        this.box = new BoundingBox(this.x + 80, this.y + 10, 40, 61);

        if (this.attacking) {
            if (this.attackDirection === "right") {
                this.attackBox = new BoundingBox(this.x + 50, this.y + 10, 40, 50);
            } else {
                this.attackBox = new BoundingBox(this.x - 40, this.y + 10, 40, 50);
            }
        } else {
            this.attackBox = null;
        }
    }

    takeDamage(amount) {
        if (!this.game.invincibleMode) { // Knockback and damage only apply when invincibility is off
            this.hitpoints -= amount;
            if (this.hitpoints < 0) this.hitpoints = 0;
            console.log(`Kyra takes ${amount} damage! Remaining HP: ${this.hitpoints}`);
        } else {
            console.log(`Damage blocked by invincibility!`);

        }
    }

    takeKnockBack(amount, source = this) {
        if (!this.game.invincibleMode) { // Knockback and damage only apply when invincibility is off
            this.hitpoints -= amount;
            if (this.hitpoints < 0) this.hitpoints = 0;
            console.log(`Kyra takes ${amount} damage! Remaining HP: ${this.hitpoints}`);
        } else {
            console.log(`Damage blocked by invincibility!`);

        }
        if (source && source.box) {
            const dx = this.box.x - source.box.x; // Direction from source to Kyra
            this.velocity.x = dx > 0 ? this.knockbackSpeed : -this.knockbackSpeed;
            this.knockbackTimer = this.knockbackDuration;
            if (!this.landed) this.velocity.y = -200; // Slight upward push if in air
        }
    }


    performRangeAttack() {
        if (this.game.rangeAttack && this.canRangeAttack && !this.rangeAttacking) {
            this.rangeAttacking = true;

            this.animator = this.animationMap.get(this.facing === "right" ? `throwRight` : `throwLeft`);

            setTimeout(() => {
                const centerX = this.x + (this.box.width / 2);
                const centerY = this.y + (this.box.height / 2);
                const shurikenX = this.facing === "right" ? this.x + 60 : this.x;
                const shurikenY = this.y + 20;
                const deltaX = this.game.mouseX - centerX;
                const deltaY = this.game.mouseY - centerY;
                const angle = Math.atan2(deltaY, deltaX);

                const shuriken = new Shuriken(this.game, shurikenX, shurikenY, angle);
                this.game.addEntity(shuriken);

                this.rangeAttacking = false;
            }, 200);

            this.canRangeAttack = false;
            setTimeout(() => { this.canRangeAttack = true; }, 500);
        }
    }

    updateLastBB() {
        this.lastBox = this.box;
    }

    update() {
        const TICK = this.game.clockTick;

        if (this.hitpoints <= 0) {
            this.hitpoints = 0;
            this.game.isGameOver = true;
            this.game.addEntity(new GameOver(this.game));
            return;
        }

        // Update facing direction
        if (this.game.left) this.facing = "left";
        else if (this.game.right) this.facing = "right";
        else if (this.knockbackTimer > 0 && this.velocity.x !== 0) {
            this.facing = this.velocity.x > 0 ? "right" : "left";
        }

        // Attack Logic
        if (this.game.closeAttack && !this.attacking && this.canAttack && this.knockbackTimer <= 0) {
            this.attacking = true;
            this.canAttack = false;
            this.attackDirection = this.facing;
            this.attackTimer = 0;

            const attackAnim = this.animationMap.get(this.facing === "right" ? `attackRight` : `attackLeft`);
            this.attackDuration = attackAnim.frameCount * attackAnim.frameDuration;
        }

        if (this.attacking) {
            this.attackTimer += TICK;
            if (this.attackTimer >= this.attackDuration) {
                this.attacking = false;
                this.canAttack = true;
                this.attackDirection = null;
                this.attackTimer = 0;
            }
        }

        if (this.game.rangeAttack) {
            this.performRangeAttack();
        }

        // Jump logic
        if (this.game.jump && this.landed && this.knockbackTimer <= 0) {
            this.velocity.y = -825;
            this.fallGrav = 1900;
            this.landed = false;
        }

        // Apply gravity
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;

        // Handle knockback and horizontal movement
        if (this.knockbackTimer > 0) {
            this.knockbackTimer -= TICK;
            this.x += this.velocity.x * TICK;

            // Apply friction (800) to slow down knockback
            if (this.velocity.x > 0) {
                this.velocity.x -= this.friction * TICK;
                if (this.velocity.x < 0) this.velocity.x = 0;
            } else if (this.velocity.x < 0) {
                this.velocity.x += this.friction * TICK;
                if (this.velocity.x > 0) this.velocity.x = 0;
            }
        } else {
            // Normal horizontal movement
            if (!this.attacking) {
                if (this.game.left) this.x -= 130 * TICK;
                if (this.game.right) this.x += 130 * TICK;
            }
            this.velocity.x = 0; // Reset velocity when not in knockback
        }

        // World boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > gameWorld.width - 64) {
            this.x = gameWorld.width - 64;
        }

        if (!this.rangeAttacking) {
            if (this.attacking) {
                this.animator = this.animationMap.get(this.facing === "right" ? `attackRight` : `attackLeft`);
            } else if (!this.landed) {
                this.animator = this.animationMap.get(this.facing === "left" ? `idleLeft` : `idleRight`);
            } else if (this.game.left || this.game.right || this.knockbackTimer > 0) {
                this.animator = this.animationMap.get(this.facing === "left" ? `runLeft` : `runRight`);
            } else {
                this.animator = this.animationMap.get(this.facing === "left" ? `idleLeft` : `idleRight`);
            }
        }

        this.updateLastBB();
        this.updateBoundingBox();

        // Collision detection
        this.game.entities.forEach(entity => {
            if ((entity instanceof Eclipser || entity instanceof Drone || entity instanceof inferno || entity instanceof Shizoku || entity instanceof LeviathDraconis) &&
                this.attackBox && this.attackBox.collide(entity.box) && this.game.closeAttack) {
                if (entity instanceof Drone) {
                    entity.takeDamage(20);
                } else {
                    entity.takeDamage(40);
                }
            }

            if (entity.box && this.box.collide(entity.box)) {
                if (this.velocity.y > 0) {
                    if ((entity instanceof Platform) && (this.lastBox.bottom) <= entity.box.top) {
                        this.velocity.y = 0;
                        this.y = entity.box.top - 71;
                        this.landed = true;
                    } else {
                        this.landed = false;
                    }
                } else {
                    this.landed = false;
                }
            }
            this.updateBoundingBox();
        });
        this.healthbar.update();
    }

    draw(ctx) {
        let yOffset = this.attacking ? -6 : 0;

        if (this.facing === "left" && !this.game.left && !this.game.right) {
            this.animator.drawFrame(this.game.clockTick, ctx, this.x + 20, this.y + 3 + yOffset, 1.8);
        } else if (this.facing === "right" && this.game.right) {
            this.animator.drawFrame(this.game.clockTick, ctx, this.x + 14, this.y + 3 + yOffset, 1.6);
        } else if (this.facing === "left" && this.game.left) {
            this.animator.drawFrame(this.game.clockTick, ctx, this.x + 19, this.y + 4 + yOffset, 1.6);
        } else {
            this.animator.drawFrame(this.game.clockTick, ctx, this.x + 10, this.y + 4 + yOffset, 1.8);
        }

        if (this.game.debugMode) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
            if (this.attackBox) {
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 2;
                ctx.strokeRect(this.attackBox.x, this.attackBox.y, this.attackBox.width, this.attackBox.height);
            }
            // Optional: Draw knockback indicator
            if (this.knockbackTimer > 0) {
                ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
                ctx.fillRect(this.box.x, this.box.y - 10, this.box.width * (this.knockbackTimer / this.knockbackDuration), 5);
            }
        }

        this.healthbar.draw(ctx);
    }
}