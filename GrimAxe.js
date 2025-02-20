class GrimAxe {
    constructor(game, grim) {
        this.grim = grim;
        this.game = game;
        
        // Create animation map for both directions
        this.animationMap = new Map([
            [`right`, new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimAxeR.png`), 0, 0, 48, 48, 8, 0.09)],
            [`left`, new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimAxeL.png`), 0, 0, 48, 48, 8, 0.09)]
        ]);
        
        // Default to right-facing animation
        this.animator = this.animationMap.get(`right`);
        this.facing = `right`;
        
        this.box = new BoundingBox(0, 0, 48, 48);
        this.rotation = 0;
        this.distanceFromGrim = 60;

        this.canAttack = false;
        setTimeout(() => {
            this.canAttack = true;
        }, 100); // Small delay to ensure proper initialization

        // Animation state tracking
        this.isAnimating = false;
        this.hasStartedAttack = false;  // New flag to track if attack has started
        this.elapsedTime = 0;
        this.animationDuration = 8 * 0.1; // frameCount * frameDuration
    }

    updateBoundingBox() {
        this.grimCenterX = this.grim.x + this.grim.box.width / 2;
        this.grimCenterY = this.grim.y + this.grim.box.height / 2;

        const axeX = this.grimCenterX + this.distanceFromGrim * Math.cos(this.rotation);
        const axeY = this.grimCenterY + this.distanceFromGrim * Math.sin(this.rotation);

        this.box = new BoundingBox(
            axeX - 24,
            axeY - 24,
            48,
            48
        );
    }

    update() {
        const dx = this.game.mouseX - this.grimCenterX;
        const dy = this.game.mouseY - this.grimCenterY;
        this.rotation = Math.atan2(dy, dx);

        // Update facing direction based on mouse position
        const newFacing = this.game.mouseX < this.grimCenterX ? `left` : `right`;
        if (this.facing !== newFacing) {
            this.facing = newFacing;
            this.animator = this.animationMap.get(this.facing);
        }

        // Handle attack start
        if (this.game.closeAttack && !this.hasStartedAttack && !this.isAnimating && this.canAttack) {
            console.log("attacking");
            this.isAnimating = true;
            this.hasStartedAttack = true;
            this.elapsedTime = 0;
            this.animator = this.animationMap.get(this.facing);
        }

         //Check for boss collision & apply damage close range
         this.game.entities.forEach(entity => {
            if ((entity instanceof  inferno || entity instanceof  Shizoku || entity instanceof Boss) && this.box.collide(entity.box) && this.game.closeAttack) {
                entity.takeDamage(10); // Deal 10 damage to boss
                console.log(`Boss takes damage! HP: ${entity.hitpoints}`);
            } else if ((entity instanceof Drone ||entity instanceof Phoenix || entity instanceof stormSpirit) && this.box.collide(entity.box) && this.game.closeAttack) {
                entity.takeDamage(10);
                console.log(`Drone takes damage! HP: ${entity.hitpoints}`);
            }
        });


        // Update animation
        if (this.isAnimating) {
            this.elapsedTime += this.game.clockTick;
            if (this.elapsedTime >= this.animationDuration) {
                this.isAnimating = false;
                this.elapsedTime = 0;
            }
        }

        // Reset attack flag when mouse button is released
        if (!this.game.closeAttack) {
            this.hasStartedAttack = false;
        }

        this.updateBoundingBox();
    }

    draw(ctx) {
        if (this.isAnimating) {
            ctx.save();
            ctx.translate(this.grimCenterX, this.grimCenterY);
            ctx.rotate(this.rotation);
            ctx.translate(this.distanceFromGrim, 0);
            
            // Draw the animated axe
            this.animator.drawFrame(this.game.clockTick, ctx, -24, -24, 1);
            
            ctx.restore();

            // Debug bounding box
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);

            
        }
    }
}