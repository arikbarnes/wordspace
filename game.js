const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const backgroundMusic = document.getElementById('backgroundMusic');
const shootSound = document.getElementById('shootSound');
const explosionSound = document.getElementById('explosionSound');
const startScreen = document.getElementById('startScreen');
const submitButton = document.getElementById('submitButton');
const startButton = document.getElementById('startButton');
const usernameInput = document.getElementById('username');
const welcomeMessage = document.getElementById('welcomeMessage');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ship = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 70,
  width: 50,
  height: 50,
  dx: 10, // שינוי מהירות החללית
  dy: 5,
  img: new Image()
};
ship.img.src = 'ship.png'; // ודא שהקובץ 'ship.png' נמצא בתיקיית הפרויקט

ship.img.onload = () => {
  submitButton.addEventListener('click', submitName);
  startButton.addEventListener('click', startGame);
}

let bullets = [];
let levels = [
  ["חתול", "כלבה", "סוסה", "ציפור", "פרפרה"],  // Level 1
  ["אדומה", "כחולה", "ירוקה", "צהובה", "סגולה"],  // Level 2
  ["רופא", "רופאה", "מורה", "שוטרת", "כבאית"],  // Level 3
  ["מכונית", "אופניים", "אוטובוס", "רכבת", "מטוס"],  // Level 4
  ["תפוח", "בננה", "תפוז", "ענבה", "מלון"],  // Level 5
  ["מחשב", "טלפון", "טאבלט", "מדפסת", "מסך"],  // Level 6
  ["שולחן", "כיסא", "מיטה", "ארון", "מראה"],  // Level 7
  ["מים", "חלב", "מיץ", "תה", "קפה"],  // Level 8
  ["ספר", "עיתון", "מגזין", "מחברת", "עט"],  // Level 9
  ["גיטרה", "פסנתר", "כינור", "תופים", "חצוצרה"]  // Level 10
];
let currentLevel = 0;
let currentWord = levels[currentLevel][Math.floor(Math.random() * levels[currentLevel].length)];
let wordIndex = 0;
let asteroids = [];
let keys = {};
let musicStarted = false;
let playerName = '';
let correctLetters = [];
let score = 0;
let lives = 3;

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('touchend', handleTouchEnd, false);

let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchMove(e) {
  const touch = e.touches[0];
  const touchX = touch.clientX;
  const touchY = touch.clientY;

  if (touchX < touchStartX) {
    ship.x -= ship.dx;
  } else if (touchX > touchStartX) {
    ship.x += ship.dx;
  }

  touchStartX = touchX;
  touchStartY = touchY;
}

function handleTouchEnd(e) {
  bullets.push({ x: ship.x + ship.width / 2 - 2.5, y: ship.y });
  shootSound.play();
}

function submitName() {
  playerName = usernameInput.value.trim();
  let message = '';

  if (playerName === 'הדר') {
    message = 'אה, האהובה ביותר על אריק';
  } else if (playerName === 'תמר') {
    message = 'הו, הבכורה המופלאה בעולם!';
  } else if (playerName === 'עומר') {
    message = 'שדונת של אבא!';
  } else {
    message = 'אחלה שם יש לך, כמו של הדג שלי';
  }

  welcomeMessage.textContent = message;
  startButton.style.display = 'block';
}

function startGame() {
  startScreen.style.display = 'none';
  canvas.style.display = 'block';
  backgroundMusic.play();
  musicStarted = true;
  correctLetters = [];
  createAsteroids();
  gameLoop();
}

function createAsteroids() {
  asteroids = []; // לנקות את רשימת האסטרואידים
  for (let i = 0; i < currentWord.length; i++) {
    let x = Math.random() * (canvas.width - 30);
    let y = -Math.random() * canvas.height;
    asteroids.push({ x: x, y: y, letter: currentWord[i], hit: false });
  }
}

function drawShip() {
  ctx.drawImage(ship.img, ship.x, ship.y, ship.width, ship.height);
}

function drawAsteroids() {
  for (let asteroid of asteroids) {
    ctx.fillStyle = asteroid.hit ? 'green' : 'red';
    ctx.beginPath();
    ctx.arc(asteroid.x, asteroid.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillText(asteroid.letter, asteroid.x - 5, asteroid.y + 5);
  }
}

function updateAsteroids() {
  for (let asteroid of asteroids) {
    asteroid.y += 1;
    if (asteroid.y > canvas.height) {
      asteroid.y = -20; // החזרת האסטרואיד למעלה
    }
  }
}

function drawBullets() {
  ctx.fillStyle = 'yellow';
  for (let bullet of bullets) {
    ctx.fillRect(bullet.x, bullet.y, 5, 10);
  }
}

function updateBullets() {
  for (let bullet of bullets) {
    bullet.y -= 5;
  }
  bullets = bullets.filter(bullet => bullet.y > 0);
}

function checkCollision() {
  for (let i = 0; i < asteroids.length; i++) {
    for (let j = 0; j < bullets.length; j++) {
      if (bullets[j].x > asteroids[i].x - 20 &&
          bullets[j].x < asteroids[i].x + 20 &&
          bullets[j].y > asteroids[i].y - 20 &&
          bullets[j].y < asteroids[i].y + 20) {
        if (asteroids[i].letter === currentWord[wordIndex]) {
          asteroids[i].hit = true;
          bullets.splice(j, 1);
          explosionSound.play();
          correctLetters.push(currentWord[wordIndex]);
          wordIndex++;
          if (wordIndex === currentWord.length) {
            score += 10;
            wordIndex = 0;
            currentLevel++;
            if (currentLevel < levels.length) {
              currentWord = levels[currentLevel][Math.floor(Math.random() * levels[currentLevel].length)];
              createAsteroids();
              alert(`${getCompletionMessage()}, ${playerName}!`);
            } else {
              alert(`Congratulations, ${playerName}! You've completed all levels!`);
              document.location.reload();
            }
          }
          break;
        } else {
          bullets.splice(j, 1);
          break;
        }
      }
    }
  }
}

function getCompletionMessage() {
  const messages = ["עברת שלב", "אלופה", "אלופה", "וואלק, כוכבת את"];
  return messages[Math.floor(Math.random() * messages.length)];
}

function updateShip() {
  if (keys['ArrowLeft'] && ship.x > 0) ship.x -= ship.dx;
  if (keys['ArrowRight'] && ship.x < canvas.width - ship.width) ship.x += ship.dx;
  if (keys[' '] || keys['Spacebar']) {
    bullets.push({ x: ship.x + ship.width / 2 - 2.5, y: ship.y });
    shootSound.play();
    keys[' '] = false; // Prevents holding down the space key to shoot continuously
  }
}

function drawWord() {
  ctx.font = '24px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(currentWord.split('').reverse().join(''), canvas.width / 2 - 50, canvas.height - 10);
}

function drawScore() {
  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Lives: ${lives}`, 20, 60);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
  clearCanvas();
  drawShip();
  drawAsteroids();
  updateAsteroids();
  drawBullets();
  updateBullets();
  updateShip();
  checkCollision();
  drawWord();
  drawScore();
  requestAnimationFrame(gameLoop);
}

// עדכון המידות של הקאנבס כאשר חלון הדפדפן משנה את גודלו
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
