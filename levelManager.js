class LevelManager {
    constructor(game, player, level) {
        this.game = game;
        this.whichPlayer = player;
        this.boss = null;
        //this.startLevelTransition(level);
        this.loadLevel(levelFour);
    };
    startLevelTransition(level) {
        const transition = new LevelTransition(this.game);
        this.game.addEntity(transition);
        setTimeout(() => {
            this.loadLevel(level);
         }, 4000); // Wait 4 seconds before loading the level
    }
    loadLevel(level) {
        if (this.whichPlayer === `aziel`) {
            const aziel = new AzielSeraph(this.game);
            this.game.addEntity(aziel);
            this.game.addEntity(new HolyDiver(this.game, aziel));
        } else if(this.whichPlayer === `kanji`){
            const kanji = new Kanji(this.game);
            this.game.addEntity(kanji);
        } else if(this.whichPlayer === `grim`){
            const grim = new Grim(this.game);
            this.game.addEntity(grim);
            this.game.addEntity(new GrimAxe(this.game, grim));
        } else if(this.whichPlayer === `kyra`){
            const kyra = new Kyra(this.game);
            this.game.addEntity(kyra);
        }
        if(level === levelOne) {
            this.boss = new Eclipser(this.game);
            for (var i = 0; i < level.drones.length; i++) {
                let drone = level.drones[i];
                this.game.addEntity(new Drone(this.game, drone.x, drone.y, drone.speed));
            }
            this.game.addEntity(this.boss);
            ASSET_MANAGER.pauseBackgroundMusic();
            ASSET_MANAGER.playAsset(`./audio/level1Music.mp3`);
            ASSET_MANAGER.autoRepeat(`./audio/level1Music.mp3`);
        } else if (level === levelTwo) {
            this.boss = new inferno(this.game);
            this.game.addEntity(this.boss);
            for (var i = 0; i < level.phoenixes.length; i++) {
                let phoenix = level.phoenixes[i];
                this.game.addEntity(new Phoenix(this.game, phoenix.x, phoenix.y, phoenix.speed));
            }
            ASSET_MANAGER.pauseBackgroundMusic();
            ASSET_MANAGER.playAsset(`./audio/level2Music.mp3`);
            ASSET_MANAGER.autoRepeat(`./audio/level2Music.mp3`);
        } else if(level === levelThree){
            this.boss = new Shizoku(this.game);
            this.game.addEntity(this.boss);
            for (var i = 0; i < level.spirits.length; i++) {
                let spirit = level.spirits[i];
                this.game.addEntity(new stormSpirit(this.game, spirit.x, spirit.speed));
            }
            ASSET_MANAGER.pauseBackgroundMusic();
            ASSET_MANAGER.playAsset(`./audio/level3music.mp3`);
            ASSET_MANAGER.autoRepeat(`./audio/level3music.mp3`);
        } else if (level === levelFour) {
            this.boss = new LeviathDraconis(this.game);
            this.game.addEntity(this.boss);
            this.game.addEntity(new ChronosVeil(this.game, this.boss));
            ASSET_MANAGER.pauseBackgroundMusic();
            ASSET_MANAGER.playAsset(`./audio/level4Music.mp3`);
            ASSET_MANAGER.autoRepeat(`./audio/level4Music.mp3`);
        }

        // Add background and platforms
        this.game.addEntity(new Background(this.game, level.background.x, level.background.y, level.background.width, level.background.height, level.background.path));
        for (var i = 0; i < level.platform.length; i++) {
            let platform = level.platform[i];
            this.game.addEntity(new Platform(this.game, platform.x, platform.y, platform.width, platform.height, platform.bColor));
        }

        console.log(`Level loaded:`, this.currentLevel);
    };

    update() {
        if (this.boss && this.boss instanceof Eclipser && this.boss.defeated) {
            this.game.entities.forEach(element => {
                element.removeFromWorld = true;
            });
            this.game.addEntity(new LevelManager(this.game, this.whichPlayer, levelTwo));
        } else if (this.boss && this.boss instanceof inferno && this.boss.defeated) {
            this.game.entities.forEach(element => {
                element.removeFromWorld = true;
            });
            this.game.addEntity(new LevelManager(this.game, this.whichPlayer, levelThree));
        } else if(this.boss && this.boss instanceof Shizoku && this.boss.defeated){
            this.game.entities.forEach(element => {
                element.removeFromWorld = true;
            });
            this.game.addEntity(new LevelManager(this.game, this.whichPlayer, levelFour));
        }
        else if (this.boss && this.boss instanceof LeviathDraconis && this.boss.defeated) {
            this.game.entities.forEach(element => {
                element.removeFromWorld = true;
            });
            this.game.addEntity(new YouWonScreen(this.game));
        }

        updateVolume();
    };

    draw(ctx) {

    };
}
