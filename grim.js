class Grim {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 500;
        this.velocity = { x: 0, y: 0 };
        this.fallGrav = 2000;
        this.facing = "right";

        // Health system
        this.hitpoints = 100;
        this.maxhitpoints = 100;
        this.healthbar = new HealthBar(this);
        this.damageCooldown = 0;

        this.canAttack = false;
        setTimeout(() => {
            this.canAttack = true;
        }, 100);
        
        // Create animation map for Grim's animations
        this.animationMap = new Map();
        this.animationMap.set('runRight', new Animator(ASSET_MANAGER.getAsset('./sprites/GrimRunningR.png'), 13, 16, 48, 32, 6, 0.2));
        this.animationMap.set('runLeft', new Animator(ASSET_MANAGER.getAsset('./sprites/GrimRunningL.png'), 3.01, 16, 48, 32, 6, 0.2));
        this.animationMap.set('idleRight', new Animator(ASSET_MANAGER.getAsset('./sprites/GrimIdleR.png'), 0, 16, 42, 32, 5, 0.2));
        this.animationMap.set('idleLeft', new Animator(ASSET_MANAGER.getAsset('./sprites/GrimIdleL.png'), 5, 16, 48, 32, 5, 0.2));
        
        // Set default animation
        this.animator = this.animationMap.get('idleRight');
        
        this.box = new BoundingBox(this.x, this.y, 64, 64);
        this.updateBoundingBox();
        this.landed = false;
        this.attacking = false;
        this.canShoot = true;
    }

    takeDamage(amount) {
        this.hitpoints -= amount;
        if(this.hitpoints < 0) this.hitpoints = 0;
        console.log(`Grim takes ${amount} damage! Remaining HP: ${this.hitpoints}`);
    }

    updateBoundingBox() {
        this.box = new BoundingBox(this.x, this.y, 64, 64);
    }

    updateLastBB() {
        this.lastBox = this.box;
    }

    update() {
        const TICK = this.game.clockTick;
        
        // Check if Grim is dead
        if (this.hitpoints <= 0) {
            this.hitpoints = 0;
            this.game.isGameOver = true;
            this.game.addEntity(new GameOver(this.game));
            return;
        }

        // Update damage cooldown
        this.damageCooldown -= TICK;
        
        // Left movement
        if (this.game.left) {
            this.x -= 250 * TICK;
            if (this.facing !== "left") {
                this.facing = "left";
                this.animator = this.animationMap.get('runLeft');
            }
        }
        
        // Right movement
        if (this.game.right) {
            this.x += 250 * TICK;
            if (this.facing !== "right") {
                this.facing = "right";
                this.animator = this.animationMap.get('runRight');
            }
        }
        
        // Idle state
        if (!this.game.left && !this.game.right && !this.attacking) {
            if (this.facing === "left") {
                this.animator = this.animationMap.get('idleLeft');
            } else if (this.facing === "right") {
                this.animator = this.animationMap.get('idleRight');
            }
        }

        // Long range attack
        if (this.game.rangeAttack && this.canShoot) {
            const centerX = this.x + (this.box.width / 2);
            const centerY = this.y + (this.box.height / 2);
            const projectileCenterX = centerX - 16;
            const projectileCenterY = centerY - 16;

            const deltaX = this.game.mouseX - centerX;
            const deltaY = this.game.mouseY - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            const direction = {
                x: deltaX / distance,
                y: deltaY / distance
            };

            const projectile = new SkullProjectile(
                this.game, 
                projectileCenterX, 
                projectileCenterY, 
                direction,
                { x: this.velocity.x, y: this.velocity.y }
            );
            this.game.addEntity(projectile);
            
            this.canShoot = false;
        }

        // Reset shooting capability
        if (!this.game.rangeAttack) {
            this.canShoot = true;
        }

        // Jump logic with gravity
        if (this.game.jump && this.landed) {
            this.velocity.y = -800;
            this.fallGrav = 1900;
            this.landed = false;
        }

        // World boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > gameWorld.width - 48) {
            this.x = gameWorld.width - 48;
        }

        // Gravity and vertical movement
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;
        
        this.updateLastBB();
        this.updateBoundingBox();

        // Collision detection
        this.game.entities.forEach(entity => {
            if (entity.box && this.box.collide(entity.box)) {
                // Platform collisions
                if (entity instanceof Platform) {
                    if (this.velocity.y > 0 && this.lastBox.bottom <= entity.box.top) {
                        this.velocity.y = 0;
                        this.y = entity.box.top - 64;
                        this.landed = true;
                    } else if (this.velocity.y < 0 && this.lastBox.top >= entity.box.bottom) {
                        this.velocity.y = 300;
                        this.y = entity.box.bottom;
                    }

                    // Horizontal collision
                    if (this.game.right || this.game.left) {
                        if (this.lastBox.right <= entity.box.left) {
                            this.x = entity.box.left - this.box.width;
                        } else if (this.lastBox.left >= entity.box.right) {
                            this.x = entity.box.right;
                        }
                    }
                }

            }
            this.updateBoundingBox();
        });

        if (this.character === `grim` && this.game.rangeAttack) {
            const direction = {
                x: (this.game.mouseX - this.player.x) / Math.sqrt((this.game.mouseX - this.player.x) ** 2 + (this.game.mouseY - this.player.y) ** 2),
                y: (this.game.mouseY - this.player.y) / Math.sqrt((this.game.mouseX - this.player.x) ** 2 + (this.game.mouseY - this.player.y) ** 2)
            };

            const projectile = new SkullProjectile(this.game, this.player.x + this.player.box.width / 2, this.player.y + this.player.box.height / 2, direction);
            this.game.addEntity(projectile);  // Add the projectile to the game entities
        }

        // Update healthbar
        this.healthbar.update();
    }

    draw(ctx) {
        if(this.facing === "left"){
            this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2, true);
        }else{
            this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
        }
        
        // Draw bounding box
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        
        // Draw healthbar
        this.healthbar.draw(ctx);
    }
}