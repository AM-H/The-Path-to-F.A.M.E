class AzielSeraph {
    constructor(game) {
        this.game = game;
        this.animator = new Animator(ASSET_MANAGER.getAsset(`./sprites/idleRight.png`), 8, 0, 32, 32, 4, .35,);
        this.x = 0;
        this.y = 300;
        this.velocity = { x: 0, y: 0 };
        this.fallAcc = 562.5;
        this.facing = "right";
        this.animationMap = new Map();
        this.animationMap.set(`runRight`, new Animator(ASSET_MANAGER.getAsset('./sprites/runRight.png'), 8, 0, 32, 32, 6, 0.2));
        this.animationMap.set(`runLeft`, new Animator(ASSET_MANAGER.getAsset('./sprites/runLeft.png'), 8, 0, 32, 32, 6, 0.2));
        this.animationMap.set(`idleRight`, new Animator(ASSET_MANAGER.getAsset('./sprites/idleRight.png'), 8, 0, 32, 32, 4, 0.2));
        this.animationMap.set(`idleLeft`, new Animator(ASSET_MANAGER.getAsset('./sprites/idleLeft.png'), 8, 0, 32, 32, 4, 0.2));

    };
    update () {
        const TICK = this.game.clockTick;

        const STOP_FALL = 1575;
        const WALK_FALL = 1800;
        const RUN_FALL = 2025;

        const MAX_FALL = 270;
        this.velocity.y += this.fallAcc * TICK;

        if (this.game.left) {
            this.x -= 4;
            if (this.facing !== "left") {
                this.facing = "left";
                this.animator = this.animationMap.get(`runLeft`);
            }
        }

        if (this.game.right) {
            this.x += 4;
            if (this.facing !== "right") {
                this.facing = "right";
                this.animator = this.animationMap.get(`runRight`)
            }
        }
       
        if (!this.game.left && !this.game.right) {
            if (this.facing === "left" && this.facing !== "idle") {
                this.facing = "idle";
                this.animator = this.animationMap.get(`idleLeft`);
            } else if (this.facing === "right" && this.facing !== "idle") {
                this.facing = "idle";
                this.animator = this.animationMap.get(`idleRight`);
            }
        }

        if (this.game.jump) { // jump
            if (Math.abs(this.velocity.x) < 16) {
                this.velocity.y = -240;
                this.fallAcc = STOP_FALL;
            }
            else if (Math.abs(this.velocity.x) < 40) {
                this.velocity.y = -240;
                this.fallAcc = WALK_FALL;
            }
            else {
                this.velocity.y = -300;
                this.fallAcc = RUN_FALL;
            }
        } else {
            if (this.velocity.y >= MAX_FALL) this.velocity.y = MAX_FALL;
            if (this.velocity.y <= -MAX_FALL) this.velocity.y = -MAX_FALL;
        }

        this.velocity.y += this.fallAcc * TICK;
        if (this.y > 300) {
            this.y = 300;
        }
        

        if (this.y < 0) {
            this.y = 300;
        }
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > 975) {
            this.x = 975;
        }
        this.x += this.velocity.x * TICK;
        this.y += this.velocity.y * TICK;
    };
    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 25, 25);
    };
};