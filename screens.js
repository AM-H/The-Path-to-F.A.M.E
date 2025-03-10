class TitleScreen {
    constructor(game) {
        this.game = game;
        this.removeFromWorld = false;
        this.spritesheet = ASSET_MANAGER.getAsset(`./levelBackgrounds/TitleScreen.png`);
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
            this.playButton.height = 120;
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
        updateVolume();

    }
    loadSelectPlayerScreen() {
        this.game.addEntity(new SelectPlayerScreen(this.game));
    }
    draw(ctx) {
        ctx.drawImage(this.spritesheet, 0 , 0, gameWorld.width, gameWorld.height);
        ctx.drawImage(this.playButton.asset, this.playButton.x, this.playButton.y, this.playButton.width, this.playButton.height);
    }
}
class SelectPlayerScreen {
    constructor(game) {
        this.game = game;
        ASSET_MANAGER.playAsset(`./audio/YouSeeBIGGIRLT_T.mp3`);
        ASSET_MANAGER.autoRepeat(`./audio/YouSeeBIGGIRLT_T.mp3`);
        this.spritesheet = ASSET_MANAGER.getAsset(`./levelBackgrounds/SelectPlayerScreen.png`);
        this.player1 = {
            idle: new Animator(ASSET_MANAGER.getAsset(`./sprites/kyrablade/kyraIdleRight.png`), 0, 0, 32, 38, 5, 0.35),
            x: (gameWorld.width/5),
            y: (gameWorld.height/8)*6
        };
        this.player2 = {
            idle: new Animator(ASSET_MANAGER.getAsset(`./sprites/GrimIdleR.png`), 0, 16, 42, 32, 5, 0.2),
            x: (gameWorld.width/5)*2,
            y: (gameWorld.height/8)*6
        };
        this.player3 = {
            idle: new Animator(ASSET_MANAGER.getAsset(`./sprites/kanji/IdleRight.png`), 0, 0, 32, 32, 9, .20),
            x: (gameWorld.width/5)*3,
            y: (gameWorld.height/8)*6
        };
        this.player4 = {
            idle: new Animator(ASSET_MANAGER.getAsset(`./sprites/IdleRightAziel.png`), 13, 0, 32, 32, 5, .35),
            x: (gameWorld.width/5)*4,
            y: (gameWorld.height/8)*6
        };
        this.removeFromWorld = false;
        this.hovering2 = false;
        this.hovering4 = false;
    }

    update() {
        // Check hover for Kyra (player1)
        if ((this.game.mouseX > this.player1.x) && this.game.mouseX < this.player1.x+64 && 
            this.game.mouseY > this.player1.y && this.game.mouseY < this.player1.y+61) {
            this.hovering1 = true;
            if (this.game.closeAttack) {
                this.removeFromWorld = true;
                this.game.addEntity(new LevelManager(this.game, `kyra`, levelOne));
            }
        } else {
            this.hovering1 = false;
        }

        // Check hover for Grim (player2)
        if ((this.game.mouseX > this.player2.x) && this.game.mouseX < this.player2.x+64 && 
            this.game.mouseY > this.player2.y && this.game.mouseY < this.player2.y+64) {
            this.hovering2 = true;
            if (this.game.closeAttack) {
                this.removeFromWorld = true;
                this.game.addEntity(new LevelManager(this.game, `grim`, levelOne));
            }
        } else {
            this.hovering2 = false;
        }

        // Check hover for Kanji (player3)
        if ((this.game.mouseX > this.player3.x) && this.game.mouseX < this.player3.x+64 &&
            this.game.mouseY > this.player3.y && this.game.mouseY < this.player3.y+64) {
            this.hovering3 = true;
            if (this.game.closeAttack) {
                this.removeFromWorld = true;
                this.game.addEntity(new LevelManager(this.game, `kanji`, levelOne));
            }
        } else {
            this.hovering3 = false;
        }

        // Check hover for Aziel (player4)
        if ((this.game.mouseX > this.player4.x) && this.game.mouseX < this.player4.x+32 && 
            this.game.mouseY > this.player4.y && this.game.mouseY < this.player4.y+64) {
            this.hovering4 = true;
            if (this.game.closeAttack) {
                this.removeFromWorld = true;
                this.game.addEntity(new LevelManager(this.game, `aziel`, levelOne));
            }
        } else {
            this.hovering4 = false;
        }
    }

