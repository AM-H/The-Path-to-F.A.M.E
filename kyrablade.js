class KyraBlade {
    constructor(game) {
        this.game = game;
        this.animator = new Animator(ASSET_MANAGER.getAsset(`./sprites/idle.png`), 0, 0, 100, 65, 4, .35,);
        this.x = 0;
        this.y = 300;
        this.velocity = { x: 0, y: 0 };
        this.fallAcc = 562.5;

    };
    update () {
        const TICK = this.game.clockTick;

        const STOP_FALL = 1575;
        const WALK_FALL = 1800;
        const RUN_FALL = 2025;

        const MAX_FALL = 270;
        this.velocity.y += this.fallAcc * TICK;

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
        if (this.game.right && !this.game.left) {
            this.x += 4
        } else if (this.game.left && !this.game.right) {
            this.x -= 4;
        } else {
            //do nothing
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