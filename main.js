const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();

const ASSET_PATH = '/The-Path-to-F.A.M.E';


ASSET_MANAGER.queueDownload(`${ASSET_PATH}/levelBackgrounds/level1_background.png`);


ASSET_MANAGER.queueDownload(`${ASSET_PATH}/sprites/drone.png`);
ASSET_MANAGER.queueDownload(`${ASSET_PATH}/sprites/bullet.png`);


ASSET_MANAGER.queueDownload(`${ASSET_PATH}/sprites/idleRightAziel.png`);
ASSET_MANAGER.queueDownload(`${ASSET_PATH}/sprites/idleLeftAziel.png`);
ASSET_MANAGER.queueDownload(`${ASSET_PATH}/sprites/moveRightAziel.png`);
ASSET_MANAGER.queueDownload(`${ASSET_PATH}/sprites/moveLeftAziel.png`);
ASSET_MANAGER.queueDownload(`${ASSET_PATH}/sprites/HolyDiverRight.png`);
ASSET_MANAGER.queueDownload(`${ASSET_PATH}/sprites/HolyDiverLeft.png`);


ASSET_MANAGER.queueDownload(`${ASSET_PATH}/sprites/BossIdleR.png`);
ASSET_MANAGER.queueDownload(`${ASSET_PATH}/sprites/BossIdleL.png`);
ASSET_MANAGER.queueDownload(`${ASSET_PATH}/sprites/BossWalkL.png`);
ASSET_MANAGER.queueDownload(`${ASSET_PATH}/sprites/BossWalkR.png`);
ASSET_MANAGER.queueDownload(`${ASSET_PATH}/sprites/BossAttackR.png`);
ASSET_MANAGER.queueDownload(`${ASSET_PATH}/sprites/BossAttackL.png`);

ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");
    const aziel = new AzielSeraph(gameEngine);
    
    gameEngine.addEntity(aziel);
    gameEngine.addEntity(new HolyDiver(gameEngine, aziel));

    gameEngine.addEntity(new Drone(gameEngine, 221, 500, 20));
    gameEngine.addEntity(new Drone(gameEngine, 43, 74, 10));
    gameEngine.addEntity(new Drone(gameEngine, 20, 300, 500));
    gameEngine.addEntity(new Drone(gameEngine, 222, 200, 300));
    gameEngine.addEntity(new Drone(gameEngine, 500, 111, 200));

    gameEngine.addEntity(new Boss(gameEngine));
    gameEngine.addEntity(new FirstLevelGround(gameEngine));
    gameEngine.addEntity(new FirstLevelPlatform(gameEngine, Math.floor(gameWorld.width/8), Math.floor(gameWorld.height/1.3), gameWorld.width/4, 30));
    gameEngine.addEntity(new FirstLevelPlatform(gameEngine, gameWorld.width-(Math.floor(gameWorld.width/8))-gameWorld.width/4, Math.floor(gameWorld.height/1.3), gameWorld.width/4, 30));
    gameEngine.addEntity(new FirstLevelPlatform(gameEngine, gameWorld.width/6, gameWorld.height/1.6, gameWorld.width/6, 30));
    gameEngine.addEntity(new FirstLevelPlatform(gameEngine, gameWorld.width - (gameWorld.width/6)*2, gameWorld.height/1.6, gameWorld.width/6, 30));
    gameEngine.addEntity(new FirstLevelPlatform(gameEngine, gameWorld.width/2-(gameWorld.width/8), gameWorld.height/2, gameWorld.width/4, 30));
    gameEngine.addEntity(new Spaceship(gameEngine));
    
    gameEngine.init(ctx);
    gameEngine.start();
});