// --- DINO GAME LOGIC ---
let gameInterval;
let gameCanvas, gameCtx;
let dino = { x: 50, y: 150, width: 30, height: 30, dy: 0, jumpPower: -12, gravity: 0.8, grounded: true };
let obstacles = [];
let coins = [];
let bullets = [];
let powerups = [];
let gameScore = 0;
let coinCount = 0;
let gameSpeed = 5;
let isGameRunning = false;
let lives = 3;
let ammo = 0;
let invulnerable = 0;

function openGame() {
    // Fecha modal de pergunta
    const askModalEl = document.getElementById('askGameModal');
    const askModal = bootstrap.Modal.getInstance(askModalEl);
    if(askModal) askModal.hide();

    // Abre modal do jogo
    const gameModal = new bootstrap.Modal(document.getElementById('gameModal'));
    gameModal.show();
    
    // Inicia jogo após animação
    setTimeout(startGame, 500);
}

function initGame() {
    gameCanvas = document.getElementById('gameCanvas');
    gameCtx = gameCanvas.getContext('2d');
    
    // Controles
    const handleInput = (e) => {
        if (!isGameRunning) return;
        
        // Pulo (Espaço ou Toque)
        if (e.type === 'touchstart' || e.type === 'mousedown' || (e.type === 'keydown' && e.code === 'Space')) {
            if(e.type === 'keydown') e.preventDefault();
            jump();
        }
        
        // Tiro (Tecla F ou Enter)
        if (e.type === 'keydown' && (e.key === 'f' || e.key === 'F' || e.key === 'Enter')) {
            shoot();
        }
    };

    document.addEventListener('keydown', handleInput);
    gameCanvas.addEventListener('touchstart', handleInput);
    gameCanvas.addEventListener('mousedown', handleInput);
}

function jump() {
    if (dino.grounded) {
        dino.dy = dino.jumpPower;
        dino.grounded = false;
        playSound('click'); 
    }
}

function shoot() {
    if (ammo > 0) {
        ammo--;
        bullets.push({ x: dino.x + 30, y: dino.y + 15, width: 10, height: 4 });
        playSound('click'); // Som de tiro (reusando click por enquanto)
    } else {
        // Som de sem munição?
    }
}

function startGame() {
    if (!gameCanvas) initGame();
    
    // Reset
    dino.y = 150;
    dino.dy = 0;
    dino.grounded = true;
    obstacles = [];
    coins = [];
    bullets = [];
    powerups = [];
    gameScore = 0;
    coinCount = 0;
    gameSpeed = 5;
    lives = 3;
    ammo = 5; // Começa com 5 tiros
    invulnerable = 0;
    isGameRunning = true;
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, 20);
}

function stopGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
}

