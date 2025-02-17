class LevelManager {
    constructor(game, player) {
        this.game = game;
        this.whichPlayer = player;
        this.boss = null;
        this.currentLevel = 1;
        this.loadLevel(levelOne);
    };

    loadLevel(level) {
        // Set current level at the start of loadLevel
        if(level === levelOne) {
            this.currentLevel = 1;
            this.boss = new Boss(this.game);
            for (var i = 0; i < level.drones.length; i++) {
                let drone = level.drones[i];
                this.game.addEntity(new Drone(this.game, drone.x, drone.y, drone.speed));
            }
            this.game.addEntity(this.boss);
            ASSET_MANAGER.pauseBackgroundMusic();
            ASSET_MANAGER.playAsset(`./audio/level1Music.mp3`);
            ASSET_MANAGER.autoRepeat(`./audio/level1Music.mp3`);
        } else if (level === levelTwo) {
            this.currentLevel = 2;
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
            this.currentLevel = 3;
            this.boss = new Shizoku(this.game);
            this.game.addEntity(this.boss);
            for (var i = 0; i < level.spirits.length; i++) {
                let spirit = level.spirits[i];
                this.game.addEntity(new stormSpirit(this.game, spirit.x, spirit.speed));
            }
            ASSET_MANAGER.pauseBackgroundMusic();
        }

        // Add player based on selection
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
        }

        // Add background and platforms
        this.game.addEntity(new Background(this.game, level.background.x, level.background.y, level.background.width, level.background.height, level.background.path));
        for (var i = 0; i < level.platform.length; i++) {
            let platform = level.platform[i];
            this.game.addEntity(new Platform(this.game, platform.x, platform.y, platform.width, platform.height, platform.bColor));
        }

        console.log("Level loaded:", this.currentLevel);
    };

    update() {
        // Debug logs
        if(this.currentLevel === 2){
            console.log(this.boss.defeated);
        }
        if (this.boss.defeated && this.boss.removeFromWorld) {
            console.log("Boss defeated at level:", this.currentLevel);

            this.game.entities.forEach(element => {
                element.removeFromWorld = true;
            });

            if (this.currentLevel === 1) {
                console.log("Transitioning to level 2");
                this.loadLevel(levelTwo);
            } else if (this.currentLevel === 2) {
                console.log("Transitioning to level 3");
                this.loadLevel(levelThree);
            } else {
                console.log("Game completed!");
                // Add any game completion logic here
            }
        }

        updateVolume();
    };

    draw(ctx) {

    };
}