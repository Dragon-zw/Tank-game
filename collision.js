// ==================== 碰撞检测系统 ====================

class CollisionDetector {
    /**
     * 检测坦克与墙体的碰撞
     * @param {Tank} tank - 坦克对象
     * @param {Map} map - 地图对象
     * @returns {boolean} 是否发生碰撞
     */
    static checkTankWallCollision(tank, map) {
        const gridSize = map.gridSize;
        const tankRect = {
            x: tank.x,
            y: tank.y,
            width: tank.size,
            height: tank.size
        };

        // 计算坦克占据的网格范围
        const startCol = Math.floor(tank.x / gridSize);
        const endCol = Math.floor((tank.x + tank.size) / gridSize);
        const startRow = Math.floor(tank.y / gridSize);
        const endRow = Math.floor((tank.y + tank.size) / gridSize);

        // 检查每个网格
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (row < 0 || row >= map.rows || col < 0 || col >= map.cols) {
                    return true; // 超出边界
                }

                const cell = map.grid[row][col];
                if (cell === 1 || cell === 2) { // 砖墙或钢墙
                    const wallRect = {
                        x: col * gridSize,
                        y: row * gridSize,
                        width: gridSize,
                        height: gridSize
                    };
                    if (rectsOverlap(tankRect, wallRect)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * 检测两个坦克之间的碰撞
     * @param {Tank} tank1 - 坦克1
     * @param {Tank} tank2 - 坦克2
     * @returns {boolean} 是否发生碰撞
     */
    static checkTankTankCollision(tank1, tank2) {
        const rect1 = {
            x: tank1.x,
            y: tank1.y,
            width: tank1.size,
            height: tank1.size
        };
        const rect2 = {
            x: tank2.x,
            y: tank2.y,
            width: tank2.size,
            height: tank2.size
        };
        return rectsOverlap(rect1, rect2);
    }

    /**
     * 检测子弹与墙体的碰撞
     * @param {Bullet} bullet - 子弹对象
     * @param {Map} map - 地图对象
     * @returns {Object|null} 碰撞信息 {row, col, cellType} 或 null
     */
    static checkBulletWallCollision(bullet, map) {
        const gridSize = map.gridSize;
        const col = Math.floor((bullet.x + bullet.size / 2) / gridSize);
        const row = Math.floor((bullet.y + bullet.size / 2) / gridSize);

        if (row < 0 || row >= map.rows || col < 0 || col >= map.cols) {
            return { row, col, cellType: -1 }; // 超出边界
        }

        const cell = map.grid[row][col];
        if (cell === 1 || cell === 2) { // 砖墙或钢墙
            return { row, col, cellType: cell };
        }

        return null;
    }

    /**
     * 检测子弹与坦克的碰撞
     * @param {Bullet} bullet - 子弹对象
     * @param {Tank} tank - 坦克对象
     * @returns {boolean} 是否发生碰撞
     */
    static checkBulletTankCollision(bullet, tank) {
        const bulletRect = {
            x: bullet.x,
            y: bullet.y,
            width: bullet.size,
            height: bullet.size
        };
        const tankRect = {
            x: tank.x,
            y: tank.y,
            width: tank.size,
            height: tank.size
        };
        return rectsOverlap(bulletRect, tankRect);
    }

    /**
     * 检测子弹与基地的碰撞
     * @param {Bullet} bullet - 子弹对象
     * @param {Map} map - 地图对象
     * @returns {boolean} 是否击中基地
     */
    static checkBulletBaseCollision(bullet, map) {
        const baseRect = {
            x: map.baseX,
            y: map.baseY,
            width: map.gridSize * 2,
            height: map.gridSize * 2
        };
        const bulletRect = {
            x: bullet.x,
            y: bullet.y,
            width: bullet.size,
            height: bullet.size
        };
        return rectsOverlap(bulletRect, baseRect);
    }
}
