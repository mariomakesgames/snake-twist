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
