const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const gravity = 0.6;
const groundHeight = 20;
let isGameOver = false;

// Dino player
const dino = {
  x: 50,
  y: canvas.height - groundHeight - 40,
  width: 40,
  height: 40,
  velocityY: 0,
  isJumping: false
};

// Obstacle
const obstacle = {
  x: canvas.width,
  y: canvas.height - groundHeight - 30,
  width: 20,
  height: 30,
  speed: 6
};

// Handle jump
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !dino.isJumping) {
    dino.velocityY = -12;
    dino.isJumping = true;
  }
});

function update() {
  // Apply gravity
  dino.velocityY += gravity;
  dino.y += dino.velocityY;

  // Ground collision
  if (dino.y >= canvas.height - groundHeight - dino.height) {
    dino.y = canvas.height - groundHeight - dino.height;
    dino.velocityY = 0;
    dino.isJumping = false;
  }

  // Move obstacle
  obstacle.x -= obstacle.speed;
  if (obstacle.x + obstacle.width < 0) {
    obstacle.x = canvas.width + Math.random() * 200;
  }

  // Collision detection
  if (
    dino.x < obstacle.x + obstacle.width &&
    dino.x + dino.width > obstacle.x &&
    dino.y < obstacle.y + obstacle.height &&
    dino.y + dino.height > obstacle.y
  ) {
    isGameOver = true;
  }
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ground
  ctx.fillStyle = '#888';
  ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

  // Draw dino
  ctx.fillStyle = '#0a0';
  ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

  // Draw obstacle
  ctx.fillStyle = '#a00';
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

  if (isGameOver) {
    ctx.fillStyle = '#000';
    ctx.font = '24px sans-serif';
    ctx.fillText('Game Over!', canvas.width / 2 - 60, canvas.height / 2);
  }
}

function loop() {
  if (!isGameOver) {
    update();
    draw();
    requestAnimationFrame(loop);
  } else {
    draw(); // Show final frame
  }
}

loop();
