const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload(`./levelBackgrounds/level1_background.png`);
ASSET_MANAGER.queueDownload(`./sprites/idleRightAziel.png`);
ASSET_MANAGER.queueDownload(`./sprites/idleLeftAziel.png`);
ASSET_MANAGER.queueDownload(`./sprites/moveRightAziel.png`);
ASSET_MANAGER.queueDownload(`./sprites/moveLeftAziel.png`);

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	gameEngine.addEntity(new AzielSeraph(gameEngine));
	gameEngine.addEntity(new FirstLevelGround(gameEngine));
	gameEngine.addEntity(new FirstLevelPlatform1(gameEngine));
	gameEngine.addEntity(new FirstLevelPlatform2(gameEngine));
	gameEngine.addEntity(new Spaceship(gameEngine));
	gameEngine.init(ctx);

	gameEngine.start();
});
