class HolyDiver {
    constructor(game, aziel) {
        this.aziel = aziel;
        this.game = game;
        this.animationMap = new Map();
        this.animationMap.set(`right`, new Animator(ASSET_MANAGER.getAsset(`./sprites/HolyDiverRight.png`), 0, 0, 32, 32, 8, 0.1));
        this.animationMap.set(`left`, new Animator(ASSET_MANAGER.getAsset(`./sprites/HolyDiverLeft.png`), 0, 0, 32, 32, 8, 0.1));
        this.box = new BoundingBox(0, 0, 64, 64);
        this.rotation = 0; // Angle of rotation in radians
        this.distanceFromAziel = 60; // Distance from Aziel`s center
    }

    updateBoundingBox() {
        const azielCenterX = this.aziel.box.x + this.aziel.box.width / 2;
        const azielCenterY = this.aziel.box.y + this.aziel.box.height / 2;

        // Calculate the rotated position of HolyDiver
        const rotatedX = azielCenterX + this.distanceFromAziel * Math.cos(this.rotation);
        const rotatedY = azielCenterY + this.distanceFromAziel * Math.sin(this.rotation);

        // Update the bounding box position
        this.box = new BoundingBox(rotatedX - 32, rotatedY - 32, 64, 64);
    }
    
    updateLastBB() {
        this.lastBox = this.box;
    }

    update() {
        // Calculate angle to the mouse position
        const azielCenterX = this.aziel.box.x + this.aziel.box.width / 2;
        const azielCenterY = this.aziel.box.y + this.aziel.box.height / 2;

        const dx = this.game.mouseX - azielCenterX;
        const dy = this.game.mouseY - azielCenterY;

        this.rotation = Math.atan2(dy, dx); // Calculate angle in radians

        // Switch animator based on mouse position
        if (this.game.mouseX < azielCenterX && this.game.closeAttack) {
            this.animator = this.animationMap.get(`left`);
        } else {
            this.animator = this.animationMap.get(`right`);
        }

        this.updateBoundingBox();
    }

    draw(ctx) {
        if (this.game.closeAttack) {
            const azielCenterX = this.aziel.box.x + this.aziel.box.width / 2;
            const azielCenterY = this.aziel.box.y + this.aziel.box.height / 2;

            ctx.save(); // Save the current canvas state

            // Move the canvas origin to Aziel`s center
            ctx.translate(azielCenterX, azielCenterY);

            // Rotate the canvas by the calculated angle
            ctx.rotate(this.rotation);

            // Move the sprite further from Aziel along the rotated direction
            ctx.translate(this.distanceFromAziel, 0);

            // Draw the sprite with its center aligned to the new position
            this.animator.drawFrame(
                this.game.clockTick,
                ctx,
                -32, // Offset to align the center of the sprite
                -32
            );

            ctx.restore(); // Restore the canvas to its original state
        }

        // Draw the bounding box
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
    }
}
