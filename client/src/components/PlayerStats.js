import React from 'react';

import "./PlayerStats.css";


export default function PlayerStats({ playerName, position, team, predPoints, price }) {
    return (
        <div className="player-stats">
            <p>{playerName} - {position} - {team} - {price.toFixed(1)} - predicted points: {predPoints.toFixed(1)}</p>
        </div>
    )
}