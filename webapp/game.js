const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const obstacleVideo = document.getElementById('obstacleVideo');
const dinoImage = new Image();
dinoImage.src = 'dino.png'; // Make sure it's the correct file name

const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const retryBtn = document.getElementById('retryBtn');

let gravity = 0.5;
let groundHeight = 40;
let isGameOver = false;
let score = 0;
let highScoreData = JSON.parse(localStorage.getItem('dinoHighScore')) || { score: 0, name: "Nobody" };
let speed = 12;
let speedIncrease = 0.002;
let frame = 0;

const obstacleSize = 80;
const dinoSize = 80;

let lastScoreShown = -1;

const videoBuffer = document.createElement('canvas');
videoBuffer.width = obstacleSize;
videoBuffer.height = obstacleSize;
const videoCtx = videoBuffer.getContext('2d');

highScoreDisplay.textContent = `High Score: ${highScoreData.score} (${highScoreData.name})`;

let citations = [];

fetch('./citations.json')
    .then(response => response.json())
    .then(data => {
        citations = data;
    })
    .catch(err => {
        console.error('Failed to load citations:', err);
    });

const dino = {
    x: 50,
    y: canvas.height - groundHeight - dinoSize,
    width: dinoSize,
    height: dinoSize,
    velocityY: 0,
    isJumping: false
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !dino.isJumping && !isGameOver) {
        dino.velocityY = -12;
        dino.isJumping = true;
    }
});

retryBtn.addEventListener('click', () => {
    resetGame();
});

const obstacles = [];
let nextObstacleFrame = 0;

function maybeSpawnObstacle() {
    if (frame >= nextObstacleFrame) {
        const minFrames = 60;  // 1 second at 60fps
        const maxFrames = 150; // up to 2.5 seconds
        const framesUntilNext = Math.floor(Math.random() * (maxFrames - minFrames)) + minFrames;
        nextObstacleFrame = frame + framesUntilNext;

        obstacles.push({
            x: canvas.width,
            y: canvas.height - groundHeight - obstacleSize,
            width: obstacleSize,
            height: obstacleSize,
        });
    }
}

function update() {
    frame++;
    score = Math.floor(frame / 5);

    if (score !== lastScoreShown) {
        scoreDisplay.textContent = `Score: ${score}`;
        lastScoreShown = score;
    }
    speed += speedIncrease;

    dino.velocityY += gravity;
    dino.y += dino.velocityY;

    if (dino.y >= canvas.height - groundHeight - dino.height) {
        dino.y = canvas.height - groundHeight - dino.height;
        dino.velocityY = 0;
        dino.isJumping = false;
    }

    maybeSpawnObstacle();

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= speed;

        // Remove off-screen obstacles
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            continue;
        }

        // Collision detection
        if (
            dino.x < obs.x + obs.width &&
            dino.x + dino.width > obs.x &&
            dino.y < obs.y + obs.height &&
            dino.y + dino.height > obs.y
        ) {
            endGame();
        }
    }
}

function draw() {
    canvas.width = canvas.width; // clear

    ctx.fillStyle = '#888';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

    ctx.drawImage(dinoImage, dino.x, dino.y, dino.width, dino.height);

    for (let obs of obstacles) {
        if (obstacleVideo.readyState >= 2) {
            ctx.drawImage(obstacleVideo, obs.x, obs.y, obs.width, obs.height);
        } else {
            ctx.fillStyle = '#000';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
    }

    if (isGameOver) {
        ctx.fillStyle = '#000';
        ctx.font = '24px sans-serif';
        ctx.fillText('Game Over!', canvas.width / 2 - 60, canvas.height / 2 - 20);
    }
}

let lastTime = 0;
const fpsInterval = 1000 / 60;

function loop(now) {
    if (!lastTime) lastTime = now;
    const elapsed = now - lastTime;

    if (elapsed > fpsInterval) {
        lastTime = now - (elapsed % fpsInterval);

        if (!isGameOver) {
            update();
        }
        draw();
    }

    requestAnimationFrame(loop);
}

function endGame() {
    isGameOver = true;
    retryBtn.style.display = 'inline';

    if (score > highScoreData.score) {
        const name = prompt(`New High Score! Enter your name:`) || 'Anonymous';
        highScoreData = { score, name };
        localStorage.setItem('dinoHighScore', JSON.stringify(highScoreData));
        highScoreDisplay.textContent = `High Score: ${score} (${name})`;
    }

    if (citations.length > 0) {
        const randomCitation = citations[Math.floor(Math.random() * citations.length)];
        const citationBox = document.getElementById('citationBox');
        const citationText = document.getElementById('citationText');
        const citationSource = document.getElementById('citationSource');

        citationText.textContent = `"${randomCitation.citation}"`;
        citationSource.href = randomCitation.source;
        citationSource.textContent = 'Source';

        citationBox.style.display = 'block';
    }
}

function resetGame() {
    score = 0;
    frame = 0;
    speed = 12;
    isGameOver = false;
    retryBtn.style.display = 'none';

    // const citationBox = document.getElementById('citationBox');
    // citationBox.style.display = 'none';

    dino.y = canvas.height - groundHeight - dino.height;
    dino.velocityY = 0;
    dino.isJumping = false;

    obstacles.length = 0;  // clear obstacles
    nextObstacleFrame = 0;

    requestAnimationFrame(loop);
}

dinoImage.onload = () => {
    if (obstacleVideo.readyState >= 2) {
        requestAnimationFrame(loop);
    } else {
        obstacleVideo.oncanplay = () => requestAnimationFrame(loop);
    }
};
