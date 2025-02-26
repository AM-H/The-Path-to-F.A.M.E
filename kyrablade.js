class Kyra {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 500;
        this.velocity = { x: 0, y: 0 };
        this.facing = "right";

        this.attackDirection = null;
        this.removeFromWorld = false;
        this.canAttack = false;
        
        setTimeout(() => { this.canAttack = true; }, 100);

        // Animation Map
        this.animationMap = new Map();
        this.animationMap.set(`runRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/RunRightKyra.png`), 0, 0, 96, 48, 5, 0.2));
        this.animationMap.set(`runLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/RunLeftKyra.png`), 0, 0, 96, 48, 5, 0.2));
        this.animationMap.set(`idleRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/IdleRightKyra.png`), 0, 0, 96, 40, 4, 0.35));
        this.animationMap.set(`idleLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/IdleLeftKyra.png`), 0, 0, 96, 40, 4, 0.35));
        this.animationMap.set(`attackRight`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/AttackRightKyra.png`), 0, 0, 96, 40, 5, 0.07));
        this.animationMap.set(`attackLeft`, new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/AttackLeftKyra.png`), 0, 0, 96, 40, 5, 0.07));

        // Set default animation
        this.animator = this.animationMap.get(`idleRight`);

        this.attacking = false;
        this.box = new BoundingBox(this.x, this.y, 64, 64);
        this.attackBox = null;
        this.updateBoundingBox();
        this.hitpoints = 100;
        this.maxhitpoints = 100;
        this.healthbar = new HealthBar(this);
        this.attackTimer = 0;
        this.attackDuration = 0;
    }

    updateBoundingBox() {
        this.box = new BoundingBox(this.x, this.y, 64, 64);

        if (this.attacking) {
            if (this.attackDirection === "right") {
                this.attackBox = new BoundingBox(this.x + 50, this.y + 10, 40, 50);
            } else {
                this.attackBox = new BoundingBox(this.x - 40, this.y + 10, 40, 50);
            }
        } else {
            this.attackBox = null;
        }
    }

    update() {
        const TICK = this.game.clockTick;

        if (this.hitpoints <= 0) {
            this.hitpoints = 0;
            this.game.isGameOver = true;
            this.game.addEntity(new GameOver(this.game));
            return;
        }

        // Update facing direction
        if (this.game.left) this.facing = "left";
        else if (this.game.right) this.facing = "right";

        // Attack Logic
        if (this.game.closeAttack && !this.attacking && this.canAttack) {
            this.attacking = true;
            this.canAttack = false;
            this.attackDirection = this.facing;
            this.attackTimer = 0;

            const attackAnim = this.animationMap.get(this.facing === "right" ? `attackRight` : `attackLeft`);
            this.attackDuration = attackAnim.frameCount * attackAnim.frameDuration;
        }

        if (this.attacking) {
            this.attackTimer += TICK;
            if (this.attackTimer >= this.attackDuration) {
                this.attacking = false;
                this.canAttack = true;
                this.attackDirection = null;
                this.attackTimer = 0;
            }
        }

        // Update animations
        if (this.attacking) {
            this.animator = this.animationMap.get(this.facing === "right" ? `attackRight` : `attackLeft`);
        } else if (this.game.left || this.game.right) {
            this.animator = this.animationMap.get(this.facing === "left" ? `runLeft` : `runRight`);
        } else {
            this.animator = this.animationMap.get(this.facing === "left" ? `idleLeft` : `idleRight`);
        }

        // Movement
        if (this.game.left) this.x -= 130 * TICK;
        if (this.game.right) this.x += 130 * TICK;

        if (this.x < 0) this.x = 0;
        if (this.x > gameWorld.width - 64) {
            this.x = gameWorld.width - 64;
        }

        this.updateBoundingBox();

        // Collision detection
        this.game.entities.forEach(entity => {
            if ((entity instanceof Eclipser || entity instanceof Drone) && this.attackBox && this.attackBox.collide(entity.box) && this.game.closeAttack) {
                if (entity instanceof Eclipser) {
                    entity.takeDamage(40);
                } else if (entity instanceof Drone) {
                    entity.takeDamage(20);
                }
            }
        });

        this.healthbar.update();
    }

    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);

        // Debugging: Draw bounding boxes
        if (this.game.debugMode) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
            if (this.attackBox) {
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 2;
                ctx.strokeRect(this.attackBox.x, this.attackBox.y, this.attackBox.width, this.attackBox.height);
            }
        }

        // Draw health bar
        this.healthbar.draw(ctx);
    }
}
