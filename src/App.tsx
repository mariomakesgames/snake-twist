import { useEffect, useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import { EventBus } from './game/EventBus';

function App()
{
    // ⭐References to the PhaserGame instance (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [length, setLength] = useState(3);

    // Event emitted from the PhaserGame component
    // Allows the parent component (App) to know the current active scene in the Phaser game is ready
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

    // Listen for page visibility changes to implement auto-pause functionality
    useEffect(() => {
        let lastPauseTime = 0;
        const PAUSE_COOLDOWN = 1000; // 1 second cooldown to avoid frequent triggers
        let isPausedByVisibility = false; // Flag indicating if paused by visibility event
        let isProcessingVisibilityChange = false; // Prevent duplicate processing

        const handleVisibilityChange = () => {
            // Prevent duplicate processing
            if (isProcessingVisibilityChange) {
                console.log('Processing visibility change, skipping duplicate call');
                return;
            }

            const gameState = (window as any).gameState;
            if (!gameState) return;

            const currentScene = phaserRef.current?.scene;
            if (!currentScene || currentScene.scene.key !== 'SnakeScene') return;

            const snakeScene = currentScene as any;

            if (document.hidden) {
                // Auto-pause game when page is hidden
                const now = Date.now();
                if (now - lastPauseTime > PAUSE_COOLDOWN && 
                    !gameState.isPaused && 
                    !gameState.isGameOver && 
                    snakeScene.isGameActive()) {
                    
                    isProcessingVisibilityChange = true;
                    console.log('Page hidden, auto-pausing game');
                    snakeScene.setPauseState(true);
                    lastPauseTime = now;
                    isPausedByVisibility = true;
                    
                    // Delay reset processing flag
                    setTimeout(() => {
                        isProcessingVisibilityChange = false;
                    }, 100);
                }
            } else {
                // Reset flags when page becomes visible again
                isPausedByVisibility = false;
                isProcessingVisibilityChange = false;
            }
            // Note: Page doesn't auto-resume when visible again, user needs to manually click resume
        };

        // Add page visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return (
        <div className="game-container">
            <div className="header-row">
                <h1>🐍 Snake </h1>
                <div className="score-display">
                    <div className="score-item">
                        Score: <span id="score">{score}</span>
                    </div>
                    <div className="score-item">
                        High: <span id="highScore">{highScore}</span>
                    </div>
                    <div className="score-item">
                        Length: <span id="length">{length}</span>
                    </div>
                </div>
            </div>

            <div style={{ position: 'relative' }}>
                <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            </div>
        </div>
    )
}

export default App;
