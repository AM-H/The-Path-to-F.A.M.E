var gameWorld = {
        width: 1024,
        height: 768
    };
var levelOne = {
    background: {
        x: 0,
        y: 0,
        width: gameWorld.width,
        height: gameWorld.height,
        path : `./levelBackgrounds/level1_background.png`
    },
    platform: [{ x: 0, y: gameWorld.height-70, width: gameWorld.width, height:70}, { x: Math.floor(gameWorld.width/8), y: Math.floor(gameWorld.height/1.3), width: gameWorld.width/4, height: 30}, { x: gameWorld.width-(Math.floor(gameWorld.width/8))-gameWorld.width/4, y:Math.floor(gameWorld.height/1.3), width: gameWorld.width/4, height: 30}, { x : gameWorld.width/6, y: gameWorld.height/1.6, width: gameWorld.width/6, height: 30}, { x: gameWorld.width - (gameWorld.width/6)*2, y: gameWorld.height/1.6, width: gameWorld.width/6, height: 30}, { x: gameWorld.width/2-(gameWorld.width/8), y: gameWorld.height/2, width: gameWorld.width/4, height: 30}]
};