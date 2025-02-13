class GameOver {

    constructor (game) {
        this.game = game;
        this.removeFromWorld = false;
        this.display();
    }

    display() {
        const gameOverImage = document.createElement("img");
        gameOverImage.id = "gameOverImage";
        gameOverImage.src = "./levelBackgrounds/youdied.png"; 
        gameOverImage.style.position = "fixed";
        gameOverImage.style.top = "50%";
        gameOverImage.style.left = "50%";
        gameOverImage.style.transform = "translate(-50%, -50%)";
        gameOverImage.style.width = "300px"; 
        gameOverImage.style.height = "auto"; 
        gameOverImage.style.zIndex = "1000";

        const retryButton = document.createElement("img");
        retryButton.id = "retryButton";
        retryButton.src = "./levelBackgrounds/playagainbutton.png";
        retryButton.style.position = "fixed";
        retryButton.style.top = "58%";
        retryButton.style.left = "50%";
        retryButton.style.transform = "translate(-50%, -50%)"; 
        retryButton.style.width = "150px";
        retryButton.style.height = "auto"; 
        retryButton.style.cursor = "pointer";
        retryButton.style.zIndex = "1001"; 
        retryButton.onclick = () => {
            location.reload();
        };

        document.body.appendChild(gameOverImage);
        document.body.appendChild(retryButton);
    }

    update() {

    }

    draw(ctx) {

    }
}