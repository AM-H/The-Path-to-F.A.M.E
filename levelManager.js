class LevelManager {
    constructor(game, player) {
        this.game = game;
        this.whichPlayer = player;
        this.player = null;
        if (this.whichPlayer === `aziel`) {
            this.player = new AzielSeraph(this.game);
        }
        this.loadLevel(levelOne);
    };
    loadLevel(level) {
        //redundant drone call and boss call needs to be put into levels.js
        this.game.addEntity(new Drone(this.game, 221, 500, 20));
        this.game.addEntity(new Drone(this.game, 43, 74, 10));
        this.game.addEntity(new Drone(this.game, 20, 300,500));
        this.game.addEntity(new Drone(this.game, 222, 200,300));
        this.game.addEntity(new Drone(this.game, 500, 111, 200));
        this.game.addEntity(new Boss(this.game));
        this.game.addEntity(this.player);
        this.game.addEntity(new HolyDiver(this.game, this.player));

        this.game.addEntity(new Background(this.game, level.background.x, level.background.y, level.background.width, level.background.height, level.background.path));
        for (var i = 0; i < level.platform.length; i++) {
            let platform = level.platform[i];
            this.game.addEntity(new Platform(this.game, platform.x, platform.y, platform.width, platform.height));
        }
    };
    update() {

    };
    draw(ctx) {
        
    };
    
};