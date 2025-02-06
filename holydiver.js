class HolyDiver {
    constructor(game, aziel) {
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

        this.updateBoundingBox();
    }

    applyRotation(ctx) {
        ctx.save();
        ctx.translate(this.azielCenterX, this.azielCenterY);
        ctx.rotate(this.rotation);
        ctx.translate(this.distanceFromAziel, 0);
    }

    draw(ctx) {
        if (this.game.closeAttack || this.game.rangeAttack) {
            this.applyRotation(ctx);
            (this.game.closeAttack ? this.animator : this.laserAnimator).drawFrame(this.game.clockTick, ctx, -32, -32);
            ctx.restore();
        }

        ctx.strokeStyle = "red";
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        this.laserBoxes.forEach(box => ctx.strokeRect(box.x, box.y, box.width, box.height));
    }
}
