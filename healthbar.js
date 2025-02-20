class HealthBar {
    constructor(agent) {
        Object.assign(this, { agent });
        this.removeFromWorld= false;
    };

    update() {
       
    };

    draw(ctx) {
            let ratio = this.agent.hitpoints / this.agent.maxhitpoints;
            ctx.strokeStyle = "Black";
            ctx.fillStyle = ratio < 0.2 ? "Red" : ratio < 0.5 ? "Yellow" : "Green";
            const healthBarX = this.agent.x - this.agent.radius + 27;
            const healthBarY = this.agent.y - this.agent.box.height / 5; 
            if (this.agent instanceof AzielSeraph) {
                ctx.fillRect(10, 10, 200 * ratio, 30);
                ctx.strokeRect(10, 10, 200, 30);
            } else if (this.agent instanceof Eclipser || this.agent instanceof  Shizoku || this.agent instanceof  inferno) {
                ctx.fillRect(gameWorld.width-210, 10, 200 * ratio, 30);
                ctx.strokeRect(gameWorld.width-210, 10, 200, 30);
            } else {
                ctx.fillRect(healthBarX, healthBarY, this.agent.radius * 2 * ratio, 4);
                ctx.strokeRect(healthBarX, healthBarY, this.agent.radius * 2, 4);
            }

    };
}
