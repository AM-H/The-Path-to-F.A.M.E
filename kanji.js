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

        setTimeout(() => { this.canAttack = true; }, 100);

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

        // Set default animation
        this.animator = this.animationMap.get(`idleRight`);

        this.attacking = false;
        this.box = new BoundingBox(this.x, this.y, 48, 64);
        this.attackBox = null; // Attack bounding box
        this.updateBoundingBox();
        this.landed = false;
        this.hitpoints = 100;
        this.maxhitpoints = 100;
        this.healthbar = new HealthBar(this);
        this.attackTimer = 0;
        this.attackDuration = 0;

    }

    updateBoundingBox() {
        this.box = new BoundingBox(this.x, this.y, 48, 64);

        // Set attack box if attacking
        if (this.attacking) {
            if (this.attackDirection === "right") {
                this.attackBox = new BoundingBox(this.x + 50, this.y + 10, 40, 50);
            } else {
                this.attackBox = new BoundingBox(this.x - 40, this.y + 10, 40, 50);
            }
        } else {
            this.attackBox = null; // Remove hitbox if not attacking
        }
    }

    takeDamage(amount) {
        this.hitpoints -= amount;
        if(this.hitpoints < 0) this.hitpoints = 0;
        console.log(`Kanji takes ${amount} damage! Remaining HP: ${this.hitpoints}`);
        this.healthbar.update();
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

        // Update facing direction even while attacking
        if (this.game.left) this.facing = "left";
        else if (this.game.right) this.facing = "right";

        // Attack Logic
        if (this.game.closeAttack && !this.attacking && this.canAttack) {
            this.attacking = true;
            this.canAttack = false;
            this.attackDirection = this.facing;
            this.attackTimer = 0;

            // Get the attack animation
            const attackAnim = this.animationMap.get(this.facing === "right" ? `attackRight` : `attackLeft`);
            this.attackDuration = attackAnim.frameCount * attackAnim.frameDuration;
        }

        // Handle attack timer and state
        if (this.attacking) {
            this.attackTimer += TICK;
            if (this.attackTimer >= this.attackDuration) {
                this.attacking = false;
                this.canAttack = true;
                this.attackDirection = null;
                this.attackTimer = 0;
            }
        }

        // Update animations - modified to consider both attacking state and direction
        if (this.attacking) {
            // Update attack animation based on current facing direction
            this.animator = this.animationMap.get(this.facing === "right" ? `attackRight` : `attackLeft`);
        } else if (!this.landed) {
            this.animator = this.animationMap.get(this.facing === "left" ? `jumpLeft` : `jumpRight`);
        } else if (this.game.left || this.game.right) {
            this.animator = this.animationMap.get(this.facing === "left" ? `runLeft` : `runRight`);
        } else {
            this.animator = this.animationMap.get(this.facing === "left" ? `idleLeft` : `idleRight`);
        }

        // Movement - allow movement while attacking
        if (this.game.left) this.x -= 130 * TICK;
        if (this.game.right) this.x += 130 * TICK;

        // Update attack box position based on current facing direction
        if (this.attacking) {
            if (this.facing === "right") {
                this.attackBox = new BoundingBox(this.x + 50, this.y + 10, 40, 50);
            } else {
                this.attackBox = new BoundingBox(this.x - 40, this.y + 10, 40, 50);
            }
        } else {
            this.attackBox = null;
        }


        // Update animations
        if (!this.attacking) {
            if (!this.landed) {
                this.animator = this.animationMap.get(this.facing === "left" ? `jumpLeft` : `jumpRight`);
            } else if (this.game.left || this.game.right) {
                this.animator = this.animationMap.get(this.facing === "left" ? `runLeft` : `runRight`);
            } else {
                this.animator = this.animationMap.get(this.facing === "left" ? `idleLeft` : `idleRight`);
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

        this.updateLastBB();
        this.updateBoundingBox();

        // Collision detection (for damage)
        this.game.entities.forEach(entity => {
            if ((entity instanceof Eclipser || entity instanceof Drone)  && this.attackBox && this.attackBox.collide(entity.box) && this.game.closeAttack) {
                if(entity instanceof Eclipser){
                    entity.takeDamage(100);
                }else if(entity instanceof  Drone){
                    entity.takeDamage(100);
                }

            }

            if (entity.box && this.box.collide(entity.box)) {
                if (this.velocity.y > 0 && entity instanceof Platform && (this.lastBox.bottom <= entity.box.top)) {
                    this.velocity.y = 0;
                    this.y = entity.box.top - 64;
                    this.landed = true;
                } else if (this.velocity.y < 0 && entity instanceof Platform && (this.lastBox.top >= entity.box.bottom)) {
                    this.velocity.y = 300;
                    this.y = entity.box.bottom;
                } else {
                    this.landed = false;
                }

                // Horizontal collision
                if (this.game.right || this.game.left) {
                    if (this.lastBox.right <= entity.box.left) {
                        this.x = entity.box.left - this.box.width;
                    } else if (this.lastBox.left >= entity.box.right) {
                        this.x = entity.box.right;
                    }
                }
            }
            this.updateBoundingBox();
        });

    }

    draw(ctx) {
        if (this.attacking && this.facing === "left") {
            this.animator.drawFrame(this.game.clockTick, ctx, this.x - 38, this.y - 4, 2);
        } else {
            this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        }

        // Draw attack box (for debugging)
        if (this.attackBox) {
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.attackBox.x, this.attackBox.y, this.attackBox.width, this.attackBox.height);
        }

        // Draw bounding box
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        this.healthbar.draw(ctx);
    }
}
