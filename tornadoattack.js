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
        this.projectileWidth = 35;  // Updated to match new frame width (140 / 4)
        this.projectileHeight = 34; // Updated to match new frame height
        this.projectileScale = 1;
        this.projectileDamage = 15;

        this.hitboxWidth = 20;  // Kept the same, adjust if needed
        this.hitboxHeight = 20; // Kept the same, adjust if needed
        this.hitboxScale = 1;

        this.tornadoWidth = 80;    
        this.tornadoHeight = 76;   
        this.tornadoDamage = 5;
        this.tornadoDuration = 5;
        this.throwForce = -800;
        this.elapsedTornadoTime = 0;

        // Animation setup with detailed logging (using new projectile sprite)
        const rightSprite = ASSET_MANAGER.getAsset(`./sprites/tornado/projectile.png`); 
        const tornadoSprite = ASSET_MANAGER.getAsset(`./sprites/tornado/part2final.png`);

        console.log("Right Sprite:", rightSprite, "Loaded:", rightSprite?.complete, "Width:", rightSprite?.naturalWidth, "Height:", rightSprite?.naturalHeight);
        console.log("Tornado Sprite:", tornadoSprite, "Loaded:", tornadoSprite?.complete, "Width:", tornadoSprite?.naturalWidth, "Height:", tornadoSprite?.naturalHeight);

        this.projectileRightAnim = new Animator(rightSprite && rightSprite.complete ? rightSprite : new Image(), 0, 0, this.projectileWidth, this.projectileHeight, 4, 0.07); // Updated xStart to 0, dimensions to 35x34
        this.tornadoAnim = new Animator(tornadoSprite && tornadoSprite.complete ? tornadoSprite : new Image(), -2, 0, 40, 38, 4, 0.07); 

        this.direction = 1;
        this.currentProjectileAnim = this.projectileRightAnim;

        this.lifetime = 20; 
        this.updateBoundingBox();

        this.damageCooldown = 0;
        this.hitEntities = new Set();
        this.angle = 0;
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
        console.log("Transforming to tornado phase");
        this.phase = 'tornado';
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.tornadoAnim.elapsedTime = 0;
        this.updateBoundingBox();
        this.hitEntities.clear();
    }

    getPlayer() {
        return this.game.entities.find(entity =>
            entity instanceof AzielSeraph || 
            entity instanceof Grim || 
            entity instanceof Kanji || 
            entity instanceof KyraBlade
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
                const dx = -this.x; // Move toward left side
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

            const player = this.getPlayer();
            if (player && !this.forceLeftDirection) {
                const dx = (player.box.x + player.box.width / 2) - this.x;
                const dy = (player.box.y + player.box.height / 2) - this.y;
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

            this.lifetime -= TICK;
            if (this.lifetime <= 0) {
                if (this.forceStayInMap) {
                    this.lifetime = 20;
                    console.log("Debug: Resetting lifetime");
                } else {
                    this.removeFromWorld = true;
                    return;
                }
            }

            const players = this.getPlayer();
            if (players && this.box.collide(players.box) && !this.hitEntities.has(players)) {
                console.log("Collision detected with player:", players);
                if (players.takeDamage) {
                    players.takeDamage(this.projectileDamage);
                    console.log(`Player hit by projectile! Remaining HP: ${players.hitpoints}`);
                }
                this.transformToTornado();
                this.hitEntities.add(players);
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
                this.throwTarget(player);
            }
        }
    }

    throwTarget(target) {
        if (!this.hitEntities.has(target)) {
            console.log("Throwing target:", target);
            target.velocity.y = this.throwForce;
            if (target.takeDamage) {
                target.takeDamage(this.tornadoDamage);
            }
            this.hitEntities.add(target);
        }
    }

    draw(ctx) {
        if (this.phase === 'projectile') {
            const anim = this.currentProjectileAnim;
            const spriteSheet = anim.spritesheet;

            if (this.game.debugMode) {
                ctx.font = "12px Arial";
                ctx.fillStyle = "white";
                ctx.fillText(`Direction: ${this.direction === 1 ? 'Right' : 'Left'}`, this.x - 50, this.y - 40);
                ctx.fillText(`Angle: ${this.angle.toFixed(2)}`, this.x - 50, this.y - 25);
                ctx.fillText(`Frame: ${anim.currentFrame()}`, this.x - 50, this.y - 10);
            }

            
            if (!spriteSheet || !spriteSheet.complete || spriteSheet.naturalWidth === 0) {
                console.error("Projectile Animator has no valid sprite sheet:", anim);
                console.log("Current direction:", this.direction);
                console.log("Right sprite:", this.projectileRightAnim.spritesheet);

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
                    console.error("Error drawing projectile animation:", e.message);
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
                console.error("Tornado Animator has no valid sprite sheet:", anim);
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
                    console.error("Error drawing tornado animation:", e.message);
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.tornadoWidth / 2, 0, Math.PI * 2);
                    ctx.fillStyle = 'purple';
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }

        if (this.game.debugMode) {
            ctx.strokeStyle = this.phase === 'projectile' ? "blue" : "purple";
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


