class TornadoAttack {
    constructor(game, x, y, isCastByPlayer = false) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.isCastByPlayer = isCastByPlayer;

        this.phase = 'projectile';
        this.removeFromWorld = false;

        this.projectileSpeed = 200;
        this.velocity = { x: 0, y: 0 };
        this.projectileWidth = 35;
        this.projectileHeight = 34;
        this.projectileScale = 1;
        this.projectileDamage = 15;

        this.hitboxWidth = 20;
        this.hitboxHeight = 20;
        this.hitboxScale = 1;

        this.tornadoWidth = 80;
        this.tornadoHeight = 76;
        this.tornadoDamage = 5;
        this.tornadoDuration = 0.89; // Matches tornado impact audio (0.89 seconds)
        this.throwForce = -800;
        this.elapsedTornadoTime = 0;

        // Audio setup
        this.fireballWindupSound = ASSET_MANAGER.getAsset(`./audio/fireball_windup.mp3`);
        this.tornadoImpactSound = ASSET_MANAGER.getAsset(`./audio/tornado_impact.mp3`);
        this.fireballWindupPlayed = false;

        // Animation setup
        const rightSprite = ASSET_MANAGER.getAsset(`./sprites/tornado/projectile.png`);
        const tornadoSprite = ASSET_MANAGER.getAsset(`./sprites/tornado/part2final.png`);

       // console.log(`Right Sprite:`, rightSprite, `Loaded:`, rightSprite?.complete);
        //console.log(`Tornado Sprite:`, tornadoSprite, `Loaded:`, tornadoSprite?.complete);

        this.projectileRightAnim = new Animator(rightSprite && rightSprite.complete ? rightSprite : new Image(), 0, 0, this.projectileWidth, this.projectileHeight, 4, 0.07);
        this.tornadoAnim = new Animator(tornadoSprite && tornadoSprite.complete ? tornadoSprite : new Image(), -2, 0, 40, 38, 4, 0.07);

        this.direction = 1;
        this.currentProjectileAnim = this.projectileRightAnim;

        this.lifetime = 5.03; // Matches fireball wind-up audio (5.03 seconds)
        this.updateBoundingBox();

        this.damageCooldown = 0;
        this.hitEntities = new Set(); // Still used for projectile phase
        this.angle = 0;

        // Start the wind-up sound immediately
        this.updateFireballSound();
    }

    updateBoundingBox() {
        if (this.phase === 'projectile') {
            this.box = new BoundingBox(
                this.x - (this.hitboxWidth * this.hitboxScale) / 2,
                this.y - (this.hitboxHeight * this.hitboxScale) / 2,
                this.hitboxWidth * this.hitboxScale,
                this.hitboxHeight * this.hitboxScale
            );
        } else if (this.phase === 'tornado') {
            this.box = new BoundingBox(
                this.x - this.tornadoWidth / 2,
                this.y - this.tornadoHeight / 2,
                this.tornadoWidth,
                this.tornadoHeight
            );
        }
    }

    transformToTornado() {
        console.log(`Transforming to tornado phase`);
        this.phase = 'tornado';
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.tornadoAnim.elapsedTime = 0;
        this.updateBoundingBox();

        // Stop wind-up sound and play impact sound
        this.fireballWindupSound.pause();
        this.fireballWindupSound.currentTime = 0;
        this.fireballWindupPlayed = false;
        this.tornadoImpactSound.currentTime = 0;
        this.tornadoImpactSound.play().catch(error => {
            console.error("Error playing tornado impact sound:", error);
        });

        const player = this.getPlayer();
        if (player && this.box.collide(player.box)) {
           // console.log(`Player caught in tornado transformation:`, player);
            this.throwTarget(player);
        }

        this.hitEntities.clear(); // Clear hitEntities so tornado can affect player multiple times
    }

    getPlayer() {
        return this.game.entities.find(entity =>
            entity instanceof AzielSeraph ||
            entity instanceof Grim ||
            entity instanceof Kanji ||
            entity instanceof Kyra
        );
    }

    updateFireballSound() {
        const windup = this.fireballWindupSound;
        windup.volume = document.getElementById(`myVolume`).value / 100 > 0.5
            ? document.getElementById(`myVolume`).value / 100
            : (document.getElementById(`myVolume`).value / 100) * 2;

        if (this.phase === 'projectile' && !this.fireballWindupPlayed) {
            windup.currentTime = 0;
            windup.play().catch(error => {
                console.error("Error playing fireball wind-up sound:", error);
            });
            this.fireballWindupPlayed = true;
        }
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

            this.lifetime -= TICK;
            if (this.lifetime <= 0) {
                if (this.forceStayInMap) {
                    this.lifetime = 20;
                    console.log(`Debug: Resetting lifetime`);
                } else {
                    this.removeFromWorld = true;
                    return;
                }
            }

            const player = this.getPlayer();
            if (player && this.box.collide(player.box) && !this.hitEntities.has(player)) {
               // console.log(`Collision detected with player:`, player);
                if (player.takeDamage) {
                    player.takeDamage(this.projectileDamage);
                    console.log(`Player hit by projectile! Remaining HP: ${player.hitpoints}`);
                }
                this.transformToTornado();
                this.hitEntities.add(player);
            }

            if (!this.forceStayInMap && (
                this.x < -100 ||
                this.x > this.game.ctx.canvas.width + 100 ||
                this.y < -100 ||
                this.y > this.game.ctx.canvas.height + 100)
            ) {
                this.removeFromWorld = true;
                return;
            }
        } else if (this.phase === 'tornado') {
            this.elapsedTornadoTime += TICK;
            if (this.elapsedTornadoTime >= this.tornadoDuration) {
                this.removeFromWorld = true;
                return;
            }

            this.updateBoundingBox();

            const player = this.getPlayer();
            if (player && this.box.collide(player.box)) {
                this.throwTarget(player); // Check collision every frame for knockback
            }
        }
    }

    throwTarget(target) {
        // Remove hitEntities check to allow repeated knockbacks
       // console.log(`Throwing target:`, target);
        target.velocity.y = this.throwForce; // Knock player back up
        if (target.takeDamage && this.damageCooldown <= 0) { // Only apply damage if cooldown is up
            target.takeDamage(this.tornadoDamage);
            console.log(`Player hit by tornado! Remaining HP: ${target.hitpoints}`);
            this.damageCooldown = 0.5; 
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
        } else if (this.phase === 'tornado') {
            const anim = this.tornadoAnim;
            const spriteSheet = anim.spritesheet;
            if (!spriteSheet || !spriteSheet.complete || spriteSheet.naturalWidth === 0) {
                console.error(`Tornado Animator has no valid sprite sheet:`, anim);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.tornadoWidth / 2, 0, Math.PI * 2);
                ctx.fillStyle = 'purple';
                ctx.fill();
                ctx.closePath();
            } else {
                try {
                    anim.drawFrame(
                        this.game.clockTick,
                        ctx,
                        this.x - this.tornadoWidth / 2,
                        this.y - this.tornadoHeight / 2,
                        2
                    );
                } catch (e) {
                    console.error(`Error drawing tornado animation:`, e.message);
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.tornadoWidth / 2, 0, Math.PI * 2);
                    ctx.fillStyle = 'purple';
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }

        if (this.game.debugMode) {
            ctx.strokeStyle = this.phase === 'projectile' ? `blue` : `purple`;
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