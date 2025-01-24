const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload(`./levelBackgrounds/level1_background.png`);
ASSET_MANAGER.queueDownload(`./sprites/idle.png`);

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	gameEngine.addEntity(new KyraBlade(gameEngine));
	gameEngine.addEntity(new Spaceship(gameEngine));
	gameEngine.init(ctx);

	gameEngine.start();
});
