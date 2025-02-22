const gameEngine = new GameEngine();

window.gameEngine = gameEngine;



const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload(`./levelBackgrounds/TitleScreen.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/PLAYbutton.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/SelectPlayerScreen.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/transitionScreen.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/level1_background.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/youdied.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/playagainbutton.png`);

ASSET_MANAGER.queueDownload(`./audio/YouSeeBIGGIRLT_T.mp3`);

ASSET_MANAGER.queueDownload(`./levelBackgrounds/level2_background.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/level3_background.png`)
// ASSET_MANAGER.queueDownload(`./sprites/IdleLeft.png`);
// ASSET_MANAGER.queueDownload(`./sprites/IdleRight.png`);
// ASSET_MANAGER.queueDownload(`./sprites/runLeft.png`);
// ASSET_MANAGER.queueDownload(`./sprites/runRight.png`);
// ASSET_MANAGER.queueDownload(`./sprites/attack1Right.png`);
// ASSET_MANAGER.queueDownload(`./sprites/attack1Left.png`);
// ASSET_MANAGER.queueDownload(`./sprites/attack2Right.png`);
// ASSET_MANAGER.queueDownload(`./sprites/attack2Left.png`);
// ASSET_MANAGER.queueDownload(`./sprites/bullet.png`);
ASSET_MANAGER.queueDownload(`./sprites/drone.png`);
ASSET_MANAGER.queueDownload(`./sprites/bullet.png`);

//storm spirits
ASSET_MANAGER.queueDownload(`./sprites/stormSpirit/IdleRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/stormSpirit/IdleLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/stormSpirit/runRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/stormSpirit/runLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/stormSpirit/attackRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/stormSpirit/attackLeft.png`);

// fire phoenixes
ASSET_MANAGER.queueDownload(`./sprites/phoenixes/IdleRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/phoenixes/IdleLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/phoenixes/runRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/phoenixes/runLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/phoenixes/attackRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/phoenixes/attackLeft.png`);


//azielseraph

ASSET_MANAGER.queueDownload(`./sprites/IdleRightAziel.png`);
ASSET_MANAGER.queueDownload(`./sprites/IdleLeftAziel.png`);
ASSET_MANAGER.queueDownload(`./sprites/moveRightAziel.png`);
ASSET_MANAGER.queueDownload(`./sprites/moveLeftAziel.png`);
ASSET_MANAGER.queueDownload(`./sprites/HolyDiverRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/HolyDiverLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/HolyDiverRangeRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/LaserHolyDiverRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/LaserHolyDiverLeft.png`);

//Grim

ASSET_MANAGER.queueDownload(`./sprites/GrimIdleL.png`);
ASSET_MANAGER.queueDownload(`./sprites/GrimIdleR.png`);
ASSET_MANAGER.queueDownload(`./sprites/GrimRunningL.png`);
ASSET_MANAGER.queueDownload(`./sprites/GrimRunningR.png`);
ASSET_MANAGER.queueDownload(`./sprites/LongRangeGrimR.png`);
ASSET_MANAGER.queueDownload(`./sprites/LongRangeGrimL.png`);
ASSET_MANAGER.queueDownload(`./sprites/GrimAxeR.png`);
ASSET_MANAGER.queueDownload(`./sprites/GrimAxeL.png`);



//Kanji
ASSET_MANAGER.queueDownload(`./sprites/kanji/attackRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/attackLeft1.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/IdleLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/IdleRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/runRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/runLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/jumpLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/jumpRight.png`);


//Boss
ASSET_MANAGER.queueDownload(`./sprites/BossIdleR.png`);
ASSET_MANAGER.queueDownload(`./sprites/BossIdleL.png`);

ASSET_MANAGER.queueDownload(`./sprites/BossWalkL.png`);
ASSET_MANAGER.queueDownload(`./sprites/BossWalkR.png`);

ASSET_MANAGER.queueDownload(`./sprites/BossAttackL.png`);
ASSET_MANAGER.queueDownload(`./sprites/BossAttackR.png`);


//Shizoku
ASSET_MANAGER.queueDownload(`./sprites/Shizoku/IdleRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/Shizoku/IdleLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/Shizoku/runRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/Shizoku/runLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/Shizoku/attackRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/Shizoku/attackLeft.png`);


//inferno
ASSET_MANAGER.queueDownload(`./sprites/inferno/IdleRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/inferno/IdleLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/inferno/runRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/inferno/runLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/inferno/attackRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/inferno/attackLeft.png`);


//Grim
ASSET_MANAGER.queueDownload(`./sprites/GrimRunningL.png`);
ASSET_MANAGER.queueDownload(`./sprites/GrimRunningR.png`);
ASSET_MANAGER.queueDownload(`./sprites/GrimIdleL.png`);
ASSET_MANAGER.queueDownload(`./sprites/GrimIdleR.png`);

ASSET_MANAGER.queueDownload(`./audio/YouSeeBIGGIRLT_T.mp3`);
ASSET_MANAGER.queueDownload(`./audio/level1Music.mp3`);
ASSET_MANAGER.queueDownload(`./audio/level2Music.mp3`);

//KyraBlade
ASSET_MANAGER.queueDownload(`./sprites/kyrablade/IdleRightKyra.png`);

//Eclipser
ASSET_MANAGER.queueDownload(`./sprites/eclipser/idleR.png`);
ASSET_MANAGER.queueDownload(`./sprites/eclipser/idleL.png`);
ASSET_MANAGER.queueDownload(`./sprites/eclipser/walkR.png`);
ASSET_MANAGER.queueDownload(`./sprites/eclipser/walkL.png`);
ASSET_MANAGER.queueDownload(`./sprites/eclipser/laser.png`);

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	// const aziel = new AzielSeraph(gameEngine);
	// gameEngine.addEntity(aziel);
	// gameEngine.addEntity(new HolyDiver(gameEngine, aziel));
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
	// gameEngine.addEntity(new Platform(gameEngine, 0, gameWorld.height-70, gameWorld.width, 70));
	// gameEngine.addEntity(new Platform(gameEngine, Math.floor(gameWorld.width/8), Math.floor(gameWorld.height/1.3), gameWorld.width/4, 30));
	// gameEngine.addEntity(new Platform(gameEngine, gameWorld.width-(Math.floor(gameWorld.width/8))-gameWorld.width/4, Math.floor(gameWorld.height/1.3), gameWorld.width/4, 30));
	// gameEngine.addEntity(new Platform(gameEngine, gameWorld.width/6, gameWorld.height/1.6, gameWorld.width/6, 30));
	// gameEngine.addEntity(new Platform(gameEngine, gameWorld.width - (gameWorld.width/6)*2, gameWorld.height/1.6, gameWorld.width/6, 30));
	// gameEngine.addEntity(new Platform(gameEngine, gameWorld.width/2-(gameWorld.width/8), gameWorld.height/2, gameWorld.width/4, 30));
	// gameEngine.addEntity(new Background(gameEngine, 0, 0, gameWorld.width, gameWorld.height, `./levelBackgrounds/level1_background.png`));
	gameEngine.addEntity(new TitleScreen(gameEngine));
	ASSET_MANAGER.adjustVolume(document.getElementById("myVolume").value/100);
	console.log(document.getElementById("myVolume").value/100);
	gameEngine.init(ctx);

	gameEngine.start();
});
