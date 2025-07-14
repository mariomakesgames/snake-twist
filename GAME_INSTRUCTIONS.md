# 游戏说明系统

## 概述

游戏说明系统已经优化，将所有提示信息合并为简洁、统一的格式，提供更好的用户体验。

## 新的提示结构

### 🎮 主要说明
- **Controls:** 控制方式说明
- **Goal:** 游戏目标
- **Avoid:** 需要避免的内容

### 💡 控制提示
- **Desktop:** 桌面端控制方式
- **Mobile:** 移动端控制方式

## 组件结构

```tsx
<GameInstructions />
```

### 包含内容
1. **instruction-main** - 主要游戏说明
2. **control-tips** - 设备特定的控制提示

## 样式特点

### 视觉效果
- 渐变背景色（绿色到蓝色）
- 双色边框（左侧绿色，右侧蓝色）
- 图标和粗体文字突出重要信息

### 响应式设计
- 桌面端：完整显示所有信息
- 移动端：优化字体大小和间距

## 使用方式

### 在App.tsx中
```tsx
import { GameInstructions } from './components/GameInstructions';

// 在JSX中使用
<GameInstructions />
```

### 自定义样式
```tsx
<GameInstructions className="custom-instructions" />
```

## 样式类名

- `.instructions` - 主容器
- `.instruction-main` - 主要说明区域
- `.control-tips` - 控制提示区域

## 优势

1. **统一性** - 所有设备显示相同的核心信息
2. **简洁性** - 减少重复和冗余信息
3. **可维护性** - 集中管理所有提示信息
4. **响应式** - 自动适配不同屏幕尺寸
5. **可扩展性** - 易于添加新的提示信息

## 未来改进

- [ ] 添加动画效果
- [ ] 支持多语言
- [ ] 添加交互式提示
- [ ] 支持主题切换 