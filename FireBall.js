class FireBall {
    constructor(game, x, y, angle) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.speed = 200; // Projectile speed
        this.angle = angle; // Direction of the fireball
        
        // Calculate velocity based on angle
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: Math.sin(this.angle) * this.speed
        };
        
        // Animation setup - use the 1_0 through 1_60 sprites
        this.frameCount = 61; // Total frames (1_0 through 1_60)
        this.spritesheet = [];
        
        // Load all 61 sprite frames (1_0 through 1_60)
        try {
            for (let i = 0; i <= 60; i++) {
                const path = `./sprites/minionFire/1_${i}.png`;
                const img = ASSET_MANAGER.getAsset(path);
                
                if (img) {
                    this.spritesheet.push(img);
                } else {
                    console.warn(`FireBall: Image not found for path ${path}`);
                    // Use a fallback if specific image isn't found
                    const fallbackImg = new Image();
                    fallbackImg.src = path; // Try to load it anyway
                    this.spritesheet.push(fallbackImg);
                }
            }
        } catch (e) {
            console.error("Error loading FireBall sprites:", e.message);
            // Create at least one fallback image
            this.spritesheet = [null];
            this.frameCount = 1;
        }
        
        // Animation variables
        this.frame = 0;
        this.animationSpeed = 0.05; // Adjust for desired speed
        this.elapsedTime = 0;
        
        // Visual size (for drawing only)
        this.visualWidth = 25;  // Larger visual size
        this.visualHeight = 25; // Larger visual size
        this.visualScale = 3;   // Larger visual scale
        
        // Hitbox size (for collision detection)
        this.width = 15;       // Original collision size
        this.height = 15;      // Original collision size
        this.scale = 2;        // Original collision scale
        
        this.damage = 2;
        
        // Lifetime to prevent infinite projectiles
        this.lifetime = 3; // Seconds
        
        // Initialize bounding box
        this.updateBoundingBox();
        this.removeFromWorld = false;
    }
    
    updateBoundingBox() {
        // Use the smaller hitbox dimensions for the bounding box
        this.box = new BoundingBox(
            this.x - (this.width * this.scale) / 2, 
            this.y - (this.height * this.scale) / 2,
            this.width * this.scale,
            this.height * this.scale
        );
    }
    
    update() {
        const TICK = this.game.clockTick;
        
        // Update position based on velocity
        this.x += this.velocity.x * TICK;
        this.y += this.velocity.y * TICK;
        
        // Update animation frame
        this.elapsedTime += TICK;
        if (this.elapsedTime >= this.animationSpeed) {
            this.elapsedTime = 0;
            this.frame = (this.frame + 1) % this.frameCount;
        }
        
        // Update bounding box
        this.updateBoundingBox();
        
        // Decrease lifetime
        this.lifetime -= TICK;
        if (this.lifetime <= 0) {
            this.removeFromWorld = true;
            return;
        }
        
        // Check for collision with player
        let player = this.game.entities.find(e => 
            e instanceof AzielSeraph || 
            e instanceof Grim || 
            e instanceof Kanji || 
            e instanceof HolyDiver
        );
        
        if (player && this.box.collide(player.box)) {
            player.takeDamage(this.damage);
            console.log(`Player hit by fireball! Remaining HP: ${player.hitpoints}`);
            this.removeFromWorld = true;
            return;
        }
        
        // Remove if out of bounds
        if (
            this.x < -100 ||
            this.x > this.game.ctx.canvas.width + 100 ||
            this.y < -100 ||
            this.y > this.game.ctx.canvas.height + 100
        ) {
            this.removeFromWorld = true;
        }
    }
    
    draw(ctx) {
        // Get current frame image
        const currentFrame = this.spritesheet[this.frame];
        
        if (currentFrame) {
            try {
               
            
                // Save context state before transformations
                ctx.save();
                
                // Translate to center of fireball
                ctx.translate(this.x, this.y);
                
                // Rotate to match angle of travel
                ctx.rotate(this.angle);
                
                // Draw the sprite centered at origin (0,0) using the VISUAL dimensions
                ctx.drawImage(
                    currentFrame,
                    -this.visualWidth * this.visualScale / 2,
                    -this.visualHeight * this.visualScale / 2,
                    this.visualWidth * this.visualScale,
                    this.visualHeight * this.visualScale
                );
                
               
                ctx.restore();
            } catch (e) {
                
                ctx.restore();
                
                // Then draw the fallback without any transformations
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.visualWidth * this.visualScale / 2, 0, Math.PI * 2);
                ctx.fillStyle = 'orange';
                ctx.fill();
                ctx.closePath();
                
                console.error("Error drawing fireball image:", e.message);
            }
            
            // Draw debug bounding box - using the ORIGINAL hitbox size
            if (this.game.debugMode) {
                ctx.strokeStyle = "orange";
                ctx.lineWidth = 2;
                ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
            }
        } else {
            // Fallback if image is undefined - using the VISUAL size
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.visualWidth * this.visualScale / 2, 0, Math.PI * 2);
            ctx.fillStyle = 'orange';
            ctx.fill();
            ctx.closePath();
        }
    }
}