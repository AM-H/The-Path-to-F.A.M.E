class Kanji {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 500;
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.facing = "right";

        this.attackDirection = null;
        this.removeFromWorld = false;
        this.canAttack = false;
        this.canRangeAttack = true;

        setTimeout(() => { this.canAttack = true; }, 100);
        setTimeout(() => { this.canRangeAttack = true; }, 500);

        // Animation Map
        this.animationMap = new Map();
        this.animationMap.set(`runRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/runRight.png`), 0, 0, 32, 32, 6, 0.2));
        this.animationMap.set(`runLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/runLeft.png`), 5, 0, 32, 32, 6, 0.2));
        this.animationMap.set(`idleRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/IdleRight.png`), 0, 0, 32, 32, 9, 0.2));
        this.animationMap.set(`idleLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/IdleLeft.png`), 5, 0, 32, 32, 9, 0.2));
        this.animationMap.set(`attackRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/attackRight.png`), 33.9, 48, 96, 48, 7, 0.07));
        this.animationMap.set(`attackLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/attackLeft1.png`), 0, 0, 58, 34, 7, 0.07));
        this.animationMap.set(`jumpLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/jumpLeft.png`), 0, 0, 32, 32, 2, 0.5));
        this.animationMap.set(`jumpRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/jumpRight.png`), 0, 0, 32, 32, 2, 0.5));

        this.animator = this.animationMap.get(`idleRight`);

        this.attacking = false;
        this.box = new BoundingBox(this.x, this.y, 48, 64);
        this.attackBox = null;
        this.updateBoundingBox();
        this.landed = false;
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

    performRangeAttack() {
        if (this.game.rangeAttack && this.canRangeAttack) {
            const centerX = this.x + (this.box.width / 2);
            const centerY = this.y + (this.box.height / 2);
            const projectileCenterX = centerX - 16;
            const projectileCenterY = centerY - 16;

            const deltaX = this.game.mouseX - centerX;
            const deltaY = this.game.mouseY - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const direction = { x: deltaX / distance, y: deltaY / distance };

            const slash = new RangeSlash(
                this.game,
                projectileCenterX,
                projectileCenterY,
                direction,
                { x: this.velocity.x, y: this.velocity.y }
            );
            this.game.addEntity(slash);
            this.canRangeAttack = false;
            setTimeout(() => { this.canRangeAttack = true; }, 500);
        }
    }

    updateBoundingBox() {
        this.box = new BoundingBox(this.x, this.y, 48, 64);

        if (this.game.rangeAttack && this.canRangeAttack) {
            this.performRangeAttack();
        }

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
        // Skip damage if invincible
        if (!this.game.invincibleMode) {
            this.hitpoints -= amount;
            if (this.hitpoints < 0) this.hitpoints = 0;
            console.log(`Kanji takes ${amount} damage! Remaining HP: ${this.hitpoints}`);
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

    updateLastBB() {
        this.lastBox = this.box;
    }
    getLeviath() {
        return this.game.entities.find(entity => 
            entity instanceof LeviathDraconis
        );
    };
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

        // Update facing direction
        if (this.game.left) this.facing = "left";
        else if (this.game.right) this.facing = "right";

        // Attack Logic
        if (this.game.closeAttack && !this.attacking && this.canAttack) {
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

        // Update animations
        if (this.attacking) {
            this.animator = this.animationMap.get(this.facing === "right" ? `attackRight` : `attackLeft`);
        } else if (!this.landed) {
            this.animator = this.animationMap.get(this.facing === "left" ? `jumpLeft` : `jumpRight`);
        } else if (this.game.left || this.game.right) {
            this.animator = this.animationMap.get(this.facing === "left" ? `runLeft` : `runRight`);
        } else {
            this.animator = this.animationMap.get(this.facing === "left" ? `idleLeft` : `idleRight`);
        }

        // Apply velocity to position
        this.x += this.velocity.x * TICK;


        // Apply input (friction will naturally slow knockback)
        if (this.game.left) this.velocity.x = -130;
        else if (this.game.right) this.velocity.x = 130;
        else {
            // Apply friction when no input
            if (this.velocity.x > 0) {
                this.velocity.x = Math.max(0, this.velocity.x - this.friction * TICK);
            } else if (this.velocity.x < 0) {
                this.velocity.x = Math.min(0, this.velocity.x + this.friction * TICK);
            }
        }

        // Jump logic
        if (this.game.jump && this.landed) {
            this.velocity.y = -800;
            this.fallGrav = 1900;
            this.landed = false;
        }

        // Gravity
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;

        // Boundary checks
        if (this.x < 0) {
            this.x = 0;
            this.velocity.x = 0;
        }
        if (this.x > gameWorld.width - 48) {
            this.x = gameWorld.width - 48;
            this.velocity.x = 0;
        }

        this.updateLastBB();
        this.updateBoundingBox();

        // Collision detection (only with platforms)
        this.game.entities.forEach(entity => {
            if ((entity instanceof Eclipser || entity instanceof Drone || entity instanceof Shizoku || entity instanceof stormSpirit || entity instanceof  inferno) && this.attackBox && this.attackBox.collide(entity.box) && this.game.closeAttack) {
                if (entity instanceof Eclipser || entity instanceof Shizoku || entity instanceof stormSpirit || entity instanceof  inferno || entity instanceof LeviathDraconis) {
                    entity.takeDamage(50);
                } else if (entity instanceof Drone) {
                    entity.takeDamage(20);
                }
            }

            if (entity instanceof Platform && this.box.collide(entity.box)) {
                if (this.velocity.y > 0 && this.lastBox.bottom <= entity.box.top) {
                    this.velocity.y = 0;
                    this.y = entity.box.top - 64;
                    this.landed = true;
                }
                 else {
                    this.landed = false;
                }

            }
        });

        this.updateBoundingBox();
        this.healthbar.update();
    }

    draw(ctx) {
        if (this.attacking && this.facing === "left") {
            console.log("attacking left");
            this.animator.drawFrame(this.game.clockTick, ctx, this.x - 38, this.y - 4, 2);
        } else {
            if (this.facing === "left") {
                this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2, false, true);
            } else {
                this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
            }
        }

        if (this.attackBox && this.game.debugMode) {
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.attackBox.x, this.attackBox.y, this.attackBox.width, this.attackBox.height);
        }

        if(this.game.debugMode){
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        }

        this.healthbar.draw(ctx);

    }
}