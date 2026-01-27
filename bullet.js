// ==================== 子弹类 ====================

class Bullet {
    constructor(x, y, direction, owner) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.owner = owner; // 'player' 或 'enemy'
        this.size = 6;
        this.speed = 5;
        this.active = true;
    }

    update() {
        if (!this.active) return;

        const vector = getDirectionVector(this.direction);
        this.x += vector.dx * this.speed;
        this.y += vector.dy * this.speed;
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();

        // 子弹颜色根据所有者不同
        const color = this.owner === 'player' ? '#4ade80' : '#ef4444';

        // 绘制子弹主体
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // 绘制子弹尾迹
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    destroy() {
        this.active = false;
    }
}
