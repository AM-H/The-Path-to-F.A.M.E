class LevelManager {
    constructor(game, player) {
        this.game = game;
        this.whichPlayer = player;
        this.boss = null;
        this.startLevelTransition(levelOne);
    };
    startLevelTransition(level) {
        const transition = new LevelTransition(this.game);
        this.game.addEntity(transition);

        setTimeout(() => {
            this.loadLevel(level);
        }, 4000); // Wait 4 seconds before loading the level
    }
    loadLevel(level) {
        if (this.whichPlayer == `aziel`) {
            const aziel = new AzielSeraph(this.game);
            this.game.addEntity(aziel);
            this.game.addEntity(new HolyDiver(this.game, aziel));
        }
        if(this.whichPlayer === `kanji`){
            const kanji = new Kanji(this.game);
            this.game.addEntity(kanji);
        }

        if(this.whichPlayer == `grim`){
            const grim = new Grim(this.game);
            this.game.addEntity(grim);
            this.game.addEntity(new GrimAxe(this.game, grim));
        }
        if(level == levelOne) {
            this.boss = new Eclipser(this.game);
            for (var i = 0; i < level.drones.length; i++) {
                let drone = level.drones[i];
                this.game.addEntity(new Drone(this.game, drone.x, drone.y, drone.speed));
            }
            this.game.addEntity(this.boss);
            ASSET_MANAGER.pauseBackgroundMusic();
            ASSET_MANAGER.playAsset(`./audio/level1Music.mp3`);
            ASSET_MANAGER.autoRepeat(`./audio/level1Music.mp3`);
        } else if (level == levelTwo) {
            this.boss = new Boss(this.game);
            // add minions and boss level two
            ASSET_MANAGER.pauseBackgroundMusic();
            ASSET_MANAGER.playAsset(`./audio/level2Music.mp3`);
            ASSET_MANAGER.autoRepeat(`./audio/level2Music.mp3`);
        }

        this.game.addEntity(new Background(this.game, level.background.x, level.background.y, level.background.width, level.background.height, level.background.path));
        for (var i = 0; i < level.platform.length; i++) {
            let platform = level.platform[i];
            this.game.addEntity(new Platform(this.game, platform.x, platform.y, platform.width, platform.height, platform.bColor));
        }
    };
    update() {
        if (this.boss != null) {
            
        }
        if (this.boss && this.boss.defeated) {
            this.game.entities.forEach(element => {
                element.removeFromWorld = true;
            });
            this.startLevelTransition(levelTwo);
        }
        
        updateVolume();

    };
    draw(ctx) {
        
    };
    
};