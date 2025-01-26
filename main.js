const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload(`./levelBackgrounds/level1_background.png`);
ASSET_MANAGER.queueDownload(`./sprites/idle.png`);


ASSET_MANAGER.queueDownload("./sprites/BossIdleR.png");
ASSET_MANAGER.queueDownload("./sprites/BossIdleL.png");

ASSET_MANAGER.queueDownload("./sprites/BossWalkL.png");
ASSET_MANAGER.queueDownload("./sprites/BossWalkR.png");


ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	gameEngine.addEntity(new AzielSeraph(gameEngine));
	gameEngine.addEntity(new Boss(gameEngine));
	gameEngine.addEntity(new Spaceship(gameEngine));
	gameEngine.init(ctx);

	gameEngine.start();
});
