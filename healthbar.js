class HealthBar {
    constructor(agent) {
        Object.assign(this, { agent });
    };

    update() {
       
    };

    draw(ctx) {
            var ratio = this.agent.hitpoints / this.agent.maxhitpoints;
            ctx.strokeStyle = "Black";
            ctx.fillStyle = ratio < 0.2 ? "Red" : ratio < 0.5 ? "Yellow" : "Green";
            const healthBarX = this.agent.x - this.agent.radius + 15;
            const healthBarY = this.agent.y - this.agent.box.height / 5; // Moves health bar above

            ctx.fillRect(healthBarX, healthBarY, this.agent.radius * 2 * ratio, 4);
            ctx.strokeRect(healthBarX, healthBarY, this.agent.radius * 2, 4);

    };
};
