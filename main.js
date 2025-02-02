const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();

// Detect if we're running on GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');
// Set the base path accordingly
const BASE_PATH = isGitHubPages ? '/The-Path-to-F.A.M.E' : '';

// Helper function to get correct asset path
function getAssetPath(path) {
    // Remove leading slash if present to avoid double slashes
    path = path.startsWith('/') ? path.slice(1) : path;
    return `${BASE_PATH}/${path}`;
}

// Queue all assets with proper paths
// Background
ASSET_MANAGER.queueDownload(getAssetPath('levelBackgrounds/level1_background.png'));

// Drone and bullet
ASSET_MANAGER.queueDownload(getAssetPath('sprites/drone.png'));
ASSET_MANAGER.queueDownload(getAssetPath('sprites/bullet.png'));

// Aziel Seraph sprites
ASSET_MANAGER.queueDownload(getAssetPath('sprites/IdleRightAziel.png'));
ASSET_MANAGER.queueDownload(getAssetPath('sprites/IdleLeftAziel.png'));
ASSET_MANAGER.queueDownload(getAssetPath('sprites/moveRightAziel.png'));
ASSET_MANAGER.queueDownload(getAssetPath('sprites/moveLeftAziel.png'));
ASSET_MANAGER.queueDownload(getAssetPath('sprites/HolyDiverRight.png'));
ASSET_MANAGER.queueDownload(getAssetPath('sprites/HolyDiverLeft.png'));

// Boss sprites
ASSET_MANAGER.queueDownload(getAssetPath('sprites/BossIdleR.png'));
ASSET_MANAGER.queueDownload(getAssetPath('sprites/BossIdleL.png'));
ASSET_MANAGER.queueDownload(getAssetPath('sprites/BossWalkL.png'));
ASSET_MANAGER.queueDownload(getAssetPath('sprites/BossWalkR.png'));
ASSET_MANAGER.queueDownload(getAssetPath('sprites/BossAttackR.png'));
ASSET_MANAGER.queueDownload(getAssetPath('sprites/BossAttackL.png'));

// Export the getAssetPath function to make it available to other modules
window.getAssetPath = getAssetPath;

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