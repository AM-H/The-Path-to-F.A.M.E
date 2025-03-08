class SkullProjectile {
    constructor(game, x, y, direction, playerVelocity = { x: 0, y: 0 }) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = 450; 
        
        this.velocityX = this.direction.x * this.speed;
        this.velocityY = this.direction.y * this.speed;
        
        // Determine sprite based on horizontal direction
        if (this.direction.x >= 0) {
            // Right half - use right-facing sprite
            this.animator = new Animator(ASSET_MANAGER.getAsset(`./sprites/LongRangeGrimR.png`), 9, 8, 32, 32, 4, 0.1);
        } else {
            // Left half - use left-facing sprite
            this.animator = new Animator(ASSET_MANAGER.getAsset(`./sprites/LongRangeGrimL.png`), 9, 8, 32, 32, 4, 0.1);
        }

        // Damage properties
        this.damage = 35; // Damage per hit
        this.hasHit = false; // Track if projectile has hit something

        // Duration and distance
        this.lifespan = 1.5; // Seconds before disappearing
        this.timeAlive = 0;

        this.width = 32;
        this.height = 32;
        this.box = new BoundingBox(this.x, this.y, this.width, this.height);
    }

    update() {
        this.lastBox = this.box;

        // Update position using delta time
        this.x += this.velocityX * this.game.clockTick;
        this.y += this.velocityY * this.game.clockTick;

        this.box = new BoundingBox(this.x, this.y, this.width, this.height);

        // Collision checks remain the same
         // Check for collisions with enemies
         this.game.entities.forEach(entity => {
            // Only check for collision if we haven't hit anything yet
            if (!this.hasHit && entity.box && this.box.collide(entity.box)) {
                // Check if entity is an enemy
                if ((entity instanceof Drone || 
                     entity instanceof Eclipser || 
                     entity instanceof inferno || 
                     entity instanceof Shizoku ||
                     entity instanceof stormSpirit ||
                     entity instanceof Phoenix ||
                     entity instanceof LeviathDraconis)) {
                    
                    // Deal damage if entity has a takeDamage method
                    if (entity.takeDamage) {
                        entity.takeDamage(this.damage);
                        console.log(`Skull projectile hit for ${this.damage} damage!`);
                        
                        // Mark projectile for removal
                        this.hasHit = true;
                        this.removeFromWorld = true;
                    }
                }
                
                // Check collision with platforms to make projectile disappear
                if (entity instanceof Platform) {
                    this.removeFromWorld = true;
                }
            }
        });

        if (this.x < 0 || this.x > gameWorld.width || this.y < 0 || this.y > gameWorld.height) {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        
        // Draw debug bounding box
        if (this.game.debugMode) {
            ctx.strokeStyle = `red`;
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        }
    }
}