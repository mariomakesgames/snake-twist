import React from 'react';

interface GameInstructionsProps {
    className?: string;
}

export const GameInstructions: React.FC<GameInstructionsProps> = ({ className = '' }) => {
    return (
        <div className={`instructions ${className}`}>
            <div className="instruction-main">
                <p>🎮 <strong>Controls:</strong> Arrow keys, mouse drag, or swipe to control the snake</p>
                <p>🍎 <strong>Goal:</strong> Eat food to grow and increase your score</p>
                <p>⚠️ <strong>Avoid:</strong> Walls and your own body!</p>
            </div>
            
            <div className="control-tips">
                <p>💡 <strong>Desktop:</strong> Use arrow keys or click & drag</p>
                <p>💡 <strong>Mobile:</strong> Swipe in any direction to move</p>
            </div>
        </div>
    );
}; 