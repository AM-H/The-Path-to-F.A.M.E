class Kyra {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 500;
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.facing = "right";
        this.landed = false;  // Added to track if character is on ground

        this.attackDirection = null;
        this.removeFromWorld = false;
        this.canAttack = false;
        
        setTimeout(() => { this.canAttack = true; }, 100);

        // Animation Map (keep your existing animations)
        this.animationMap = new Map();
        this.animationMap.set(`runRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/RunRightKyra.png`), 0, 8, 96, 48, 4, 0.2));
        this.animationMap.set(`runLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/RunLeftKyra.png`), 0, 8, 95, 48, 4, 0.2));
        this.animationMap.set(`idleRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/IdleRightKyra.png`), 0, 0, 96, 38, 5, 0.35));
        this.animationMap.set(`idleLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/IdleLeftKyra.png`), 0, 0, 96, 38, 5, 0.35));
        this.animationMap.set(`attackRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/AttackRightKyra.png`), 0, 0, 96, 40, 5, 0.07));
        this.animationMap.set(`attackLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/AttackLeftKyra.png`), 0, 0, 96, 40, 5, 0.07));

        // Set default animation
        this.animator = this.animationMap.get(`idleRight`);

        this.attacking = false;
        this.box = new BoundingBox(this.x+80, this.y+10, 40, 61);
        this.attackBox = null;
        this.updateBoundingBox();
        this.hitpoints = 100;
        this.maxhitpoints = 100;
        this.healthbar = new HealthBar(this);
        this.attackTimer = 0;
        this.attackDuration = 0;
    }

    updateBoundingBox() {
        this.box = new BoundingBox(this.x+80, this.y+10, 40, 61);

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
            console.log(`kyra takes ${amount} damage! Remaining HP: ${this.hitpoints}`);
        } else {
            console.log(`Damage blocked by invincibility!`);
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

        // Jump logic
        if (this.game.jump && this.landed) {
            this.velocity.y = -825;  // Upward velocity on jump
            this.fallGrav = 1900;    // Gravity while jumping
            this.landed = false;     // No longer on ground
        }

        // Apply gravity
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;

        // Update animations based on state
        if (this.attacking) {
            this.animator = this.animationMap.get(this.facing === "right" ? `attackRight` : `attackLeft`);
        } else if (!this.landed) {
            // Use idle animation for jumping
            this.animator = this.animationMap.get(this.facing === "left" ? `idleLeft` : `idleRight`);
        } else if (this.game.left || this.game.right) {
            this.animator = this.animationMap.get(this.facing === "left" ? `runLeft` : `runRight`);
            // Only adjust height when running on ground
        } else {
            this.animator = this.animationMap.get(this.facing === "left" ? `idleLeft` : `idleRight`);
            // Only adjust height when idle on ground
        }

        // Horizontal Movement
        if (this.game.left) this.x -= 130 * TICK;
        if (this.game.right) this.x += 130 * TICK;

        // World boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > gameWorld.width - 64) {
            this.x = gameWorld.width - 64;
        }

        this.updateLastBB();
        this.updateBoundingBox();

        // Collision detection
        this.game.entities.forEach(entity => {
            if ((entity instanceof Eclipser || entity instanceof Drone) && this.attackBox && this.attackBox.collide(entity.box) && this.game.closeAttack) {
                if(entity instanceof Eclipser){
                    entity.takeDamage(40);
                }else if(entity instanceof Drone){
                    entity.takeDamage(20);
                }
            }


            //collision with floor and platforms:
            if (entity.box && this.box.collide(entity.box)) {
                if (this.velocity.y > 0) {
                    if ((entity instanceof Platform) && (this.lastBox.bottom) <= entity.box.top) {
                        this.velocity.y = 0;
                        this.y = entity.box.top-71;
                        this.landed = true;
                        //console.log(`bottom collision`);
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
        if (this.facing === "left" && !this.game.left && !this.game.right) {
            this.animator.drawFrame(this.game.clockTick, ctx, this.x + 20, this.y + 3, 1.8);
        } else if (this.facing == "right" && this.game.right) {
            this.animator.drawFrame(this.game.clockTick, ctx, this.x+14, this.y+3, 1.6);
        } else if (this.facing == "left" && this.game.left) {
            this.animator.drawFrame(this.game.clockTick, ctx, this.x + 23, this.y + 4, 1.6);
        } else {
            this.animator.drawFrame(this.game.clockTick, ctx, this.x+10, this.y+3, 1.8);
        }

        // Debugging: Draw bounding boxes
        if (this.game.debugMode) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
            if (this.attackBox) {
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 2;
                ctx.strokeRect(this.attackBox.x, this.attackBox.y, this.attackBox.width, this.attackBox.height);
            }
        }

        // Draw health bar
        this.healthbar.draw(ctx);
    }
}
