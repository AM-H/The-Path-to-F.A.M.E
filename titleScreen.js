class TitleScreen {
    constructor(game) {
        this.game = game;
        this.spritesheet = ASSET_MANAGER.getAsset(`./levelBackgrounds/TitleScreen.png`);
        this.removeFromWorld = false;
        this.playButton = {
            asset: ASSET_MANAGER.getAsset(`./levelBackgrounds/PLAYbutton.png`),
            x: (gameWorld.width/2)-100,
            y: 480,
            width: 200,
            height: 100
        };
    }
    update() {
        if ((this.game.mouseX > this.playButton.x) && this.game.mouseX < this.playButton.x+200 && this.game.mouseY > this.playButton.y && this.game.mouseY < this.playButton.y+100) {
            this.playButton.x = (gameWorld.width/2) - 120;
            this.playButton.y = 460;
            this.playButton.width = 220;
            this.playButton.height = 120
            if (this.game.closeAttack) {
                this.removeFromWorld = true;
                this.loadSelectPlayerScreen();
            }
        } else {
            this.playButton.x = (gameWorld.width/2) - 110;
            this.playButton.y = 470;
            this.playButton.width = 200;
            this.playButton.height = 100;
        }
    }
    loadSelectPlayerScreen() {
        this.game.addEntity(new SelectPlayerScreen(this.game)) ;
    }
    draw(ctx) {
        ctx.drawImage(this.spritesheet, 0 , 0, gameWorld.width, gameWorld.height);
        ctx.drawImage(this.playButton.asset, this.playButton.x, this.playButton.y, this.playButton.width, this.playButton.height);
    }
}
class SelectPlayerScreen {
    constructor(game) {
        this.game = game;
        this.spritesheet = ASSET_MANAGER.getAsset(`./levelBackgrounds/SelectPlayerScreen.png`);
        this.player1 = {
            idle: new Animator(ASSET_MANAGER.getAsset(`./sprites/IdleRightAziel.png`), 13, 0, 32, 32, 5, .35),
            x: (gameWorld.width/5),
            y: (gameWorld.height/8)*6
        };
        this.player2 = {
            idle: new Animator(ASSET_MANAGER.getAsset(`./sprites/IdleRightAziel.png`), 13, 0, 32, 32, 5, .35),
            x: (gameWorld.width/5)*2,
            y: (gameWorld.height/8)*6
        };
        this.player3 = {
            idle: new Animator(ASSET_MANAGER.getAsset(`./sprites/IdleRightAziel.png`), 13, 0, 32, 32, 5, .35),
            x: (gameWorld.width/5)*3,
            y: (gameWorld.height/8)*6
        };
        this.player4 = {
            idle: new Animator(ASSET_MANAGER.getAsset(`./sprites/IdleRightAziel.png`), 13, 0, 32, 32, 5, .35),
            x: (gameWorld.width)-(gameWorld.width/5),
            y: (gameWorld.height/8)*6
        };
        this.removeFromWorld = false;
        this.hovering4 = false;
    }
    update() {
        if ((this.game.mouseX > this.player4.x) && this.game.mouseX < this.player4.x+32 && this.game.mouseY > this.player4.y && this.game.mouseY < this.player4.y+64) {
            this.hovering4 = true;
            if (this.game.closeAttack) { //closeAttack is left click
                this.removeFromWorld = true;
                //this.game.addEntity(new LevelManager(this.game));
            }
        } else {
            this.hovering4 = false;
        }
    }
    draw(ctx) {
        ctx.drawImage(this.spritesheet, 0 , 0, gameWorld.width, gameWorld.height);
        this.player1.idle.drawFrame(this.game.clockTick, ctx, this.player1.x, this.player1.y);
        this.player2.idle.drawFrame(this.game.clockTick, ctx, this.player2.x, this.player2.y);
        this.player3.idle.drawFrame(this.game.clockTick, ctx, this.player3.x, this.player3.y);
        this.player4.idle.drawFrame(this.game.clockTick, ctx, this.player4.x, this.player4.y);
        if (this.hovering4) {
            ctx.strokeStyle = `#fafad4`;
            ctx.lineWidth = 6;
            ctx.strokeRect(this.player4.x, this.player4.y, 32, 64);
        }
    }
}