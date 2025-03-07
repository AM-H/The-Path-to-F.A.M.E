class LeviathDraconis {
    constructor(game) {
        this.game = game;
        this.animator = new Animator(ASSET_MANAGER.getAsset(`./sprites/leviathDraconis/LeviathDraconisIdleRight.png`), 2, 0, 32, 32, 5, .35);
        this.animationMap = new Map();
        this.animationMap.set(`runRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/leviathDraconis/LeviathDraconisRight.png`), 2, 0, 32, 32, 6, 0.15));
        this.animationMap.set(`runLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/leviathDraconis/LeviathDraconisLeft.png`), 13, 0, 32, 32, 6, 0.15));
        this.animationMap.set(`idleRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/leviathDraconis/LeviathDraconisIdleRight.png`), 2, 0, 32, 32, 4, 0.2));
        this.animationMap.set(`idleLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/leviathDraconis/LeviathDraconisIdleLeft.png`), 13, 0, 32, 32, 4, 0.2));
        this.facing = "left";
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
        this.defeated = false;
        this.isCloseAttacking = false;
        this.rangeAttackCooldown = 10;  //Cooldown in seconds
        this.rangeAttackDuration = 0.8; //Duration of the long-range attack in seconds
        this.rangeAttackStartTime = 0;  //Time when the current range attack started
        this.isRangeAttacking = false;  //Flag to track if the range attack is active
        this.damageCooldown = 0;
        this.invincibilityTime = 0.5; // Time of invincibility after taking damage
        //time stopping range
        this.isTimeStopped = false;
        this.timeStopRange = 95; //If player within 95 pixels of leviath Draconis, they stop moving
        this.timeStopStart = 0;
        this.timeStopLength = 4;
        this.timeStopCooldown = 20;
        //Sound for timestop
        this.timeStopSoundPlayed = false;
        this.updateBoundingBox();
    };
    getPlayer() {
        // Find any entity thats a player
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
        const horizontalSpeed = 65;
        const jumpSpeed = -1030;

        if (this.landed) {
            if (Math.abs(distanceX) > 20) {
                this.velocity.x = distanceX > 0 ? horizontalSpeed : -horizontalSpeed;
                this.facing = distanceX > 0 ? "right" : "left";
            } else {
                this.velocity.x = 0;
            }

            if (distanceY < -60 && this.canJump()) {
                this.velocity.y = jumpSpeed;
                this.landed = false;
            }
            if (distanceY > 5) {
                this.timeAbovePlayer += TICK;
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
    };
    takeDamage(amount) {
        if (this.damageCooldown <= 0) {
            this.hitpoints -= amount;
            this.damageCooldown = this.invincibilityTime;
        }
        if (this.hitpoints < 0) this.hitpoints = 0;
    }
    updateCloseAttack() {
        const player = this.getPlayer();
        const bossCenter = { x: this.box.x + this.box.width / 2, y: this.box.y + this.box.height / 2 };
        const playerCenter = { x: player.box.x + player.box.width / 2, y: player.box.y + player.box.height / 2 };
        this.isCloseAttacking = getDistance(bossCenter, playerCenter) < 200; //Distance to active close Attack, not neccesarily range of attack
    };
    updateRangeAttack() {
        const currentTime = this.game.timer.gameTime;
        //Ten second delay so Leviath Dracons does not immediately range attack
        if (this.rangeAttackStartTime === 0) {
            this.rangeAttackStartTime = currentTime + 10;
        }
        if (currentTime - this.rangeAttackStartTime >= this.rangeAttackCooldown) {
            this.isRangeAttacking = true;
            this.rangeAttackStartTime = currentTime;
        } else if (currentTime - this.rangeAttackStartTime >= this.rangeAttackDuration) {
            this.isRangeAttacking = false;
        }
    }
    updateBoundingBox() {
        this.box = new BoundingBox(this.x, this.y, 32, 64);
    };
    updateLastBB() {
        this.lastBox = this.box;
    };
    updateAnimation() {
        if (this.velocity.x > 0) {
            this.animator = this.animationMap.get("runRight");
        } else if (this.velocity.x < 0) {
            this.animator = this.animationMap.get("runLeft");
        } else {
            this.animator = this.animationMap.get(this.facing === "right" ? "idleRight" : "idleLeft");
        }
    };
    updateTimeStop() {
        const TICK = this.game.clockTick;
        if (this.timeStopCooldown <=20 ) {
            this.timeStopCooldown-=TICK;
        }
        if (this.timeStopCooldown <= 0) {
            this.isTimeStopped = true;
            this.timeStopStart+=TICK
            if (!this.timeStopSoundPlayed) {
                ASSET_MANAGER.getAsset(`./audio/stopTime.mp3`).volume = 0.4;
                ASSET_MANAGER.playAsset(`./audio/stopTime.mp3`);
                this.timeStopSoundPlayed = true;
            }
        }
        if (this.timeStopStart>=this.timeStopLength) {
            this.isTimeStopped = false;
            this.timeStopStart = 0;
            this.timeStopCooldown = 20;
            this.timeStopSoundPlayed = false; // Reset flag so it can play again next time
        }
        this.game.isTimeStopped = this.isTimeStopped;
    };
    update() {
        const TICK = this.game.clockTick;
        //Wall boundaries
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > gameWorld.width-this.box.width) {
            this.x = gameWorld.width-this.box.width;
        }
        this.trackPlayerAndMove();
        if (!this.isTimeStopped) {
            this.velocity.y += this.fallGrav * TICK;
            this.x += this.velocity.x * TICK;
            this.y += this.velocity.y * TICK;
        }
        this.updateAnimation();
        this.updateCloseAttack();
        this.updateRangeAttack();
        this.updateTimeStop();
        this.updateLastBB();
        this.updateBoundingBox();
        //Check if we have been stuck above player on platform for more than a second
        if (this.timeAbovePlayer>this.maxTimeAbovePlayer) {
            this.landed = false;
            this.timeAbovePlayer = 0;
        } else {
            this.checkFloorCollision();
        }
        if (this.hitpoints <= 0) {
            this.defeated = true;
        }
        if (this.damageCooldown > 0) this.damageCooldown -= TICK;
        this.healthbar.update();
    };
    draw(ctx) {
        if (this.isTimeStopped && this.facing == `right`) {
            this.animator = this.animationMap.get(`idleRight`)
        } else if (this.isTimeStopped && this.facing == `left`) {
            this.animator = this.animationMap.get(`idleLeft`)
        }
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        if (this.game.debugMode) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        }
        if (this.isTimeStopped) {
            ctx.beginPath();
            ctx.arc(this.x + 16, this.y + 32, this.timeStopRange, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0, 0, 255, 0.15)";
            ctx.fill();
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        this.healthbar.draw(ctx);
    };
}