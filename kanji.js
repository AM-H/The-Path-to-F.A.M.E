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
        setTimeout(() => {
            this.canAttack = true;
        }, 100); // Small delay to ensure proper initialization

        // Create animation map for animations
        this.animationMap = new Map();
        this.animationMap.set(`runRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/runRight.png`), 0, 0, 32, 32, 6, 0.2));
        this.animationMap.set(`runLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/runLeft.png`), 0, 0, 32, 32, 6, 0.2));
        this.animationMap.set(`idleRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/IdleRight.png`), 0, 0, 32, 32, 9, 0.2));
        this.animationMap.set(`idleLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/IdleLeft.png`), 0, 0, 32, 32, 9, 0.2));
        this.animationMap.set(`attackRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/attackRight.png`), 33.9, 48, 96, 48, 7, 0.07));
        this.animationMap.set(`attackLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/attackLeft1.png`), 0, 0, 58, 34, 7, 0.07));
        this.animationMap.set(`jumpLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/jumpLeft.png`), 0, 0, 32, 32, 2, 0.5));
        this.animationMap.set(`jumpRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/jumpRight.png`), 0, 0, 32, 32, 2, 0.5));


        // Set default animation
        this.animator = this.animationMap.get(`idleRight`);

        this.attacking = false;
        //this.isMoving = false;

        // Set up bounding box for collisions
        this.box = new BoundingBox(this.x, this.y, 64, 64);
        this.updateBoundingBox();
        this.landed = false;
    }

    updateBoundingBox() {

            this.box = new BoundingBox(this.x, this.y, 64, 64);

    }

    updateLastBB() {
        this.lastBox = this.box;
    }



    update() {
        const TICK = this.game.clockTick;
        const moveSpeed = this.attacking ? 2 : 4;

        // Store the attack direction when starting an attack
        if (this.game.closeAttack && !this.attacking && this.canAttack) {
            this.attacking = true;
            this.canAttack = false;
            this.attackDirection = this.facing;
            console.log("Attacking");

            // Choose animation based on attack direction (not current facing)
            if (this.attackDirection === "right") {
                this.animator = this.animationMap.get(`attackRight`);
            } else {
                this.animator = this.animationMap.get(`attackLeft`);
            }

            const currentAnimator = this.animator;
            setTimeout(() => {
                this.attacking = false;
                this.canAttack = true;
                this.attackDirection = null;
                // Return to appropriate animation based on movement state
                if (this.game.left) {
                    this.animator = this.animationMap.get(`runLeft`);
                } else if (this.game.right) {
                    this.animator = this.animationMap.get(`runRight`);
                } else {
                    this.animator = this.animationMap.get(this.facing === "right" ? `idleRight` : `idleLeft`);
                }
            }, currentAnimator.frameCount * currentAnimator.frameDuration * 1000);
        }

        // Update facing direction
        if (!this.attacking) {
            if (this.game.left) {
                this.facing = "left";
            } else if (this.game.right) {
                this.facing = "right";
            }
        }

        // Handle movement
        if (this.game.left) {
            this.x -= moveSpeed;
        }
        if (this.game.right) {
            this.x += moveSpeed;
        }



        // Update animations when not attacking
        if (!this.attacking) {
            if (!this.landed) {
                this.animator = this.animationMap.get(this.facing === "left" ? `jumpLeft` : `jumpRight`);
            } else if (this.game.left || this.game.right) {
                this.animator = this.animationMap.get(this.facing === "left" ? `runLeft` : `runRight`);
            } else {
                this.animator = this.animationMap.get(this.facing === "left" ? `idleLeft` : `idleRight`);
            }
        }

        // Jump logic with gravity
        if (this.game.jump && this.landed) {
            this.velocity.y = -800;
            this.fallGrav = 1900;
            this.landed = false;
        }

        // World boundaries
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > gameWorld.width - 48) {
            this.x = gameWorld.width - 48;
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
                    if ((entity instanceof Platform)
                        && (this.lastBox.bottom) <= entity.box.top) {
                        this.velocity.y = 0;
                        this.y = entity.box.top - 64;
                        this.landed = true;
                    }
                } else if (this.velocity.y < 0) {
                    if ((entity instanceof Platform)
                        && (this.lastBox.top) >= entity.box.bottom) {
                        this.velocity.y = 300;
                        this.y = entity.box.bottom;
                    }
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
        // Use attackDirection instead of facing for offset calculations
        if (this.attacking && this.attackDirection === "left") {
            const offsetX = -38;
            const offsetY = -4;
            this.animator.drawFrame(this.game.clockTick, ctx, this.x + offsetX, this.y + offsetY, 2);
        } else {
            this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        }

        // Draw bounding box
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
    }
}