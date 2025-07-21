# Snake Twist - Enhanced Snake Game
This game takes the classic snake concept and adds exciting new mechanics including portals, obstacles, special food types, mobile support, and segment drops — when the snake dies, body segments scatter as collectible drops, adding incentive to watch an ad and revive.

## 🎮 Game Features

#### 🍎 Multi-Type Food System
- **Green Food**: Standard food that grows the snake by 1 segment (+10 score)
- **Yellow Growth Boost**: Grows snake by 5 segments (+50 score)
- **Orange Speed Boost**: Grows snake by 1 segment (+10 score) + permanently reduces movement interval by 20ms (faster)
- **Pink Slow Food**: Grows snake by 1 segment (+10 score) + permanently increases movement interval by 30ms (slower)
- **Red Shrink Food**: Reduces snake length by 1 segment (no score change)

#### 💀 Revival & Ad System
- **Segment Drops**: When snake dies, body segments scatter as collectible drops (1-5 drops based on length)
- **Ad-Based Revival**: Watch a 3-second ad to revive
- **Opportunity Recovery**: Collect dropped segments to restore snake length
- **Score Preservation**: Keep your current score and length
- **Strategic Value**: Higher snake length = more segment drops = greater revival benefit

#### 🌀 Portal System
- **Teleportation Mechanics**: Two linked portals spawn every 15 seconds (after score 10)
- **Smart Spawning**: Portals avoid snake, food, and obstacles
- **Dynamic Spawn Rate**: Spawn probability decreases with higher scores and longer snakes

#### 🧱 Obstacle System
- **8 Different Patterns**: L, T, H shapes, maze, simple, and random patterns
- **Smart Placement**: Obstacles avoid snake spawn area and food
- **Balanced Difficulty**: Simple patterns (30% chance) for beginners, complex patterns for experts
- **Collision Detection**: Snake dies when hitting obstacles
- **Score Multiplier**: 2x score multiplier when obstacle mode is enabled

#### 📱 Mobile Support
- **Touch Controls**: Swipe gestures for movement
- **Responsive Design**: Optimized for mobile devices
- **Visual Indicators**: On-screen control instructions

#### 🎯 Advanced Features
- **Pause System**: Pause/resume on switching to other tabs or apps or return to home on phones
- **Revival System**: Watch ads to revive and collect dropped segments for instant snake growth
- **Tutorial System**: Food type explanations for new players
- **Settings Management**: Toggle obstacle mode on/off
- **Speed Limits**: Minimum interval 30ms, maximum interval 300ms


## 🚀 How to Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:8080` in your browser.

### Building for Production

```bash
npm run build
```

This creates a `dist` folder with optimized production files ready for deployment.

## 🤖 AI-Assisted Development

This project was developed using **Cursor AI** as a creative validation and rapid prototyping tool. The development process involved:

- **🎯 Creative Validation**: Testing game mechanics and features through AI-assisted code generation
- **🔍 Design Discovery**: Identifying design flaws and gameplay issues through iterative testing
- **⚡ Rapid Iteration**: Quickly implementing, testing, and refining features based on AI suggestions
- **🛠️ Solution Engineering**: Using AI to generate alternative approaches and optimization strategies

The result is a fully functional snake game that demonstrates how AI can accelerate game development while maintaining high code quality and engaging gameplay mechanics.

## 🎯 Next Development Phase

### 🎮 Level Editor & Campaign Mode
The next major development focus will be creating a comprehensive level editor and campaign mode system that transforms the game from endless mode to a structured, progressive experience.

#### 🏗️ Level Editor Features
- **Visual Editor**: Drag-and-drop interface for placing obstacles, portals, and food
- **Element Library**: Pre-designed obstacle patterns (L, T, H, Z shapes, mazes)
- **Portal Placement**: Strategic portal positioning for teleportation puzzles
- **Food Distribution**: Place different food types at specific locations
- **Real-time Preview**: Test levels instantly within the editor
- **Difficulty Rating**: Automatic difficulty calculation based on layout complexity

#### 📈 Campaign Mode Design
- **Progressive Introduction**: New game elements introduced gradually
  - **Levels 1-5**: Basic snake mechanics, green food only
  - **Levels 6-10**: Introduction of yellow growth boost food
  - **Levels 11-15**: Orange speed boost and pink slow food added
  - **Levels 16-20**: Red shrink food introduced
  - **Levels 21-25**: Portal system unlocked
  - **Levels 26+**: Complex obstacle patterns and advanced combinations

#### 🎯 Strategic Level Design
- **Portal Puzzles**: Design levels where portals are essential for reaching food
- **Obstacle Mazes**: Create challenging paths that require careful navigation
- **Food Timing**: Place speed-affecting foods to create timing challenges
- **Risk-Reward**: Position high-value foods near dangerous obstacles
- **Progressive Complexity**: Each level builds upon previous mechanics

#### 🛠️ Technical Implementation
- **Level Data Format**: JSON-based level storage for easy sharing
- **Save/Load System**: Local storage for custom levels
- **Community Sharing**: Export/import levels between players
- **Validation System**: Ensure levels are completable and balanced
- **Performance Optimization**: Efficient rendering for complex layouts

### 🎨 Enhanced Gameplay Elements

#### 🚀 New Power-ups
- **Ghost Mode**: Temporary ability to pass through obstacles
- **Time Slow**: Temporarily reduce game speed for precise movements
- **Magnet Effect**: Attract nearby food automatically
- **Shield**: Protect against one collision

#### 🏆 Achievement System
- **Level Completion**: Stars for completing levels with different criteria
- **Speed Challenges**: Beat time limits for bonus rewards
- **Perfect Runs**: Complete levels without using certain power-ups
- **Collection Goals**: Collect all food types in a single level

#### 🎵 Audio & Visual Enhancements
- **Sound Effects**: Audio feedback for all game actions
- **Background Music**: Dynamic music that changes with game intensity
- **Particle Effects**: Enhanced visual feedback for achievements
- **Theme Variations**: Different visual themes for different level types

### 🌐 Community Features

#### 📊 Leaderboards
- **Level-specific Rankings**: Compare completion times and scores
- **Global Leaderboards**: Overall campaign progress rankings
- **Weekly Challenges**: Special limited-time level competitions

#### 🤝 Social Features
- **Level Sharing**: Share custom levels with the community
- **Rating System**: Rate and review community-created levels
- **Featured Levels**: Curated selection of the best user-created content
- **Collaboration**: Work together on level design projects
 

**Created with ❤️ using AI assistance and the Phaser game engine**
