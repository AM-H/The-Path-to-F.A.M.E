// This game shell was happily modified from Googler Seth Ladd`s "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        this.entities = [];

        // Information on the input
        this.click = null;
        this.mouseX = null;
        this.mouseY = null;
        this.wheel = null;
        this.keys = {};

        this.jump = false;
        this.left = false;
        this.right = false;
        this.closeAttack = false;
        this.rangeAttack = false;

        this.debugMode = false;
        this.invincibleMode = false;
        this.isPaused = false;
        this.lastKeys = {}; // For tracking key state changes

        this.showControls = false;

        this.isGameOver = false;


        // Options and the Details
        this.options = options || {
            debugging: false,
        };
        
    };

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer = new Timer();
    };

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    };

    startInput() {
        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });


        // const helpButton = document.getElementById('helpButton');
        // if (helpButton) {
        //     helpButton.addEventListener('click', () => {
        //         this.showControls = !this.showControls;
        //         this.isPaused = this.showControls;
        //     });
        // }

        
        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.options.debugging) {
                console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouseX = getXandY(e).x;
            this.mouseY = getXandY(e).y;
        });

        // this.ctx.canvas.addEventListener("click", e => {
        //     if (this.options.debugging) {
        //         console.log("CLICK", getXandY(e));
        //     }
        //     this.click = getXandY(e);
        //     this.closeAttack = true;
        // });

        this.ctx.canvas.addEventListener("mousedown", e => {
            if (this.options.debugging) {
                console.log("CLICK", getXandY(e));
            }
            this.click = getXandY(e);
            switch (e.button) {
                case 0:
                    this.closeAttack = true;
                    break;
                case 2 :
                    this.rangeAttack = true;
                    break;
            }
        });

        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.options.debugging) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            e.preventDefault(); // Prevent Scrolling
            this.wheel = e;
        });

        this.ctx.canvas.addEventListener("keydown", e => {
            switch (e.code) {
                case "KeyA":
                    this.left = true;
                    break;
                case "KeyD":
                    this.right = true;
                    break;
                case "Space":
                    this.jump = true;
                    break;
                case "KeyB": // for debug
                    this.keys["KeyB"] = true;
                    break;
                case "KeyI":  //for invincibility 
                    this.keys["KeyI"] = true;
                    break;
                case "KeyP": //for pausing
                    this.keys["KeyP"] = true;
                    break;

                case "KeyH":
                    this.keys["KeyH"] = true;
                    break;

                
            }

        }); 
        this.ctx.canvas.addEventListener("keyup", e => {
            switch (e.code) {
                case "KeyA":
                    this.left = false;
                    break;
                case "KeyD":
                    this.right = false;
                    break;
                case "Space":
                    this.jump = false;
                    break;
                case "KeyB":   // for debug
                    this.keys["KeyB"] = false;
                    break;
                case "KeyI":  //for invincibility 
                    this.keys["KeyI"] = false;
                    break;
                case "KeyP": //for pausing
                    this.keys["KeyP"] = false;
                    break;
                case "KeyH": // for help menu
                    this.keys["KeyH"] = false;
                    break;
            }

        }); 

        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.options.debugging) {
                console.log("RIGHT_CLICK", getXandY(e));
            }
            e.preventDefault(); // Prevent Context Menu
            this.rightclick = getXandY(e);
        });

        this.ctx.canvas.addEventListener("mouseup", e => {
            switch (e.button) {
                case 0:
                    this.closeAttack = false;
                    break;
                case 2 :
                    this.rangeAttack = false;
                    break;
            }
        });
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    draw() {
        // Clear the whole canvas with transparent color (rgba(0, 0, 0, 0))
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
        // First draw the background (Spaceship)
        const background = this.entities.find(entity => entity instanceof Background);
        if (background) {
            background.draw(this.ctx, this);
        }
    
        // Then draw everything else
        for (let i = this.entities.length - 1; i >= 0; i--) {
            if (!(this.entities[i] instanceof Background)) {
                this.entities[i].draw(this.ctx, this);
            }
        }

        // Draw custom crosshair
    if (this.mouseX && this.mouseY) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = `white`;  // Outer white line
        this.ctx.lineWidth = 3;
        
        // Horizontal line
        this.ctx.moveTo(this.mouseX - 15, this.mouseY);
        this.ctx.lineTo(this.mouseX - 5, this.mouseY);
        this.ctx.moveTo(this.mouseX + 5, this.mouseY);
        this.ctx.lineTo(this.mouseX + 15, this.mouseY);
        
        // Vertical line
        this.ctx.moveTo(this.mouseX, this.mouseY - 15);
        this.ctx.lineTo(this.mouseX, this.mouseY - 5);
        this.ctx.moveTo(this.mouseX, this.mouseY + 5);
        this.ctx.lineTo(this.mouseX, this.mouseY + 15);
        
        this.ctx.stroke();

        // Draw inner black outline
        this.ctx.beginPath();
        this.ctx.strokeStyle = `black`;
        this.ctx.lineWidth = 1;
        
        // Redraw the same lines slightly smaller
        this.ctx.moveTo(this.mouseX - 15, this.mouseY);
        this.ctx.lineTo(this.mouseX - 5, this.mouseY);
        this.ctx.moveTo(this.mouseX + 5, this.mouseY);
        this.ctx.lineTo(this.mouseX + 15, this.mouseY);
        
        this.ctx.moveTo(this.mouseX, this.mouseY - 15);
        this.ctx.lineTo(this.mouseX, this.mouseY - 5);
        this.ctx.moveTo(this.mouseX, this.mouseY + 5);
        this.ctx.lineTo(this.mouseX, this.mouseY + 15);
        
        this.ctx.stroke();

        // Draw center dot dont like
        // this.ctx.beginPath();
        // this.ctx.fillStyle = `red`;
        // this.ctx.arc(this.mouseX, this.mouseY, 2, 0, Math.PI * 2);
        // this.ctx.fill();
        }
   
    };

    update() {

        let entitiesCount = this.entities.length;

            // Toggle debug mode with B key
        if (this.keys["KeyB"] && !this.lastKeys["KeyB"]) {
            this.debugMode = !this.debugMode;
            console.log("Debug mode:", this.debugMode ? "ON" : "OFF");
        }
        
        // Toggle invincibility with I key
        if (this.keys["KeyI"] && !this.lastKeys["KeyI"]) {
            this.invincibleMode = !this.invincibleMode;
            console.log("Invincibility mode:", this.invincibleMode ? "ON" : "OFF");
        }
        
        // Toggle pause with P key
        if (this.keys["KeyP"] && !this.lastKeys["KeyP"]) {
            this.isPaused = !this.isPaused;
            console.log("Game " + (this.isPaused ? "paused" : "resumed"));
        }
        
        // Save current key state for next frame
        this.lastKeys = {...this.keys};
        
        // Skip the rest of update if paused
        if (this.isPaused || this.showControls) return;

        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }

        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }

        
    };

    

    loop() {
        if (!this.isGameOver) {
            this.clockTick = this.timer.tick();
            this.update();
            this.draw();

             // Draw pause overlay if paused
        if (this.isPaused) {
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            
            this.ctx.font = "30px Arial";
            this.ctx.fillStyle = "white";
            this.ctx.textAlign = "center";
            this.ctx.fillText("PAUSED", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
            this.ctx.fillText("Press P to Resume", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 40);
        }
        
        // Draw debug info if debug mode is on
        if (this.debugMode || this.invincibleMode) {
            this.ctx.font = "14px Arial";
            this.ctx.fillStyle = "white";
            this.ctx.textAlign = "left";
            
            // Create background for text
            this.ctx.fillStyle = "rgba(0,0,0,0.5)";
            this.ctx.fillRect(10, 10, 200, 50);
            
            this.ctx.fillStyle = "white";
            this.ctx.fillText("Debug Mode: " + (this.debugMode ? "ON" : "OFF") + " (B)", 20, 30);
            this.ctx.fillText("Invincibility: " + (this.invincibleMode ? "ON" : "OFF") + " (I)", 20, 50);
        }
        if (this.showControls) {
            // Draw semi-transparent background
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            
            // Draw panel
            this.ctx.fillStyle = "#222";
            const panelWidth = 500;
            const panelHeight = 400;
            const panelX = (this.ctx.canvas.width - panelWidth) / 2;
            const panelY = (this.ctx.canvas.height - panelHeight) / 2;
            this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
            this.ctx.strokeStyle = "#FFF";
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
            
            // Title
            this.ctx.font = "30px Arial";
            this.ctx.fillStyle = "#FFF";
            this.ctx.textAlign = "center";
            this.ctx.fillText("GAME CONTROLS", this.ctx.canvas.width / 2, panelY + 40);
            
            // Controls text
            this.ctx.font = "18px Arial";
            this.ctx.textAlign = "left";
            const controlsX = panelX + 50;
            let controlsY = panelY + 90;
            const lineHeight = 30;
            
            const controls = [
                "Movement: A (left), D (right)",
                "Jump: Space",
                "Melee Attack: Left Mouse Button (hold)",
                "Range Attack: Right Mouse Button (click)",
                "Debug Mode (Show Boxes): B",
                "Invincibility Mode: I",
                "Pause Game: P",
                "Toggle Controls: H or click ? icon"
            ];
            
            controls.forEach(control => {
                this.ctx.fillText(control, controlsX, controlsY);
                controlsY += lineHeight;
            });
            
            // Special note for debug controls
            this.ctx.font = "16px Arial";
            this.ctx.fillStyle = "#AAA";
            this.ctx.fillText("* Debug controls are for development purposes only", controlsX, controlsY + 20);
            
            // Close button instructions
            this.ctx.font = "18px Arial";
            this.ctx.fillStyle = "#FFF";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Click Anywhere on the Game to Close", this.ctx.canvas.width / 2, panelY + panelHeight - 30);
            
            // Click anywhere to close
            if (this.closeAttack) {
                this.showControls = false;
                this.isPaused = false; // Resume game when closing controls
            }
        }
    }
    };

};

// KV Le was here :)