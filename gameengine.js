// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

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
        this.ctx.strokeStyle = 'white';  // Outer white line
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
        this.ctx.strokeStyle = 'black';
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
        // this.ctx.fillStyle = 'red';
        // this.ctx.arc(this.mouseX, this.mouseY, 2, 0, Math.PI * 2);
        // this.ctx.fill();
    }
    };


    update() {
        let entitiesCount = this.entities.length;

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
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    };

};

// KV Le was here :)