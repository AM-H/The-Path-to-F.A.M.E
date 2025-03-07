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
        this.animationMap.set('runRight', new Animator(ASSET_MANAGER.getAsset('./sprites/GrimRunningR.png'), 13, 16, 48, 32, 8, 0.2));
        this.animationMap.set('runLeft', new Animator(ASSET_MANAGER.getAsset('./sprites/GrimRunningL.png'), 3.01, 16, 48, 32, 8, 0.2));
        this.animationMap.set('idleRight', new Animator(ASSET_MANAGER.getAsset('./sprites/GrimIdleR.png'), 0, 16, 42, 32, 5, 0.2));
        this.animationMap.set('idleLeft', new Animator(ASSET_MANAGER.getAsset('./sprites/GrimIdleL.png'), 5, 16, 48, 32, 5, 0.2));
        
        // Set default animation
        this.animator = this.animationMap.get('idleRight');
        
        this.box = new BoundingBox(this.x, this.y, 32, 64);
        this.updateBoundingBox();
        this.landed = false;
        this.attacking = false;
        this.canShoot = true;
    }

    takeDamage(amount) {
        // Skip damage if invincible
        if (!this.game.invincibleMode) {
            this.hitpoints -= amount;
            if (this.hitpoints < 0) this.hitpoints = 0;
            console.log(`Grim takes ${amount} damage! Remaining HP: ${this.hitpoints}`);
        } else {
            console.log(`Damage blocked by invincibility!`);
        }
    }

    updateBoundingBox() {
        this.box = new BoundingBox(this.x, this.y, 32, 64);
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
            this.x -= 130 * TICK; //change this back to 130
            if (this.facing !== "left") {
                this.facing = "left";
                this.animator = this.animationMap.get('runLeft');
            }
        }
        
        // Right movement
        if (this.game.right) {
            this.x += 130 * TICK; //change this back to 130
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
        if (this.x > gameWorld.width-this.box.width) {
            this.x = gameWorld.width-this.box.width;
        }

        // Gravity and vertical movement
        this.velocity.y += this.fallGrav * TICK;
        this.y += this.velocity.y * TICK;
        
        this.updateLastBB();
        this.updateBoundingBox();

        // Collision detection
        this.game.entities.forEach(entity => {
            if (entity.box && this.box.collide(entity.box)) {
                if (this.velocity.y > 0) {
                    if ((entity instanceof Platform) && (this.lastBox.bottom) <= entity.box.top) {
                        this.velocity.y = 0;
                        this.y = entity.box.top-64;
                        this.landed = true;
                        //console.log(`bottom collision`);
                    }
                } else if (this.velocity.y > 0) {
                    this.landed = false;
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
            this.animator.drawFrame(this.game.clockTick, ctx, this.x - 12, this.y+14, 1.55, false, true); //change grim to be smaller or same size as level 2 boss
        }else{
            this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y+14,  1.55); //change grim to be smaller or same size as level 2 boss
        }
        
        // Draw bounding box
        if (this.game.debugMode) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        }

        // Draw healthbar
        this.healthbar.draw(ctx);
    }
}