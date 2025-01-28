const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload(`./levelBackgrounds/level1_background.png`);
ASSET_MANAGER.queueDownload('./sprites/idleLeft.png');
ASSET_MANAGER.queueDownload('./sprites/idleRight.png');
ASSET_MANAGER.queueDownload('./sprites/runLeft.png');
ASSET_MANAGER.queueDownload('./sprites/runRight.png');
ASSET_MANAGER.queueDownload('./sprites/attack1Right.png');
ASSET_MANAGER.queueDownload('./sprites/attack1Left.png');
ASSET_MANAGER.queueDownload('./sprites/attack2Right.png');
ASSET_MANAGER.queueDownload('./sprites/attack2Left.png');
ASSET_MANAGER.queueDownload('./sprites/bullet.png');

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	gameEngine.addEntity(new KyraBlade(gameEngine));
	gameEngine.addEntity(new FirstLevelGround(gameEngine));
	gameEngine.addEntity(new FirstLevelPlatform1(gameEngine));
	gameEngine.addEntity(new FirstLevelPlatform2(gameEngine));
	gameEngine.addEntity(new Spaceship(gameEngine));
	gameEngine.init(ctx);

	gameEngine.start();
});
