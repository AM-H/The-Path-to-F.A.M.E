class Grim {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 500;
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.facing = "right";

        // Health system
        this.hitpoints = 500;
        this.maxhitpoints = 500;
        this.healthbar = new HealthBar(this);
        this.damageCooldown = 0;

        this.canAttack = false;
        setTimeout(() => {
            this.canAttack = true;
        }, 100);

        // Animation map
        this.animationMap = new Map();
        this.animationMap.set('runRight', new Animator(ASSET_MANAGER.getAsset('./sprites/GrimRunningR.png'), 13, 16, 48, 32, 8, 0.2));
        this.animationMap.set('runLeft', new Animator(ASSET_MANAGER.getAsset('./sprites/GrimRunningL.png'), 3.01, 16, 48, 32, 8, 0.2));
        this.animationMap.set('idleRight', new Animator(ASSET_MANAGER.getAsset('./sprites/GrimIdleR.png'), 0, 16, 42, 32, 5, 0.2));
        this.animationMap.set('idleLeft', new Animator(ASSET_MANAGER.getAsset('./sprites/GrimIdleL.png'), 5, 16, 48, 32, 5, 0.2));

        this.animator = this.animationMap.get('idleRight');

        this.box = new BoundingBox(this.x, this.y, 32, 64);
        this.updateBoundingBox();
        this.landed = false;
        this.attacking = false;
        this.canShoot = true;

         this.friction = 800; // Friction set to 800, matching other players
        this.knockbackTimer = 0;
        this.knockbackDuration = 0.3;
        this.knockbackSpeed = 300;
    }
    getLeviath() {
        return this.game.entities.find(entity => 
            entity instanceof LeviathDraconis
        );
    };
    takeDamage(amount) {
        if (!this.game.invincibleMode) {
            this.hitpoints -= amount;
            if (this.hitpoints < 0) this.hitpoints = 0;
            console.log(`Grim takes ${amount} damage! Remaining HP: ${this.hitpoints}`);
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

    updateBoundingBox() {
        this.box = new BoundingBox(this.x, this.y, 32, 64);
    }

    updateLastBB() {
        this.lastBox = this.box;
    }

    update() {
        if (this.game.isTimeStopped == true && getDistance(this, this.getLeviath()) <= 95 && !(this.hitpoints == 0)) {
            return;
        }
        const TICK = this.game.clockTick;

        if (this.hitpoints <= 0) {
            this.hitpoints = 0;
            this.game.isGameOver = true;
            this.game.addEntity(new GameOver(this.game));
            return;
        }

        this.damageCooldown -= TICK;

        // Update knockback timer
        if (this.knockbackTimer > 0) {
            this.knockbackTimer -= TICK;
        }

        // Movement input (only if not in knockback)
        if (this.knockbackTimer <= 0) {
            if (this.game.left) {
                this.velocity.x = -130;
                if (this.facing !== "left") {
                    this.facing = "left";
                    this.animator = this.animationMap.get('runLeft');
                }
            } else if (this.game.right) {
                this.velocity.x = 130;
                if (this.facing !== "right") {
                    this.facing = "right";
                    this.animator = this.animationMap.get('runRight');
                }
            } else {
                // Apply friction when no input
                if (this.velocity.x > 0) {
                    this.velocity.x = Math.max(0, this.velocity.x - this.friction * TICK);
                } else if (this.velocity.x < 0) {
                    this.velocity.x = Math.min(0, this.velocity.x + this.friction * TICK);
                }
                if (!this.attacking) {
                    if (this.facing === "left") {
                        this.animator = this.animationMap.get('idleLeft');
                    } else if (this.facing === "right") {
                        this.animator = this.animationMap.get('idleRight');
                    }
                }
            }
        } else {
            // During knockback, apply friction to slow down
            if (this.velocity.x > 0) {
                this.velocity.x = Math.max(0, this.velocity.x - this.friction * TICK);
            } else if (this.velocity.x < 0) {
                this.velocity.x = Math.min(0, this.velocity.x + this.friction * TICK);
            }
        }

        // Apply velocity to position
        this.x += this.velocity.x * TICK;

        // Long range attack
        if (this.game.rangeAttack && this.canShoot) {
            const centerX = this.x + (this.box.width / 2);
            const centerY = this.y + (this.box.height / 2);
            const projectileCenterX = centerX - 16;
            const projectileCenterY = centerY - 16;

            const deltaX = this.game.mouseX - centerX;
            const deltaY = this.game.mouseY - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            const direction = {
                x: deltaX / distance,
                y: deltaY / distance
            };

            const projectile = new SkullProjectile(
                this.game,
                projectileCenterX,
                projectileCenterY,
                direction,
                { x: this.velocity.x, y: this.velocity.y }
            );
            this.game.addEntity(projectile);

            this.canShoot = false;
        }

        if (!this.game.rangeAttack) {
            this.canShoot = true;
        }

        // Jump logic with gravity
        if (this.game.jump && this.landed) {
            this.velocity.y = -825;
            this.fallGrav = 1900;
            this.landed = false;
        }

        // World boundaries
        if (this.x < 0) {
            this.x = 0;
            this.velocity.x = 0;
        }
        if (this.x > gameWorld.width - this.box.width) {
            this.x = gameWorld.width - this.box.width;
            this.velocity.x = 0;
        }

        // Gravity and vertical movement
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;

        this.updateLastBB();
        this.updateBoundingBox();

        // Collision detection
        this.game.entities.forEach(entity => {
            if (entity.box && this.box.collide(entity.box)) {
                if (this.velocity.y > 0) {
                    if (entity instanceof Platform && this.lastBox.bottom <= entity.box.top) {
                        this.velocity.y = 0;
                        this.y = entity.box.top - 64;
                        this.landed = true;
                    }
                } else if (this.velocity.y > 0) {
                    this.landed = false;
                }
                if (this.velocity.x > 0 && this.lastBox.right <= entity.box.left && entity instanceof Platform) {
                    this.x = entity.box.left - this.box.width;
                    this.velocity.x = 0;
                } else if (this.velocity.x < 0 && this.lastBox.left >= entity.box.right && entity instanceof Platform) {
                    this.x = entity.box.right;
                    this.velocity.x = 0;
                }
            }
        });

        this.updateBoundingBox();
        this.healthbar.update();
    }

    draw(ctx) {
        if (this.facing === "left") {
            this.animator.drawFrame(this.game.clockTick, ctx, this.x - 12, this.y + 14, 1.55, false, true);
        } else {
            this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y + 14, 1.55);
        }

        if (this.game.debugMode) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        }

        this.healthbar.draw(ctx);
    }
}