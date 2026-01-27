// ==================== 游戏主类 ====================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 游戏状态
        this.state = 'menu'; // menu, playing, paused, gameover
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.kills = 0;

        // 难度设置
        this.difficulty = 'normal'; // easy, normal, hard
        this.difficultySettings = {
            easy: {
                maxEnemies: 3,
                enemySpawnDelay: 180,
                totalEnemiesPerLevel: 6,
                enemySpeed: 1.5,
                enemyShootInterval: [90, 150]
            },
            normal: {
                maxEnemies: 5,
                enemySpawnDelay: 120,
                totalEnemiesPerLevel: 10,
                enemySpeed: 2,
                enemyShootInterval: [60, 120]
            },
            hard: {
                maxEnemies: 7,
                enemySpawnDelay: 80,
                totalEnemiesPerLevel: 15,
                enemySpeed: 2.5,
                enemyShootInterval: [40, 80]
            }
        };

        // 游戏对象
        this.map = null;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.effectsManager = new EffectsManager();

        // 游戏设置（将根据难度动态调整）
        this.maxEnemies = 5;
        this.enemySpawnDelay = 120; // 帧
        this.enemySpawnTimer = 0;
        this.totalEnemiesPerLevel = 10;
        this.enemiesSpawned = 0;

        // 输入控制
        this.keys = {};

        // UI元素
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.mainMenuButton = document.getElementById('mainMenuButton');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');

        this.init();
    }

    init() {
        // 绑定难度选择按钮
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 移除所有active类
                difficultyButtons.forEach(b => b.classList.remove('active'));
                // 添加active类到当前按钮
                btn.classList.add('active');
                // 设置难度
                this.difficulty = btn.dataset.difficulty;
            });
        });

        // 绑定事件
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        this.mainMenuButton.addEventListener('click', () => this.returnToMenu());

        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // 开始游戏循环
        this.gameLoop();
    }

    startGame() {
        this.state = 'playing';
        this.gameOverlay.classList.add('hidden');
        this.gameOverOverlay.classList.add('hidden'); // 确保游戏结束界面被隐藏

        // 应用难度设置
        const settings = this.difficultySettings[this.difficulty];
        this.maxEnemies = settings.maxEnemies;
        this.enemySpawnDelay = settings.enemySpawnDelay;
        this.totalEnemiesPerLevel = settings.totalEnemiesPerLevel;

        // 初始化游戏
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.kills = 0;

        this.initLevel();
        this.updateUI();
    }

    initLevel() {
        // 创建地图
        this.map = new Map();

        // 创建玩家
        const playerPos = this.map.getSpawnPosition('player');
        this.player = new PlayerTank(playerPos.x, playerPos.y);

        // 重置敌人
        this.enemies = [];
        this.bullets = [];
        this.enemiesSpawned = 0;
        this.enemySpawnTimer = 0;

        // 清除特效
        this.effectsManager.clear();
    }

    restartGame() {
        this.gameOverOverlay.classList.add('hidden');
        this.startGame();
    }

    returnToMenu() {
        this.state = 'menu';
        this.gameOverOverlay.classList.add('hidden');
        this.gameOverlay.classList.remove('hidden');
    }

    handleKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;

        // 暂停
        if (e.key.toLowerCase() === 'p' && this.state === 'playing') {
            this.state = 'paused';
        } else if (e.key.toLowerCase() === 'p' && this.state === 'paused') {
            this.state = 'playing';
        }

        // 射击
        if (e.key === ' ' && this.state === 'playing' && this.player) {
            e.preventDefault();
            const bullet = this.player.shoot();
            if (bullet) {
                this.bullets.push(bullet);
            }
        }
    }

    handleKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }

    update() {
        if (this.state !== 'playing') return;

        // 更新玩家
        this.updatePlayer();

        // 更新敌人
        this.updateEnemies();

        // 更新子弹
        this.updateBullets();

        // 更新特效
        this.effectsManager.update();

        // 生成敌人
        this.spawnEnemies();

        // 检查关卡完成
        this.checkLevelComplete();
    }

    updatePlayer() {
        if (!this.player) return;

        this.player.update();

        // 处理移动
        let dx = 0;
        let dy = 0;

        if (this.keys['w'] || this.keys['arrowup']) {
            this.player.direction = Direction.UP;
            dy = -this.player.speed;
        } else if (this.keys['s'] || this.keys['arrowdown']) {
            this.player.direction = Direction.DOWN;
            dy = this.player.speed;
        } else if (this.keys['a'] || this.keys['arrowleft']) {
            this.player.direction = Direction.LEFT;
            dx = -this.player.speed;
        } else if (this.keys['d'] || this.keys['arrowright']) {
            this.player.direction = Direction.RIGHT;
            dx = this.player.speed;
        }

        if (dx !== 0 || dy !== 0) {
            const oldX = this.player.x;
            const oldY = this.player.y;

            this.player.move(dx, dy);

            // 检查碰撞
            let collision = false;

            // 检查墙体碰撞
            if (CollisionDetector.checkTankWallCollision(this.player, this.map)) {
                collision = true;
            }

            // 检查与敌人的碰撞
            for (let enemy of this.enemies) {
                if (CollisionDetector.checkTankTankCollision(this.player, enemy)) {
                    collision = true;
                    break;
                }
            }

            // 如果碰撞，恢复位置
            if (collision) {
                this.player.x = oldX;
                this.player.y = oldY;
            }
        }
    }

    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            // 更新敌人AI
            const bullet = enemy.updateAI(this.player, this.map, this.enemies);
            if (bullet) {
                this.bullets.push(bullet);
            }
        }
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update();

            // 检查子弹是否超出边界
            if (bullet.x < 0 || bullet.x > this.canvas.width ||
                bullet.y < 0 || bullet.y > this.canvas.height) {
                this.bullets.splice(i, 1);
                continue;
            }

            // 检查子弹与墙体的碰撞
            const wallCollision = CollisionDetector.checkBulletWallCollision(bullet, this.map);
            if (wallCollision) {
                // 摧毁砖墙
                if (wallCollision.cellType === 1) {
                    this.map.destroyWall(wallCollision.row, wallCollision.col);
                }

                this.effectsManager.addExplosion(bullet.x, bullet.y, 15);
                this.bullets.splice(i, 1);
                continue;
            }

            // 检查子弹与基地的碰撞
            if (CollisionDetector.checkBulletBaseCollision(bullet, this.map)) {
                this.effectsManager.addExplosion(this.map.baseX + 40, this.map.baseY + 40, 50);
                this.bullets.splice(i, 1);
                this.gameOver(false);
                continue;
            }

            // 检查子弹与坦克的碰撞
            if (bullet.owner === 'player') {
                // 玩家子弹检查敌人
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const enemy = this.enemies[j];
                    if (CollisionDetector.checkBulletTankCollision(bullet, enemy)) {
                        this.effectsManager.addExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, 30);
                        this.enemies.splice(j, 1);
                        this.bullets.splice(i, 1);
                        this.score += 100;
                        this.kills++;
                        this.updateUI();
                        break;
                    }
                }
            } else {
                // 敌人子弹检查玩家
                if (this.player && CollisionDetector.checkBulletTankCollision(bullet, this.player)) {
                    this.effectsManager.addExplosion(this.player.x + this.player.size / 2, this.player.y + this.player.size / 2, 30);
                    this.bullets.splice(i, 1);

                    if (this.player.takeDamage()) {
                        this.lives--;
                        this.updateUI();

                        if (this.lives > 0) {
                            // 重生玩家
                            const playerPos = this.map.getSpawnPosition('player');
                            this.player = new PlayerTank(playerPos.x, playerPos.y);
                        } else {
                            this.player = null;
                            this.gameOver(false);
                        }
                    }
                }
            }
        }
    }

    spawnEnemies() {
        if (this.enemiesSpawned >= this.totalEnemiesPerLevel) return;
        if (this.enemies.length >= this.maxEnemies) return;

        this.enemySpawnTimer++;
        if (this.enemySpawnTimer >= this.enemySpawnDelay) {
            this.enemySpawnTimer = 0;

            const enemyPos = this.map.getSpawnPosition('enemy');
            const settings = this.difficultySettings[this.difficulty];
            const enemy = new EnemyTank(
                enemyPos.x,
                enemyPos.y,
                settings.enemySpeed,
                settings.enemyShootInterval
            );
            this.enemies.push(enemy);
            this.enemiesSpawned++;

            this.updateUI();
        }
    }

    checkLevelComplete() {
        if (this.enemiesSpawned >= this.totalEnemiesPerLevel && this.enemies.length === 0) {
            // 关卡完成
            this.level++;
            this.score += 500;
            this.totalEnemiesPerLevel += 2;
            this.initLevel();
            this.updateUI();
        }
    }

    gameOver(won) {
        this.state = 'gameover';

        // 更新游戏结束界面
        document.getElementById('gameOverTitle').textContent = won ? '胜利！' : '游戏结束';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('finalKills').textContent = this.kills;

        this.gameOverOverlay.classList.remove('hidden');
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = '❤️'.repeat(this.lives);
        document.getElementById('enemies').textContent = this.totalEnemiesPerLevel - this.enemiesSpawned + this.enemies.length;
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.state === 'menu') return;

        // 绘制地图
        if (this.map) {
            this.map.draw(this.ctx);
        }

        // 绘制玩家
        if (this.player) {
            this.player.draw(this.ctx);
        }

        // 绘制敌人
        for (let enemy of this.enemies) {
            enemy.draw(this.ctx);
        }

        // 绘制子弹
        for (let bullet of this.bullets) {
            bullet.draw(this.ctx);
        }

        // 绘制特效
        this.effectsManager.draw(this.ctx);

        // 绘制暂停提示
        if (this.state === 'paused') {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('暂停', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('按 P 继续', this.canvas.width / 2, this.canvas.height / 2 + 50);
            this.ctx.restore();
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// ==================== 启动游戏 ====================

window.addEventListener('load', () => {
    new Game();
});
