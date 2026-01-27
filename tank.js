// ==================== 坦克基类 ====================

class Tank {
    constructor(x, y, direction = Direction.UP) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.size = 32;
        this.speed = 2;
        this.health = 1;
        this.maxHealth = 1;
        this.canShoot = true;
        this.shootCooldown = 0;
        this.shootDelay = 30; // 射击冷却时间（帧）
    }

    update() {
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
            this.canShoot = this.shootCooldown === 0;
        }
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    shoot() {
        if (!this.canShoot) return null;

        this.canShoot = false;
        this.shootCooldown = this.shootDelay;

        // 计算子弹起始位置（坦克中心）
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;

        // 根据方向调整子弹位置
        let bulletX = centerX - 3;
        let bulletY = centerY - 3;

        const vector = getDirectionVector(this.direction);
        bulletX += vector.dx * (this.size / 2);
        bulletY += vector.dy * (this.size / 2);

        return new Bullet(bulletX, bulletY, this.direction, this.owner);
    }

    takeDamage() {
        this.health--;
        return this.health <= 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate((this.direction * 90) * Math.PI / 180);
        ctx.translate(-this.size / 2, -this.size / 2);

        this.drawBody(ctx);
        this.drawTurret(ctx);

        ctx.restore();
    }

    drawBody(ctx) {
        // 由子类实现
    }

    drawTurret(ctx) {
        // 炮管
        ctx.fillStyle = '#334155';
        ctx.fillRect(this.size / 2 - 3, -5, 6, this.size / 2 + 5);
    }
}

// ==================== 玩家坦克类 ====================

class PlayerTank extends Tank {
    constructor(x, y) {
        super(x, y);
        this.owner = 'player';
        this.health = 3;
        this.maxHealth = 3;
    }

    drawBody(ctx) {
        // 坦克主体 - 绿色渐变
        const gradient = ctx.createLinearGradient(0, 0, this.size, this.size);
        gradient.addColorStop(0, '#4ade80');
        gradient.addColorStop(1, '#22c55e');

        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 2;

        // 主体
        ctx.fillRect(4, 4, this.size - 8, this.size - 8);
        ctx.strokeRect(4, 4, this.size - 8, this.size - 8);

        // 履带
        ctx.fillStyle = '#166534';
        ctx.fillRect(2, 2, 6, this.size - 4);
        ctx.fillRect(this.size - 8, 2, 6, this.size - 4);

        // 炮塔
        ctx.fillStyle = '#22c55e';
        ctx.strokeStyle = '#166534';
        ctx.beginPath();
        ctx.arc(this.size / 2, this.size / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}

// ==================== 敌方坦克类 ====================

class EnemyTank extends Tank {
    constructor(x, y, speed = 2, shootInterval = [60, 120]) {
        super(x, y);
        this.owner = 'enemy';
        this.health = 1;
        this.maxHealth = 1;
        this.speed = speed; // 根据难度设置速度
        this.moveTimer = 0;
        this.moveDelay = 60; // 改变方向的延迟
        this.shootTimer = 0;
        this.shootInterval = randomInt(shootInterval[0], shootInterval[1]); // 根据难度设置射击间隔
        this.shootIntervalRange = shootInterval; // 保存射击间隔范围
    }

    updateAI(playerTank, map, tanks) {
        this.update();

        // 移动AI
        this.moveTimer++;
        if (this.moveTimer >= this.moveDelay) {
            this.moveTimer = 0;
            this.moveDelay = randomInt(30, 90);

            // 30% 概率朝向玩家
            if (Math.random() < 0.3 && playerTank) {
                const dx = playerTank.x - this.x;
                const dy = playerTank.y - this.y;

                if (Math.abs(dx) > Math.abs(dy)) {
                    this.direction = dx > 0 ? Direction.RIGHT : Direction.LEFT;
                } else {
                    this.direction = dy > 0 ? Direction.DOWN : Direction.UP;
                }
            } else {
                // 随机方向
                this.direction = randomDirection();
            }
        }

        // 尝试移动
        const vector = getDirectionVector(this.direction);
        const newX = this.x + vector.dx * this.speed;
        const newY = this.y + vector.dy * this.speed;

        // 保存原位置
        const oldX = this.x;
        const oldY = this.y;

        this.x = newX;
        this.y = newY;

        // 检查碰撞
        let collision = false;

        // 检查墙体碰撞
        if (CollisionDetector.checkTankWallCollision(this, map)) {
            collision = true;
        }

        // 检查与其他坦克的碰撞
        for (let tank of tanks) {
            if (tank !== this && CollisionDetector.checkTankTankCollision(this, tank)) {
                collision = true;
                break;
            }
        }

        // 如果碰撞，恢复位置并改变方向
        if (collision) {
            this.x = oldX;
            this.y = oldY;
            this.direction = randomDirection();
        }

        // 射击AI
        this.shootTimer++;
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            this.shootInterval = randomInt(this.shootIntervalRange[0], this.shootIntervalRange[1]);
            return this.shoot();
        }

        return null;
    }

    drawBody(ctx) {
        // 坦克主体 - 红色渐变
        const gradient = ctx.createLinearGradient(0, 0, this.size, this.size);
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(1, '#dc2626');

        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 2;

        // 主体
        ctx.fillRect(4, 4, this.size - 8, this.size - 8);
        ctx.strokeRect(4, 4, this.size - 8, this.size - 8);

        // 履带
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(2, 2, 6, this.size - 4);
        ctx.fillRect(this.size - 8, 2, 6, this.size - 4);

        // 炮塔
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.arc(this.size / 2, this.size / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}
