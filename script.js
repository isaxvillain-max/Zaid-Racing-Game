// GET CANVAS AND CONTEXT
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const gameOverEl = document.getElementById('game-over');
const restartBtn = document.getElementById('restartBtn');

const bgMusic = document.getElementById('bgMusic');
const crashSound = document.getElementById('crashSound');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// GAME VARIABLES
const lanes = [50, 150, 250, 350]; // X positions for 4 lanes
const laneWidth = 80;

let player = {
    x: lanes[1], // start in lane 2
    y: canvasHeight - 120,
    width: 50,
    height: 100,
    speed: 10,
    img: new Image()
};

player.img.src = 'assets/player-car.png'; // Zaid car

let enemies = [];
let enemySpeed = 5;
let score = 0;
let gameRunning = true;

// KEY HANDLING
let keys = {};
document.addEventListener('keydown', (e) => { 
    keys[e.key] = true; 

    // Start background music on first key press (for autoplay policy)
    if(bgMusic.paused){
        bgMusic.volume = 0.3;
        bgMusic.play().catch(()=>{}); 
    }
});
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

// RESTART BUTTON
restartBtn.addEventListener('click', () => {
    resetGame();
});

// CREATE ENEMY CAR
function createEnemy() {
    const laneIndex = Math.floor(Math.random() * lanes.length);
    const enemyImg = new Image();
    const randomCar = Math.random() < 0.5 ? 'enemy-car1.png' : 'enemy-car2.png';
    enemyImg.src = 'assets/' + randomCar;

    enemies.push({
        x: lanes[laneIndex],
        y: -120,
        width: 50,
        height: 100,
        img: enemyImg
    });
}

// MOVE PLAYER
function movePlayer() {
    if (keys['ArrowLeft'] && player.x > lanes[0]) {
        player.x -= laneWidth;
        keys['ArrowLeft'] = false;
    }
    if (keys['ArrowRight'] && player.x < lanes[lanes.length - 1]) {
        player.x += laneWidth;
        keys['ArrowRight'] = false;
    }
}

// UPDATE ENEMIES
function updateEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += enemySpeed;

        // CHECK COLLISION
        if (player.x < enemies[i].x + enemies[i].width &&
            player.x + player.width > enemies[i].x &&
            player.y < enemies[i].y + enemies[i].height &&
            player.y + player.height > enemies[i].y) {
                gameOver();
        }

        // REMOVE ENEMY IF OUT OF SCREEN
        if (enemies[i].y > canvasHeight) {
            enemies.splice(i, 1);
            score++;
            scoreEl.textContent = "Score: " + score;
        }
    }
}

// DRAW EVERYTHING
function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // DRAW PLAYER
    ctx.drawImage(player.img, player.x, player.y, player.width, player.height);

    // DRAW ENEMIES
    enemies.forEach(enemy => {
        ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// GAME OVER
function gameOver() {
    gameRunning = false;
    crashSound.play();
    bgMusic.pause();
    gameOverEl.classList.remove('hidden');
}

// RESET GAME
function resetGame() {
    enemies = [];
    score = 0;
    scoreEl.textContent = "Score: 0";
    gameRunning = true;
    player.x = lanes[1];
    player.y = canvasHeight - 120;
    enemySpeed = 5;
    gameOverEl.classList.add('hidden');

    // Restart background music
    bgMusic.currentTime = 0;
    bgMusic.play().catch(()=>{});

    animate();
}

// MAIN ANIMATION LOOP
let frameCount = 0;
function animate() {
    if (!gameRunning) return;
    frameCount++;

    if (frameCount % 60 === 0) { // create enemy every 1 second approx
        createEnemy();
    }

    // gradually increase speed
    if (frameCount % 300 === 0) {
        enemySpeed += 1;
    }

    movePlayer();
    updateEnemies();
    draw();

    requestAnimationFrame(animate);
}

// START GAME
animate();

let touchStartX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

document.addEventListener('touchend', (e) => {
    let touchEndX = e.changedTouches[0].clientX;
    let deltaX = touchEndX - touchStartX;

    // Swipe threshold
    if (deltaX > 50) {
        // Swipe right
        if (player.x < lanes[lanes.length - 1]) player.x += laneWidth;
    } else if (deltaX < -50) {
        // Swipe left
        if (player.x > lanes[0]) player.x -= laneWidth;
    }
});
