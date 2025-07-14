# Food Tutorial System

## 概述

食物教程系统为玩家提供每种食物的介绍和效果说明，帮助新玩家了解游戏机制。

## 功能特点

### 1. 自动教程显示
- 每种食物第一次被吃时自动显示教程
- 教程只显示一次，不会重复打扰玩家
- 使用 localStorage 持久化教程状态
- 显示教程时自动暂停游戏，确保玩家专注阅读

### 2. 教程内容
每种食物包含以下信息：
- **图标**: 直观的emoji图标
- **名称**: 食物的名称
- **描述**: 详细的功能说明
- **效果**: 具体的数值效果
- **颜色**: 对应的颜色标识

### 3. 食物类型

| 食物/道具 | 颜色 | 图标 | 效果 |
|-----------|------|------|------|
| 普通食物 | 绿色 | 🍎 | +1段，+10分 |
| 成长加速 | 黄色 | ⭐ | +5段，+50分 |
| 速度提升 | 橙色 | ⚡ | +1段，+15分，+20%速度 |
| 缩小食物 | 红色 | ⚠️ | -1段，-10分 |
| 减速食物 | 粉色 | 🐌 | +1段，+5分，-30%速度 |
| 传送门 | 紫色 | 🌀 | 瞬间传送，临时冷却 |

## 技术实现

### 核心类

#### FoodTutorialManager
- 管理所有教程的状态
- 处理教程的显示和隐藏
- 管理 localStorage 持久化

#### FoodTutorial 接口
```typescript
interface FoodTutorial {
    id: string;           // 唯一标识符
    name: string;         // 显示名称
    description: string;  // 详细描述
    effect: string;       // 效果说明
    color: number;        // 颜色值
    icon: string;         // 图标
    shown: boolean;       // 是否已显示
}
```

### 主要方法

#### 显示教程
```typescript
// 显示单个教程
foodTutorialManager.showTutorial('growth-boost');

// 显示所有教程（按顺序）
foodTutorialManager.showAllTutorials();
```

#### 状态管理
```typescript
// 检查教程是否已显示
foodTutorialManager.isTutorialShown('speed-boost');

// 重置所有教程
foodTutorialManager.resetTutorials();

// 获取教程统计
foodTutorialManager.getShownTutorialCount();
foodTutorialManager.getTotalTutorialCount();

// 游戏暂停/恢复（内部方法）
foodTutorialManager.pauseGame();  // 暂停游戏
foodTutorialManager.resumeGame(); // 恢复游戏

// 教程状态检查
foodTutorialManager.isTutorialActive(); // 检查是否正在显示教程

### localStorage 存储

教程状态保存在 localStorage 中：
- **键名**: `snake_food_tutorials_shown`
- **值**: JSON 数组，包含已显示教程的ID
- **示例**: `["regular-food", "growth-boost", "speed-boost"]`

## 集成方式

### 在 SnakeScene 中集成

1. **导入教程管理器**
```typescript
import { FoodTutorialManager } from '../tutorial/FoodTutorialManager';
```

2. **初始化**
```typescript
this.foodTutorialManager = new FoodTutorialManager(this);
```

3. **在吃食物或使用道具时显示教程**
```typescript
// 食物教程
private eatFood(): void {
    // ... 食物效果逻辑 ...
    this.foodTutorialManager.showTutorial('regular-food');
}

// 传送门教程（在Snake.ts中）
const teleportPos = portalManager.checkTeleportation(newHeadX, newHeadY);
if (teleportPos) {
    const foodTutorialManager = (this.scene as any).foodTutorialManager;
    if (foodTutorialManager) {
        foodTutorialManager.showTutorial('portal');
    }
    // ... 传送逻辑 ...
}
```

4. **清理资源**
```typescript
public gameOver(): void {
    // ... 其他清理逻辑 ...
    
    if (this.foodTutorialManager) {
        this.foodTutorialManager.destroy();
    }
}
```

## 用户体验

### 教程界面
- 半透明背景遮罩
- 居中的教程卡片
- 平滑的动画效果
- 交互式按钮

### 动画效果
- 进入动画：缩放 + 透明度
- 退出动画：缩小 + 淡出
- 按钮悬停效果

### 游戏暂停机制
- 显示教程时自动暂停游戏
- 隐藏教程时自动恢复游戏
- 支持连续显示多个教程（只暂停一次）
- 显示教程时暂停传送门生成，保持传送门位置不变

### 响应式设计
- 适配不同屏幕尺寸
- 移动设备友好
- 触摸操作支持

## 测试

使用 `food-tutorial-test.html` 进行测试：

1. **基本功能测试**
   - 吃不同食物验证教程显示
   - 重复吃相同食物验证不重复显示

2. **持久化测试**
   - 重新开始游戏验证状态保持
   - 重置教程验证状态清除

3. **localStorage 测试**
   - 检查存储的数据格式
   - 验证数据持久性

## 扩展性

### 添加新食物类型或道具
1. 在 `initializeTutorials()` 中添加新的教程配置
2. 在对应的食物类或道具触发点添加教程调用
3. 更新测试页面和文档

### 自定义教程样式
- 修改 `createTutorialOverlay()` 方法
- 调整颜色、字体、布局
- 添加新的动画效果

### 多语言支持
- 将教程文本提取到配置文件
- 根据语言设置显示对应文本
- 支持动态语言切换 