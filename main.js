const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload(`./levelBackgrounds/TitleScreen.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/PLAYbutton.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/SelectPlayerScreen.png`);
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
ASSET_MANAGER.queueDownload(`./sprites/drone.png`);
ASSET_MANAGER.queueDownload(`./sprites/bullet.png`);



//azielseraph

ASSET_MANAGER.queueDownload(`./sprites/IdleRightAziel.png`);
ASSET_MANAGER.queueDownload(`./sprites/IdleLeftAziel.png`);
ASSET_MANAGER.queueDownload(`./sprites/moveRightAziel.png`);
ASSET_MANAGER.queueDownload(`./sprites/moveLeftAziel.png`);
ASSET_MANAGER.queueDownload(`./sprites/HolyDiverRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/HolyDiverLeft.png`);



//Boss
ASSET_MANAGER.queueDownload(`./sprites/BossIdleR.png`);
ASSET_MANAGER.queueDownload(`./sprites/BossIdleL.png`);

ASSET_MANAGER.queueDownload(`./sprites/BossWalkL.png`);
ASSET_MANAGER.queueDownload(`./sprites/BossWalkR.png`);

ASSET_MANAGER.queueDownload(`./sprites/BossAttackL.png`);
ASSET_MANAGER.queueDownload(`./sprites/BossAttackR.png`);


ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	// const aziel = new AzielSeraph(gameEngine);
	// gameEngine.addEntity(aziel);
	// gameEngine.addEntity(new HolyDiver(gameEngine, aziel))
	// //gameEngine.addEntity(new KyraBlade(gameEngine));

	// // for (let i = 0; i < 5; i++) {
	// // 	const x = Math.random() * (canvas.width - 64); // Random x position within screen bounds
	// // 	const y = Math.random() * (canvas.height - 100); // Random y position within screen bounds
	// // 	const  drone = new Drone(gameEngine, x, y);
	// // 	gameEngine.addEntity(drone);
	// // }

	// gameEngine.addEntity(new Drone(gameEngine, 221, 500, 20));
	// gameEngine.addEntity(new Drone(gameEngine, 43, 74, 10));
	// gameEngine.addEntity(new Drone(gameEngine, 20, 300,500));
	// gameEngine.addEntity(new Drone(gameEngine, 222, 200,300));
	// gameEngine.addEntity(new Drone(gameEngine, 500, 111, 200));

	// gameEngine.addEntity(new Boss(gameEngine));
	// gameEngine.addEntity(new FirstLevelGround(gameEngine));
	// gameEngine.addEntity(new FirstLevelPlatform(gameEngine, Math.floor(gameWorld.width/8), Math.floor(gameWorld.height/1.3), gameWorld.width/4, 30));
	// gameEngine.addEntity(new FirstLevelPlatform(gameEngine, gameWorld.width-(Math.floor(gameWorld.width/8))-gameWorld.width/4, Math.floor(gameWorld.height/1.3), gameWorld.width/4, 30));
	// gameEngine.addEntity(new FirstLevelPlatform(gameEngine, gameWorld.width/6, gameWorld.height/1.6, gameWorld.width/6, 30));
	// gameEngine.addEntity(new FirstLevelPlatform(gameEngine, gameWorld.width - (gameWorld.width/6)*2, gameWorld.height/1.6, gameWorld.width/6, 30));
	// gameEngine.addEntity(new FirstLevelPlatform(gameEngine, gameWorld.width/2-(gameWorld.width/8), gameWorld.height/2, gameWorld.width/4, 30));
	// gameEngine.addEntity(new Spaceship(gameEngine));
	gameEngine.addEntity(new TitleScreen(gameEngine));
	gameEngine.init(ctx);

	gameEngine.start();
});
