import React from 'react';

import "./PlayerDropdown.css"

function PlayerDropdown({players, selectedPlayer, onSelectPlayer, disabled}) {
    return (
        <div className="player-dropdown">
            <label htmlFor="player-select">Player:</label>
            <select 
                id="player-select"
                className="player-select"
                value={selectedPlayer}
                onChange={(e) => onSelectPlayer(e.target.value)}
                disabled={disabled}
            >
                <option value="">--Select a player--</option>
                {players.map((player, index) => (
                    <option key={index} value={player}>
                        {player}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default PlayerDropdown;