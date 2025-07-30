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

    // Listen for page visibility changes and window focus changes to implement auto-pause functionality
    useEffect(() => {
        let lastPauseTime = 0;
        const PAUSE_COOLDOWN = 1000; // 1 second cooldown to avoid frequent triggers
        let isPausedByVisibility = false; // Flag indicating if paused by visibility event
        let isPausedByFocus = false; // Flag indicating if paused by focus event
        let isProcessingVisibilityChange = false; // Prevent duplicate processing
        let isProcessingFocusChange = false; // Prevent duplicate processing

        const pauseGameIfNeeded = (reason: string) => {
            const gameState = (window as any).gameState;
            if (!gameState) return;

            const currentScene = phaserRef.current?.scene;
            if (!currentScene || currentScene.scene.key !== 'SnakeScene') return;

            const snakeScene = currentScene as any;

            const now = Date.now();
            if (now - lastPauseTime > PAUSE_COOLDOWN && 
                !gameState.isPaused && 
                !gameState.isGameOver && 
                snakeScene.isGameActive()) {
                
                console.log(`${reason}, auto-pausing game`);
                snakeScene.setPauseState(true);
                lastPauseTime = now;
                return true;
            }
            return false;
        };

        const handleVisibilityChange = () => {
            // Prevent duplicate processing
            if (isProcessingVisibilityChange) {
                console.log('Processing visibility change, skipping duplicate call');
                return;
            }

            if (document.hidden) {
                // Auto-pause game when page is hidden (tab switch, minimize browser)
                isProcessingVisibilityChange = true;
                if (pauseGameIfNeeded('Page hidden (tab switch/minimize)')) {
                    isPausedByVisibility = true;
                }
                
                // Delay reset processing flag
                setTimeout(() => {
                    isProcessingVisibilityChange = false;
                }, 100);
            } else {
                // Reset flags when page becomes visible again
                isPausedByVisibility = false;
                isProcessingVisibilityChange = false;
            }
            // Note: Page doesn't auto-resume when visible again, user needs to manually click resume
        };

        const handleWindowBlur = () => {
            // Prevent duplicate processing
            if (isProcessingFocusChange) {
                console.log('Processing focus change, skipping duplicate call');
                return;
            }

            // Auto-pause game when window loses focus (switch to other app)
            isProcessingFocusChange = true;
            if (pauseGameIfNeeded('Window lost focus (app switch)')) {
                isPausedByFocus = true;
            }
            
            // Delay reset processing flag
            setTimeout(() => {
                isProcessingFocusChange = false;
            }, 100);
        };

        const handleWindowFocus = () => {
            // Reset flags when window regains focus
            isPausedByFocus = false;
            isProcessingFocusChange = false;
            // Note: Game doesn't auto-resume when focus returns, user needs to manually click resume
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', handleWindowFocus);
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
