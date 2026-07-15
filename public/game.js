// ======================================
// CANVAS
// ======================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ======================================
// ELEMENT HTML
// ======================================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

const aiBtn = document.getElementById("aiBtn");

const menu = document.getElementById("menu");
const playBtn = document.getElementById("playBtn");

const gameOverPanel = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");

const scoreText = document.getElementById("score");
const finalScore = document.getElementById("finalScore");
const bestScore = document.getElementById("bestScore");
const highScoreHud = document.getElementById("highScoreHud");

const pauseBtn = document.getElementById("pauseBtn");

// ======================================
// AUDIO
// ======================================

const jumpSound = document.getElementById("jumpSound");
const pointSound = document.getElementById("pointSound");
const hitSound = document.getElementById("hitSound");

// ======================================
// GAME VARIABLE
// ======================================

let ready = true;
let gameStarted = false;
let gameOver = false;
let paused = false;
let aiMode = false;
let gameTime = 0;

let score = 0;

let birdFrame = 0;
let birdTimer = 0;

// ======================================
// BACKGROUND
// ======================================

const cloudImg = new Image();

cloudImg.src = "assets/cloud.png";

let cloudX = 0;

const bg = new Image();
bg.src = "assets/bg.jpg";

const ground = new Image();
ground.src = "assets/ground.png";

highScoreHud.innerHTML =
    localStorage.getItem("highscore") || 0;

let groundX = 0;
let bgX = 0;

// ======================================
// PIPE
// ======================================

const pipeImg = new Image();
pipeImg.src = "assets/pipe.png";

const pipes = [];

const PIPE_WIDTH = 80;
const PIPE_GAP = 190;
const PIPE_SPEED = 3.5;
// ======================================
// BIRD IMAGE
// ======================================

const birdUp = new Image();
birdUp.src = "assets/bird_up.png";

const birdMid = new Image();
birdMid.src = "assets/bird_mid.png";

const birdDown = new Image();
birdDown.src = "assets/bird_down.png";

// ======================================
// BIRD
// ======================================

const bird = {
    x: 120,
    y: 250,

    width: 45,
    height: 35,
    velocity: 0,
    gravity: 0.5,
    jumpPower: -9,
    rotation: 0

};
// ======================================
// START GAME
// ======================================

playBtn.onclick = () => {

    aiMode = false;
    menu.style.display = "none";
    ready = false;
    gameStarted = true;

}

aiBtn.onclick = () => {

    aiMode = true;
    menu.style.display = "none";
    ready = false;
    gameStarted = true;

}

//AI Controller
function updateAI() {

    if (!aiMode) return;

    if (pipes.length === 0) return;

    // cari pipa terdekat
    let target = null;

    for (const pipe of pipes) {

        if (pipe.x + PIPE_WIDTH > bird.x) {

            target = pipe;

            break;

        }

    }

    if (!target) return;

    // posisi tengah celah
    const targetY =
        target.top + PIPE_GAP / 2;

    // jika burung di bawah target
    if (bird.y + bird.height / 2 > targetY + 10) {

        birdJump();

    }

}

// ======================================
// RESTART
// ======================================

restartBtn.onclick = () => {
    location.reload();
};

// ======================================
// PAUSE
// ======================================

pauseBtn.onclick = () => {
    paused = !paused;
    pauseBtn.innerHTML = paused ? "Resume" : "Pause";
};

// ======================================
// JUMP
// ======================================

function birdJump() {

    bird.velocity = bird.jumpPower;

    jumpSound.currentTime = 0;

    jumpSound.play();

}

function jump() {
    if (gameOver) return;
    if (paused) return;

    // Jika game belum dimulai
    if (!gameStarted) {
        gameStarted = true;
        ready = false;
        menu.style.display = "none";
    }

    birdJump();
}

document.addEventListener("keydown", (e) => {
    switch (e.code) {
        case "Space":
            e.preventDefault();
            jump();
            break;

        case "KeyP":
            e.preventDefault();
            togglePause();
            break;
    }
});

canvas.addEventListener("mousedown", jump);
canvas.addEventListener("touchstart", jump);

