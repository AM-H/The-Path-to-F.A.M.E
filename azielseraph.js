class AzielSeraph {
    constructor(game) {
        this.game = game;
        this.removeFromWorld = false;
        this.animator = new Animator(ASSET_MANAGER.getAsset(`./sprites/IdleRightAziel.png`), 13, 0, 32, 32, 5, .35);
        this.rangeAttackCooldown = 5;  //Cooldown in seconds
        this.rangeAttackDuration = 0.8; //Duration of the long-range attack in seconds
        this.rangeAttackStartTime = 0;  //Time when the current range attack started
        this.lastRangeAttackTime = -this.rangeAttackCooldown;  // Instant availability at the start
        this.isRangeAttacking = false;  //Flag to track if the range attack is active
        this.x = 50;
        this.y = 50;
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.facing = "right";
        this.hitpoints = 500;
        this.maxhitpoints = 500;
        this.radius = 20;
        this.lastDamageTime = 0;
        this.isCloseAttacking = false;
        this.healthbar = new HealthBar(this);
        this.animationMap = new Map();
        this.animationMap.set(`runRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/moveRightAziel.png`), 2, 0, 32, 32, 6, 0.1));
        this.animationMap.set(`runLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/moveLeftAziel.png`), 2, 0, 32, 32, 6, 0.1));
        this.animationMap.set(`idleRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/IdleRightAziel.png`), 13, 0, 32, 32, 4, 0.2));
        this.animationMap.set(`idleLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/IdleLeftAziel.png`), 13, 0, 32, 32, 4, 0.2));
        this.box = new BoundingBox(this.x, this.y, 32, 64);
        this.updateBoundingBox();
        this.landed = false;

        this.friction = 800; // Friction set to 800, matching other players
        this.knockbackTimer = 0;
        this.knockbackDuration = 0.3;
        this.knockbackSpeed = 300;

    };

    updateBoundingBox() {
        this.box = new BoundingBox(this.x, this.y, 32, 64);
    };

    updateLastBB() {
        this.lastBox = this.box;
    };
    
    takeDamage(amount) {
        // Skip damage if invincible
        if (!this.game.invincibleMode) {
            this.hitpoints -= amount;
            if (this.hitpoints < 0) this.hitpoints = 0;
            console.log(`Aziel takes ${amount} damage! Remaining HP: ${this.hitpoints}`);
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


    update () {
        const TICK = this.game.clockTick;
        const currentTime = this.game.timer.gameTime;
        //console.log(`x value: ` + this.x + `y value: ` + this.y);

        if (this.hitpoints <= 0) {
            this.hitpoints = 0;
            this.game.isGameOver = true;
            this.game.addEntity(new GameOver(this.game));
            return;
        }

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
                    this.animator = this.animationMap.get(`runLeft`);
                }
            } else if (this.game.right) {
                this.velocity.x = 130;
                if (this.facing !== "right") {
                    this.facing = "right";
                    this.animator = this.animationMap.get(`runRight`);
                }
            } else {
                if (this.velocity.x > 0) {
                    this.velocity.x = Math.max(0, this.velocity.x - this.friction * TICK);
                } else if (this.velocity.x < 0) {
                    this.velocity.x = Math.min(0, this.velocity.x + this.friction * TICK);
                }
                if (this.facing === "left" && this.facing !== "idle") {
                    this.facing = "idle";
                    this.animator = this.animationMap.get(`idleLeft`);
                } else if (this.facing === "right" && this.facing !== "idle") {
                    this.facing = "idle";
                    this.animator = this.animationMap.get(`idleRight`);
                }
            }
        } else {
            // During knockback, apply friction
            if (this.velocity.x > 0) {
                this.velocity.x = Math.max(0, this.velocity.x - this.friction * TICK);
            } else if (this.velocity.x < 0) {
                this.velocity.x = Math.min(0, this.velocity.x + this.friction * TICK);
            }
        }

        // Apply velocity to position
        this.x += this.velocity.x * TICK;
        //jump logic with gravity
        if (this.game.jump && this.landed) { // jump
            this.velocity.y = -825;
            this.fallGrav = 1900;
            this.landed = false;
        } 
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > gameWorld.width-this.box.width) {
            this.x = gameWorld.width-this.box.width;
        }

        if (this.game.rangeAttack) {
            if (!this.isRangeAttacking && currentTime - this.lastRangeAttackTime >= this.rangeAttackCooldown) {
                console.log("Starting long-range attack!");
                this.isRangeAttacking = true;
                this.rangeAttackStartTime = currentTime;
                this.lastRangeAttackTime = currentTime; // Start cooldown immediately
            } else if (!this.isRangeAttacking) {
                const timeLeft = Math.ceil(this.rangeAttackCooldown - (currentTime - this.lastRangeAttackTime));
                console.log(`Long-range attack on cooldown. ${timeLeft}s left.`);
            }
        }
        //Boolean to check if aziel is close Attacking
        if (this.game.closeAttack) {
            this.isCloseAttacking = true;
        } else {
            this.isCloseAttacking = false;
        }
        // Handle the long-range attack duration
        if (this.isRangeAttacking) {
            if (currentTime - this.rangeAttackStartTime >= this.rangeAttackDuration) {
                console.log("Long-range attack ended.");
                this.isRangeAttacking = false; // Stop the attack after 2 seconds
            }
        }
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;
        this.updateLastBB();
        this.updateBoundingBox();


        let wasLanded = this.landed; // Preserve previous landed state
        this.landed = false; // Reset to false, only set true by platforms
        this.game.entities.forEach(entity => {
            if (entity.box && this.box.collide(entity.box)) {
                if (entity instanceof Platform) {
                    if (this.velocity.y > 0 && this.lastBox.bottom <= entity.box.top) {
                        this.velocity.y = 0;
                        this.y = entity.box.top - 64;
                        this.landed = true;
                    }
                }
                // Ignore non-platform entities for landing state
            }
            this.updateBoundingBox();
        });

        // Restore landed state if no platform collision disproves it
        if (!this.landed && wasLanded && this.velocity.y === 0) {
            this.landed = true; // Keep landed if stationary on ground
        }
        this.healthbar.update();
        
    };
    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        
        if (this.game.debugMode) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        }

        this.healthbar.draw(ctx);
    };
};
