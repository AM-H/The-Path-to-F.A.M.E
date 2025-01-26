class Boss {
    constructor(game) {
        this.game = game;
      
        this.idleRightAnim = new Animator(ASSET_MANAGER.getAsset("./sprites/BossIdleR.png"), 0, 0, 32, 32, 4, 0.35);
        this.idleLeftAnim = new Animator(ASSET_MANAGER.getAsset("./sprites/BossIdleL.png"), 0, 0, 32, 32, 4, 0.35);
        this.walkRightAnim = new Animator(ASSET_MANAGER.getAsset("./sprites/BossWalkR.png"), 0, 0, 32, 32, 6, 0.35);
        this.walkLeftAnim = new Animator(ASSET_MANAGER.getAsset("./sprites/BossWalkL.png"), 0, 0, 32, 32, 6, 0.35);
        
     
        this.x = 900;
        this.y = 300;
        
        
        this.facing = -1;
        this.state = 'idle'; // 'idle', 'walkingLeft', 'walkingRight'
        this.moveSpeed = 2;
        
       
        this.stateTimer = 0;
        this.idleTime = 10; // 10 seconds idle
        this.walkTime = 5;  // 5 seconds walking each direction
        this.currentStateTime = this.idleTime;
    }

    update() {
        this.stateTimer += this.game.clockTick;


        if (this.stateTimer >= this.currentStateTime) {
            this.stateTimer = 0;
            
           
            switch(this.state) {
                case 'idle':
                    this.state = 'walkingLeft';
                    this.facing = -1;
                    this.currentStateTime = this.walkTime;
                    break;
                case 'walkingLeft':
                    this.state = 'walkingRight';
                    this.facing = 1;
                    this.currentStateTime = this.walkTime;
                    break;
                case 'walkingRight':
                    this.state = 'idle';
                    this.facing = -1;
                    this.currentStateTime = this.idleTime;
                    break;
            }
        }

        
        if (this.state === 'walkingLeft') {
            this.x -= this.moveSpeed;
        } else if (this.state === 'walkingRight') {
            this.x += this.moveSpeed;
        }
        //keeping boundry
        if (this.x < 0) this.x = 0;
        if (this.x > 1024) this.x = 1024;
    }

    draw(ctx) {
        
        if (this.state === 'idle') {
            if (this.facing === -1) {
                this.idleLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 25, 25);
            } else {
                this.idleRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 25, 25);
            }
        } else if (this.state === 'walkingLeft' || this.state === 'walkingRight') {
            if (this.facing === -1) {
                this.walkLeftAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 25, 25);
            } else {
                this.walkRightAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 25, 25);
            }
        }
    }
}