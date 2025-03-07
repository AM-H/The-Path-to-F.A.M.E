class BurningEffect {
    constructor(game, player) { // Pass the player directly instead of x, y
        this.game = game;
        this.player = player; // Store reference to the player
        this.x = player.x + player.box.width / 2; // Initial position at player's center
        this.y = player.y + player.box.height / 2;

        this.width = 32; // Assuming effect.png sprite dimensions
        this.height = 32;
        this.scale = 2;

        this.duration = 5; // 5 seconds
        this.elapsedTime = 0;
        this.removeFromWorld = false;

        this.damagePerSecond = 2; // 1 damage per second
        this.damageTimer = 0; // Timer for damage ticks
        this.hitEntities = new Set();

        // Animation setup
        const effectSprite = ASSET_MANAGER.getAsset(`./sprites/eye/effect.png`);
        console.log("Effect Sprite:", effectSprite, "Loaded:", effectSprite?.complete, "Width:", effectSprite?.naturalWidth, "Height:", effectSprite?.naturalHeight);

        this.animator = new Animator(
            effectSprite && effectSprite.complete ? effectSprite : new Image(),
            0, 0, this.width, this.height, 4, 0.1 // Adjust frame count and speed based on your sprite
        );

        this.updateBoundingBox();
    }

    updateBoundingBox() {
        this.box = new BoundingBox(
            this.x - (this.width * this.scale) / 2,
            this.y - (this.height * this.scale) / 2,
            this.width * this.scale,
            this.height * this.scale
        );
    }

    update() {
        const TICK = this.game.clockTick;

        // Update position to follow the player
        if (this.player) {
            this.x = this.player.x + this.player.box.width / 2;
            this.y = this.player.y + this.player.box.height / 2;
            this.updateBoundingBox();
        }

        this.elapsedTime += TICK;
        this.damageTimer += TICK;

        // Deal damage every second
        if (this.damageTimer >= 1) {
            if (this.player && this.box.collide(this.player.box) && !this.hitEntities.has(this.player)) {
                if (this.player.takeDamage) {
                    this.player.takeDamage(this.damagePerSecond);
                    console.log(`Player burning! Damage: ${this.damagePerSecond}, Remaining HP: ${this.player.hitpoints}`);
                }
                this.hitEntities.add(this.player); // Prevent multiple hits in the same tick
            }
            this.damageTimer = 0; // Reset timer
            this.hitEntities.clear(); // Clear to allow damage next second
        }

        // Remove after 5 seconds
        if (this.elapsedTime >= this.duration) {
            this.removeFromWorld = true;
            console.log("Burning effect ended");
        }
    }

    draw(ctx) {
        const spriteSheet = this.animator.spritesheet;

        if (!spriteSheet || !spriteSheet.complete || spriteSheet.naturalWidth === 0) {
            console.error("Burning Effect Animator has no valid sprite sheet:", this.animator);
            // Fallback: draw orange circle
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width * this.scale / 2, 0, Math.PI * 2);
            ctx.fillStyle = 'orange';
            ctx.fill();
            ctx.closePath();
        } else {
            try {
                this.animator.drawFrame(
                    this.game.clockTick,
                    ctx,
                    this.x - (this.width * this.scale) / 2,
                    this.y - (this.height * this.scale) / 2,
                    this.scale
                );
            } catch (e) {
                console.error("Error drawing burning effect animation:", e.message);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.width * this.scale / 2, 0, Math.PI * 2);
                ctx.fillStyle = 'orange';
                ctx.fill();
                ctx.closePath();
            }
        }

        if (this.game.debugMode) {
            ctx.strokeStyle = "orange";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);

            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.closePath();
        }
    }
}