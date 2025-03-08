class GrimAxe {
    constructor(game, grim) {
        this.grim = grim;
        this.game = game;
        
        // Create animation map for both directions
        this.animationMap = new Map([
            [`right`, new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimAxeR.png`), 0, 0, 48, 48, 8, 0.07)],
            [`left`, new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimAxeL.png`), 0, 0, 48, 48, 8, 0.07)]
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

        this.debug = false;


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
            console.log(`attacking`);
            this.isAnimating = true;
            this.hasStartedAttack = true;
            this.elapsedTime = 0;
            this.animator = this.animationMap.get(this.facing);
        }

         //Check for boss collision & apply damage close range
         this.game.entities.forEach(entity => {
            if ((entity instanceof  inferno || entity instanceof  Shizoku || entity instanceof Eclipser || entity instanceof LeviathDraconis) && this.box.collide(entity.box) && this.game.closeAttack) {
                entity.takeDamage(10); // Deal 10 damage to boss
                console.log(`Boss takes damage! HP: ${entity.hitpoints}`);
            } else if ((entity instanceof Drone || entity instanceof Phoenix || entity instanceof stormSpirit) && this.box.collide(entity.box) && this.game.closeAttack) {
                entity.takeDamage(3);
                console.log(`Minion takes damage! HP: ${entity.hitpoints}`);
            }
        });

        // Handle attack - will continuously animate while button is held
        if (this.game.closeAttack) {
            // Start animating if not already
            if (!this.isAnimating) {
                console.log(`Starting close attack`);
                this.isAnimating = true;
                this.elapsedTime = 0;
                this.animator = this.animationMap.get(this.facing);
            }
            
            // Track elapsed time for damage cooldown
            this.damageCooldown -= this.game.clockTick;
            
            // Check for collisions and apply damage with cooldown
            if (this.damageCooldown <= 0) {
                this.game.entities.forEach(entity => {
                    if (this.box.collide(entity.box)) {
                        if (entity instanceof Eclipser || entity instanceof inferno || entity instanceof Shizoku || entity instanceof LeviathDraconis) {
                            entity.takeDamage(10); // Deal 10 damage to boss
                            console.log(`Boss takes damage! HP: ${entity.hitpoints}`);
                            this.damageCooldown = 0.5; // Set cooldown between damage ticks (0.5 seconds)
                        } else if (entity instanceof Drone || entity instanceof Phoenix || entity instanceof stormSpirit) {
                            entity.takeDamage(5); // Deal 5 damage to minions
                            console.log(`Enemy takes damage! HP: ${entity.hitpoints}`);
                            this.damageCooldown = 0.3; // Faster cooldown for minions (0.3 seconds)
                        }
                    }
                });
            }
        } else {
            // Stop animating when close attack button is released
            this.isAnimating = false;
        }
        
        // Animation timing logic
        if (this.isAnimating) {
            this.elapsedTime += this.game.clockTick;
            if (this.elapsedTime >= this.animationDuration) {
                // Reset animation timer but keep animating if button is still held
                this.elapsedTime = 0;
            }
        }

        this.updateBoundingBox();
    }

    draw(ctx) {

        this.grimCenterX = this.grim.x + this.grim.box.width / 2;
        this.grimCenterY = this.grim.y + this.grim.box.height / 2;

        if (this.isAnimating) {
            ctx.save();
            ctx.translate(this.grimCenterX, this.grimCenterY);
            ctx.rotate(this.rotation);
            ctx.translate(this.distanceFromGrim, 0);
            
            // Draw the animated axe
            this.animator.drawFrame(this.game.clockTick, ctx, -24, -24, 1.25);
            
            ctx.restore();
        }

            // Debug bounding box
            if (this.game.debugMode) {
                ctx.strokeStyle = `red`;
                ctx.lineWidth = 2;
                ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
            } 
        
    }
}