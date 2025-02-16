class HolyDiver {
    constructor(game, aziel) {
        this.removeFromWorld = false;
        this.aziel = aziel;
        this.game = game;
        this.animationMap = new Map([
            ["right", new Animator(ASSET_MANAGER.getAsset(`./sprites/HolyDiverRight.png`), 0, 0, 32, 32, 8, 0.1)],
            ["left", new Animator(ASSET_MANAGER.getAsset(`./sprites/HolyDiverLeft.png`), 0, 0, 32, 32, 8, 0.1)],
            ["rightRanged", new Animator(ASSET_MANAGER.getAsset(`./sprites/LaserHolyDiverRight.png`), 0, 0, 500, 32, 8, 0.1)],
            ["leftRanged", new Animator(ASSET_MANAGER.getAsset(`./sprites/LaserHolyDiverLeft.png`), 0, 0, 500, 32, 8, 0.1)]
        ]);
        this.animator = this.animationMap.get("right");
        this.laserAnimator = this.animationMap.get("rightRanged");
        this.laserBoxes = [];
        this.box = new BoundingBox(0, 0, 32, 32);
        this.rotation = 0;
        this.distanceFromAziel = 60;
    }

    updateBoundingBox() {
        //For Holy Diver bounding box
        const startX = this.azielCenterX + this.distanceFromAziel * Math.cos(this.rotation);
        const startY = this.azielCenterY + this.distanceFromAziel * Math.sin(this.rotation);
        //For Lazer boudning boxes
        const laserStartX = this.azielTopHalfCenterX + this.distanceFromAziel * Math.cos(this.rotation);
        const laserStartY = this.azielTopHalfCenterY + this.distanceFromAziel * Math.sin(this.rotation);
        //Holy diver bounding box
        this.box = new BoundingBox(startX - 32, startY - 32, 64, 64);
        //Laser bounding boxes 
        this.laserBoxes = [];

        for (let i = 0; i < 65; i++) {
            const segmentX = laserStartX + i * 15 * Math.cos(this.rotation);
            const segmentY = laserStartY + i * 15 * Math.sin(this.rotation);
            this.laserBoxes.push(new BoundingBox(segmentX, segmentY, 15, 15));
        }
    }

    update() {
        this.azielCenterX = this.aziel.box.x + this.aziel.box.width / 2;
        this.azielCenterY = this.aziel.box.y + this.aziel.box.height / 2;
        this.azielTopHalfCenterX = this.aziel.box.x + this.aziel.box.width / 4;
        this.azielTopHalfCenterY = this.aziel.box.y + this.aziel.box.height / 4;


        const dx = this.game.mouseX - this.azielCenterX;
        const dy = this.game.mouseY - this.azielCenterY;
        this.rotation = Math.atan2(dy, dx);

        const facingLeft = this.game.mouseX < this.azielCenterX;
        this.animator = this.animationMap.get(facingLeft ? "left" : "right");
        this.laserAnimator = this.animationMap.get(facingLeft ? "leftRanged" : "rightRanged");
        // Check for laser collision
        this.laserBoxes.forEach(laserBox => {
            this.game.entities.forEach(entity => {
                if ((entity instanceof Boss || entity instanceof Drone || entity instanceof  Shizoku) && laserBox.collide(entity.box) && this.aziel.isRangeAttacking) {
                    entity.takeDamage(100);
                    console.log(`${entity.constructor.name} takes damage! HP: ${entity.hitpoints}`);
                }
            });
        });
        //Check for boss collision & apply damage close range
        this.game.entities.forEach(entity => {
            if ((entity instanceof  Shizoku || entity instanceof Boss) && this.box.collide(entity.box) && this.game.closeAttack) {
                entity.takeDamage(10); // Deal 10 damage to boss
                console.log(`Boss takes damage! HP: ${entity.hitpoints}`);
            } else if (entity instanceof Drone && this.box.collide(entity.box) && this.game.closeAttack) {
                entity.takeDamage(10);
                console.log(`Drone takes damage! HP: ${entity.hitpoints}`);
            }
        });

        this.updateBoundingBox();
    }

    applyRotation(ctx) {
        ctx.save();
        ctx.translate(this.azielCenterX, this.azielCenterY);
        ctx.rotate(this.rotation);
        ctx.translate(this.distanceFromAziel, 0);
    }

    draw(ctx) {
        if (this.aziel.isRangeAttacking) {
            this.applyRotation(ctx);
            this.laserAnimator.drawFrame(this.game.clockTick, ctx, -32, -32, 2);
            ctx.restore();
        } else if (this.game.closeAttack) {
            this.applyRotation(ctx);
            this.animator.drawFrame(this.game.clockTick, ctx, -32, -32, 2);
            ctx.restore();
        }

        // Debugging: Draw the hitboxes for visual reference
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        this.laserBoxes.forEach(box => ctx.strokeRect(box.x, box.y, box.width, box.height));
    }
}
