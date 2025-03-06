class Shuriken {
    constructor(game, x, y, angle) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.speed = 400; // Adjust speed as needed
        this.angle = angle; // Direction of the shuriken

        this.sprite = ASSET_MANAGER.getAsset(`./sprites/kyrablade/shuriken.png`);
        this.width = 32; // Set width
        this.height = 32; // Set height

        // Calculate velocity based on angle
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: Math.sin(this.angle) * this.speed
        };

        this.box = new BoundingBox(this.x, this.y, this.width, this.height);
        this.removeFromWorld = false;
    }

    update() {
        const TICK = this.game.clockTick;

        // Move the shuriken
        this.x += this.velocity.x * TICK;
        this.y += this.velocity.y * TICK;

        // Update the bounding box
        this.box = new BoundingBox(this.x, this.y, this.width, this.height);

        // Check for collisions with enemies
        this.game.entities.forEach(entity => {
            if (entity instanceof Eclipser || entity instanceof Drone || entity instanceof Phoenix || entity instanceof stormSpirit) {
                if (this.box.collide(entity.box)) {
                    if (entity instanceof Eclipser) {
                        entity.takeDamage(30);
                    } else if (entity instanceof Drone) {
                        entity.takeDamage(40);
                    } else if (entity instanceof Phoenix) {
                        entity.takeDamage(30);
                    } else if (entity instanceof stormSpirit) {
                        entity.takeDamage(50);
                    }
                    this.removeFromWorld = true; // Destroy shuriken on hit
                }
            }
        });

        // Remove if out of bounds
        if (
            this.x < 0 || this.x > this.game.ctx.canvas.width ||
            this.y < 0 || this.y > this.game.ctx.canvas.height
        ) {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);

        // Debug: Draw bounding box
        if (this.game.debugMode) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        }
    }
}
