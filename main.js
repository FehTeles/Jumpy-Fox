// Variáveis do canvas
let board;
let boardWidth = 364;
let boardHeight = 585;
let context;

// Variáveis do jogo
let foxWidth = 48;
let foxHeight = 48;
let foxX = boardWidth / 2 - foxWidth / 2;
let foxY = boardHeight * 7 / 8 - foxHeight;
let foxJumpImg;
let foxFallImg;

// Áudio
let backgroundMusic = new Audio("sounds/background.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

let jumpSound = new Audio("sounds/jump.mp3");

// Variáveis da física
let velocityX = 0;
let velocityY = 0;
let gravity = 0.4;
let jumpStrength = -10;

// Objeto Foxy
let fox = {
    img: null,
    x: foxX,
    y: foxY,
    width: foxWidth,
    height: foxHeight,
    direction: 1,
};

// Plataformas
let platforms = [];
let platformWidth = 48;
let platformHeight = 15;
let platImg;

// Pontuação
let score = 0;

// Estado do jogo
let gameStarted = false;
let gameOverScreen = false;

// Som
let muted = false;

// Posição do mouse
let mouseX = foxX + foxWidth / 2;

// Carregar o jogo
window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    foxJumpImg = new Image();
    foxJumpImg.src = "image/foxy_jump.png";
    fox.img = foxJumpImg;

    foxFallImg = new Image();
    foxFallImg.src = "image/foxy_fall.png";

    platImg = new Image();
    platImg.src = "image/platform.png";

    placePlatforms();
    drawStartScreen();

    requestAnimationFrame(update);
};

function update() {
    requestAnimationFrame(update);

    if (!gameStarted) return; 

    context.clearRect(0, 0, boardWidth, boardHeight);

    let tolerance = 2;
    let foxCenterX = fox.x + fox.width / 2;

    if (mouseX > foxCenterX + tolerance) {
        velocityX = 4;
        fox.direction = 1;
    } else if (mouseX < foxCenterX - tolerance) {
        velocityX = -4;
        fox.direction = -1;
    } else {
        velocityX = 0;
    }

    fox.x += velocityX;

    if (fox.x > boardWidth) fox.x = 0 - fox.width;
    else if (fox.x + fox.width < 0) fox.x = boardWidth - fox.width;

    velocityY += gravity;
    fox.y += velocityY;

    for (let i = 0; i < platforms.length; i++) {
        let p = platforms[i];

        if (fox.y < boardHeight * 3 / 4 && velocityY < 0) {
            p.y -= velocityY;
        }

        if (
            fox.x + fox.width > p.x && fox.x < p.x + p.width &&
            fox.y + fox.height > p.y && fox.y + fox.height - velocityY <= p.y
        ) {
            fox.y = p.y - fox.height;
            velocityY = jumpStrength;

            if (!muted) {
                jumpSound.currentTime = 0;
                jumpSound.play();
            }
        }

        context.drawImage(p.img, p.x, p.y, p.width, p.height);
    }

    while (platforms.length > 0 && platforms[0].y >= boardHeight) {
        platforms.shift();
        newPlatform();
    }

    if (fox.y > boardHeight || fox.y + fox.height < 0) {
        showGameOverScreen();
        return;
    }

    fox.img = velocityY < 0 ? foxJumpImg : foxFallImg;

    context.save();
    context.translate(fox.x + fox.width / 2, fox.y + fox.height / 2);
    context.scale(fox.direction, 1);
    context.drawImage(fox.img, -fox.width / 2, -fox.height / 2, fox.width, fox.height);
    context.restore();

    updateScore();

    context.fillStyle = "white";
    context.font = "24px 'Jersey 15'";
    context.fillText("Score: " + score, 50, 20);

    context.font = "24px 'Jersey 15'";
    context.fillText(muted ? "🔇 Mute (M)" : "🔊 Som (M)", boardWidth - 60, 20);
}

function placePlatforms() {
    platforms = [];
    let platform = {
        img: platImg,
        x: boardWidth / 2 - platformWidth / 2,
        y: boardHeight - 50,
        width: platformWidth,
        height: platformHeight
    };
    platforms.push(platform);

    for (let i = 0; i < 6; i++) {
        let randomx = Math.floor(Math.random() * boardWidth * 3 / 4);
        let platform = {
            img: platImg,
            x: randomx,
            y: boardHeight - 75 * i - 150,
            width: platformWidth,
            height: platformHeight
        };
        platforms.push(platform);
    }
}

function newPlatform() {
    let randomx = Math.floor(Math.random() * boardWidth * 3 / 4);
    let platform = { img: platImg, x: randomx, y: -platformHeight, width: platformWidth, height: platformHeight };
    platforms.push(platform);
}

document.addEventListener("mousemove", (e) => {
    const rect = board.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
});

// Função que inicia o jogo
function startGame() {
    if (gameStarted) return;

    if (!muted) {
        backgroundMusic.play().catch(err => console.warn("Erro ao iniciar música:", err));
    }

    gameStarted = true;
    gameOverScreen = false;
    resetGame();
}

// Função que mostra a tela de Game Over
function showGameOverScreen() {
    gameStarted = false;
    gameOverScreen = true;

    drawGameOverScreen();

    document.addEventListener("keydown", restartFromGameOver, { once: true });
    document.addEventListener("click", restartFromGameOver, { once: true });
}

function restartFromGameOver() {
    gameOverScreen = false;
    startGame();
}

function resetGame() {
    fox.x = foxX;
    fox.y = foxY;
    velocityX = 0;
    velocityY = 0;
    score = 0;
    placePlatforms();
}

function updateScore() {
    if (velocityY < 0) score += 1;
}

function drawStartScreen() {
    context.clearRect(0, 0, boardWidth, boardHeight);
    context.fillStyle = "#7c3f58";
    context.fillRect(0, 0, boardWidth, boardHeight);

    context.fillStyle = "white";
    context.font = "30px 'Jersey 15'";
    context.textAlign = "center";
    context.fillText("Pressione qualquer tecla", boardWidth / 2, boardHeight / 2 - 10);
    context.fillText("ou clique para começar!", boardWidth / 2, boardHeight / 2 + 20);

    document.addEventListener("keydown", startGame, { once: true });
    document.addEventListener("click", startGame, { once: true });
}

// Nova tela de Game Over
function drawGameOverScreen() {
  document.fonts.ready.then(() => {
    context.clearRect(0, 0, boardWidth, boardHeight);
    context.fillStyle = "#7c3f58";
    context.fillRect(0, 0, boardWidth, boardHeight);

    context.textAlign = "center";

    // Título
    context.fillStyle = "red";
    context.font = "40px 'Jersey 15'";
    context.fillText("Game Over!", boardWidth / 2, boardHeight / 2 - 20);

    // Pontuação
    context.fillStyle = "white";
    context.font = "24px 'Jersey 15'";
    context.fillText("Sua pontuação: " + score, boardWidth / 2, boardHeight / 2 + 10);

    // Instruções
    context.fillText("Aperte qualquer tecla", boardWidth / 2, boardHeight / 2 + 120);
    context.fillText("para jogar novamente", boardWidth / 2, boardHeight / 2 + 150);
  });
}


// 🔇 Tecla M para mutar/desmutar sons
document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "m") {
        muted = !muted;

        backgroundMusic.muted = muted;
        jumpSound.muted = muted;

        if (!muted && gameStarted) {
            backgroundMusic.play().catch(() => {});
        }
    }
});
