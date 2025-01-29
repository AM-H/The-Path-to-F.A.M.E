const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload(`./levelBackgrounds/level3_background.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/idleLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/idleRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/runLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/runRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/jumpLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/jumpRight.png`);

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	//gameEngine.addEntity(new AzielSeraph(gameEngine));
	//gameEngine.addEntity(new Spaceship(gameEngine));
	gameEngine.addEntity(new Kanji(gameEngine));
	gameEngine.addEntity(new Forest(gameEngine));
	gameEngine.init(ctx);

	gameEngine.start();
});
