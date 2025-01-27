const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload(`./levelBackgrounds/level3_background.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanjiIdleLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanjiIdleRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanjiRunLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanjiRunRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanjiJumpLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanjiJumpRight.png`);

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
