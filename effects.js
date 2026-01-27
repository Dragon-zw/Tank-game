// ==================== 视觉效果系统 ====================

/**
 * 爆炸效果类
 */
class Explosion {
    constructor(x, y, size = 40) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.maxSize = size * 2;
        this.alpha = 1;
        this.particles = [];
        this.lifetime = 30; // 帧数
        this.age = 0;

        // 创建粒子
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: 0,
                y: 0,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 4 + 2,
                color: this.getRandomColor()
            });
        }
    }

    getRandomColor() {
        const colors = [
            '#ff6b35',
            '#f7931e',
            '#ffd700',
            '#ff4500',
            '#ff8c00'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.age++;
        this.size = this.maxSize * (this.age / this.lifetime);
        this.alpha = 1 - (this.age / this.lifetime);

        // 更新粒子
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95;
            p.vy *= 0.95;
        });

        return this.age < this.lifetime;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // 绘制主爆炸圆
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, `rgba(255, 255, 100, ${this.alpha})`);
        gradient.addColorStop(0.5, `rgba(255, 107, 53, ${this.alpha * 0.7})`);
        gradient.addColorStop(1, `rgba(255, 69, 0, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        // 绘制粒子
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
}

/**
 * 效果管理器
 */
class EffectsManager {
    constructor() {
        this.explosions = [];
    }

    addExplosion(x, y, size) {
        this.explosions.push(new Explosion(x, y, size));
    }

    update() {
        this.explosions = this.explosions.filter(explosion => explosion.update());
    }

    draw(ctx) {
        this.explosions.forEach(explosion => explosion.draw(ctx));
    }

    clear() {
        this.explosions = [];
    }
}
