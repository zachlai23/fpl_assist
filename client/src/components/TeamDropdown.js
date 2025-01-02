import React from 'react';

import "./TeamDropdown.css"


const TeamDropdown = ({ teams, selectedTeam, handleTeamChange}) => {
    return (
        <div className="team-dropdown">
            <label htmlFor="team-select">Team:</label>
            <select
                id="team-select"
                className="team-select"
                value={selectedTeam}
                onChange={(e) => handleTeamChange(e.target.value)}
            >
                <option value="">--Select a team--</option>
                {teams.map((team, index) => (
                    <option key={index} value={team}>
                        {team}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default TeamDropdown;