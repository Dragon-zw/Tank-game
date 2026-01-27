// ==================== 工具函数 ====================

/**
 * 方向常量
 */
const Direction = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

/**
 * 根据方向获取移动向量
 * @param {number} direction - 方向
 * @returns {{dx: number, dy: number}} 移动向量
 */
function getDirectionVector(direction) {
    switch (direction) {
        case Direction.UP:
            return { dx: 0, dy: -1 };
        case Direction.RIGHT:
            return { dx: 1, dy: 0 };
        case Direction.DOWN:
            return { dx: 0, dy: 1 };
        case Direction.LEFT:
            return { dx: -1, dy: 0 };
        default:
            return { dx: 0, dy: 0 };
    }
}

/**
 * 获取随机整数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机整数
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 获取随机方向
 * @returns {number} 随机方向
 */
function randomDirection() {
    return randomInt(0, 3);
}

/**
 * 检查两个矩形是否重叠
 * @param {Object} rect1 - 矩形1 {x, y, width, height}
 * @param {Object} rect2 - 矩形2 {x, y, width, height}
 * @returns {boolean} 是否重叠
 */
function rectsOverlap(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * 计算两点之间的距离
 * @param {number} x1 - 点1的x坐标
 * @param {number} y1 - 点1的y坐标
 * @param {number} x2 - 点2的x坐标
 * @param {number} y2 - 点2的y坐标
 * @returns {number} 距离
 */
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * 限制数值在指定范围内
 * @param {number} value - 值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 限制后的值
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * 将角度转换为弧度
 * @param {number} degrees - 角度
 * @returns {number} 弧度
 */
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * 将弧度转换为角度
 * @param {number} radians - 弧度
 * @returns {number} 角度
 */
function toDegrees(radians) {
    return radians * 180 / Math.PI;
}
