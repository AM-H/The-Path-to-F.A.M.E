class KyraBlade {
    constructor(game) {
        this.game = game;
        this.animator = new Animator(ASSET_MANAGER.getAsset(`./sprites/idleRight.png`), 0, 0, 48, 50, 4, .2);
        this.x = 0;
        this.y = 500;
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.facing = "right";
        this.animationMap = new Map();
        this.animationMap.set(`runRight`, new Animator(ASSET_MANAGER.getAsset('./sprites/runRight.png'), 0, 0, 50, 50, 6, 0.2));
        this.animationMap.set(`runLeft`, new Animator(ASSET_MANAGER.getAsset('./sprites/runLeft.png'), 0, 0, 50, 50, 6, 0.2));
        this.animationMap.set(`idleRight`, new Animator(ASSET_MANAGER.getAsset('./sprites/idleRight.png'), 0, 0, 48, 50, 4, .2));
        this.animationMap.set(`idleLeft`, new Animator(ASSET_MANAGER.getAsset('./sprites/idleLeft.png'), 0, 0, 48, 50, 4, 0.2));
        this.animationMap.set(`attackRight`, new Animator(ASSET_MANAGER.getAsset('./sprites/attack1Right.png'), 0, 0, 48, 50, 8, 0.1));
        this.animationMap.set(`attackLeft`, new Animator(ASSET_MANAGER.getAsset('./sprites/attack1Left.png'), 0, 0, 48, 50, 8, 0.1));
        this.animationMap.set(`longRangeRight`, new Animator(ASSET_MANAGER.getAsset('./sprites/attack2Right.png'), 0, 0, 48, 50, 8, 0.1));
        this.animationMap.set(`longRangeLeft`, new Animator(ASSET_MANAGER.getAsset('./sprites/attack2Left.png'), 0, 0, 48, 50, 8, 0.1));
        this.box = new BoundingBox(this.x, this.y, 16, 32);
        this.updateBoundingBox();
        this.landed = false;


    };

    updateBoundingBox() {
        this.box = new BoundingBox(this.x, this.y, 16, 32);
    };
    updateLastBB() {
        this.lastBox = this.box;
    };
    update () {
        const TICK = this.game.clockTick;

        //left control
        if (this.game.left) {
            this.x -= 4;
            if (this.facing !== "left") {
                this.facing = "left";
                this.animator = this.animationMap.get(`runLeft`);
            }
        }
        //right control
        if (this.game.right) {
            this.x += 4;
            if (this.facing !== "right") {
                this.facing = "right";
                this.animator = this.animationMap.get(`runRight`)
            }
        }
       //logic for which way our sprite is facing
        if (!this.game.left && !this.game.right) {
            if (this.facing === "left" && this.facing !== "idle") {
                this.animator = this.animationMap.get(`idleLeft`);
            } else if (this.facing === "right" && this.facing !== "idle") {
                this.animator = this.animationMap.get(`idleRight`);
            }
        }

        //jump logic with gravity
        if (this.game.jump && this.landed) { // jump
            this.velocity.y = -800;
            this.fallGrav = 1900;
            this.landed = false;
        } 
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > gameWorld.width-16) {
            this.x = gameWorld.width-16;
        }
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;
        this.updateLastBB();
        this.updateBoundingBox();

        //collision with floor and platforms:
        this.game.entities.forEach(entity => {
            if (entity.box && this.box.collide(entity.box)) {
                if (this.velocity.y > 0) {
                    if ((entity instanceof FirstLevelGround || entity instanceof FirstLevelPlatform1 || entity instanceof FirstLevelPlatform2) && (this.lastBox.bottom) <= entity.box.top) {
                        this.velocity.y = 0;
                        this.y = entity.box.top-32;
                        this.landed = true;
                        //console.log(`bottom collision`);
                    }
                } else if (this.velocity.y < 0) {
                    if ((entity instanceof FirstLevelPlatform1 || entity instanceof FirstLevelPlatform2) && (this.lastBox.top) >= entity.box.bottom) {
                        this.velocity.y = 300;
                        this.y = entity.box.bottom;
                        console.log('top collision');
                    }
                } else {
                    this.landed = false;
                }
                if (this.game.right || this.game.left) { // Only check side collisions if moving horizontally
                    if (this.lastBox.right <= entity.box.left) {// Collision from the left of platform
                        console.log(`right collision`);
                        this.x = entity.box.left - this.box.width;
                    } else if (this.lastBox.left >= entity.box.right) { // Collision from the right of platform
                        console.log(`left collision`);
                        this.x = entity.box.right;
                    }
                }
            }
            this.updateBoundingBox();
        });

        //close-range logic
        if (this.game.closeRange) {
            this.attacking = true;
            if (this.facing === 'right') {
                this.animator = this.animationMap.get('attackRight');
            } else if (this.facing === 'left'){
                this.animator = this.animationMap.get('attackLeft');
            }
        } else if (this.game.longRange) {
            this.attacking = true;
            if (this.facing === 'right') {
                this.animator = this.animationMap.get('longRangeRight');
            } else if (this.facing === 'left'){
                this.animator = this.animationMap.get('longRangeLeft');
            }

            // Spawn a bullet with image
            const bulletX = this.facing === "right" ? this.x + 50 : this.x - 10;
            const bulletY = this.y + 20;
            const bullet = new Bullet(this.game, bulletX, bulletY, this.facing);
            console.log("Spawning bullet at:", bulletX, bulletY); // Debug log
            this.game.addEntity(bullet);
        }

        // Reset attacking state after animation completes
        if (this.attacking && this.animator.isDone()) {
            this.attacking = false;
            this.animator.reset();
        }
    };
    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 25, 25);
    };
};