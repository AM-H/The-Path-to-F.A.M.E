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
        this.projectileWidth = 40;  
        this.projectileHeight = 40; 
        this.projectileScale = 1;
        this.projectileDamage = 15;

        this.hitboxWidth = 20;
        this.hitboxHeight = 20;
        this.hitboxScale = 1;

        this.tornadoWidth = 80;    
        this.tornadoHeight = 76;   
        this.tornadoDamage = 5;
        this.tornadoDuration = 5;
        this.throwForce = -800;
        this.elapsedTornadoTime = 0;

        // Animation setup with detailed logging
        const rightSprite = ASSET_MANAGER.getAsset(`./sprites/tornado/part1finalR.png`);
        const leftSprite = ASSET_MANAGER.getAsset(`./sprites/tornado/part1finalL.png`);
        const tornadoSprite = ASSET_MANAGER.getAsset(`./sprites/tornado/part2final.png`);

        console.log("Right Sprite:", rightSprite, "Loaded:", rightSprite?.complete, "Width:", rightSprite?.naturalWidth, "Height:", rightSprite?.naturalHeight);
        console.log("Left Sprite:", leftSprite, "Loaded:", leftSprite?.complete, "Width:", leftSprite?.naturalWidth, "Height:", leftSprite?.naturalHeight);
        console.log("Tornado Sprite:", tornadoSprite, "Loaded:", tornadoSprite?.complete, "Width:", tornadoSprite?.naturalWidth, "Height:", tornadoSprite?.naturalHeight);

        this.projectileRightAnim = new Animator(rightSprite && rightSprite.complete ? rightSprite : new Image(), -6, 0, this.projectileWidth, this.projectileHeight, 4, 0.07);
        this.projectileLeftAnim = new Animator(leftSprite && leftSprite.complete ? leftSprite : new Image(), -6, 0, this.projectileWidth, this.projectileHeight, 4, 0.07);
        this.tornadoAnim = new Animator(tornadoSprite && tornadoSprite.complete ? tornadoSprite : new Image(), -2, 0, 40, 38, 4, 0.07); 

        this.direction = 1;
        this.currentProjectileAnim = this.projectileRightAnim;

        this.lifetime = 6;
        this.updateBoundingBox();

        this.damageCooldown = 0;
        this.hitEntities = new Set();
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
        this.tornadoAnim.elapsedTime = 0; // Reset elapsedTime to ensure frame 0 is drawn first
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
                    this.currentProjectileAnim = this.direction === 1 ? this.projectileRightAnim : this.projectileLeftAnim;
                }
            }

            this.x += this.velocity.x * TICK;
            this.y += this.velocity.y * TICK;
            this.updateBoundingBox();

            this.lifetime -= TICK;
            if (this.lifetime <= 0) {
                this.removeFromWorld = true;
                return;
            }

            if (player && this.box.collide(player.box) && !this.hitEntities.has(player)) {
                console.log("Collision detected with player:", player);
                if (player.takeDamage) {
                    player.takeDamage(this.projectileDamage);
                    console.log(`Player hit by projectile! Remaining HP: ${player.hitpoints}`);
                }
                this.transformToTornado();
                this.hitEntities.add(player);
            }

            if (
                this.x < -100 ||
                this.x > this.game.ctx.canvas.width + 100 ||
                this.y < -100 ||
                this.y > this.game.ctx.canvas.height + 100
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
            //console.log("Drawing projectile - SpriteSheet:", spriteSheet, "Loaded:", spriteSheet.complete, "Width:", spriteSheet.naturalWidth, "Height:", spriteSheet.naturalHeight);
            if (!spriteSheet || !spriteSheet.complete || spriteSheet.naturalWidth === 0) {
                console.error("Projectile Animator has no valid sprite sheet:", anim);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.projectileWidth * this.projectileScale / 2, 0, Math.PI * 2);
                ctx.fillStyle = 'orange';
                ctx.fill();
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
                        false, // vertical = false
                        false  // reverse = false
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
           // console.log("Drawing tornado - SpriteSheet:", spriteSheet, "Loaded:", spriteSheet.complete, "Width:", spriteSheet.naturalWidth, "Height:", spriteSheet.naturalHeight, "Current Frame:", anim.currentFrame());
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
                        2 // Scale to make tornado bigger
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
        }
    }
}