    draw(ctx) {
        ctx.drawImage(this.spritesheet, 0, 0, gameWorld.width, gameWorld.height);
        this.player1.idle.drawFrame(this.game.clockTick, ctx, this.player1.x, this.player1.y, 2);
        this.player2.idle.drawFrame(this.game.clockTick, ctx, this.player2.x, this.player2.y, 2);
        this.player3.idle.drawFrame(this.game.clockTick, ctx, this.player3.x, this.player3.y, 2);
        this.player4.idle.drawFrame(this.game.clockTick, ctx, this.player4.x, this.player4.y, 2);

        // Draw selection boxes
        if (this.hovering1) {
            ctx.strokeStyle = `#fafad4`;
            ctx.lineWidth = 6;
            ctx.strokeRect(this.player1.x+9, this.player1.y, 58, 76);
        }

        if (this.hovering2) {
            ctx.strokeStyle = `#fafad4`;
            ctx.lineWidth = 6;
            ctx.strokeRect(this.player2.x, this.player2.y, 50, 64);
        }

        if (this.hovering3) {
            ctx.strokeStyle = `#fafad4`;
            ctx.lineWidth = 6;
            ctx.strokeRect(this.player3.x + 10, this.player3.y, 48, 64);
        }
        if (this.hovering4) {
            ctx.strokeStyle = `#fafad4`;
            ctx.lineWidth = 6;
            ctx.strokeRect(this.player4.x, this.player4.y, 32, 64);
        }
    }
}
class YouWonScreen {
    constructor(game) {
        this.game = game;
        this.spritesheet = ASSET_MANAGER.getAsset(`./levelBackgrounds/YouWonScreen.png`);
        this.retryButton = {
            asset: ASSET_MANAGER.getAsset(`./levelBackgrounds/playagainbutton.png`),
            x: (gameWorld.width / 2) - 150,
            y: (gameWorld.height / 4),
            width: 300,
            height: 300,
            defaultWidth: 300,
            defaultHeight: 300,
            scaleFactor: 1.1, //How much bigger it gets
            isHovered: false
        };
        this.removeFromWorld = false;
    }

    update() {
        const offsetX = 40;
        const offsetY = 85;
        const adjustedWidth = this.retryButton.defaultWidth - 80;
        const adjustedHeight = this.retryButton.defaultHeight - 170;
    
        if (
            this.game.mouseX > this.retryButton.x + offsetX && 
            this.game.mouseX < this.retryButton.x + offsetX + adjustedWidth &&
            this.game.mouseY > this.retryButton.y + offsetY && 
            this.game.mouseY < this.retryButton.y + offsetY + adjustedHeight
        ) {
            //Apply scaling effect
            if (!this.retryButton.isHovered) {
                this.retryButton.isHovered = true;
                this.retryButton.width = this.retryButton.defaultWidth * this.retryButton.scaleFactor;
                this.retryButton.height = this.retryButton.defaultHeight * this.retryButton.scaleFactor;
                this.retryButton.x -= (this.retryButton.width - this.retryButton.defaultWidth) / 2;
                this.retryButton.y -= (this.retryButton.height - this.retryButton.defaultHeight) / 2;
            }
            if (this.game.closeAttack) {
                ASSET_MANAGER.pauseBackgroundMusic();
                this.resetGame();
            }
        } else {
            //Reset to default size if not hovered
            if (this.retryButton.isHovered) {
                this.retryButton.isHovered = false;
                this.retryButton.width = this.retryButton.defaultWidth;
                this.retryButton.height = this.retryButton.defaultHeight;
                this.retryButton.x = (gameWorld.width / 2) - (this.retryButton.defaultWidth / 2);
                this.retryButton.y = (gameWorld.height / 4);
            }
        }
    }
    
    resetGame() {
        this.game.entities.forEach(element => {
            element.removeFromWorld = true;
        });
        this.game.addEntity(new TitleScreen(this.game));
    }
    draw(ctx) {
        ctx.drawImage(this.spritesheet, 0, 0, gameWorld.width, gameWorld.height);
        ctx.drawImage(this.retryButton.asset, this.retryButton.x, this.retryButton.y, this.retryButton.width, this.retryButton.height);
        
        if (this.game.debugMode) {
            ctx.strokeStyle = `red`;
            ctx.lineWidth = 4;
            ctx.strokeRect(this.retryButton.x + 40, this.retryButton.y + 85, this.retryButton.width - 80, this.retryButton.height - 170);
        }
    }
}