function updateGame() {
    if(!isGameRunning) return;

    // Clear & Background
    gameCtx.fillStyle = '#1e1e2e';
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Stars
    gameCtx.fillStyle = '#fff';
    if(Math.random() < 0.1) gameCtx.fillRect(Math.random()*600, Math.random()*100, 2, 2);

    // Chão Neon
    gameCtx.beginPath();
    gameCtx.moveTo(0, 180);
    gameCtx.lineTo(600, 180);
    gameCtx.strokeStyle = '#89b4fa';
    gameCtx.lineWidth = 3;
    gameCtx.shadowBlur = 10;
    gameCtx.shadowColor = '#89b4fa';
    gameCtx.stroke();
    gameCtx.shadowBlur = 0;

    // HUD (Vidas e Munição)
    gameCtx.font = '20px Arial';
    gameCtx.fillStyle = '#f38ba8';
    gameCtx.fillText("❤️".repeat(lives), 10, 30);
    gameCtx.fillStyle = '#89b4fa';
    gameCtx.fillText(`🔫 ${ammo}`, 10, 60);
    gameCtx.fillStyle = '#f9e2af';
    gameCtx.fillText(`🪙 ${coinCount}`, 10, 90);

    // Dino Physics
    dino.dy += dino.gravity;
    dino.y += dino.dy;

    if (dino.y > 150) {
        dino.y = 150;
        dino.dy = 0;
        dino.grounded = true;
    }

    // Draw Dino (Blinking if invulnerable)
    if (invulnerable > 0) {
        invulnerable--;
        if (Math.floor(Date.now() / 100) % 2 === 0) return; // Pisca
    }

    gameCtx.fillStyle = '#cba6f7';
    gameCtx.shadowBlur = 15;
    gameCtx.shadowColor = '#cba6f7';
    gameCtx.fillRect(dino.x, dino.y, dino.width, dino.height);
    gameCtx.shadowBlur = 0;
    gameCtx.fillStyle = '#1e1e2e';
    gameCtx.fillRect(dino.x + 20, dino.y + 5, 5, 5);

    // --- SPAWNERS ---
    // Obstacles (Ground & Air)
    if (Math.random() < 0.015) {
        if (obstacles.length === 0 || (600 - obstacles[obstacles.length-1].x > 250)) {
             const isAir = Math.random() > 0.7;
             obstacles.push({ 
                 x: 600, 
                 y: isAir ? 100 : 160, // Aéreo ou Chão
                 width: 20, 
                 height: 20,
                 type: isAir ? 'drone' : 'spike'
             });
        }
    }

    // Powerups (Ammo & Health)
    if (Math.random() < 0.005) {
        const type = Math.random() > 0.7 ? 'health' : 'ammo';
        powerups.push({ x: 600, y: 120, width: 20, height: 20, type: type });
    }

    // Coins
    if (Math.random() < 0.01) {
        coins.push({ x: 600, y: 100 + Math.random() * 40, width: 15, height: 15 });
    }

    // --- UPDATES ---
    
    // Bullets
    for (let i = 0; i < bullets.length; i++) {
        let b = bullets[i];
        b.x += 10;
        gameCtx.fillStyle = '#f9e2af';
        gameCtx.fillRect(b.x, b.y, b.width, b.height);

        // Hit Enemy
        for (let j = 0; j < obstacles.length; j++) {
            let obs = obstacles[j];
            if (
                b.x < obs.x + obs.width &&
                b.x + b.width > obs.x &&
                b.y < obs.y + obs.height &&
                b.y + b.height > obs.y
            ) {
                // Destroy Enemy
                obstacles.splice(j, 1);
                bullets.splice(i, 1);
                gameScore += 50;
                playSound('magic'); // Explosion sound
                i--;
                break;
            }
        }
    }
    bullets = bullets.filter(b => b.x < 600);

    // Powerups
    for (let i = 0; i < powerups.length; i++) {
        let p = powerups[i];
        p.x -= gameSpeed;

        // Draw
        gameCtx.font = '20px Arial';
        gameCtx.fillText(p.type === 'health' ? '❤️' : '🔫', p.x, p.y + 20);

        // Collision
        if (
            dino.x < p.x + p.width &&
            dino.x + dino.width > p.x &&
            dino.y < p.y + p.height &&
            dino.y + dino.height > p.y
        ) {
            if (p.type === 'health') {
                if(lives < 3) lives++;
            } else {
                ammo += 5;
            }
            playSound('magic');
            powerups.splice(i, 1);
            i--;
        }
    }
    powerups = powerups.filter(p => p.x > -50);

    // Coins
    for (let i = 0; i < coins.length; i++) {
        let c = coins[i];
        c.x -= gameSpeed;
        
        gameCtx.beginPath();
        gameCtx.arc(c.x + 7, c.y + 7, 8, 0, Math.PI * 2);
        gameCtx.fillStyle = '#f9e2af';
        gameCtx.fill();
        gameCtx.strokeStyle = '#fab387';
        gameCtx.stroke();

        if (
            dino.x < c.x + c.width &&
            dino.x + dino.width > c.x &&
            dino.y < c.y + c.height &&
            dino.y + dino.height > c.y
        ) {
            coins.splice(i, 1);
            coinCount++;
            gameScore += 100;
            playSound('magic');
            i--;
        }
    }
    coins = coins.filter(c => c.x > -50);

    // Obstacles
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.x -= gameSpeed;

        // Draw
        if (obs.type === 'drone') {
            // Drone (Red Triangle)
            gameCtx.fillStyle = '#f38ba8';
            gameCtx.beginPath();
            gameCtx.moveTo(obs.x, obs.y);
            gameCtx.lineTo(obs.x + 20, obs.y + 10);
            gameCtx.lineTo(obs.x, obs.y + 20);
            gameCtx.fill();
            // Eye
            gameCtx.fillStyle = '#fff';
            gameCtx.fillRect(obs.x + 5, obs.y + 8, 4, 4);
        } else {
            // Spike
            gameCtx.fillStyle = '#f38ba8';
            gameCtx.beginPath();
            gameCtx.moveTo(obs.x, obs.y + obs.height);
            gameCtx.lineTo(obs.x + obs.width/2, obs.y);
            gameCtx.lineTo(obs.x + obs.width, obs.y + obs.height);
            gameCtx.fill();
        }

        // Collision Player
        if (invulnerable === 0 &&
            dino.x < obs.x + obs.width - 5 &&
            dino.x + dino.width > obs.x + 5 &&
            dino.y < obs.y + obs.height &&
            dino.y + dino.height > obs.y
        ) {
            lives--;
            playSound('error');
            invulnerable = 60; // ~1.2 seconds
            
            if (lives <= 0) {
                stopGame();
                gameCtx.fillStyle = 'rgba(30, 30, 46, 0.9)';
                gameCtx.fillRect(0, 0, 600, 200);
                
                gameCtx.fillStyle = '#f38ba8';
                gameCtx.font = 'bold 30px Arial';
                gameCtx.textAlign = 'center';
                gameCtx.fillText("GAME OVER", 300, 90);
                
                gameCtx.fillStyle = '#fff';
                gameCtx.font = '20px Arial';
                gameCtx.fillText(`Score: ${Math.floor(gameScore/10)}`, 300, 130);
                gameCtx.fillText(`Coins: ${coinCount}`, 300, 160);
            }
        }
    }
    obstacles = obstacles.filter(obs => obs.x > -50);

    // Score & Speed
    gameScore++;
    if(gameScore % 300 === 0) gameSpeed += 0.5;
    
    document.getElementById('gameScore').innerHTML = `Score: ${Math.floor(gameScore / 10)}`;
}