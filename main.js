const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload(`./levelBackgrounds/level1_background.png`);
// ASSET_MANAGER.queueDownload('./sprites/idleLeft.png');
// ASSET_MANAGER.queueDownload('./sprites/idleRight.png');
// ASSET_MANAGER.queueDownload('./sprites/runLeft.png');
// ASSET_MANAGER.queueDownload('./sprites/runRight.png');
// ASSET_MANAGER.queueDownload('./sprites/attack1Right.png');
// ASSET_MANAGER.queueDownload('./sprites/attack1Left.png');
// ASSET_MANAGER.queueDownload('./sprites/attack2Right.png');
// ASSET_MANAGER.queueDownload('./sprites/attack2Left.png');
// ASSET_MANAGER.queueDownload('./sprites/bullet.png');
// ASSET_MANAGER.queueDownload('./sprites/drone.png');



//azielseraph

ASSET_MANAGER.queueDownload(`./sprites/IdleRightAziel.png`);
ASSET_MANAGER.queueDownload(`./sprites/IdleLeftAziel.png`);
ASSET_MANAGER.queueDownload(`./sprites/moveRightAziel.png`);
ASSET_MANAGER.queueDownload(`./sprites/moveLeftAziel.png`);
ASSET_MANAGER.queueDownload(`./sprites/HolyDiverRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/HolyDiverLeft.png`);



//Boss
ASSET_MANAGER.queueDownload("./sprites/BossIdleR.png");
ASSET_MANAGER.queueDownload("./sprites/BossIdleL.png");

ASSET_MANAGER.queueDownload("./sprites/BossWalkL.png");
ASSET_MANAGER.queueDownload("./sprites/BossWalkR.png");

ASSET_MANAGER.queueDownload("./sprites/BossAttackR.png");
ASSET_MANAGER.queueDownload("./sprites/BossAttackL.png");


//Grim
ASSET_MANAGER.queueDownload('./sprites/GrimRunningL.png');
ASSET_MANAGER.queueDownload('./sprites/GrimRunningR.png');
ASSET_MANAGER.queueDownload('./sprites/GrimIdleL.png');
ASSET_MANAGER.queueDownload('./sprites/GrimIdleR.png');




ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	// const aziel = new AzielSeraph(gameEngine);
	// gameEngine.addEntity(aziel);
	// gameEngine.addEntity(new HolyDiver(gameEngine, aziel))
	gameEngine.addEntity(new Grim(gameEngine));
	gameEngine.addEntity(new Boss(gameEngine));
	gameEngine.addEntity(new FirstLevelGround(gameEngine));
	//gameEngine.addEntity(new FirstLevelPlatform1(gameEngine));
	//gameEngine.addEntity(new FirstLevelPlatform2(gameEngine));
	gameEngine.addEntity(new Spaceship(gameEngine));
	gameEngine.init(ctx);

	gameEngine.start();
});