// ======================================
// CREATE PIPE
// ======================================

function createPipe() {

    const minHeight = 80;

    const maxHeight =
        canvas.height -
        PIPE_GAP -
        180;

    const topHeight =
        Math.random() *
        (maxHeight - minHeight)
        + minHeight;

    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: topHeight + PIPE_GAP,
        scored: false
    });

}
// ======================================
// UPDATE BIRD
// ======================================

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Batasi kecepatan jatuh
    if (bird.velocity > 10) {
        bird.velocity = 10;
    }

    // Rotasi mengikuti kecepatan
    bird.rotation = bird.velocity * 4;

    // Maksimal menghadap atas
    if (bird.rotation < -25) {
        bird.rotation = -25;
    }

    // Maksimal menghadap bawah
    if (bird.rotation > 90) {
        bird.rotation = 90;
    }
}

function updateBirdAnimation() {

    birdTimer++;

    if (birdTimer >= 8) {

        birdTimer = 0;

        birdFrame++;

        if (birdFrame > 2) {
            birdFrame = 0;
        }

    }

}

// ======================================
// UPDATE PIPE
// ======================================

function updatePipes() {

    if (pipes.length === 0) {
        createPipe();
    }

    const lastPipe =
        pipes[pipes.length - 1];

        if (lastPipe.x < canvas.width - 280) {
            createPipe();
        }

    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= PIPE_SPEED;
    }

    if (pipes.length > 0 &&
        pipes[0].x < -PIPE_WIDTH) {
        pipes.shift();
    }
}

// ======================================
// DRAW PIPE
// ======================================

function drawPipes() {
    for (const pipe of pipes) {

        // PIPE ATAS
        ctx.save();

        ctx.translate(
            pipe.x + PIPE_WIDTH / 2,
            pipe.top / 2
        );

        ctx.scale(1, -1);

        ctx.drawImage(
            pipeImg,
            -PIPE_WIDTH / 2,
            -pipe.top / 2,
            PIPE_WIDTH,
            pipe.top
        );

        ctx.restore();

        // PIPE BAWAH

        ctx.drawImage(
            pipeImg,
            pipe.x,
            pipe.bottom,
            PIPE_WIDTH,
            canvas.height
            - pipe.bottom
            - 100
        );
    }
}
// ======================================
// DRAW BIRD
// ======================================

function drawBird() {

    let currentBird;

    if (birdFrame === 0) {

        currentBird = birdUp;

    } else if (birdFrame === 1) {

        currentBird = birdMid;

    } else {

        currentBird = birdDown;

    }

    ctx.save();

    ctx.translate(
        bird.x + bird.width / 2,
        bird.y + bird.height / 2
    );

    ctx.rotate(
        bird.rotation * Math.PI / 180
    );

    ctx.drawImage(
        currentBird,
        -bird.width / 2,
        -bird.height / 2,
        bird.width,
        bird.height
    );

    ctx.restore();

}

// ======================================
// DRAW BACKGROUND
// ======================================

function drawBackground() {

    if (bg.complete) {

        ctx.drawImage(
            bg,
            0,
            0,
            canvas.width,
            canvas.height
        );

    } else {

        ctx.fillStyle = "#70c5ce";
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

    }

}

// ======================================
// DRAW GROUND
// ======================================

function drawGround() {

    if (gameStarted && !paused && !gameOver) {
        groundX -= PIPE_SPEED;
    }

    if (groundX <= -canvas.width) {
        groundX = 0;
    }

    if (ground.complete) {

        ctx.drawImage(
            ground,
            groundX,
            canvas.height - 100,
            canvas.width,
            100
        );

        ctx.drawImage(
            ground,
            groundX + canvas.width,
            canvas.height - 100,
            canvas.width,
            100
        );

    } else {

        ctx.fillStyle = "#ded895";
        ctx.fillRect(
            0,
            canvas.height - 100,
            canvas.width,
            100
        );
    }
}

// ======================================
// DRAW SCORE
// ======================================

function drawScore() {
    scoreText.innerHTML = score;
}

// ======================================
// COLLISION
// ======================================

