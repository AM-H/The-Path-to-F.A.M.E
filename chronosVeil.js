class ChronosVeil {
    constructor(game, leviath) {
        this.game = game;
        this.removeFromWorld = false;
        this.leviath = leviath;
        this.animationMap = new Map([
            ["right", new Animator(ASSET_MANAGER.getAsset(`./sprites/chronosVeil/ChronosVeilRight.png`), 0, 0, 32, 32, 8, 0.1)],
            ["left", new Animator(ASSET_MANAGER.getAsset(`./sprites/chronosVeil/ChronosVeilLeft.png`), 0, 0, 32, 32, 8, 0.1)],
            ["rightRanged", new Animator(ASSET_MANAGER.getAsset(`./sprites/chronosVeil/ChronosVeilLaserRight.png`), 0, 0, 500, 32, 8, 0.1)],
            ["leftRanged", new Animator(ASSET_MANAGER.getAsset(`./sprites/chronosVeil/ChronosVeilLaserLeft.png`), 0, 0, 500, 32, 8, 0.1)]
        ]);
        this.animator = this.animationMap.get("left");
        this.laserAnimator = this.animationMap.get("leftRanged");
        this.laserBoxes = [];
        this.box = new BoundingBox(0, 0, 32, 32);
        this.rotation = 0;
        this.distanceFromLeviath = 50;
    };
    getPlayer() {
        // Find any entity thats a player
        return this.game.entities.find(entity => 
            entity instanceof AzielSeraph || entity instanceof Grim || entity instanceof Kanji || entity instanceof Kyra
        );
    };
    updateBoundingBox() {
        //For Chronos Veil bounding box
        const startX = this.leviathCenterX + this.distanceFromLeviath * Math.cos(this.rotation);
        const startY = this.leviathCenterY + this.distanceFromLeviath * Math.sin(this.rotation);
        //For Lazer boudning boxes
        const laserStartX = this.leviathTopHalfCenterX + this.distanceFromLeviath * Math.cos(this.rotation);
        const laserStartY = this.leviathTopHalfCenterY + this.distanceFromLeviath * Math.sin(this.rotation);
        //Chronos Veil bounding box
        this.box = new BoundingBox(startX - 32, startY - 32, 64, 64);
        //Laser bounding boxes 
        this.laserBoxes = [];

        for (let i = 0; i < 65; i++) {
            const segmentX = laserStartX + i * 15 * Math.cos(this.rotation);
            const segmentY = laserStartY + i * 15 * Math.sin(this.rotation);
            this.laserBoxes.push(new BoundingBox(segmentX, segmentY, 15, 15));
        }
    }

    applyRangeAttackDamage() {
        if (!this.leviath.isRangeAttacking) return;
    
        // Get blocking objects (Holy Diver or Grim's Axe)
        const blockers = this.game.entities.filter(entity => entity instanceof HolyDiver || entity instanceof GrimAxe);
    
        // **Check if any blocker is actually hit by the laser**
        const laserBlocked = blockers.some(blocker => 
            this.laserBoxes.some(laserBox => laserBox.collide(blocker.box))
        );
    
        // **Check if the player is actually blocking**
        const player = this.getPlayer();
        const playerIsBlocking = player.isCloseAttacking && laserBlocked; 
    
        if (!playerIsBlocking) {
            // **Deal damage to the player if they are not blocking**
            this.game.entities.forEach(entity => {
                if ((entity instanceof AzielSeraph || entity instanceof Grim) &&
                    this.laserBoxes.some(laserBox => laserBox.collide(entity.box))) {
                    entity.takeDamage(3);
                    console.log(`Chronos Veil's laser hits ${entity.constructor.name}! HP: ${entity.hitpoints}`);
                }
            });
        }
    }

    applyCloseAttackDamage() {
        if (!this.leviath.isCloseAttacking) return;

        this.game.entities.forEach(entity => {
            if ((entity instanceof AzielSeraph || entity instanceof Grim || entity instanceof Kanji) && this.box.collide(entity.box)) {
                if (this.getPlayer().isCloseAttacking || this.game.closeAttack) {
                    entity.takeDamage(1); //If the player is close attacking whilst getting close attacked, reduce damage dealt
                } else {
                    entity.takeDamage(4);
                }
            }
        });
    }

    update() {
        this.leviathCenterX = this.leviath.box.x + this.leviath.box.width / 2;
        this.leviathCenterY = this.leviath.box.y + this.leviath.box.height / 2;
        this.leviathTopHalfCenterX = this.leviath.box.x + this.leviath.box.width / 4;
        this.leviathTopHalfCenterY = this.leviath.box.y + this.leviath.box.height / 4;

        const player = this.getPlayer();
        const playerCenterX = player.box.x + player.box.width / 2;
        const playerCenterY = player.box.y + player.box.height / 2;

        const dx = playerCenterX - this.leviathCenterX;
        const dy = playerCenterY - this.leviathCenterY;
        this.rotation = Math.atan2(dy, dx);

        const facingLeft = playerCenterX < this.leviathCenterX;
        const newAnimator = this.animationMap.get(facingLeft ? "left" : "right");
        const newLaserAnimator = this.animationMap.get(facingLeft ? "leftRanged" : "rightRanged");

        if (this.laserAnimator !== newLaserAnimator) {
            newLaserAnimator.elapsedTime = this.laserAnimator.elapsedTime;
            newLaserAnimator.currentFrame = this.laserAnimator.currentFrame;
        }

        this.animator = newAnimator;
        this.laserAnimator = newLaserAnimator;
        this.applyRangeAttackDamage();
        this.applyCloseAttackDamage();

        this.updateBoundingBox();
    };
    applyRotation(ctx) {
        ctx.save();
        ctx.translate(this.leviathCenterX, this.leviathCenterY);
        ctx.rotate(this.rotation);
        ctx.translate(this.distanceFromLeviath, 0);
    }
    draw(ctx) {
        if (this.leviath.isRangeAttacking) {
            this.applyRotation(ctx);
            this.laserAnimator.drawFrame(this.game.clockTick, ctx, -32, -32, 2);
            ctx.restore();
        } else if (this.leviath.isCloseAttacking) {
            this.applyRotation(ctx);
            this.animator.drawFrame(this.game.clockTick, ctx, -32, -32, 2);
            ctx.restore();
        }

        // Debugging: Draw the hitboxes for visual reference
        if (this.game.debugMode) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        }
    };
}