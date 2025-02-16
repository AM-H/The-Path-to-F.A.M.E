const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload(`./levelBackgrounds/TitleScreen.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/PLAYbutton.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/SelectPlayerScreen.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/level1_background.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/youdied.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/playagainbutton.png`);

ASSET_MANAGER.queueDownload(`./audio/YouSeeBIGGIRLT_T.mp3`);

ASSET_MANAGER.queueDownload(`./levelBackgrounds/level2_background.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/level3_background.png`)
// ASSET_MANAGER.queueDownload(`./sprites/idleLeft.png`);
// ASSET_MANAGER.queueDownload(`./sprites/idleRight.png`);
// ASSET_MANAGER.queueDownload(`./sprites/runLeft.png`);
// ASSET_MANAGER.queueDownload(`./sprites/runRight.png`);
// ASSET_MANAGER.queueDownload(`./sprites/attack1Right.png`);
// ASSET_MANAGER.queueDownload(`./sprites/attack1Left.png`);
// ASSET_MANAGER.queueDownload(`./sprites/attack2Right.png`);
// ASSET_MANAGER.queueDownload(`./sprites/attack2Left.png`);
// ASSET_MANAGER.queueDownload(`./sprites/bullet.png`);
ASSET_MANAGER.queueDownload(`./sprites/drone.png`);
ASSET_MANAGER.queueDownload(`./sprites/bullet.png`);



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
ASSET_MANAGER.queueDownload(`./sprites/LongRangeGrim.png`);
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


ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	
	gameEngine.addEntity(new TitleScreen(gameEngine));
	ASSET_MANAGER.adjustVolume(document.getElementById("myVolume").value/100);
	console.log(document.getElementById("myVolume").value/100);
	gameEngine.init(ctx);

	gameEngine.start();
});