function checkCollision() {

    // Atas layar
    if (bird.y < 0) {
        endGame();
    }

    // Tanah
    if (
        bird.y + bird.height >=
        canvas.height - 100
    ) {
        endGame();
    }

    for (const pipe of pipes) {
        const hitX =
            bird.x + bird.width >
            pipe.x &&
            bird.x <
            pipe.x + PIPE_WIDTH;
        const hitTop =
            bird.y < pipe.top;
        const hitBottom =
            bird.y + bird.height >
            pipe.bottom;

        if (
            hitX &&
            (hitTop || hitBottom)
        ) {
            endGame();
        }
    }
}

// ======================================
// SCORE
// ======================================

function updateScore() {
    for (const pipe of pipes) {
        if (
            !pipe.scored &&
            bird.x >
            pipe.x + PIPE_WIDTH
        ) {
            pipe.scored = true;
            score++;
            scoreText.innerHTML = score;

            pointSound.currentTime = 0;
            pointSound.play();
        }
    }
}

// ======================================
// GAME OVER
// ======================================

function endGame() {
    if (gameOver) return;
    gameOver = true;
    hitSound.play();
    finalScore.innerHTML = score;

    let high =
        localStorage.getItem(
            "highscore"
        );

    if (high === null) {
        high = 0;
    }

    if (score > high) {
        high = score;
        localStorage.setItem(
            "highscore",
            high
        );
    }

    bestScore.innerHTML = high;
    highScoreHud.innerHTML = high;
    const medal = document.createElement("h5");
    medal.classList.add("medalText");
    medal.innerHTML =
        "Rank : " +
        getMedal(score);

    gameOverPanel.appendChild(medal);

    gameOverPanel.style.display =
        "flex";
}

//DRAW CLOUD
function drawCloud() {
    if (gameStarted && !paused && !gameOver) {
        cloudX -= 0.5;
    }

    if (cloudX <= -canvas.width) {
        cloudX = 0;
    }

    ctx.drawImage(
        cloudImg,
        cloudX,
        40,
        canvas.width,
        150
    );

    ctx.drawImage(
        cloudImg,
        cloudX + canvas.width,
        40,
        canvas.width,
        150
    );
}

function drawReady() {
    if (!ready) return;
    ctx.fillStyle = "rgba(0,0,0,.25)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";

    // ctx.fillText(
    //     "GET READY",
    //     canvas.width / 2,
    //     180
    // );

    ctx.font = "24px Arial";

    // ctx.fillText(
    //     "SPACE : Jump / Start",
    //     canvas.width / 2,
    //     230
    // );

    ctx.font = "20px Arial";

    // ctx.fillText(
    //     "P : Pause / Resume",
    //     canvas.width / 2,
    //     270
    // );
}

function getMedal(score) {

    if(score >= 40)
        return "MASTER";

    if(score >= 30)
        return "EXPERT";

    if(score >= 20)
        return "PRO";

    if(score >= 10)
        return "ROOKIE";

    return "BEGINNER";
}

function drawPause() {

    if (!paused) return;

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "60px Teko";
    ctx.textAlign = "center";

    ctx.fillText(
        "PAUSED",
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.font = "18px 'Press Start 2P'";

    ctx.fillText(
        "Press P to Resume",
        canvas.width / 2,
        canvas.height / 2 + 45
    );
}
// ======================================
// PAUSE
// ======================================

function togglePause() {

    if (!gameStarted) return;
    if (gameOver) return;

    paused = !paused;

    pauseBtn.innerHTML = paused ? "Resume" : "Pause";

}

pauseBtn.onclick = togglePause;

// ======================================
// GAME LOOP
// ======================================

function gameLoop() {
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawBackground();
    drawCloud();

    if (gameStarted) {
        if (!paused && !gameOver) {
            gameTime++;

            updateAI();
            updateBird();
            updateBirdAnimation();
            updatePipes();
            checkCollision();
            updateScore();

        }
    }

    drawPipes();
    drawBird();
    drawGround();
    drawScore();
    drawReady();
    drawPause();

    requestAnimationFrame(gameLoop);
}

gameLoop();