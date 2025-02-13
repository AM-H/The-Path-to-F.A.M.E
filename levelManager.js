class LevelManager {
    constructor(game, player) {
        this.game = game;
        this.whichPlayer = player;
        this.player = null;
        if (this.whichPlayer === 'aziel') {
            this.player = new AzielSeraph(this.game);
        } else if (this.whichPlayer === 'grim') {
            this.player = new Grim(this.game);
        }
        this.loadLevel(levelOne);
    };
    loadLevel(level) {
        //redundant drone call and boss call needs to be put into levels.js
        if(level == levelOne) {
            ASSET_MANAGER.pauseBackgroundMusic();
            for (var i = 0; i < level.drones.length; i++) {
                let drone = level.drones[i];
                this.game.addEntity(new Drone(this.game, drone.x, drone.y, drone.speed));
            }
        }
        this.game.addEntity(new Boss(this.game));
        this.game.addEntity(this.player);
        if (this.whichPlayer === 'aziel') {
            this.game.addEntity(new HolyDiver(this.game, this.player));
        }

        this.game.addEntity(new Background(this.game, level.background.x, level.background.y, level.background.width, level.background.height, level.background.path));
        for (var i = 0; i < level.platform.length; i++) {
            let platform = level.platform[i];
            this.game.addEntity(new Platform(this.game, platform.x, platform.y, platform.width, platform.height, platform.bColor));
        }
    };
    update() {

    };
    draw(ctx) {
        
    };
    
};