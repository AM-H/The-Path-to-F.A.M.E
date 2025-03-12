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
ASSET_MANAGER.queueDownload(`./levelBackgrounds/YouWonScreen.png`);


ASSET_MANAGER.queueDownload(`./levelBackgrounds/level2_background.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/level3_background.png`);
ASSET_MANAGER.queueDownload(`./levelBackgrounds/level4_background.png`);
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
ASSET_MANAGER.queueDownload(`./sprites/stormSpirit/idleRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/stormSpirit/idleLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/stormSpirit/runRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/stormSpirit/runLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/stormSpirit/attackRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/stormSpirit/attackLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/stormSpirit/knockBack.png`);

// fire phoenixes fixing deployment
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


ASSET_MANAGER.queueDownload(`./sprites/kanji/slashRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/slashLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/slashDown.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/slashUp.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/bottomRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/bottomLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/topLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/kanji/topRight.png`);


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
ASSET_MANAGER.queueDownload(`./sprites/inferno/tornadoCastLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/inferno/tornadoCastRight.png`);  

//Special move
ASSET_MANAGER.queueDownload(`./sprites/tornado/projectile.png`);
ASSET_MANAGER.queueDownload(`./sprites/tornado/part2final.png`);


//Grim
ASSET_MANAGER.queueDownload(`./sprites/GrimRunningL.png`);
ASSET_MANAGER.queueDownload(`./sprites/GrimRunningR.png`);
ASSET_MANAGER.queueDownload(`./sprites/GrimIdleL.png`);
ASSET_MANAGER.queueDownload(`./sprites/GrimIdleR.png`);

//audio
ASSET_MANAGER.queueDownload(`./audio/YouSeeBIGGIRLT_T.mp3`);
ASSET_MANAGER.queueDownload(`./audio/level1Music.mp3`);
ASSET_MANAGER.queueDownload(`./audio/level2Music.mp3`);
ASSET_MANAGER.queueDownload(`./audio/level3Music.mp3`);
ASSET_MANAGER.queueDownload(`./audio/level4Music.mp3`)
ASSET_MANAGER.queueDownload(`./audio/stopTime.mp3`);
ASSET_MANAGER.queueDownload(`./audio/barrageClash.mp3`);
ASSET_MANAGER.queueDownload(`./audio/normal_attack.mp3`);
ASSET_MANAGER.queueDownload(`./audio/fireball_windup.mp3`);
ASSET_MANAGER.queueDownload(`./audio/tornado_impact.mp3`);

//KyraBlade
ASSET_MANAGER.queueDownload(`./sprites/kyrablade/RunRightKyra.png`);
ASSET_MANAGER.queueDownload(`./sprites/kyrablade/RunLeftKyra.png`);
ASSET_MANAGER.queueDownload(`./sprites/kyrablade/ThrowRightKyra.png`);
ASSET_MANAGER.queueDownload(`./sprites/kyrablade/ThrowLeftKyra.png`);
ASSET_MANAGER.queueDownload(`./sprites/kyrablade/shuriken.png`);
ASSET_MANAGER.queueDownload(`./sprites/kyrablade/kyraIdleLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/kyrablade/kyraIdleRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/kyrablade/kyraAttackLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/kyrablade/kyraAttackRight.png`);


//Eclipser
ASSET_MANAGER.queueDownload(`./sprites/eclipser/idleR.png`);
ASSET_MANAGER.queueDownload(`./sprites/eclipser/idleL.png`);
ASSET_MANAGER.queueDownload(`./sprites/eclipser/walkR.png`);
ASSET_MANAGER.queueDownload(`./sprites/eclipser/walkL.png`);
ASSET_MANAGER.queueDownload(`./sprites/eclipser/laser.png`);

//Levaith Draconis
ASSET_MANAGER.queueDownload(`./sprites/leviathDraconis/LeviathDraconisIdleRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/leviathDraconis/LeviathDraconisIdleLeft.png`);
ASSET_MANAGER.queueDownload(`./sprites/leviathDraconis/LeviathDraconisRight.png`);
ASSET_MANAGER.queueDownload(`./sprites/leviathDraconis/LeviathDraconisLeft.png`);

//Chronos Veil
ASSET_MANAGER.queueDownload(`./sprites/chronosVeil/ChronosVeilRight.png`)
ASSET_MANAGER.queueDownload(`./sprites/chronosVeil/ChronosVeilLeft.png`)
ASSET_MANAGER.queueDownload(`./sprites/chronosVeil/ChronosVeilLaserRight.png`)
ASSET_MANAGER.queueDownload(`./sprites/chronosVeil/ChronosVeilLaserLeft.png`)

//Scorching Eye
ASSET_MANAGER.queueDownload(`./sprites/eye/Eye.png`)
ASSET_MANAGER.queueDownload(`./sprites/eye/effect.png`)

//fireball image 
for (let i = 0; i <= 60; i++) {
    ASSET_MANAGER.queueDownload(`./sprites/MinionFire/1_${i}.png`);
}
//deployment
ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById(`gameWorld`);
	const ctx = canvas.getContext(`2d`);

	gameEngine.addEntity(new TitleScreen(gameEngine));
	ASSET_MANAGER.adjustVolume(document.getElementById(`myVolume`).value/100);
	console.log(document.getElementById(`myVolume`).value/100);
	gameEngine.init(ctx);

	gameEngine.start();
});
