// ==================== 地图类 ====================

class Map {
    constructor(rows = 15, cols = 20) {
        this.rows = rows;
        this.cols = cols;
        this.gridSize = 40;
        this.grid = [];
        this.baseX = 0;
        this.baseY = 0;

        this.initializeGrid();
    }

    initializeGrid() {
        // 初始化空地图
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));

        // 0 = 空地
        // 1 = 砖墙
        // 2 = 钢墙
        // 3 = 基地

        // 创建边界墙
        for (let i = 0; i < this.cols; i++) {
            this.grid[0][i] = 2; // 顶部
            this.grid[this.rows - 1][i] = 2; // 底部
        }
        for (let i = 0; i < this.rows; i++) {
            this.grid[i][0] = 2; // 左侧
            this.grid[i][this.cols - 1] = 2; // 右侧
        }

        // 添加随机障碍物
        this.addRandomObstacles();

        // 设置基地位置（底部中央）
        const baseCol = Math.floor(this.cols / 2) - 1;
        const baseRow = this.rows - 3;
        this.baseX = baseCol * this.gridSize;
        this.baseY = baseRow * this.gridSize;

        // 在基地周围创建保护墙
        this.createBaseProtection(baseRow, baseCol);
    }

    addRandomObstacles() {
        // 添加随机砖墙
        const brickCount = Math.floor(this.rows * this.cols * 0.15);
        for (let i = 0; i < brickCount; i++) {
            const row = randomInt(2, this.rows - 4);
            const col = randomInt(2, this.cols - 3);
            if (this.grid[row][col] === 0) {
                this.grid[row][col] = 1;
            }
        }

        // 添加随机钢墙
        const steelCount = Math.floor(this.rows * this.cols * 0.05);
        for (let i = 0; i < steelCount; i++) {
            const row = randomInt(2, this.rows - 4);
            const col = randomInt(2, this.cols - 3);
            if (this.grid[row][col] === 0) {
                this.grid[row][col] = 2;
            }
        }
    }

    createBaseProtection(baseRow, baseCol) {
        // 在基地周围创建砖墙保护
        const positions = [
            [baseRow - 1, baseCol - 1],
            [baseRow - 1, baseCol],
            [baseRow - 1, baseCol + 1],
            [baseRow - 1, baseCol + 2],
            [baseRow, baseCol - 1],
            [baseRow, baseCol + 2],
            [baseRow + 1, baseCol - 1],
            [baseRow + 1, baseCol + 2],
            [baseRow + 2, baseCol - 1],
            [baseRow + 2, baseCol],
            [baseRow + 2, baseCol + 1],
            [baseRow + 2, baseCol + 2]
        ];

        positions.forEach(([row, col]) => {
            if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                this.grid[row][col] = 1;
            }
        });
    }

    destroyWall(row, col) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            if (this.grid[row][col] === 1) {
                this.grid[row][col] = 0;
                return true;
            }
        }
        return false;
    }

    draw(ctx) {
        // 绘制网格
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = col * this.gridSize;
                const y = row * this.gridSize;
                const cell = this.grid[row][col];

                if (cell === 1) {
                    // 砖墙
                    this.drawBrickWall(ctx, x, y);
                } else if (cell === 2) {
                    // 钢墙
                    this.drawSteelWall(ctx, x, y);
                }
            }
        }

        // 绘制基地
        this.drawBase(ctx);
    }

    drawBrickWall(ctx, x, y) {
        const gradient = ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
        gradient.addColorStop(0, '#a16207');
        gradient.addColorStop(1, '#854d0e');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, this.gridSize, this.gridSize);

        // 砖块纹理
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;

        // 横线
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(x, y + i * 10);
            ctx.lineTo(x + this.gridSize, y + i * 10);
            ctx.stroke();
        }

        // 竖线（交错）
        for (let i = 0; i < 2; i++) {
            const offset = i % 2 === 0 ? 0 : this.gridSize / 2;
            ctx.beginPath();
            ctx.moveTo(x + offset, y + i * 20);
            ctx.lineTo(x + offset, y + i * 20 + 20);
            ctx.stroke();
        }
    }

    drawSteelWall(ctx, x, y) {
        const gradient = ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
        gradient.addColorStop(0, '#64748b');
        gradient.addColorStop(1, '#475569');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, this.gridSize, this.gridSize);

        // 金属纹理
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);

        // 对角线
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + this.gridSize, y + this.gridSize);
        ctx.moveTo(x + this.gridSize, y);
        ctx.lineTo(x, y + this.gridSize);
        ctx.stroke();
    }

    drawBase(ctx) {
        const size = this.gridSize * 2;

        // 基地背景
        const gradient = ctx.createRadialGradient(
            this.baseX + size / 2, this.baseY + size / 2, 0,
            this.baseX + size / 2, this.baseY + size / 2, size
        );
        gradient.addColorStop(0, '#00d4ff');
        gradient.addColorStop(1, '#0099ff');

        ctx.fillStyle = gradient;
        ctx.fillRect(this.baseX, this.baseY, size, size);

        // 基地图标
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏰', this.baseX + size / 2, this.baseY + size / 2);

        // 边框
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.baseX, this.baseY, size, size);
    }

    getSpawnPosition(type) {
        // 获取生成位置
        if (type === 'player') {
            // 玩家在底部左侧生成
            return {
                x: this.gridSize * 2,
                y: (this.rows - 3) * this.gridSize
            };
        } else {
            // 敌人在顶部随机位置生成，确保不在墙体中
            const tankSize = 32; // 坦克大小
            let attempts = 0;
            const maxAttempts = 50;

            while (attempts < maxAttempts) {
                const col = randomInt(2, this.cols - 3);
                const x = col * this.gridSize;
                const y = this.gridSize * 2;

                // 检查该位置是否与墙体重叠
                if (this.isPositionClear(x, y, tankSize)) {
                    return { x, y };
                }

                attempts++;
            }

            // 如果找不到合适位置，返回一个默认的安全位置
            return {
                x: this.gridSize * 3,
                y: this.gridSize * 2
            };
        }
    }

    isPositionClear(x, y, size) {
        // 检查指定位置是否没有墙体
        const startCol = Math.floor(x / this.gridSize);
        const endCol = Math.floor((x + size) / this.gridSize);
        const startRow = Math.floor(y / this.gridSize);
        const endRow = Math.floor((y + size) / this.gridSize);

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
                    return false;
                }
                if (this.grid[row][col] !== 0) {
                    return false;
                }
            }
        }

        return true;
    }
}
