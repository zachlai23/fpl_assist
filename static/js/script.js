// Sample data for players
const playersData = {
    teamA: [
        { name: "Player 1", stats: "Goals: 10, Assists: 5" },
        { name: "Player 2", stats: "Goals: 8, Assists: 3" }
    ],
    teamB: [
        { name: "Player 3", stats: "Goals: 12, Assists: 4" },
        { name: "Player 4", stats: "Goals: 5, Assists: 7" }
    ],
};

// Function to populate players based on selected team
function populatePlayers() {
    const teamSelect = document.getElementById('team-select');
    const playerSelect = document.getElementById('player-select');
    const playerStats = document.getElementById('player-stats');

    const selectedTeam = teamSelect.value;

    // Clear the player dropdown and stats
    playerSelect.innerHTML = '<option value="">--Select a Player--</option>';
    playerStats.innerHTML = '';

    if (selectedTeam) {
        const players = playersData[selectedTeam];

        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.name;
            option.textContent = player.name;
            playerSelect.appendChild(option);
        });

        playerSelect.disabled = false;
    } else {
        playerSelect.disabled = true;
    }
}

// Function to display player stats based on selected player
function displayPlayerStats() {
    const teamSelect = document.getElementById('team-select');
    const playerSelect = document.getElementById('player-select');
    const playerStats = document.getElementById('player-stats');

    const selectedTeam = teamSelect.value;
    const selectedPlayer = playerSelect.value;

    if (selectedPlayer) {
        const player = playersData[selectedTeam].find(p => p.name === selectedPlayer);
        playerStats.innerHTML = `<h3>${player.name}</h3><p>${player.stats}</p>`;
    } else {
        playerStats.innerHTML = '';
    }
}

// Event listeners
document.getElementById('team-select').addEventListener('change', populatePlayers);
document.getElementById('player-select').addEventListener('change', displayPlayerStats);
