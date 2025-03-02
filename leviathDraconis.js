class LeviathDraconis {
    constructor(game) {
        this.game = game;
        this.animator = new Animator(ASSET_MANAGER.getAsset(`./sprites/leviathDraconis/LeviathDraconisIdleRight.png`), 2, 0, 32, 32, 5, .35);
        this.box = new BoundingBox(this.x, this.y, 32, 64);
        this.x = gameWorld.width-50; //start x position
        this.y = 50; // start y position
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.landed = false;
        this.timeAbovePlayer = 0;
        this.maxTimeAbovePlayer = 0.5; //Max time that the boss can be above player
        this.hitpoints = 1000;
        this.maxhitpoints = 1000;
        this.healthbar = new HealthBar(this);
        this.removeFromWorld = false;
        this.updateBoundingBox();
    };
    getPlayer() {
        // Find any entity that's a player
        return this.game.entities.find(entity => 
            entity instanceof AzielSeraph || entity instanceof Grim || entity instanceof Kanji
        );
    };
    //No jump zone is below 3rd story platform and in between 2nd story platforms
    inNoJumpZone () {
        let inZone = false;
        if (this.getPlayer().x > 180 && this.getPlayer().y > 500 && this.getPlayer().box.right < gameWorld.width - 180) {
            inZone = true;
        }
        return inZone;
    }
    trackPlayerAndMove() {
        const TICK = this.game.clockTick;
        const player = this.getPlayer();
    
        const distanceX = player.box.x - this.box.x;
        const distanceY = player.box.y - this.box.y;
        const horizontalSpeed = 75;
        const jumpSpeed = -1030;
    
        // Move left or right, only if on the ground
        if (this.landed) {
            if (Math.abs(distanceX) > 5) { //Small buffer so sprite doesnt jitter
                this.velocity.x = distanceX > 0 ? horizontalSpeed : -horizontalSpeed;
            } else {
                this.velocity.x = 0; //Stop when near the player
            }
    
            //Jump if the player is much higher and within range
            if (distanceY < -60) { //Player is above
                if (this.canJump()) { //Check if jumping is possible
                    this.velocity.y = jumpSpeed;
                    this.landed = false;
                }
            }
            if (distanceY>5) {
                this.timeAbovePlayer+=TICK;
            }
        }
    }
    //Check if boss can jump onto a platform
    canJump() {
        return this.game.entities.some(entity => 
            entity instanceof Platform &&
            entity.box.y < this.box.y && //The platform is above
            !this.inNoJumpZone() &&
            ((Math.abs(entity.box.left - this.box.left) < 64) || (Math.abs(entity.box.right - this.box.right) < 64)) // platform within reach horizontally
        );
    };
    checkFloorCollision() {
        this.game.entities.forEach(entity => {
            if (entity.box && this.box.collide(entity.box)) {
                if (this.velocity.y > 0) {
                    if ((entity instanceof Platform) && (this.lastBox.bottom) <= entity.box.top) {
                        this.velocity.y = 0;
                        this.y = entity.box.top-64;
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
    }
    updateBoundingBox() {
        this.box = new BoundingBox(this.x, this.y, 32, 64);
    };
    updateLastBB() {
        this.lastBox = this.box;
    };
    update() {
        const TICK = this.game.clockTick;
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > gameWorld.width-this.box.width) {
            this.x = gameWorld.width-this.box.width;
        }
        this.trackPlayerAndMove();
        this.velocity.y += this.fallGrav * TICK;
        this.x += this.velocity.x * TICK;
        this.y += this.velocity.y * TICK;
        this.updateLastBB();
        this.updateBoundingBox();
        //Check if we have been stuck above player on platform for more than a second
        if (this.timeAbovePlayer>this.maxTimeAbovePlayer) {
            this.landed = false;
            this.timeAbovePlayer = 0;
        } else {
            this.checkFloorCollision();
        }
        this.healthbar.update();
    };
    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        this.healthbar.draw(ctx);
    };
}