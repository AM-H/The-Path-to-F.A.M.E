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
    platform: [{ x: 0, y: gameWorld.height-70, width: gameWorld.width, height:70}, { x: Math.floor(gameWorld.width/8), y: Math.floor(gameWorld.height/1.3), width: gameWorld.width/4, height: 30}, { x: gameWorld.width-(Math.floor(gameWorld.width/8))-gameWorld.width/4, y:Math.floor(gameWorld.height/1.3), width: gameWorld.width/4, height: 30}, { x : gameWorld.width/6, y: gameWorld.height/1.6, width: gameWorld.width/6, height: 30}, { x: gameWorld.width - (gameWorld.width/6)*2, y: gameWorld.height/1.6, width: gameWorld.width/6, height: 30}, { x: gameWorld.width/2-(gameWorld.width/8), y: gameWorld.height/2, width: gameWorld.width/4, height: 30}],
    drones: [{ x: 221, y: 500, speed: 20}, {x: 43, y: 74, speed: 100}, { x: 20, y: 300, speed: 500}, { x: 222, y: 200, speed: 300}, { x: 500, y: 111, speed: 200}]
};

var levelTwo = {
    background: {
        x: 0,
        y: 0,
        width: gameWorld.width,
        height: gameWorld.height,
        path: `./levelBackgrounds/level2_background.png`
    },
    platform: [
        // Ground platform
        {
            x: 0,
            y: gameWorld.height - 70,
            width: gameWorld.width,
            height: 70,
            bColor: `#12121F`
        },
          // Left elevated platform (moved more left)
          {
            x: gameWorld.width/10,  // Changed from width/6 to width/12 to move it more left
            y: gameWorld.height/1.96,
            width: gameWorld.width/4,
            height: 30,
            bColor: `#616968`
        },
        // Middle platform
        {
            x: gameWorld.width/2 - gameWorld.width/8,
            y: gameWorld.height/1.38,
            width: gameWorld.width/4,
            height: 30,
            bColor: `#616968`
        },
        // Right elevated platform (moved more right)
        {
            x: gameWorld.width - (gameWorld.width/10) - gameWorld.width/4,  // Adjusting to move it more right
            y: gameWorld.height/1.96,
            width: gameWorld.width/4,
            height: 30,
            bColor: `#616968`
        }
    ],
    phoenixes: [
        { x: gameWorld.width - 250, y: 100, speed: 100},
        { x: gameWorld.width - 200, y: 130, speed: 130},
        { x: gameWorld.width - 300, y: 150, speed: 120},
        { x: gameWorld.width - 180, y: 180, speed: 110},
        { x: gameWorld.width - 220, y: 200, speed: 145}
    ]
};

var levelThree = {
    background: {
        x: 0,
        y: 0,
        width: gameWorld.width,
        height: gameWorld.height,
        path: `./levelBackgrounds/level3_background.png`
    },
    platform: [
        // Ground platform
        {
            x: 0,
            y: gameWorld.height - 140,
            width: gameWorld.width,
            height: 140,
            bColor: `#c4cddc`
        },
        // Left elevated platform (moved more left)
        {
            x: gameWorld.width/10,  // Changed from width/6 to width/12 to move it more left
            y: gameWorld.height/1.50,
            width: gameWorld.width/4,
            height: 30,
            bColor: `#37446e`
        },
        // Middle platform
        {
            x: gameWorld.width/2 - gameWorld.width/8,
            y: gameWorld.height/1.96,
            width: gameWorld.width/4,
            height: 30,
            bColor: `#37446e`
        },
        // Right elevated platform (moved more right)
        {
            x: gameWorld.width - (gameWorld.width/10) - gameWorld.width/4,  // Adjusted to move it more right
            y: gameWorld.height/2.50,
            width: gameWorld.width/4,
            height: 30,
            bColor: `#37446e`
        }
    ],
    spirits: [{ x: 221, speed: 0.5}, {x: 300, speed: 1}, {  x: gameWorld.width - (gameWorld.width/10) - gameWorld.width/4, speed: 1.5}, {x: gameWorld.width/2 - gameWorld.width/8, speed: 2}, { x: 500, speed: 3}]

};
var levelFour = {
    background: {
        x: 0,
        y: 0,
        width: gameWorld.width,
        height: gameWorld.height,
        path: `./levelBackgrounds/level4_background.png`
    },
    platform: [
        //ground floor
        {x: 0, y : gameWorld.height-25, width: gameWorld.width, height: 25, bColor: `#1f1323`},
        //left 2nd story platform
        {x: 0, y : 580, width: 180, height: 20, bColor: `#08e8d7`},
        //right 2nd story platform
        {x: gameWorld.width - 180, y: 580, width: 180, height: 20, bColor: `#08e8d7`},
        //middle 3rd story platform
        {x: gameWorld.width/2 - 110, y: 500, width: 220, height: 20, bColor: `#08e8d7`},
        //left 4th story platform
        {x: 200, y: 412, width: 180, height: 20, bColor: `#08e8d7`},
        //right 4th story platform
        {x: gameWorld.width-190*2, y: 412, width: 180, height: 20, bColor : `#08e8d7`},
        //left 5th story platform
        {x: 0, y: 244, width: 180, height: 20, bColor: `#08e8d7`},
        //right 5th story platform
        {x: gameWorld.width - 180, y: 244, width: 180, height: 20, bColor : `#08e8d7`},
        //middle 5th story platform
        {x: gameWorld.width/2 - 100, y: 244, width: 200, height: 20, bColor: `#08e8d7`}
    ]
};


