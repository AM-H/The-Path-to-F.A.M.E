class Kanji {
    constructor(game) {
        this.game = game;
        this.x = 400;
        this.y = 300;
        this.velocity = { x: 0, y: 0 };
        this.speed = 200;
        this.facing = 'Right';
        this.isJumping = false;

        this.animationMap = {
            IdleLeft: new Animator(ASSET_MANAGER.getAsset('./sprites/kanjiIdleLeft.png'), 0, 0, 200, 205, 8, 0.33),
            IdleRight: new Animator(ASSET_MANAGER.getAsset('./sprites/kanjiIdleRight.png'), 0, 0, 200, 205, 8, 0.33),
            RunLeft: new Animator(ASSET_MANAGER.getAsset('./sprites/kanjiRunLeft.png'), 0, 0, 200, 205, 8, 0.33),
            RunRight: new Animator(ASSET_MANAGER.getAsset('./sprites/kanjiRunRight.png'), 0, 0, 200, 205, 8, 0.33),
            JumpLeft: new Animator(ASSET_MANAGER.getAsset('./sprites/kanjiJumpLeft.png'), 0, 0, 200, 205, 8, 0.33),
            JumpRight: new Animator(ASSET_MANAGER.getAsset('./sprites/kanjiJumpRight.png'), 0, 0, 200, 205, 8, 0.33),
        };


        this.animator = this.animationMap.IdleRight;
    }
    update() {
        this.velocity.x = 0;


        if (this.game.left) {
            this.velocity.x = -this.speed;
            if (this.facing !== "Left" || this.animator !== this.animationMap.RunLeft) {
                this.facing = "Left";
                this.animator = this.animationMap.RunLeft;
            }
        }

        if (this.game.right) {
            this.velocity.x = this.speed;
            if (this.facing !== "Right" || this.animator !== this.animationMap.RunRight) {
                this.facing = "Right";

                this.animator = this.animationMap.RunRight;

            }
        }


        if (this.game.jump && !this.isJumping && this.y === 300) {
            this.isJumping = true;
            this.velocity.y = 600;

        }


        if (this.isJumping) {
            this.velocity.y -= 1024* this.game.clockTick;
        }


        this.x += this.velocity.x * this.game.clockTick;
        this.y -= this.velocity.y * this.game.clockTick;


        if (this.y >= 300) {
            this.y = 300;
            this.velocity.y = 0;
            if (this.isJumping) {
                this.isJumping = false;
            }
        }


        if (!this.game.left && !this.game.right) {
            if (this.facing === "Left" && this.animator !== this.animationMap.IdleLeft) {
                this.animator = this.animationMap.IdleLeft;
            } else if (this.facing === "Right" && this.animator !== this.animationMap.IdleRight) {
                this.animator = this.animationMap.IdleRight;
            }
        }

        const spriteWidth = 250;
        if (this.x + spriteWidth < 0) this.x = -spriteWidth;
        if (this.x +  (this.animator.width * 3 - spriteWidth) > this.game.ctx.canvas.width) {
            this.x = this.game.ctx.canvas.width - (this.animator.width * 3 - spriteWidth);
        }
    }


    draw(ctx){
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
}