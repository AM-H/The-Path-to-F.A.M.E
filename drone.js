class Drone {
    constructor(game, x, y, speed) {
        this.game = game;

        this.droneImg = new Animator(ASSET_MANAGER.getAsset(`./sprites/drone.png`), 0, 0, 48, 50, 4, 0.35);


        this.x = x;
        this.y = y;



        this.spriteScale = 2;
        this.width = 32 * this.spriteScale;
        this.height = 32 * this.spriteScale;

        // Bounding box
        this.boxWidth = 32;
        this.boxHeight = 32;
        this.updateBoundingBox();

        // Movement properties
        this.moveSpeed = speed;
        this.followRange = 600;
        this.attackRange = 200;
        this.attackCooldown = 2;
        this.attackTimer = 0;

        // State
        this.state = `idle`; // Possible states: `idle`, `chasing`, `attacking`
    }

    updateBoundingBox() {
        const xOffset = (this.width - this.boxWidth) / 2;
        const yOffset = (this.height - this.boxHeight) / 2;
        this.box = new BoundingBox(
            this.x + xOffset,
            this.y + yOffset,
            this.boxWidth + 40,
            this.boxHeight + 20
        );
    }

    update() {
        const TICK = this.game.clockTick;
        const player = this.game.entities.find(entity => entity instanceof AzielSeraph);

        if (player) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

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

        // Update bounding box after movement
        this.updateBoundingBox();
    }

    shoot(player) {
        // Calculate direction to the player
        const dx = (player.box.x + player.box.width/2) - this.x;
        const dy = (player.box.y + player.box.height/2) - this.y;
        const angle = Math.atan2(dy, dx);

        // Create a bullet in the direction of the player
        const bullet = new Bullet(this.game, this.x, this.y, angle);
        this.game.addEntity(bullet);  // Add the bullet to the game entities
    }

    draw(ctx) {
        this.droneImg.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.spriteScale);

        ctx.strokeStyle = `red`;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
    }
}
