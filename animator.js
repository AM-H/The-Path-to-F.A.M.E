class Animator {
    constructor(spritesheet, xStart, yStart, width, height, frameCount, frameDuration, vertical=false) {
        Object.assign(this, { spritesheet, xStart, yStart, width, height, frameCount, frameDuration, vertical });

        this.elapsedTime = 0;
        this.totalTime = frameCount * frameDuration;
    }

    drawFrame(tick, ctx, x, y, scale, vertical=false) {
        this.elapsedTime += tick;
        if (this.elapsedTime > this.totalTime) {
            this.elapsedTime -= this.totalTime;
        }

        let frame = this.currentFrame();

        let frameX, frameY;

        if (this.vertical) {
            // For vertical spritesheets, calculate the y-coordinate for the frame
            frameX = this.xStart;
            frameY = this.yStart + this.height * frame;
        } else {
            // For horizontal spritesheets, calculate the x-coordinate for the frame
            frameX = this.xStart + this.width * frame;
            frameY = this.yStart;
        }


        ctx.drawImage(
            this.spritesheet,
            frameX, frameY,
            this.width, this.height,
            x, y,
            this.width * scale, this.height * scale
        );
    }

    currentFrame() {
        return Math.floor(this.elapsedTime / this.frameDuration);
    }

    isDone() {
        return this.elapsedTime >= this.totalTime;
    }
}