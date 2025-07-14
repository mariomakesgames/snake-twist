import { useEffect, useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import { GameInstructions } from './components/GameInstructions';
import { EventBus } from './game/EventBus';

function App()
{
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {
        console.log('Scene ready:', scene.scene.key);
        // Scene change handler - can be used for future functionality
    }

    useEffect(() => {
        const onGameOver = (finalScore: number) => {
            setScore(finalScore);
            if (finalScore > highScore) setHighScore(finalScore);
        };
        EventBus.on('game-over', onGameOver);
        return () => {
            EventBus.removeListener('game-over', onGameOver);
        };
    }, [highScore]);

    // 监听页面可见性变化，实现自动暂停功能
    useEffect(() => {
        const handleVisibilityChange = () => {
            const gameState = (window as any).gameState;
            if (!gameState) return;

            const currentScene = phaserRef.current?.scene;
            if (!currentScene || currentScene.scene.key !== 'SnakeScene') return;

            const snakeScene = currentScene as any;

            if (document.hidden) {
                // 页面隐藏时自动暂停游戏
                if (!gameState.isPaused && !gameState.isGameOver && snakeScene.isGameActive()) {
                    console.log('页面隐藏，自动暂停游戏');
                    snakeScene.setPauseState(true);
                }
            }
            // 注意：页面重新可见时不自动恢复，需要用户手动点击恢复
        };

        // 添加页面可见性变化监听
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // 添加页面焦点变化监听（作为备用）
        window.addEventListener('blur', () => {
            const gameState = (window as any).gameState;
            if (!gameState) return;
            
            const currentScene = phaserRef.current?.scene;
            if (!currentScene || currentScene.scene.key !== 'SnakeScene') return;

            const snakeScene = currentScene as any;
            
            if (!gameState.isPaused && !gameState.isGameOver && snakeScene.isGameActive()) {
                console.log('页面失去焦点，自动暂停游戏');
                snakeScene.setPauseState(true);
            }
        });

        // 移除focus事件监听，不自动恢复游戏
        // window.addEventListener('focus', () => { ... });

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleVisibilityChange);
        };
    }, []);

    return (
        <div className="game-container">
            <div className="header-row">
                <h1>🐍 Snake Game</h1>
                <div className="score-display">
                    <div className="score-item">
                        Score: <span id="score">{score}</span>
                    </div>
                    <div className="score-item">
                        High Score: <span id="highScore">{highScore}</span>
                    </div>
                </div>
            </div>

            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />

            <GameInstructions />
        </div>
    )
}

export default App;
