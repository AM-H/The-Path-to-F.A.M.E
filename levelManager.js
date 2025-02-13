class LevelManager {
    constructor(game, player) {
        this.game = game;
        this.whichPlayer = player;
        this.boss = null;
        this.loadLevel(levelOne);
    };
    loadLevel(level) {
        if (this.whichPlayer == `aziel`) {
            const aziel = new AzielSeraph(this.game);
            this.game.addEntity(aziel);
            this.game.addEntity(new HolyDiver(this.game, aziel));
        }
        if(level == levelOne) {
            this.boss = new Boss(this.game);
            for (var i = 0; i < level.drones.length; i++) {
                let drone = level.drones[i];
                this.game.addEntity(new Drone(this.game, drone.x, drone.y, drone.speed));
            }
            this.game.addEntity(this.boss);
        } else if (level == levelTwo) {
            this.boss = new Boss(this.game);
            // add minions and boss level two
        }

        this.game.addEntity(new Background(this.game, level.background.x, level.background.y, level.background.width, level.background.height, level.background.path));
        for (var i = 0; i < level.platform.length; i++) {
            let platform = level.platform[i];
            this.game.addEntity(new Platform(this.game, platform.x, platform.y, platform.width, platform.height, platform.bColor));
        }
    };
    update() {
        if (this.boss.defeated) {
            this.game.entities.forEach(element => {
                element.removeFromWorld = true;
            });
            this.loadLevel(levelTwo);
        }

    };
    draw(ctx) {
        
    };
    
};