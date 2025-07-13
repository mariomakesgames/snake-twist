import { useEffect, useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import { EventBus } from './game/EventBus';

function App()
{
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const startGame = () => {
        console.log('Start Game button clicked');
        console.log('phaserRef.current:', phaserRef.current);
        if(phaserRef.current) {     
            const scene = phaserRef.current.scene;
            console.log('scene:', scene);
            console.log('scene.scene.key:', scene?.scene?.key);
            
            if (scene && scene.scene.key === 'SnakeScene') {
                console.log('Calling scene.startGame()');
                (scene as any).startGame();
                setGameOver(false);
            } else {
                console.log('Scene not found or not SnakeScene');
            }
        } else {
            console.log('phaserRef.current is null');
        }
    }

    const togglePause = () => {
        if(phaserRef.current) {
            const scene = phaserRef.current.scene;

            if (scene && scene.scene.key === 'SnakeScene') {
                (scene as any).togglePause();
                setIsPaused(!isPaused);
            }
        }
    }

    const restartGame = () => {
        if(phaserRef.current) {
            const scene = phaserRef.current.scene;

            if (scene && scene.scene.key === 'SnakeScene') {
                (scene as any).restartGame();
                setGameOver(false);
                setIsPaused(false);
            }
        }
    }

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {
        console.log('Scene ready:', scene.scene.key);
        // Scene change handler - can be used for future functionality
    }

    // Handle score updates from the game
    const handleScoreUpdate = (newScore: number) => {
        setScore(newScore);
        if (newScore > highScore) {
            setHighScore(newScore);
        }
    }

    // Handle game over
    const handleGameOver = (finalScore: number) => {
        setGameOver(true);
        setScore(finalScore);
        if (finalScore > highScore) {
            setHighScore(finalScore);
        }
    }

    useEffect(() => {
        const onGameOver = (finalScore: number) => {
            setGameOver(true);
            setScore(finalScore);
            if (finalScore > highScore) setHighScore(finalScore);
        };
        EventBus.on('game-over', onGameOver);
        return () => {
            EventBus.removeListener('game-over', onGameOver);
        };
    }, [highScore]);

    return (
        <div className="game-container">
            <h1>🐍 Snake Game</h1>
            
            <div className="score-display">
                <div className="score-item">
                    Score: <span id="score">{score}</span>
                </div>
                <div className="score-item">
                    High Score: <span id="highScore">{highScore}</span>
                </div>
            </div>

            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />

            <div className="controls">
                <button id="startBtn" className="btn" onClick={startGame}>Start Game</button>
                <button id="pauseBtn" className="btn" onClick={togglePause}>{isPaused ? 'Resume' : 'Pause'}</button>
            </div>

            <div className="instructions">
                <p>Use arrow keys to control the snake</p>
                <p>Eat food to grow and increase your score</p>
                <p>Avoid walls and your own body!</p>
            </div>

            {gameOver && (
                <div id="gameOver" className="game-over">
                    <h2>Game Over!</h2>
                    <p>Final Score: <span id="finalScore">{score}</span></p>
                    <button id="restartBtn" className="btn" onClick={restartGame}>Play Again</button>
                </div>
            )}
        </div>
    )
}

export default App
