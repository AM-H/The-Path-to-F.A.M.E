class Kanji {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 500;
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.facing = "right";


        this.canAttack = false;
        setTimeout(() => {
            this.canAttack = true;
        }, 100); // Small delay to ensure proper initialization

        // Create animation map for animations
        this.animationMap = new Map();
        this.animationMap.set('runRight', new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/runRight.png`), 0, 0, 32, 32, 6, 0.2));
        this.animationMap.set('runLeft', new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/runLeft.png`), 0, 0, 32, 32, 6, 0.2));
        this.animationMap.set('idleRight', new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/IdleRight.png`), 0, 0, 32, 32, 9, 0.2));
        this.animationMap.set('idleLeft', new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/IdleLeft.png`), 0, 0, 32, 32, 9, 0.2));
        this.animationMap.set('attackRight', new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/attackRight.png`), 33.9, 48, 96, 48, 7, 0.07));
        this.animationMap.set('attackLeft', new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/attackLeft.png`), -3, 48, 96, 48, 7, 0.07));
        //this.animationMap.set('runAttackRight', new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/attackRight.png`), 24, 48, 96, 48, 7, 0.089));
       // this.animationMap.set('runAttackLeft', new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/attackLeft.png`), -3, 48, 96, 48, 7, 0.089));

        // Set default animation
        this.animator = this.animationMap.get('idleRight');

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

        // Left movement
        this.isMoving = this.game.left || this.game.right;

        // Left movement
        if (this.game.left) {
            this.x -= 4;
            this.facing = "left";
            if (!this.attacking) {
                this.animator = this.animationMap.get('runLeft');
            }
        }

        // Right movement
        if (this.game.right) {
            this.x += 4;
            this.facing = "right";
            if (!this.attacking) {
                this.animator = this.animationMap.get('runRight');
            }
        }

        // Idle state
        if (!this.game.left && !this.game.right && !this.attacking) {
            if (this.facing === "left") {
                this.animator = this.animationMap.get('idleLeft');
            } else if (this.facing === "right") {
                this.animator = this.animationMap.get('idleRight');
            }
        }

        // Attack logic with running attack animations
        if (this.game.closeAttack && !this.attacking && this.canAttack) {
            this.attacking = true;
            this.canAttack = false;
            console.log("Attacking");

            // Choose animation based on movement state
            if (this.facing === "right") {
                this.animator = this.animationMap.get( 'attackRight');
            } else {
                this.animator = this.animationMap.get('attackLeft');
            }

            // Reset attack state after animation finishes
            const currentAnimator = this.animator;
            setTimeout(() => {
                this.attacking = false;
                this.canAttack = true;
                // Return to appropriate animation based on movement state
                if (this.game.left) {
                    this.animator = this.animationMap.get('runLeft');
                } else if (this.game.right) {
                    this.animator = this.animationMap.get('runRight');
                } else {
                    this.animator = this.animationMap.get(this.facing === "right" ? 'idleRight' : 'idleLeft');
                }
            }, currentAnimator.frameCount * currentAnimator.frameDuration * 1000);
        }


        // Jump logic with gravity
        if (this.game.jump && this.landed) {
            this.velocity.y = -800; //change this for jumping height
            this.fallGrav = 1900;
            this.landed = false;
        }

        // World boundaries
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > gameWorld.width - 48) { // Updated to match sprite width
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
                        this.y = entity.box.top - 64; // Updated to match sprite height
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
        if(this.facing === "left"){
            this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2, true);
        }else{
            this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        }


        // Draw bounding box (for debugging)
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
    }
}