class HealthBar {
    constructor(agent) {
        Object.assign(this, { agent });
        this.removeFromWorld = false;
    }

    update() {
        if (this.agent.hitpoints < 0) {
            this.agent.hitpoints = 0;
        }
    }

    draw(ctx) {
        const ratio = Math.max(0, Math.min(1, this.agent.hitpoints / this.agent.maxhitpoints));

        // Handle player characters
        if (this.agent instanceof AzielSeraph || this.agent instanceof Grim || this.agent instanceof Kanji) {
            ctx.fillStyle = "#3a3a3a";  // Dark gray
            ctx.fillRect(10, 10, 200, 30);

            // Draw health fill
            if (ratio > 0) {
                const fillWidth = Math.floor(200 * ratio);
                ctx.fillStyle = ratio > 0.5 ? "#32CD32" : ratio > 0.2 ? "#FFD700" : "#FF4500";
                ctx.fillRect(10, 10, fillWidth, 30);
            }

            // Draw border
            ctx.strokeStyle = "Black";
            ctx.lineWidth = 2;
            ctx.strokeRect(10, 10, 200, 30);

        } else if (this.agent instanceof Eclipser || this.agent instanceof Shizoku || this.agent instanceof inferno) {
            const barX = gameWorld.width - 210;

            // Draw dark background first
            ctx.fillStyle = "#3a3a3a";  // Dark gray
            ctx.fillRect(barX, 10, 200, 30);

            // Draw health fill
            if (ratio > 0) {
                const fillWidth = Math.floor(200 * ratio);
                ctx.fillStyle = ratio > 0.5 ? "#32CD32" : ratio > 0.2 ? "#FFD700" : "#FF4500";
                ctx.fillRect(barX, 10, fillWidth, 30);
            }

            // Draw border
            ctx.strokeStyle = "Black";
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, 10, 200, 30);

        } else {
            // For other entities like drones
            // Make sure we have the necessary properties before rendering
            if (!this.agent.radius || !this.agent.box) return;

            const healthBarX = this.agent.x - this.agent.radius + 27;
            const healthBarY = this.agent.y - this.agent.box.height / 5;

            // Draw dark background
            ctx.fillStyle = "#3a3a3a";
            ctx.fillRect(healthBarX, healthBarY, this.agent.radius * 2, 4);

            // Draw health fill
            if (ratio > 0) {
                const fillWidth = Math.floor(this.agent.radius * 2 * ratio);
                ctx.fillStyle = ratio > 0.5 ? "#32CD32" : ratio > 0.2 ? "#FFD700" : "#FF4500";
                ctx.fillRect(healthBarX, healthBarY, fillWidth, 4);
            }

            // Draw border
            ctx.strokeStyle = "Black";
            ctx.lineWidth = 1;
            ctx.strokeRect(healthBarX, healthBarY, this.agent.radius * 2, 4);
        }
    }
}