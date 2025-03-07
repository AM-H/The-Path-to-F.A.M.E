class Phoenix {
    constructor(game, x, y, speed) {
        this.game = game;
        
        // Load animations - keeping the Phoenix animations
        this.idleRightAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/phoenixes/IdleRight.png`), 0, 0, 128, 128, 6, 0.1);
        this.idleLeftAnim = new Animator(ASSET_MANAGER.getAsset(`./sprites/phoenixes/IdleLeft.png`), 0, 0, 128, 128, 6, 0.1);
        
        // Position setup 
        this.x = x;
        this.y = y;
        
        // Size and scale
        this.spriteScale = 1.5;
        this.width = 70;
        this.height = 70;
        
        // Bounding box
        this.boxWidth = 32;
        this.boxHeight = 40;
        this.updateBoundingBox();
        
        // Movement properties 
        this.moveSpeed = speed || 100;
        this.followRange = 600;
        this.attackRange = 200;
        this.attackCooldown = 2;
        this.attackTimer = 0; 
        
        // Health
        this.hitpoints = 300;
        this.maxhitpoints = 300;
        this.healthbar = new HealthBar(this);
        
        // State
        this.state = 'idle';
        this.facing = 1; // 1 for right, -1 for left
        this.removeFromWorld = false;
    }
    
    updateBoundingBox() {
        const xOffset = (this.width * this.spriteScale - this.boxWidth) / 2;
        const yOffset = (this.height * this.spriteScale - this.boxHeight) / 2;
        this.box = new BoundingBox(
            this.x + xOffset,
            this.y + yOffset,
            this.boxWidth,
            this.boxHeight
        );
    }
    
    getPlayer() {
        return this.game.entities.find(entity => 
            entity instanceof AzielSeraph || 
            entity instanceof Grim || 
            entity instanceof Kanji ||
            entity instanceof Kyra
        );
    }
    
    takeDamage(amount) {
        this.hitpoints = Math.max(0, this.hitpoints - amount);
        if (this.hitpoints <= 0) {
            this.removeFromWorld = true;
            console.log("Phoenix defeated!");
        }
    }
    
    update() {
        const TICK = this.game.clockTick;
        const player = this.getPlayer();

        if (player) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (this.hitpoints <= 0) {
                console.log("Fire minion dead!");
                this.removeFromWorld = true;
                return;
            }

            // Determine state
            if (distance < this.attackRange) {
                this.state = `attacking`;
            } else if (distance < this.followRange) {
                this.state = `chasing`;
            } else {
                this.state = `idle`;
            }

            // Behavior
            if (this.state === `chasing`) {
                const angle = Math.atan2(dy, dx);
                this.x += Math.cos(angle) * this.moveSpeed * TICK;
                this.y += Math.sin(angle) * this.moveSpeed * TICK;
            } else if (this.state === `attacking`) {
                if (this.attackTimer <= 0) {
                    this.attackTimer = this.attackCooldown;
                    this.shoot(player);
                }
            }

            // Attack cooldown countdown
            if (this.attackTimer > 0) {
                this.attackTimer -= TICK;
            }

        }

        this.healthbar.update();
        this.updateBoundingBox();
    }
    
    shoot(player) {
        // Create a FireBall projectile that targets the player
        const centerX = this.x + (this.width * this.spriteScale) / 2;
        const centerY = this.y + (this.height * this.spriteScale) / 2;
        
        const targetX = player.x + player.box.width / 2;
        const targetY = player.y + player.box.height / 2;
        
        const dx = targetX - centerX;
        const dy = targetY - centerY;
        const angle = Math.atan2(dy, dx);
        
        // Add a FireBall projectile to the game
        const fireBall = new FireBall(this.game, centerX, centerY, angle);
        this.game.addEntity(fireBall);
    }
    
    draw(ctx) {
        // Draw the Phoenix based on facing direction
        if (this.facing === 1) {
            this.idleRightAnim.drawFrame(this.game.clockTick, ctx, this.x , this.y -11 ,  0.85);
        } else {
            this.idleLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y -11, 0.85, false, true);
        }
        
        // Debug bounding box
        if (this.game.debugMode) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        }
        
        // Draw healthbar
        this.healthbar.draw(ctx);
    }
}


