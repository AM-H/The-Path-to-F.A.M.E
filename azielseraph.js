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
        this.x = 0;
        this.y = 500;
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.facing = "right";
        this.hitpoints = 100;
        this.maxhitpoints = 100;
        this.radius = 20;
        this.lastDamageTime = 0;
        this.isAttacking = false;
        this.healthbar = new HealthBar(this);
        this.animationMap = new Map();
        this.animationMap.set(`runRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/moveRightAziel.png`), 2, 0, 32, 32, 6, 0.1));
        this.animationMap.set(`runLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/moveLeftAziel.png`), 2, 0, 32, 32, 6, 0.1));
        this.animationMap.set(`idleRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/IdleRightAziel.png`), 13, 0, 32, 32, 4, 0.2));
        this.animationMap.set(`idleLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/IdleLeftAziel.png`), 13, 0, 32, 32, 4, 0.2));
        this.box = new BoundingBox(this.x, this.y, 32, 64);
        this.updateBoundingBox();
        this.landed = false;

    };

    updateBoundingBox() {
        this.box = new BoundingBox(this.x, this.y, 32, 64);
    };

    updateLastBB() {
        this.lastBox = this.box;
    };

    takeDamage(amount) {
        this.hitpoints -= amount;
        if (this.hitpoints < 0) this.hitpoints = 0; // Prevent negative HP
        this.healthbar.update()
        console.log("getting hit")
        console.log(amount)
    } 
       
    update () {
        const TICK = this.game.clockTick;
        const currentTime = this.game.timer.gameTime;

        if (this.hitpoints <= 0) {
            this.hitpoints = 0;
            this.game.isGameOver = true;
            this.game.addEntity(new GameOver(this.game));
            return;
        }

        //left control
        if (this.game.left) {
            this.x -= 130 * TICK;
            if (this.facing !== "left") {
                this.facing = "left";
                this.animator = this.animationMap.get(`runLeft`);
            }
        }
        //right control
        if (this.game.right) {
            this.x += 130 * TICK;
            if (this.facing !== "right") {
                this.facing = "right";
                this.animator = this.animationMap.get(`runRight`)
            }
        }
       //logic for which way our sprite is facing
        if (!this.game.left && !this.game.right) {
            if (this.facing === "left" && this.facing !== "idle") {
                this.facing = "idle";
                this.animator = this.animationMap.get(`idleLeft`);
            } else if (this.facing === "right" && this.facing !== "idle") {
                this.facing = "idle";
                this.animator = this.animationMap.get(`idleRight`);
            }
        }
        //jump logic with gravity
        if (this.game.jump && this.landed) { // jump
            this.velocity.y = -825;
            this.fallGrav = 1900;
            this.landed = false;
        } 
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > gameWorld.width-16) {
            this.x = gameWorld.width-16;
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
        
        //collision with floor and platforms:
        this.game.entities.forEach(entity => {
            if (entity.box && this.box.collide(entity.box)) {
                if (this.velocity.y > 0) {
                    if ((entity instanceof Platform) && (this.lastBox.bottom) <= entity.box.top) {
                        this.velocity.y = 0;
                        this.y = entity.box.top-64;
                        this.landed = true;
                        //console.log(`bottom collision`);
                    }
                } else if (this.velocity.y < 0) {
                    if ((entity instanceof Platform) && (this.lastBox.top) >= entity.box.bottom) {
                        this.velocity.y = 300;
                        this.y = entity.box.bottom;
                        console.log(`top collision`);
                    }
                } else {
                    this.landed = false;
                }
                if (this.game.right || this.game.left) { // Only check side collisions if moving horizontally
                    if (this.lastBox.right <= entity.box.left && !(entity instanceof HolyDiver) && !(entity instanceof Bullet)) {// Collision from the left of platform
                        console.log(`right collision`);
                        this.x = entity.box.left - this.box.width;
                    } else if (this.lastBox.left >= entity.box.right && !(entity instanceof HolyDiver) && !(entity instanceof Bullet)) { // Collision from the right of platform
                        console.log(`left collision`);
                        this.x = entity.box.right;
                    }
                }
            }
            this.updateBoundingBox();
        });
        this.healthbar.update();
        
    };
    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        //ctx.strokeRect(this.box.x,this.box.y, this.box.width, this.box.height);
        this.healthbar.draw(ctx);
    };
};
