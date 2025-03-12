class ScorchingEye {
    constructor(game, x, y, isCastByPlayer = false, lifetimeLimit = 5.0) {
        this.game = game;
        this.x = x;
        this.y = y;

        this.phase = 'projectile';
        this.removeFromWorld = false;

        this.projectileSpeed = 200;
        this.velocity = { x: 0, y: 0 };
        this.projectileWidth = 32;
        this.projectileHeight = 32;
        this.projectileScale = 3;
        this.projectileDamage = 15;

        this.hitboxWidth = 20;
        this.hitboxHeight = 20;
        this.hitboxScale = 1;

        // Animation setup
        const rightSprite = ASSET_MANAGER.getAsset(`./sprites/eye/Eye.png`);
        console.log(`Right Sprite:`, rightSprite, `Loaded:`, rightSprite?.complete, `Width:`, rightSprite?.naturalWidth, `Height:`, rightSprite?.naturalHeight);

        this.projectileRightAnim = new Animator(rightSprite && rightSprite.complete ? rightSprite : new Image(), 0, 0, this.projectileWidth, this.projectileHeight, 4, 0.07);

        this.direction = 1;
        this.currentProjectileAnim = this.projectileRightAnim; // Fixed typo from projectileWrongAnim

        this.lifetime = lifetimeLimit; // Set custom lifetime
        this.updateBoundingBox();

        this.damageCooldown = 0;
        this.hitEntities = new Set();
        this.angle = 0;
    }

    updateBoundingBox() {
        this.box = new BoundingBox(
            this.x - (this.hitboxWidth * this.hitboxScale) / 2,
            this.y - (this.hitboxHeight * this.hitboxScale) / 2,
            this.hitboxWidth * this.hitboxScale,
            this.hitboxHeight * this.hitboxScale
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

    update() {
        const TICK = this.game.clockTick;

        if (this.damageCooldown > 0) {
            this.damageCooldown -= TICK;
        }

        if (this.phase === 'projectile') {
            if (this.forceLeftDirection) {
                this.direction = -1;
                this.velocity.x = -50;
                this.velocity.y = 0;
                const dx = -this.x;
                const dy = 0;
                this.angle = Math.atan2(dy, dx);
            } else {
                const player = this.getPlayer();
                if (player) {
                    const dx = (player.box.x + player.box.width / 2) - this.x;
                    const dy = (player.box.y + player.box.height / 2) - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance > 0) {
                        this.velocity.x = (dx / distance) * this.projectileSpeed;
                        this.velocity.y = (dy / distance) * this.projectileSpeed;
                        this.angle = Math.atan2(dy, dx);
                        this.direction = this.velocity.x >= 0 ? 1 : -1;
                    }
                }
            }

            const players = this.getPlayer();
            if (players && !this.forceLeftDirection) {
                const dx = (players.box.x + players.box.width / 2) - this.x;
                const dy = (players.box.y + players.box.height / 2) - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    this.angle = Math.atan2(dy, dx);
                }
            } else if (this.forceLeftDirection) {
                const dx = -this.x;
                const dy = 0;
                this.angle = Math.atan2(dy, dx);
            }

            this.x += this.velocity.x * TICK;
            this.y += this.velocity.y * TICK;
            this.updateBoundingBox();

            if (this.forceStayInMap) {
                if (this.x < 50) {
                    this.x = 50;
                    this.velocity.x = Math.abs(this.velocity.x);
                    this.direction = 1;
                    this.angle = 0;
                }
                if (this.x > this.game.ctx.canvas.width - 50) {
                    this.x = this.game.ctx.canvas.width - 50;
                    this.velocity.x = -Math.abs(this.velocity.x);
                    this.direction = -1;
                    this.angle = Math.PI;
                }
                if (this.y < 50) {
                    this.y = 50;
                    this.velocity.y = Math.abs(this.velocity.y);
                }
                if (this.y > this.game.ctx.canvas.height - 50) {
                    this.y = this.game.ctx.canvas.height - 50;
                    this.velocity.y = -Math.abs(this.velocity.y);
                }
            }

            // Decrease lifetime and check if it expires
            this.lifetime -= TICK;
            if (this.lifetime <= 0) {
                this.removeFromWorld = true;
                console.log(`ScorchingEye lifetime expired, removing from world`);
                return;
            }

            // Check collision with player
            const player = this.getPlayer();
            if (player && this.box.collide(player.box) && !this.hitEntities.has(player)) {
                console.log(`Collision detected with player:`, player);
                if (player.takeDamage) {
                    player.takeDamage(this.projectileDamage); // Initial 15 damage
                    const burningEffect = new BurningEffect(this.game, player);
                    this.game.addEntity(burningEffect);
                    console.log(`Player hit by ScorchingEye! Burning effect spawned, Remaining HP: ${player.hitpoints}`);
                }
                this.removeFromWorld = true;
                this.hitEntities.add(player);
                return;
            }

            // Remove if out of bounds (if not forced to stay in map)
            if (!this.forceStayInMap && (
                this.x < -100 ||
                this.x > this.game.ctx.canvas.width + 100 ||
                this.y < -100 ||
                this.y > this.game.ctx.canvas.height + 100)
            ) {
                this.removeFromWorld = true;
                console.log(`ScorchingEye out of bounds, removing from world`);
                return;
            }
        }
    }

    draw(ctx) {
        if (this.phase === 'projectile') {
            const anim = this.currentProjectileAnim;
            const spriteSheet = anim.spritesheet;

            if (this.game.debugMode) {
                ctx.font = `12px Arial`;
                ctx.fillStyle = `white`;
                ctx.fillText(`Direction: ${this.direction === 1 ? 'Right' : 'Left'}`, this.x - 50, this.y - 40);
                ctx.fillText(`Angle: ${this.angle.toFixed(2)}`, this.x - 50, this.y - 25);
                ctx.fillText(`Frame: ${anim.currentFrame()}`, this.x - 50, this.y - 10);
            }

            if (!spriteSheet || !spriteSheet.complete || spriteSheet.naturalWidth === 0) {
                console.error(`Projectile Animator has no valid sprite sheet:`, anim);
                console.log(`Current direction:`, this.direction);
                console.log(`Right sprite:`, this.projectileRightAnim.spritesheet);

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.projectileWidth * this.projectileScale / 2, 0, Math.PI * 2);
                ctx.fillStyle = this.direction === 1 ? 'orange' : 'yellow';
                ctx.fill();
                ctx.closePath();

                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + Math.cos(this.angle) * 30, this.y + Math.sin(this.angle) * 30);
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();
            } else {
                try {
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.rotate(this.angle);
                    anim.drawFrame(
                        this.game.clockTick,
                        ctx,
                        -this.projectileWidth * this.projectileScale / 2,
                        -this.projectileHeight * this.projectileScale / 2,
                        this.projectileScale,
                        false,
                        false
                    );
                    ctx.restore();
                } catch (e) {
                    console.error(`Error drawing projectile animation:`, e.message);
                    ctx.restore();
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.projectileWidth * this.projectileScale / 2, 0, Math.PI * 2);
                    ctx.fillStyle = 'orange';
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }

        if (this.game.debugMode) {
            ctx.strokeStyle = `blue`;
            ctx.lineWidth = 2;
            ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);

            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = `red`;
            ctx.fill();
            ctx.closePath();
        }
    }
}